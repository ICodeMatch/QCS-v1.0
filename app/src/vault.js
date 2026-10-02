const enc = new TextEncoder(),
  dec = new TextDecoder();
const b64 = (b) => {
  const a = new Uint8Array(b);
  let s = "";
  for (let i = 0; i < a.length; i += 8192)
    s += String.fromCharCode(...a.subarray(i, i + 8192));
  return btoa(s);
};
const bytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export async function derive(password, salt) {
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
    await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    ),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
export async function seal(key, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return {
    iv: b64(iv),
    data: b64(
      await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(JSON.stringify(value)),
      ),
    ),
  };
}
export async function unseal(key, value) {
  return JSON.parse(
    dec.decode(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: bytes(value.iv) },
        key,
        bytes(value.data),
      ),
    ),
  );
}
export class Vault {
  async open() {
    this.db = await new Promise((resolve, reject) => {
      const r = indexedDB.open("qcs-stage1-vault", 1);
      r.onupgradeneeded = () => {
        r.result.createObjectStore("meta");
        r.result.createObjectStore("items");
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async read(store, key) {
    return new Promise((resolve, reject) => {
      const r = this.db.transaction(store).objectStore(store).get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async write(store, key, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, "readwrite");
      tx.objectStore(store).put(value, key);
      tx.oncomplete = resolve;
      tx.onabort = () => reject(tx.error || new Error("No se pudo guardar."));
      tx.onerror = () => {};
    });
  }
  async unlock(password) {
    let m = await this.read("meta", "access");
    if (!m) {
      if (password.length < 12) throw new Error("Usa al menos 12 caracteres.");
      const salt = crypto.getRandomValues(new Uint8Array(16)),
        key = await derive(password, salt);
      m = { salt: b64(salt), check: await seal(key, { check: "QCS" }) };
      await this.write("meta", "access", m);
      this.key = key;
    } else {
      const key = await derive(password, bytes(m.salt));
      try {
        const v = await unseal(key, m.check);
        if (v.check !== "QCS") throw Error();
      } catch {
        throw new Error(
          "No se pudo abrir: contraseña incorrecta o datos dañados. No se ha modificado nada.",
        );
      }
      this.key = key;
    }
  }
  async get(id) {
    const row = await this.read("items", id);
    return row
      ? { ...(await unseal(this.key, row)), _revision: row.revision || 0 }
      : null;
  }
  async put(id, value) {
    const expected = value._revision || 0,
      revision = expected + 1,
      sealed = {
        ...(await seal(this.key, { ...value, _revision: revision })),
        revision,
      };
    await new Promise((resolve, reject) => {
      const tx = this.db.transaction("items", "readwrite"),
        store = tx.objectStore("items"),
        r = store.get(id);
      let conflict = false;
      r.onsuccess = () => {
        if ((r.result?.revision || 0) !== expected) {
          conflict = true;
          tx.abort();
          return;
        }
        store.put(sealed, id);
      };
      tx.oncomplete = resolve;
      tx.onabort = () =>
        reject(
          new Error(
            conflict
              ? "La ficha cambió en otra pantalla. Vuelve a abrirla antes de guardar."
              : "No se pudo guardar.",
          ),
        );
    });
    value._revision = revision;
  }
  async createMany(values) {
    const staged = await Promise.all(
      values.map(async (v) => [
        v.id,
        { ...(await seal(this.key, { ...v, _revision: 1 })), revision: 1 },
      ]),
    );
    await new Promise((resolve, reject) => {
      const tx = this.db.transaction("items", "readwrite"),
        store = tx.objectStore("items");
      for (const [id, row] of staged) store.add(row, id);
      tx.oncomplete = resolve;
      tx.onabort = () =>
        reject(tx.error || new Error("Importación cancelada sin cambios."));
    });
  }
  async list() {
    const rows = await new Promise((resolve, reject) => {
      const r = this.db.transaction("items").objectStore("items").getAll();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    return Promise.all(
      rows.map(async (r) => ({
        ...(await unseal(this.key, r)),
        _revision: r.revision || 0,
      })),
    );
  }
  async backup() {
    const items = await new Promise((resolve, reject) => {
      const tx = this.db.transaction(["meta", "items"]);
      const r = tx.objectStore("items").openCursor(),
        out = [];
      r.onsuccess = () => {
        const c = r.result;
        if (c) {
          out.push([c.key, c.value]);
          c.continue();
        }
      };
      tx.oncomplete = () => resolve(out);
      tx.onabort = () => reject(tx.error);
    });
    return {
      format: "QCS-ENCRYPTED-1",
      createdAt: new Date().toISOString(),
      access: await this.read("meta", "access"),
      items,
    };
  }
  async inspectBackup(backup, password) {
    if (
      backup?.format !== "QCS-ENCRYPTED-1" ||
      !Array.isArray(backup.items) ||
      !backup.access?.salt
    )
      throw new Error(
        "No es una copia de esta entrega QCS. No se ha cambiado nada.",
      );
    const key = await derive(password, bytes(backup.access.salt));
    try {
      if ((await unseal(key, backup.access.check)).check !== "QCS")
        throw Error();
    } catch {
      throw new Error("Contraseña de la copia incorrecta o copia dañada.");
    }
    const seen = new Set(),
      values = [];
    for (const entry of backup.items) {
      if (!Array.isArray(entry) || entry.length !== 2 || seen.has(entry[0]))
        throw Error("Copia con identificadores incoherentes.");
      seen.add(entry[0]);
      const v = await unseal(key, entry[1]);
      if (v.id !== entry[0] || v._revision !== entry[1].revision)
        throw Error("Copia incoherente: no se ha importado nada.");
      values.push(v);
    }
    return values;
  }
  lock() {
    this.key = null;
  }
}
