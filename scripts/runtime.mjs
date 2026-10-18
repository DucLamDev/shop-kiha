import net from 'node:net';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import mongoose from 'mongoose';

export async function assertPortFree(port, host, label) {
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error(`Cổng ${label} không hợp lệ.`);
  const occupied = () =>
    new Error(
      `Cổng ${port} (${label}) đang được sử dụng. Dừng phiên đang chạy bằng Ctrl+C ở terminal cũ rồi thử lại. Không tự chuyển sang cổng khác.`,
    );
  // On Windows an IPv6 bind can succeed while an IPv4 listener already owns the
  // same port. Probe both loopback families before trying the actual bind.
  const hosts = host
    ? [host === '0.0.0.0' ? '127.0.0.1' : host === '::' ? '::1' : host]
    : ['127.0.0.1', '::1'];
  for (const address of hosts) {
    const listening = await new Promise((resolve) => {
      const socket = net.createConnection({ port, host: address });
      const finish = (value) => {
        socket.destroy();
        resolve(value);
      };
      socket.once('connect', () => finish(true));
      socket.once('error', () => finish(false));
      socket.setTimeout(500, () => finish(false));
    });
    if (listening) throw occupied();
  }
  const probe = net.createServer();
  await new Promise((resolve, reject) => {
    probe.once('error', (error) =>
      reject(
        new Error(
          error.code === 'EADDRINUSE'
            ? `Cổng ${port} (${label}) đang được sử dụng. Dừng phiên đang chạy bằng Ctrl+C ở terminal cũ rồi thử lại. Không tự chuyển sang cổng khác.`
            : `Không thể mở cổng ${port} (${label}): ${error.code}`,
        ),
      ),
    );
    probe.listen({ port, ...(host ? { host } : {}), exclusive: true }, () => probe.close(resolve));
  });
}

export async function mongoReady(uri) {
  if (!uri) return false;
  const client = new mongoose.mongo.MongoClient(uri, {
    serverSelectionTimeoutMS: 1200,
    connectTimeoutMS: 1200,
  });
  try {
    await client.connect();
    await client.db().command({ ping: 1 });
    return true;
  } catch {
    return false;
  } finally {
    await client.close();
  }
}

export async function waitFor(check, { timeout = 30000, signal, message }) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    signal?.throwIfAborted();
    if (await check()) return;
    await delay(200, undefined, { signal });
  }
  throw new Error(message);
}

export async function httpReady(url) {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(1500) })).ok;
  } catch {
    return false;
  }
}

export async function stopOwnedChild(child, { graceful = false } = {}) {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise((resolve) => child.once('exit', () => resolve(true)));
  if (graceful && child.connected) {
    child.send({ type: 'shutdown' }, () => {});
    const timer = new AbortController();
    const stopped = await Promise.race([
      exited,
      delay(10000, false, { signal: timer.signal }).catch(() => false),
    ]);
    timer.abort();
    if (stopped) return;
  }
  // Only the PID spawned by this runner is targeted. Never kill by port or executable name.
  if (process.platform === 'win32') {
    try {
      await promisify(execFile)('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        windowsHide: true,
      });
    } catch (error) {
      if (child.exitCode === null && child.signalCode === null) throw error;
    }
  } else {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
  }
  const timer = new AbortController();
  const stopped = await Promise.race([
    exited,
    delay(5000, false, { signal: timer.signal }).catch(() => false),
  ]);
  timer.abort();
  if (!stopped) throw new Error(`Chưa dừng được tiến trình KIHA ${child.pid}.`);
}
