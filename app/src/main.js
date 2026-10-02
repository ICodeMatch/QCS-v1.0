import { CodeMatchStore } from "./codematch-store.js";
import { Vault } from "./vault.js";
import { decimal, sum, pair, within } from "./decimal.js";
import { nativePhotos, reduced } from "./photos.js";
import { App } from "@capacitor/app";
import { download } from "./files.js";
import { Capacitor } from "@capacitor/core";
import ExcelJS from "exceljs";
const vault = new Vault(),
  root = document.querySelector("#app"),
  $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const say = (s) => ($("#status").textContent = s);
let records = [],
  editing = null,
  screen = "login",
  restored = null,
  saveTimer = null,
  queue = Promise.resolve();
function button(id, text, primary = false) {
  return `<button id="${id}" ${primary ? 'class="primary"' : ""}>${text}</button>`;
}
function field(id, label, value = "", type = "text") {
  return `<label>${label}<input id="${id}" type="${type}" value="${esc(value)}" ${type === "password" ? 'autocomplete="current-password"' : ""}></label>`;
}
function run(fn) {
  const next = queue.then(async () => {
    try {
      await fn();
    } catch (e) {
      say(
        e.message || "No se pudo completar. Los datos guardados se conservan.",
      );
    }
  });
  queue = next;
  return next;
}
function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || ""}</svg>`;
}
const iconPaths = {"home":"<path d=\"m3 10 9-7 9 7\"/><path d=\"M5 9v12h5v-7h4v7h5V9\"/>","records":"<path d=\"M6 3h8l4 4v14H6z\"/><path d=\"M14 3v5h4M9 12h6M9 16h6\"/>","settings":"<path d=\"m10 3-.5 3-2 1-2.5-1-2 3 2 2v2l-2 2 2 3 2.5-1 2 1 .5 3h4l.5-3 2-1 2.5 1 2-3-2-2v-2l2-2-2-3-2.5 1-2-1-.5-3z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","aviso":"<path d=\"m12 3 10 18H2z\"/><path d=\"M12 9v5M12 17v.1\"/>","people":"<circle cx=\"12\" cy=\"7\" r=\"3\"/><path d=\"M6 21v-3a6 6 0 0 1 12 0v3zM5 5a3 3 0 0 0 0 6M19 5a3 3 0 0 1 0 6M4 14a5 5 0 0 0-3 5v2h3M20 14a5 5 0 0 1 3 5v2h-3\"/>","chart":"<path d=\"M2 21h20M4 21V13h4v8M10 21V8h4v13M16 21V3h4v18\"/>","project":"<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"/><path d=\"M8 7h8M8 12h8M8 17h4\"/>","scan":"<path d=\"M2 7V3h4M18 3h4v4M22 17v4h-4M6 21H2v-4M6 8v8M10 8v8M14 8v8M18 8v8\"/>","chevron":"<path d=\"m9 5 7 7-7 7\"/>"};
function setScreen(s) {
  clearTimeout(saveTimer);
  screen = s;
  $("#back").hidden = s === "login" || s === "home";
  $("#lock").hidden = s === "login";
  document.body.dataset.screen = s;
  const title = $(".brand-title");
  if (title) title.textContent = s === "home" || s === "login" ? "Quality Control Suite" : s === "settings" ? "Ajustes" : "CodeMatch";
  const nav = $("#bottomnav");
  if (nav) {
    nav.hidden = s === "login";
    const active = s === "home" ? "home" : s === "settings" ? "settings" : "records";
    nav.querySelectorAll("button").forEach(b => {
      const selected = b.dataset.nav === active;
      b.classList.toggle("active", selected);
      if (selected) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }
  if ($("#settingsTop")) $("#settingsTop").hidden = s === "login";
  window.scrollTo(0, 0);
}
async function refresh() {
  records = (await vault.list())
    .filter((r) => r.kind === "code")
    .sort((a, b) => a.code.localeCompare(b.code, "es"));
}
function login() {
  setScreen("login");
  records = [];
  editing = null;
  root.innerHTML = `<section class="login-panel"><img class="brand-mark brand-mark-large" src="assets/qcs-logo.svg" alt="Logo QCS"><h1>Quality Control Suite</h1><p class="login-subtitle">Gestión de la calidad</p><section class="login-form"><h2>Bienvenido</h2><label>Contraseña<div class="password-row"><input id="password" type="password" autocomplete="current-password"><button id="passwordEye" class="password-eye" aria-label="Mostrar contraseña"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></div></label><small class="password-hint">Al crearla: mínimo 8 caracteres.</small><label class="remember"><input type="checkbox" disabled> Recordarme <span class="badge">Pendiente</span></label>${button("enter", "Entrar", true)}<p class="forgot-row">${button("forgot", "¿Has olvidado la contraseña?")}</p></section><p class="login-caption">Acceso a Quality Control Suite</p><details class="access-note"><summary>Acceso local provisional · QCS Prueba</summary><p>Los datos nuevos se guardan cifrados en este dispositivo. No acredita identidad ni permisos de empresa. Recuperación pendiente: conserva la contraseña; no existe restablecimiento automático.</p></details><small class="build-label">QCS Prueba Diseño · 0.1.3 · Diseño 02/10/2026</small></section>`;
  $("#passwordEye").onclick = () => {
    const p = $("#password");
    p.type = p.type === "password" ? "text" : "password";
    $("#passwordEye").setAttribute("aria-label", p.type === "password" ? "Mostrar contraseña" : "Ocultar contraseña");
  };
  $("#enter").onclick = () =>
    run(async () => {
      await vault.unlock($("#password").value);
      await refresh();
      home();
      say("Acceso local abierto. Guardado en el dispositivo.");
      if (restored)
        say(
          "Hay una captura recuperada pendiente. Abre su ficha para revisarla.",
        );
    });
  $("#forgot").onclick = () =>
    say(
      "Recuperación pendiente: conserva la contraseña y las copias. No hay restablecimiento destructivo.",
    );
}
function home() {
  setScreen("home");
  const modules = [
    ["aviso", "No conformidades", "Incidencias y acciones correctivas", "orange"],
    ["people", "Homologaciones", "Piezas y proveedores", "blue"],
    ["chart", "Herramientas de calidad", "Cp · Cpk · Pp · Ppk · Cm · Cmk", "teal"],
    ["project", "Proyectos de calidad", "Acciones y seguimiento", "purple"],
    ["scan", "CodeMatch", "Identificación de piezas", "teal"],
  ];
  root.innerHTML = `<h1 class="home-title">Inicio</h1><p class="home-subtitle">Selecciona un apartado</p><div class="module-list">${modules.map(([symbol,title,subtitle,color],i) => `<button ${i === 4 ? 'id="open"' : 'disabled'} class="module-card"><span class="module-icon ${color}">${icon(symbol)}</span><span class="module-copy"><strong>${title}</strong><span>${subtitle}</span>${i === 4 ? "" : '<small class="pending-label">Pendiente</small>'}</span><span class="module-chevron">${icon("chevron")}</span></button>`).join("")}</div><p class="build-label">QCS Prueba Diseño · 0.1.3 · Diseño 02/10/2026</p>`;
  $("#open").onclick = () => codeMatch();
}
const cmStore = new CodeMatchStore(vault);
function codeMatch(startView="search") {
  setScreen("codematch");
  const checked = () => { if(!vault.key) throw Error("Abre primero el acceso QCS."); };
  window.qcsCodeMatchBridge = {
    startView,
    all: async store => {checked();return cmStore.all(store);},
    get: async (store,key) => {checked();return cmStore.get(store,key);},
    put: async (store,value) => {
      checked();const clean={...value};delete clean.blob;
      if(clean.file instanceof Blob){clean.fileData=await blobData(clean.file);delete clean.file;}
      return cmStore.put(store,clean);
    },
    bulkPutRecords: async values => {checked();return cmStore.bulkPutRecords(values);},
    retireAttachment: async value => {checked();return cmStore.retireAttachment(value);},
    download,
    photos: async camera => {
      checked();
      if(camera && Capacitor.isNativePlatform()){
        const code=$("#codematchFrame").contentDocument.querySelector("#recordCode").value;
        const record=await cmStore.get("records",code),pending=await vault.get("capture-pending");
        await vault.write("meta","cameraResult",null);restored=null;
        await vault.put("capture-pending",{...pending,id:"capture-pending",kind:"capture",recordId:record.id,completed:false});
      }
      return nativePhotos(camera);
    },
    finishCapture,
    home: async () => {await prepareCodeMatchLeave();await refresh();home();},
    settings: async () => {await prepareCodeMatchLeave();await refresh();settings();},
  };
  root.innerHTML='<iframe id="codematchFrame" title="CodeMatch" src="codematch/index.html"></iframe>';
  const frame=$("#codematchFrame");
  frame.onload=()=>{
    if(startView!=="search") frame.contentWindow.addEventListener("qcs-ready",()=>frame.contentWindow.qcsCodeMatch.navigate(startView),{once:true});
  };
}
async function blobData(blob){
  return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});
}
async function prepareCodeMatchLeave(){
  if(screen==="codematch")await $("#codematchFrame")?.contentWindow.qcsCodeMatch?.prepareLeave();
}
function settings() {
  setScreen("settings");
  root.innerHTML = `<h1>Ajustes</h1><section class="card"><h2>Copias y recuperación</h2><div class="actions">${button("backup", "Descargar copia cifrada")}${button("restore", "Recuperar copia de esta entrega")}${button("recoverPhoto", "Revisar captura recuperada")}</div><input id="backupFile" type="file" accept=".json" hidden><p>Esta versión se instala aparte. No modifica ni migra datos de instalaciones anteriores. Solo recupera copias cifradas de esta entrega.</p></section><section class="card"><h2>Acceso local</h2><p>Recuperación de contraseña y Recordarme pendientes.</p>${button("lockSettings", "Bloquear acceso")}</section><p class="build-label">QCS Prueba Diseño · 0.1.3 · Diseño 02/10/2026</p>`;
  $("#lockSettings").onclick = () => $("#lock").click();
  $("#restore").onclick = () => $("#backupFile").click();
  $("#backupFile").onchange = (e) =>
    run(() => restorePreview(e.target.files[0]));
  $("#recoverPhoto").onclick = () => run(recoverPhoto);
  $("#backup").onclick = () =>
    run(async () => {
      await download(
        JSON.stringify(await vault.backup()),
        "qcs-copia-cifrada.json",
        "application/json",
      );
      say(
        "Copia cifrada preparada para guardar. Comprueba el archivo en el destino y conserva también tus copias anteriores.",
      );
    });
}
function library() {
  setScreen("library");
  root.innerHTML = `<h1>CodeMatch</h1><div class="actions">${button("new", "Nuevo código", true)}${button("measure", "Buscar por medidas")}${button("import", "Importar Excel / CSV")}${button("export", "Exportar Excel")}</div>${field("text", "Buscar por código o Denominación")}<p id="count"></p><div id="list"></div><input type="file" id="importfile" accept=".xlsx,.csv" hidden>`;
  $("#new").onclick = () =>
    editor({
      kind: "code",
      id: crypto.randomUUID(),
      code: "",
      name: "",
      photos: [],
      history: [],
    });
  $("#measure").onclick = search;
  $("#text").oninput = list;
  $("#export").onclick = () => run(exportExcel);
  $("#import").onclick = () => $("#importfile").click();
  $("#importfile").onchange = (e) =>
    run(() => previewImport(e.target.files[0]));
  list();
}
function list() {
  const q = $("#text")
    .value.normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  const rows = records.filter((r) =>
    (r.code + " " + r.name)
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .includes(q),
  );
  $("#count").textContent = `${rows.length} de ${records.length} códigos`;
  $("#list").innerHTML = rows.length
    ? rows
        .map(
          (r) =>
            `<article class="card"><h2>${esc(r.code)}</h2><p>${esc(r.name || "Denominación no indicada")}</p><span class="badge">${r.photos?.length || 0} fotos</span> <button data-code="${esc(r.id)}">Abrir ficha</button></article>`,
        )
        .join("")
    : "<p>No hay códigos. Crea uno o importa tu catálogo.</p>";
  document
    .querySelectorAll("[data-code]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          editor(
            structuredClone(records.find((r) => r.id === b.dataset.code)),
          )),
    );
}
const measures = [
  ["developedLength", "Desarrollo: largo"],
  ["developedWidth", "Desarrollo: ancho"],
  ["foldedLength", "Plegada: largo"],
  ["foldedWidth", "Plegada: ancho"],
  ["foldedHeight", "Plegada: alto"],
  ["thickness", "Espesor"],
];
function editor(r) {
  editing = r;
  setScreen("editor");
  root.innerHTML = `<h1>Ficha del código</h1><div class="grid">${field("code", "Código", r.code)}${field("name", "Denominación", r.name)}${measures.map(([id, label]) => field(id, label + " (mm)", r[id])).join("")}${field("notes", "Notas", r.notes)}</div><div class="actions">${button("save", "Guardar ficha", true)}${button("return", "Volver a biblioteca")}</div><h2>Fotografías de referencia</h2><p>Copia reducida para ver la pieza. No se usa para medir ni identificar automáticamente. Política piloto: lado mayor 1.280 px, JPEG 0,72.</p><div class="actions">${button("camera", "Hacer foto")}${button("gallery", "Elegir de la galería")}</div><input id="photoFile" type="file" accept="image/*" multiple hidden><div id="photos" class="grid"></div><p>La sustitución y retirada conservan la foto anterior en el historial cifrado.</p><h2>Planos PDF</h2><div id="plans"></div>${button("attachPlan", "Añadir plano PDF")}<input id="planFile" type="file" accept="application/pdf,.pdf" hidden>`;
  document.querySelectorAll("#app > .grid input").forEach(
    (input) =>
      (input.oninput = () => {
        clearTimeout(saveTimer);
        say("Cambios pendientes de guardar…");
        const id = editing.id;
        saveTimer = setTimeout(
          () =>
            run(async () => {
              if (screen === "editor" && editing.id === id) await save();
            }),
          400,
        );
      }),
  );
  $("#save").onclick = () => run(() => save());
  $("#return").onclick = () =>
    run(async () => {
      await save();
      library();
    });
  $("#camera").onclick = () => run(() => addPhotos(true));
  $("#gallery").onclick = () => run(() => addPhotos(false));
  $("#photoFile").onchange = (e) =>
    run(async () => {
      const added = [];
      for (const f of e.target.files) added.push(await reduced(f));
      await persistPhotos(added);
    });
  renderPhotos();
  renderPlans();
  $("#attachPlan").onclick = () =>
    run(async () => {
      await save();
      $("#planFile").click();
    });
  $("#planFile").onchange = (e) => run(() => addPlan(e.target.files[0]));
}
function collect() {
  const r = structuredClone(editing);
  r.code = $("#code").value.trim();
  r.name = $("#name").value.trim();
  r.notes = $("#notes").value;
  for (const [id] of measures) {
    const v = $("#" + id).value.trim();
    if (v) decimal(v);
    r[id] = v || null;
  }
  if (!r.code) throw Error("Escribe primero el código.");
  if (records.some((x) => x.code === r.code && x.id !== r.id))
    throw Error("Este código ya existe. Abre su ficha.");
  return r;
}
async function save() {
  clearTimeout(saveTimer);
  const r = collect(),
    old = await vault.get(r.id);
  r.updatedAt = new Date().toISOString();
  r.history = [
    ...(old?.history || r.history || []),
    {
      at: r.updatedAt,
      operation: "save",
      previous: old
        ? {
            code: old.code,
            name: old.name,
            ...Object.fromEntries(measures.map(([id]) => [id, old[id]])),
          }
        : null,
    },
  ];
  await vault.put(r.id, r);
  editing = r;
  await refresh();
  say("Ficha guardada en el dispositivo.");
}
async function addPhotos(camera) {
  await save();
  if (camera && Capacitor.isNativePlatform()) {
    await vault.write("meta", "cameraResult", null);
    restored = null;
    const pending = await vault.get("capture-pending");
    await vault.put("capture-pending", {
      ...pending,
      id: "capture-pending",
      kind: "capture",
      recordId: editing.id,
      completed: false,
    });
  }
  const native = await nativePhotos(camera);
  if (native) {
    await persistPhotos(native);
    if (camera) await finishCapture();
    return;
  }
  const input = $("#photoFile");
  input.multiple = !camera;
  if (camera) input.setAttribute("capture", "environment");
  else input.removeAttribute("capture");
  input.click();
}
async function persistPhotos(added) {
  const r = structuredClone(editing);
  r.photos = [
    ...(r.photos || []),
    ...added.map((p) => ({
      ...p,
      id: crypto.randomUUID(),
      label: "",
      comment: "",
      at: new Date().toISOString(),
    })),
  ];
  await vault.put(r.id, r);
  editing = r;
  await refresh();
  renderPhotos();
  say(`${added.length} fotos guardadas en el dispositivo.`);
}
function renderPhotos() {
  const rows = editing.photos || [];
  $("#photos").innerHTML = rows
    .map(
      (p, i) =>
        `<article class="card photo"><img src="${esc(p.data)}" alt="Vista ${i + 1} de la pieza">${field("label-" + i, "Vista " + (i + 1), p.label)}${field("comment-" + i, "Comentario", p.comment)}<div class="actions"><button data-up="${i}" ${i === 0 ? "disabled" : ""}>Subir</button><button data-down="${i}" ${i === rows.length - 1 ? "disabled" : ""}>Bajar</button><button data-remove="${i}">Quitar</button><button data-replace="${i}">Sustituir</button></div></article>`,
    )
    .join("");
  rows.forEach((p, i) => {
    for (const [prefix, key] of [
      ["label", "label"],
      ["comment", "comment"],
    ])
      $("#" + prefix + "-" + i).onchange = () =>
        run(async () => {
          const r = structuredClone(editing);
          r.photos[i][key] = $("#" + prefix + "-" + i).value;
          await vault.put(r.id, r);
          editing = r;
          say("Texto de foto guardado.");
        });
  });
  for (const action of ["up", "down", "remove", "replace"])
    document.querySelectorAll("[data-" + action + "]").forEach(
      (b) =>
        (b.onclick = () =>
          run(async () => {
            const i = Number(b.dataset[action]),
              r = structuredClone(editing);
            if (action === "remove") {
              if (
                !confirm(
                  "¿Retirar esta foto? Se conservará en el historial cifrado.",
                )
              )
                return;
              r.retiredPhotos = [...(r.retiredPhotos || []), r.photos[i]];
              r.photos.splice(i, 1);
            } else if (action === "replace") {
              if (
                !confirm(
                  "¿Sustituir esta foto? La anterior se conserva hasta guardar la nueva y en el historial.",
                )
              )
                return;
              const picker = document.createElement("input");
              picker.type = "file";
              picker.accept = "image/*";
              picker.onchange = () =>
                run(async () => {
                  if (!picker.files.length) return;
                  const fresh = await reduced(picker.files[0]),
                    next = structuredClone(editing),
                    old = next.photos[i];
                  next.retiredPhotos = [...(next.retiredPhotos || []), old];
                  next.photos[i] = {
                    ...old,
                    ...fresh,
                    at: new Date().toISOString(),
                  };
                  await vault.put(next.id, next);
                  editing = next;
                  await refresh();
                  renderPhotos();
                  say("Foto sustituida; anterior conservada.");
                });
              picker.click();
              return;
            } else {
              const j = i + (action === "up" ? -1 : 1);
              [r.photos[i], r.photos[j]] = [r.photos[j], r.photos[i]];
            }
            await vault.put(r.id, r);
            editing = r;
            await refresh();
            renderPhotos();
            say("Cambio de foto guardado.");
          })),
    );
}
async function addPlan(file) {
  if (!file) return;
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (new TextDecoder().decode(header) !== "%PDF-")
    throw Error("El archivo no es un PDF reconocible.");
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const r = structuredClone(editing);
  r.plans = [
    ...(r.plans || []),
    {
      id: crypto.randomUUID(),
      name: file.name,
      data,
      at: new Date().toISOString(),
    },
  ];
  await vault.put(r.id, r);
  editing = r;
  await refresh();
  renderPlans();
  say("Plano original guardado en el dispositivo.");
}
function renderPlans() {
  const node = $("#plans");
  if (!node) return;
  node.innerHTML =
    (editing.plans || [])
      .map(
        (p, i) =>
          `<p>${esc(p.name)} <button data-plan="${i}">Abrir / guardar plano</button></p>`,
      )
      .join("") || "<p>Sin planos.</p>";
  node.querySelectorAll("[data-plan]").forEach(
    (b) =>
      (b.onclick = () =>
        run(async () => {
          const p = editing.plans[Number(b.dataset.plan)],
            blob = await (await fetch(p.data)).blob();
          await download(await blob.arrayBuffer(), p.name, "application/pdf");
          say(
            "Plano preparado para abrir o guardar con el visor del dispositivo.",
          );
        })),
  );
}
function search() {
  setScreen("search");
  root.innerHTML = `<h1>Identificar pieza</h1><details class="search-note"><summary>Criterio de comparación</summary><p>Comparación decimal inclusiva. Ambos bloques se combinan con Y; orientación independiente por bloque (perfil provisional visible).</p></details><fieldset><legend>Pieza en desarrollo</legend><label><input id="useDevelopment" type="checkbox" checked> Usar estas medidas</label><div class="grid">${field("developmentLength", "Largo (mm)")}${field("developmentWidth", "Ancho (mm)")}</div><p id="estimated"></p></fieldset><fieldset><legend>Pieza plegada</legend><label><input id="useFolded" type="checkbox"> Usar estas medidas</label><div class="grid">${field("foldedLength", "Largo (mm)")}${field("foldedWidth", "Ancho (mm)")}${field("foldedHeight", "Alto (mm)")}</div>${button("sum", "Sumar tramos para estimar desarrollo")}</fieldset><div class="grid">${field("tol", "Tolerancia vigente", 5)}<label>Unidad de tolerancia<select id="tolmode"><option value="mm">± mm</option><option value="percent">% de cada medida buscada</option></select></label></div><div class="actions">${button("find", "Buscar coincidencias", true)}${button("library", "Biblioteca")}</div><div id="results"></div>`;
  $("#sum").onclick = sumDialog;
  $("#library").onclick = library;
  $("#find").onclick = () =>
    run(async () => {
      const tol = $("#tol").value,
        percent = $("#tolmode").value === "percent";
      decimal(tol);
      const blocks = [];
      if ($("#useDevelopment").checked)
        blocks.push({
          mode: "developed",
          q: [$("#developmentLength").value, $("#developmentWidth").value],
        });
      if ($("#useFolded").checked)
        blocks.push({
          mode: "folded",
          q: [$("#foldedLength").value, $("#foldedWidth").value],
          h: $("#foldedHeight").value,
        });
      const active = blocks.filter(
        (b) => b.q.some((x) => x.trim()) || b.h?.trim(),
      );
      if (!active.length)
        throw Error("Introduce y activa al menos una medida.");
      for (const b of active) {
        b.q.filter((x) => x.trim()).forEach(decimal);
        if (b.h?.trim()) decimal(b.h);
      }
      const out = records.map((r) => {
        const states = active.map((b) => {
          let state = pair(
            [r[b.mode + "Length"], r[b.mode + "Width"]],
            b.q,
            tol,
            percent,
          );
          if (b.h?.trim()) {
            if (r.foldedHeight == null || r.foldedHeight === "") {
              if (state !== "Descartada") state = "No evaluable";
            } else if (!within(r.foldedHeight, b.h, tol, percent))
              state = "Descartada";
          }
          return state;
        });
        const state = states.includes("Descartada")
          ? "Descartada"
          : states.includes("No evaluable")
            ? "No evaluable"
            : "Coincidencia";
        return { r, state };
      });
      $("#results").innerHTML = ["Coincidencia", "No evaluable", "Descartada"]
        .map(
          (state) =>
            `<h2>${state} · ${out.filter((x) => x.state === state).length}</h2>${out
              .filter((x) => x.state === state)
              .map(
                ({ r }) =>
                  `<div class="card">${esc(r.code)} · ${esc(r.name)}</div>`,
              )
              .join("")}`,
        )
        .join("");
    });
}
function sumDialog() {
  const d = document.createElement("dialog");
  d.innerHTML = `<h2>Sumar cotas</h2><p>Ocho celdas; las vacías se ignoran. Sin descuentos. Estima el desarrollo; no cambia las medidas plegadas.</p><div class="sum">${Array.from({ length: 8 }, (_, i) => `<label class="sum-cell">Cota ${i + 1}<span><input aria-label="Celda ${i + 1}" inputmode="decimal"><small>mm</small></span></label>`).join("")}</div><div class="sum-total">Total aproximado: <strong id="sumvalue"></strong><span>mm</span></div><label>Aplicar al desarrollo<select id="sumtarget"><option value="">Elegir destino</option><option value="developmentLength">Largo</option><option value="developmentWidth">Ancho</option></select></label><div class="actions">${button("clearSum", "Borrar cotas")}${button("applysum", "Usar este total", true)} ${button("closesum", "Cancelar")}</div>`;
  document.body.append(d);
  const inputs = [...d.querySelectorAll("input")];
  const update = () => {
    let valid = true;
    for (const x of inputs) {
      try {
        if (x.value.trim()) decimal(x.value);
        x.removeAttribute("aria-invalid");
      } catch {
        x.setAttribute("aria-invalid", "true");
        valid = false;
      }
    }
    d.querySelector("#sumvalue").textContent = valid
      ? sum(inputs.map((x) => x.value))
      : "Corrige las celdas señaladas: solo números no negativos.";
    d.querySelector("#applysum").disabled =
      !valid ||
      !inputs.some((x) => x.value.trim()) ||
      !d.querySelector("#sumtarget").value;
  };
  inputs.forEach((x) => (x.oninput = update));
  d.querySelector("#sumtarget").onchange = update;
  d.querySelector("#clearSum").onclick = () => { inputs.forEach(x => x.value = ""); update(); };
  d.querySelector("#applysum").onclick = () => {
    const dest = $("#" + d.querySelector("#sumtarget").value);
    if (
      dest.value &&
      !confirm("¿Sustituir la medida del desarrollo por el sumatorio?")
    )
      return;
    dest.value = sum(inputs.map((x) => x.value));
    $("#useDevelopment").checked = true;
    $("#estimated").textContent =
      "Desarrollo estimado por suma de tramos, sin descuentos.";
    d.close();
    d.remove();
  };
  d.querySelector("#closesum").onclick = () => {
    d.close();
    d.remove();
  };
  update();
  d.showModal();
}
async function exportExcel() {
  const book = new ExcelJS.Workbook(),
    sheet = book.addWorksheet("Catálogo");
  const keys = ["code", "name", ...measures.map((x) => x[0]), "notes"];
  sheet.addRow([
    "Código",
    "Denominación",
    ...measures.map((x) => x[1]),
    "Notas",
  ]);
  for (const r of records) sheet.addRow(keys.map((k) => String(r[k] ?? "")));
  await download(
    await book.xlsx.writeBuffer(),
    "qcs-catalogo.xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  say(
    "Catálogo exportado; identificadores y valores exactos como texto. Fotos en la copia cifrada.",
  );
}
async function restorePreview(file) {
  if (!file) return;
  const backup = JSON.parse(await file.text());
  root.innerHTML = `<h1>Recuperar copia cifrada QCS</h1><p>Solo añade códigos nuevos. No sustituye ni borra los existentes.</p>${field("backupPassword", "Contraseña de la copia", "", "password")}${button("inspectBackup", "Comprobar copia", true)} ${button("cancelBackup", "Cancelar")}`;
  $("#cancelBackup").onclick = home;
  $("#inspectBackup").onclick = () =>
    run(async () => {
      const all = await vault.inspectBackup(backup, $("#backupPassword").value),
        existing = await vault.list(),
        ids = new Set(existing.map((v) => v.id)),
        codes = new Set(records.map((v) => v.code)),
        fresh = all.filter((v) => ["code","codematch"].includes(v.kind) && !ids.has(v.id));
      for (const v of fresh) {
        if(v.kind==="codematch"){if(!v.store||!v.value)throw Error("Copia incompatible.");continue;}
        if (!v.code || !Array.isArray(v.photos) || codes.has(v.code))
          throw Error(
            "Código repetido o estructura incompatible: no se ha recuperado nada.",
          );
        codes.add(v.code);
      }
      root.innerHTML = `<h1>Copia comprobada</h1><p>${fresh.length} códigos nuevos; ${all.filter((v) => v.kind === "code").length - fresh.length} ya existentes, sin sustituir.</p>${button("applyBackup", "Añadir códigos de la copia", true)} ${button("cancelBackup", "Cancelar")}`;
      $("#cancelBackup").onclick = home;
      $("#applyBackup").onclick = () =>
        run(async () => {
          if (
            !confirm(
              "¿Añadir los códigos comprobados? Los existentes no cambian.",
            )
          )
            return;
          await vault.createMany(fresh);
          await refresh();
          home();
          say("Copia recuperada sin sustituir datos existentes.");
        });
    });
}
async function finishCapture() {
  const pending = await vault.get("capture-pending");
  if (pending) {
    pending.completed = true;
    await vault.put("capture-pending", pending);
  }
  await vault.write("meta", "cameraResult", null);
  restored = null;
}
async function recoverPhoto() {
  const pending = await vault.get("capture-pending"),
    result = restored || (await vault.read("meta", "cameraResult"));
  if (!pending || pending.completed || !result?.webPath)
    throw Error("No hay una captura recuperada disponible.");
  const record = await vault.get(pending.recordId);
  if (!record) throw Error("La ficha de origen no está disponible.");
  if (!confirm("¿Añadir la captura recuperada a su ficha guardada?")) return;
  const photo = await reduced(await (await fetch(result.webPath)).blob());
  editor(record);
  await persistPhotos([photo]);
  await finishCapture();
}
function csv(s) {
  const rows = [];
  let row = [],
    v = "",
    quoted = false;
  const delim = s.split("\n")[0].includes(";") ? ";" : ",";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') {
      if (quoted && s[i + 1] === '"') {
        v += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && c === delim) {
      row.push(v);
      v = "";
    } else if (!quoted && c === "\n") {
      row.push(v.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      v = "";
    } else v += c;
  }
  if (quoted) throw Error("CSV con comillas sin cerrar.");
  if (v || row.length) {
    row.push(v.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}
async function previewImport(file) {
  if (!file) return;
  let rows;
  if (file.name.toLowerCase().endsWith(".csv"))
    rows = csv((await file.text()).replace(/^\uFEFF/, ""));
  else {
    const b = new ExcelJS.Workbook();
    await b.xlsx.load(await file.arrayBuffer());
    if (b.worksheets.length !== 1)
      throw Error(
        "Esta primera entrega importa una hoja. Prepara un libro de una hoja sin modificar el original.",
      );
    rows = [];
    b.worksheets[0].eachRow((r) =>
      rows.push(
        r.values.slice(1).map((v) => {
          if (v && typeof v === "object")
            throw Error(
              "La importación inicial requiere valores literales, sin fórmulas ni objetos.",
            );
          return String(v ?? "");
        }),
      ),
    );
  }
  if (rows.length < 2) throw Error("El archivo no tiene cabecera y datos.");
  const header = rows[0];
  root.innerHTML = `<h1>Vista previa de importación</h1><p>${esc(file.name)} · ${rows.length - 1} filas. No se sustituye ningún código existente.</p>${["code", "name", ...measures.map((x) => x[0])].map((key, i) => `<label>${esc(key)}<select data-map="${key}"><option value="">No importar</option>${header.map((h, j) => `<option value="${j}" ${i === j ? "selected" : ""}>${esc(h)}</option>`).join("")}</select></label>`).join("")}<pre>${esc(
    rows
      .slice(0, 4)
      .map((r) => r.join(" | "))
      .join("\n"),
  )}</pre>${button("confirmimport", "Importar nuevos códigos", true)} ${button("cancelimport", "Cancelar")}`;
  $("#cancelimport").onclick = library;
  $("#confirmimport").onclick = () =>
    run(async () => {
      const mapping = Object.fromEntries(
        [...document.querySelectorAll("[data-map]")].map((e) => [
          e.dataset.map,
          e.value,
        ]),
      );
      if (mapping.code === "") throw Error("Selecciona la columna del código.");
      const seen = new Set(records.map((r) => r.code)),
        staged = [];
      for (const row of rows.slice(1)) {
        const code = String(row[Number(mapping.code)] ?? "").trim();
        if (!code) continue;
        if (seen.has(code))
          throw Error(
            `Código repetido o existente: ${code}. Importación cancelada sin cambios.`,
          );
        seen.add(code);
        const r = {
          kind: "code",
          id: crypto.randomUUID(),
          code,
          photos: [],
          history: [],
          source: file.name,
        };
        for (const [k, col] of Object.entries(mapping)) {
          if (k === "code") continue;
          const v = col === "" ? "" : String(row[Number(col)] ?? "").trim();
          if (measures.some(([id]) => id === k) && v) decimal(v);
          r[k] = v || null;
        }
        staged.push(r);
      }
      if (!staged.length) throw Error("No hay códigos nuevos.");
      await vault.createMany(staged);
      await refresh();
      library();
      say(`${staged.length} códigos importados. Conserva el archivo original.`);
    });
}
$("#back").onclick = () =>
  run(async () => {
    if (screen === "codematch") {
      const handled=await $("#codematchFrame").contentWindow.qcsCodeMatch?.goBack();
      if(!handled){await refresh();home();}return;
    }
    if (screen === "editor") await save();
    if (screen === "home") return;
    if (screen === "library" || screen === "settings") home();
    else library();
  });
$("#lock").onclick = () =>
  run(async () => {
    if (screen === "editor") await save();
    await prepareCodeMatchLeave();
    vault.lock();
    login();
    say("Acceso bloqueado.");
  });
async function navigateTo(destination) {
  if (screen === "login") return;
  if (screen === "editor") await save();
  await prepareCodeMatchLeave();
  await refresh();
  if (destination === "home") home();
  else if (destination === "settings") settings();
  else codeMatch("library");
}
if ($("#bottomnav")) $("#bottomnav").querySelectorAll("button").forEach(b => {
  b.onclick = () => run(() => navigateTo(b.dataset.nav));
});
if ($("#settingsTop")) $("#settingsTop").onclick = () => run(() => navigateTo("settings"));
const vaultReady = vault.open();
if (Capacitor.isNativePlatform()) {
  App.addListener("backButton", () =>
    $("#back").hidden ? null : $("#back").click(),
  );
  App.addListener("appRestoredResult", (event) => {
    if (
      event.pluginId === "Camera" &&
      event.methodName === "getPhoto" &&
      event.success &&
      event.data?.webPath
    ) {
      restored = { webPath: event.data.webPath };
      vaultReady
        .then(() => vault.write("meta", "cameraResult", restored))
        .catch(() => say("No se pudo conservar el resultado de cámara."));
      say(
        "Captura recuperada: pendiente de revisar después de abrir el acceso.",
      );
    }
  });
}
await vaultReady;
login();
say("Primera entrega en desarrollo · acceso local provisional.");

