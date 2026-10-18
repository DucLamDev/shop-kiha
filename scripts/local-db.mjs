import fs from 'node:fs/promises';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config, root } from '../apps/api/src/config.mjs';
// Despite the package name this uses an actual mongod with persistent WiredTiger storage.
const dbPath = path.join(root, '.local/mongodb');
const localUri = new URL(config.mongoUri || 'mongodb://127.0.0.1:27018/kiha');
if (localUri.protocol !== 'mongodb:' || !['127.0.0.1', 'localhost'].includes(localUri.hostname)) {
  throw new Error(
    'db:local requires a loopback mongodb:// URI. Remote MongoDB does not need this helper.',
  );
}
const port = Number(localUri.port || 27018);
await fs.mkdir(dbPath, { recursive: true });
const db = new MongoMemoryServer({
  binary: { version: '8.0.17' },
  instance: { ip: '127.0.0.1', port, dbPath, storageEngine: 'wiredTiger' },
});
let stopping;
const starting = db.start(true);
function stop(code = 0) {
  if (stopping) return stopping;
  stopping = (async () => {
    await starting.catch(() => {});
    await db.stop({ doCleanup: false, force: false });
    if (process.connected) process.disconnect();
    process.exitCode = code;
  })();
  return stopping;
}
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    void stop();
  });
process.on('message', (message) => {
  if (message?.type === 'shutdown') void stop();
});
process.on('disconnect', () => {
  void stop();
});
try {
  await starting;
  if (!stopping) {
    console.log(`Local MongoDB ready at ${db.getUri('kiha')} (persistent storage: .local/mongodb)`);
    process.send?.({ type: 'ready' });
  }
} catch (error) {
  console.error(`[KIHA] Không thể bật MongoDB local: ${error.message}`);
  await stop(1);
}
