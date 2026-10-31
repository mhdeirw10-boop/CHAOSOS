'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '..');
function harness(seed = {}) {
  const map = new Map(Object.entries(seed));
  const localStorage = {
    getItem(k) { return map.has(k) ? map.get(k) : null; },
    setItem(k,v) { map.set(k, String(v)); },
    removeItem(k) { map.delete(k); },
    _map: map
  };
  const context = vm.createContext({ localStorage, console: { warn() {} }, Date, JSON });
  for (const file of ['js/brain/hippocampus/longTerm.js', 'js/brain/hippocampus/hippocampus.js']) {
    vm.runInContext(fs.readFileSync(path.join(base, file), 'utf8'), context, { filename: file });
  }
  vm.runInContext('globalThis.__lt = LongTermMemory; globalThis.__hp = Hippocampus;', context);
  return { context, localStorage };
}
{
  const { context, localStorage } = harness();
  context.__lt.saveExperience('تفضيل المستخدم', 'تم حفظه');
  context.__hp.recordExperience('سؤال ثانٍ', 'إجابة ثانية');
  const db = JSON.parse(localStorage.getItem('chaos_persistent_long_term'));
  assert.ok(db && db.profile && Array.isArray(db.history), 'canonical object schema retained');
  assert.equal(db.history.length, 2, 'both memory writers append to one history');
  assert.equal(db.profile.totalInteractions, 2, 'profile count preserved and incremented');
  assert.equal(context.__hp.loadLongTerm().length, 2, 'hippocampus reads object-schema history');
  context.__lt.saveExperience('ثالث', 'ثالث');
  assert.equal(JSON.parse(localStorage.getItem('chaos_persistent_long_term')).history.length, 3);
}
{
  const legacy = [{ query: 'قديم', response: 'سجل قديم' }];
  const { context, localStorage } = harness({ chaos_persistent_long_term: JSON.stringify(legacy) });
  assert.equal(context.__lt.load().history.length, 1, 'legacy array migrates on read');
  context.__lt.saveExperience('جديد', 'حفظ');
  context.__hp.recordExperience('جديد آخر', 'حفظ آخر');
  const db = JSON.parse(localStorage.getItem('chaos_persistent_long_term'));
  assert.equal(db.history.length, 3, 'legacy records survive migration and shared writes');
  assert.equal(db.history[0].query, 'قديم');
}
{
  const { context, localStorage } = harness({ chaosMemoryEnabled: 'false' });
  assert.equal(context.__hp.recordExperience('لا تحفظ', 'رد'), 'MEMORY_MUTED: الذاكرة معطلة من قبل المستخدم.');
  context.__lt.saveExperience('لا تحفظ', 'رد');
  assert.equal(localStorage.getItem('chaos_persistent_long_term'), null, 'disabled memory does not write');
}
{
  const { context, localStorage } = harness({ chaos_persistent_long_term: '{bad json' });
  assert.deepEqual(Array.from(context.__hp.loadLongTerm()), [], 'malformed JSON is handled without throwing');
  context.__hp.recordExperience('بعد التلف', 'يتعافى');
  const db = JSON.parse(localStorage.getItem('chaos_persistent_long_term'));
  assert.equal(db.history.length, 1, 'malformed storage can recover on next write');
}
{
  const { context, localStorage } = harness();
  for (let i = 0; i < 60; i++) context.__hp.recordExperience(`q${i}`, `r${i}`);
  const db = JSON.parse(localStorage.getItem('chaos_persistent_long_term'));
  assert.equal(db.history.length, 50, 'history remains bounded');
  assert.equal(db.history[0].query, 'q10', 'oldest entries are evicted first');
  assert.equal(context.__hp.shortTerm.length, 5, 'short-term buffer remains bounded');
}
console.log('PASS: memory integration simulator — shared schema, legacy migration, memory-off, malformed JSON recovery, and bounds');
