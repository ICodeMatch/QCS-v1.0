import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import ExcelJS from "exceljs";
import {
  Document,
  Paragraph,
  TextRun,
  ImageRun,
  Packer,
  HeadingLevel,
} from "docx";
import { AVISO_TYPES } from "./avisos-store.js";
export const REPORT_FORMATS = {
  pdf: { ext: "pdf", mime: "application/pdf" },
  xlsx: {
    ext: "xlsx",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  docx: {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
};
export const reportBytes = (data) =>
  Uint8Array.from(atob(data.includes(",") ? data.split(",")[1] : data), (c) =>
    c.charCodeAt(0),
  );
export function reportBase64(bytes) {
  let text = "";
  for (let i = 0; i < bytes.length; i += 8192)
    text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(text);
}
export async function digest(bytes) {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export function reportFields(s, meta) {
  return [
    ["Tipo", AVISO_TYPES.find((x) => x[0] === s.type)?.[1] || s.type],
    ["Estado", s.status || "Borrador"],
    ["Referencia local", s.id],
    ["Código material", s.code],
    ["Denominación", s.name],
    ...(s.type !== "internal"
      ? [[s.type === "provider" ? "Proveedor" : "Cliente", s.counterparty]]
      : []),
    ["Cantidad afectada", s.quantity],
    ["Descripción del problema", s.problem],
    ["Acción inmediata", s.action],
    ["Creado", s.createdAt],
    ["Última modificación", s.updatedAt],
    ["Informe generado", meta.generatedAt],
    ["Versión del aviso", String(meta.sourceRevision)],
    ["Referencia del informe", meta.id],
    [
      "Conservación",
      "Instantánea local. No acredita registro SAP ni subida a SharePoint.",
    ],
  ];
}
async function reportImages(snapshot) {
  const pdf = await PDFDocument.create(),
    out = [];
  for (const photo of snapshot.photos || []) {
    let data = photo.data;
    // Representación a tamaño completo: respeta la orientación que decodifica el navegador.
    // El archivo recibido se conserva intacto en la instantánea y en el aviso.
    if (typeof Image !== "undefined" && typeof document !== "undefined") {
      const image = new Image();
      image.src = data;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      if (!canvas.width || !canvas.height)
        throw Error("Fotografía sin dimensiones válidas.");
      canvas.getContext("2d").drawImage(image, 0, 0);
      data = canvas.toDataURL("image/png");
      canvas.width = canvas.height = 0;
    }
    const type = data.startsWith("data:image/png;")
      ? "png"
      : /^data:image\/(jpeg|jpg);/.test(data)
        ? "jpeg"
        : null;
    if (!type)
      throw Error(
        "No se pudo preparar una fotografía para el informe. El original se conserva.",
      );
    const bytes = reportBytes(data),
      image =
        type === "png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    out.push({
      photo,
      data,
      bytes,
      type,
      width: image.width,
      height: image.height,
    });
  }
  return out;
}
function fit(image, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  return { width: image.width * scale, height: image.height * scale };
}
async function pdfReport(snapshot, meta, images) {
  const pdf = await PDFDocument.create();
  pdf.setTitle("QCS · Informe de aviso");
  pdf.setAuthor("Quality Control Suite");
  pdf.setCreationDate(new Date(meta.generatedAt));
  const regular = await pdf.embedFont(StandardFonts.Helvetica),
    bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page, y;
  const newPage = () => {
    page = pdf.addPage([595.28, 841.89]);
    y = 786;
    page.drawRectangle({
      x: 0,
      y: 810,
      width: 595.28,
      height: 32,
      color: rgb(0.06, 0.21, 0.33),
    });
    page.drawText("QUALITY CONTROL SUITE", {
      x: 40,
      y: 820,
      size: 12,
      font: bold,
      color: rgb(1, 1, 1),
    });
  };
  newPage();
  const text = (
    value,
    { font = regular, size = 11, color = rgb(0.06, 0.13, 0.2) } = {},
  ) => {
    for (const paragraph of String(value || "Sin indicar")
      .replace(/\r\n?/g, "\n")
      .split("\n")) {
      let line = "";
      for (const char of paragraph) {
        const next = line + char;
        let width;
        try {
          width = font.widthOfTextAtSize(next, size);
        } catch {
          throw Error(
            "El PDF no admite algún carácter de este texto. No se ha perdido el borrador; utiliza Word o Excel.",
          );
        }
        if (width > 515 && line) {
          if (y < 58) newPage();
          page.drawText(line, { x: 40, y, size, font, color });
          y -= size + 5;
          line = char;
        } else line = next;
      }
      if (y < 58) newPage();
      if (line) page.drawText(line, { x: 40, y, size, font, color });
      y -= size + 5;
    }
  };
  text("Informe de aviso · BORRADOR", { font: bold, size: 19 });
  y -= 7;
  for (const [label, value] of reportFields(snapshot, meta)) {
    text(label, { font: bold, size: 10, color: rgb(0, 0.45, 0.49) });
    text(value);
    y -= 6;
  }
  for (const [index, image] of images.entries()) {
    if (y - fit(image, 515, 350).height < 95) newPage();
    text(`Fotografía ${index + 1}: ${image.photo.name || "Evidencia"}`, {
      font: bold,
      size: 12,
    });
    const embedded =
        image.type === "png"
          ? await pdf.embedPng(image.bytes)
          : await pdf.embedJpg(image.bytes),
      size = fit(image, 515, 350);
    if (y - size.height < 60) newPage();
    page.drawImage(embedded, { x: 40, y: y - size.height, ...size });
    y -= size.height + 18;
    text(image.photo.comment || "Sin comentario");
    y -= 10;
  }
  if (snapshot.history?.length) {
    text("Historial del aviso", { font: bold, size: 13 });
    for (const h of snapshot.history) text(`${h.at} · ${h.summary}`);
  }
  pdf
    .getPages()
    .forEach((p, i) =>
      p.drawText(`${i + 1} / ${pdf.getPageCount()}`, {
        x: 510,
        y: 28,
        size: 9,
        font: regular,
      }),
    );
  return pdf.save();
}
function chunks(value, max = 700) {
  const text = String(value || "Sin indicar");
  const result = [];
  let part = "";
  for (const char of text) {
    if (
      part.length >= max ||
      (char === "\n" && part.split("\n").length >= 12)
    ) {
      result.push(part);
      part = "";
    }
    part += char;
  }
  if (part) result.push(part);
  return result;
}
function rowHeight(text, width) {
  return Math.max(
    30,
    String(text)
      .split("\n")
      .reduce((n, line) => n + Math.max(1, Math.ceil(line.length / width)), 0) *
      18,
  );
}
async function excelReport(snapshot, meta, images) {
  const book = new ExcelJS.Workbook();
  book.creator = "Quality Control Suite";
  book.created = new Date(meta.generatedAt);
  const sheet = book.addWorksheet("Aviso");
  sheet.columns = [{ width: 29 }, { width: 85 }];
  sheet.addRow(["QCS · INFORME DE AVISO", "BORRADOR"]);
  for (const [label, value] of reportFields(snapshot, meta)) {
    for (const [i, part] of chunks(value, 700).entries()) {
      const row = sheet.addRow([i ? label + " (continuación)" : label, part]);
      row.alignment = { vertical: "top", wrapText: true };
      row.getCell(1).font = { bold: true, color: { argb: "FF008C96" } };
      row.height = rowHeight(part, 70);
    }
  }
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" }, size: 15 };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF103754" },
  };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  const photos = book.addWorksheet("Fotografías");
  photos.columns = [{ width: 65 }, { width: 65 }];
  let row = 1;
  for (const [index, image] of images.entries()) {
    photos.mergeCells(row, 1, row, 2);
    photos.getCell(row, 1).value =
      `Fotografía ${index + 1}: ${image.photo.name || "Evidencia"}`;
    photos.getCell(row, 1).font = { bold: true };
    row++;
    const size = fit(image, 600, 350),
      id = book.addImage({ base64: image.data, extension: image.type });
    photos.addImage(id, {
      tl: { col: 0, row: row - 1 },
      ext: size,
      editAs: "oneCell",
    });
    const imageRows = Math.ceil(size.height / 20) + 1;
    for (let r = row; r < row + imageRows; r++) photos.getRow(r).height = 15;
    row += imageRows;
    for (const part of chunks(image.photo.comment || "Sin comentario", 700)) {
      photos.mergeCells(row, 1, row, 2);
      const comment = photos.getCell(row, 1);
      comment.value = part;
      comment.alignment = { wrapText: true, vertical: "top" };
      photos.getRow(row).height = rowHeight(part, 110);
      row++;
    }
    row++;
  }
  if (!images.length) photos.addRow(["Sin fotografías"]);
  const history = book.addWorksheet("Historial");
  history.columns = [
    { header: "Fecha", width: 28 },
    { header: "Cambio", width: 90 },
  ];
  for (const h of snapshot.history || []) history.addRow([h.at, h.summary]);
  return new Uint8Array(await book.xlsx.writeBuffer());
}
async function wordReport(snapshot, meta, images) {
  const p = (text, options = {}) =>
    new Paragraph({
      children: [new TextRun(String(text || "Sin indicar"))],
      ...options,
    });
  const children = [
    p("Quality Control Suite", { heading: HeadingLevel.TITLE }),
    p("Informe de aviso · BORRADOR", { heading: HeadingLevel.HEADING_1 }),
  ];
  for (const [label, value] of reportFields(snapshot, meta)) {
    children.push(p(label, { heading: HeadingLevel.HEADING_2 }));
    for (const line of String(value || "Sin indicar").split(/\r?\n/))
      children.push(p(line));
  }
  for (const [index, image] of images.entries()) {
    children.push(
      p(`Fotografía ${index + 1}: ${image.photo.name || "Evidencia"}`, {
        heading: HeadingLevel.HEADING_2,
      }),
    );
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            type: image.type === "jpeg" ? "jpg" : "png",
            data: image.bytes,
            transformation: fit(image, 600, 430),
            altText: {
              title: "Fotografía de evidencia",
              description: image.photo.comment || "Sin comentario",
              name: "Evidencia " + (index + 1),
            },
          }),
        ],
      }),
    );
    children.push(p(image.photo.comment || "Sin comentario"));
  }
  if (snapshot.history?.length) {
    children.push(
      p("Historial del aviso", { heading: HeadingLevel.HEADING_1 }),
    );
    for (const h of snapshot.history)
      children.push(p(`${h.at} · ${h.summary}`));
  }
  const doc = new Document({
    creator: "Quality Control Suite",
    title: "QCS · Informe de aviso",
    description: "Instantánea local del borrador",
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 22 },
          paragraph: { spacing: { after: 120 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 900, right: 900, bottom: 900, left: 900 },
          },
        },
        children,
      },
    ],
  });
  return new Uint8Array(await Packer.toArrayBuffer(doc));
}
export async function generateAvReport(snapshot, format, meta) {
  if (!REPORT_FORMATS[format]) throw Error("Formato de informe no disponible.");
  const images = await reportImages(snapshot);
  return { pdf: pdfReport, xlsx: excelReport, docx: wordReport }[format](
    snapshot,
    meta,
    images,
  );
}
export class AvisoReports {
  constructor(vault, generator = generateAvReport) {
    this.vault = vault;
    this.generator = generator;
  }
  async list(avisoId) {
    return (await this.vault.list())
      .filter((r) => r.kind === "aviso-report" && r.avisoId === avisoId)
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  }
  async generate(draft, format) {
    const spec = REPORT_FORMATS[format];
    if (!spec) throw Error("Formato de informe no disponible.");
    const source = await this.vault.get(draft.id);
    if (
      !source ||
      source.kind !== "aviso" ||
      source._revision !== draft._revision
    )
      throw Error(
        "El aviso cambió. Ábrelo de nuevo antes de generar el informe.",
      );
    const snapshot = structuredClone(source);
    delete snapshot.retiredPhotos;
    const id = crypto.randomUUID(),
      generatedAt = new Date().toISOString(),
      meta = { id, generatedAt, sourceRevision: source._revision };
    const bytes = await this.generator(snapshot, format, meta),
      report = {
        kind: "aviso-report",
        id,
        avisoId: source.id,
        format,
        mime: spec.mime,
        name: `QCS-aviso-${source.id.slice(0, 8)}-${id.slice(0, 8)}.${spec.ext}`,
        generatedAt,
        sourceRevision: source._revision,
        templateVersion: "qcs-aviso-local-1",
        snapshot,
        snapshotDigest: await digest(
          new TextEncoder().encode(JSON.stringify(snapshot)),
        ),
        artifactDigest: await digest(bytes),
        size: bytes.length,
        data: reportBase64(bytes),
        status: "local",
      };
    await this.vault.put(id, report);
    return report;
  }
}
