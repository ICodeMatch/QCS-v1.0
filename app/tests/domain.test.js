import test from "node:test";
import assert from "node:assert/strict";
import { decimal, sum, within, pair } from "../src/decimal.js";
test("sumatorio exacto sin descuentos: coma, punto y vacías", () => {
  assert.equal(sum(["1,005", "2", "", "", "", "", "", ""]), "3,005");
  assert.equal(sum(["10", "20", "30", "40", "50", "60", "70", "80"]), "360");
  assert.throws(() => sum(["-1"]));
  assert.throws(() => sum(["12x"]));
});
test("bordes inclusivos sin coma flotante", () => {
  assert(within("5.7", "5.6", "0.1"));
  assert(within("12.1", "12.3", "0.2"));
  assert(!within("5.7001", "5.6", "0.1"));
  assert(within("105", "100", "5", true));
  assert(!within("105.001", "100", "5", true));
});
test("tres estados y orientación parcial", () => {
  assert.equal(pair(["10", "20"], ["20", "10"], "0"), "Coincidencia");
  assert.equal(pair(["10", null], ["10", "20"], "0"), "No evaluable");
  assert.equal(pair(["30", null], ["10", "20"], "0"), "Descartada");
  assert.equal(pair([null, null], ["10", ""], "0"), "No evaluable");
});
test("entrada no finita y notación ajena rechazadas", () => {
  for (const v of ["NaN", "Infinity", "1e3", "-2", "1,2,3"])
    assert.throws(() => decimal(v));
});
