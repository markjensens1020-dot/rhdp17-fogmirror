const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../_FOGMIRROR_DASHBOARD/overview.html'), 'utf8');
const source = html.split('/* customer picker (live data) + overlap logic + header title/pill */')[1]
  .split('/* sliding panels')[0];

function harness(fetchImpl, initialToken) {
  const calls = [], notices = [];
  const elements = new Map();
  function element() {
    return { children: [], style: {}, attributes: { placeholder: 'Search customers' }, placeholder: 'Search customers',
      addEventListener() {}, getAttribute(name) { return this.attributes[name]; },
      setAttribute(name, value) { this.attributes[name] = value; },
      removeAttribute(name) { delete this.attributes[name]; },
      appendChild(child) { this.children.push(child); },
      set textContent(value) { this.children = []; this.text = value; }
    };
  }
  const context = {
    window: { __authToken: initialToken }, PROC: [{cur:3},{cur:1}], render() {}, A: 'anonymous-key', SUPA: 'https://example.supabase.co',
    document: { getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
      createElement(tag) { assert.equal(tag, 'option'); return {}; } },
    fetch(url, options) { calls.push({ url, options }); return fetchImpl(url, options); },
    feedAdd(message) { notices.push(message); },
  };
  vm.runInNewContext(source, context);
  return { ...context, calls, notices, elements };
}
const response = (projects) => ({ ok: true, json: async () => ({ projects }) });

test('waits for sign-in and never requests data using the anonymous key', async () => {
  const h = harness(async () => response([]));
  assert.equal(h.calls.length, 0);
  await h.window.onAuthReady(null);
  await h.window.onAuthReady('anonymous-key');
  assert.equal(h.calls.length, 0);
});

test('loads once per access token and uses DOM values for customer names', async () => {
  const name = 'Client " <img src=x onerror=alert(1)>';
  const h = harness(async () => response([{ name }, { name: 'Acme' }, { name }, null, { name: 42 }]));
  await h.window.onAuthReady('user-token');
  await h.window.onAuthReady('user-token');
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].options.headers.Authorization, 'Bearer user-token');
  assert.deepEqual(h.elements.get('custList').children.map(x => x.value), ['Acme', name]);
  assert.equal(h.elements.get('custSel').placeholder, 'Search customers');
  assert.equal(h.elements.get('custSel').attributes['aria-busy'], undefined);
});

test('failed HTTP response is visible and can retry at the next auth notification', async () => {
  let count = 0;
  const h = harness(async () => ++count === 1 ? { ok: false } : response([{ name: 'Recovered' }]));
  await h.window.onAuthReady('token');
  assert.match(h.elements.get('custSel').placeholder, /unavailable/);
  assert.equal(h.notices.length, 1);
  await h.window.onAuthReady('token');
  assert.equal(h.calls.length, 2);
  assert.equal(h.elements.get('custList').children[0].value, 'Recovered');
});

test('malformed data is an error; a valid empty list is an empty account', async () => {
  const bad = harness(async () => ({ ok: true, json: async () => ({ error: 'unauthorized' }) }));
  await bad.window.onAuthReady('token');
  assert.equal(bad.notices.length, 1);
  const empty = harness(async () => response([]));
  await empty.window.onAuthReady('token');
  assert.match(empty.elements.get('custSel').placeholder, /No customers/);
  assert.equal(empty.notices.length, 0);
});

test('an earlier account response cannot overwrite newer data', async () => {
  let finishFirst;
  const h = harness(async (_url, options) => options.headers.Authorization === 'Bearer first'
    ? new Promise(resolve => { finishFirst = resolve; }) : response([{ name: 'Current account' }]));
  const first = h.window.onAuthReady('first');
  await h.window.onAuthReady('second');
  finishFirst(response([{ name: 'Previous account' }]));
  await first;
  assert.equal(h.elements.get('custList').children[0].value, 'Current account');
});

test('supports a session that was restored before the picker initialized', async () => {
  const h = harness(async () => response([{ name: 'Restored' }]), 'restored-token');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.calls.length, 1);
  assert.equal(h.elements.get('custList').children[0].value, 'Restored');
});


test('null session clears current customer and blocks an outstanding old-user result', async () => {
  let finishOld;
  const h = harness(async () => new Promise(resolve => { finishOld = resolve; }));
  const old = h.window.onAuthReady('old-user');
  h.elements.get('custSel').value = 'Previous customer';
  await h.window.onAuthReady(null);
  assert.equal(h.calls.length, 1);
  assert.equal(h.window._proj.length, 0);
  assert.equal(h.elements.get('custList').children.length, 0);
  assert.equal(h.elements.get('custSel').value, '');
  assert.equal(h.elements.get('custSel').attributes['aria-busy'], undefined);
  assert.match(h.elements.get('custSel').placeholder, /Sign in/);
  assert.equal(h.elements.get('custTitle').text, 'Fog Mirror');
  assert.equal(h.elements.get('custPill').style.display, 'none');
  assert.equal(h.elements.get('procHdr').text, 'Processes');
  assert.equal(h.elements.get('schedHdr').text, 'Schedule');
  assert.match(h.elements.get('waiting').text, /select a customer/);
  assert.ok(h.PROC.every(p => p.cur === -1));
  finishOld(response([{ name: 'Previous customer' }]));
  await old;
  assert.equal(h.window._proj.length, 0);
  assert.equal(h.elements.get('custList').children.length, 0);
  assert.match(h.elements.get('custSel').placeholder, /Sign in/);
  assert.equal(h.notices.length, 0);
});

test('signing in again after null can reload the same token and customer list', async () => {
  const h = harness(async () => response([{ name: 'Current customer' }]));
  await h.window.onAuthReady('token');
  await h.window.onAuthReady(null);
  assert.equal(h.elements.get('custList').children.length, 0);
  await h.window.onAuthReady('token');
  assert.equal(h.calls.length, 2);
  assert.deepEqual(h.elements.get('custList').children.map(x => x.value), ['Current customer']);
  assert.equal(h.elements.get('custSel').placeholder, 'Search customers');
});
