const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const overview = fs.readFileSync(path.join(__dirname, '../_FOGMIRROR_DASHBOARD/overview.html'), 'utf8');
const cardSource = overview.slice(overview.indexOf('function emailCard(doc)'), overview.indexOf('/* 📸 SCREENSHOT BUTTON'));

function harness() {
  const calls = { opens: [], copies: [], fetches: [], notices: [] };
  const context = {
    document: { createElement() {
      const controls = new Map();
      return { innerHTML: '', querySelector(selector) {
        if (!controls.has(selector)) {
          const events = new Map();
          controls.set(selector, {
            value: '', textContent: '',
            addEventListener(type, fn) { events.set(type, fn); },
            dispatch(type) { if (events.has(type)) return events.get(type)(); }
          });
        }
        return controls.get(selector);
      } };
    } },
    window: { open(...args) { calls.opens.push(args); } },
    navigator: { clipboard: { async writeText(value) { calls.copies.push(value); } } },
    feedAdd(value) { calls.notices.push(value); },
    fetch(...args) { calls.fetches.push(args); throw new Error('Editing must not request a backend or mailbox.'); }
  };
  Object.defineProperty(context, 'localStorage', { get() { throw new Error('Editing must stay in page memory.'); } });
  Object.defineProperty(context.window, 'localStorage', { get() { throw new Error('Editing must stay in page memory.'); } });
  vm.runInNewContext(cardSource, context);
  return {
    calls,
    open(doc) { return context.emailCard(doc); },
    edit(card, selector, value) { const field = card.querySelector(selector); field.value = value; field.dispatch('input'); }
  };
}

function example() {
  return { kind: 'eml', title: 'Original', email: {
    to: ['original@example.test'], cc: ['review@example.test'],
    subject: 'Original', body: 'Original proposed text', from: 'unchanged@example.test'
  } };
}

test('edited To, Cc, subject and body survive closing and reopening the same draft', () => {
  const h = harness(), doc = example(), source = JSON.stringify(doc.email);
  const card = h.open(doc);
  const edits = {
    '.mto': ' First <first@example.test>; second@example.test ',
    '.mcc': '',
    '.msub': ' Human revision: A&B + "quotes" ',
    '.mbody': 'Revised first line\n\nSecond line <keep as text>\n'
  };
  for (const [selector, value] of Object.entries(edits)) h.edit(card, selector, value);
  const reopened = h.open(doc);
  assert.notEqual(reopened, card, 'Reopening builds a fresh preview, not a reused test element.');
  for (const [selector, value] of Object.entries(edits)) assert.equal(reopened.querySelector(selector).value, value);
  assert.equal(JSON.stringify(doc.email), source, 'The original proposed message remains unchanged.');
  h.edit(reopened, '.mbody', '');
  assert.equal(h.open(doc).querySelector('.mbody').value, '', 'Cleared text must not restore the original.');
});

test('unsent edits stay with their draft even when two drafts share the same original content object', () => {
  const h = harness(), first = example(), second = { ...first };
  h.edit(h.open(first), '.mbody', 'First draft human edit');
  assert.equal(h.open(second).querySelector('.mbody').value, 'Original proposed text');
  h.edit(h.open(second), '.mbody', 'Second draft human edit');
  assert.equal(h.open(first).querySelector('.mbody').value, 'First draft human edit');
  assert.equal(h.open(second).querySelector('.mbody').value, 'Second draft human edit');
});

test('editing and reopening cause no network, navigation, clipboard or status action', () => {
  const h = harness(), doc = example(), card = h.open(doc);
  for (const selector of ['.mto', '.mcc', '.msub', '.mbody']) h.edit(card, selector, 'Human edit');
  h.open(doc);
  assert.deepEqual(h.calls, { opens: [], copies: [], fetches: [], notices: [] });
  assert.equal(doc.sent, undefined);
});

test('Copy and Open in Outlook use the reopened revision only when the human clicks them', async () => {
  const h = harness(), doc = example(), card = h.open(doc);
  h.edit(card, '.mto', 'changed@example.test');
  h.edit(card, '.mcc', 'other@example.test');
  h.edit(card, '.msub', 'Revised subject');
  h.edit(card, '.mbody', 'Human revision\nLine two & more');
  const reopened = h.open(doc);
  assert.equal(h.calls.opens.length, 0);
  reopened.querySelector('.wbcopy').dispatch('click');
  await Promise.resolve();
  assert.equal(h.calls.copies[0], 'To: changed@example.test\nCc: other@example.test\nSubject: Revised subject\n\nHuman revision\nLine two & more');
  reopened.querySelector('.wbsend').dispatch('click');
  const [address, target, features] = h.calls.opens[0], url = new URL(address);
  assert.equal(url.origin + url.pathname, 'https://outlook.office.com/mail/deeplink/compose');
  assert.equal(url.searchParams.get('to'), 'changed@example.test');
  assert.equal(url.searchParams.get('cc'), 'other@example.test');
  assert.equal(url.searchParams.get('subject'), 'Revised subject');
  assert.equal(url.searchParams.get('body'), 'Human revision\nLine two & more');
  assert.equal(url.searchParams.has('from'), false);
  assert.equal(target, '_blank');
  assert.equal(features, 'noopener');
  assert.equal(h.calls.fetches.length, 0);
  assert.equal(doc.sent, undefined);
});
