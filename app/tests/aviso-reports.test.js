import "fake-indexeddb/auto";
import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, PDFName } from "pdf-lib";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { JSDOM } from "jsdom";
import {
  AvisoReports,
  generateAvReport,
  reportBytes,
  digest,
} from "../src/aviso-reports.js";
import { AvisosStore } from "../src/avisos-store.js";
import { AvisosModule } from "../src/avisos-ui.js";
import { Vault } from "../src/vault.js";
import { image } from "./report-fixture.js";
const snapshot = () => ({
  kind: "aviso",
  id: "aviso-ensayo",
  type: "provider",
  status: "Borrador",
  code: "=SUM(A1:A2)",
  name: "Pieza ángulo",
  counterparty: "Proveedor ensayo",
  quantity: "12,5",
  problem: "Línea de problema larga. ".repeat(350) + "FINAL PROBLEMA",
  action: "Retener lote",
  createdAt: "2026-10-02T10:00:00.000Z",
  updatedAt: "2026-10-02T11:00:00.000Z",
  _revision: 3,
  photos: Array.from({ length: 6 }, (_, i) => ({
    id: "foto" + i,
    name: "Ensayo " + i,
    data: image,
    thumbnail: "INVALIDA",
    comment: ("Comentario " + i + "\n").repeat(30) + "FINAL FOTO " + i,
  })),
  history: [{ at: "2026-10-02T11:00:00.000Z", summary: "Ensayo guardado" }],
});
const meta = {
  id: "informe-ensayo",
  generatedAt: "2026-10-02T12:00:00.000Z",
  sourceRevision: 3,
};
test("Informes reales: PDF multipágina, Excel literal y Word con seis imágenes originales y textos completos", async () => {
  const s = snapshot();
  const pdf = await PDFDocument.load(await generateAvReport(s, "pdf", meta));
  assert(pdf.getPageCount() > 3);
  let imageCount = 0;
  for (const page of pdf.getPages()) {
    const resources = page.node.Resources(),
      objects = resources?.lookup(PDFName.of("XObject"));
    if (objects) imageCount += objects.keys().length;
  }
  assert.equal(imageCount, 6);
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(await generateAvReport(s, "xlsx", meta));
  assert.equal(book.getWorksheet("Fotografías").getImages().length, 6);
  assert.equal(book.model.media.length, 6);
  const sheet = book.getWorksheet("Aviso");
  let problem = "";
  sheet.eachRow((row) => {
    if (String(row.getCell(1).value).startsWith("Descripción del problema"))
      problem += row.getCell(2).value;
    assert((row.height || 15) <= 409);
  });
  assert.equal(problem, s.problem);
  assert.equal(sheet.getRow(5).getCell(2).value, s.code);
  assert.equal(sheet.getRow(5).getCell(2).type, ExcelJS.ValueType.String);
  let comments = "";
  book.getWorksheet("Fotografías").eachRow((row) => {
    comments += row.getCell(1).value || "";
    assert((row.height || 15) <= 409);
  });
  for (let i = 0; i < 6; i++) assert(comments.includes("FINAL FOTO " + i));
  const zip = await JSZip.loadAsync(await generateAvReport(s, "docx", meta));
  assert.equal(
    Object.keys(zip.files).filter((p) => /^word\/media\/.*\.png$/.test(p))
      .length,
    1,
  ); // Identical originals deduplicated; all six occurrences remain.
  const xml = await zip.file("word/document.xml").async("string");
  assert.equal((xml.match(/<w:drawing>/g) || []).length, 6);
  assert(xml.includes("FINAL PROBLEMA"));
  for (let i = 0; i < 6; i++) assert(xml.includes("FINAL FOTO " + i));
  assert(xml.includes("Pieza ángulo"));
});
test("Informes: instantáneas y archivos inmutables, copia cifrada, versión obsoleta y fallos sin éxito", async () => {
  const vault = new Vault();
  await vault.open();
  await vault.unlock("12345678");
  const store = new AvisosStore(vault),
    reports = new AvisoReports(vault);
  let draft = store.create("internal");
  draft.problem = "Primera versión";
  draft.photos = [
    { id: "original", data: image, name: "Primera", comment: "Conservar" },
  ];
  draft = await store.save(draft);
  const report = await reports.generate(draft, "pdf"),
    hash = await digest(reportBytes(report.data));
  const stale = structuredClone(draft);
  draft.problem = "Cambio posterior";
  draft = await store.save(draft);
  draft = await store.retirePhoto(draft, "original");
  const saved = await vault.get(report.id);
  assert.equal(saved.snapshot.problem, "Primera versión");
  assert.equal(saved.snapshot.photos.length, 1);
  assert(!saved.snapshot.retiredPhotos);
  assert.equal(saved.artifactDigest, hash);
  assert.equal(saved.data, report.data);
  await assert.rejects(() => reports.generate(stale, "pdf"), /cambió/);
  const count = (await reports.list(draft.id)).length;
  await assert.rejects(
    () =>
      new AvisoReports(vault, async () => {
        throw Error("Falló generar");
      }).generate(draft, "pdf"),
    /Falló/,
  );
  assert.equal((await reports.list(draft.id)).length, count);
  const put = vault.put.bind(vault);
  vault.put = async () => {
    throw Error("Falló conservar");
  };
  await assert.rejects(() => reports.generate(draft, "pdf"), /conservar/);
  vault.put = put;
  assert.equal((await reports.list(draft.id)).length, count);
  const backup = await vault.backup();
  assert(!JSON.stringify(backup).includes("Primera versión"));
  const rows = await vault.inspectBackup(backup, "12345678");
  const restored = rows.find((r) => r.id === report.id);
  assert.equal(restored.data, report.data);
  assert.equal(restored.snapshot.photos[0].data, image);
  vault.db.close();
});
test("Informes UI: generación conserva antes de compartir; cancelación permite volver a guardar los mismos bytes", async () => {
  const dom = new JSDOM("<main></main>");
  const root = dom.window.document.querySelector("main"),
    records = new Map();
  const v = {
    list: async () => [...records.values()],
    get: async (id) => structuredClone(records.get(id)),
    put: async (id, r) => {
      r._revision = (r._revision || 0) + 1;
      records.set(id, structuredClone(r));
    },
  };
  const store = new AvisosStore(v),
    reports = new AvisoReports(v, async () => new Uint8Array([1, 2, 3])),
    messages = [],
    downloads = [];
  let cancel = true;
  const ui = new AvisosModule({
    root,
    store,
    reports,
    say: (s) => messages.push(s),
    title: () => {},
    download: async (data, name) => {
      assert.equal((await reports.list(ui.draft.id)).length, 1);
      downloads.push({ data: [...data], name });
      if (cancel) throw Error("Cancelado");
    },
  });
  await ui.newDraft("internal");
  ui.step = 3;
  ui.renderEditor();
  await ui.generateReport("pdf");
  assert.equal(root.querySelectorAll("[data-av-download]").length, 1);
  assert(messages.at(-1).includes("No se ha confirmado"));
  cancel = false;
  await ui.shareReport((await reports.list(ui.draft.id))[0]);
  assert.deepEqual(downloads[0], downloads[1]);
  assert(!messages.some((m) => m.includes("Subido")));
  await ui.prepareLeave();
  dom.window.close();
});
