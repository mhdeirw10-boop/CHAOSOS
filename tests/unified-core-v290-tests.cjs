'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '..');
const store = new Map();
const listeners = new Map();
const localStorage = {
  getItem: k => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null,
  get length() { return store.size; }
};
class CustomEvent { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } }
const window = {
  localStorage, navigator: { onLine: false, userAgent: 'test' },
  addEventListener: (n, fn) => { if (!listeners.has(n)) listeners.set(n, []); listeners.get(n).push(fn); },
  dispatchEvent: e => { for (const fn of listeners.get(e.type) || []) fn(e); return true; },
  VoidEventBus: { emit() {} },
  VoidKernelDiagnostics: { snapshot: () => ({ ok: true }) },
  VoidServiceRegistry: { list: () => [{ id: 'notes', title: 'Notes', path: 'apps/void-notes/index.html', capabilities: ['notes.read'] }] },
  VoidTaskManager: { status: () => ({ queued: 0 }) },
  VoidServiceSupervisor: { status: () => ({ count: 1 }) },
  VoidAndroidBridge: { list: () => ({ platform: 'test', realAndroidOSControl: false }) },
  CHAOSCloud: { status: () => ({ enabled: false, configured: false }) },
  CHAOSAIGateway: { status: () => ({ enabled: false }) },
  CHAOSSync: { status: () => ({ enabled: false }) },
  VoidAppCatalog: { apps: [] }
};
window.window = window;
const ctx = vm.createContext({ window, localStorage, CustomEvent, Date, Math, Map, Set, JSON, Object, Array, String, Number, RegExp, Promise, TextEncoder, console });
for (const rel of [
  'js/kernel/intentEngine.js',
  'js/brain/cognition/userModel.js',
  'js/brain/cognition/decisionEngine.js',
  'js/brain/cognition/cognitiveEngine.js',
  'js/brain/cognition/languageEngine.js',
  'js/kernel/unifiedCore.js'
]) vm.runInContext(fs.readFileSync(path.join(base, rel), 'utf8'), ctx, { filename: rel });
(async () => {
  assert.equal(typeof window.CHAOSOSCore.runConversation, 'function');
  assert.equal(typeof window.CHAOSAILanguageEngine.plan, 'function');
  const p = window.CHAOSOSCore.plan('احسب 12 * 4', { history: [] });
  assert.equal(p.ok, true);
  assert.equal(p.intent.type, 'calculator');
  assert.equal(p.executionPolicy.cloudDefaultEnabled, undefined); // policy lives in the plan's executionPolicy and is deliberately minimal
  assert.equal(p.executionPolicy.implicitCloud, false);
  assert.equal(p.rawInputStored, false);
  let ran = false;
  const reply = await window.CHAOSOSCore.runConversation('مرحبا', { history: [], sessionId: 'test-session', executor: async () => { ran = true; return 'أهلًا'; } });
  assert.equal(reply, 'أهلًا'); assert.equal(ran, true);
  const trace = window.CHAOSOSCore.last();
  assert.equal(trace.status, 'completed'); assert.equal(trace.rawInputStored, false); assert.equal(trace.rawOutputStored, false);
  assert.equal(JSON.stringify(trace).includes('مرحبا'), false, 'trace must not persist raw prompt');
  assert.match(window.CHAOSOSCore.explainLast(), /تفسير داخلي/);
  const denied = await window.CHAOSOSCore.invokeTool('made.up.tool', {});
  assert.equal(denied.code, 'TOOL_NOT_FOUND');
  const diag = window.CHAOSOSCore.integrationCheck();
  assert.ok(diag.registeredTools.some(x => x.id === 'system.diagnostics'));
  const follow = window.CHAOSAILanguageEngine.resolveFollowUp('اشرحها', [{ role: 'user', content: 'اشرح بنية النواة الموحدة' }], 'x');
  assert.equal(follow.resolved, true);
  assert.equal(follow.context.transcriptStoredByPlanner, false);
  console.log('PASS: unified core orchestration, metadata-only traces, explainability, declared tools, and local follow-up context');
})().catch(e => { console.error(e); process.exitCode = 1; });
