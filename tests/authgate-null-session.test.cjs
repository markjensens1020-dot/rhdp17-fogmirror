const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../_FOGMIRROR_DASHBOARD');
const gate=fs.readFileSync(path.join(root,'authgate.js'),'utf8');
const applySource=gate.slice(gate.indexOf('    function apply(session)'),gate.indexOf('    sb.auth.onAuthStateChange'));

function harness(callback){
 const chip={style:{display:'flex'}},shown=[],emails=[];
 const context={window:{__authToken:'previous-token',__authEmail:'previous@example.test'},
  document:{getElementById(id){assert.equal(id,'achip');return chip;}},
  showGate(value){shown.push(value);},showChip(email){emails.push(email);}};
 context.window.onAuthReady=(...args)=>callback?.(context,...args);
 vm.runInNewContext(applySource,context);
 return {...context,chip,shown,emails};
}

test('null session clears token and email before notifying the page and keeps the sign-in overlay',()=>{
 const calls=[];
 const h=harness((context,token,email)=>{
  assert.equal(context.window.__authToken,null);assert.equal(context.window.__authEmail,null);
  calls.push({token,email});
 });
 h.apply(null);
 assert.deepEqual(calls,[{token:null,email:null}]);
 assert.deepEqual(h.shown,[true]);assert.equal(h.chip.style.display,'none');
});

test('missing or throwing consumer callback cannot leave stale credentials behind',()=>{
 const missing=harness();delete missing.window.onAuthReady;missing.apply(null);
 assert.equal(missing.window.__authToken,null);assert.equal(missing.window.__authEmail,null);
 const throwing=harness(()=>{throw new Error('consumer failure');});
 assert.doesNotThrow(()=>throwing.apply(null));
 assert.equal(throwing.window.__authToken,null);assert.equal(throwing.chip.style.display,'none');
});

test('sign-in following a null session preserves existing token, email and callback behavior',()=>{
 const calls=[],h=harness((_context,token,email)=>calls.push({token,email}));
 h.apply(null);h.apply({access_token:'new-user-token',user:{email:'Mark@Example.test'}});
 assert.equal(h.window.__authToken,'new-user-token');assert.equal(h.window.__authEmail,'mark@example.test');
 assert.deepEqual(h.shown,[true,false]);assert.deepEqual(h.emails,['mark@example.test']);
 assert.deepEqual(calls.at(-1),{token:'new-user-token',email:'mark@example.test'});
});

test('current overview accepts null notification without a new data request',async()=>{
 const overview=fs.readFileSync(path.join(root,'overview.html'),'utf8');
 const picker=overview.split('/* customer picker (live data) + overlap logic + header title/pill */')[1].split('/* sliding panels')[0];
 const elements=new Map(),calls=[];
 function el(){return {children:[],style:{},addEventListener(){},getAttribute(){return 'Search customers';},
  setAttribute(){},removeAttribute(){},appendChild(child){this.children.push(child);},
  set textContent(value){this.children=[];}};}
 const context={window:{},A:'anonymous-key',SUPA:'https://example.supabase.co',
  document:{getElementById(id){if(!elements.has(id))elements.set(id,el());return elements.get(id);},createElement(){return {}; }},
  fetch(url,options){calls.push({url,options});return Promise.resolve({ok:true,json:async()=>({projects:[{name:'Example'}]})});},
  feedAdd(){},showGate(){},showChip(){}
 };
 vm.runInNewContext(picker+'\n'+applySource,context);
 await context.window.onAuthReady('token');assert.equal(calls.length,1);
 assert.doesNotThrow(()=>context.apply(null));
 assert.equal(calls.length,1);assert.equal(context.window.__authToken,null);assert.equal(context.window.__authEmail,null);
});

test('shared gate remains valid JavaScript',()=>{assert.doesNotThrow(()=>new vm.Script(gate));});
