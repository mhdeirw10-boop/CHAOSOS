'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const pages = [
  'index.html', 'terminal/index.html', 'apps/chaosai-center/index.html',
  'characters.html', 'chapters.html', 'settings.html',
  'apps/void-store/index.html', 'apps/void-browserx/index.html', 'apps/void-calendar/index.html',
  'apps/void-notes/index.html', 'apps/void-manager/index.html', 'apps/voidtube/index.html',
  'apps/void-planner/index.html', 'apps/void-calculator/index.html'
];
const scriptByPage = page => {
  const s = fs.readFileSync(path.join(base, page), 'utf8');
  const prefix = page.startsWith('apps/') ? '../../' : page.startsWith('terminal/') ? '../' : '';
  for (const file of ['js/cloud/syncEngine.js', 'js/brain/cognition/languageEngine.js', 'js/kernel/unifiedCore.js']) {
    assert.ok(s.includes(`${prefix}${file}`), `${page} loads ${file}`);
    assert.equal(s.split(`${prefix}${file}`).length - 1, 1, `${page} loads ${file} exactly once`);
  }
  const coreAt = s.indexOf(`${prefix}js/kernel/unifiedCore.js`);
  const systemAt = s.indexOf(`${prefix}js/system-core.js`);
  assert.ok(coreAt >= 0 && systemAt > coreAt, `${page} loads unified core before compatibility bridge`);
};
for (const page of pages) scriptByPage(page);
const shared = fs.readFileSync(path.join(base, 'js/chaos-layer.js'), 'utf8');
assert.match(shared, /window\.CHAOSOSCore\?\.runConversation/);
assert.match(shared, /executor:async query=>dispatchLegacy\(query\)/);
assert.match(shared, /else r=await dispatchLegacy\(cmd\)/, 'legacy command dispatcher remains available as safe fallback');
assert.match(shared, /sessionId:'chaos-layer:'/);
assert.doesNotMatch(shared, /\beval\s*\(|new\s+Function\s*\(/, 'shared layer does not execute generated code');
const language = fs.readFileSync(path.join(base, 'js/brain/cognition/languageEngine.js'), 'utf8');
assert.match(language, /neuralModelLoaded: false/);
assert.match(language, /rawConversationLogging: false/);
console.log(`PASS: shared cognitive core loaded once in ${pages.length} application surfaces; dispatcher uses unified planning with legacy fallback; no generated-code execution.`);
