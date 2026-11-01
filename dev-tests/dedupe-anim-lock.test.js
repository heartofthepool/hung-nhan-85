const { chromium } = require('playwright');
(async () => { const b=await chromium.launch(); const errs=[];
const ctx=await b.newContext({viewport:{width:1024,height:768}}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ window.FIREBASE_CONFIG=null; });
await p.goto('file://'+require('path').resolve(__dirname,'../index.html')); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
await p.click('[data-gosales=cs1]');
// Safari: bản nháp rồi bản chốt cùng câu
await p.evaluate(()=>{ handleUtterance('Bếp ơi cho một tô cá bò và một tô đặc biệt','wake'); handleUtterance('bếp ơi cho một tô cá bò và một tô đặc biệt.','wake'); });
console.log('orders after dup:', await p.evaluate(()=>S.orders.length), await p.evaluate(()=>S.orders.map(o=>o.lines.map(lineText).join(', '))));
// cumulative results simulation through V.res
console.log('cumulative collapse:', await p.evaluate(()=>{ var got=null; var save=window.handleUtterance; V.base=0; var mk=(t,f)=>{ var r=[{transcript:t}]; r.isFinal=f; return r; };
  var ev={results:[mk('bếp ơi cho một tô cá bò',true), mk('bếp ơi cho một tô cá bò và một tô đặc biệt',true)]}; window.liveHeard=function(){}; V.ptt=null; V.res(ev); clearTimeout(V.timer); return document.querySelector('#heardText').textContent||'(set by liveHeard)'; }));
// PTT với 2 câu giống nhau vẫn lên 2 đơn
await p.evaluate(()=>{ handleUtterance('hai cá rô','ptt'); handleUtterance('hai cá rô','ptt'); });
console.log('ptt repeat orders:', await p.evaluate(()=>S.orders.length));
// animation: mark first pending as done → ghost exists
const id=await p.evaluate(()=>S.orders[0].id);
await p.click(`#colL [data-ok="${id}"]`); await p.waitForTimeout(250);
console.log('ghost flying:', await p.evaluate(()=>document.querySelectorAll('.ghostwrap').length));
await p.screenshot({path:'fly.png'}); await p.waitForTimeout(700);
console.log('ghost gone:', await p.evaluate(()=>document.querySelectorAll('.ghostwrap').length), 'served:', await p.evaluate(()=>document.querySelectorAll('#rActive .card').length));
// local rapid taps allowed
const ids=await p.evaluate(()=>[...document.querySelectorAll('#colL .card')].map(c=>c.dataset.id));
for(const i of ids){ await p.click(`#colL [data-ok="${i}"]`); }
console.log('rapid local taps -> left count:', await p.evaluate(()=>document.querySelectorAll('#colL .card').length));
// remote change → lock 1s
await p.evaluate(()=>{ handleUtterance('bếp ơi một cá thu','wake'); });
await p.evaluate(()=>{ const o=S.orders.find(o=>o.status==='served'); o.status='paid'; o.paidAt=Date.now(); renderCause='remote'; renderSales(); });
const lid=await p.evaluate(()=>document.querySelector('#colL .card').dataset.id);
await p.evaluate(id=>document.querySelector(`#colL [data-ok="${id}"]`).click(), lid);
console.log('tap during lock ignored:', await p.evaluate(id=>S.orders.find(o=>o.id===id).status, lid));
await p.waitForTimeout(1100); await p.evaluate(id=>document.querySelector(`#colL [data-ok="${id}"]`).click(), lid);
console.log('after 1s tap works:', await p.evaluate(id=>S.orders.find(o=>o.id===id).status, lid));
// PTT bar
await p.evaluate(()=>{ overlay(true,'ĐANG NGHE · thả tay ra để chốt'); document.querySelector('#ovLive').textContent='bếp ơi hai bánh đa cá rô chả tròn'; });
await p.waitForTimeout(300); await p.screenshot({path:'pttbar.png'});
console.log('ERR',errs); await b.close(); })();
