const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const overview = fs.readFileSync(path.join(__dirname, '../_FOGMIRROR_DASHBOARD/overview.html'), 'utf8');
const cardSource = overview.slice(overview.indexOf('function emailCard(doc)'), overview.indexOf('/* 📸 SCREENSHOT BUTTON'));

function harness({ failAt } = {}) {
  const calls = { opens: [], copies: [], downloads: [], blobs: [], revoked: [], timers: [], notices: [] };
  const anchors = [];
  const context = {
    document: {
      body: { appendChild(node) { node.attached = true; } },
      createElement(tag) {
        if (tag === 'a') {
          const anchor = { attached: false, removed: false,
            click() {
              if (failAt === 'click') throw new Error('download blocked');
              assert.equal(this.attached, true);
              calls.downloads.push({ href: this.href, filename: this.download });
            },
            remove() { this.removed = true; this.attached = false; }
          };
          anchors.push(anchor);
          return anchor;
        }
        assert.equal(tag, 'div');
        const controls = new Map();
        return { innerHTML: '', querySelector(selector) {
          if (!this.innerHTML.includes('class="' + selector.slice(1) + '"')) return null;
          if (!controls.has(selector)) {
            const events = new Map();
            controls.set(selector, { value: '', textContent: '',
              addEventListener(type, fn) { events.set(type, fn); },
              dispatch(type) { return events.get(type)?.(); }
            });
          }
          return controls.get(selector);
        } };
      }
    },
    Blob,
    URL: {
      createObjectURL(blob) {
        if (failAt === 'url') throw new Error('download unavailable');
        calls.blobs.push(blob); return 'blob:review-' + calls.blobs.length;
      },
      revokeObjectURL(value) { calls.revoked.push(value); }
    },
    setTimeout(fn) { calls.timers.push(fn); },
    window: { open(...args) { calls.opens.push(args); } },
    navigator: { clipboard: { async writeText(value) { calls.copies.push(value); } } },
    feedAdd(value) { calls.notices.push(value); },
    fetch() { throw new Error('Review export must not use a backend or mailbox.'); }
  };
  for (const object of [context, context.window]) {
    Object.defineProperty(object, 'localStorage', { get() { throw new Error('No persistent account side channel.'); } });
  }
  vm.runInNewContext(cardSource, context);
  return { calls, anchors,
    open(doc) { return context.emailCard(doc); },
    edit(card, selector, value) { const field = card.querySelector(selector); field.value = value; field.dispatch('input'); },
    download(card) {
      const button = card.querySelector('.wbreview');
      assert.ok(button, 'Existing email editor must offer Download Review Copy.');
      return button.dispatch('click');
    }
  };
}

function example() {
  return { kind: 'eml', title: 'Original', email: {
    to: ['original@example.test'], cc: ['review@example.test'],
    subject: 'Original subject', body: 'Original proposed text', from: 'unconfirmed@example.test'
  } };
}

// Read a field from the exported artifact, rejecting nested markup before decoding once.
function fieldText(html, name) {
  const match = html.match(new RegExp('<div[^>]*data-email-field="' + name + '"[^>]*>([\\s\\S]*?)</div>'));
  assert.ok(match, 'Export must expose the ' + name + ' field as text.');
  assert.doesNotMatch(match[1], /[<>]/, 'User text must never become markup.');
  return match[1].replace(/&(amp|lt|gt|quot|#39|#13);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", '#13': '\r' })[entity]);
}

test('review download captures the current edited fields exactly and leaves the original proposal unchanged', async () => {
  const h = harness(), doc = example(), original = JSON.stringify(doc.email), card = h.open(doc);
  h.edit(card, '.mto', ' First <first@example.test>; second@example.test ');
  h.edit(card, '.mcc', '');
  h.edit(card, '.msub', ' Human revision: A&B + "quotes" ');
  h.edit(card, '.mbody', '\nRevised first line\n\nSecond line <keep as text>\n');
  h.download(h.open(doc));
  assert.equal(h.calls.downloads.length, 1);
  assert.match(h.calls.downloads[0].filename, /^RHDP17_Email_Review_\d{4}-\d{2}-\d{2}\.html$/);
  const blob = h.calls.blobs[0], html = await blob.text();
  assert.equal(blob.type, 'text/html;charset=utf-8');
  assert.equal(fieldText(html, 'to'), ' First <first@example.test>; second@example.test ');
  assert.equal(fieldText(html, 'cc'), '');
  assert.equal(fieldText(html, 'subject'), ' Human revision: A&B + "quotes" ');
  assert.equal(fieldText(html, 'body'), '\nRevised first line\n\nSecond line <keep as text>\n');
  assert.match(html, /DRAFT — NOT SENT/);
  assert.match(html, /local review copy/i);
  assert.match(html, /not saved to Outlook|not an Outlook draft/i);
  assert.equal(JSON.stringify(doc.email), original);
  assert.equal(doc.sent, undefined);
  assert.deepEqual(h.calls.opens, []);
  assert.deepEqual(h.calls.copies, []);
  h.calls.timers.forEach(fn => fn());
  assert.deepEqual(h.calls.revoked, ['blob:review-1']);
  assert.ok(h.anchors[0].removed);
});

test('export treats HTML, closing script tags, entities and Unicode as inert visible text', async () => {
  const h = harness(), card = h.open(example());
  const payload = '</div></script><script>alert("not executable")</script><img src="https://example.test/track" onerror="send()"><a href="mailto:x@example.test">send</a> &lt;already encoded&gt; \' © 日本語\n';
  for (const selector of ['.mto', '.mcc', '.msub', '.mbody']) h.edit(card, selector, payload);
  h.download(card);
  const html = await h.calls.blobs[0].text();
  for (const name of ['to', 'cc', 'subject', 'body']) assert.equal(fieldText(html, name), payload);
  assert.doesNotMatch(html, /<(?:script|img|iframe|form|input|button|a|link|object|embed)\b/i);
  assert.doesNotMatch(html, /<[^>]+\s(?:on\w+|href|src|action)\s*=/i);
  assert.doesNotMatch(html, /<meta[^>]+http-equiv=["']refresh/i);
});

test('blank fields export as blank and do not restore the proposed defaults or open Outlook', async () => {
  const h = harness(), doc = example(), card = h.open(doc);
  for (const selector of ['.mto', '.mcc', '.msub', '.mbody']) h.edit(card, selector, '');
  h.download(card);
  const html = await h.calls.blobs[0].text();
  for (const name of ['to', 'cc', 'subject', 'body']) assert.equal(fieldText(html, name), '');
  assert.equal(h.open(doc).querySelector('.mbody').value, '');
  assert.equal(h.calls.opens.length, 0);
  card.querySelector('.wbsend').dispatch('click');
  assert.equal(h.calls.opens.length, 0, 'Existing incomplete-message Outlook guard remains.');
});

test('export leaves the current Copy and Open in Outlook review handoff intact', async () => {
  const h = harness(), card = h.open(example());
  h.edit(card, '.mto', ' changed@example.test ');
  h.edit(card, '.mcc', 'other@example.test');
  h.edit(card, '.msub', ' Revised subject ');
  h.edit(card, '.mbody', 'Human revision\nLine two & more');
  h.download(card);
  assert.match(card.querySelector('.mstate').textContent, /download requested/i);
  assert.match(card.querySelector('.mstate').textContent, /not sent|nothing was sent/i);
  await card.querySelector('.wbcopy').dispatch('click');
  assert.equal(h.calls.copies[0], 'To: changed@example.test\nCc: other@example.test\nSubject: Revised subject\n\nHuman revision\nLine two & more');
  card.querySelector('.wbsend').dispatch('click');
  const [address, target, features] = h.calls.opens[0], url = new URL(address);
  assert.equal(url.origin + url.pathname, 'https://outlook.office.com/mail/deeplink/compose');
  assert.equal(url.searchParams.get('to'), 'changed@example.test');
  assert.equal(url.searchParams.get('cc'), 'other@example.test');
  assert.equal(url.searchParams.get('subject'), 'Revised subject');
  assert.equal(url.searchParams.get('body'), 'Human revision\nLine two & more');
  assert.equal(url.searchParams.has('from'), false);
  assert.equal(target, '_blank');
  assert.equal(features, 'noopener');
});

for (const failAt of ['url', 'click']) {
  test('failed ' + failAt + ' download keeps edits available and reports that the file was not downloaded', () => {
    const h = harness({ failAt }), doc = example(), card = h.open(doc);
    h.edit(card, '.mbody', 'Retain this unsent edit');
    h.download(card);
    assert.equal(h.calls.downloads.length, 0);
    assert.match(card.querySelector('.mstate').textContent, /could not|couldn't/i);
    assert.match(card.querySelector('.mstate').textContent, /edits remain|entries remain/i);
    assert.equal(h.open(doc).querySelector('.mbody').value, 'Retain this unsent edit');
    assert.equal(h.calls.opens.length, 0);
    h.calls.timers.forEach(fn => fn());
    if (failAt === 'click') {
      assert.ok(h.anchors[0].removed);
      assert.deepEqual(h.calls.revoked, ['blob:review-1']);
    }
  });
}
