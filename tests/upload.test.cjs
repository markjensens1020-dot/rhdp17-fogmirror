const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../_FOGMIRROR_DASHBOARD/upload.html'), 'utf8');
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1]).find(source => source.includes('let picked='));
assert.ok(script, 'The deployed upload script must be present.');

function setup({ upload, insert } = {}) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      style: {}, value: '', disabled: false, textContent: '', className: '',
      innerHTML: '', handlers: {}, children: [],
      addEventListener(type, callback) { this.handlers[type] = callback; },
      appendChild(child) { this.children.push(child); },
    });
    return elements.get(id);
  }
  const calls = { uploads: [], inserts: [], errors: [] };
  const client = {
    storage: { from(bucket) {
      assert.equal(bucket, 'intake-uploads');
      return { async upload(filePath, file, options) {
        const call = { filePath, file, options };
        calls.uploads.push(call);
        return upload ? upload(call, calls.uploads.length) : { error: null };
      } };
    } },
    from(table) {
      assert.equal(table, 'media_uploads');
      return { async insert(metadata) {
        const call = { ...metadata };
        calls.inserts.push(call);
        return insert ? insert(call, calls.inserts.length) : { error: null };
      } };
    },
  };
  const context = vm.createContext({
    window: { supabase: { createClient: () => client } },
    document: { getElementById: element, createElement: () => ({}) },
    URL: { createObjectURL: () => 'blob:test-preview' },
    console: { error: error => calls.errors.push(error) },
  });
  vm.runInContext(script, context);
  element('name').value = 'Audit User';
  element('kind').value = 'site_photo';
  element('proj').value = 'Audit Project';
  return {
    calls, element,
    pick(...names) {
      const input = element('files');
      input.files = names.map(name => ({ name, type: 'application/pdf' }));
      input.handlers.change({ target: input });
    },
    send: () => element('send').handlers.click(),
  };
}

test('all-success clears the queue only after storage and metadata save', async () => {
  const app = setup();
  app.pick('first.pdf', 'second.pdf');
  await app.send();
  assert.equal(app.calls.uploads.length, 2);
  assert.equal(app.calls.inserts.length, 2);
  for (let i = 0; i < 2; i++) {
    assert.equal(app.calls.inserts[i].file_path, app.calls.uploads[i].filePath);
    assert.equal(app.calls.inserts[i].project_ref, 'Audit Project');
    assert.equal(app.calls.uploads[i].options.upsert, false);
  }
  assert.equal(app.element('status').className, 'status ok');
  assert.match(app.element('status').textContent, /Sent 2 files/);
  assert.equal(app.element('send').disabled, true);
  assert.equal(app.element('barfill').style.width, '100%');
  await app.send();
  assert.equal(app.calls.uploads.length, 2);
});

test('metadata failure stays pending and retry reuses the upload and original association', async () => {
  const app = setup({ insert: (_metadata, count) => ({ error: count === 1 ? { message: 'metadata denied' } : null }) });
  app.pick('document.pdf');
  await app.send();
  assert.equal(app.element('status').className, 'status err');
  assert.doesNotMatch(app.element('status').textContent, /Thank you|Sent 1/);
  assert.equal(app.element('send').disabled, false);
  app.element('name').value = 'Changed User';
  app.element('proj').value = 'Changed Project';
  await app.send();
  assert.equal(app.calls.uploads.length, 1);
  assert.equal(app.calls.inserts.length, 2);
  assert.deepEqual(app.calls.inserts[1], app.calls.inserts[0]);
  assert.equal(app.calls.inserts[1].uploaded_by_name, 'Audit User');
  assert.equal(app.calls.inserts[1].project_ref, 'Audit Project');
  assert.equal(app.element('status').className, 'status ok');
});

test('storage failure does not insert metadata and can be retried', async () => {
  const app = setup({ upload: (_call, count) => ({ error: count === 1 ? { message: 'storage denied' } : null }) });
  app.pick('document.pdf');
  await app.send();
  assert.equal(app.calls.inserts.length, 0);
  assert.equal(app.element('status').className, 'status err');
  assert.equal(app.element('send').disabled, false);
  await app.send();
  assert.equal(app.calls.uploads.length, 2);
  assert.equal(app.calls.uploads[1].filePath, app.calls.uploads[0].filePath);
  assert.equal(app.calls.inserts.length, 1);
  assert.equal(app.element('status').className, 'status ok');
});

test('partial retry skips completed files and uploads only files whose storage failed', async () => {
  const app = setup({
    upload: (_call, count) => ({ error: count === 2 ? { message: 'storage denied' } : null }),
    insert: (_metadata, count) => ({ error: count === 2 ? { message: 'metadata denied' } : null }),
  });
  app.pick('complete.pdf', 'storage-failed.pdf', 'metadata-failed.pdf');
  await app.send();
  assert.match(app.element('status').textContent, /Sent 1 of 3/);
  assert.equal(app.element('send').disabled, false);
  const alreadyUploadedPath = app.calls.uploads[2].filePath;
  await app.send();
  assert.deepEqual(app.calls.uploads.map(call => call.file.name), [
    'complete.pdf', 'storage-failed.pdf', 'metadata-failed.pdf', 'storage-failed.pdf',
  ]);
  assert.equal(app.calls.inserts.length, 4);
  assert.equal(app.calls.inserts[3].file_path, alreadyUploadedPath);
  const completedPath = app.calls.uploads[0].filePath;
  assert.equal(app.calls.inserts.filter(call => call.file_path === completedPath).length, 1);
  assert.equal(app.element('status').className, 'status ok');
  assert.equal(app.element('send').disabled, true);
});

test('submit re-entry is ignored and files selected during a batch remain queued', async () => {
  let finishUpload;
  const pendingUpload = new Promise(resolve => { finishUpload = resolve; });
  const app = setup({ upload: (_call, count) => count === 1 ? pendingUpload : { error: null } });
  app.pick('first.pdf');
  const firstBatch = app.send();
  assert.equal(app.calls.uploads.length, 1);
  assert.equal(app.element('proj').disabled, true);
  app.pick('later.pdf');
  assert.equal(app.element('send').disabled, true);
  await app.send();
  assert.equal(app.calls.uploads.length, 1);
  finishUpload({ error: null });
  await firstBatch;
  assert.equal(app.calls.inserts.length, 1);
  assert.equal(app.element('proj').disabled, false);
  assert.match(app.element('status').textContent, /1 more ready to send/);
  assert.equal(app.element('send').disabled, false);
  await app.send();
  assert.deepEqual(app.calls.uploads.map(call => call.file.name), ['first.pdf', 'later.pdf']);
  assert.equal(app.calls.inserts.length, 2);
  assert.equal(app.element('status').className, 'status ok');
  assert.equal(app.element('send').disabled, true);
});
