import { test } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mongoReady, mongoFailureMessage } from '../scripts/runtime.mjs';

test('MongoDB probe pings a real database and reports an invalid URI without throwing', async () => {
  const mongo = await MongoMemoryServer.create({ binary: { version: '8.0.17' } });
  try {
    assert.equal(await mongoReady(mongo.getUri(), { timeout: 5000 }), true);
    let failure;
    assert.equal(
      await mongoReady('invalid://private-user:private-password@host', {
        onError: (error) => {
          failure = error;
        },
      }),
      false,
    );
    assert.ok(failure);
    const message = mongoFailureMessage(failure);
    assert.match(message, /MONGODB_URI không hợp lệ/);
    assert.doesNotMatch(message, /private-user|private-password/);
  } finally {
    await mongo.stop();
  }
});

test('MongoDB probe respects its timeout and closes a stalled connection', async () => {
  const sockets = new Set();
  const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.on('data', () => {});
    socket.on('error', () => {});
    socket.on('close', () => sockets.delete(socket));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let failure;
  try {
    const started = Date.now();
    assert.equal(
      await mongoReady(`mongodb://127.0.0.1:${server.address().port}/test`, {
        timeout: 200,
        onError: (error) => {
          failure = error;
        },
      }),
      false,
    );
    assert.ok(Date.now() - started < 1100, 'Custom timeout should replace the 1200 ms default');
    assert.equal(failure.name, 'MongoServerSelectionError');
    // Socket close is delivered on the next event loop turn after client.close().
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(sockets.size, 0);
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Atlas TLS diagnostics identify the failure without exposing credentials or asserting its cause', () => {
  const error = new Error('Server selection failed', {
    cause: new Error(
      'tlsv1 alert internal error: SSL alert number 80 mongodb+srv://private-user:private-password@cluster.mongodb.net/',
    ),
  });
  const message = mongoFailureMessage(error, { atlas: true });
  assert.match(message, /MongoDB Atlas/);
  assert.match(message, /TLS alert 80/);
  assert.match(message, /IP Access List/);
  assert.match(message, /VPN\/proxy\/firewall/);
  assert.doesNotMatch(message, /private-user|private-password|mongodb\+srv:\/\//);
  assert.doesNotMatch(message, /27018|bị chặn/);
});

test('DNS, authentication and certificate failures give different guidance', () => {
  const dns = mongoFailureMessage(
    Object.assign(new Error('querySrv ENOTFOUND'), { code: 'ENOTFOUND' }),
    { atlas: true },
  );
  assert.match(dns, /DNS/);
  assert.doesNotMatch(dns, /mật khẩu|TLS alert/);
  const auth = mongoFailureMessage(
    Object.assign(new Error('bad auth : authentication failed'), {
      name: 'MongoServerError',
      code: 18,
    }),
    { atlas: true },
  );
  assert.match(auth, /Xác thực thất bại/);
  assert.match(auth, /authSource/);
  const cert = mongoFailureMessage(new Error('certificate has expired'), { atlas: true });
  assert.match(cert, /chứng chỉ TLS/);
  assert.doesNotMatch(cert, /IP Access List/);
});

test('Unknown driver messages and cyclic causes remain safe to display', () => {
  const error = new Error('Unexpected response containing secret credentials');
  error.cause = error;
  const message = mongoFailureMessage(error);
  assert.match(message, /Không kết nối được MongoDB/);
  assert.doesNotMatch(message, /secret credentials|Atlas|27018/);
});
