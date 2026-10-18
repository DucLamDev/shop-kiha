import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from '../apps/api/src/config.mjs';
import { connectDb, Admin, Category, Media, Session } from '../apps/api/src/models.mjs';
import { createApp } from '../apps/api/src/app.mjs';
let db, app, agent, category, product;
const origin = 'http://localhost:3000';
const password = crypto.randomBytes(24).toString('base64url');
const image = `/media/${'a'.repeat(64)}.jpg`,
  secondImage = `/media/${'b'.repeat(64)}.jpg`;
const payload = () => ({
  name: 'Giường kiểm thử',
  slug: 'giuong-kiem-thu',
  category: String(category._id),
  images: [image, secondImage],
  thumbnail: image,
  status: 'published',
  shortDescription: 'Chỉ tồn tại trong cơ sở dữ liệu kiểm thử.',
});
const write = (method, path, body, client = agent) =>
  client[method](path).set('Origin', origin).send(body);
before(async () => {
  config.origins = [origin];
  db = await MongoMemoryServer.create({ binary: { version: '8.0.17' } });
  await connectDb(db.getUri('kiha_test'));
  await Admin.create({ email: 'qa@kiha.test', passwordHash: await bcrypt.hash(password, 12) });
  await Media.insertMany([
    { assetId: 'a'.repeat(64), src: image, name: 'test-1.jpg' },
    { assetId: 'b'.repeat(64), src: secondImage, name: 'test-2.jpg' },
  ]);
  category = await Category.create({ name: 'Danh mục kiểm thử', slug: 'kiem-thu', isActive: true });
  app = createApp();
  agent = request.agent(app);
});
after(async () => {
  await mongoose.disconnect();
  if (db) await db.stop();
});
test('health and public settings do not require authentication', async () => {
  await request(app).get('/api/health').expect(200);
  const res = await request(app).get('/api/settings/public').expect(200);
  assert.equal(res.body.data, null);
});
test('all admin resource reads and writes reject anonymous clients', async () => {
  const id = new mongoose.Types.ObjectId();
  for (const path of [
    '/api/admin/auth/me',
    '/api/admin/stats',
    '/api/admin/products',
    '/api/admin/categories',
    '/api/admin/media',
    '/api/admin/settings',
  ])
    await request(app).get(path).expect(401);
  for (const resource of ['products', 'categories']) {
    await write('post', `/api/admin/${resource}`, {}, request(app)).expect(401);
    await write('put', `/api/admin/${resource}/${id}`, {}, request(app)).expect(401);
    await write('delete', `/api/admin/${resource}/${id}`, {}, request(app)).expect(401);
  }
  await write('put', '/api/admin/settings', {}, request(app)).expect(401);
});
test('mutations reject missing or foreign Origin before login', async () => {
  await request(app).post('/api/admin/auth/login').send({}).expect(403);
  await request(app)
    .post('/api/admin/auth/login')
    .set('Origin', 'https://untrusted.test')
    .send({})
    .expect(403);
});
test('login validates credentials and issues HttpOnly SameSite session without password leakage', async () => {
  await write(
    'post',
    '/api/admin/auth/login',
    { email: 'qa@kiha.test', password: 'invalid' },
    request(app),
  ).expect(401);
  const response = await write('post', '/api/admin/auth/login', {
    email: 'qa@kiha.test',
    password,
  }).expect(200);
  const cookie = response.headers['set-cookie'][0];
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.doesNotMatch(JSON.stringify(response.body), /password|Hash/);
  await agent.get('/api/admin/auth/me').expect(200);
  const session = await Session.findOne().lean();
  assert.equal(session.tokenHash.length, 64);
  assert.ok(!cookie.includes(session.tokenHash));
});
test('product CRUD preserves image ordering and optional real price', async () => {
  const response = await write('post', '/api/admin/products', payload()).expect(201);
  product = response.body.data;
  const publicResponse = await request(app).get(`/api/products/${product.slug}`).expect(200);
  assert.equal(publicResponse.body.data.price, null);
  assert.deepEqual(publicResponse.body.data.images, [image, secondImage]);
  const edited = {
    ...payload(),
    images: [secondImage, image],
    thumbnail: secondImage,
    price: 1234567,
  };
  const saved = await write('put', `/api/admin/products/${product._id}`, edited).expect(200);
  assert.deepEqual(saved.body.data.images, edited.images);
  assert.equal(saved.body.data.thumbnail, secondImage);
});
test('duplicate slugs, foreign image URLs, missing assets and invalid thumbnail are rejected', async () => {
  await write('post', '/api/admin/products', payload()).expect(409);
  await write('post', '/api/admin/products', {
    ...payload(),
    slug: 'foreign',
    images: ['https://example.com/a.jpg'],
  }).expect(422);
  await write('post', '/api/admin/products', {
    ...payload(),
    slug: 'missing',
    images: [`/media/${'c'.repeat(64)}.jpg`],
    thumbnail: `/media/${'c'.repeat(64)}.jpg`,
  }).expect(422);
  await write('post', '/api/admin/products', {
    ...payload(),
    slug: 'thumbnail',
    images: [secondImage],
    thumbnail: image,
  }).expect(422);
  await write('post', '/api/admin/products', {
    ...payload(),
    slug: 'category',
    category: String(new mongoose.Types.ObjectId()),
  }).expect(422);
  await write('post', '/api/admin/products', { ...payload(), slug: 'price', price: -10 }).expect(
    422,
  );
  await write('post', '/api/admin/products', { ...payload(), slug: 'role', role: 'admin' }).expect(
    422,
  );
});
test('slug history resolves the current product and remains reserved', async () => {
  await write('put', `/api/admin/products/${product._id}`, {
    ...payload(),
    slug: 'ten-moi',
  }).expect(200);
  const old = await request(app).get('/api/products/giuong-kiem-thu').expect(200);
  assert.equal(old.body.data.slug, 'ten-moi');
  assert.equal(old.body.data.previousSlugs, undefined);
  await write('post', '/api/admin/products', payload()).expect(409);
});
test('draft products and inactive categories are invisible across lists, direct URLs and aliases', async () => {
  await write('put', `/api/admin/products/${product._id}`, {
    ...payload(),
    slug: 'ten-moi',
    status: 'draft',
  }).expect(200);
  await request(app).get('/api/products/ten-moi').expect(404);
  await request(app).get('/api/products/giuong-kiem-thu').expect(404);
  assert.equal((await request(app).get('/api/products').expect(200)).body.data.total, 0);
  await write('put', `/api/admin/products/${product._id}`, {
    ...payload(),
    slug: 'ten-moi',
  }).expect(200);
  await write('put', `/api/admin/categories/${category._id}`, {
    name: category.name,
    slug: category.slug,
    isActive: false,
  }).expect(200);
  await request(app).get('/api/products/ten-moi').expect(404);
  assert.equal((await request(app).get('/api/products?category=kiem-thu')).body.data.total, 0);
  await write('put', `/api/admin/categories/${category._id}`, {
    name: category.name,
    slug: category.slug,
    isActive: true,
  }).expect(200);
});
test('search, pagination, sort and malformed query controls work server-side', async () => {
  await write('post', '/api/admin/products', {
    ...payload(),
    slug: 'thu-hai',
    name: 'Sản phẩm phụ',
  }).expect(201);
  const one = await request(app).get('/api/products?limit=1&page=1&sort=name').expect(200);
  assert.equal(one.body.data.items.length, 1);
  assert.equal(one.body.data.total, 2);
  assert.equal(one.body.data.pages, 2);
  const two = await request(app).get('/api/products?limit=1&page=2&sort=name').expect(200);
  assert.notEqual(one.body.data.items[0]._id, two.body.data.items[0]._id);
  assert.equal((await request(app).get('/api/products?q=ph%E1%BB%A5')).body.data.total, 1);
  assert.equal((await request(app).get('/api/products?q=%5B.*')).body.data.total, 0);
  for (const query of ['page=0', 'limit=5000', 'sort=bad', 'q[$ne]=x', 'category[$ne]=x'])
    await request(app).get(`/api/products?${query}`).expect(422);
  await agent.get('/api/admin/products/not-an-id').expect(422);
});
test('production excludes reference data regardless of publication status', async () => {
  await write('post', '/api/admin/products', {
    ...payload(),
    name: 'Ảnh tham khảo',
    slug: 'anh-tham-khao',
    isDemo: true,
  }).expect(201);
  config.production = true;
  try {
    await request(app).get('/api/products/anh-tham-khao').expect(404);
    const list = await request(app).get('/api/products').expect(200);
    assert.ok(list.body.data.items.every((p) => !p.isDemo));
  } finally {
    config.production = false;
  }
});
test('category CRUD blocks deleting categories with products and rejects duplicate slugs', async () => {
  await write('delete', `/api/admin/categories/${category._id}`, {}).expect(409);
  await write('post', '/api/admin/categories', { name: 'Trùng', slug: category.slug }).expect(409);
  const response = await write('post', '/api/admin/categories', {
    name: 'Trống',
    slug: 'trong',
  }).expect(201);
  const id = response.body.data._id;
  await write('put', `/api/admin/categories/${id}`, {
    name: 'Đã sửa',
    slug: 'trong-da-sua',
    sortOrder: 4,
  }).expect(200);
  await write('delete', `/api/admin/categories/${id}`, {}).expect(200);
  assert.equal(await Category.findById(id), null);
});
test('settings allow known contact channels, reject XSS/SSRF-style URLs, and hide internal fields', async () => {
  const input = {
    shopName: 'KIHA',
    phone: '',
    heroTitle: 'KIHA',
    heroDescription: '',
    aboutTitle: '',
    aboutDescription: '',
    commitments: [],
    seoTitle: '',
    seoDescription: '',
    zaloUrl: 'https://zalo.me/0869572198',
    aboutImage: secondImage,
  };
  await write('put', '/api/admin/settings', input).expect(200);
  for (const value of [
    'javascript:alert(1)',
    'http://127.0.0.1',
    'https://zalo.me.untrusted.test/x',
    'https://user:password@zalo.me/x',
  ])
    await write('put', '/api/admin/settings', { ...input, zaloUrl: value }).expect(422);
  await write('put', '/api/admin/settings', { ...input, heroImage: '/etc/passwd' }).expect(422);
  await write('put', '/api/admin/settings', { ...input, aboutImage: '/etc/passwd' }).expect(422);
  await write('put', '/api/admin/settings', {
    ...input,
    aboutImage: `/media/${'f'.repeat(64)}.webp`,
  }).expect(422);
  const response = await request(app).get('/api/settings/public').expect(200);
  assert.equal(response.body.data.key, undefined);
  assert.equal(response.body.data._id, undefined);
  assert.equal(response.body.data.aboutImage, secondImage);
  const media = await agent.get('/api/admin/media').expect(200);
  assert.equal(media.body.data.total, 2);
  assert.ok(!JSON.stringify(media.body).includes('C:\\'));
});
test('product delete succeeds and public detail becomes 404', async () => {
  await write('delete', `/api/admin/products/${product._id}`, {}).expect(200);
  await request(app).get('/api/products/ten-moi').expect(404);
  await write('delete', `/api/admin/products/${product._id}`, {}).expect(404);
});
test('logout revokes the actual session and replayed cookies fail', async () => {
  const login = await write('post', '/api/admin/auth/login', {
    email: 'qa@kiha.test',
    password,
  }).expect(200);
  const cookie = login.headers['set-cookie'][0].split(';')[0];
  await write('post', '/api/admin/auth/logout', {}).expect(200);
  await request(app).get('/api/admin/auth/me').set('Cookie', cookie).expect(401);
  await agent.get('/api/admin/products').expect(401);
});
test('inactive admins and expired sessions fail at the backend', async () => {
  const token = crypto.randomBytes(32).toString('hex');
  const admin = await Admin.findOne();
  await Session.create({
    tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
    admin: admin._id,
    expiresAt: new Date(Date.now() - 1000),
  });
  await request(app).get('/api/admin/auth/me').set('Cookie', `kiha_session=${token}`).expect(401);
  await Session.updateOne({ admin: admin._id }, { expiresAt: new Date(Date.now() + 3600000) });
  await Admin.updateOne({ _id: admin._id }, { isActive: false });
  await request(app).get('/api/admin/auth/me').set('Cookie', `kiha_session=${token}`).expect(401);
});
test('login is rate limited', async () => {
  let limited = false;
  for (let i = 0; i < 11; i++) {
    const response = await write(
      'post',
      '/api/admin/auth/login',
      { email: 'qa@kiha.test', password: 'wrong' },
      request(app),
    );
    if (response.status === 429) {
      limited = true;
      break;
    }
  }
  assert.equal(limited, true);
});
