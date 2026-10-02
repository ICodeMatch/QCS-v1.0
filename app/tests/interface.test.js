import 'fake-indexeddb/auto';
import {JSDOM} from 'jsdom';
import test from 'node:test';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
const dom=new JSDOM('<button id="back"></button><button id="lock"></button><button id="settingsTop"></button><main id="app"></main><p id="status"></p><nav id="bottomnav"><button data-nav="home"></button><button data-nav="records"></button><button data-nav="settings"></button></nav>',{url:'http://localhost'});
globalThis.window=dom.window;globalThis.document=dom.window.document;window.scrollTo=()=>{};
globalThis.confirm=()=>true;
const $=s=>document.querySelector(s);
async function until(fn){for(let i=0;i<100;i++){if(fn())return;await delay(20);}throw Error('Tiempo agotado');}
test('acceso mínimo de ocho, nombre del módulo y regreso a Inicio desde CodeMatch',async()=>{
 await import('../src/main.js');
 assert.match($('#app').textContent,/mínimo 8/);
 $('#password').value='1234567';$('#enter').click();await until(()=>$('#status').textContent.includes('al menos 8'));
 assert($('#password'));
 $('#password').value='12345678';$('#enter').click();await until(()=>$('#open'));
 assert.match($('#app').textContent,/Herramientas de calidad/);
 $('#open').click();assert($('#codematchFrame'));
 let back=0,leave=0;
 $('#codematchFrame').contentWindow.qcsCodeMatch={goBack:async()=>{back++;return back===1;},prepareLeave:async()=>{leave++;}};
 $('#back').click();await until(()=>back===1);assert($('#codematchFrame'));
 $('#back').click();await until(()=>$('#open'));assert.equal(back,2);
 $('#open').click();$('#codematchFrame').contentWindow.qcsCodeMatch={prepareLeave:async()=>{leave++;}};
 $('[data-nav="settings"]').click();await until(()=>$('#backup'));assert.equal(leave,1);
 $('[data-nav="home"]').click();await until(()=>$('#open'));
 $('[data-nav="records"]').click();await until(()=>document.body.dataset.screen==='records');assert.equal($('#codematchFrame'),null);assert.match($('#app').textContent,/pendiente/);$('#back').click();await until(()=>$('#open'));
 $('#lock').click();await until(()=>$('#password'));$('#password').value='12345678';$('#enter').click();await until(()=>$('#open'));
 $('#openAvisos').click();await until(()=>$('[data-av-type="provider"]'));$('[data-av-type="provider"]').click();await until(()=>$('#avProblem'));
 $('#avProblem').value='Problema de prueba';$('#avProblem').dispatchEvent(new window.Event('input'));$('#avNext').click();await until(()=>$('#avGallery'));
 $('#back').click();await until(()=>$('#avProblem'));assert.equal($('#avProblem').value,'Problema de prueba');
 $('[data-nav="home"]').click();await until(()=>$('#openAvisos'));$('#openAvisos').click();await until(()=>$('#avMonitor'));$('#avMonitor').click();await until(()=>$('[data-av-open]'));
 $('[data-av-open]').click();await until(()=>$('#avProblem'));assert.equal($('#avProblem').value,'Problema de prueba');
 $('[data-nav="settings"]').click();await until(()=>$('#backup'));assert.equal($('#avProblem'),null);

});
