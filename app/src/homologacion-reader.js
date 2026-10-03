import ExcelJS from "exceljs";
import JSZip from "jszip";
import { digest, reportBase64 } from "./aviso-reports.js";
import { evaluateCharacteristic } from "./homologacion-rules.js";
export const HEADER_FIELDS = [
  ["description", "Descripción"],
  ["customer", "Cliente"],
  ["supplier", "Proveedor"],
  ["performedBy", "Realizado por"],
  ["batch", "Pedido o lote"],
  ["process", "Proceso"],
  ["operation", "Nº operación"],
  ["workstation", "Línea o puesto"],
  ["machine", "Máquina o utillaje"],
  ["dimensionalConditions", "Condiciones dimensionales"],
  ["functionalConditions", "Condiciones funcionales"],
  ["equipmentId", "ID equipo"],
  ["equipment", "Equipo de medida"],
  ["certificate", "Certificado calibración"],
  ["calibrationUntil", "Calibración válida hasta"],
  ["document", "Documento"],
  ["date", "Fecha"],
  ["code", "Código"],
  ["revision", "Revisión"],
  ["observations", "Observaciones"],
];
export const CHARACTER_FIELDS = [
  ["identifier", "Identificador"],
  ["type", "Tipo"],
  ["specification", "Especificación"],
  ["upperTolerance", "Tolerancia superior"],
  ["lowerTolerance", "Tolerancia inferior"],
  ["nominal", "Nominal"],
  ["upperLimit", "Límite superior"],
  ["lowerLimit", "Límite inferior"],
];
export const columnNumber = (text) => {
  let n = 0;
  for (const char of String(text).toUpperCase()) {
    if (!/[A-Z]/.test(char)) throw Error("Columna inválida.");
    n = n * 26 + char.charCodeAt(0) - 64;
  }
  return n;
};
export const columnName = (n) => {
  let text = "";
  while (n > 0) {
    n--;
    text = String.fromCharCode(65 + (n % 26)) + text;
    n = Math.floor(n / 26);
  }
  return text;
};
function xml(text, Parser) {
  const parsed = new Parser().parseFromString(text, "application/xml");
  if (parsed.getElementsByTagName("parsererror").length)
    throw Error("XML del Excel incompatible.");
  return parsed;
}
const tags = (node, name) => [...node.getElementsByTagNameNS("*", name)];
function numericText(raw) {
  if (!/[eE]/.test(raw)) return raw;
  const m = String(raw).match(/^([+-]?)(\d+)(?:\.(\d*))?[eE]([+-]?\d+)$/);
  if (!m) return raw;
  const power = Number(m[4]);
  if (!Number.isInteger(power) || Math.abs(power) > 308) return raw;
  const digits = m[2] + (m[3] || ""),
    point = m[2].length + power;
  return (
    m[1] +
    (point <= 0
      ? "0." + "0".repeat(-point) + digits
      : point >= digits.length
        ? digits + "0".repeat(point - digits.length)
        : digits.slice(0, point) + "." + digits.slice(point))
  );
}
export async function openHomologationExcel(
  bytes,
  name,
  Parser = globalThis.DOMParser,
) {
  if (!Parser) throw Error("Lector XML no disponible.");
  const buffer = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let zip, book;
  try {
    zip = await JSZip.loadAsync(buffer);
    book = new ExcelJS.Workbook();
    await book.xlsx.load(buffer);
  } catch {
    throw Error(
      "Excel ilegible, cifrado o formato no soportado. El original no se ha modificado.",
    );
  }
  const workbookFile = zip.file("xl/workbook.xml"),
    relsFile = zip.file("xl/_rels/workbook.xml.rels");
  if (!workbookFile || !relsFile)
    throw Error("No es un libro XLSX compatible.");
  const workbook = xml(await workbookFile.async("string"), Parser),
    rels = xml(await relsFile.async("string"), Parser);
  const relations = new Map(
    tags(rels, "Relationship")
      .filter((x) => x.getAttribute("TargetMode") !== "External")
      .map((x) => [x.getAttribute("Id"), x.getAttribute("Target")]),
  );
  let strings = [];
  if (zip.file("xl/sharedStrings.xml"))
    strings = tags(
      xml(await zip.file("xl/sharedStrings.xml").async("string"), Parser),
      "si",
    ).map((si) =>
      tags(si, "t")
        .map((t) => t.textContent)
        .join(""),
    );
  const sheets = [];
  for (const node of tags(workbook, "sheet")) {
    const name = node.getAttribute("name"),
      id = node.getAttribute("r:id"),
      target = relations.get(id);
    if (!target) continue;
    const path = target.startsWith("/")
      ? target.slice(1)
      : "xl/" + target.replace(/^\.\//, "");
    const file = zip.file(path);
    if (!file) continue;
    const ws = book.getWorksheet(name),
      cells = {},
      sheet = xml(await file.async("string"), Parser);
    for (const cell of tags(sheet, "c")) {
      const address = cell.getAttribute("r"),
        type = cell.getAttribute("t") || "n",
        v = tags(cell, "v")[0]?.textContent ?? "",
        f = tags(cell, "f")[0];
      let raw =
        type === "s"
          ? (strings[Number(v)] ?? "")
          : type === "inlineStr"
            ? tags(cell, "t")
                .map((x) => x.textContent)
                .join("")
            : v;
      const format = ws?.getCell(address).numFmt || "",
        formula = ws?.getCell(address).formula || f?.textContent || null;
      let display = raw;
      const fixed = format.match(/^(0+)(?:\.(0+))?$/);
      const literal = numericText(raw).match(/^([+-]?)(\d+)(?:\.(\d+))?$/);
      if (type === "n" && !formula && fixed && literal) {
        const places = fixed[2]?.length || 0;
        // Solo añade ceros de formato: nunca redondea el valor fuente.
        if ((literal[3]?.length || 0) <= places)
          display =
            literal[1] +
            literal[2].padStart(fixed[1].length, "0") +
            (places ? "." + (literal[3] || "").padEnd(places, "0") : "");
      }
      const excelValue = ws?.getCell(address).value;
      if (excelValue instanceof Date && Number.isFinite(excelValue.getTime()))
        display = excelValue.toISOString().slice(0, 10);
      if (type === "b") display = raw === "1" ? "TRUE" : "FALSE";
      cells[address] = {
        sourceCell: address,
        rawValue: raw,
        displayValue: display,
        cellType: type,
        format,
        formula,
        cachedValue: formula ? v : null,
        numericText: type === "n" ? numericText(raw) : raw,
        error: type === "e",
      };
    }
    sheets.push({
      name,
      cells,
      rowCount: ws?.rowCount || 0,
      columnCount: ws?.columnCount || 0,
    });
  }
  if (!sheets.length) throw Error("No hay hojas legibles.");
  return {
    name,
    size: buffer.length,
    digest: await digest(buffer),
    data: reportBase64(buffer),
    sheets,
  };
}
const cell = (sheet, address) =>
  sheet.cells[address] || {
    sourceCell: address,
    rawValue: "",
    displayValue: "",
    cellType: "empty",
    format: "",
    formula: null,
    cachedValue: null,
    numericText: "",
    error: false,
  };
export function suggestHomologationMapping(sheet) {
  for (let row = 1; row <= sheet.rowCount; row++) {
    if (
      cell(sheet, "A" + row).displayValue !== "No" ||
      !/Dim.*Attr.*%/i.test(cell(sheet, "A" + (row + 1)).displayValue)
    )
      continue;
    // Perfil propuesto por etiquetas verificables, no por nombre de archivo.
    const bindings = {
      identifier: row,
      type: row + 1,
      specification: row + 2,
      upperTolerance: row + 3,
      lowerTolerance: row + 4,
      nominal: row + 5,
      upperLimit: row + 6,
      lowerLimit: row + 7,
    };
    const cols = [];
    for (let col = 2; col <= sheet.columnCount; col++) {
      const id = cell(sheet, columnName(col) + row).displayValue;
      const business = [row + 1, row + 2, row + 5].some((r) => {
        const source = cell(sheet, columnName(col) + r);
        return source.displayValue && !source.formula;
      });
      if ((id && id !== "No") || (!id && business)) cols.push(columnName(col));
    }
    if (!cols.length) continue;
    let start = 0,
      end = 0;
    for (let r = row + 8; r <= sheet.rowCount; r++) {
      if (/^1$/.test(cell(sheet, "A" + r).displayValue)) {
        start = r;
        break;
      }
    }
    if (start) {
      let expected = 1;
      for (let r = start; r <= sheet.rowCount; r++) {
        if (cell(sheet, "A" + r).displayValue !== String(expected)) break;
        end = r;
        expected++;
      }
    }
    return {
      version: "qcs-mapping-1",
      sheetName: sheet.name,
      orientation: "columns",
      characterRanges: cols.join(","),
      sampleRange: start ? `${start}:${end}` : "",
      bindings,
      percentEncoding: "fraction",
      explicitLimits: false,
      header: Object.fromEntries(
        [
          ["document", "M1", "No Document:", "O1"],
          ["date", "M2", "Date:", "O2"],
          ["code", "M3", "Product Code:", "O3"],
          ["revision", "M4", "Drawing Rev.:", "O4"],
          ["description", "A5", "Description:", "C5"],
          ["customer", "H5", "Customer:", "J5"],
          ["supplier", "H6", "Supplier:", "J6"],
          ["performedBy", "M5", "Performed by:", "O5"],
          ["batch", "M6", "PO / Batch:", "O6"],
          ["process", "A8", "Process:", "C8"],
          ["operation", "A9", "Operation No.:", "C9"],
          ["workstation", "A10", "Line / Workstation:", "C10"],
          ["machine", "A11", "Machine / Tool ID:", "C11"],
          [
            "dimensionalConditions",
            "F8",
            "Measurement Conditions (Dimensional)",
            "F9",
          ],
          [
            "functionalConditions",
            "F10",
            "Test Conditions (Functional)",
            "F11",
          ],
          ["equipmentId", "M8", "Equipment ID:", "O8"],
          ["equipment", "M9", "Measuring Equipment:", "O9"],
          ["certificate", "M10", "Calibration Certificated No:", "O10"],
          ["calibrationUntil", "M11", "Calibration Valid Until:", "O11"],
        ]
          .filter(
            ([, labelCell, label]) =>
              cell(sheet, labelCell).displayValue === label,
          )
          .map(([field, , , address]) => [field, address]),
      ),
    };
  }
  return {
    version: "qcs-mapping-1",
    sheetName: sheet.name,
    orientation: "rows",
    characterRanges: "",
    sampleRange: "",
    bindings: {},
    header: {},
    percentEncoding: null,
    explicitLimits: false,
  };
}
export function mappingRange(raw, columns, max) {
  const result = [];
  for (const part of String(raw || "")
    .split(",")
    .filter((x) => x.trim())) {
    const values = part.trim().split(":");
    if (values.length > 2) throw Error("Rango inválido.");
    const parse = (s) =>
      columns ? columnNumber(s) : /^\d+$/.test(s) ? Number(s) : NaN;
    const a = parse(values[0]),
      b = parse(values[1] || values[0]);
    if (
      !Number.isInteger(a) ||
      !Number.isInteger(b) ||
      a < 1 ||
      b < a ||
      b > max
    )
      throw Error("Rango fuera de la hoja o inválido.");
    for (let n = a; n <= b; n++) if (!result.includes(n)) result.push(n);
  }
  return result;
}
export async function previewHomologation(workbook, mapping) {
  const sheet = workbook.sheets.find((s) => s.name === mapping.sheetName);
  if (!sheet) throw Error("Selecciona una hoja.");
  const columns = mapping.orientation === "columns";
  const positions = mappingRange(
      mapping.characterRanges,
      columns,
      columns ? sheet.columnCount : sheet.rowCount,
    ),
    slots = mappingRange(
      mapping.sampleRange,
      !columns,
      columns ? sheet.rowCount : sheet.columnCount,
    );
  if (!positions.length)
    throw Error("Selecciona las posiciones de características para revisar.");
  const characteristics = [],
    warnings = [];
  for (const position of positions) {
    const sources = {};
    for (const [field] of CHARACTER_FIELDS) {
      const binding = mapping.bindings[field];
      let axis = columns
        ? Number(binding)
        : binding
          ? columnNumber(binding)
          : 0;
      const address =
        axis > 0
          ? columns
            ? columnName(position) + axis
            : columnName(axis) + position
          : "";
      sources[field] = cell(sheet, address);
    }
    const identifier = sources.identifier.displayValue;
    if (
      ![sources.identifier, sources.type, sources.specification].some(
        (s) => s.displayValue && !s.formula,
      ) &&
      !(!sources.nominal.formula && sources.nominal.rawValue)
    )
      continue;
    const rawType = sources.type.displayValue;
    const type =
      rawType === "Dim."
        ? "dimensional"
        : rawType === "%"
          ? "percent"
          : ["Attribute", "Atributo"].includes(rawType)
            ? "attribute"
            : "unknown";
    const value = (s) => (s.error ? "" : s.numericText);
    const samples = slots.map((slot, index) => {
      const address = columns
          ? columnName(position) + slot
          : columnName(slot) + position,
        source = cell(sheet, address);
      return {
        id: crypto.randomUUID(),
        position: index + 1,
        sourceCell: address,
        value: source.error ? source.rawValue : value(source),
        original: source,
        author: null,
        recordedAt: null,
      };
    });
    const c = {
      internalKey: crypto.randomUUID(),
      sourceIdentifier: identifier,
      sourcePosition: position,
      sourceCell: sources.identifier.sourceCell,
      sourceSheet: sheet.name,
      source: sources,
      specification: sources.specification.displayValue,
      type,
      originalType: rawType,
      nominal: value(sources.nominal),
      upperTolerance: value(sources.upperTolerance),
      lowerTolerance: value(sources.lowerTolerance),
      upperLimit: value(sources.upperLimit),
      lowerLimit: value(sources.lowerLimit),
      explicitLimits:
        !!mapping.explicitLimits &&
        !sources.upperLimit.formula &&
        !sources.lowerLimit.formula,
      percentEncoding: mapping.percentEncoding,
      attributeMap: { OK: "conforming", NOK: "nonconforming" },
      unit: null,
      nRequired: null,
      specRevision: 1,
      samples,
    };
    const own = [];
    const warn = (code, message) => {
      const item = {
        code,
        message,
        internalKey: c.internalKey,
        sourceCell: c.sourceCell,
      };
      own.push(item);
      warnings.push(item);
    };
    if (!identifier)
      warn(
        "A5",
        "Identificador vacío: se conserva la posición, sin inventar numeración.",
      );
    if (type === "unknown") warn("A10", "Tipo desconocido; requiere revisión.");
    if (type === "percent" && !mapping.percentEncoding)
      warn("Escala", "Escala de porcentaje sin configurar.");
    if (c.lowerTolerance && Number(c.lowerTolerance) > 0)
      warn("A1", "Tolerancia inferior positiva: revisar, sin cambiar signo.");
    if (
      ["dimensional", "percent"].includes(type) &&
      (!c.lowerTolerance || !c.upperTolerance)
    )
      warn("A3", "Tolerancia vacía: no se convierte en cero.");
    for (const [field, source] of Object.entries(sources)) {
      if (source.error)
        warn(
          "A12",
          `Error de Excel en ${source.sourceCell}; revisar dependencia.`,
        );
      if (
        source.cellType === "n" &&
        source.rawValue.replace(/[^0-9]/g, "").length >= 17
      )
        warn(
          "A6",
          `Posible precisión/ruido en ${source.sourceCell}; valor literal conservado.`,
        );
    }
    if (
      samples.some(
        (s) =>
          s.value &&
          evaluateCharacteristic({ ...c, samples: [s] }).counts.invalid,
      )
    )
      warn("A8", "Alguna medición no es numérica.");
    if (
      type === "attribute" &&
      samples.some((s) => s.value && !Object.hasOwn(c.attributeMap, s.value))
    )
      warn("A2", "Atributo sin mapeo: no se infiere OK.");
    c.warnings = own;
    characteristics.push(c);
  }
  if (!characteristics.length)
    throw Error("No se detectan características en el mapeo.");
  const seen = new Map();
  for (const c of characteristics) {
    if (c.sourceIdentifier) {
      const list = seen.get(c.sourceIdentifier) || [];
      list.push(c);
      seen.set(c.sourceIdentifier, list);
    }
  }
  for (const list of seen.values())
    if (list.length > 1)
      for (const c of list) {
        const w = {
          code: "A4",
          message:
            "Identificador duplicado: las características permanecen separadas.",
          internalKey: c.internalKey,
          sourceCell: c.sourceCell,
        };
        warnings.push(w);
        c.warnings.push(w);
      }
  const header = {};
  for (const [field] of HEADER_FIELDS) {
    const binding = mapping.header[field];
    if (binding && !/^[A-Z]+[1-9]\d*$/i.test(binding))
      throw Error("Celda de cabecera inválida: " + binding);
    header[field] = {
      value: binding ? cell(sheet, binding.toUpperCase()).displayValue : "",
      source: binding ? cell(sheet, binding.toUpperCase()) : null,
    };
  }
  const signature = await digest(
    new TextEncoder().encode(
      JSON.stringify({
        sheet: sheet.name,
        orientation: mapping.orientation,
        positions,
        slots,
        bindings: mapping.bindings,
        header: mapping.header,
        percentEncoding: mapping.percentEncoding,
        explicitLimits: !!mapping.explicitLimits,
        identifiers: characteristics.map((c) => [
          c.sourceCell,
          c.sourceIdentifier,
          c.originalType,
        ]),
      }),
    ),
  );
  return {
    original: {
      name: workbook.name,
      size: workbook.size,
      digest: workbook.digest,
      data: workbook.data,
    },
    mapping: structuredClone(mapping),
    structuralSignature: signature,
    header,
    characteristics,
    warnings,
    readerVersion: "qcs-xlsx-1",
  };
}
