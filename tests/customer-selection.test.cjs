const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../_FOGMIRROR_DASHBOARD/overview.html'), 'utf8');
const source = html.split('/* customer picker (live data) + overlap logic + header title/pill */')[1].split('/* sliding panels')[0];
const escSource = html.slice(html.indexOf('function esc(t)'), html.indexOf('\n', html.indexOf('function esc(t)')));
function harness() {
  const notices = [], elements = new Map();
  function element() {
    const events = new Map();
    return { value: '', style: {}, textContent: '', innerHTML: '', children: [], placeholder: 'Customer',
      addEventListener(type, fn) { events.set(type, fn); },
      dispatch(type, event = {}) { events.get(type)?.(event); },
      getAttribute() { return 'Customer'; }, setAttribute() {}, removeAttribute() {}, appendChild(c) { this.children.push(c); } };
  }
  const ctx = {window:{}, A:'public-test-key', SUPA:'https://synthetic.invalid',
    PROC:Array.from({length:5},()=>({cur:-1,steps:['One','Two','Three']})), render(){},
    document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},createElement(){return element();}},
    fetch(){throw new Error('Customer selection must use the already-loaded list without network');},
    feedAdd(message){notices.push(message);}};
  vm.runInNewContext(escSource+'\n'+source,ctx);
  ctx.window._proj = [{name:'Example Project',pct:50,status:'In review',waiting:[{who:'Design reviewer',when:'Friday'}]}, {name:'Example Project Annex',pct:10,status:'Intake'}];
  const input=elements.get('custSel');
  elements.set('waiting',element());elements.get('waiting').innerHTML='Pick a customer';
  return {ctx,input,notices,elements};
}
function loaded(h){assert.equal(h.elements.get('custTitle').textContent,'Example Project');assert.match(h.elements.get('waiting').innerHTML,/Design reviewer/);}
test('existing committed change updates customer details without opening files or making requests',()=>{
 const h=harness();h.input.value='Example Project';h.input.dispatch('change');loaded(h);
});
test('an exact datalist input selection updates customer details immediately',()=>{
 const h=harness();h.input.value='Example Project';h.input.dispatch('input');loaded(h);
});
test('Enter commits a case-insensitive trimmed exact customer value',()=>{
 const h=harness();h.input.value='  example project  ';let prevented=false;
 h.input.dispatch('keydown',{key:'Enter',preventDefault(){prevented=true;}});loaded(h);assert.equal(prevented,true);
});
test('blank input and ambiguous partial changes never select the first project',()=>{
 const h=harness();h.input.value='';h.input.dispatch('change');assert.equal(h.elements.get('waiting').innerHTML,'Pick a customer');
 h.input.value='Example';h.input.dispatch('change');assert.equal(h.elements.get('waiting').innerHTML,'Pick a customer');
});
test('input then Enter then change records one selection and keeps exact-match priority',()=>{
 const h=harness();h.ctx.window._proj.reverse();h.input.value='Example Project';
 h.input.dispatch('input');h.input.dispatch('keydown',{key:'Enter',preventDefault(){}});h.input.dispatch('change');loaded(h);
 assert.equal(h.notices.filter(t=>t.startsWith('Loaded ')).length,1);
});
test('typing a partial name does not replace the current customer',()=>{
 const h=harness();h.input.value='Example Project';h.input.dispatch('change');loaded(h);
 h.input.value='Example Pro';h.input.dispatch('input');loaded(h);
});
