import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import net from 'node:net';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { root, config } from '../apps/api/src/config.mjs';
import { assertPortFree, waitFor, mongoReady, stopOwnedChild } from './runtime.mjs';

// Runs the real services against the existing local catalog. Does not write shop data.
assert.equal(
  config.mongoUri,
  'mongodb://127.0.0.1:27018/kiha',
  'Startup QA requires the project local MongoDB URI.',
);
assert.equal(config.port, 4000);
assert.equal(Number(process.env.PORT || 3000), 3000);
for (const port of [3000, 4000, 27018]) await assertPortFree(port, '127.0.0.1', 'startup QA');
const owned = new Set();
const results = [];
const base = 'http://localhost:3000';
function start(file = 'scripts/dev.mjs', { args = [], env = {} } = {}) {
  const child = spawn(process.execPath, [path.join(root, file), ...args], {
    cwd: root,
    windowsHide: true,
    detached: process.platform !== 'win32',
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    env: { ...process.env, ...env },
  });
  const run = { child, log: '', ready: false, code: null, exited: false };
  owned.add(run);
  child.stdout.on('data', (data) => {
    run.log += data;
  });
  child.stderr.on('data', (data) => {
    run.log += data;
  });
  child.on('message', (message) => {
    if (message?.type === 'ready') run.ready = true;
  });
  child.on('error', (error) => {
    run.log += error.message;
    run.exited = true;
    run.code = 1;
  });
  child.on('exit', (code) => {
    run.code = code;
    run.exited = true;
    owned.delete(run);
  });
  return run;
}
async function ready(run) {
  await waitFor(
    () => {
      assert.equal(run.exited, false, run.log);
      return run.ready;
    },
    { timeout: 60000, message: 'Startup did not become ready.' },
  );
}
async function exited(run) {
  await waitFor(() => run.exited, { timeout: 20000, message: `Runner did not exit: ${run.log}` });
}
async function stop(run) {
  if (run.exited) return;
  run.child.send({ type: 'shutdown' });
  await exited(run);
  assert.equal(run.code, 0, run.log);
}
async function portsFree() {
  for (const port of [3000, 4000, 27018]) await assertPortFree(port, '127.0.0.1', 'cleanup');
}
function pass(name) {
  results.push(name);
  console.log(`PASS ${name}`);
}
try {
  const first = start();
  await ready(first);
  assert.ok(first.log.indexOf('Local MongoDB ready') < first.log.indexOf('2/3'));
  assert.ok(first.log.indexOf('KIHA API:') < first.log.indexOf('3/3'));
  const page = await fetch(base);
  assert.equal(page.status, 200);
  const body = await page.text();
  assert.ok(body.includes('Một chút mộc.'));
  assert.ok(!body.includes('fetch failed'));
  const initial = (await (await fetch(`${base}/api/products`)).json()).data;
  assert.ok(initial.total > 0);
  pass('Cold start brings up MongoDB, then API, then a working home page');

  const duplicate = start();
  await exited(duplicate);
  assert.equal(duplicate.code, 1);
  assert.match(duplicate.log, /đã có phiên đang chạy/);
  assert.doesNotMatch(duplicate.log, /localhost:3001/);
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
  pass('Duplicate launch exits cleanly without disrupting the existing website');

  await stop(first);
  await portsFree();
  await assert.rejects(fs.access(path.join(root, '.local/dev-runner.lock')));
  pass(
    'Shutdown removes the entire owned process tree, releases ports and clears the launcher lock',
  );

  const manualDb = start('scripts/local-db.mjs');
  await ready(manualDb);
  const reused = start();
  await ready(reused);
  assert.match(reused.log, /Dùng MongoDB đang chạy/);
  const persisted = (await (await fetch(`${base}/api/products`)).json()).data;
  assert.equal(persisted.total, initial.total);
  assert.deepEqual(
    persisted.items.map((p) => p._id),
    initial.items.map((p) => p._id),
  );
  await stop(reused);
  assert.equal(await mongoReady(config.mongoUri), true);
  assert.equal(manualDb.exited, false);
  await stop(manualDb);
  await portsFree();
  pass('Restart preserves catalog data and does not stop an independently started MongoDB');

  const occupying = net.createServer((socket) => socket.destroy());
  await new Promise((resolve) => occupying.listen(3000, '127.0.0.1', resolve));
  try {
    const blocked = start();
    await exited(blocked);
    assert.equal(blocked.code, 1);
    assert.match(blocked.log, /Cổng 3000/);
    assert.equal(occupying.listening, true);
    assert.equal(await mongoReady(config.mongoUri), false);
  } finally {
    await new Promise((resolve) => occupying.close(resolve));
  }
  pass('Busy website port gives an actionable error without killing the occupying process');

  const interrupted = start();
  await waitFor(() => interrupted.log.includes('2/3'), {
    timeout: 60000,
    message: 'Did not reach API startup.',
  });
  await stop(interrupted);
  await portsFree();
  pass('Interrupting startup also cleans up MongoDB and partially started services');

  const production = start('scripts/dev.mjs', { args: ['--production'] });
  await exited(production);
  assert.equal(production.code, 1);
  assert.match(production.log, /Không kết nối được MongoDB/);
  await portsFree();
  pass('Production never silently launches the development MongoDB');

  await fs.writeFile(
    path.join(root, 'reports/startup-results.json'),
    JSON.stringify({ passed: results.length, checks: results }, null, 2) + '\n',
  );
  console.log(`${results.length} startup checks passed.`);
} finally {
  for (const run of [...owned].reverse()) await stopOwnedChild(run.child, { graceful: true });
}
