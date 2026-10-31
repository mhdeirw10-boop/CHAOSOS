'use strict';
// Dependency-free source, manifest, cache, and Cordova mirror audit.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const base = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(base, rel), 'utf8');
const walk = (dir, out = []) => {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (full.split(path.sep).includes('cordova-project') && full.split(path.sep).includes('www')) continue;
      if (ent.name === '.git' || ent.name === 'node_modules' || ent.name === 'platforms') continue;
      walk(full, out);
    } else if (ent.isFile()) out.push(full);
  }
  return out;
};
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks += 1; }

// Release metadata and version agreement.
const config = read('cordova-project/config.xml');
const pkg = JSON.parse(read('cordova-project/package.json'));
const sourceConfig = read('project-source/cordova-project/config.xml');
const sourcePkg = JSON.parse(read('project-source/cordova-project/package.json'));
check(pkg.version === '3.1.6' && sourcePkg.version === pkg.version, 'package metadata versions agree');
check(/version="3\.1\.6"/.test(config) && /version="3\.1\.6"/.test(sourceConfig), 'Cordova config versions agree');
check(/<name>CHAOSOS<\/name>/.test(config) && /<author>Void Walker<\/author>/.test(config), 'app name and project credit are retained');

// Project manifest freshness/path safety.
const manifest = JSON.parse(read('project-index.json'));
check(manifest.schema === 1 && /CHAOSOS v3\.1\.6/.test(manifest.project), 'manifest identifies current branch');
const seen = new Set();
for (const item of manifest.files) {
  check(typeof item.path === 'string' && item.path.length > 0 && !item.path.startsWith('/') && !item.path.split('/').includes('..'), `safe manifest path ${item.path}`);
  check(!seen.has(item.path), `manifest path is unique: ${item.path}`); seen.add(item.path);
  const full = path.resolve(base, item.path);
  check(full.startsWith(base + path.sep) && fs.existsSync(full), `manifest target exists: ${item.path}`);
  check(fs.statSync(full).size === item.size, `manifest size is current: ${item.path}`);
}

// Service worker cache paths must exist exactly once.
const sw = read('sw.js');
const cachePaths = [...sw.matchAll(/^\s*"(\.\/[^\"]+)"\s*,?\s*$/gm)].map(m => m[1]);
check(/chaosos-shell-v3-1-6-os-evolution-experimental/.test(sw), 'cache namespace invalidates previous shell cache');
check(new Set(cachePaths).size === cachePaths.length, 'service worker precache contains no duplicate paths');
for (const rel of cachePaths) check(fs.existsSync(path.join(base, rel.slice(2))), `precache target exists: ${rel}`);

// Critical files served by Cordova must match the website source.
const mirrored = [
  'index.html','settings.html','terminal/index.html','js/app.js','README/README.txt','chaos-commands.html','js/system-core.js','js/kernel/kernel.js','js/cloud/cloudAdapter.js','apps/void-discovery/index.html','js/brain/conversationMemory.js',
  'js/brain/dailyLanguage.js','js/brain/inputClassifier.js','js/accountManager.js','js/system-core.js',
  'js/chaos-hub.js','js/chaos-layer.js','js/appCatalog.js','apps/void-store/index.html',
  'apps/voidtube/index.html','apps/void-browserx/index.html','apps/void-files/index.html',
  'js/kernel/taskRouter.js','js/kernel/taskManager.js','js/kernel/serviceSupervisor.js','js/kernel/osServices.js','js/kernel/defaultTaskHandlers.js','js/platform/androidBridge.js','js/cloud/aiGateway.js','js/brain/cognition/userModel.js','js/brain/cognition/decisionEngine.js','js/brain/cognition/cognitiveEngine.js','js/kernel/fileAccess.js','js/settings-phone.js','css/settings-phone.css',
  'css/desktop-workspace.css','apps/voidtube/js/recommendationEngine.js','project-index.json',
  'sw.js','README/README.txt','CHANGELOG_v2_6_0.md','CHAOSOS_v2_6_0_ARCHITECTURE.md','CHANGELOG_v2_7_0.md','CHAOSOS_v2_7_0_MODULAR_COGNITION_REPORT.md',
  'CHAOSOS_v2_6_0_IMPLEMENTATION_REPORT.md','tests/run-all-tests.cjs','tests/release-audit.cjs',
  'tests/release-consistency-tests.cjs','tests/knowledge-modules-v270-tests.cjs','tests/cognitive-routing-v270-tests.cjs','tests/app-capability-bridge-v270-tests.cjs','js/kernel/appCapabilityBridge.js','js/brain/knowledgeModules/registry.js','js/brain/knowledgeModules/psychology.js','js/brain/knowledgeModules/economics.js','js/brain/knowledgeModules/linguistics.js','js/brain/knowledgeModules/robotics.js','js/brain/knowledgeModules/cybersecurity.js','js/brain/knowledgeModules/neuroscience.js','js/brain/knowledgeModules/genetics.js','js/brain/appConnectors/productivity.js','js/brain/appConnectors/media.js','js/brain/appConnectors/system.js','js/brain/appConnectors/ai.js','js/brain/appConnectors/terminal.js','js/brain/appConnectors/personalData.js','apps/void-notes/index.html','apps/void-planner/index.html','apps/void-calendar/index.html','apps/void-calculator/index.html','apps/void-manager/index.html','terminal/index.html','apps/chaosai-center/index.html','js/kernel/taskManager.js','js/kernel/serviceSupervisor.js','js/kernel/osServices.js','js/platform/androidBridge.js','js/cloud/aiGateway.js','js/brain/cognition/userModel.js','js/brain/cognition/decisionEngine.js','js/brain/cognition/cognitiveEngine.js','cloud/providers/openai-compatible.cjs','CHAOSOS_v2_6_0_ARCHITECTURE.md','CHANGELOG_v2_6_0.md','tests/cognitive-os-v260-tests.cjs','tests/cloud-ai-provider-tests.cjs','tests/cloud-ai-server-tests.cjs','tests/generate-project-index.cjs',
  'js/brain/appConnectors/files.js','js/brain/appConnectors/extras.js','apps/void-mail/index.html','apps/void-gallery/index.html','apps/void-camera/index.html','js/brain/knowledgeModules/biology.js','js/brain/knowledgeModules/physics.js','js/brain/knowledgeModules/chemistry.js','js/brain/knowledgeModules/mathematics.js','js/brain/knowledgeModules/links.js','js/brain/knowledgeModules/stories.js','js/cloud/syncEngine.js','js/brain/cognition/languageEngine.js','js/kernel/unifiedCore.js','CHANGELOG_v2_9_0.md','CHAOSOS_v2_9_0_IMPLEMENTATION_REPORT.md','tests/unified-core-v290-tests.cjs','tests/cloud-sync-v290-tests.cjs','tests/shared-core-v290-tests.cjs','js/brain/cognition/adaptiveAgent.js','js/brain/voice/voiceEngine.js','js/brain/voice/voiceStudio.js','js/chaosPresence.js','apps/void-game-manager/index.html','CHANGELOG_v3_0_0.md','CHAOSOS_v3_0_0_IMPLEMENTATION_REPORT.md','tests/adaptive-agent-v300-tests.cjs','tests/voice-foundry-v300-tests.cjs','tests/game-manager-v300-tests.cjs','js/brain/cognition/localLanguageRuntime.js','js/kernel/runtimeOrchestrator.js','CHANGELOG_v3_1_0.md','tests/runtime-language-v310-tests.cjs','tests/game-manager-v310-tests.cjs','tests/release-v310-tests.cjs','js/kernel/healthManager.js','js/kernel/presenceDirector.js','js/kernel/adaptiveTaskPlanner.js','js/kernel/appLifecycleManager.js','js/brain/words/registry.js','js/brain/words/greetings.js','js/brain/words/identity.js','js/brain/words/aiTools.js','js/brain/words/ordinary.js','js/brain/words/relationships.js','js/brain/words/locations.js','js/brain/words/countries.js','js/brain/words/archive.js','js/brain/words/darkThemes.js','js/brain/words/banter.js','js/brain/words/stories.js','js/brain/words/jokes.js','js/brain/words/links.js','js/brain/words/knowledgeBase.js','js/brain/words/stories.js','js/brain/words/jokes.js','js/brain/words/links.js','js/brain/words/commands.js','tests/kernel-words-integration-v313-tests.cjs','CHANGELOG_v3_1_4_MODULAR_WORDS_EXPERIMENTAL.md','README/13_MODULAR_WORDS_ARCHITECTURE.txt','tests/words-modularization-v314-tests.cjs','js/brain/words/courtesy.js','js/brain/words/emotions.js','js/brain/words/technology.js','js/brain/words/philosophy.js','js/brain/words/naturalConversation.js','js/brain/words/secrets.js','tests/natural-vocabulary-v315-tests.cjs','CHANGELOG_v3_1_5_NATURAL_LANGUAGE_SECRET_PERSONA_EXPERIMENTAL.md','README/14_NATURAL_VOCABULARY_SECRET_PERSONA.txt',];
for (const rel of mirrored) {
  const a = fs.readFileSync(path.join(base, rel));
  const b = fs.readFileSync(path.join(base, 'cordova-project', 'www', rel));
  check(a.equals(b), `Cordova mirror matches source: ${rel}`);
}

// Local HTML references must resolve. External schemes and fragment-only links are intentionally skipped.
const files = walk(base).filter(f => f.endsWith('.html') && !f.includes(`${path.sep}cordova-project${path.sep}www${path.sep}`));
let htmlRefs = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const pattern = /\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi;
  for (const match of html.matchAll(pattern)) {
    let value = match[2].replace(/&amp;/g, '&').trim();
    if (!value || value.startsWith('#') || value.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(value)) continue;
    value = value.split('#')[0].split('?')[0];
    if (!value) continue;
    let target = path.resolve(path.dirname(file), decodeURI(value));
    if (!target.startsWith(base + path.sep) && target !== base) continue;
    if (!fs.existsSync(target)) {
      target = path.resolve(base, decodeURI(value.replace(/^\.\//, '').replace(/^\//, '')));
    }
    check(fs.existsSync(target), `HTML local resource resolves: ${path.relative(base, file)} -> ${value}`);
    htmlRefs += 1;
  }
}

// JavaScript parse checks for unique source JS and inline scripts.
const allFiles = walk(base);
const jsFiles = allFiles.filter(f => f.endsWith('.js') && !f.includes(`${path.sep}cordova-project${path.sep}www${path.sep}`));
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  check(result.status === 0, `JavaScript parses: ${path.relative(base, file)}${result.stderr ? ` — ${result.stderr.trim()}` : ''}`);
}
let inlineCount = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  for (const match of html.matchAll(pattern)) {
    const attrs = match[1], code = match[2];
    if (/\bsrc\s*=/i.test(attrs) || !code.trim()) continue;
    const type = attrs.match(/\btype\s*=\s*["']?([^\s"']+)/i);
    if (type && !['text/javascript', 'application/javascript', 'module'].includes(type[1].toLowerCase())) continue;
    const result = spawnSync(process.execPath, ['--check', '--input-type=commonjs'], { input: code, encoding: 'utf8' });
    check(result.status === 0, `inline JavaScript parses: ${path.relative(base, file)}${result.stderr ? ` — ${result.stderr.trim()}` : ''}`);
    inlineCount += 1;
  }
}

console.log(`PASS release audit: ${checks} assertions; manifest=${manifest.files.length} files; SW=${cachePaths.length} unique paths; HTML refs=${htmlRefs}; JS=${jsFiles.length}; inline JS=${inlineCount}.`);
