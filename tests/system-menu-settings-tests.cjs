'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(base, file), 'utf8');

const shell = read('index.html');
for (const token of [
  'id="openSystemMenu"', 'id="systemMenuOverlay"', 'data-system-action="settings"',
  'data-system-action="manager"', 'data-system-action="controls"', 'data-system-action="recents"',
  'data-system-action="lock-settings"', 'data-system-action="lock"', 'data-system-action="discover"', 'id="toggleOrientation"', 'VOIDOS_SYSTEM_ACTION',
  'VOIDOS_APPLY_SHELL_SETTINGS', 'VOIDOS_SHELL_READY', "'voidos_shell_settings_v1'"
]) assert.ok(shell.includes(token), `root shell missing ${token}`);

const terminal = read('terminal/index.html');
for (const token of [
  'id="menu"', 'id="systemMenuLayer"', 'data-system-menu-action="settings"',
  'data-system-menu-action="manager"', 'data-system-menu-action="controls"',
  'data-system-menu-action="lock-settings"', 'data-system-menu-action="lock"',
  'data-system-menu-action="history"'
]) assert.ok(terminal.includes(token), `terminal missing ${token}`);

const app = read('js/app.js');
assert.match(app, /menuButton\?\.addEventListener\('click',[\s\S]*setSystemMenuOpen/);
assert.doesNotMatch(app, /menuButton\?\.addEventListener\('click',[^;]*window\.location\.href\s*=\s*'\.\.\/chaos-commands\.html'/);
assert.match(app, /postMessage\(\{ type:'VOIDOS_SYSTEM_ACTION', action \}/);
assert.match(app, /event\.data\?\.type === 'VOIDOS_SHELL_READY'/);

const settingsHtml = read('settings.html');
for (const token of ['data-shell-action="home"', 'data-shell-action="terminal"', 'data-shell-action="manager"', 'id="voidosGlobalSettings"', 'id="advancedVoidTools"']) {
  assert.ok(settingsHtml.includes(token), `settings.html missing ${token}`);
}
const settingsJs = read('js/settingsEnhancements.js');
for (const token of ['id="shellPreferencesCard"', 'id="settingsSearch"', 'id="saveShellPreferences"', 'id="openControlCenterFromSettings"', 'id="openLockSettingsFromSettings"', 'id="lockVoidOSFromSettings"', 'voidos_shell_settings_v1', 'VOIDOS_APPLY_SHELL_SETTINGS', 'VOIDOS_SHELL_READY', 'shellParentReady']) {
  assert.ok(settingsJs.includes(token), `settings enhancements missing ${token}`);
}
assert.ok(fs.existsSync(path.join(base, 'CHANGELOG_v2_4_0.md')));
const discovery = read('apps/void-discovery/index.html');
const discoveryLogic = read('apps/void-discovery/js/extracted-01.js');
for (const token of ['../../js/appCatalog.js', 'js/extracted-01.js', 'Google Play']) assert.ok(discovery.includes(token), `discovery page missing ${token}`);
for (const token of ['VoidAppCatalog', 'ChaosWebSearch.searchDetailed', 'api.github.com/search/repositories', 'بحث الويب عن التطبيق']) assert.ok(discoveryLogic.includes(token), `discovery logic missing ${token}`);
assert.doesNotMatch(read('terminal/index.html'), /class="chaos-quickbar"/, 'large terminal quickbar should be removed');
assert.ok(read('cordova-project/config.xml').includes('cordova-plugin-screen-orientation'));
assert.ok(terminal.includes('../js/brain/conversationMemory.js'), 'conversation memory must load before the terminal application');
assert.ok(terminal.includes('../js/accountManager.js'), 'terminal shares the unified local profile');
assert.ok(settingsHtml.includes('js/accountManager.js'), 'settings shares the unified local profile');
assert.doesNotMatch(shell, /<script[^>]+js\/chaos-hub\.js/, 'root shell must not load the old floating CHAOSAI assistant');
assert.doesNotMatch(read('js/chaos-hub.js'), /chaosHubFab|chaosHubPanel/, 'legacy compatibility shim must not recreate a floating bubble');
assert.match(app, /parseSearchRequest[\s\S]*routeIntent/, 'contextual search is handled before broad command routing');
assert.ok(read('js/settingsEnhancements.js').includes('id="shellOrientation"'));
assert.ok(read('index.html').includes('function applyOrientation'));
assert.ok(read('js/app.js').includes('chaos_pending_command_v1'), 'separate CHAOS command center remains wired after removing the panel');

console.log('PASS: unified home/terminal hamburger navigation, shared settings controls, lock/control routes, and settings search');
