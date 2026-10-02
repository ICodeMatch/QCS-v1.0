import "fake-indexeddb/auto";
import { JSDOM } from "jsdom";
import test from "node:test";
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
const dom = new JSDOM(
  '<button id="back"></button><button id="lock"></button><main id="app"></main><p id="status"></p>',
  { url: "http://localhost" },
);
globalThis.window = dom.window;
globalThis.document = dom.window.document;
window.scrollTo = () => {};
globalThis.confirm = () => true;
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
dom.window.HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
const $ = (s) => document.querySelector(s);
async function until(fn) {
  for (let i = 0; i < 100; i++) {
    if (fn()) return;
    await delay(20);
  }
  throw Error("Tiempo de espera agotado.");
}
test("recorrido de acceso, ficha, búsqueda combinada, suma y reapertura", async () => {
  await import("../src/main.js");
  assert($("#forgot"));
  $("#password").value = "contraseña local interfaz";
  $("#enter").click();
  await until(() => $("#open"));
  assert.match($("#app").textContent, /Pendiente/);
  $("#open").click();
  $("#new").click();
  $("#code").value = "01";
  $("#name").value = "Tubería";
  $("#developedLength").value = "5,6";
  $("#foldedLength").value = "2";
  $("#foldedWidth").value = "2";
  $("#save").click();
  await until(() => $("#status").textContent.includes("Ficha guardada"));
  $("#return").click();
  await until(() => $("#measure"));
  assert.equal($("#count").textContent, "1 de 1 códigos");
  $("#measure").click();
  $("#developmentLength").value = "5,7";
  $("#tol").value = "0,1";
  $("#find").click();
  await until(() => $("#results").textContent.includes("Coincidencia · 1"));
  $("#useFolded").checked = true;
  $("#foldedLength").value = "3";
  $("#find").click();
  await until(() => $("#results").textContent.includes("Descartada · 1"));
  $("#sum").click();
  assert.equal(document.querySelectorAll("dialog input").length, 8);
  assert($("#applysum").disabled);
  $('[aria-label="Celda 1"]').value = "1,005";
  $('[aria-label="Celda 2"]').value = "2";
  $("#sumtarget").value = "developmentWidth";
  $('[aria-label="Celda 1"]').dispatchEvent(new window.Event("input"));
  assert.equal($("#sumvalue").textContent, "3,005");
  $("#applysum").click();
  assert.equal($("#developmentWidth").value, "3,005");
  assert.equal($("#foldedLength").value, "3");
  $("#lock").click();
  await until(() => $("#password"));
  $("#password").value = "contraseña local interfaz";
  $("#enter").click();
  await until(() => $("#open"));
  $("#open").click();
  assert.equal($("#count").textContent, "1 de 1 códigos");
});
