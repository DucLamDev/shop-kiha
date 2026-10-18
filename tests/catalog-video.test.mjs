import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from '../apps/api/src/config.mjs';
import { connectDb, Admin, Category, Media, Product, Video } from '../apps/api/src/models.mjs';
import { createApp } from '../apps/api/src/app.mjs';
let db, app, agent, directory, categories, uploaded, product;
const origin = 'http://localhost:3000';
const image = `/media/${'c'.repeat(64)}.png`;
const mp4 = await fs.readFile(new URL('./fixtures/sample.mp4', import.meta.url));
const webm = await fs.readFile(new URL('./fixtures/sample.webm', import.meta.url));
const write = (method, route, body) => agent[method](route).set('Origin', origin).send(body);
const upload = (bytes, name = 'Giường gấp.mp4', mime = 'video/mp4', client = agent) =>
  client
    .post('/api/admin/videos')
    .set('Origin', origin)
    .attach('video', bytes, { filename: name, contentType: mime });
const payload = () => ({
  name: 'Mẫu nhiều nhóm',
  slug: 'mau-nhieu-nhom',
  category: String(categories[0]._id),
  categories: categories.map((c) => String(c._id)),
  images: [image],
  thumbnail: image,
  status: 'published',
  video: uploaded.src,
  videoDescription: 'Minh họa cách gấp giường.',
});
before(async () => {
  config.origins = [origin];
  config.production = false;
  directory = await fs.mkdtemp(path.join(os.tmpdir(), 'kiha-video-test-'));
  db = await MongoMemoryServer.create({ binary: { version: '8.0.17' } });
  await connectDb(db.getUri('kiha_video_test'));
  const password = randomBytes(24).toString('hex');
  await Admin.create({ email: 'video@kiha.test', passwordHash: await bcrypt.hash(password, 10) });
  await Media.create({ assetId: 'c'.repeat(64), src: image, name: 'fixture.png' });
  categories = await Category.create([
    { name: 'Chân cao', slug: 'chan-cao' },
    { name: 'Gấp gọn', slug: 'gap-gon' },
  ]);
  app = createApp({ videoDir: directory, videoMaxBytes: 4096 });
  agent = request.agent(app);
  await write('post', '/api/admin/auth/login', { email: 'video@kiha.test', password }).expect(200);
});
after(async () => {
  await mongoose.disconnect();
  if (db) await db.stop();
  const resolved = path.resolve(directory);
  assert.ok(
    resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) &&
      path.basename(resolved).startsWith('kiha-video-test-'),
  );
  await fs.rm(resolved, { recursive: true, force: true });
});
test('upload requires admin and allowed Origin before writing files', async () => {
  await upload(mp4, 'video.mp4', 'video/mp4', request(app)).expect(401);
  await agent.post('/api/admin/videos').attach('video', mp4, 'video.mp4').expect(403);
  await agent
    .post('/api/admin/videos')
    .set('Origin', 'https://evil.test')
    .attach('video', mp4, 'video.mp4')
    .expect(403);
  await request(app).get('/api/admin/videos').expect(401);
  await request(app)
    .delete(`/api/admin/videos/${new mongoose.Types.ObjectId()}`)
    .set('Origin', origin)
    .expect(401);
  assert.deepEqual(await fs.readdir(directory), []);
});
test('valid MP4 preserves Vietnamese filename and remains private until published', async () => {
  const response = await upload(mp4).expect(201);
  uploaded = response.body.data;
  assert.equal(uploaded.name, 'Giường gấp.mp4');
  assert.equal(uploaded.bytes, mp4.length);
  assert.match(uploaded.src, /^\/api\/videos\/[a-f0-9-]+\.mp4$/);
  assert.deepEqual(await fs.readFile(path.join(directory, uploaded.filename)), mp4);
  await request(app).get(uploaded.src).expect(401);
  await request(app).head(uploaded.src).expect(401);
  const preview = await agent.get(uploaded.src).set('Range', 'bytes=0-31').expect(206);
  assert.equal(preview.headers['content-length'], '32');
  assert.equal(preview.headers['content-type'], 'video/mp4');
  assert.match(preview.headers['content-range'], /^bytes 0-31\//);
});
test('reject fake types, oversized files and multipart abuse without leftover files', async () => {
  await upload(Buffer.from('<script>bad</script>')).expect(422);
  await upload(mp4, 'bad.webm', 'video/webm').expect(422);
  await upload(mp4, 'bad.html', 'text/html').expect(422);
  await upload(Buffer.concat([mp4, Buffer.alloc(4096)])).expect(413);
  await agent
    .post('/api/admin/videos')
    .set('Origin', origin)
    .attach('wrong', mp4, 'test.mp4')
    .expect(422);
  await agent
    .post('/api/admin/videos')
    .set('Origin', origin)
    .attach('video', mp4, 'a.mp4')
    .attach('video', mp4, 'b.mp4')
    .expect(422);
  await agent.post('/api/admin/videos').set('Origin', origin).expect(422);
  assert.equal(await Video.countDocuments(), 1);
  assert.deepEqual(await fs.readdir(path.join(directory, '.tmp')), []);
});
test('WebM can be uploaded, previewed and removed from the library', async () => {
  const response = await upload(webm, 'mẫu.webm', 'video/webm').expect(201);
  const video = response.body.data;
  await agent.get(video.src).expect('Content-Type', 'video/webm').expect(200);
  const list = await agent.get('/api/admin/videos?limit=1&q=m%E1%BA%ABu').expect(200);
  assert.equal(list.body.data.total, 1);
  await write('delete', `/api/admin/videos/${video._id}`).expect(200);
  await agent.get(video.src).expect(404);
  await assert.rejects(fs.access(path.join(directory, video.filename)));
});
test('one product appears in both groups, permits video playback, and protects referenced assets', async () => {
  product = (await write('post', '/api/admin/products', payload()).expect(201)).body.data;
  for (const category of categories) {
    const list = await request(app).get(`/api/products?category=${category.slug}`).expect(200);
    assert.equal(list.body.data.total, 1);
    assert.equal(list.body.data.items[0]._id, product._id);
    await write('delete', `/api/admin/categories/${category._id}`).expect(409);
  }
  assert.equal((await request(app).get('/api/products')).body.data.total, 1);
  await request(app).get(uploaded.src).set('Range', 'bytes=16-63').expect(206);
  await request(app).head(uploaded.src).expect(200);
  await request(app).get(uploaded.src).set('Range', 'bytes=999999-').expect(416);
  await write('delete', `/api/admin/videos/${uploaded._id}`).expect(409);
  await write('put', `/api/admin/products/${product._id}`, {
    ...payload(),
    video: `/api/videos/${randomUUID()}.mp4`,
  }).expect(422);
  await write('put', `/api/admin/products/${product._id}`, {
    ...payload(),
    video: 'https://evil.test/a.mp4',
  }).expect(422);
  await write('put', `/api/admin/products/${product._id}`, {
    ...payload(),
    categories: [String(new mongoose.Types.ObjectId())],
  }).expect(422);
});
test('active secondary group keeps product visible without exposing hidden categories; drafts and demos protect video', async () => {
  await Category.updateOne({ _id: categories[0]._id }, { isActive: false });
  const detail = (await request(app).get('/api/products/mau-nhieu-nhom').expect(200)).body.data;
  assert.equal(detail.category.slug, 'gap-gon');
  assert.equal(detail.categories.length, 1);
  assert.equal((await request(app).get('/api/products?category=chan-cao')).body.data.total, 0);
  await Category.updateMany({}, { isActive: false });
  await request(app).get('/api/products/mau-nhieu-nhom').expect(404);
  await request(app).get(uploaded.src).expect(401);
  await Category.updateMany({}, { isActive: true });
  await write('put', `/api/admin/products/${product._id}`, {
    ...payload(),
    status: 'draft',
  }).expect(200);
  await request(app).get(uploaded.src).expect(401);
  await agent.get(uploaded.src).expect(200);
  await write('put', `/api/admin/products/${product._id}`, { ...payload(), isDemo: true }).expect(
    200,
  );
  config.production = true;
  try {
    await request(app).get(uploaded.src).expect(401);
  } finally {
    config.production = false;
  }
});
test('unassigning a video permits deletion without deleting product images', async () => {
  await write('put', `/api/admin/products/${product._id}`, { ...payload(), video: '' }).expect(200);
  await write('delete', `/api/admin/videos/${uploaded._id}`).expect(200);
  await request(app).get(uploaded.src).expect(404);
  assert.equal(await Video.countDocuments(), 0);
  assert.deepEqual((await Product.findById(product._id)).images.toObject(), [image]);
  assert.deepEqual(await fs.readdir(directory), ['.tmp']);
});
