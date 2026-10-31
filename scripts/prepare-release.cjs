'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const target = path.join(root, 'cordova-project', 'www');
const excluded = new Set([
  '.git', '.github', 'node_modules', 'platforms', '.gradle',
  'cordova-project'
]);

function run(script) {
  const result = spawnSync(process.execPath, [path.join(root, script)], {
    cwd: root, stdio: 'inherit'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

function copyTree(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

try {
  run('tests/generate-project-index.cjs');
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  copyTree(root, target);
  run('tests/release-audit.cjs');
  process.stdout.write('Prepared Cordova www mirror and completed the release audit.\n');
} catch (error) {
  process.stderr.write(`Release preparation failed: ${error.message}\n`);
  process.exitCode = 1;
}
