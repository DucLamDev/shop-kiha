import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config, root } from '../apps/api/src/config.mjs';
import { assertPortFree, mongoReady, httpReady, waitFor, stopOwnedChild } from './runtime.mjs';

const production = process.argv.includes('--production');
const webPort = Number(process.env.PORT || 3000);
const webUrl = `http://localhost:${webPort}`;
const lockPath = path.join(root, '.local/dev-runner.lock');
const children = [];
const abort = new AbortController();
let ownsLock = false,
  stopping = false,
  shutdownPromise;

async function acquireLock() {
  await fs.mkdir(path.dirname(lockPath), { recursive: true });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const handle = await fs.open(lockPath, 'wx');
      ownsLock = true;
      try {
        await handle.writeFile(JSON.stringify({ pid: process.pid, root, webUrl }));
      } finally {
        await handle.close();
      }
      return;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let owner;
      try {
        owner = JSON.parse(await fs.readFile(lockPath, 'utf8'));
      } catch {
        throw new Error('Một phiên KIHA đang khởi tạo. Hãy đợi vài giây rồi thử lại.');
      }
      let alive = true;
      if (!Number.isInteger(owner.pid) || owner.pid <= 0)
        throw new Error(`Khóa phiên không hợp lệ: ${lockPath}`);
      try {
        process.kill(owner.pid, 0);
      } catch (error) {
        if (error.code === 'ESRCH') alive = false;
        else throw error;
      }
      if (alive)
        throw new Error(
          `KIHA đã có phiên đang chạy (PID ${owner.pid}). Mở ${owner.webUrl || webUrl}, hoặc nhấn Ctrl+C trong terminal cũ trước khi chạy lại.`,
        );
      // Remove only this project's stale launcher lock, never Next.js locks or other processes.
      await fs.unlink(lockPath).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
  }
  throw new Error('Không thể tạo khóa phiên KIHA. Hãy thử lại.');
}

function launch(name, args, { cwd = root, ipc = false } = {}) {
  abort.signal.throwIfAborted();
  const child = spawn(process.execPath, args, {
    cwd,
    windowsHide: true,
    detached: process.platform !== 'win32',
    stdio: ipc ? ['inherit', 'inherit', 'inherit', 'ipc'] : 'inherit',
    env: { ...process.env, NODE_ENV: production ? 'production' : 'development' },
  });
  children.push({ name, child, ipc });
  child.once('error', (error) => {
    if (!stopping) {
      console.error(`[KIHA] Không thể chạy ${name}: ${error.message}`);
      void shutdown(1);
    }
  });
  child.once('exit', (code) => {
    if (!stopping) {
      console.error(`[KIHA] ${name} đã dừng (mã ${code ?? 'signal'}).`);
      void shutdown(code || 1);
    }
  });
  return child;
}

function shutdown(code = 0) {
  if (shutdownPromise) return shutdownPromise;
  stopping = true;
  abort.abort();
  shutdownPromise = (async () => {
    for (const { name, child, ipc } of [...children].reverse()) {
      try {
        await stopOwnedChild(child, { graceful: ipc });
      } catch (error) {
        console.error(`[KIHA] Lỗi khi dừng ${name}: ${error.message}`);
        code = 1;
      }
    }
    if (ownsLock) {
      try {
        const owner = JSON.parse(await fs.readFile(lockPath, 'utf8'));
        if (owner.pid === process.pid) await fs.unlink(lockPath);
      } catch (error) {
        if (error.code !== 'ENOENT')
          console.error(`[KIHA] Không thể dọn khóa phiên: ${error.message}`);
      }
    }
    process.exitCode = code;
    if (process.connected) process.disconnect();
  })();
  return shutdownPromise;
}
for (const signal of ['SIGINT', 'SIGTERM', ...(process.platform === 'win32' ? ['SIGBREAK'] : [])])
  process.on(signal, () => {
    void shutdown();
  });
process.on('message', (message) => {
  if (message?.type === 'shutdown') void shutdown();
});
process.on('disconnect', () => {
  void shutdown();
});

try {
  await acquireLock();
  await assertPortFree(webPort, undefined, 'website');
  await assertPortFree(config.port, config.host, 'API');
  const apiUrl = new URL(process.env.API_INTERNAL_URL || '');
  if (
    apiUrl.protocol !== 'http:' ||
    Number(apiUrl.port || 80) !== config.port ||
    !['127.0.0.1', 'localhost', '::1', '[::1]'].includes(apiUrl.hostname)
  )
    throw new Error(
      'API_INTERNAL_URL phải trỏ tới API local và khớp API_PORT. Kiểm tra file .env.',
    );
  if (!config.mongoUri) throw new Error('Thiếu MONGODB_URI trong .env.');
  console.log('[KIHA] 1/3 · Kiểm tra MongoDB…');
  if (!(await mongoReady(config.mongoUri))) {
    let uri;
    try {
      uri = new URL(config.mongoUri);
    } catch {
      /* remote MongoDB URIs may contain multiple hosts */
    }
    const canAutoStart =
      !production &&
      uri?.protocol === 'mongodb:' &&
      ['127.0.0.1', 'localhost'].includes(uri.hostname) &&
      uri.port === '27018' &&
      uri.pathname === '/kiha' &&
      !uri.username &&
      !uri.password;
    if (!canAutoStart)
      throw new Error(
        'Không kết nối được MongoDB đã cấu hình. Kiểm tra database/MONGODB_URI; chỉ tự khởi động MongoDB local của KIHA tại cổng 27018 khi chạy dev.',
      );
    await assertPortFree(27018, '127.0.0.1', 'MongoDB local');
    console.log('[KIHA] Đang bật MongoDB local, giữ dữ liệu trong .local/mongodb.');
    const database = launch('MongoDB local', [path.join(root, 'scripts/local-db.mjs')], {
      ipc: true,
    });
    let ready = false;
    database.on('message', (message) => {
      if (message?.type === 'ready') ready = true;
    });
    await waitFor(() => ready, {
      signal: abort.signal,
      timeout: 600000,
      message: 'MongoDB chưa sẵn sàng. Kiểm tra log tải binary ở trên.',
    });
  } else console.log('[KIHA] Dùng MongoDB đang chạy; phiên này sẽ không dừng database đó.');

  console.log('[KIHA] 2/3 · Khởi động API…');
  launch('API', [...(production ? [] : ['--watch']), path.join(root, 'apps/api/src/server.mjs')]);
  await waitFor(() => httpReady(new URL('/api/health', apiUrl)), {
    signal: abort.signal,
    message: 'API chưa sẵn sàng. Xem lỗi API ở trên; website chưa được khởi động.',
  });

  console.log('[KIHA] 3/3 · Khởi động website…');
  launch(
    'website',
    [
      path.join(root, 'node_modules/next/dist/bin/next'),
      production ? 'start' : 'dev',
      '--port',
      String(webPort),
    ],
    { cwd: path.join(root, 'apps/web') },
  );
  await waitFor(() => httpReady(`${webUrl}/api/health`), {
    signal: abort.signal,
    timeout: 60000,
    message: 'Website chưa sẵn sàng. Kiểm tra log Next.js ở trên.',
  });
  abort.signal.throwIfAborted();
  console.log(`[KIHA] Sẵn sàng: ${webUrl} · Ctrl+C để dừng phiên.`);
  process.send?.({ type: 'ready', webUrl });
} catch (error) {
  if (!stopping) {
    console.error(`[KIHA] ${error.message}`);
    await shutdown(1);
  }
}
