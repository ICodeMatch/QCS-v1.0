// Reuse the exact PDF/Excel libraries shipped in the historical, versioned source ZIP.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import JSZip from 'jszip';
const archive=await JSZip.loadAsync(readFileSync(new URL('../../QMS-0.1-proyecto.zip',import.meta.url)));
const names=['jszip.min.js','pdf.min.mjs','pdf.worker.min.mjs'];
const target=new URL('../www/codematch/vendor/',import.meta.url);mkdirSync(target,{recursive:true});
const hashes=JSON.parse(readFileSync(new URL('./codematch-vendor-hashes.json',import.meta.url),'utf8'));
for(const name of names){
 const file=archive.file('QMS/www/codematch/vendor/'+name);
 if(!file)throw Error('Falta la biblioteca histórica '+name);
 const data=await file.async('nodebuffer');
 if(createHash('sha256').update(data).digest('hex')!==hashes[name])throw Error('Ha cambiado la biblioteca histórica '+name);
 writeFileSync(new URL(name,target),data);
}
