const { chromium } = require('playwright'); const fs=require('fs');
(async () => {
  const b = await chromium.launch();
  const store={orders:{},config:{}}; const pages=[];
  async function mk(name){
    const ctx=await b.newContext({viewport:{width:1024,height:768}}); const p=await ctx.newPage();
    p.on('pageerror',e=>console.log(name,'ERR',e.message)); p.on('console',m=>{ if(m.type()==='error'||m.type()==='warning') console.log(name,'console',m.text()); });
    await p.exposeFunction('__fbBackend', async (req)=>{
      if(req.op==='list') return Object.entries(store[req.col]).map(([id,data])=>({id,data}));
      if(req.op==='get') return store[req.col][req.id]||null;
      if(req.op==='batch'){ for(const o of req.ops){ if(o.op==='set') store[o.col][o.id]=o.data; else delete store[o.col][o.id]; }
        for(const pg of pages){ for(const o of req.ops){ await pg.evaluate(ch=>window.__fbDeliver(ch),{col:o.col,id:o.id,data:o.op==='set'?o.data:null}).catch(()=>{}); } } return true; }
    });
    await p.addInitScript({path:require('path').resolve(__dirname,'mockfb.js')});
    await p.goto('file://'+require('path').resolve(__dirname,'../index.html')); pages.push(p); return p;
  }
  const A=await mk('QUẦY'), K=await mk('BẾP');
  await A.waitForTimeout(300);
  console.log('login form visible:', await A.isVisible('#fbForm'));
  for(const p of [A,K]){ await p.fill('#fbEmail','quan@hungnhan85.vn'); await p.fill('#fbPass','sai'); await p.click('#fbForm button'); await p.waitForTimeout(200);}
  console.log('wrong pw msg:', await A.textContent('#fbErr'));
  for(const p of [A,K]){ await p.fill('#fbPass','quan123'); await p.click('#fbForm button'); await p.waitForTimeout(500); }
  console.log('after login start visible:', await A.isVisible('#start'), 'config in store:', !!store.config.main);
  await A.click('[data-gosales=cs1]'); await K.click('[data-gosales=cs1]');
  await A.click('#tapStart').catch(()=>{});
  await A.evaluate(()=>handleUtterance('bếp ơi hai cá rô chả tròn, một coca','wake')); await A.waitForTimeout(300);
  console.log('BẾP sees left:', await K.evaluate(()=>[...document.querySelectorAll('#colL .card')].map(c=>c.innerText.replace(/\s+/g,' '))));
  // kitchen marks done
  const id=await K.evaluate(()=>S.orders[0].id); await K.click(`#colL [data-ok="${id}"]`); await K.waitForTimeout(300);
  console.log('QUẦY right col:', await A.evaluate(()=>[...document.querySelectorAll('#rActive .card')].map(c=>c.innerText.replace(/\s+/g,' '))), 'left:', await A.evaluate(()=>document.querySelectorAll('#colL .card').length));
  // counter adds drink by editing on QUẦY
  await A.evaluate(id=>editByText(id,'thêm hai trà tắc'),id); await A.waitForTimeout(300);
  console.log('BẾP sees edit:', await K.evaluate(()=>S.orders[0].lines.map(lineText).join(', ')));
  // undo on kitchen
  await K.evaluate(()=>{}); 
  // admin menu change propagates
  await K.evaluate(()=>{ S.menu.bowls[0].price=60000; DB.save(); }); await K.waitForTimeout(300);
  console.log('QUẦY sees new price:', await A.evaluate(()=>S.menu.bowls[0].price));
  // reload QUẦY: comes back to sales, data intact
  await A.reload(); await A.waitForTimeout(800);
  console.log('after reload sales on:', await A.evaluate(()=>document.querySelector('#sales').classList.contains('on')), 'orders:', await A.evaluate(()=>S.orders.length), 'store orders:', Object.keys(store.orders).length);
  // stale cache protection: K pays order while A offline-ish; then A reloads
  await K.click(`#colR [data-ok="${id}"]`); await K.waitForTimeout(300);
  console.log('store status:', store.orders[id].status, '| QUẦY status:', await A.evaluate(id=>S.orders.find(o=>o.id===id).status,id));
  await A.reload(); await A.waitForTimeout(800);
  console.log('after 2nd reload store status still:', store.orders[id].status);
  await b.close();
})();
