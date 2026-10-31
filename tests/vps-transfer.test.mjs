import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

test('VPS transfer preserves references, dates and videos, excludes logins and refuses overwrite', async () => {
  const mongo = await MongoMemoryServer.create({ binary: { version: '8.0.17' } });
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'kiha-transfer-test-'));
  const sourceVideos = path.join(folder, 'source-videos');
  const targetVideos = path.join(folder, 'target-videos');
  const exported = path.join(folder, 'export');
  const filename = '11111111-1111-4111-8111-111111111111.mp4';
  const bytes = Buffer.from('video fixture bytes');
  const categoryId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const date = new Date('2026-10-20T00:00:00Z');
  const client = new mongoose.mongo.MongoClient(mongo.getUri());
  const run = (mode, database, videos) =>
    spawnSync(process.execPath, ['scripts/vps-transfer.mjs', mode, exported], {
      env: { ...process.env, MONGODB_URI: mongo.getUri(database), VIDEO_UPLOAD_DIR: videos },
      encoding: 'utf8',
      timeout: 30000,
    });
  try {
    await client.connect();
    await fs.mkdir(sourceVideos);
    await fs.writeFile(path.join(sourceVideos, filename), bytes);
    const source = client.db('transfer_source');
    await source.collection('categories').insertOne({ _id: categoryId, name: 'Pallet' });
    await source.collection('products').insertOne({
      _id: productId,
      category: categoryId,
      categories: [categoryId],
      createdAt: date,
      images: ['/media/sample.webp'],
      video: `/api/videos/${filename}`,
    });
    await source.collection('videos').insertOne({ filename });
    await source.collection('settings').insertOne({
      key: 'site',
      statistics: { salesCount: 1000, interestedCount: 1500, positiveReviewCount: 900 },
    });
    await source
      .collection('admins')
      .insertOne({ email: 'local@test.invalid', passwordHash: 'private' });
    await source.collection('sessions').insertOne({ tokenHash: 'private-session' });
    const result = run('export', 'transfer_source', sourceVideos);
    assert.equal(result.status, 0, result.stderr);
    const content = await fs.readFile(path.join(exported, 'catalog.ejson'), 'utf8');
    assert.ok(!content.includes('private'));
    assert.ok(!content.includes('local@test.invalid'));
    const imported = run('import', 'transfer_target', targetVideos);
    assert.equal(imported.status, 0, imported.stderr);
    const target = client.db('transfer_target');
    const product = await target.collection('products').findOne({ _id: productId });
    assert.equal(product.category.toHexString(), categoryId.toHexString());
    assert.equal(product.createdAt.toISOString(), date.toISOString());
    assert.deepEqual(product.images, ['/media/sample.webp']);
    assert.deepEqual(await fs.readFile(path.join(targetVideos, filename)), bytes);
    assert.equal(await target.collection('admins').countDocuments(), 0);
    assert.equal(await target.collection('sessions').countDocuments(), 0);
    assert.equal((await target.collection('settings').findOne()).statistics.salesCount, 1000);
    assert.notEqual(run('import', 'transfer_target', targetVideos).status, 0);
    assert.equal(await target.collection('products').countDocuments(), 1);
    assert.equal(await source.collection('products').countDocuments(), 1);
    assert.notEqual(run('export', 'transfer_source', sourceVideos).status, 0);
    const empty = run('export', 'transfer_empty', sourceVideos);
    assert.notEqual(empty.status, 0);
    assert.match(empty.stderr, /Source database is empty/);
  } finally {
    await client.close();
    await mongo.stop();
    // Test artifacts are retained in the OS temp directory for failure inspection.
  }
});
