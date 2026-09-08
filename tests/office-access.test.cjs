const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '../_FOGMIRROR_DASHBOARD');
const overview = fs.readFileSync(path.join(root, 'overview.html'), 'utf8');
const cardSource = overview.slice(overview.indexOf('function emailCard(doc)'), overview.indexOf('/* 📸 SCREENSHOT BUTTON'));

function cardHarness(email) {
  const events = new Map(), elements = new Map(), opens = [], copied = [], notices = [];
  function control(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      value: '', textContent: '', addEventListener(type, callback) { events.set(selector + ':' + type, callback); }
    });
    return elements.get(selector);
  }
  const card = { innerHTML: '', querySelector: control };
  const context = {
    document: { createElement() { return card; } },
    navigator: { clipboard: { async writeText(value) { copied.push(value); } } },
    window: { open(...args) { opens.push(args); } },
    feedAdd(text) { notices.push(text); },
    fetch() { throw new Error('This email preview must not call a mailbox or send endpoint.'); }
  };
  vm.runInNewContext(cardSource, context);
  const doc = { kind: 'eml', title: email.subject, email };
  context.emailCard(doc);
  return { card, doc, opens, copied, notices, control,
    click(selector) { events.get(selector + ':click')(); } };
}

const example = {
  to: ['mark@example.test'], cc: ['review@example.test'],
  from: 'old-unverified@example.test', subject: 'Review A&B?', body: 'A proposal only.\nNo email sent.'
};

test('staging keeps model text as field values and makes no mailbox or navigation call', () => {
  const injection = '\" autofocus onfocus=alert(1) <img src=x>';
  const h = cardHarness({ ...example, subject: injection, body: '</textarea><script>alert(1)</script>' });
  assert.equal(h.control('.msub').value, injection);
  assert.equal(h.control('.mbody').value, '</textarea><script>alert(1)</script>');
  assert.doesNotMatch(h.card.innerHTML, /autofocus|onfocus|<script>|old-unverified/);
  assert.equal(h.opens.length, 0);
  assert.equal(h.copied.length, 0);
  assert.equal(h.doc.sent, undefined);
});

test('a person opens the current reviewed text in Outlook without sending or forcing an old mailbox', () => {
  const h = cardHarness(example);
  h.control('.mto').value = 'changed@example.test';
  h.control('.msub').value = 'Human edit: A&B + "quotes"';
  h.control('.mbody').value = 'Line one\nLine two & account=other';
  h.click('.wbsend');
  assert.equal(h.opens.length, 1);
  const [address, target, features] = h.opens[0], url = new URL(address);
  assert.equal(url.origin, 'https://outlook.office.com');
  assert.equal(url.pathname, '/mail/deeplink/compose');
  assert.equal(url.searchParams.get('to'), 'changed@example.test');
  assert.equal(url.searchParams.get('cc'), example.cc[0]);
  assert.equal(url.searchParams.get('subject'), h.control('.msub').value);
  assert.equal(url.searchParams.get('body'), h.control('.mbody').value);
  assert.equal(url.searchParams.has('from'), false);
  assert.equal(url.searchParams.has('account'), false);
  assert.equal(target, '_blank');
  assert.equal(features, 'noopener');
  assert.equal(h.doc.sent, undefined);
  assert.match(h.control('.mstate').textContent, /You send it there/);
});

test('an incomplete proposed email stays on the dashboard with a useful message', () => {
  const h = cardHarness(example);
  h.control('.mto').value = '';
  h.click('.wbsend');
  assert.equal(h.opens.length, 0);
  assert.match(h.control('.mstate').textContent, /Add To, Subject, and Body/);
});

test('copy preserves edited text and does not open or alter a mailbox', async () => {
  const h = cardHarness(example);
  h.control('.mbody').value = 'Human correction\nLine two';
  h.click('.wbcopy');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.copied[0], 'To: mark@example.test\nCc: review@example.test\nSubject: Review A&B?\n\nHuman correction\nLine two');
  assert.equal(h.opens.length, 0);
  assert.equal(h.doc.sent, undefined);
  assert.match(h.control('.mstate').textContent, /Copied/);
});

test('the served overview links the verified company library and original forms without embedding them', () => {
  for (const href of [
    'https://outlook.office.com/mail/deeplink/compose',
    'https://richardharodraftingand.sharepoint.com/sites/TeamRHDP17/Shared%20Documents',
    'https://richardharodraftingand.sharepoint.com/sites/TeamRHDP17/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FTeamRHDP17%2FShared%20Documents%2F%5FFORMS'
  ]) {
    const link = overview.match(new RegExp('<a href="' + href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^>]*>'));
    assert.ok(link, 'missing existing company entry point ' + href);
    assert.match(link[0], /target="_blank"/);
    assert.match(link[0], /rel="noopener"/);
    assert.doesNotMatch(link[0], /data-panel/);
  }
  assert.doesNotMatch(overview, /fog-mirror-send|Approve &amp; Send|filed to Customers/);
});

test('AutoCAD control targets AutoCAD Web and all seven dashboard forms resolve locally', () => {
  const dashboard = fs.readFileSync(path.join(root, 'dashboard.html'), 'utf8');
  assert.match(dashboard, /title="Open AutoCAD Web[^>]*https:\/\/web\.autocad\.com\//);
  const forms = fs.readFileSync(path.join(root, 'forms.html'), 'utf8');
  const links = [...forms.matchAll(/href="\.\/forms\/([^"?]+)"/g)];
  assert.equal(links.length, 7);
  for (const link of links) assert.ok(fs.existsSync(path.join(root, 'forms', link[1])));
});
