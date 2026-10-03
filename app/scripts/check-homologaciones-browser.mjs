import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import ExcelJS from "exceljs";
import { Vault } from "../src/vault.js";
const { chromium } = await import(
  process.env.QCS_PLAYWRIGHT_MODULE || "playwright"
);
const out = process.env.QCS_HOMOLOGATION_PREVIEWS || "previews/homologaciones";
await mkdir(out, { recursive: true });
const book = new ExcelJS.Workbook(),
  ws = book.addWorksheet("Ensayo");
ws.getCell("A4").value = "No";
ws.getCell("A5").value = "Dim. / Attr. / %";
for (const [col, id, type] of [
  ["B", "01", "Dim."],
  ["C", "1.0", "Dim."],
  ["D", "01", "Dim."],
  ["E", "", "Dim."],
  ["F", "5", "Attribute"],
]) {
  ws.getCell(col + "4").value = id;
  ws.getCell(col + "5").value = type;
  ws.getCell(col + "6").value = "Característica de ensayo";
  if (type === "Dim.") {
    ws.getCell(col + "7").value = "0.1";
    ws.getCell(col + "8").value = "-0.1";
    ws.getCell(col + "9").value = "10";
  }
}
ws.getCell("A14").value = 1;
ws.getCell("A15").value = 2;
ws.getCell("O3").value = "HOM-ENSAYO";
const original = Buffer.from(await book.xlsx.writeBuffer());
const sha = (b) => createHash("sha256").update(b).digest("hex");
const browser = await chromium.launch({ headless: true }),
  errors = [];
const options = {
  viewport: { width: 393, height: 852 },
  acceptDownloads: true,
};
const context = await browser.newContext(options),
  page = await context.newPage();
function setup(p) {
  p.setDefaultTimeout(20000);
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("dialog", (d) => d.accept());
}
setup(page);
async function login(p) {
  await p.goto(process.env.QCS_WEB_URL || "http://127.0.0.1:8080");
  await p.locator("#password").fill("12345678");
  await p.locator("#enter").click();
  await p.locator("#openHomologaciones").waitFor();
}
async function capture(name) {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    "Desbordamiento horizontal",
  );
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
}
async function download(p, selector, path) {
  const pending = p.waitForEvent("download").catch(async (e) => {
    console.error(await p.locator("#status").innerText());
    throw e;
  });
  await p.locator(selector).click();
  await (await pending).saveAs(path);
  return readFile(path);
}
try {
  await login(page);
  await page.locator("#openHomologaciones").click();
  await page.locator("#hmNew").click();
  await page
    .locator('[data-hm-header="description"]')
    .fill("Cabecera conservada al cancelar");
  await page.locator("#hmFile").setInputFiles({
    name: "Ensayo.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: original,
  });
  await page.locator("#hmCancelImport").click();
  assert.equal(
    await page.locator('[data-hm-header="description"]').inputValue(),
    "Cabecera conservada al cancelar",
  );
  await page.locator("#hmFile").setInputFiles({
    name: "Ensayo.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: original,
  });
  await page.locator("#hmPreview").click();
  await page.locator("#hmConfirm").waitFor();
  await capture("01-vista-previa");
  assert(
    (await page.locator("#app").innerText()).includes("5 características"),
  );
  await page.locator("#hmConfirm").click();
  await page.locator("[data-hm-sample]").first().fill("10.1");
  await page
    .locator("[data-hm-result]")
    .first()
    .filter({ hasText: "Conforme" })
    .waitFor();
  await page.locator("#hmNextChar").click();
  await page.locator("#hmNextChar").click();
  await page.locator("#hmPrevChar").click();
  assert.equal(await page.locator("[data-hm-sample]").first().inputValue(), "");
  await page.locator("#hmFree").click();
  await page.locator("[data-hm-sample]").nth(1).fill("10.2");
  await page.locator("select[data-hm-sample]").first().selectOption("NOK");
  await page.locator("#hmSave").click();
  await page
    .locator("#hmSaveStatus")
    .filter({ hasText: "Guardado en este dispositivo" })
    .waitFor();
  await capture("02-medicion-libre");
  await page.locator("#hmGuided").click();
  await page.locator("#hmPrevChar").click();
  assert.equal(
    await page.locator("[data-hm-sample]").first().inputValue(),
    "10.1",
  );
  await page.locator("[data-hm-sample]").first().fill("9.9");
  await page.locator("#hmNext").click();
  await capture("03-resumen");
  assert((await page.locator("#app").innerText()).includes("No conforme"));
  await page.getByText("Original y trazabilidad", { exact: true }).click();
  const bytes = await download(page, "#hmOriginal", `${out}/original.xlsx`);
  assert.equal(sha(bytes), sha(original));
  await page.locator('[data-nav="home"]').click();
  await page.reload();
  await page.locator("#password").waitFor();
  await page.locator("#password").fill("12345678");
  await page.locator("#enter").click();
  await page.locator("#openHomologaciones").click();
  await page.locator("#hmSessions").click();
  await page.locator("[data-hm-open]").click();
  await page.locator("#hmNext").click();
  assert.equal(
    await page.locator("[data-hm-sample]").first().inputValue(),
    "9.9",
  );
  assert.equal(
    await page.locator("[data-hm-sample]").nth(1).inputValue(),
    "10.2",
  );
  await page.locator('[data-nav="settings"]').click();
  const backupBytes = await download(page, "#backup", `${out}/copia.json`);
  const rows = await new Vault().inspectBackup(
    JSON.parse(backupBytes.toString()),
    "12345678",
  );
  const record = rows.find((r) => r.kind === "homologacion");
  assert(record);
  assert.deepEqual(
    record.characteristics.map((c) => c.sourceIdentifier),
    ["01", "1.0", "01", "", "5"],
  );
  assert.equal(record.characteristics[0].samples[0].sourceCell, "B14");
  assert.equal(record.characteristics[1].samples[0].value, "");
  assert.equal(record.characteristics[4].samples[0].value, "NOK");
  assert(
    record.history.some((h) =>
      h.changes.some((c) => c.before === "10.1" && c.after === "9.9"),
    ),
  );
  const fresh = await browser.newContext(options),
    p = await fresh.newPage();
  setup(p);
  await login(p);
  await p.locator('[data-nav="settings"]').click();
  await p.locator("#backupFile").setInputFiles(`${out}/copia.json`);
  await p.locator("#backupPassword").fill("12345678");
  await p.locator("#inspectBackup").click();
  await p.locator("#applyBackup").click();
  await p.locator("#openHomologaciones").click();
  await p.locator("#hmSessions").click();
  await p.locator("[data-hm-open]").click();
  const restored = await download(
    p,
    "#hmOriginal",
    `${out}/original-restaurado.xlsx`,
  );
  assert.equal(sha(restored), sha(original));
  await p.locator("#hmNext").click();
  assert.equal(await p.locator("[data-hm-sample]").first().inputValue(), "9.9");
  await p.locator('[data-nav="home"]').click();
  await p.locator("#openHomologaciones").click();
  await p.locator("#hmNew").click();
  await p.locator("#hmFile").setInputFiles({
    name: "Ensayo.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: original,
  });
  await p.locator("#hmProfile").waitFor();
  const profileId = await p
    .locator("#hmProfile option")
    .nth(1)
    .getAttribute("value");
  await p.locator("#hmProfile").selectOption(profileId);
  assert.equal(await p.locator("#hmProfile").inputValue(), profileId);
  await p.locator("#hmProfile").selectOption("");
  assert.equal(await p.locator("#hmProfile").inputValue(), "");
  await p.locator("#hmCancelImport").click();
  await p.locator('[data-nav="home"]').click();
  // Copia cifrada válida cuyo original interno es incoherente: rechazo antes de escribir.
  const corrupt = structuredClone(record);
  corrupt.id = crypto.randomUUID();
  corrupt.source.data = Buffer.from("Original interno alterado").toString(
    "base64",
  );
  const nodeVault = new Vault();
  await nodeVault.open();
  await nodeVault.unlock("12345678");
  await nodeVault.createMany([corrupt]);
  const corruptPath = `${out}/copia-original-alterado.json`;
  await writeFile(corruptPath, JSON.stringify(await nodeVault.backup()));
  nodeVault.db.close();
  await p.locator('[data-nav="settings"]').click();
  await p.locator("#backupFile").setInputFiles(corruptPath);
  await p.locator("#backupPassword").fill("12345678");
  await p.locator("#inspectBackup").click();
  await p
    .locator("#status")
    .filter({ hasText: "alterado o incompleto" })
    .waitFor();
  assert.equal(await p.locator("#applyBackup").count(), 0);
  await p.locator('[data-nav="home"]').click();
  await p.locator("#openHomologaciones").click();
  await p.locator("#hmSessions").click();
  await p.locator("[data-hm-open]").first().waitFor();
  assert.equal(await p.locator("[data-hm-open]").count(), 2);
  await fresh.close();
  assert.deepEqual(errors, []);
  await writeFile(
    `${out}/resultado.json`,
    JSON.stringify(
      {
        status: "passed",
        characteristics: 5,
        literalIdentifiers: true,
        skipPreservesPositions: true,
        correctionHistory: true,
        originalBytesIdentical: true,
        encryptedRestore: true,
        reusableMappingSelection: true,
        corruptOriginalRejectedWithoutWrite: true,
        pageErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "B3 integrado OK: importar, cancelar, confirmar, guiado/libre, corregir, reabrir y recuperar original intacto.",
  );
} finally {
  await browser.close();
}
