const { chromium } = require('playwright');
(async () => { const b=await chromium.launch(); const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ window.FIREBASE_CONFIG=null; });
await p.goto('file://'+require('path').resolve(__dirname,'../index.html')); await p.waitForTimeout(300);
const T=['bếp ơi 4 thập cẩm','bếp ơi cho 4 bát 4 thập cẩm','bếp ơi một 4 thập cẩm','bếp ơi hai bát 4 cá rô không hành','bếp ơi bốn bát thập cẩm','bếp ơi bốn bún thập cẩm','bếp ơi 4 bát thập cẩm','bếp ơi 4 bún cá rô','bếp ơi bốn tô cá thu','bếp ơi 4 trà tắc','bếp ơi 4 thập cẩm cá rô','bếp ơi 4 đặc biệt bánh đa','bếp ơi bốn mươi cá rô','bếp ơi 14 cá rô','bếp ơi 3 cá rô'];
console.log((await p.evaluate(T=>T.map(t=>{ const a=analyse(t,'wake'); return t+' => '+(a.r?a.r.items.map(lineText).join(', '):a.kind); }),T)).join('\n'));
console.log('ERR',errs); await b.close(); })();
