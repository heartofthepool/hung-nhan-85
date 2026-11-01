// Firebase compat giả lập, chạy trong trang
window.FIREBASE_CONFIG={projectId:'mock'};
(function(){
  var L=[]; // listeners
  function snapOf(col,changes){ return {metadata:{fromCache:false},docChanges:function(){return changes;},forEach:function(f){changes.forEach(function(c){f(c.doc);});}}; }
  function docObj(id,data){ return {id:id,exists:data!=null,data:function(){return data&&JSON.parse(JSON.stringify(data));},metadata:{hasPendingWrites:false}}; }
  window.__fbDeliver=function(ch){ L.forEach(function(l){ if(l.col!==ch.col) return;
      if(l.docId){ if(l.docId===ch.id) l.cb(docObj(ch.id,ch.data)); return; }
      if(ch.data && l.min!=null && !(ch.data.createdAt>=l.min)) return;
      l.cb(snapOf(l.col,[{type:ch.data?'modified':'removed',doc:docObj(ch.id,ch.data)}])); }); };
  function query(col,min){ return {
    onSnapshot:function(a,b,c){ var cb=typeof a==='function'?a:b; var l={col:col,min:min,cb:cb}; L.push(l);
      window.__fbBackend({op:'list',col:col}).then(function(rows){ var ch=rows.filter(function(r){return min==null||r.data.createdAt>=min;}).map(function(r){return {type:'added',doc:docObj(r.id,r.data)};}); cb(snapOf(col,ch)); }); return function(){ L.splice(L.indexOf(l),1); }; },
    get:function(){ return window.__fbBackend({op:'list',col:col}).then(function(rows){ var ch=rows.filter(function(r){return min==null||r.data.createdAt>=min;}).map(function(r){return {type:'added',doc:docObj(r.id,r.data)};}); return snapOf(col,ch); }); } }; }
  function ref(col,id){ return {_col:col,_id:id,
    onSnapshot:function(cb){ var l={col:col,docId:id,cb:cb}; L.push(l); window.__fbBackend({op:'get',col:col,id:id}).then(function(d){ cb(docObj(id,d)); }); return function(){}; } }; }
  var db={enablePersistence:function(){return Promise.resolve();},
    collection:function(col){ return {doc:function(id){return ref(col,id);},where:function(f,op,v){return query(col,v);}}; },
    batch:function(){ var ops=[]; return {set:function(r,d){ops.push({op:'set',col:r._col,id:r._id,data:JSON.parse(JSON.stringify(d))});},delete:function(r){ops.push({op:'del',col:r._col,id:r._id});},commit:function(){ return window.__fbBackend({op:'batch',ops:ops}); }}; }};
  var user=JSON.parse(localStorage.getItem('mockUser')||'null'), authCbs=[];
  var auth={get currentUser(){return user;},onAuthStateChanged:function(cb){authCbs.push(cb); setTimeout(function(){cb(user);},10);},
    signInWithEmailAndPassword:function(e,p){ if(p!=='quan123') return Promise.reject({code:'auth/invalid-credential'}); user={email:e}; localStorage.setItem('mockUser',JSON.stringify(user)); authCbs.forEach(function(cb){cb(user);}); return Promise.resolve(); },
    signOut:function(){ user=null; localStorage.removeItem('mockUser'); authCbs.forEach(function(cb){cb(null);}); return Promise.resolve(); }};
  window.firebase={initializeApp:function(){},firestore:function(){return db;},auth:function(){return auth;}};
})();
