const { chromium } = require('playwright');
(async () => { const b=await chromium.launch(); const errs=[];
for(const [vp,n] of [[{width:1024,height:768},'tb_ipad.png'],[{width:390,height:844},'tb_phone.png']]){
const ctx=await b.newContext({viewport:vp,screen:vp}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ window.FIREBASE_CONFIG=null; });
await p.goto('file://'+require('path').resolve(__dirname,'../index.html')); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
if(n==='tb_ipad.png'){ const T=['bếp ơi bàn 5 hai cá rô','bếp ơi hai cá rô bàn số 12 một coca','bếp ơi một thập cẩm bàn năm','bếp ơi đoàn 20 người bàn 3 lúc 7 giờ','bếp ơi hai cá rô'];
 console.log((await p.evaluate(T=>T.map(t=>{ const a=analyse(t,'wake'); return t+' => '+(a.r?a.r.items.map(lineText).join(', '):'')+' | bàn='+a.table+' time='+a.time; }),T)).join('\n')); }
await p.click('[data-gosales=cs1]');
await p.evaluate(()=>{ ['bếp ơi bàn 5 hai cá rô chả tròn','bếp ơi hai cá rô bàn số 12 một coca','bếp ơi đoàn 20 người bàn 3 lúc 7 giờ','bếp ơi một thập cẩm'].forEach(t=>handleUtterance(t,'wake')); markOk(S.orders[1].id); });
await p.evaluate(()=>{ editByText(S.orders[3].id,'bàn 7'); });
console.log(n,'edit table:', await p.evaluate(()=>S.orders[3].table), await p.textContent('#micText'));
await p.waitForTimeout(800); await p.screenshot({path:n}); }
console.log('ERR',errs); await b.close(); })();
