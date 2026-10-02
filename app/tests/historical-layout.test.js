import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import * as decimal from '../src/decimal.js';
import JSZip from 'jszip';
import {setTimeout as delay} from 'node:timers/promises';
test('pantallas históricas: biblioteca, ficha, Volver y sumatorio en su campo original',async()=>{
 const html=await readFile(new URL('../www/codematch/index.html',import.meta.url),'utf8');
 let source=await readFile(new URL('../www/codematch/app.js',import.meta.url),'utf8');
 const d=new JSDOM(html,{url:'http://localhost/codematch/index.html',runScripts:'outside-only'}),w=d.window;
 w.scrollTo=()=>{};w.confirm=()=>true;w.JSZip=JSZip;w.pdfjsLib={GlobalWorkerOptions:{}};
 Object.assign(w,decimal);
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 const rows=[],history=[];
 w.qcsCodeMatchBridge={all:async store=>store==='records'?rows:store==='recordHistory'?history:[],get:async()=>undefined,
 put:async(store,value)=>{if(store==='records'){const i=rows.findIndex(r=>r.code===value.code);if(i<0)rows.push(value);else rows[i]=value;}else history.push(value);},home:async()=>{},settings:async()=>{}};
 source=source.replace(/^import .*;\n/gm,'');
 await w.eval('(async()=>{'+source+'})()');
 const $=s=>w.document.querySelector(s);
 async function tick(fn){for(let i=0;i<100;i++){if(fn())return;await delay(10);}throw Error('Tiempo agotado');}
 $('.bottom-nav [data-view="library"]').click();await tick(()=>$('#libraryView.active'));
 $('#newRecordBtn').click();await tick(()=>$('#recordDialog').open);
 $('#recordCode').value='01';$('#recordName').value='Pieza';$('#developedLength').value='5,6';
 await w.qcsCodeMatch.goBack();assert(!$('#recordDialog').open);assert.equal(rows[0].name,'Pieza');
 await w.qcsCodeMatch.goBack();assert($('#searchView.active'));
 $('[data-calc-target="searchWidth"]').click();await tick(()=>$('#foldCalcDialog').open);
 assert.equal(w.document.querySelectorAll('#foldCotaList input').length,8);
 $('[data-cota-index="0"]').value='1,005';$('[data-cota-index="0"]').dispatchEvent(new w.Event('input'));
 $('[data-cota-index="1"]').value='2';$('[data-cota-index="1"]').dispatchEvent(new w.Event('input'));
 assert.equal($('#foldCalcTotal').textContent,'3,005 mm');$('#applyCotasBtn').click();await tick(()=>!$('#foldCalcDialog').open);
 assert.equal($('#searchWidth').value,'3,005');assert.equal($('#measureMode').value,'developed');
 w.close();
});
