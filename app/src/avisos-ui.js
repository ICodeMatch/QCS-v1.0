import { reportBytes } from "./aviso-reports.js";
import { AVISO_TYPES, filterAvisos } from "./avisos-store.js";
import { evidencePhoto, nativeEvidencePhotos } from "./evidence-photos.js";
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const typeLabel = (type) =>
  AVISO_TYPES.find((x) => x[0] === type)?.[1] || "Sin tipo";
const date = (s) => new Date(s).toLocaleString("es-ES");
const avIcon = (i) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${
    [
      '<path d="M3 21V10l6-4v5l6-4v6h6v8zM17 13V3h3v10M7 16v2M12 16v2M17 16v2"/>',
      '<path d="M2 5h12v12H2zM14 9h4l4 5v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
      '<circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M4 7a2 2 0 0 0 0 4M20 7a2 2 0 0 1 0 4M3 15v6M21 15v6"/>',
      '<path d="M3 21h18M5 21V13h3v8M11 21V8h3v13M17 21V3h3v18"/>',
    ][i]
  }</svg>`;
export class AvisosModule {
  constructor({
    root,
    store,
    say,
    title,
    beginCapture,
    finishCapture,
    reports,
    download,
  }) {
    Object.assign(this, {
      root,
      store,
      say,
      title,
      beginCapture,
      finishCapture,
      reports,
      download,
    });
    this.queue = Promise.resolve();
    this.view = "menu";
    this.draft = null;
    this.dirty = false;
    this.edits = 0;
    this.step = 1;
    this.filters = {};
  }
  $(s) {
    return this.root.querySelector(s);
  }
  perform(fn) {
    const next = this.queue.then(fn);
    this.queue = next.catch(() => {});
    return next;
  }
  action(fn) {
    return () => this.perform(fn).catch((e) => this.fail(e));
  }
  fail(e) {
    this.say(
      e.message || "No se pudo guardar. Los datos anteriores se conservan.",
    );
    const status = this.$("#avSaveStatus");
    if (status)
      status.textContent =
        "No se ha confirmado el guardado. Reintenta antes de salir.";
  }
  async open() {
    await this.menu();
  }
  async menu() {
    this.view = "menu";
    this.draft = null;
    this.title("No conformidades / Avisos");
    const rows = await this.store.list();
    this.root.innerHTML = `<h1 class="home-title">No conformidades</h1><p class="home-subtitle">Avisos · datos de este dispositivo</p><div class="module-list av-types">${AVISO_TYPES.map(([type, label, hint], i) => `<button class="module-card" data-av-type="${type}"><span class="module-icon ${["blue", "teal", "orange"][i]}">${avIcon(i)}</span><span class="module-copy"><strong>${label}</strong><span>${hint}</span></span><span class="module-chevron">›</span></button>`).join("")}<button class="module-card" id="avMonitor"><span class="module-icon blue">${avIcon(3)}</span><span class="module-copy"><strong>Borradores e histórico</strong><span>${rows.length} borradores guardados</span></span><span class="module-chevron">›</span></button></div><p class="av-local-note">Número definitivo y registro empresarial pendientes. Informes locales desde el resumen.</p>`;
    this.root
      .querySelectorAll("[data-av-type]")
      .forEach(
        (b) => (b.onclick = this.action(() => this.newDraft(b.dataset.avType))),
      );
    this.$("#avMonitor").onclick = this.action(() => this.list());
  }
  async newDraft(type) {
    this.draft = this.store.create(type);
    this.dirty = true;
    this.edits++;
    this.step = 1;
    this.renderEditor();
    await this.flush();
  }
  async openDraft(id) {
    this.draft = await this.store.get(id);
    this.dirty = false;
    this.step = 1;
    this.renderEditor();
  }
  renderEditor() {
    this.view = "editor";
    this.title(`Aviso · ${typeLabel(this.draft.type)}`);
    const d = this.draft;
    const input = (id, label, value = "", textarea = false) =>
      `<label>${label}${textarea ? `<textarea id="${id}" rows="3">${esc(value)}</textarea>` : `<input id="${id}" value="${esc(value)}" ${id === "avQuantity" ? 'inputmode="decimal"' : ""}>`}</label>`;
    let body = "";
    if (this.step === 1)
      body = `<section class="av-card av-fields">${input("avCode", "Código material", d.code)}${input("avName", "Denominación", d.name)}${d.type !== "internal" ? input("avCounterparty", d.type === "provider" ? "Proveedor" : "Cliente", d.counterparty) : ""}${input("avQuantity", "Cantidad afectada", d.quantity)}${input("avProblem", "Descripción del problema", d.problem, true)}${input("avAction", "Acción inmediata", d.action, true)}</section>`;
    if (this.step === 2)
      body = `<section class="av-card"><h2>Fotos de evidencia</h2><p>Se conserva el archivo recibido. La miniatura es solo para visualizarlo.</p><div class="av-photo-list">${d.photos.map((p) => `<article class="av-photo"><img src="${esc(p.thumbnail || p.data)}" alt="Fotografía de evidencia"><label>Comentario de la foto<textarea data-av-comment="${esc(p.id)}" rows="2">${esc(p.comment)}</textarea></label><small>${esc(p.name)} · ${(p.size / 1048576).toFixed(2)} MB</small><button type="button" data-av-retire="${esc(p.id)}">Retirar conservando copia</button></article>`).join("") || "<p>Todavía no hay fotografías.</p>"}</div><div class="actions"><button id="avCamera">Tomar foto</button><button id="avGallery">Añadir de galería</button></div><input id="avPhotoInput" type="file" accept="image/*" multiple hidden></section>`;
    if (this.step === 3)
      body = `<section class="av-card"><h2>Resumen del borrador</h2><dl class="av-summary">${[["Tipo", typeLabel(d.type)], ["Código material", d.code], ["Denominación", d.name], ...(d.type !== "internal" ? [[d.type === "provider" ? "Proveedor" : "Cliente", d.counterparty]] : []), ["Cantidad afectada", d.quantity], ["Descripción del problema", d.problem], ["Acción inmediata", d.action]].map(([label, value]) => `<div><dt>${label}</dt><dd>${esc(value || "Sin indicar")}</dd></div>`).join("")}</dl><div class="av-photo-list">${d.photos.map((p) => `<figure><img src="${esc(p.thumbnail || p.data)}" alt="Fotografía de evidencia"><figcaption>${esc(p.comment || "Sin comentario")}</figcaption></figure>`).join("")}</div></section><section class="av-card"><h2>Informe</h2><p>Cada informe conserva una instantánea del borrador, con sus fotos y comentarios. Modificar después el aviso no cambia los informes anteriores.</p><div class="actions"><button data-av-format="pdf">Generar PDF</button><button data-av-format="xlsx">Generar Excel</button><button data-av-format="docx">Generar Word</button></div><p class="av-local-note">Borrador local. Comprueba el destino al guardar o compartir. SharePoint pendiente de conexión.</p><div id="avReports" aria-live="polite"></div></section>`;
    this.root.innerHTML = `<h1 class="home-title">${this.step === 3 ? "Revisión del aviso" : "Datos del aviso"}</h1><ol class="av-steps" aria-label="Pasos del aviso">${["Datos", "Fotos", "Informe"].map((label, i) => `<li ${i + 1 === this.step ? 'aria-current="step"' : ""}><span>${i + 1}</span>${label}</li>`).join("")}</ol>${body}<p id="avSaveStatus" class="av-save-status" role="status">${this.dirty ? "Cambios pendientes de guardar" : "Guardado en este dispositivo"}</p><div class="av-footer"><button id="avSave">Guardar borrador</button>${this.step < 3 ? '<button id="avNext" class="primary">Continuar</button>' : '<button id="avReturn" class="primary">Ver borradores</button>'}</div><details class="av-local-note"><summary>Referencia local del borrador</summary><p>${esc(d.id)}<br>Creado: ${date(d.createdAt)}<br>No es un número SAP ni un número definitivo.</p></details>`;
    this.root
      .querySelectorAll("input:not([type=file]),textarea")
      .forEach((n) => (n.oninput = () => this.changed()));
    this.$("#avSave").onclick = this.action(async () => {
      await this.flush();
      this.say("Borrador guardado en este dispositivo.");
    });
    if (this.$("#avNext"))
      this.$("#avNext").onclick = this.action(async () => {
        await this.flush();
        this.step++;
        this.renderEditor();
      });
    if (this.$("#avReturn"))
      this.$("#avReturn").onclick = this.action(async () => {
        await this.flush();
        await this.list();
      });
    if (this.step === 3) {
      this.root
        .querySelectorAll("[data-av-format]")
        .forEach(
          (b) =>
            (b.onclick = this.action(() =>
              this.generateReport(b.dataset.avFormat),
            )),
        );
      this.loadReports().catch((e) => this.say(e.message));
    }
    if (this.step === 2) {
      this.$("#avCamera").onclick = this.action(() => this.pickPhotos(true));
      this.$("#avGallery").onclick = this.action(() => this.pickPhotos(false));
      this.$("#avPhotoInput").onchange = (e) => {
        const files = [...e.target.files],
          source = e.target.dataset.source;
        e.target.value = "";
        this.perform(() => this.addFiles(files, source)).catch((err) =>
          this.fail(err),
        );
      };
      this.root.querySelectorAll("[data-av-retire]").forEach(
        (b) =>
          (b.onclick = this.action(async () => {
            if (
              !confirm(
                "¿Retirar esta foto? Se conservará una copia en el borrador y en su copia de seguridad.",
              )
            )
              return;
            await this.photoBusy(async () => {
              await this.flush();
              this.draft = await this.store.retirePhoto(
                this.draft,
                b.dataset.avRetire,
              );
              this.renderEditor();
              this.say("Fotografía retirada; copia conservada.");
            });
          })),
      );
    }
  }
  async loadReports() {
    const id = this.draft?.id;
    if (!this.reports) return;
    const rows = await this.reports.list(id);
    if (this.view !== "editor" || this.step !== 3 || this.draft?.id !== id)
      return;
    const node = this.$("#avReports");
    if (!node) return;
    node.innerHTML =
      "<h3>Informes conservados</h3>" +
      (rows
        .map(
          (r) =>
            `<article class="av-card"><strong>${esc({ pdf: "PDF", xlsx: "Excel", docx: "Word" }[r.format])} · Borrador</strong><p>${date(r.generatedAt)} · versión del aviso ${esc(r.sourceRevision)}</p><button data-av-download="${esc(r.id)}">Volver a guardar / compartir</button></article>`,
        )
        .join("") || "<p>Todavía no hay informes generados.</p>");
    node
      .querySelectorAll("[data-av-download]")
      .forEach(
        (b) =>
          (b.onclick = this.action(() =>
            this.shareReport(rows.find((r) => r.id === b.dataset.avDownload)),
          )),
      );
  }
  async shareReport(report) {
    try {
      await this.download(reportBytes(report.data), report.name, report.mime);
      this.say(
        "Informe conservado localmente. Comprueba que el archivo esté en el destino elegido.",
      );
    } catch (e) {
      this.say(
        "El informe se conserva localmente. No se ha confirmado guardar o compartir: " +
          (e.message || "operación cancelada") +
          ". Puedes volver a intentarlo.",
      );
    }
  }
  async generateReport(format) {
    return this.photoBusy(async () => {
      await this.flush();
      let report;
      try {
        report = await this.reports.generate(this.draft, format);
      } catch (e) {
        this.say(
          "No se ha generado ni confirmado un nuevo informe: " + e.message,
        );
        return;
      }
      await this.loadReports();
      await this.shareReport(report);
    });
  }
  changed() {
    this.dirty = true;
    this.edits++;
    this.$("#avSaveStatus").textContent = "Cambios pendientes de guardar";
    clearTimeout(this.timer);
    this.timer = setTimeout(
      () => this.perform(() => this.saveDraft()).catch((e) => this.fail(e)),
      600,
    );
  }
  capture() {
    const next = structuredClone(this.draft);
    if (this.step === 1)
      for (const [field, id] of Object.entries({
        code: "avCode",
        name: "avName",
        counterparty: "avCounterparty",
        quantity: "avQuantity",
        problem: "avProblem",
        action: "avAction",
      })) {
        if (this.$("#" + id)) next[field] = this.$("#" + id).value;
      }
    if (this.step === 2)
      for (const photo of next.photos) {
        const node = [...this.root.querySelectorAll("[data-av-comment]")].find(
          (x) => x.dataset.avComment === photo.id,
        );
        if (node) photo.comment = node.value;
      }
    return next;
  }
  async saveDraft(explicit = false) {
    clearTimeout(this.timer);
    if (!this.draft) return;
    if (!this.dirty && !explicit) return;
    const version = this.edits,
      next = this.capture(),
      status = this.$("#avSaveStatus");
    if (status) status.textContent = "Guardando…";
    const saved = await this.store.save(next);
    this.draft = saved;
    this.dirty = this.edits !== version;
    if (this.$("#avSaveStatus"))
      this.$("#avSaveStatus").textContent = this.dirty
        ? "Cambios pendientes de guardar"
        : "Guardado en este dispositivo";
    if (explicit) this.say("Borrador guardado en este dispositivo.");
  }
  async pickPhotos(camera) {
    await this.flush();
    this.captureId = await this.beginCapture(this.draft.id, camera);
    const photos = await nativeEvidencePhotos(camera);
    if (photos) {
      await this.commitPhotos(photos);
      return;
    }
    const input = this.$("#avPhotoInput");
    input.dataset.source = camera ? "camera" : "gallery";
    input.multiple = !camera;
    if (camera) input.setAttribute("capture", "environment");
    else input.removeAttribute("capture");
    input.click();
  }
  async photoBusy(fn) {
    const nodes = [
      ...this.root.querySelectorAll("input,textarea,button,select"),
    ].filter((n) => !n.disabled);
    nodes.forEach((n) => (n.disabled = true));
    try {
      return await fn();
    } finally {
      nodes.forEach((n) => (n.disabled = false));
    }
  }
  async commitPhotos(photos) {
    return this.photoBusy(async () => {
      await this.flush();
      if (this.captureId)
        photos.forEach((p, i) => (p.id = this.captureId + ":" + i));
      this.draft = await this.store.addPhotos(this.draft, photos);
      await this.finishCapture();
      this.renderEditor();
      this.say("Fotografías guardadas.");
    });
  }
  async addFiles(files, source) {
    if (!files.length) return;
    return this.photoBusy(async () => {
      await this.flush();
      const photos = [];
      for (const file of files)
        photos.push(await evidencePhoto(file, source, file.name));
      await this.commitPhotos(photos);
    });
  }
  async list() {
    this.view = "list";
    this.draft = null;
    this.title("Borradores de avisos");
    const rows = await this.store.list();
    this.root.innerHTML = `<h1 class="home-title">Borradores de avisos</h1><p class="home-subtitle">Datos de este dispositivo</p><section class="av-card av-filters"><label>Buscar<input id="avFilterText" placeholder="Código, denominación, proveedor, cliente o texto" value="${esc(this.filters.text || "")}"></label><label>Tipo<select id="avFilterType"><option value="">Todos</option>${AVISO_TYPES.map(([type, label]) => `<option value="${type}" ${type === this.filters.type ? "selected" : ""}>${label}</option>`).join("")}</select></label><label>Desde<input id="avFilterFrom" type="date" value="${esc(this.filters.from || "")}"></label><label>Hasta<input id="avFilterTo" type="date" value="${esc(this.filters.to || "")}"></label></section><p id="avCount"></p><div id="avDraftList"></div>`;
    const render = () => {
      this.filters = {
        text: this.$("#avFilterText").value,
        type: this.$("#avFilterType").value,
        from: this.$("#avFilterFrom").value,
        to: this.$("#avFilterTo").value,
      };
      const found = filterAvisos(rows, this.filters);
      this.$("#avCount").textContent =
        `${found.length} de ${rows.length} borradores`;
      this.$("#avDraftList").innerHTML =
        found
          .map(
            (d) =>
              `<button class="av-draft av-card" data-av-open="${esc(d.id)}"><strong>${esc(d.name || d.problem || "Borrador sin completar")}</strong><span>${typeLabel(d.type)} · ${esc(d.code || "Código sin indicar")}</span><small>${date(d.createdAt)} · ${d.photos.length} fotos · Borrador</small></button>`,
          )
          .join("") ||
        '<section class="av-card">No hay borradores para estos filtros.</section>';
      this.root
        .querySelectorAll("[data-av-open]")
        .forEach(
          (b) =>
            (b.onclick = this.action(() => this.openDraft(b.dataset.avOpen))),
        );
    };
    this.root
      .querySelectorAll(".av-filters input,.av-filters select")
      .forEach((n) => (n.oninput = render));
    render();
  }
  async flush() {
    await this.saveDraft();
    while (this.dirty) await this.saveDraft();
  }
  async prepareLeave() {
    clearTimeout(this.timer);
    await this.perform(() => this.flush());
  }
  async goBack() {
    await this.prepareLeave();
    if (this.view === "editor") {
      if (this.step > 1) {
        this.step--;
        this.renderEditor();
      } else await this.menu();
      return true;
    }
    if (this.view === "list") {
      await this.menu();
      return true;
    }
    return false;
  }
}
