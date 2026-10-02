const TYPES = new Set(['internal', 'provider', 'customer']);
export const AVISO_TYPES = [['internal','Internas','Proceso y producción'],['provider','Proveedor','Material recibido'],['customer','Cliente','Reclamaciones']];
export class AvisosStore {
  constructor(vault) { this.vault = vault; }
  create(type) {
    if (!TYPES.has(type)) throw Error('Selecciona un tipo de aviso.');
    const now = new Date().toISOString();
    return {kind:'aviso',id:crypto.randomUUID(),type,status:'Borrador',createdAt:now,updatedAt:now,code:'',name:'',counterparty:'',quantity:'',problem:'',action:'',photos:[],retiredPhotos:[],history:[]};
  }
  async list() { return (await this.vault.list()).filter(x=>x.kind==='aviso').sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)); }
  async get(id) { const row=await this.vault.get(id);if(row?.kind!=='aviso')throw Error('El borrador no está disponible.');return row; }
  async save(draft, summary='Borrador guardado') {
    if(draft.kind!=='aviso'||!TYPES.has(draft.type)||!Array.isArray(draft.photos))throw Error('Borrador incompatible.');
    const next=structuredClone(draft),now=new Date().toISOString();
    next.updatedAt=now;next.history=[...(next.history||[]),{id:crypto.randomUUID(),at:now,summary}];
    await this.vault.put(next.id,next);
    return next;
  }
  async addPhotos(draft,photos) {
    const next=structuredClone(draft);let added=0;
    for(const photo of photos){
      if(!photo.data?.startsWith('data:image/')||!photo.mime?.startsWith('image/'))throw Error('La evidencia debe ser una imagen.');
      if(photo.id && next.photos.some(x=>x.id===photo.id)) continue;
      next.photos.push({...photo,id:photo.id||crypto.randomUUID(),comment:photo.comment||'',importedAt:photo.importedAt||new Date().toISOString()});added++;
    }
    return added?this.save(next,`${added} fotografías añadidas`):next;
  }
  async retirePhoto(draft,id) {
    const next=structuredClone(draft),photo=next.photos.find(x=>x.id===id);
    if(!photo)throw Error('La fotografía ya no está en el borrador.');
    next.retiredPhotos=[...(next.retiredPhotos||[]),{...photo,retiredAt:new Date().toISOString()}];
    next.photos=next.photos.filter(x=>x.id!==id);
    return this.save(next,'Fotografía retirada; copia conservada');
  }
}
const localDate=iso=>{const d=new Date(iso);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
export function filterAvisos(rows,{text='',type='',from='',to=''}={}) {
 const normalize=s=>String(s||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
 const words=normalize(text).split(/\s+/).filter(Boolean);
 return rows.filter(r=>(!type||r.type===type)&&(!from||localDate(r.createdAt)>=from)&&(!to||localDate(r.createdAt)<=to)&&words.every(w=>normalize([r.code,r.name,r.counterparty,r.problem,r.action,r.id].join(' ')).includes(w)));
}
