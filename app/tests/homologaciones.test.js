import "fake-indexeddb/auto";
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import ExcelJS from "exceljs";
import {
  openHomologationExcel,
  suggestHomologationMapping,
  previewHomologation,
} from "../src/homologacion-reader.js";
import {
  evaluateCharacteristic,
  evaluateSample,
  limits,
} from "../src/homologacion-rules.js";
import { HomologacionStore } from "../src/homologacion-store.js";
import { Vault } from "../src/vault.js";
const spec = {
  type: "dimensional",
  nominal: "10",
  lowerTolerance: "-0.1",
  upperTolerance: "0.1",
  nRequired: null,
};
async function fixture(value = "10.1") {
  const book = new ExcelJS.Workbook(),
    ws = book.addWorksheet("Variable");
  ws.getCell("A4").value = "No";
  ws.getCell("A5").value = "Dim. / Attr. / %";
  for (const [col, id] of [
    ["B", "01"],
    ["C", "1.0"],
    ["D", "01"],
    ["E", ""],
  ]) {
    ws.getCell(col + "4").value = id;
    ws.getCell(col + "5").value = "Dim.";
    ws.getCell(col + "6").value = "Dimensión";
    ws.getCell(col + "7").value = "0.1";
    ws.getCell(col + "8").value = "-0.1";
    ws.getCell(col + "9").value = "10";
    ws.getCell(col + "10").value = { formula: `${col}9+${col}7`, result: 10.1 };
    ws.getCell(col + "11").value = { formula: `${col}9+${col}8`, result: 9.9 };
  }
  ws.getCell("A14").value = 1;
  ws.getCell("A15").value = 2;
  ws.getCell("B14").value = value;
  ws.getCell("B15").value = "10.1001";
  const bytes = new Uint8Array(await book.xlsx.writeBuffer());
  const parser = new JSDOM("").window.DOMParser;
  const w = await openHomologationExcel(bytes, "Synthetic.xlsx", parser);
  return {
    bytes,
    w,
    p: await previewHomologation(w, suggestHomologationMapping(w.sheets[0])),
  };
}
test("Homologaciones: extremos exactos, tolerancias vacías y válidas distintas de conformes", () => {
  assert.equal(evaluateSample(spec, "9,9").status, "conforming");
  assert.equal(evaluateSample(spec, "10.1").status, "conforming");
  assert.equal(
    evaluateSample(spec, "10.10000000000000001").status,
    "nonconforming",
  );
  assert.equal(limits({ ...spec, lowerTolerance: "" }).valid, false);
  assert.equal(
    evaluateSample({ ...spec, lowerTolerance: "1" }, "10").status,
    "notEvaluable",
  );
  const c = evaluateCharacteristic({
    ...spec,
    samples: [
      { value: "10.1" },
      { value: "10.2" },
      { value: "NaN" },
      { value: "" },
    ],
  });
  assert.equal(c.nValid, 2);
  assert.equal(c.conformity, "No conforme");
  assert.equal(c.completeness, "Sin definir");
  assert.equal(c.nRequired, null);
  const unknown = evaluateCharacteristic({
    ...spec,
    lowerTolerance: "",
    samples: [{ value: "10" }],
  });
  assert.equal(unknown.nValid, 1);
  assert.equal(unknown.conformity, "No evaluable");
  assert.equal(
    evaluateSample(
      {
        type: "percent",
        nominal: "100",
        lowerTolerance: "-5",
        upperTolerance: "5",
        percentEncoding: "percent",
      },
      "105",
    ).status,
    "conforming",
  );
  assert.equal(
    evaluateSample(
      {
        type: "percent",
        nominal: "100",
        lowerTolerance: "-0.05",
        upperTolerance: "0.05",
        percentEncoding: "fraction",
      },
      "95",
    ).status,
    "conforming",
  );
  assert.equal(
    evaluateSample(
      { type: "attribute", attributeMap: { OK: "conforming" } },
      "Pass",
    ).status,
    "notEvaluable",
  );
});
test("Homologaciones: Excel variable, IDs literales y duplicados, vacío conservado y original intacto", async () => {
  const { bytes, w, p } = await fixture();
  assert.equal(p.characteristics.length, 4);
  assert.deepEqual(
    p.characteristics.map((c) => c.sourceIdentifier),
    ["01", "1.0", "01", ""],
  );
  assert.equal(new Set(p.characteristics.map((c) => c.internalKey)).size, 4);
  assert.equal(p.warnings.filter((w) => w.code === "A4").length, 2);
  assert.equal(p.warnings.filter((w) => w.code === "A5").length, 1);
  assert.deepEqual(
    p.characteristics[0].samples.map((s) => s.sourceCell),
    ["B14", "B15"],
  );
  assert.equal(p.characteristics[0].source.upperLimit.formula, "B9+B7");
  assert.deepEqual(Buffer.from(p.original.data, "base64"), Buffer.from(bytes));
  const changed = await fixture("9.9");
  assert.notEqual(changed.w.digest, w.digest);
  assert.equal(changed.p.structuralSignature, p.structuralSignature);
});
test("Homologaciones: corrección conserva posición, histórico, original y copia cifrada; conflicto no sobrescribe", async () => {
  const { p } = await fixture(),
    vault = new Vault();
  await vault.open();
  await vault.unlock("12345678");
  const store = new HomologacionStore(vault);
  let d = await store.save(store.create());
  d = await store.confirmImport(d, p);
  const stale = structuredClone(d),
    id = d.characteristics[0].samples[0].id;
  d.characteristics[0].samples[0].value = "9.9";
  d = await store.save(d, "Corrección");
  const saved = await store.get(d.id);
  assert.equal(saved.characteristics[0].samples[0].id, id);
  assert.equal(saved.characteristics[0].samples[0].sourceCell, "B14");
  assert.equal(saved.characteristics[0].samples[0].original.rawValue, "10.1");
  assert.deepEqual(saved.history.at(-1).changes[0], {
    internalKey: d.characteristics[0].internalKey,
    sampleId: id,
    sourceCell: "B14",
    before: "10.1",
    after: "9.9",
  });
  await assert.rejects(() => store.save(stale), /cambió/);
  await assert.rejects(
    () => store.confirmImport(saved, p),
    /ya está vinculado/,
  );
  const backup = await vault.backup(),
    rows = await vault.inspectBackup(backup, "12345678");
  const restored = rows.find((r) => r.id === d.id);
  assert.equal(restored.source.data, p.original.data);
  assert.equal(restored.characteristics[0].samples[0].value, "9.9");
  vault.db.close();
});

test("Homologaciones UI: últimas ediciones durante guardado, fallo bloquea salida y sesión reabre", async () => {
  const { HomologacionModule } = await import("../src/homologacion-ui.js");
  const dom = new JSDOM("<main></main>"),
    root = dom.window.document.querySelector("main"),
    rows = new Map();
  let paused = false,
    resume = null,
    fail = false;
  const vault = {
    list: async () => [...rows.values()].map((x) => structuredClone(x)),
    get: async (id) => structuredClone(rows.get(id)),
    put: async (id, d) => {
      if (fail) throw Error("Fallo de guardado");
      if (paused) {
        paused = false;
        await new Promise((r) => (resume = r));
      }
      rows.set(id, structuredClone(d));
    },
  };
  const ui = new HomologacionModule({
    root,
    store: new HomologacionStore(vault),
    say: () => {},
    title: () => {},
    download: () => {},
  });
  await ui.newDraft();
  const field = () => root.querySelector('[data-hm-header="code"]');
  field().value = "Primero";
  field().dispatchEvent(new dom.window.Event("input"));
  paused = true;
  const saving = ui.perform(() => ui.saveDraft());
  await new Promise((r) => setTimeout(r, 0));
  field().value = "Último";
  field().dispatchEvent(new dom.window.Event("input"));
  resume();
  await saving;
  await ui.prepareLeave();
  assert.equal(rows.get(ui.draft.id).header.code.value, "Último");
  field().value = "Pendiente";
  field().dispatchEvent(new dom.window.Event("input"));
  fail = true;
  await assert.rejects(() => ui.prepareLeave(), /Fallo/);
  assert.equal(ui.view, "editor");
  assert(ui.dirty);
  fail = false;
  await ui.prepareLeave();
  const id = ui.draft.id;
  await ui.goBack();
  await ui.openDraft(id);
  assert.equal(field().value, "Pendiente");
  await ui.prepareLeave();
  dom.window.close();
});

test("Homologaciones: formato literal numérico y fecha se muestran sin cambiar valor XML", async () => {
  const book = new ExcelJS.Workbook(),
    ws = book.addWorksheet("Formatos");
  ws.getCell("B1").value = 1;
  ws.getCell("B1").numFmt = "00";
  ws.getCell("C1").value = 1;
  ws.getCell("C1").numFmt = "0.0";
  ws.getCell("D1").value = 1.125;
  ws.getCell("D1").numFmt = "0.00";
  ws.getCell("E1").value = new Date("2026-10-03T00:00:00Z");
  ws.getCell("E1").numFmt = "dd/mm/yyyy";
  const w = await openHomologationExcel(
    new Uint8Array(await book.xlsx.writeBuffer()),
    "Synthetic.xlsx",
    new JSDOM("").window.DOMParser,
  );
  assert.equal(w.sheets[0].cells.B1.displayValue, "01");
  assert.equal(w.sheets[0].cells.B1.numericText, "1");
  assert.equal(w.sheets[0].cells.C1.displayValue, "1.0");
  assert.equal(w.sheets[0].cells.D1.displayValue, "1.125");
  assert.equal(w.sheets[0].cells.E1.displayValue, "2026-10-03");
  assert.match(w.sheets[0].cells.E1.rawValue, /^\d/);
});

test("Homologaciones: cabecera propone casillas de datos solo con etiquetas reconocidas", async () => {
  const { w } = await fixture();
  const s = w.sheets[0];
  assert.deepEqual(suggestHomologationMapping(s).header, {});
  s.cells.F8 = { displayValue: "Measurement Conditions (Dimensional)" };
  s.cells.F10 = { displayValue: "Test Conditions (Functional)" };
  s.cells.M3 = { displayValue: "Product Code:" };
  s.columnCount = 15;
  s.cells.F9 = {
    rawValue: "20 ºC",
    numericText: "20 ºC",
    displayValue: "20 ºC",
    sourceCell: "F9",
  };
  s.cells.F11 = {
    rawValue: "Ensayo local",
    numericText: "Ensayo local",
    displayValue: "Ensayo local",
    sourceCell: "F11",
  };
  const m = suggestHomologationMapping(s);
  assert.equal(m.header.dimensionalConditions, "F9");
  assert.equal(m.header.functionalConditions, "F11");
  assert.equal(m.header.code, "O3");
  const p = await previewHomologation(w, m);
  assert.equal(p.header.dimensionalConditions.value, "20 ºC");
  assert.equal(p.header.functionalConditions.value, "Ensayo local");
  const other = await previewHomologation(w, { ...m, explicitLimits: true });
  assert.notEqual(p.structuralSignature, other.structuralSignature);
});

test("Homologaciones: mapeo manual por filas conserva orden, duplicados y columnas de muestras", async () => {
  const book = new ExcelJS.Workbook(),
    ws = book.addWorksheet("Filas");
  for (const r of [3, 7]) {
    ws.getCell("B" + r).value = "1.0";
    ws.getCell("C" + r).value = "%";
    ws.getCell("D" + r).value = "Resistencia";
    ws.getCell("E" + r).value = "5";
    ws.getCell("F" + r).value = "-5";
    ws.getCell("G" + r).value = "100";
  }
  ws.getCell("K7").value = "95";
  ws.getCell("L7").value = "105";
  ws.getCell("K3").value = "94.9";
  const w = await openHomologationExcel(
    new Uint8Array(await book.xlsx.writeBuffer()),
    "Rows.xlsx",
    new JSDOM("").window.DOMParser,
  );
  const mapping = {
    sheetName: "Filas",
    orientation: "rows",
    characterRanges: "7,3",
    sampleRange: "K:L",
    bindings: {
      identifier: "B",
      type: "C",
      specification: "D",
      upperTolerance: "E",
      lowerTolerance: "F",
      nominal: "G",
    },
    header: {},
    percentEncoding: "percent",
    explicitLimits: false,
  };
  const p = await previewHomologation(w, mapping);
  assert.deepEqual(
    p.characteristics.map((c) => c.sourceCell),
    ["B7", "B3"],
  );
  assert.deepEqual(
    p.characteristics[0].samples.map((s) => s.sourceCell),
    ["K7", "L7"],
  );
  assert.equal(
    evaluateCharacteristic(p.characteristics[0]).conformity,
    "Conforme",
  );
  assert.equal(
    evaluateCharacteristic(p.characteristics[1]).conformity,
    "No conforme",
  );
  assert.equal(p.warnings.filter((w) => w.code === "A4").length, 2);
  await assert.rejects(
    () => previewHomologation(w, { ...mapping, sampleRange: "K:AA" }),
    /fuera/,
  );
});

test("Homologaciones: mapeo inválido se rechaza antes de crear vista previa", async () => {
  const { w } = await fixture(),
    m = suggestHomologationMapping(w.sheets[0]);
  for (const row of ["1.5", "0", "-1", "texto", "99999"])
    await assert.rejects(
      () =>
        previewHomologation(w, {
          ...m,
          bindings: { ...m.bindings, nominal: row },
        }),
      /Mapeo de Nominal/,
    );
  await assert.rejects(
    () => previewHomologation(w, { ...m, header: { code: "ZZ999" } }),
    /Cabecera Código/,
  );
  await assert.rejects(
    () => previewHomologation(w, { ...m, orientation: "diagonal" }),
    /Orientación/,
  );
  await assert.rejects(
    () => previewHomologation(w, { ...m, percentEncoding: "guess" }),
    /Escala/,
  );
  const p = await previewHomologation(w, {
    ...m,
    bindings: { ...m.bindings, identifier: "" },
  });
  assert.equal(p.characteristics[0].sourceIdentifier, "");
  assert.equal(p.characteristics[0].sourceCell, "B5");
});

test("Homologaciones: copia validada conserva original, detecta bytes alterados y claves duplicadas", async () => {
  const { validateHomologation } = await import(
    "../src/homologacion-validation.js"
  );
  const { p } = await fixture(),
    rows = new Map(),
    vault = {
      get: async (id) => structuredClone(rows.get(id)),
      put: async (id, d) => rows.set(id, structuredClone(d)),
    };
  const store = new HomologacionStore(vault);
  let d = await store.confirmImport(store.create(), p);
  await validateHomologation(d, { verifyOriginal: true });
  const bad = structuredClone(d);
  bad.source.data = Buffer.from("No es el original").toString("base64");
  await assert.rejects(
    () => validateHomologation(bad, { verifyOriginal: true }),
    /alterado/,
  );
  const duplicate = structuredClone(d);
  duplicate.characteristics[1].internalKey =
    duplicate.characteristics[0].internalKey;
  await assert.rejects(() => validateHomologation(duplicate), /incompatible/);
  await assert.rejects(() => store.save(bad), /original y su mapeo/);
  const remapped = structuredClone(d);
  remapped.source.mapping.sampleRange = "14:14";
  await assert.rejects(() => store.save(remapped), /original y su mapeo/);
  assert.equal(rows.get(d.id).source.data, p.original.data);
  const draft = store.create();
  await validateHomologation(draft, { verifyOriginal: true });
});
