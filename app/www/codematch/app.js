import * as pdfjsLib from './vendor/pdf.min.mjs';
import {decimal,sum,pair,within} from './decimal.js';
pdfjsLib.GlobalWorkerOptions.workerSrc='./vendor/pdf.worker.min.mjs';
const bridge=parent.qcsCodeMatchBridge;
if(!bridge)throw Error('Abre CodeMatch desde el acceso QCS.');
let records=[],attachments=[],pendingSheet=null,recordBaseline='',navStack=[];
const all=bridge.all,get=bridge.get,put=bridge.put,bulkPutRecords=bridge.bulkPutRecords;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let currentView='search';
let foldCalcTarget='searchLength';
const foldCotas={searchLength:Array(8).fill(''),searchWidth:Array(8).fill('')};
// Campos extensibles de ficha: se insertan sin alterar la estructura histórica del diálogo.
const recordGrid=$('#recordForm .form-grid');
recordGrid.insertAdjacentHTML('beforeend','<label>Mano<select id="recordHand"><option value="">Sin indicar</option><option>Derecha / 30</option><option>Izquierda / 31</option></select></label><label>Versión / revisión<input id="recordRevision" placeholder="Ej. Rev.06"></label><label>Estado de revisión<select id="recordRevisionState"><option>Vigente</option><option>Obsoleta</option><option>Pendiente</option></select></label><label>Procedencia<select id="recordDataSource"><option>Manual</option><option>Excel</option><option>Medición</option><option>CAD</option><option>Demostración</option></select></label><label>Validación<select id="recordValidation"><option>Pendiente</option><option>Verificado</option><option>No aplicable</option></select></label><label>Punzonados<input id="recordPunches" type="text" inputmode="decimal"></label><label>Agujeros<input id="recordHoles" type="text" inputmode="decimal"></label><label>Ventanas / recortes<input id="recordWindows" type="text" inputmode="decimal"></label><label class="wide">Otras características<input id="recordFeatures" placeholder="Pliegue exterior, pestaña, ranura…"></label><label class="wide">Medidas adicionales configurables<textarea id="recordExtraMeasures" rows="2" placeholder="Nombre: valor mm; otro dato: valor"></textarea></label>');
recordGrid.insertAdjacentHTML('afterend','<div class="attachment-block"><h3>Histórico de revisiones</h3><div id="recordHistoryList" class="source-info">Sin cambios registrados.</div></div>');
$('#searchForm').insertAdjacentHTML('beforeend','<label>Característica / punzonado<input id="searchFeature" placeholder="Ej. 4 agujeros, ventana, pestaña"></label><label>Tolerancia<select id="searchToleranceMode"><option value="mm">Milímetros</option><option value="percent">Porcentaje</option></select></label>');
$('#searchForm').insertAdjacentHTML('afterend','<section id="candidateProgress" class="panel candidate-progress"><strong>Reducción de candidatos</strong><p>Introduce únicamente los datos que conozcas.</p></section>');
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600)}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function uid(){return crypto.randomUUID()}
function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function textMatch(record,query){const words=normalize(query).split(/\s+/).filter(Boolean),haystack=normalize([record.code,record.name,record.material,record.hand,record.revision].join(' '));return words.every(word=>haystack.includes(word))}
function recordAttachments(code,type){return attachments.filter(a=>a.recordCode===code&&(!type||a.kind===type))}
function completion(r){const a=recordAttachments(r.code);return {photos:a.some(x=>x.kind==='photo'),plans:a.some(x=>x.kind==='plan'),thumb:a.some(x=>x.kind==='plan'&&x.thumbnail),enriched:!!(r.foldedLength||r.foldedWidth||r.foldedHeight||r.thickness||r.material||r.notes)}}
function firstThumb(code){return recordAttachments(code).find(a=>a.thumbnail)?.thumbnail||''}
function renderRecordCard(r,scoreInfo){const c=completion(r),thumb=firstThumb(r.code);return `<article class="result">${thumb?`<img class="mini" src="${thumb}" alt="Miniatura">`:`<div class="mini mini-placeholder">⌁</div>`}<div><h3>${esc(r.code)}</h3><p>${esc(r.name||'Sin denominación')}</p><div class="chips">${r.isDemo?'<span class="chip warning-chip">DEMO</span>':''}${r.developedLength||r.developedWidth?`<span class="chip">Des. ${r.developedLength??'—'} × ${r.developedWidth??'—'} mm</span>`:''}${r.foldedLength||r.foldedWidth?`<span class="chip">Pleg. ${r.foldedLength??'—'} × ${r.foldedWidth??'—'} × ${r.foldedHeight??'—'} mm</span>`:''}${r.material?`<span class="chip">${esc(r.material)}</span>`:''}${r.hand?`<span class="chip">${esc(r.hand)}</span>`:''}${r.revision?`<span class="chip">${esc(r.revision)}</span>`:''}${c.photos?'<span class="chip">Foto</span>':''}${c.plans?'<span class="chip">Plano</span>':''}${scoreInfo?.swapped?'<span class="chip">Medidas intercambiadas</span>':''}${scoreInfo?.outside?'<span class="chip warning-chip">Fuera de tolerancia</span>':''}</div></div>${scoreInfo?`<span class="score">${scoreInfo.outside?'Cercana':Math.round(scoreInfo.score)+' pts'}</span>`:''}<div class="result-actions"><button data-edit="${esc(r.code)}">Abrir y completar</button>${c.plans?`<button data-open-plan="${esc(r.code)}">Ver plano</button>`:''}</div></article>`}
function bindRecordActions(){$$('[data-edit]').forEach(b=>b.onclick=()=>openRecord(b.dataset.edit));$$('[data-open-plan]').forEach(b=>b.onclick=()=>openFirstPlan(b.dataset.openPlan));protectHandlers()}
$$('[data-tol]').forEach(b=>b.onclick=()=>{$('#searchTolerance').value=b.dataset.tol});
$$('[data-calc-target]').forEach(b=>b.onclick=()=>{foldCalcTarget=b.dataset.calcTarget;$('#foldCalcTitle').textContent=foldCalcTarget==='searchLength'?'Sumar cotas para el largo':'Sumar cotas para el ancho';renderFoldCotas();$('#foldCalcDialog').showModal()});
async function parseSpreadsheet(file){if(file.name.toLowerCase().endsWith('.csv'))return parseCSV(await file.text());const zip=await JSZip.loadAsync(await file.arrayBuffer()),shared=[];const sharedFile=zip.file('xl/sharedStrings.xml');if(sharedFile){const xml=new DOMParser().parseFromString(await sharedFile.async('text'),'application/xml');xml.querySelectorAll('si').forEach(si=>shared.push([...si.querySelectorAll('t')].map(t=>t.textContent).join('')))}const workbook=new DOMParser().parseFromString(await zip.file('xl/workbook.xml').async('text'),'application/xml');const sheetName=workbook.querySelector('sheet')?.getAttribute('name')||'Hoja 1';let path='xl/worksheets/sheet1.xml';const sheetFile=zip.file(path);if(!sheetFile)throw new Error('No se encontró la primera hoja');const xml=new DOMParser().parseFromString(await sheetFile.async('text'),'application/xml'),rows=[];xml.querySelectorAll('row').forEach(row=>{const out=[];row.querySelectorAll('c').forEach(c=>{const ref=c.getAttribute('r')||'A1',letters=ref.match(/[A-Z]+/)?.[0]||'A';let col=0;for(const ch of letters)col=col*26+ch.charCodeAt(0)-64;col--;const type=c.getAttribute('t'),v=c.querySelector('v')?.textContent??c.querySelector('t')?.textContent??'';out[col]=type==='s'?shared[Number(v)]??'':v});rows.push(out)});return {name:sheetName,rows}}
function parseCSV(text){const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim()),delimiter=(lines[0].match(/;/g)||[]).length>=(lines[0].match(/,/g)||[]).length?';':',';return {name:'CSV',rows:lines.map(line=>{const out=[];let cur='',quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'&&line[i+1]==='"'){cur+='"';i++}else if(ch==='"')quoted=!quoted;else if(ch===delimiter&&!quoted){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out})}}
function bestColumn(headers,words){const hs=headers.map(normalize);for(const w of words){const i=hs.findIndex(h=>h.includes(w));if(i>=0)return i}return ''}
$('#excelInput').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{toast('Leyendo el archivo…');const parsed=await parseSpreadsheet(file);if(parsed.rows.length<2)throw new Error('Sin filas');const headers=parsed.rows[0].map((x,i)=>String(x||`Columna ${i+1}`));pendingSheet={file,headers,rows:parsed.rows.slice(1),sheetName:parsed.name};const fields=[['mapCode','Código',['codigo material','codigo','referencia','ref']],['mapName','Denominación',['texto breve de material','texto breve','denominacion','descripcion','nombre']],['mapLength','Largo desarrollado',['longitud','largo']],['mapWidth','Ancho desarrollado',['anchura','ancho']]];$('#mappingFields').innerHTML=fields.map(([id,label,words])=>`<label>${label}<select id="${id}"><option value="">No importar</option>${headers.map((h,i)=>`<option value="${i}" ${bestColumn(headers,words)===i?'selected':''}>${esc(h)}</option>`).join('')}</select></label>`).join('');$('#importPreview').innerHTML=`<table><thead><tr>${headers.slice(0,6).map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${pendingSheet.rows.slice(0,5).map(r=>`<tr>${headers.slice(0,6).map((_,i)=>`<td>${esc(r[i]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;$('#mappingPanel').classList.remove('hidden');toast(`${pendingSheet.rows.length} filas leídas`) }catch(err){console.error(err);toast('No se pudo leer el Excel. Guarda una copia como XLSX o CSV.')}};
$('#confirmImport').onclick=async()=>{if(!pendingSheet)return;const ci=num($('#mapCode').value),ni=num($('#mapName').value),li=num($('#mapLength').value),wi=num($('#mapWidth').value);if(ci==null){toast('Selecciona la columna del código');return}toast('Importando el catálogo…');let skipped=0;const oldMap=new Map(records.map(r=>[r.code,r])),now=new Date().toISOString(),values=[];for(const row of pendingSheet.rows){const code=String(row[ci]??'').trim();if(!code){skipped++;continue}const old=oldMap.get(code)||{};values.push({...old,code,name:ni==null?(old.name||''):String(row[ni]??'').trim(),developedLength:li==null?(old.developedLength??null):num(row[li]),developedWidth:wi==null?(old.developedWidth??null):num(row[wi]),source:'excel',dataSource:'Excel',catalogSource:'imported-local',isDemo:false,sourceUpdatedAt:now})}await bulkPutRecords(values);const stats={names:values.filter(v=>v.name).length,lengths:values.filter(v=>v.developedLength!=null).length,widths:values.filter(v=>v.developedWidth!=null).length,both:values.filter(v=>v.developedLength!=null&&v.developedWidth!=null).length};await put('settings',{key:'excelSource',name:pendingSheet.file.name,size:pendingSheet.file.size,importedAt:now,rows:values.length,file:pendingSheet.file,mapping:{code:pendingSheet.headers[ci],name:ni==null?'No importada':pendingSheet.headers[ni],length:li==null?'No importada':pendingSheet.headers[li],width:wi==null?'No importada':pendingSheet.headers[wi]},stats});await refresh();$('#mappingPanel').classList.add('hidden');pendingSheet=null;renderSource();toast(`${values.length} códigos importados; ${stats.both} con largo y ancho`)};
async function renderSource(){const s=await get('settings','excelSource');$('#sourceInfo').classList.toggle('empty',!s);$('#sourceInfo').innerHTML=s?`<strong>${esc(s.name)}</strong><br>${s.rows.toLocaleString('es-ES')} códigos · importado ${new Date(s.importedAt).toLocaleString('es-ES')}${s.mapping?`<br><br><strong>Columnas leídas</strong><br>Código: ${esc(s.mapping.code)} · Denominación: ${esc(s.mapping.name)}<br>Largo: ${esc(s.mapping.length)} · Ancho: ${esc(s.mapping.width)}`:''}${s.stats?`<br><br><strong>Comprobación</strong><br>${s.stats.names.toLocaleString('es-ES')} con denominación · ${s.stats.both.toLocaleString('es-ES')} con largo y ancho válidos`:''}`:'Todavía no hay ningún Excel importado.'}

function renderLibrary(){const text=$('#libraryFilter').value,filter=$('#completionFilter').value;let list=records.filter(r=>!normalize(text)||textMatch(r,text)).filter(r=>{const c=completion(r);if(filter==='excel')return !c.enriched&&!c.photos&&!c.plans;if(filter==='photos')return c.photos;if(filter==='plans')return c.plans;if(filter==='thumbnail-missing')return c.plans&&!c.thumb;if(filter==='complete')return c.enriched;return true});$('#libraryList').innerHTML=list.slice(0,300).map(r=>renderRecordCard(r)).join('')||'<div class="panel">No hay referencias para este filtro.</div>';bindRecordActions()}
$('#libraryFilter').oninput=renderLibrary;$('#completionFilter').onchange=renderLibrary;$('#newRecordBtn').onclick=()=>openRecord('');
async function renderRecordHistory(code){const list=code?(await all('recordHistory')).filter(x=>x.recordCode===code).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)):[];$('#recordHistoryList').innerHTML=list.length?list.slice(0,12).map(x=>`<div><strong>${new Date(x.createdAt).toLocaleString('es-ES')}</strong><br>${esc(x.summary)}</div>`).join(''):'Sin cambios registrados.'}
function openRecord(code){const r=records.find(x=>x.code===code)||{};$('#recordForm').reset();$('#recordId').value=r.code||'';$('#recordCode').value=r.code||'';$('#recordCode').readOnly=!!r.code;$('#recordName').value=r.name||'';['developedLength','developedWidth','foldedLength','foldedWidth','foldedHeight','thickness'].forEach(id=>$('#'+id).value=r[id]??'');$('#material').value=r.material||'';$('#recordHand').value=r.hand||'';$('#recordRevision').value=r.revision||'';$('#recordRevisionState').value=r.revisionState||'Pendiente';$('#recordDataSource').value=r.isDemo?'Demostración':(r.dataSource||'Manual');$('#recordValidation').value=r.validation||'Pendiente';$('#recordPunches').value=r.punches??'';$('#recordHoles').value=r.holes??'';$('#recordWindows').value=r.windows??'';$('#recordFeatures').value=(r.features||[]).join(', ');$('#recordExtraMeasures').value=Object.entries(r.extraMeasures||{}).map(([k,v])=>`${k}: ${v}`).join('; ');$('#recordNotes').value=r.notes||'';renderRecordHistory(r.code||'');renderRecordAttachments(r.code||'');$('#recordDialog').showModal(); recordBaseline=formSnapshot()}
$('#recordForm').onsubmit=async e=>{e.preventDefault();const oldCode=$('#recordId').value,code=$('#recordCode').value.trim();if(!code)return;if(!oldCode&&records.some(r=>r.code===code))throw Error('Este código ya existe. Abre su ficha.');const old=records.find(r=>r.code===oldCode)||{},now=new Date().toISOString(),extraMeasures={};$('#recordExtraMeasures').value.split(';').forEach(pair=>{const [name,value]=pair.split(':');if(name?.trim())extraMeasures[name.trim()]=num(value)??value?.trim()??''});const value={...old,code,name:$('#recordName').value.trim(),developedLength:num($('#developedLength').value),developedWidth:num($('#developedWidth').value),foldedLength:num($('#foldedLength').value),foldedWidth:num($('#foldedWidth').value),foldedHeight:num($('#foldedHeight').value),thickness:num($('#thickness').value),material:$('#material').value.trim(),hand:$('#recordHand').value,revision:$('#recordRevision').value.trim(),revisionState:$('#recordRevisionState').value,dataSource:$('#recordDataSource').value,validation:$('#recordValidation').value,punches:num($('#recordPunches').value),holes:num($('#recordHoles').value),windows:num($('#recordWindows').value),features:$('#recordFeatures').value.split(',').map(x=>x.trim()).filter(Boolean),extraMeasures,notes:$('#recordNotes').value.trim(),updatedAt:now,source:old.source||'manual'};const changed=Object.keys(value).filter(k=>k!=='updatedAt'&&JSON.stringify(value[k])!==JSON.stringify(old[k]));const revisionChanged=old.revision&&old.revision!==value.revision;value.revisions=[...(old.revisions||[])];if(revisionChanged)value.revisions.push({revision:old.revision,state:old.revisionState||'Obsoleta',snapshot:old,closedAt:now});await put('records',value);if(changed.length)await put('recordHistory',{id:uid(),recordCode:code,createdAt:now,summary:`Ficha guardada. Campos modificados: ${changed.join(', ')}${revisionChanged?' · revisión anterior conservada':''}`,snapshot:value});await refresh();$('#recordDialog').close();toast('Ficha guardada y revisión registrada')};
function thumbItem(a){return `<div class="thumb-item">${a.thumbnail?`<img src="${a.thumbnail}" alt="Miniatura">`:`<div class="mini mini-placeholder">${a.ext?.toUpperCase()||'—'}</div>`}<small>${esc(a.name)}</small></div>`}
async function addRecordPlans(files){const code=$('#recordCode').value.trim();if(!code){toast('Escribe primero el código');return}for(const f of files)await saveAttachment(f,code,'plan',false);await refresh();renderRecordAttachments(code);toast('Planos guardados')}
function mimeFor(ext){const map={pdf:'application/pdf',dxf:'application/dxf',dwg:'application/acad',step:'application/step',stp:'application/step',iges:'model/iges',igs:'model/iges',stl:'model/stl',svg:'image/svg+xml',tif:'image/tiff',tiff:'image/tiff',webp:'image/webp'};return map[ext]||'application/octet-stream'}
async function imageThumbnail(blob,max=480){const bmp=await createImageBitmap(blob),scale=Math.min(1,max/Math.max(bmp.width,bmp.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(bmp.width*scale));c.height=Math.max(1,Math.round(bmp.height*scale));c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);bmp.close();return c.toDataURL('image/jpeg',.78)}
async function compressImage(blob,max=1280,quality=.72){const bmp=await createImageBitmap(blob),scale=Math.min(1,max/Math.max(bmp.width,bmp.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(bmp.width*scale));c.height=Math.max(1,Math.round(bmp.height*scale));c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);bmp.close();return new Promise((resolve,reject)=>c.toBlob(out=>out?resolve(out):reject(new Error('No se pudo comprimir la imagen')),'image/jpeg',quality))}
async function addBulkPlans(files){for(const f of files){const code=inferCode(f.name);await saveAttachment(f,code,'plan',false)}await refresh();renderPlans();toast(`${files.length} archivos añadidos`)}
function inferCode(name){const n=normalize(name).replace(/[^a-z0-9]/g,'');return records.find(r=>n.includes(normalize(r.code).replace(/[^a-z0-9]/g,'')))?.code||null}
function renderPlans(){const plans=attachments.filter(a=>a.kind==='plan');$('#planCount').textContent=plans.length;$('#thumbCount').textContent=plans.filter(a=>a.thumbnail).length;$('#pendingCount').textContent=plans.filter(a=>!a.thumbnail&&a.status!=='stored').length;$('#planList').innerHTML=plans.map(a=>{const label=a.thumbnail?'Lista':a.status==='stored'?'Sin vista previa':a.status==='review'?'Revisar':'Pendiente';return `<article class="result">${a.thumbnail?`<img class="mini" src="${a.thumbnail}" alt="Miniatura">`:`<div class="mini mini-placeholder">${esc(a.ext?.toUpperCase())}</div>`}<div><h3>${esc(a.name)}</h3><p>${a.recordCode?`Asociado a ${esc(a.recordCode)}`:'Sin referencia asociada'} · ${label}</p>${a.meta?.width?`<div class="chips"><span class="chip">Envolvente DXF ${a.meta.width.toFixed(1)} × ${a.meta.height.toFixed(1)} mm</span></div>`:''}</div><span class="score">${label}</span><div class="result-actions">${a.status!=='stored'?`<button data-gen="${a.id}">Generar miniatura</button>`:''}<button data-assign="${a.id}">Asociar</button><button data-open-att="${a.id}">Abrir</button></div></article>`}).join('')||'<div class="panel">Aún no hay planos.</div>';$$('[data-gen]').forEach(b=>b.onclick=()=>generateOne(b.dataset.gen));$$('[data-assign]').forEach(b=>b.onclick=()=>openAssign(b.dataset.assign));$$('[data-open-att]').forEach(b=>b.onclick=()=>openAttachment(b.dataset.openAtt));protectHandlers()}
async function fillThumbnail(item){try{if(item.type.startsWith('image/'))item.thumbnail=await imageThumbnail(item.blob);else if(item.ext==='pdf')item.thumbnail=await pdfThumbnail(item.blob);else if(item.ext==='dxf'){const out=await dxfThumbnail(await item.blob.text());item.thumbnail=out.thumbnail;item.meta=out.meta}else{item.status='stored';return item}item.status='ready'}catch(err){console.error(err);item.status='review'}return item}
async function pdfThumbnail(blob){const data=new Uint8Array(await blob.arrayBuffer()),doc=await pdfjsLib.getDocument({data}).promise,page=await doc.getPage(1),base=page.getViewport({scale:1}),scale=Math.min(1.4,520/base.width),viewport=page.getViewport({scale}),c=document.createElement('canvas');c.width=Math.ceil(viewport.width);c.height=Math.ceil(viewport.height);await page.render({canvasContext:c.getContext('2d'),viewport}).promise;return c.toDataURL('image/jpeg',.8)}
async function dxfThumbnail(text){const lines=text.replace(/\r/g,'').split('\n'),points=[];let inEntities=false,current={},lastCode=null;for(let i=0;i<lines.length-1;i+=2){const code=lines[i].trim(),value=lines[i+1].trim();if(code==='0'&&value==='SECTION'&&lines[i+2]?.trim()==='2'&&lines[i+3]?.trim()==='ENTITIES'){inEntities=true;i+=2;continue}if(inEntities&&code==='0'&&value==='ENDSEC')break;if(!inEntities)continue;if(code==='0'){if(current.x!=null&&current.y!=null)points.push([current.x,current.y]);if(current.x2!=null&&current.y2!=null)points.push([current.x2,current.y2]);current={};lastCode=value}else if(code==='10')current.x=Number(value);else if(code==='20')current.y=Number(value);else if(code==='11')current.x2=Number(value);else if(code==='21')current.y2=Number(value)}if(points.length<2)throw Error('DXF sin geometría 2D reconocible');const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),w=Math.max(1,maxX-minX),h=Math.max(1,maxY-minY),c=document.createElement('canvas');c.width=520;c.height=360;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);const s=Math.min((c.width-40)/w,(c.height-40)/h);ctx.strokeStyle='#086c8d';ctx.lineWidth=2;ctx.beginPath();points.forEach((p,i)=>{const x=20+(p[0]-minX)*s,y=c.height-20-(p[1]-minY)*s;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();return {thumbnail:c.toDataURL('image/png'),meta:{width:w,height:h,points:points.length}}}
async function generateOne(id){const item=attachments.find(a=>a.id===id);if(!item)return;toast('Generando miniatura…');await fillThumbnail(item);await put('attachments',item);renderPlans();toast(item.thumbnail?'Miniatura generada':'No se pudo generar; revisa el archivo')}
$('#generatePending').onclick=async()=>{const pending=attachments.filter(a=>a.kind==='plan'&&!a.thumbnail);for(let i=0;i<pending.length;i++){await fillThumbnail(pending[i]);await put('attachments',pending[i]);$('#pendingCount').textContent=String(pending.length-i-1)}renderPlans();toast(`${pending.filter(x=>x.thumbnail).length} miniaturas generadas`)};
function openAssign(id){const a=attachments.find(x=>x.id===id);$('#assignAttachmentId').value=id;$('#assignFileName').textContent=a.name;$('#assignSearch').value=a.recordCode||'';$('#assignDialog').showModal()}
$('#confirmAssign').onclick=async()=>{const a=attachments.find(x=>x.id===$('#assignAttachmentId').value),code=$('#assignSearch').value.trim();if(!a||!records.some(r=>r.code===code)){toast('Selecciona un código válido');return}a.recordCode=code;await put('attachments',a);$('#assignDialog').close();renderPlans();toast('Plano asociado')};
function openFirstPlan(code){const a=recordAttachments(code,'plan')[0];if(a)openAttachment(a.id)}
async function blobToData(blob){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(blob)})}
function dataToBlob(data){const [head,body]=data.split(','),mime=head.match(/data:(.*?);/)?.[1]||'application/octet-stream',bytes=atob(body),arr=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)arr[i]=bytes.charCodeAt(i);return new Blob([arr],{type:mime})}
function xmlEsc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]))}
function excelColumn(index){let name='';for(let n=index+1;n;n=Math.floor((n-1)/26))name=String.fromCharCode(65+(n-1)%26)+name;return name}
function excelCell(value,row,column){const ref=excelColumn(column)+row;if(typeof value==='number'&&Number.isFinite(value))return `<c r="${ref}"><v>${value}</v></c>`;return `<c r="${ref}" t="inlineStr"><is><t>${xmlEsc(value)}</t></is></c>`}
async function exportExcel(){
  const headers=['Código','Denominación','Revisión','Estado revisión','Largo desarrollado mm','Ancho desarrollado mm','Largo plegado mm','Ancho plegado mm','Alto plegado mm','Espesor mm','Material','Mano','Punzonados','Agujeros','Ventanas/recortes','Características','Medidas adicionales','Procedencia','Validación','Notas','Fotografías','Planos','Actualizado'];
  const rows=[headers,...records.map(r=>{const files=recordAttachments(r.code);return [r.code,r.name||'',r.revision||'',r.revisionState||'',r.developedLength??'',r.developedWidth??'',r.foldedLength??'',r.foldedWidth??'',r.foldedHeight??'',r.thickness??'',r.material||'',r.hand||'',r.punches??'',r.holes??'',r.windows??'',(r.features||[]).join(', '),Object.entries(r.extraMeasures||{}).map(([k,v])=>`${k}: ${v}`).join('; '),r.dataSource||'',r.validation||'',r.notes||'',files.filter(a=>a.kind==='photo').length,files.filter(a=>a.kind==='plan').length,r.updatedAt||r.sourceUpdatedAt||'']})];
  const sheetRows=rows.map((row,ri)=>`<row r="${ri+1}">${row.map((value,ci)=>excelCell(value,ri+1,ci)).join('')}</row>`).join('');
  const zip=new JSZip();
  zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
  zip.folder('_rels').file('.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  zip.folder('xl').file('workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Catálogo CodeMatch" sheetId="1" r:id="rId1"/></sheets></workbook>');
  zip.folder('xl/_rels').file('workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
  zip.folder('xl/worksheets').file('sheet1.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>${sheetRows}</sheetData><autoFilter ref="A1:W${rows.length}"/></worksheet>`);
  const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});await bridge.download(await blob.arrayBuffer(),`codematch-datos-${new Date().toISOString().slice(0,10)}.xlsx`,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');toast(`${records.length} referencias exportadas a Excel`)
}
function num(v){if(v==null||String(v).trim()==='')return null;decimal(v);return String(v).trim().replace(',','.');}
function formSnapshot(){return JSON.stringify([...$('#recordForm').querySelectorAll('input:not([type=file]),select,textarea')].map(n=>[n.id,n.value]));}
async function leaveRecord(){
  if(!$('#recordDialog').open)return;
  if(formSnapshot()!==recordBaseline){
    if(!$('#recordCode').value.trim())throw Error('Escribe el código antes de salir para conservar la ficha.');
    await saveRecord({preventDefault(){}});
  }else $('#recordDialog').close();
}
function showView(name,{push=false}={}){
  if(!$('#'+name+'View'))name='search';
  if(push&&name!==currentView)navStack.push(currentView);
  currentView=name;$$('.view').forEach(v=>v.classList.toggle('active',v.id===name+'View'));
  $$('.bottom-nav [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  $$('dialog[open]').forEach(d=>d.close());
  if(name==='library')renderLibrary();if(name==='plans')renderPlans();if(name==='backup')renderStorage();
  scrollTo(0,0);
}
async function navigate(name){await leaveRecord();showView(name,{push:true});protectHandlers();}
async function goBack(){
  const opened=$$('dialog[open]').at(-1);
  if(opened){if(opened.id==='recordDialog')await leaveRecord();else opened.close();return true;}
  if(navStack.length){showView(navStack.pop());return true;}
  if(currentView!=='search'){showView('search');return true;}
  return false;
}
window.qcsCodeMatch={goBack:async()=>{await busy;return goBack();},prepareLeave:async()=>{await busy;return leaveRecord();},navigate,notify:toast};
$$('[data-view]').forEach(b=>b.onclick=()=>navigate(b.dataset.view));
$$('[data-back]').forEach(b=>b.onclick=async()=>{if(!await goBack())await bridge.home();});
$$('[data-close]').forEach(b=>b.onclick=async()=>{if(b.dataset.close==='recordDialog')await leaveRecord();else $('#'+b.dataset.close).close();});
$('#recordDialog').addEventListener('cancel',e=>{e.preventDefault();leaveRecord().catch(fail);});
$('#menuBtn').onclick=()=>$('#menuDialog').showModal();
$('#storageBtn').onclick=()=>$('#storageDialog').showModal();
$('#qcsBackup').onclick=()=>bridge.settings();
$('#clearSearch').onclick=()=>{$('#searchForm').reset();$('#searchTolerance').value='5';$('#results').innerHTML='';$('#searchMessage').textContent='Filtros limpiados.';};
function searchState(r,q){
  const states=[];
  const dimensions=pair([r[q.mode+'Length'],r[q.mode+'Width']],[q.x,q.y],q.tol,q.percent);states.push(dimensions);
  for(const [key,target] of [['foldedHeight',q.h],['thickness',q.thickness]]){
    if(target==null)continue;
    states.push(r[key]==null||r[key]===''?'No evaluable':within(r[key],target,q.tol,q.percent)?'Coincidencia':'Descartada');
  }
  const matches=(!q.text||textMatch(r,q.text))&&(!q.material||normalize(r.material).includes(q.material))&&(!q.hand||normalize(r.hand).includes(q.hand))&&(!q.revision||normalize(r.revision).includes(q.revision))&&(!q.feature||normalize([r.punches,r.holes,r.windows,...(r.features||[])].join(' ')).includes(q.feature));
  if(!matches||states.includes('Descartada'))return 'Descartada';
  return states.includes('No evaluable')?'No evaluable':'Coincidencia';
}
function runSearch(){
  const q={text:$('#searchText').value,x:num($('#searchLength').value),y:num($('#searchWidth').value),h:num($('#searchHeight').value),thickness:num($('#searchThickness').value),material:normalize($('#searchMaterial').value),hand:normalize($('#searchHand').value),revision:normalize($('#searchRevision').value),feature:normalize($('#searchFeature').value),tol:$('#searchTolerance').value,percent:$('#searchToleranceMode').value==='percent',mode:$('#measureMode').value};decimal(q.tol);
  const out=records.map(r=>({r,state:searchState(r,q)}));
  $('#searchMessage').textContent=`${out.filter(x=>x.state==='Coincidencia').length} coincidencias · tolerancia inclusiva ${q.percent?q.tol+' %':'±'+q.tol+' mm'}.`;
  $('#results').innerHTML=['Coincidencia','No evaluable','Descartada'].map(state=>{
    const rows=out.filter(x=>x.state===state);return `<h2>${state} · ${rows.length}</h2>${rows.slice(0,200).map(x=>renderRecordCard(x.r)).join('')}`;
  }).join('');
  $('#candidateProgress').innerHTML='<strong>Reducción de candidatos</strong><p>Introduce únicamente los datos que conozcas. Las referencias sin la medida necesaria se indican como «No evaluable».</p>';
  bindRecordActions();
}
$('#searchForm').onsubmit=e=>{e.preventDefault();runSearch();};
function renderFoldCotas(){
  $('#foldCotaList').innerHTML=foldCotas[foldCalcTarget].map((value,i)=>`<div class="cota-row"><label>Cota ${i+1} (mm)<input type="text" inputmode="decimal" value="${esc(value)}" data-cota-index="${i}"></label></div>`).join('');
  $$('[data-cota-index]').forEach(n=>n.oninput=()=>{foldCotas[foldCalcTarget][Number(n.dataset.cotaIndex)]=n.value;updateTotal();});updateTotal();
}
function updateTotal(){
  try{const values=foldCotas[foldCalcTarget];$('#foldCalcTotal').textContent=sum(values)+' mm';$('#applyCotasBtn').disabled=!values.some(x=>String(x).trim());}
  catch(e){$('#foldCalcTotal').textContent=e.message;$('#applyCotasBtn').disabled=true;}
}
$('#clearCotasBtn').onclick=()=>{foldCotas[foldCalcTarget]=Array(8).fill('');renderFoldCotas();};
$('#applyCotasBtn').onclick=()=>{
  const dest=$('#'+foldCalcTarget);
  if(dest.value&&!confirm('¿Sustituir esta medida por el total de cotas?'))return;
  dest.value=sum(foldCotas[foldCalcTarget]);$('#measureMode').value='developed';$('#foldCalcDialog').close();
  toast(`Total aplicado al ${foldCalcTarget==='searchLength'?'largo':'ancho'} desarrollado`);
};
function renderRecordAttachments(code){
  const photos=recordAttachments(code,'photo');
  $('#isoPhotoSlots').innerHTML=ISO_VIEWS.map(([slot,title,hint])=>{
    const a=photos.find(x=>x.viewSlot===slot);return `<article class="iso-slot ${a?'complete':''}"><div class="iso-slot-head"><strong>${title}</strong><small>${hint}</small></div>${a?`<img src="${a.thumbnail}" alt="${title}"><span class="iso-ok">✓ Guardada</span>`:'<div class="iso-placeholder"><span>◇</span><small>Referencia visual</small></div>'}<div class="iso-actions"><button type="button" class="secondary" data-native-photo="${slot}" data-camera="true">${a?'Repetir':'Hacer foto'}</button><button type="button" class="secondary" data-native-photo="${slot}" data-camera="false">Galería</button>${a?`<button type="button" data-retire-photo="${a.id}">Retirar</button>`:''}</div></article>`;
  }).join('');
  const other=photos.filter(a=>!a.viewSlot);
  $('#piecePhotoList').innerHTML=other.map(a=>`<div>${thumbItem(a)}<button type="button" data-retire-photo="${a.id}">Retirar</button></div>`).join('');
  $('#recordPlanList').innerHTML=recordAttachments(code,'plan').map(a=>`<div>${thumbItem(a)}<button type="button" data-open-attachment="${a.id}">Abrir plano</button></div>`).join('');
  $$('[data-native-photo]').forEach(b=>b.onclick=()=>pickPhoto(b.dataset.camera==='true',b.dataset.nativePhoto));
  $$('[data-retire-photo]').forEach(b=>b.onclick=async()=>{
    if(!confirm('¿Retirar esta fotografía? Su copia se conserva en el historial cifrado.'))return;
    await bridge.retireAttachment(attachments.find(a=>a.id===b.dataset.retirePhoto));await refresh();renderRecordAttachments(code);toast('Fotografía retirada; copia conservada.');
  });
  $$('[data-open-attachment]').forEach(b=>b.onclick=()=>openAttachment(b.dataset.openAttachment));
  protectHandlers();
}
const ISO_VIEWS=[['iso-1','Esquina 1','Delante · izquierda'],['iso-2','Esquina 2','Delante · derecha'],['iso-3','Esquina 3','Detrás · derecha'],['iso-4','Esquina 4','Detrás · izquierda']];
async function ensurePiece(){
  const code=$('#recordCode').value.trim();if(!code)throw Error('Escribe primero el código.');
  if(!records.some(r=>r.code===code)||formSnapshot()!==recordBaseline){await saveRecord({preventDefault(){}});openRecord(code);}
  return code;
}
async function saveAttachment(file,recordCode,kind,makeNow,extra={}){
  const stored=kind==='photo'?await compressImage(file):file,ext=kind==='photo'?'jpg':(file.name || 'plano.pdf').split('.').pop().toLowerCase();
  const item={id:uid(),recordCode:recordCode||null,kind,name:kind==='photo'?`foto-${Date.now()}.jpg`:file.name,type:stored.type||mimeFor(ext),ext,size:stored.size,data:await blobToData(stored),createdAt:new Date().toISOString(),thumbnail:null,status:'pending',...extra};
  if(kind==='photo'){item.thumbnail=await imageThumbnail(stored);item.status='ready';}else if(makeNow)await fillThumbnail(item);
  await put('attachments',item);attachments.push({...item,blob:stored});return item;
}
async function addPiecePhoto(file,slot){
  const code=await ensurePiece(),previous=slot?recordAttachments(code,'photo').find(a=>a.viewSlot===slot):null;
  if(previous&&!confirm('¿Sustituir esta vista? La anterior se conservará en el historial.'))return;
  const fresh=await saveAttachment(file,code,'photo',true,slot?{viewSlot:slot}:{});
  // The old attachment remains active if preparing/saving the replacement fails.
  if(previous)try{await bridge.retireAttachment(previous);}catch(e){await bridge.retireAttachment(fresh);throw e;}
  await refresh();renderRecordAttachments(code);toast('Fotografía de referencia guardada y reducida.');
}
async function pickPhoto(camera,slot){
  await ensurePiece();
  const photos=await bridge.photos(camera);
  if(photos){for(const p of photos)await addPiecePhoto(dataToBlob(p.data),slot);if(camera)await bridge.finishCapture();return;}
  const input=$('#extraPhotoInput');input.multiple=!camera;input.dataset.slot=slot||'';
  if(camera)input.setAttribute('capture','environment');else input.removeAttribute('capture');input.click();
}
$('#extraCamera').onclick=()=>pickPhoto(true,'');$('#extraGallery').onclick=()=>pickPhoto(false,'');
$('#extraPhotoInput').onchange=async e=>{const files=[...e.target.files];for(const f of files)await addPiecePhoto(f,e.target.dataset.slot||'');e.target.value='';};
$('#recordPlans').onchange=async e=>{await ensurePiece();await addRecordPlans(e.target.files);};
$('#bulkPlansInput').onchange=e=>addBulkPlans(e.target.files);
async function openAttachment(id){const a=attachments.find(x=>x.id===id);if(a)await bridge.download(await a.blob.arrayBuffer(),a.name,a.type);}
async function renderStorage(){
  if(navigator.storage?.estimate){const e=await navigator.storage.estimate();$('#storageUsage').textContent=`${(e.usage/1048576).toFixed(1)} MB guardados en el dispositivo.`;}
}
async function refresh(){
  records=await all('records');attachments=(await all('attachments')).filter(a=>!a.retired).map(a=>({...a,blob:dataToBlob(a.data)}));
  records.sort((a,b)=>String(a.code).localeCompare(String(b.code),'es',{numeric:true}));
  $('#recordCount').textContent=records.length.toLocaleString('es-ES');
  $('#codeList').innerHTML=records.slice(0,20000).map(r=>`<option value="${esc(r.code)}">${esc(r.name||'')}</option>`).join('');
  await renderSource();if(currentView==='library')renderLibrary();if(currentView==='plans')renderPlans();
}
const saveRecord=$('#recordForm').onsubmit;
$('#exportExcel').onclick=()=>exportExcel();
function fail(e){console.error(e);toast(e.message || 'No se pudo guardar. Los datos anteriores se conservan.');}
let busy=Promise.resolve();
function protectHandlers(){
  $$('button,input,select,form').forEach(n=>{for(const key of ['onclick','onchange','onsubmit']){
    const handler=n[key];if(!handler||handler.protected)return;
    const wrapped=function(e){if(key==='onsubmit')e.preventDefault();busy=busy.then(()=>handler.call(this,e)).catch(fail);return false;};wrapped.protected=true;n[key]=wrapped;
  }});
}
await refresh();showView(bridge.startView || 'search');protectHandlers();window.qcsCodeMatch.ready=true;dispatchEvent(new Event('qcs-ready'));
