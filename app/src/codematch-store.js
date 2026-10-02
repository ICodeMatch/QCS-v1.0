// The historical CodeMatch UI uses the existing QCS vault. No second PIN or database.
export class CodeMatchStore {
  constructor(vault) { this.vault = vault; }
  async all(store) {
    const rows = await this.vault.list();
    if (store === 'records') return rows.filter(r => r.kind === 'code');
    const own = rows.filter(r => r.kind === 'codematch' && r.store === store).map(r => ({...r.value, _vaultId:r.id, _revision:r._revision}));
    if (store !== 'attachments') return own;
    // References saved in the earlier QCS prototype remain visible, without rewriting them.
    for (const r of rows.filter(r => r.kind === 'code')) {
      for (const [field, kind] of [['photos','photo'],['plans','plan']]) {
        for (const [i, p] of (r[field] || []).entries()) own.push({
          id:`embedded:${r.id}:${field}:${p.id || i}`,recordCode:r.code,kind,
          name:p.name || p.label || `Vista ${i+1}`,type:kind==='photo'?'image/jpeg':'application/pdf',
          ext:kind==='photo'?'jpg':'pdf',data:p.data,thumbnail:kind==='photo'?p.data:null,
          createdAt:p.at,_embedded:{recordId:r.id,field,index:i},status:'ready'
        });
      }
    }
    return own;
  }
  async get(store, key) { return (await this.all(store)).find(r => (store === 'records' ? r.code : store === 'settings' ? r.key : r.id) === key); }
  async put(store, value) {
    if (store === 'records') {
      const old = await this.get(store, value.code);
      const r = {...value, kind:'code',id:old?.id || value.id || crypto.randomUUID(),_revision:value._revision ?? old?._revision ?? 0,
        photos:value.photos || old?.photos || [], plans:value.plans || old?.plans || []};
      await this.vault.put(r.id,r); return r;
    }
    const key = store==='settings' ? value.key : value.id;
    if (!key) throw Error('Falta el identificador del dato.');
    const id = `cm:${store}:${key}`,old = await this.vault.get(id);
    const clean = {...value}; delete clean._vaultId; delete clean._revision;
    await this.vault.put(id,{id,kind:'codematch',store,value:clean,_revision:value._revision ?? old?._revision ?? 0});
    return value;
  }
  async bulkPutRecords(values) {
    const old = new Map((await this.all('records')).map(r => [r.code,r]));
    const seen = new Set();
    const staged = values.map(value => {
      if (seen.has(value.code)) throw Error(`Código repetido en el archivo: ${value.code}. No se ha importado nada.`);
      seen.add(value.code);
      const previous=old.get(value.code);
      return {...value,id:previous?.id || crypto.randomUUID(),kind:'code',_revision:previous?._revision || 0,
        photos:previous?.photos || [],plans:previous?.plans || [],
        history:[...(previous?.history || []),...(previous ? [{at:new Date().toISOString(),operation:'catalog-import',previous}] : [])]};
    });
    await this.vault.putMany(staged);
  }
  async retireAttachment(value) {
    if (value._embedded) {
      const {recordId,field,index}=value._embedded,r=await this.vault.get(recordId);
      const saved=r[field][index];
      if (!saved || saved.data!==value.data) throw Error('La referencia cambió; vuelve a abrir la ficha.');
      r.retiredAttachments=[...(r.retiredAttachments || []),saved];r[field].splice(index,1);
      await this.vault.put(r.id,r);
    } else await this.put('attachments',{...value,retired:true});
  }
}
