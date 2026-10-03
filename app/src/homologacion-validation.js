import { digest, reportBytes } from "./aviso-reports.js";
const plain = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const text = (x) => typeof x === "string" && x.length > 0;
const date = (x) => text(x) && Number.isFinite(Date.parse(x));
const coordinate = (x) => typeof x === "string" && /^[A-Z]+[1-9]\d*$/.test(x);
export async function validateHomologation(
  record,
  { verifyOriginal = false } = {},
) {
  const fail = () => {
    throw Error(
      "Sesión de homologación incompatible: no se ha recuperado ni sustituido nada.",
    );
  };
  if (
    !plain(record) ||
    record.kind !== "homologacion" ||
    record.type !== "piece" ||
    !text(record.id) ||
    !date(record.createdAt) ||
    !date(record.updatedAt) ||
    !plain(record.header) ||
    !Array.isArray(record.history) ||
    !plain(record.approval) ||
    !Array.isArray(record.characteristics)
  )
    fail();
  for (const field of Object.values(record.header))
    if (!plain(field) || typeof field.value !== "string") fail();
  const keys = new Set(),
    samples = new Set();
  for (const c of record.characteristics) {
    if (
      !plain(c) ||
      !text(c.internalKey) ||
      keys.has(c.internalKey) ||
      typeof c.sourceIdentifier !== "string" ||
      !Number.isSafeInteger(c.sourcePosition) ||
      c.sourcePosition < 1 ||
      !coordinate(c.sourceCell) ||
      !text(c.sourceSheet) ||
      !plain(c.source) ||
      !Array.isArray(c.samples)
    )
      fail();
    keys.add(c.internalKey);
    for (const s of c.samples) {
      if (
        !plain(s) ||
        !text(s.id) ||
        samples.has(s.id) ||
        !Number.isSafeInteger(s.position) ||
        s.position < 1 ||
        !coordinate(s.sourceCell) ||
        typeof s.value !== "string" ||
        !plain(s.original) ||
        s.original.sourceCell !== s.sourceCell
      )
        fail();
      samples.add(s.id);
    }
  }
  if (!record.source) {
    if (record.characteristics.length) fail();
    return record;
  }
  const source = record.source;
  if (
    !plain(source) ||
    !text(source.name) ||
    !text(source.data) ||
    !Number.isSafeInteger(source.size) ||
    source.size < 1 ||
    !/^([a-f0-9]{64})$/.test(source.digest) ||
    !/^([a-f0-9]{64})$/.test(source.structuralSignature) ||
    !plain(source.mapping) ||
    !text(source.mapping.sheetName) ||
    !["columns", "rows"].includes(source.mapping.orientation) ||
    !record.characteristics.length ||
    record.characteristics.some(
      (c) => c.sourceSheet !== source.mapping.sheetName,
    )
  )
    fail();
  if (verifyOriginal) {
    if (
      source.data.length % 4 !== 0 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        source.data,
      )
    )
      fail();
    const bytes = reportBytes(source.data);
    if (bytes.length !== source.size || (await digest(bytes)) !== source.digest)
      throw Error(
        "Original de homologación alterado o incompleto: no se ha recuperado nada.",
      );
  }
  return record;
}
