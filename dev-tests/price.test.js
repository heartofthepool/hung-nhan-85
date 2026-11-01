const { chromium } = require('playwright');
(async () => { const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1024,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ window.FIREBASE_CONFIG=null; });
await p.goto('file://'+require('path').resolve(__dirname,'../index.html')); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
const T=['bếp ơi 1 bún thập cẩm 40k','bếp ơi một thập cẩm bốn mươi nghìn','bếp ơi hai cá rô 40 nghìn một coca','bếp ơi một đặc biệt 60.000đ','bếp ơi một cá thu giá 50 ngàn thêm chả','bếp ơi 45k một thập cẩm','bếp ơi hai cá rô','bếp ơi ba cá thu 8h','bếp ơi một cá rô không giá','bếp ơi một cá rô nhiều giá'];
console.log((await p.evaluate(T=>T.map(t=>{ const a=analyse(t,'wake'); return t+' => '+a.r.items.map(l=>lineText(l)+' = '+lineTotal(l)).join(' | ')+' | time='+a.time; }),T)).join('\n'));
await p.click('[data-gosales=cs1]'); await p.evaluate(()=>{ handleUtterance('bếp ơi 1 bún thập cẩm 40k, hai cá rô','wake'); });
await p.waitForTimeout(400); await p.screenshot({path:'price.png'});
console.log('ERR',errs); await b.close(); })();
