export class HomologacionStore {
  constructor(vault) {
    this.vault = vault;
  }
  create() {
    const now = new Date().toISOString();
    return {
      kind: "homologacion",
      id: crypto.randomUUID(),
      type: "piece",
      createdAt: now,
      updatedAt: now,
      header: {},
      characteristics: [],
      source: null,
      history: [],
      approval: { status: "Pendiente", author: null, date: null, reason: null },
    };
  }
  async list() {
    return (await this.vault.list())
      .filter((x) => x.kind === "homologacion")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  async get(id) {
    const d = await this.vault.get(id);
    if (d?.kind !== "homologacion") throw Error("Sesión no disponible.");
    return d;
  }
  async save(draft, summary = "Sesión guardada") {
    if (draft.kind !== "homologacion" || !Array.isArray(draft.characteristics))
      throw Error("Sesión incompatible.");
    const copy = structuredClone(draft),
      now = new Date().toISOString(),
      before = await this.vault.get(copy.id),
      changes = [];
    for (const c of copy.characteristics) {
      const old = before?.characteristics?.find(
        (x) => x.internalKey === c.internalKey,
      );
      for (const sample of c.samples) {
        const prior = old?.samples.find((s) => s.id === sample.id);
        if (prior && prior.value !== sample.value)
          changes.push({
            internalKey: c.internalKey,
            sampleId: sample.id,
            sourceCell: sample.sourceCell,
            before: prior.value,
            after: sample.value,
          });
      }
    }
    for (const [field, value] of Object.entries(copy.header)) {
      if (before?.header?.[field]?.value !== value.value)
        changes.push({
          field,
          before: before?.header?.[field]?.value ?? null,
          after: value.value,
        });
    }
    copy.updatedAt = now;
    copy.history.push({
      id: crypto.randomUUID(),
      at: now,
      summary,
      changes,
      actor: "Acceso local provisional",
    });
    await this.vault.put(copy.id, copy);
    return copy;
  }
  async confirmImport(draft, preview) {
    if (draft.source)
      throw Error(
        "El original ya está vinculado. Importa otra plantilla en una sesión nueva.",
      );
    const copy = structuredClone(draft);
    copy.source = {
      ...preview.original,
      mapping: preview.mapping,
      structuralSignature: preview.structuralSignature,
      readerVersion: preview.readerVersion,
    };
    copy.header = preview.header;
    copy.characteristics = preview.characteristics;
    copy.importWarnings = preview.warnings;
    return this.save(copy, "Importación confirmada tras vista previa");
  }
  async profiles() {
    return (await this.list())
      .filter((x) => x.source)
      .map((x) => ({
        name: x.source.name,
        id: x.id,
        mapping: x.source.mapping,
        structuralSignature: x.source.structuralSignature,
      }));
  }
}
