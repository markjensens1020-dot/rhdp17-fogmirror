const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../_FOGMIRROR_DASHBOARD/dashboard.html'),'utf8');
const projects=html.split('/* ---- AUTHENTICATED PROJECT READS ---- */')[1].split('/* ---- END AUTHENTICATED PROJECT READS ---- */')[0];
const followups=html.slice(html.indexOf("var FOLLOWUPS='"),html.indexOf('/* ---- END AUTHENTICATED FOLLOW-UP READS ---- */'));
const render=html.slice(html.indexOf('function renderProjects()'),html.indexOf('function setProject(n)'));

function element(){return {children:[],style:{},disabled:false,_html:'',_text:'',
 set innerHTML(value){this._html=value;this._text='';this.children=[];},get innerHTML(){return this._html;},
 set textContent(value){this._text=value;this._html='';this.children=[];},get textContent(){return this._text;},
 appendChild(child){this.children.push(child);}};}
function harness(fetchImpl,initialToken){
 const calls=[],notices=[],previousCalls=[],opens=[];
 const elements=new Map(['sbdesign','sbbuild','projsel','projnote','briefing'].map(id=>[id,element()]));
 const context={SB_ANON:'public-key',
  window:{__authToken:initialToken,onAuthReady(...args){previousCalls.push(args);},open(...args){opens.push(args);}},
  document:{getElementById(id){return elements.get(id)||null;},createElement(tag){assert.equal(tag,'option');return element();}},
  fetch(url,options){calls.push({url,options});return fetchImpl(url,options);},
  toast(message){notices.push(message);},projMatch(){return true;},
 };
 vm.runInNewContext(render+'\n'+projects+'\n'+followups,context);
 return {...context,calls,notices,previousCalls,opens,elements};
}
const ok=payload=>({ok:true,status:200,json:async()=>payload});
const reply=(projects=[],followups=[])=>async url=>url.endsWith('/dashboard-data')?ok({projects}):ok({followups});
const project=(name,side='design')=>({name,phase:'Human review',pct:30,side});
const row=(projectName,draft='Reviewed\nreply text')=>({thread_id:'thread-'+projectName,project:projectName,assigned_to:'Mark',status:'drafted',draft,summary:'Needs review',sender:'source@example.test',age_days:2});
const textOf=(h,id)=>h.elements.get(id).textContent+h.elements.get(id).innerHTML;

test('both lists wait for sign-in and never send anonymous Authorization',async()=>{
 const h=harness(reply([project('Current')],[row('Current')]));
 await Promise.resolve();assert.equal(h.calls.length,0);
 assert.match(textOf(h,'briefing'),/Sign in/);assert.match(textOf(h,'sbdesign'),/Sign in/);
 await h.window.onAuthReady('public-key');assert.equal(h.calls.length,0);
 await h.window.onAuthReady('user-token','mark@example.test');
 assert.equal(h.calls.length,2);
 for(const call of h.calls){assert.equal(call.options.headers.Authorization,'Bearer user-token');assert.equal(call.options.headers.apikey,'public-key');assert.equal(call.options.method,undefined);}
 assert.match(textOf(h,'sbdesign'),/Current/);assert.match(textOf(h,'briefing'),/Current/);
 await h.window.onAuthReady('user-token','mark@example.test');assert.equal(h.calls.length,2);
 assert.equal(h.previousCalls.length,3);
});

test('403 is denied access, never an empty project list or all-caught-up mail claim',async()=>{
 const h=harness(async()=>({ok:false,status:403,json:async()=>({error:'Forbidden'})}));
 await h.window.onAuthReady('user-token');
 assert.match(textOf(h,'sbdesign'),/access was denied/);assert.match(textOf(h,'briefing'),/access was denied/);
 assert.doesNotMatch(textOf(h,'briefing'),/caught up|No open/);
 assert.equal(h.window._projects.length,0);assert.equal(h.window._fuAll.length,0);
});

test('malformed successful payloads produce errors; valid empty arrays produce empty states',async()=>{
 const bad=harness(async()=>ok({error:'Invalid payload',projects:[],followups:[]}));
 await bad.window.onAuthReady('token');
 assert.match(textOf(bad,'sbdesign'),/could not load/);assert.match(textOf(bad,'briefing'),/could not load/);
 const empty=harness(reply());await empty.window.onAuthReady('token');
 assert.match(textOf(empty,'sbdesign'),/No projects were returned/);
 assert.match(textOf(empty,'briefing'),/No open email follow-ups were returned/);
 assert.doesNotMatch(textOf(empty,'briefing'),/caught up|Sweeps/);
});

test('draft text and unsafe-looking customer values are retained as text',async()=>{
 const name='A "quoted" <img src=x onerror=boom> customer',draft='Keep the full reply.\n<draft>&"end"';
 const h=harness(reply([project(name)],[row(name,draft)]));await h.window.onAuthReady('token');
 assert.equal(h.window._fuAll[0].draft,draft);
 assert.match(textOf(h,'briefing'),/Keep the full reply\.\n&lt;draft&gt;&amp;"end"/);
 assert.doesNotMatch(textOf(h,'briefing'),/<img|fnApprove\(/);
 assert.doesNotMatch(textOf(h,'sbdesign'),/<img/);
 assert.equal(h.elements.get('projsel').children[1].value,name);
 assert.equal(h.calls.filter(c=>c.options.method==='POST').length,0);
});

test('earlier-account responses cannot replace the new account’s projects or drafts',async()=>{
 const pending=[];
 const h=harness(async(url,options)=>options.headers.Authorization==='Bearer old'
  ?new Promise(resolve=>pending.push({url,resolve}))
  :reply([project('New account')],[row('New account','New draft')])(url));
 const old=h.window.onAuthReady('old');assert.equal(pending.length,2);
 await h.window.onAuthReady('new');
 pending.forEach(p=>p.resolve(p.url.endsWith('/dashboard-data')?ok({projects:[project('Old account')]}):ok({followups:[row('Old account','Old draft')]})));
 await old;
 assert.match(textOf(h,'sbdesign'),/New account/);assert.doesNotMatch(textOf(h,'sbdesign'),/Old account/);
 assert.match(textOf(h,'briefing'),/New draft/);assert.doesNotMatch(textOf(h,'briefing'),/Old draft/);
});

test('sign-out clears both lists and rejects pending old-account responses',async()=>{
 const pending=[];const h=harness(async url=>new Promise(resolve=>pending.push({url,resolve})));
 const first=h.window.onAuthReady('token');await h.window.onAuthReady(null);
 assert.match(textOf(h,'briefing'),/Sign in/);assert.match(textOf(h,'sbdesign'),/Sign in/);
 pending.forEach(p=>p.resolve(p.url.endsWith('/dashboard-data')?ok({projects:[project('Old')]}):ok({followups:[row('Old')]})));
 await first;
 assert.equal(h.window._fuAll.length,0);assert.equal(h.window._projects.length,0);
 assert.doesNotMatch(textOf(h,'briefing'),/Old/);
});

test('a restored authgate session loads both lists once',async()=>{
 const h=harness(reply([project('Restored')],[row('Restored')]),'restored');
 await h.window.onAuthReady('restored');
 assert.equal(h.calls.length,2);assert.match(textOf(h,'briefing'),/Restored/);
});

test('read restoration cannot invoke an unverified draft write or fabricated sent-status update',async()=>{
 const h=harness(reply([project('Client')],[row('Client')]));
 await h.window.onAuthReady('token');
 h.fnDraft(0,{});h.fnApprove();
 assert.equal(h.calls.filter(c=>c.options.method==='POST').length,0);
 assert.match(h.notices[0],/paused until its mailbox behavior is verified/);
 assert.match(h.notices[1],/does not mark a message sent/);
 const pending=h.fuBtns(0,{status:'pending'});
 assert.match(pending,/<button disabled/);assert.match(pending,/Open Outlook/);
 assert.doesNotMatch(pending,/onclick="fnDraft/);
 assert.doesNotMatch(followups,/method:\s*'POST'/);
});
