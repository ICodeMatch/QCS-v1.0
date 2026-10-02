import "fake-indexeddb/auto";
import test from "node:test";
import assert from "node:assert/strict";
import { Vault, derive, seal, unseal } from "../src/vault.js";
test("cifrado: contraseña errónea, manipulación y carga grande", async () => {
  const salt = crypto.getRandomValues(new Uint8Array(16)),
    a = await derive("contraseña de prueba A", salt),
    b = await derive("contraseña de prueba B", salt),
    source = { photo: "x".repeat(300000) },
    row = await seal(a, source);
  assert.deepEqual(await unseal(a, row), source);
  await assert.rejects(() => unseal(b, row));
  const bad = { ...row, data: row.data.slice(0, -8) + "AAAAAAAA" };
  await assert.rejects(() => unseal(a, bad));
});
test("persistencia, conflicto, creación atómica y copia comprobable", async () => {
  const a = new Vault();
  await a.open();
  await a.unlock("contraseña local de pruebas");
  await a.put("1", {
    kind: "code",
    id: "1",
    code: "01",
    photos: Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      data: "data:image/jpeg;base64,AA==",
      label: "Vista " + i,
    })),
  });
  const first = await a.get("1"),
    second = structuredClone(first);
  first.name = "Nueva";
  await a.put("1", first);
  second.name = "Vieja";
  await assert.rejects(() => a.put("1", second));
  assert.equal((await a.get("1")).name, "Nueva");
  await assert.rejects(() =>
    a.createMany([
      { id: "2", code: "02" },
      { id: "1", code: "01" },
    ]),
  );
  assert.equal(await a.get("2"), null);
  const backup = await a.backup();
  assert.equal(backup.items.length, 1);
  assert(!JSON.stringify(backup).includes("Nueva"));
  const checked = await a.inspectBackup(backup, "contraseña local de pruebas");
  assert.equal(checked[0].photos.length, 6);
  assert.equal(checked[0].photos[5].label, "Vista 5");
  await assert.rejects(() => a.inspectBackup(backup, "otra contraseña"));
  const altered = structuredClone(backup);
  altered.items[0][0] = "other";
  await assert.rejects(() =>
    a.inspectBackup(altered, "contraseña local de pruebas"),
  );
  a.lock();
  await assert.rejects(() => a.unlock("contraseña equivocada"));
  await a.unlock("contraseña local de pruebas");
  assert.equal((await a.get("1")).code, "01");
  a.db.close();
});
