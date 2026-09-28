const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../_FOGMIRROR_DASHBOARD/overview.html'), 'utf8');
const source = html.slice(html.indexOf('var DOCS=[];'), html.indexOf('/* 📸 SCREENSHOT BUTTON'));

function harness() {
  const calls = { opens: [], navigations: [], copies: [], downloads: [] }, nodes = new Map();
  let focused = null;
  function element(tag = 'div') {
    const events = new Map(), controls = new Map(), classes = new Set();
    let markup = '';
    return { tag, children: [], className: '', value: '', textContent: '', style: {},
      classList: { add(v) { classes.add(v); }, remove(v) { classes.delete(v); }, contains(v) { return classes.has(v); } },
      get innerHTML() { return markup; }, set innerHTML(v) { markup = v; this.children = []; controls.clear(); },
      appendChild(node) { this.children.push(node); },
      addEventListener(type, fn) { events.set(type, fn); },
      dispatch(type) { const event = { prevented: false, preventDefault() { this.prevented = true; } }; events.get(type)?.(event); return event; },
      click() { const event = this.dispatch('click'); if (this.href && !event.prevented) calls.navigations.push(this.href); },
      focus() { focused = this; }, scrollIntoView() {},
      querySelector(selector) {
        if (selector[0] !== '.') return null;
        const name = selector.slice(1);
        for (const child of this.children) {
          if (child.className === name) return child;
          const nested = child.querySelector(selector); if (nested) return nested;
        }
        if (!markup.includes('class="' + name + '"')) return null;
        if (!controls.has(selector)) controls.set(selector, element(name === 'mbody' ? 'textarea' : 'input'));
        return controls.get(selector);
      }
    };
  }
  for (const id of ['right', 'rightT', 'wb', 'progCount', 'docBox']) nodes.set(id, element());
  nodes.get('right').classList.add('closed');
  nodes.get('rightT').addEventListener('click', () => nodes.get('right').classList.remove('closed'));
  const linkMarkup = html.match(/<a\b[^>]*>\s*<span class="ic">✍️<\/span>New Email<\/a>/)[0];
  const newLink = element('a');
  newLink.href = linkMarkup.match(/href="([^"]+)"/)[1];
  const id = linkMarkup.match(/\bid="([^"]+)"/); if (id) nodes.set(id[1], newLink);
  const context = {
    document: { getElementById(id) { return nodes.get(id) || null; }, createElement: element },
    window: { open(...args) { calls.opens.push(args); } },
    navigator: { clipboard: { async writeText(value) { calls.copies.push(value); } } },
    esc(value) { return String(value).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]); },
    feedAdd() {},
    fetch() { throw new Error('Manual compose must not invoke a model, mailbox or backend.'); }
  };
  for (const object of [context, context.window]) Object.defineProperty(object, 'localStorage', { get() { throw new Error('Compose must stay in page memory.'); } });
  vm.runInNewContext(source, context);
  return { context, calls, nodes, linkMarkup,
    clickNew() { newLink.click(); },
    card() { return nodes.get('docBox').querySelector('.wbmail'); },
    edit(selector, value) { const field = this.card().querySelector(selector); field.value = value; field.dispatch('input'); },
    focused() { return focused; }
  };
}

test('New Email creates a blank editable draft in the right preview and focuses To without navigation or model work', () => {
  const h = harness(); h.clickNew();
  assert.equal(h.context.DOCS.length, 1, 'Click must stage one local draft.');
  assert.equal(h.context.DOCS[0].kind, 'eml');
  assert.equal(h.context.DOCS[0].title, 'New proposed email');
  assert.ok(h.nodes.get('docBox').classList.contains('open'));
  assert.equal(h.nodes.get('right').classList.contains('closed'), false);
  for (const selector of ['.mto', '.mcc', '.msub', '.mbody']) assert.equal(h.card().querySelector(selector).value, '');
  assert.equal(h.focused(), h.card().querySelector('.mto'));
  assert.deepEqual(h.calls.opens, []);
  assert.deepEqual(h.calls.navigations, []);
  const fallback = new URL(h.linkMarkup.match(/href="([^"]+)"/)[1], 'https://dashboard.example.test/overview');
  assert.equal(fallback.origin + fallback.pathname, 'https://dashboard.example.test/overview', 'Native link fallback must stay on this dashboard.');
  assert.equal(fallback.hash, '#docBox');
  assert.doesNotMatch(h.linkMarkup, /target="_blank"/, 'A native link action must not open an empty Outlook compose window.');
  assert.equal(h.nodes.get('progCount').textContent, '1 staged');
});

test('multiple manually composed drafts stay separate and edits survive closing and reopening either draft', () => {
  const h = harness(); h.clickNew();
  assert.equal(h.context.DOCS.length, 1);
  const first = h.context.DOCS[0];
  h.edit('.mto', 'first@example.test'); h.edit('.msub', 'First'); h.edit('.mbody', 'First edited body\nLine two');
  h.context.dvClose(); h.clickNew();
  assert.equal(h.context.DOCS.length, 2);
  const second = h.context.DOCS[0];
  assert.notEqual(first.email, second.email);
  assert.equal(h.card().querySelector('.mbody').value, '');
  h.edit('.mto', 'second@example.test'); h.edit('.msub', 'Second'); h.edit('.mbody', 'Second edited body');
  h.context.dvClose(); h.context.openDoc(h.context.DOCS.indexOf(first));
  assert.equal(h.card().querySelector('.mto').value, 'first@example.test');
  assert.equal(h.card().querySelector('.mbody').value, 'First edited body\nLine two');
  h.context.openDoc(h.context.DOCS.indexOf(second));
  assert.equal(h.card().querySelector('.mbody').value, 'Second edited body');
  assert.deepEqual(h.calls.opens, []); assert.deepEqual(h.calls.navigations, []);
});

test('a manual draft opens Outlook only after its required fields are filled and the existing control is clicked', () => {
  const h = harness(); h.clickNew();
  assert.equal(h.context.DOCS.length, 1);
  h.card().querySelector('.wbsend').dispatch('click');
  assert.equal(h.calls.opens.length, 0);
  h.edit('.mto', 'review@example.test'); h.edit('.msub', 'Review only'); h.edit('.mbody', 'Unsent edited proposal');
  assert.equal(h.calls.opens.length, 0);
  h.card().querySelector('.wbsend').dispatch('click');
  const [address, target, flags] = h.calls.opens[0], url = new URL(address);
  assert.equal(url.origin + url.pathname, 'https://outlook.office.com/mail/deeplink/compose');
  assert.equal(url.searchParams.get('to'), 'review@example.test');
  assert.equal(url.searchParams.get('cc'), '');
  assert.equal(url.searchParams.get('subject'), 'Review only');
  assert.equal(url.searchParams.get('body'), 'Unsent edited proposal');
  assert.equal(target, '_blank'); assert.equal(flags, 'noopener');
  assert.equal(h.context.DOCS[0].sent, undefined);
});
