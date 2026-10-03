import {
  HEADER_FIELDS,
  CHARACTER_FIELDS,
  openHomologationExcel,
  suggestHomologationMapping,
  previewHomologation,
} from "./homologacion-reader.js";
import { evaluateCharacteristic } from "./homologacion-rules.js";
import { reportBytes } from "./aviso-reports.js";
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const date = (s) => new Date(s).toLocaleString("es-ES");
const sampleLabels = {
  pending: "Sin medir",
  invalid: "Valor inválido",
  notEvaluable: "No evaluable",
  conforming: "Conforme",
  nonconforming: "No conforme",
};
export class HomologacionModule {
  constructor({ root, store, say, title, download }) {
    Object.assign(this, { root, store, say, title, download });
    this.queue = Promise.resolve();
    this.view = "menu";
    this.step = 1;
    this.draft = null;
    this.dirty = false;
    this.edits = 0;
    this.mode = "guided";
    this.index = 0;
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
    this.say(e.message || "No se pudo confirmar la operación.");
    const status = this.$("#hmSaveStatus");
    if (status)
      status.textContent =
        "Operación sin confirmar; los datos anteriores se conservan.";
  }
  async open() {
    await this.menu();
  }
  async menu() {
    this.view = "menu";
    this.draft = null;
    this.title("Homologaciones");
    const rows = await this.store.list();
    this.root.innerHTML = `<h1 class="home-title">Homologaciones</h1><p class="home-subtitle">Piezas y proveedores</p><div class="module-list"><button id="hmNew" class="module-card"><span class="module-icon blue">✓</span><span class="module-copy"><strong>Piezas</strong><span>Nueva sesión de homologación</span></span><span class="module-chevron">›</span></button><button disabled class="module-card"><span class="module-icon teal">⌂</span><span class="module-copy"><strong>Proveedores</strong><span>Definición operativa pendiente</span><small class="pending-label">Pendiente</small></span></button><button id="hmSessions" class="module-card"><span class="module-icon blue">▤</span><span class="module-copy"><strong>Sesiones guardadas</strong><span>${rows.length} sesiones en este dispositivo</span></span><span class="module-chevron">›</span></button></div><p class="av-local-note">Importación y medición en preparación. Aprobación e informes de Homologaciones pendientes.</p>`;
    this.$("#hmNew").onclick = this.action(() => this.newDraft());
    this.$("#hmSessions").onclick = this.action(() => this.list());
  }
  async newDraft() {
    this.reusedProfile = null;
    this.draft = this.store.create();
    this.step = 1;
    this.index = 0;
    this.dirty = true;
    this.edits++;
    this.renderEditor();
    await this.flush();
  }
  async openDraft(id) {
    this.draft = await this.store.get(id);
    this.step = 1;
    this.index = 0;
    this.dirty = false;
    this.renderEditor();
  }
  headerValue(key) {
    return this.draft.header[key]?.value ?? "";
  }
  renderEditor() {
    this.view = "editor";
    this.title("Homologación · Pieza");
    const d = this.draft;
    const headerField = ([key, label]) =>
      `<label>${label}<input data-hm-header="${key}" value="${esc(this.headerValue(key))}"></label>`;
    let body = "";
    if (this.step === 1)
      body = `<section class="av-card av-fields">${HEADER_FIELDS.filter(([k]) =>
        ["code", "description", "supplier", "revision"].includes(k),
      )
        .map(headerField)
        .join(
          "",
        )}<details><summary>Otros datos de cabecera</summary>${HEADER_FIELDS.filter(
        ([k]) => !["code", "description", "supplier", "revision"].includes(k),
      )
        .map(headerField)
        .join(
          "",
        )}</details></section><section class="av-card"><h2>Plantilla Excel</h2>${d.source ? `<p>${esc(d.source.name)} · ${d.characteristics.length} características</p><p>Original conservado. Consulta su mapeo y huella en el resumen.</p><button id="hmOriginal">Guardar / compartir original</button>` : '<p>Lee el archivo local, revisa hoja y mapeo antes de confirmar. No se modifica el original.</p><button id="hmImport" class="primary">Importar Excel</button><input id="hmFile" type="file" accept=".xlsx" hidden>'}</section>`;
    if (this.step === 2) {
      const input = (c, s, i) => {
        const evaluated = evaluateCharacteristic(c).samples[i],
          id = esc(c.internalKey),
          sid = esc(s.id);
        return `<label class="hm-sample"><span>Posición ${s.position} · ${esc(s.sourceCell)}</span>${c.type === "attribute" ? `<select data-hm-char="${id}" data-hm-sample="${sid}"><option value="">Sin medir</option>${s.value && !["OK", "NOK"].includes(s.value) ? `<option selected value="${esc(s.value)}">${esc(s.value)} · revisar mapeo</option>` : ""}<option ${s.value === "OK" ? "selected" : ""} value="OK">OK</option><option ${s.value === "NOK" ? "selected" : ""} value="NOK">NOK</option></select>` : `<input inputmode="decimal" data-hm-char="${id}" data-hm-sample="${sid}" value="${esc(s.value)}">`}<small data-hm-result="${sid}" class="hm-state ${evaluated.status}">${sampleLabels[evaluated.status]}</small></label>`;
      };
      const summary = (c) => {
        const r = evaluateCharacteristic(c);
        return `<p><strong>${esc(c.sourceIdentifier || "Sin ID · posición " + c.sourcePosition)}</strong> · ${esc(c.specification || "Sin especificación")} · ${esc(c.originalType || "Tipo sin definir")}</p><p>${r.rule?.valid ? `Límites ${esc(r.rule.lower)} a ${esc(r.rule.upper)}` : c.type === "attribute" ? "Entrada explícita OK/NOK; otros textos requieren mapeo." : esc(r.rule?.reason || "Especificación sin definir")} · Unidad no inferida</p><p data-hm-count="${esc(c.internalKey)}">${r.conformity} · ${r.nValid} válidas · ${r.counts.conforming} conformes</p>`;
      };
      body = `<section class="av-card"><h2>Comprobaciones</h2><div class="actions"><button id="hmGuided" ${this.mode === "guided" ? 'class="primary"' : ""}>Guiado</button><button id="hmFree" ${this.mode === "free" ? 'class="primary"' : ""}>Libre</button></div><p>Se conserva cada posición de la plantilla. Saltar no desplaza mediciones. Requeridas y aprobación: sin configurar.</p></section>`;
      if (!d.characteristics.length)
        body +=
          '<section class="av-card">Importa una plantilla desde Datos para empezar.</section>';
      else if (this.mode === "guided") {
        const c = d.characteristics[this.index];
        body += `<section class="av-card">${summary(c)}<p>Característica ${this.index + 1} de ${d.characteristics.length}</p><div class="hm-samples">${c.samples.map((s, i) => input(c, s, i)).join("") || "<p>No hay posiciones de muestra en el mapeo; vuelve a revisar la plantilla en una sesión nueva.</p>"}</div><div class="actions"><button id="hmPrevChar" ${this.index === 0 ? "disabled" : ""}>Anterior</button><button id="hmNextChar" ${this.index === d.characteristics.length - 1 ? "disabled" : ""}>Siguiente / saltar</button></div></section>`;
      } else
        body += `<section class="av-card hm-table-wrap"><table class="hm-table"><thead><tr><th>Característica</th>${d.characteristics[0].samples.map((s) => `<th>Posición ${s.position}</th>`).join("")}</tr></thead><tbody>${d.characteristics.map((c) => `<tr><td>${summary(c)}</td>${c.samples.map((s, i) => `<td>${input(c, s, i)}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`;
    }
    if (this.step === 3)
      body = `<section class="av-card"><h2>Resumen de la sesión</h2><p>Mediciones y conformidad no equivalen a aprobación humana.</p><dl class="av-summary">${HEADER_FIELDS.map(([key, label]) => `<div><dt>${label}</dt><dd>${esc(this.headerValue(key) || "Sin indicar")}</dd></div>`).join("")}</dl><h3>Características</h3>${
        d.characteristics
          .map((c) => {
            const r = evaluateCharacteristic(c);
            return `<article class="av-card"><strong>${esc(c.sourceIdentifier || "Sin ID · posición " + c.sourcePosition)}</strong><p>${esc(c.specification)} · ${r.conformity}</p><p>${r.nValid} muestras válidas, ${r.counts.conforming} conformes, ${r.counts.nonconforming} no conformes, ${r.counts.invalid + r.counts.notEvaluable} sin evaluar.</p><small>Requeridas: sin definir. Aprobación: pendiente. Origen ${esc(c.sourceSheet)}!${esc(c.sourceCell)}</small></article>`;
          })
          .join("") || "<p>Sin plantilla importada.</p>"
      }${d.source ? `<details><summary>Original y trazabilidad</summary><p>${esc(d.source.name)}<br>SHA-256: ${esc(d.source.digest)}</p><p>Hoja ${esc(d.source.mapping.sheetName)} · firma estructural ${esc(d.source.structuralSignature)}</p><button id="hmOriginal">Guardar / compartir original</button></details>` : ""}</section><section class="av-card"><h2>Informe y aprobación</h2><p>Exportación de informes, escritura de un derivado PVR y aprobación humana pendientes. Esta sesión se conserva en la copia cifrada QCS.</p></section>`;
    this.root.innerHTML = `<h1 class="home-title">${this.step === 1 ? "Datos de homologación" : this.step === 2 ? "Medición" : "Resumen"}</h1><ol class="av-steps">${["Datos", "Comprobaciones", "Informe"].map((x, i) => `<li ${this.step === i + 1 ? 'aria-current="step"' : ""}><span>${i + 1}</span>${x}</li>`).join("")}</ol>${body}<p id="hmSaveStatus" class="av-save-status" role="status">${this.dirty ? "Cambios pendientes" : "Guardado en este dispositivo"}</p><div class="av-footer"><button id="hmSave">Guardar sesión</button>${this.step < 3 ? '<button id="hmNext" class="primary">Continuar</button>' : '<button id="hmReturn" class="primary">Ver sesiones</button>'}</div>`;
    this.root
      .querySelectorAll("[data-hm-header],[data-hm-sample]")
      .forEach((n) => (n.oninput = () => this.changed()));
    this.$("#hmSave").onclick = this.action(async () => {
      await this.flush();
      this.say("Sesión guardada localmente.");
    });
    if (this.$("#hmNext"))
      this.$("#hmNext").onclick = this.action(async () => {
        await this.flush();
        this.step++;
        this.renderEditor();
      });
    if (this.$("#hmReturn"))
      this.$("#hmReturn").onclick = this.action(async () => {
        await this.flush();
        await this.list();
      });
    if (this.$("#hmImport")) {
      this.$("#hmImport").onclick = () => this.$("#hmFile").click();
      this.$("#hmFile").onchange = (e) => {
        const file = e.target.files[0];
        if (file)
          this.perform(async () => {
            await this.flush();
            this.reusedProfile = null;
            this.importWorkbook = await openHomologationExcel(
              await file.arrayBuffer(),
              file.name,
            );
            this.mapping = suggestHomologationMapping(
              this.importWorkbook.sheets[0],
            );
            this.profiles = await this.store.profiles();
            await this.flush();
            this.renderMapping();
          }).catch((e) => this.fail(e));
      };
    }
    if (this.$("#hmOriginal"))
      this.$("#hmOriginal").onclick = this.action(async () => {
        try {
          await this.download(
            reportBytes(d.source.data),
            d.source.name,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          );
          this.say("Original conservado. Comprueba el destino elegido.");
        } catch (e) {
          this.say(
            "El original sigue conservado; no se ha confirmado compartir: " +
              e.message,
          );
        }
      });
    if (this.step === 2) {
      for (const [id, mode] of [
        ["hmGuided", "guided"],
        ["hmFree", "free"],
      ])
        this.$("#" + id).onclick = this.action(async () => {
          await this.flush();
          this.mode = mode;
          this.renderEditor();
        });
      for (const [id, delta] of [
        ["hmPrevChar", -1],
        ["hmNextChar", 1],
      ])
        if (this.$("#" + id))
          this.$("#" + id).onclick = this.action(async () => {
            await this.flush();
            this.index += delta;
            this.renderEditor();
          });
    }
  }
  renderMapping() {
    this.view = "mapping";
    this.title("Homologación · Mapeo");
    const m = this.mapping,
      columns = m.orientation === "columns";
    this.root.innerHTML = `<h1 class="home-title">Revisar mapeo Excel</h1><section class="av-card av-fields"><p>Las posiciones propuestas deben comprobarse. No se importan datos hasta confirmar la vista previa.</p><label>Hoja<select id="hmSheet">${this.importWorkbook.sheets.map((s) => `<option ${s.name === m.sheetName ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label><label>Configuración anterior<select id="hmProfile"><option value="">Sin reutilizar</option>${this.profiles.map((p) => `<option value="${esc(p.id)}" ${this.reusedProfile?.id === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label><label>Características en<select id="hmOrientation"><option value="columns" ${columns ? "selected" : ""}>Columnas</option><option value="rows" ${!columns ? "selected" : ""}>Filas</option></select></label><label>${columns ? "Columnas" : "Filas"} de características<input id="hmRanges" value="${esc(m.characterRanges)}" placeholder="${columns ? "B:P,S:Z" : "2:10,14:18"}"></label><label>${columns ? "Filas" : "Columnas"} de mediciones<input id="hmSamples" value="${esc(m.sampleRange)}" placeholder="${columns ? "24:53" : "H:K"}"></label>${CHARACTER_FIELDS.map(([key, label]) => `<label>${label}: ${columns ? "fila" : "columna"}<input data-hm-binding="${key}" value="${esc(m.bindings[key] ?? "")}"></label>`).join("")}<label>Escala de tolerancias %<select id="hmPercent"><option value="">Sin definir</option><option value="fraction" ${m.percentEncoding === "fraction" ? "selected" : ""}>0,05 significa 5 %</option><option value="percent" ${m.percentEncoding === "percent" ? "selected" : ""}>5 significa 5 %</option></select></label><label><input id="hmExplicit" type="checkbox" ${m.explicitLimits ? "checked" : ""}>Usar límites explícitos sin fórmula si faltan tolerancias</label><details><summary>Celdas de cabecera (opcionales)</summary>${HEADER_FIELDS.map(([key, label]) => `<label>${label}<input data-hm-header-cell="${key}" value="${esc(m.header[key] || "")}" placeholder="A1"></label>`).join("")}</details><p>Atributos: entradas explícitas OK/NOK; no se infiere el significado de otros textos.</p><button id="hmPreview" class="primary">Ver vista previa</button><button id="hmCancelImport">Cancelar importación</button></section>`;
    this.$("#hmSheet").onchange = (e) => {
      this.reusedProfile = null;
      this.mapping = suggestHomologationMapping(
        this.importWorkbook.sheets.find((s) => s.name === e.target.value),
      );
      this.renderMapping();
    };
    this.$("#hmOrientation").onchange = (e) => {
      this.reusedProfile = null;
      this.mapping = {
        ...m,
        orientation: e.target.value,
        characterRanges: "",
        sampleRange: "",
        bindings: {},
      };
      this.renderMapping();
    };
    this.$("#hmProfile").onchange = (e) => {
      this.reusedProfile = null;
      const profile = this.profiles.find((p) => p.id === e.target.value);
      if (profile) {
        this.mapping = {
          ...structuredClone(profile.mapping),
          sheetName: this.$("#hmSheet").value,
        };
        this.reusedProfile = profile;
      } else {
        this.mapping = suggestHomologationMapping(
          this.importWorkbook.sheets.find(
            (s) => s.name === this.$("#hmSheet").value,
          ),
        );
      }
      this.renderMapping();
    };
    this.$("#hmPreview").onclick = this.action(async () => {
      const profile = structuredClone(this.mapping);
      profile.sheetName = this.$("#hmSheet").value;
      profile.characterRanges = this.$("#hmRanges").value.trim().toUpperCase();
      profile.sampleRange = this.$("#hmSamples").value.trim().toUpperCase();
      profile.percentEncoding = this.$("#hmPercent").value || null;
      profile.explicitLimits = this.$("#hmExplicit").checked;
      for (const input of this.root.querySelectorAll("[data-hm-binding]"))
        profile.bindings[input.dataset.hmBinding] = input.value
          .trim()
          .toUpperCase();
      for (const input of this.root.querySelectorAll("[data-hm-header-cell]"))
        profile.header[input.dataset.hmHeaderCell] = input.value
          .trim()
          .toUpperCase();
      this.mapping = profile;
      this.preview = await previewHomologation(this.importWorkbook, profile);
      this.renderPreview();
    });
    this.$("#hmCancelImport").onclick = this.action(() => {
      this.importWorkbook = null;
      this.preview = null;
      this.renderEditor();
    });
  }
  renderPreview() {
    this.view = "preview";
    this.title("Homologación · Vista previa");
    const p = this.preview;
    this.root.innerHTML = `<h1 class="home-title">Vista previa</h1><section class="av-card"><p>${esc(p.original.name)} · hoja ${esc(p.mapping.sheetName)} · ${p.characteristics.length} características</p>${this.reusedProfile && this.reusedProfile.structuralSignature !== p.structuralSignature ? '<p class="hm-warning">A9: estructura distinta de la configuración anterior. Revisa las asignaciones.</p>' : ""}<p>Al confirmar, las posiciones seleccionadas se agrupan en esta sesión. Ninguna cabecera es obligatoria.</p><details><summary>Cabecera leída</summary>${HEADER_FIELDS.map(([key, label]) => `<p>${label}: ${esc(p.header[key].value || "Sin dato")} · ${esc(p.header[key].source?.sourceCell || "sin celda")}</p>`).join("")}</details>${p.characteristics
      .map((c) => {
        const r = evaluateCharacteristic(c);
        return `<article class="av-card"><strong>${esc(c.sourceIdentifier || "Sin ID · posición " + c.sourcePosition)}</strong><p>${esc(c.originalType)} · ${esc(c.specification)}</p><p>Origen ${esc(c.sourceSheet)}!${esc(c.sourceCell)} · ${c.samples.length} posiciones · ${r.nValid} válidas</p><p>${r.rule?.valid ? `Límites ${esc(r.rule.lower)} a ${esc(r.rule.upper)}` : c.type === "attribute" ? "Atributo" : esc(r.rule?.reason)}</p>${c.warnings.map((w) => `<p class="hm-warning">${esc(w.code)}: ${esc(w.message)}</p>`).join("")}</article>`;
      })
      .join(
        "",
      )}<button id="hmConfirm" class="primary">Confirmar mapeo e importar en esta sesión</button><button id="hmRevise">Revisar mapeo</button></section>`;
    this.$("#hmRevise").onclick = this.action(() => this.renderMapping());
    this.$("#hmConfirm").onclick = this.action(async () => {
      this.draft = await this.store.confirmImport(this.draft, this.preview);
      this.importWorkbook = null;
      this.preview = null;
      this.dirty = false;
      this.step = 2;
      this.renderEditor();
      this.say(
        "Original y características guardados tras confirmar la vista previa.",
      );
    });
  }
  changed() {
    this.dirty = true;
    this.edits++;
    this.updateResults();
    const status = this.$("#hmSaveStatus");
    if (status) status.textContent = "Cambios pendientes";
    clearTimeout(this.timer);
    this.timer = setTimeout(
      () => this.perform(() => this.flush()).catch((e) => this.fail(e)),
      600,
    );
  }
  capture() {
    const d = structuredClone(this.draft);
    if (this.view !== "editor") return d;
    for (const n of this.root.querySelectorAll("[data-hm-header]"))
      d.header[n.dataset.hmHeader] = {
        ...d.header[n.dataset.hmHeader],
        value: n.value,
      };
    for (const n of this.root.querySelectorAll("[data-hm-sample]")) {
      const c = d.characteristics.find(
          (c) => c.internalKey === n.dataset.hmChar,
        ),
        sample = c?.samples.find((s) => s.id === n.dataset.hmSample);
      if (sample && sample.value !== n.value) {
        sample.value = n.value;
        sample.author = "Acceso local provisional";
        sample.recordedAt = new Date().toISOString();
      }
    }
    return d;
  }
  updateResults() {
    const d = this.capture();
    for (const c of d.characteristics) {
      const r = evaluateCharacteristic(c);
      for (let i = 0; i < c.samples.length; i++) {
        const node = this.$(`[data-hm-result="${c.samples[i].id}"]`);
        if (node) {
          node.textContent = sampleLabels[r.samples[i].status];
          node.className = "hm-state " + r.samples[i].status;
        }
      }
      const count = this.$(`[data-hm-count="${c.internalKey}"]`);
      if (count)
        count.textContent = `${r.conformity} · ${r.nValid} válidas · ${r.counts.conforming} conformes`;
    }
  }
  async saveDraft() {
    clearTimeout(this.timer);
    if (!this.draft || !this.dirty) return;
    const version = this.edits,
      next = this.capture();
    const saved = await this.store.save(next);
    this.draft = saved;
    this.dirty = this.edits !== version;
    const status = this.$("#hmSaveStatus");
    if (status)
      status.textContent = this.dirty
        ? "Cambios pendientes"
        : "Guardado en este dispositivo";
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
    if (["mapping", "preview"].includes(this.view)) {
      this.importWorkbook = null;
      this.preview = null;
      this.renderEditor();
      return true;
    }
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
  async list() {
    this.view = "list";
    this.draft = null;
    this.title("Homologaciones · Sesiones");
    const rows = await this.store.list();
    this.root.innerHTML = `<h1 class="home-title">Sesiones guardadas</h1><section class="av-card"><label>Buscar<input id="hmSearch" placeholder="Código, descripción o proveedor"></label></section><div id="hmList"></div>`;
    const render = () => {
      const text = this.$("#hmSearch")
          .value.normalize("NFD")
          .replace(/\p{M}/gu, "")
          .toLowerCase(),
        found = rows.filter((d) =>
          ["code", "description", "supplier"]
            .map((k) => d.header[k]?.value || "")
            .join(" ")
            .normalize("NFD")
            .replace(/\p{M}/gu, "")
            .toLowerCase()
            .includes(text),
        );
      this.$("#hmList").innerHTML =
        found
          .map(
            (d) =>
              `<button class="av-draft av-card" data-hm-open="${esc(d.id)}"><strong>${esc(d.header.description?.value || d.source?.name || "Sesión sin completar")}</strong><span>${esc(d.header.code?.value || "Código sin indicar")} · ${d.characteristics.length} características</span><small>${date(d.updatedAt)} · Aprobación pendiente</small></button>`,
          )
          .join("") ||
        '<section class="av-card">No hay sesiones para esta búsqueda.</section>';
      this.root
        .querySelectorAll("[data-hm-open]")
        .forEach(
          (b) =>
            (b.onclick = this.action(() => this.openDraft(b.dataset.hmOpen))),
        );
    };
    this.$("#hmSearch").oninput = render;
    render();
  }
}
