const { chromium } = require('playwright');
(async () => { const b=await chromium.launch(); const errs=[]; const ctx=await b.newContext({viewport:{width:1024,height:768},screen:{width:1024,height:768}}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ window.FIREBASE_CONFIG=null; });
await p.goto('file://'+require('path').resolve(__dirname,'../index.html')); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
await p.click('[data-gosales=cs1]');
const T=['bếp ơi chiều nay có đoàn 50 người nhé','bếp ơi khách tập thể 30 người lúc 11 giờ','bếp ơi đoàn 20 người 15 cá rô 5 đặc biệt lúc bảy giờ rưỡi','chiều nay có đoàn 50 người nhé','bếp ơi hai cá rô'];
console.log((await p.evaluate(T=>T.map(t=>{ const a=analyse(t,'wake'); return t+' => '+a.kind+' group='+a.group+' people='+a.people+' time='+a.time+' items='+(a.r?a.r.items.map(lineText).join(', '):''); }),T)).join('\n'));
for(const t of T){ await p.evaluate(t=>handleUtterance(t,'wake'),t); await p.waitForTimeout(50); }
await p.evaluate(()=>handleUtterance('chiều nay có đoàn 50 người nhé','ptt'));
await p.waitForTimeout(400);
console.log('left:', await p.evaluate(()=>[...document.querySelectorAll('#colL .card')].map(c=>c.innerText.replace(/\s+/g,' '))));
await p.screenshot({path:'grp3.png'});
// history button
const ids=await p.evaluate(()=>S.orders.filter(o=>!o.group).map(o=>o.id));
for(const id of ids){ await p.evaluate(id=>markOk(id),id); await p.evaluate(id=>markOk(id),id); }
await p.waitForTimeout(700);
console.log('right scroll content cards:', await p.evaluate(()=>document.querySelectorAll('#colR .card').length), 'btn:', await p.textContent('[data-act=hidden]'));
await p.click('[data-act=hidden]'); await p.waitForTimeout(200);
console.log('history modal:', await p.evaluate(()=>document.querySelector('.modal h3').textContent), await p.evaluate(()=>document.querySelectorAll('.modal .hrow').length));
console.log('ERR',errs); await b.close(); })();
