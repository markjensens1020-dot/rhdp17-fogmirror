const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const base = path.join(__dirname, '../_FOGMIRROR_DASHBOARD');
const html = fs.readFileSync(path.join(base, 'forms/04-forms-3-7.html'), 'utf8');
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)][0][1];
const sha = value => crypto.createHash('sha256').update(value).digest('hex');

function field(tagName, value, extra = {}) {
  return {tagName, value, attrs: {}, ...extra,
    setAttribute(name, value) { this.attrs[name] = value; },
    removeAttribute(name) { delete this.attrs[name]; }
  };
}

test('all 127 original form fields, choices, payment terms and agreement wording are unchanged', () => {
  const fields = [...html.matchAll(/<input\b[^>]*>|<textarea\b[^>]*>[\s\S]*?<\/textarea>|<select\b[^>]*>[\s\S]*?<\/select>/gi)].map(m => m[0]);
  assert.equal(fields.length, 127);
  assert.equal(sha(fields.join('\n')), '319a7883ffb279a886fff26e20a539770b239491d75346c712310dc3114fe057');
  const terms = html.slice(html.indexOf('      <div class="section-head"><div class="icon">💰'), html.indexOf('    <div class="submit-area">'));
  assert.equal(sha(terms), 'acacd15a99d373bb747ed356be0b9538579bc5d15c1e4b39d1b524e1b2d64736');
  const cert = html.slice(html.indexOf('      <div class="section-head"><div class="icon">✍️</div><div><h3>Sub Certification'), html.indexOf('    <div class="submit-area">', html.indexOf('<h3>Sub Certification')));
  assert.equal(sha(cert), '0fd9ebc0f27a380107a70335b99b5ad055654f4f1b3b870f833688c756ef06a0');
});

test('the review snapshot captures edited text, numbers, current checks and selected options', () => {
  const context = {};vm.runInNewContext(script, context);
  const original = [
    field('INPUT', 'A "quoted" & reviewed name', {type:'text'}),
    field('INPUT', '700', {type:'number'}),
    field('TEXTAREA', 'Line one\n</textarea><script>not markup</script>'),
    field('INPUT', 'on', {type:'checkbox', checked:true}),
    field('INPUT', 'on', {type:'checkbox', checked:false}),
    field('INPUT', 'phase2', {type:'radio', checked:true}),
    field('SELECT', 'second', {options:[{selected:false},{selected:true}]})
  ];
  const copies = original.map(x => field(x.tagName, 'old', {attrs:{checked:''}, options:[field('OPTION'),field('OPTION')]}));
  copies[6].options[0].attrs.selected='';
  context.copyReviewValues({querySelectorAll:()=>original}, {querySelectorAll:()=>copies});
  assert.equal(copies[0].attrs.value, original[0].value);
  assert.equal(copies[1].attrs.value, '700');
  assert.equal(copies[2].textContent, original[2].value);
  assert.equal(copies[3].attrs.checked, '');
  assert.equal(copies[4].attrs.checked, undefined);
  assert.equal(copies[5].attrs.checked, '');
  assert.equal(copies[6].options[0].attrs.selected, undefined);
  assert.equal(copies[6].options[1].attrs.selected, '');
  assert.equal(original[0].value, 'A "quoted" & reviewed name');
});

function downloadHarness({fail=false, existingStatus=true}={}) {
  let clicks=0, prevented=0, revoked=0, createdStatus=null, recalculated=0;
  const blobs=[], timers=[];
  const status={textContent:'', classList:{add(){}}, scrollIntoView(){}};
  const form={style:{}, closest(){return page;}, prepend(node){createdStatus=node;}};
  const page={querySelector(){return {textContent:'Form 5 of 7 — Review'};}};
  const context={
    document:{
      getElementById(){return existingStatus?status:null;},
      body:{appendChild(){}},
      createElement(tag){if(tag==='div')return status;assert.equal(tag,'a');return {click(){clicks++;},remove(){}};}
    },
    Blob,
    URL:{createObjectURL(blob){if(fail)throw new Error('download unavailable');blobs.push(blob);return 'blob:local-review';},revokeObjectURL(){revoked++;}},
    setTimeout(fn){timers.push(fn);},
    fetch(){throw new Error('No remote writes allowed.');},
    window:{print(){throw new Error('Download must not pretend printing saved a file.');}},
    alert(){throw new Error('No false saved alert.');}
  };
  vm.runInNewContext(script, context);
  context.reviewCopyHtml=()=>'<html>Current reviewed fields only</html>';
  context.calcLive=()=>{recalculated++;};
  return {context,status,form,blobs,timers,event:{target:form,preventDefault(){prevented++;}},
    state(){return {clicks,prevented,revoked,createdStatus,recalculated};}};
}

test('download requests a local file and keeps the form editable without claiming cloud filing', async () => {
  const h=downloadHarness();h.context.sub(h.event,'s5');
  assert.equal(h.state().prevented,1);
  assert.equal(h.state().clicks,1);
  assert.equal(await h.blobs[0].text(),'<html>Current reviewed fields only</html>');
  assert.equal(h.blobs[0].type,'text/html;charset=utf-8');
  assert.match(h.status.textContent,/download requested/);
  assert.match(h.status.textContent,/Nothing was submitted, notified, charged or paid/);
  assert.equal(h.form.style.pointerEvents,undefined);
  h.timers.forEach(fn=>fn());assert.equal(h.state().revoked,1);
});

test('failed download preserves entries and gives a truthful print fallback', () => {
  const h=downloadHarness({fail:true});h.context.sub(h.event,'s5');
  assert.equal(h.state().clicks,0);
  assert.equal(h.form.style.pointerEvents,undefined);
  assert.match(h.status.textContent,/could not be downloaded/);
  assert.match(h.status.textContent,/entries remain here/);
});

test('takeoff recalculates before export and creates its missing status without false saved alerts', () => {
  const h=downloadHarness({existingStatus:false});h.context.calcTakeoff(h.event);
  assert.equal(h.state().recalculated,1);
  assert.equal(h.state().clicks,1);
  assert.equal(h.state().createdStatus.id,'s7');
});

test('form actions describe downloads and retain human payment and email controls', () => {
  assert.equal((html.match(/>Download Review Copy<\/button>/g)||[]).length,5);
  assert.doesNotMatch(html,/Contract sent for signature|Deposit invoice generated|Morpheus notified|Logged to project record in Supabase|PermitBot is checking|payment release is triggered|Takeoff saved!/);
  assert.match(html,/Only humans release payments, edit or send actual emails, or delete records/);
  assert.match(html,/Hold payment when evidence or approval is insufficient/);
  assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
});

test('legacy dashboard scripts parse and its existing simple process bar remains intact', () => {
  const dashboard=fs.readFileSync(path.join(base,'dashboard.html'),'utf8');
  const scripts=[...dashboard.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.equal(scripts.length,2);
  for(const item of scripts)new vm.Script(item[1]);
  const processSection=scripts[0][1].slice(scripts[0][1].indexOf('const L='),scripts[0][1].indexOf('// Paste each customer'));
  const rows={innerHTML:''};
  vm.runInNewContext(processSection,{document:{getElementById(id){assert.equal(id,'rows');return rows;}}});
  assert.equal((rows.innerHTML.match(/class="pseg/g)||[]).length,6);
  assert.match(rows.innerHTML,/<div class="pseg cur">Permit<\/div>/);
});
