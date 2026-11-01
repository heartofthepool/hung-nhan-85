const { chromium } = require('playwright');
(async () => { const b=await chromium.launch(); const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ window.FIREBASE_CONFIG=null; });
await p.goto('file://'+require('path').resolve(__dirname,'../index.html')); await p.waitForTimeout(300);
const T=['bếp ơi một bún 10cẩm','Bếp ơi hai Bún 10 Câm','bếp ơi một mười khẩm','bếp ơi một bún thâp cam','bếp ơi 2 bun 10 cam','Bếp ơi một Bún 10 Cẩm','bếp ơi hai bún 10 cẩm không hành','bếp ơi 1 bún tập cẩm','bếp ơi một thấp cẩm cá rô','bếp ơi 10 cẩm bánh đa 40k','bếp ơi một bún thập cẩm','bếp ơi mười cá rô','bếp ơi 10 cá rô','bếp ơi một Bún Thập Cẩm bàn 10'];
console.log((await p.evaluate(T=>T.map(t=>{ const a=analyse(t,'wake'); return t+' => '+(a.r?a.r.items.map(lineText).join(', '):a.kind)+(a.table?' | bàn '+a.table:''); }),T)).join('\n'));
console.log('ERR',errs); await b.close(); })();
