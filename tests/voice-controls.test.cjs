const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../_FOGMIRROR_DASHBOARD/overview.html'), 'utf8');
const composer = html.slice(html.indexOf('var busy=false,player=null;'), html.indexOf('/* ===== DOCUMENT REGISTRY'));
const floating = html.slice(html.indexOf('(function initializeVoiceControls(){'), html.indexOf('</script>', html.indexOf('(function initializeVoiceControls(){')));

// Run real composer/voice handlers. Only browser speech, DOM and HTTP boundaries are fake.
function harness({ supported = true, startError = false, restartError = false, rejectFetch = false } = {}) {
  const nodes = new Map(), recognizers = [], requests = [], timers = new Map(), messages = [];
  function element(tag = 'div') {
    const events = new Map(), classes = new Set(), attrs = new Map();
    return { tag, value: '', textContent: '', style: {}, children: [], scrollHeight: 32,
      classList: { add(c) { classes.add(c); }, remove(c) { classes.delete(c); }, contains(c) { return classes.has(c); } },
      setAttribute(k, v) { attrs.set(k, String(v)); }, getAttribute(k) { return attrs.get(k); },
      appendChild(n) { this.children.push(n); if(n.id) nodes.set(n.id, n); },
      addEventListener(type, fn) { const a = events.get(type) || []; a.push(fn); events.set(type, a); },
      dispatch(type, extra = {}) { for(const fn of events.get(type) || []) fn({ preventDefault() {}, ...extra }); },
      click() { this.dispatch('click'); }, focus() { this.focused = true; }, scrollIntoView() {}
    };
  }
  for(const id of ['chatText', 'chatState', 'dictBtn', 'squig', 'sendB']) nodes.set(id, element());
  class Speech {
    constructor() { this.starts = 0; this.stops = 0; recognizers.push(this); }
    start() { this.starts++; if(startError || (restartError && this.starts > 1)) throw new Error('start failed'); this.active = true; }
    stop() { this.stops++; this.active = false; }
    result(text) { this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: text, confidence: 0.9 }], { isFinal: false })] }); }
    error(error) { this.onerror?.({ error }); }
    end() { this.active = false; this.onend?.(); }
  }
  const context = {
    document: { body: element('body'), getElementById(id) { return nodes.get(id) || null; }, createElement: element },
    window: { innerHeight: 900, ...(supported ? { SpeechRecognition: Speech } : {}) },
    txt: nodes.get('chatText'), stateEl: nodes.get('chatState'), squig: nodes.get('squig'),
    feedAdd() {}, bubble(...args) { messages.push(args); }, NAMES: { cassie: 'Cassie' }, role: 'cassie',
    SUPA: 'https://synthetic.example.test', A: 'synthetic-public-key', getToken() { return 'synthetic-token'; },
    parseEmailDraft() { return null; }, console: { log() {} },
    setTimeout(fn) { const id = timers.size + 1; timers.set(id, fn); return id; }, clearTimeout(id) { timers.delete(id); },
    fetch(url, options) { requests.push({ url, body: JSON.parse(options.body) }); return rejectFetch ? Promise.reject(new Error('synthetic offline')) : new Promise(() => {}); }
  };
  vm.runInNewContext(composer + '\n' + floating, context);
  return { context, nodes, recognizers, requests, timers, messages,
    click(id) { nodes.get(id).click(); }, text() { return nodes.get('chatText'); }, status() { return nodes.get('chatState').textContent; },
    active() { return recognizers.find(r => r.active); }
  };
}

test('floating Mic transcribes into the existing message box without a request, and both Mic controls share state', () => {
  const h = harness(); h.text().value = 'Original'; h.click('voice-input-button');
  h.active().result('new dictation');
  assert.equal(h.text().value, 'Original new dictation');
  assert.equal(h.requests.length, 0);
  assert.equal(h.nodes.get('dictBtn').classList.contains('on'), true);
  assert.equal(h.nodes.get('voice-input-button').getAttribute('aria-pressed'), 'true');
  h.click('dictBtn');
  assert.equal(h.active(), undefined);
  assert.equal(h.nodes.get('voice-input-button').getAttribute('aria-pressed'), 'false');
  assert.match(h.nodes.get('voice-input-button').textContent, /Mic/);
});

test('floating Send submits current edited text once through real ask and ignores late speech after stop', () => {
  const h = harness(); h.click('voice-input-button'); const dict = h.active(); dict.result('Unedited speech');
  h.text().value = ' Human reviewed current text ';
  h.click('voice-send-button'); h.click('voice-send-button');
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].url, 'https://synthetic.example.test/functions/v1/fog-mirror-chat');
  assert.deepEqual(h.requests[0].body, { question: 'Human reviewed current text', role: 'cassie' });
  assert.equal(h.text().value, '');
  assert.equal(h.active(), undefined);
  dict.result('Late final words'); dict.end();
  assert.equal(h.text().value, ''); assert.equal(h.requests.length, 1);
  assert.doesNotMatch(h.nodes.get('voice-send-button').textContent, /Sent/);
});

test('floating Send works for typed text without microphone support and blank text makes no request', () => {
  const h = harness({ supported: false }); h.text().value = '  '; h.click('voice-send-button');
  assert.equal(h.requests.length, 0);
  h.click('voice-input-button'); assert.match(h.status(), /support|unavailable|typing|type/i);
  h.text().value = 'Typed without speech'; h.click('voice-send-button');
  assert.equal(h.requests.length, 1); assert.equal(h.requests[0].body.question, 'Typed without speech');
});

test('busy main or floating Send retains the next message instead of discarding it', () => {
  const h = harness(); h.text().value = 'First'; h.click('sendB');
  h.text().value = 'Keep this next message'; h.click('voice-send-button'); h.click('sendB');
  assert.equal(h.requests.length, 1); assert.equal(h.text().value, 'Keep this next message');
  assert.match(h.status(), /wait|finishing|busy/i);
});

for(const [error, expected] of [['not-allowed', /allow|permission|denied/i], ['audio-capture', /microphone/i], ['no-speech', /speech/i], ['network', /recognition|network/i]]) {
  test('speech error ' + error + ' stops both controls, preserves current text and waits for an explicit retry', () => {
    const h = harness(); h.text().value = 'Keep'; h.click('voice-input-button'); const dict = h.active();
    dict.result('these words'); dict.error(error); dict.end();
    assert.equal(h.text().value, 'Keep these words'); assert.equal(h.active(), undefined);
    assert.equal(h.nodes.get('dictBtn').classList.contains('on'), false);
    assert.equal(h.nodes.get('voice-input-button').getAttribute('aria-pressed'), 'false');
    assert.match(h.status(), expected); assert.equal(h.requests.length, 0);
  });
}

test('failed recognition start resets controls and reports actionable state without sending', () => {
  const h = harness({ startError: true }); h.text().value = 'Keep'; h.click('voice-input-button');
  assert.equal(h.context.dictOn, false); assert.equal(h.text().value, 'Keep');
  assert.equal(h.nodes.get('voice-input-button').getAttribute('aria-pressed'), 'false');
  assert.match(h.status(), /could not|cannot|failed|unable/i); assert.equal(h.requests.length, 0);
});

test('recognition restart failure resets both controls without retry loop or model call', () => {
  const h = harness({ restartError: true }); h.click('voice-input-button'); const dict = h.active();
  dict.result('Preserved'); dict.end(); dict.end();
  assert.equal(h.context.dictOn, false); assert.equal(h.text().value, 'Preserved');
  assert.equal(dict.starts, 2); assert.match(h.status(), /could not|cannot|failed|unable/i);
  assert.equal(h.requests.length, 0);
});

test('main Send also stops dictation before clearing the visible text', () => {
  const h = harness(); h.click('dictBtn'); const dict = h.active(); dict.result('Main path'); h.click('sendB');
  dict.result('Late update'); assert.equal(h.text().value, ''); assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].body.question, 'Main path'); assert.equal(h.active(), undefined);
});

test('floating Mic cancels conversation before dictating and manual Send cannot trigger its pending voice timer', () => {
  const h = harness(); h.click('squig'); const conversation = h.active(); conversation.result('Pending voice text');
  h.click('voice-input-button'); const dict = h.active(); dict.result('Reviewed text'); h.click('voice-send-button');
  for(const fn of [...h.timers.values()]) fn();
  assert.equal(h.context.convo, false); assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].body.question, 'Reviewed text');
});

test('HTTP rejection uses existing visible failure and never reports a successful Send', async () => {
  const h = harness({ rejectFetch: true }); h.text().value = 'Synthetic message'; h.click('voice-send-button');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.requests.length, 1); assert.equal(h.context.busy, false);
  assert.ok(h.messages.some(row => /Could not reach the brain: synthetic offline/.test(row[2])));
  assert.doesNotMatch(h.nodes.get('voice-send-button').textContent, /Sent/);
});
