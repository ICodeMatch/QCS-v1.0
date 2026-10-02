import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { image } from "../tests/report-fixture.js";
import { Vault } from "../src/vault.js";
const { chromium } = await import(
  process.env.QCS_PLAYWRIGHT_MODULE || "playwright"
);
const out = process.env.QCS_PREVIEWS || "previews/avisos";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  acceptDownloads: true,
});
const page = await context.newPage();
page.setDefaultTimeout(45000);
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", (d) => d.accept());
const login = async (p) => {
  await p.goto(process.env.QCS_WEB_URL || "http://127.0.0.1:8080");
  await p.locator("#password").fill("12345678");
  await p.locator("#enter").click();
  await p.locator("#openAvisos").waitFor();
};
const capture = async (name) => {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    "Desbordamiento horizontal",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: out + "/" + name + ".png", fullPage: true });
  await page.screenshot({ path: out + "/" + name + "-pantalla.png" });
};
const saveDownload = async (p, selector, name) => {
  const pending = p.waitForEvent("download");
  await p.locator(selector).click();
  const download = await pending;
  const path = out + "/" + name;
  await download.saveAs(path);
  assert.equal(await download.failure(), null);
  return path;
};
const hash = async (path) =>
  createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
try {
  await login(page);
  // Datos de CodeMatch coexistiendo con el aviso y su copia.
  await page.locator("#open").click();
  const cm = page.frameLocator("#codematchFrame");
  await cm.locator("#recordCount").waitFor();
  await page.waitForFunction(
    () =>
      document.querySelector("#codematchFrame")?.contentWindow.qcsCodeMatch
        ?.ready,
  );
  await cm.locator('.bottom-nav [data-view="library"]').click();
  await cm.locator("#newRecordBtn").click();
  await cm.locator("#recordCode").fill("IT-B4-001");
  await cm.locator("#recordName").fill("Pieza integrada CodeMatch");
  await page.locator("#back").click();
  await cm.locator('[data-edit="IT-B4-001"]').waitFor();
  await page.locator("#back").click();
  await cm.locator("#searchView.active").waitFor();
  await page.locator("#back").click();
  await page.locator("#openAvisos").waitFor();
  await page.locator("#openAvisos").click();
  await capture("01-menu");
  await page.locator('[data-av-type="provider"]').click();
  await page.locator("#avCode").fill("CODIGO-SIN-CATALOGO");
  await page.locator("#avName").fill("Pieza ángulo");
  await page.locator("#avCounterparty").fill("Proveedor ensayo");
  await page.locator("#avQuantity").fill("12,5");
  await page
    .locator("#avProblem")
    .fill("Taladro fuera de posición. FINAL PROBLEMA");
  await page.locator("#avAction").fill("Retener lote");
  await page.locator("#avSave").click();
  await page
    .locator("#avSaveStatus")
    .filter({ hasText: "Guardado en este dispositivo" })
    .waitFor();
  await capture("02-datos");
  await page.locator("#avNext").click();
  await page.locator("#avGallery").waitFor();
  const chooser = page.waitForEvent("filechooser");
  await page.locator("#avGallery").click();
  await (
    await chooser
  ).setFiles(
    Array.from({ length: 6 }, (_, i) => ({
      name: `ensayo-${i}.png`,
      mimeType: "image/png",
      buffer: Buffer.from(image.split(",")[1], "base64"),
    })),
  );
  await page.waitForFunction(
    () => document.querySelectorAll("[data-av-comment]").length === 6,
  );
  for (let i = 0; i < 6; i++)
    await page
      .locator("[data-av-comment]")
      .nth(i)
      .fill("Comentario individual " + i);
  await page.locator("#avSave").click();
  await page
    .locator("#avSaveStatus")
    .filter({ hasText: "Guardado en este dispositivo" })
    .waitFor();
  await capture("03-fotos");
  await page.locator("#avNext").click();
  await page.locator('[data-av-format="pdf"]').waitFor();
  const files = {};
  for (const format of ["pdf", "xlsx", "docx"]) {
    files[format] = await saveDownload(
      page,
      `[data-av-format="${format}"]`,
      "aviso." + format,
    );
    await page.waitForFunction(
      (n) => document.querySelectorAll("[data-av-download]").length === n,
      Object.keys(files).length,
    );
    await page.waitForFunction(
      () => !document.querySelector('[data-av-format="pdf"]').disabled,
    );
  }
  await capture("04-informe");
  // Retirar conserva el original y no altera informes existentes.
  await page.locator("#back").click();
  await page.locator("[data-av-retire]").first().click();
  await page.waitForFunction(
    () => document.querySelectorAll("[data-av-comment]").length === 5,
  );
  await page.locator("#avNext").click();
  await page.waitForFunction(
    () => document.querySelectorAll("[data-av-download]").length === 3,
  );
  const pdfButton = page
    .locator("#avReports article")
    .filter({ hasText: "PDF · Borrador" })
    .locator("button");
  const pending = page.waitForEvent("download");
  await pdfButton.click();
  await (await pending).saveAs(out + "/aviso-repetido.pdf");
  assert.equal(await hash(files.pdf), await hash(out + "/aviso-repetido.pdf"));
  // Cierre/reapertura: borrador, comentarios e informes persisten.
  await login(page);
  await page.locator("#openAvisos").click();
  await page.locator("#avMonitor").click();
  await page.locator("[data-av-open]").click();
  assert.equal(
    await page.locator("#avProblem").inputValue(),
    "Taladro fuera de posición. FINAL PROBLEMA",
  );
  await page.locator("#avNext").click();
  assert.equal(await page.locator("[data-av-comment]").count(), 5);
  assert.equal(
    await page.locator("[data-av-comment]").first().inputValue(),
    "Comentario individual 1",
  );
  await page.locator('[data-nav="settings"]').click();
  const backupPath = await saveDownload(page, "#backup", "copia-cifrada.json");
  const vault = new Vault();
  const rows = await vault.inspectBackup(
    JSON.parse(await readFile(backupPath, "utf8")),
    "12345678",
  );
  const aviso = rows.find((r) => r.kind === "aviso");
  assert.equal(aviso.photos.length, 5);
  assert.equal(aviso.retiredPhotos.length, 1);
  const reports = rows.filter((r) => r.kind === "aviso-report");
  assert.equal(reports.length, 3);
  assert(reports.every((r) => r.snapshot.photos.length === 6));
  assert(rows.some((r) => r.kind === "codematch"));
  // Recuperación real por la interfaz, en almacenamiento nuevo; ambos módulos.
  const fresh = await browser.newContext({
      viewport: { width: 393, height: 852 },
      acceptDownloads: true,
    }),
    p = await fresh.newPage();
  p.setDefaultTimeout(45000);
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("dialog", (d) => d.accept());
  await login(p);
  await p.locator('[data-nav="settings"]').click();
  await p.locator("#backupFile").setInputFiles(backupPath);
  await p.locator("#backupPassword").fill("12345678");
  await p.locator("#inspectBackup").click();
  await p.locator("#applyBackup").click();
  await p.locator("#openAvisos").waitFor();
  await p.locator("#openAvisos").click();
  await p.locator("#avMonitor").click();
  await p.locator("[data-av-open]").click();
  assert.equal(await p.locator("#avName").inputValue(), "Pieza ángulo");
  await p.locator("#avNext").click();
  assert.equal(await p.locator("[data-av-comment]").count(), 5);
  await p.locator("#avNext").click();
  await p.waitForFunction(
    () => document.querySelectorAll("[data-av-download]").length === 3,
  );
  const restoredPdf = p
    .locator("#avReports article")
    .filter({ hasText: "PDF · Borrador" })
    .locator("button");
  const pendingRestored = p.waitForEvent("download");
  await restoredPdf.click();
  await (await pendingRestored).saveAs(out + "/aviso-restaurado.pdf");
  assert.equal(
    await hash(files.pdf),
    await hash(out + "/aviso-restaurado.pdf"),
  );
  await p.locator('[data-nav="home"]').click();
  await p.locator("#open").click();
  const restoredCM = p.frameLocator("#codematchFrame");
  await restoredCM.locator("#recordCount").waitFor();
  await p.waitForFunction(
    () =>
      document.querySelector("#codematchFrame")?.contentWindow.qcsCodeMatch
        ?.ready,
  );
  await restoredCM.locator('.bottom-nav [data-view="library"]').click();
  await restoredCM.locator('[data-edit="IT-B4-001"]').waitFor();
  await fresh.close();
  assert.deepEqual(errors, []);
  await writeFile(
    out + "/resultado.json",
    JSON.stringify(
      {
        status: "passed",
        photos: 6,
        remainingPhotos: 5,
        reports: 3,
        identicalPdfAfterRetireAndRestore: true,
        codeMatchRestored: true,
        pageErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "B4 integrado OK: seis fotos, tres informes, reapertura y copia con CodeMatch.",
  );
} finally {
  await browser.close();
}
