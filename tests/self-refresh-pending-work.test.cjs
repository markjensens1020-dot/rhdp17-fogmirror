const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const overview = fs.readFileSync(path.join(__dirname, '../_FOGMIRROR_DASHBOARD/overview.html'), 'utf8');
const refreshStart = overview.indexOf('/* SELF-REFRESH');
const source = overview.slice(refreshStart, overview.indexOf('/* ===== DRAGGABLE PANEL DIVIDERS', refreshStart));

function harness(docs) {
  let etag = 'version-one', reloads = 0, check;
  const context = {
    DOCS: docs,
    document: { activeElement: { tagName: 'BODY' } },
    location: { pathname: '/overview.html', reload() { reloads++; } },
    async fetch(url, options) {
      assert.match(url, /^\/overview\.html\?vchk=\d+$/);
      assert.equal(options.method, 'HEAD');
      assert.equal(options.cache, 'no-store');
      return { headers: { get(name) { return name === 'etag' ? etag : null; } } };
    },
    setInterval(fn, delay) { assert.equal(delay, 300000); check = fn; },
    setTimeout(_fn, delay) { assert.equal(delay, 15000); }
  };
  vm.runInNewContext(source, context);
  return {
    context,
    get reloads() { return reloads; },
    changeVersion() { etag = 'version-two'; },
    async poll() { check(); await new Promise(resolve => setImmediate(resolve)); }
  };
}

test('changed remote version preserves blurred page-only drafts/documents but still refreshes when no work remains', async () => {
  for (const doc of [
    { kind: 'eml', email: { body: 'Original proposed text' }, emailEdits: { body: 'Human correction' } },
    { kind: 'img', src: 'data:image/png;base64,synthetic-preview' },
    { kind: 'doc', title: 'Opened document', url: './forms/01-client-intake.html' }
  ]) {
    const docs = [doc], h = harness(docs);
    await h.poll();
    h.changeVersion();
    await h.poll();
    assert.equal(h.reloads, 0, doc.kind + ' must survive a version change after the editor loses focus.');
    await h.poll();
    assert.equal(h.reloads, 0, 'Later version checks must also preserve pending work.');
    assert.equal(docs[0], doc);
    docs.length = 0;
    await h.poll();
    assert.equal(h.reloads, 1, 'Once no page work remains, the changed version can reload.');
  }

  const empty = harness([]);
  await empty.poll();
  assert.equal(empty.reloads, 0, 'The first version check only establishes the baseline.');
  empty.changeVersion();
  await empty.poll();
  assert.equal(empty.reloads, 1, 'An idle page keeps its existing automatic-refresh behavior.');

  const typing = harness([]);
  await typing.poll();
  typing.context.document.activeElement = { tagName: 'TEXTAREA', value: 'Unfinished input' };
  typing.changeVersion();
  await typing.poll();
  assert.equal(typing.reloads, 0, 'The existing focused-input protection remains.');
});
