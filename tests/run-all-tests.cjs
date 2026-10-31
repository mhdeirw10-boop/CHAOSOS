'use strict';
// Run every first-party regression suite from one deterministic command.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const base = __dirname;
const files = fs.readdirSync(base)
  .filter(name => name.endsWith('-tests.cjs') && name !== path.basename(__filename))
  .sort();
let failed = 0;
for (const file of files) {
  process.stdout.write(`\n===== ${file} =====\n`);
  const result = spawnSync(process.execPath, [path.join(base, file)], {
    cwd: path.join(base, '..'), encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe']
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error || result.status !== 0) {
    failed += 1;
    process.stdout.write(`RESULT: FAIL (${result.error ? result.error.message : `exit ${result.status}`})\n`);
  } else {
    process.stdout.write('RESULT: PASS\n');
  }
}
const passed = files.length - failed;
process.stdout.write(`\nSUMMARY: ${passed}/${files.length} test suites passed; failures=${failed}\n`);
if (files.length === 0 || failed > 0) process.exitCode = 1;
