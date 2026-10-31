const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '..');
const store = new Map();
const spoken = [];
const window = {
  localStorage: { getItem: k => store.get(k) || null, setItem: (k, v) => store.set(k, v) },
  setTimeout, clearTimeout, Promise, Blob, URL: { createObjectURL: () => 'blob:hybrid-test', revokeObjectURL: () => {} },
  Audio: class { constructor(src) { this.src = src; this.volume = 1; } play() { return Promise.resolve(); } pause() {} addEventListener() {} },
  CHAOSVoiceEngine: { speak: (text, opts) => { spoken.push({ text, opts }); return { ok: true, mode: 'procedural', networkUsed: false }; }, stop: () => ({ ok: true }) }
};
window.window = window;
const ctx = vm.createContext({ window, Math, Number, String, Object, Array, Promise, JSON, Set, Uint8Array });
vm.runInContext(fs.readFileSync(path.join(base, 'js/brain/voice/hybridVoice.js'), 'utf8'), ctx);
const api = window.CHAOSHybridVoice;
assert.equal(api.status().mode, 'hybrid');
assert.equal(api.status().apiKeyStoredInBrowser, false);
assert.equal(api.status().endpointConfigured, false);
assert.equal(api.configure({ endpoint: 'http://insecure.example/voice' }).code, 'ENDPOINT_MUST_BE_HTTPS_OR_RELATIVE');
assert.equal(api.configure({ enabled: true, endpoint: '/api/chaosai/voice' }).ok, true);
assert.equal(api.status().endpointConfigured, true);
(async () => {
  const r = await api.speak('The silence is listening.');
  assert.equal(r.ok, true);
  assert.equal(r.hybridFallback, true);
  assert.equal(r.networkUsed, false);
  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].opts.texture, 'deep');
  assert.equal((await api.speak('')).code, 'EMPTY_TEXT');
  let requestBody; window.fetch = async (_url, opts) => { requestBody = JSON.parse(opts.body); return { ok: true, headers: { get: () => 'audio/mpeg' }, blob: async () => new Blob([Uint8Array.from([1,2,3])], { type: 'audio/mpeg' }) }; };
  const remote = await api.speak('The signal has noticed you.');
  assert.equal(remote.ok, true); assert.equal(remote.mode, 'elevenlabs-proxy'); assert.equal(remote.networkUsed, true);
  assert.equal(requestBody.provider, 'elevenlabs'); assert.equal(requestBody.persona.archetype, 'cosmic_nonhuman'); assert.equal(requestBody.voiceId, 'XFj57SKCdgD5SEUJbj1U');
  api.stop();
  const html = fs.readFileSync(path.join(base, 'apps/chaosai-center/index.html'), 'utf8');
  for (const id of ['hybridVoiceEnabled', 'hybridVoiceEndpoint', 'saveHybridVoice', 'voiceSpeak']) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(html, /hybridVoice\.js/);
  assert.match(fs.readFileSync(path.join(base, 'sw.js'), 'utf8'), /hybridVoice\.js/);
  console.log('PASS: hybrid voice config validation, local fallback, mocked remote speech path, privacy contract, UI and cache wiring');
})().catch(e => { console.error(e); process.exitCode = 1; });
