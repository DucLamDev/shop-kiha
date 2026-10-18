import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from '../apps/api/src/config.mjs';
const base = process.env.SITE_URL || 'http://localhost:3000';
const catalog = JSON.parse(await fs.readFile(path.join(root, 'data/catalog.json'), 'utf8'));
const credentials = await fs.readFile(path.join(root, '.local/admin-credentials.txt'), 'utf8');
const email = credentials.match(/^Email: (.+)$/m)?.[1],
  password = credentials.match(/^Password: (.+)$/m)?.[1];
if (!email || !password)
  throw new Error('Run npm run admin:create -- --generate-local before browser QA.');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const errors = [],
  results = [];
page.on('pageerror', (error) => errors.push(error.message));
const suffix = Date.now().toString(36),
  categoryName = `Danh mục QA ${suffix}`,
  productName = `Giường QA ${suffix}`;
let categoryId, productId, videoId, videoSrc;
async function check(name, task) {
  await task();
  results.push(name);
  console.log(`PASS ${name}`);
}
async function goto(route) {
  const r = await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 60000 });
  return r;
}
async function noOverflow() {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
}
async function submitAndRead(urlPart, click) {
  const response = page.waitForResponse(
    (r) => r.url().includes(urlPart) && ['POST', 'PUT', 'DELETE'].includes(r.request().method()),
  );
  await click();
  const r = await response;
  const json = await r.json();
  assert.ok(r.ok(), JSON.stringify(json));
  return json.data;
}
try {
  await check('Desktop home, real contact links, image loading and layout', async () => {
    assert.equal((await goto('/')).status(), 200);
    await noOverflow();
    assert.ok(await page.locator('h1').innerText());
    assert.equal(await page.locator('.category-card').count(), catalog.length);
    for (const category of catalog)
      await page
        .locator('.category-grid')
        .getByRole('heading', { name: category.name, exact: true })
        .waitFor();
    assert.ok(await page.locator('a[href="https://zalo.me/0869572198"]').count());
    await page.locator('.hero-visual img').evaluate((img) => img.decode());
    await page.screenshot({ path: path.join(root, 'reports/home-desktop.png'), fullPage: true });
    const broken = await page
      .locator('img')
      .evaluateAll((images) => images.filter((i) => i.complete && !i.naturalWidth).length);
    assert.equal(broken, 0);
  });
  await check('Catalog search, empty state, category URL and back navigation', async () => {
    await goto('/san-pham');
    await page.getByRole('textbox', { name: 'Tìm tên sản phẩm' }).fill(`absent-${suffix}`);
    await page.getByRole('button', { name: 'Áp dụng' }).click();
    await page.getByRole('heading', { name: 'Chưa tìm thấy sản phẩm phù hợp' }).waitFor();
    assert.ok(page.url().includes('q='));
    await page.getByRole('link', { name: 'Xóa bộ lọc' }).click();
    await page.locator('.product-card').first().waitFor();
    await page
      .locator('.category-pills')
      .getByRole('link', { name: catalog[0].name, exact: true })
      .click();
    await page.waitForURL(`**/san-pham?category=${catalog[0].slug}`);
    for (const category of catalog) {
      const response = await context.request.get(`${base}/api/products?category=${category.slug}`);
      const { data } = await response.json();
      assert.ok(data.total > 0);
      assert.ok(
        data.items.every((product) =>
          product.categories.some((group) => group.slug === category.slug),
        ),
      );
    }
    await page.goBack();
    await page.waitForURL('**/san-pham');
  });
  await check('Product details and accessible image lightbox', async () => {
    await page.locator('.product-image').first().click();
    await page.getByRole('button', { name: /Phóng to ảnh/ }).click();
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.ok(await page.locator('link[rel="canonical"]').getAttribute('href'));
    await noOverflow();
    await page.screenshot({ path: path.join(root, 'reports/product-desktop.png'), fullPage: true });
  });
  await check('Contact page uses supplied Zalo, phone, Facebook, TikTok and Maps', async () => {
    await goto('/lien-he');
    for (const href of [
      'tel:0869572198',
      'https://www.facebook.com/giuonggapgotphcm',
      'https://maps.app.goo.gl/7b3bgs5L2yuCSvKK7',
    ])
      assert.ok(await page.locator(`a[href="${href}"]`).count());
    assert.ok(await page.locator('a[href^="https://www.tiktok.com/@noithatkiha"]').count());
    await noOverflow();
  });
  await check('Mobile drawer, product and contact layouts at 390px', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await goto('/');
    await noOverflow();
    await page.screenshot({ path: path.join(root, 'reports/home-mobile.png'), fullPage: true });
    await page.getByRole('button', { name: 'Mở menu' }).click();
    await page.getByRole('dialog').getByRole('link', { name: 'Sản phẩm', exact: true }).click();
    await page.waitForURL('**/san-pham');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await noOverflow();
    await page.screenshot({ path: path.join(root, 'reports/catalog-mobile.png'), fullPage: true });
    await goto('/lien-he');
    await noOverflow();
  });
  await check('Protected admin redirects to login and signs in with server session', async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await goto('/admin');
    await page.waitForURL('**/admin/dang-nhap');
    await page.getByLabel('Email quản trị').fill(email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await page.waitForURL('**/admin');
    await page.getByRole('heading', { name: 'Tổng quan' }).waitFor();
    const cookies = await context.cookies();
    assert.ok(cookies.find((c) => c.name === 'kiha_session' && c.httpOnly && c.sameSite === 'Lax'));
    await page.screenshot({ path: path.join(root, 'reports/admin-dashboard.png'), fullPage: true });
  });
  await check('Admin category create and validation-ready form', async () => {
    await goto('/admin/danh-muc');
    await page.getByRole('button', { name: 'Thêm danh mục', exact: true }).click();
    await page.getByLabel('Tên danh mục *', { exact: true }).fill(categoryName);
    const saved = await submitAndRead('/api/admin/categories', () =>
      page.getByRole('button', { name: 'Lưu danh mục', exact: true }).click(),
    );
    categoryId = saved._id;
    await page.getByRole('cell', { name: categoryName, exact: true }).waitFor();
  });
  await check(
    'Admin product create, media selection, gallery order and draft privacy',
    async () => {
      await goto('/admin/san-pham/tao-moi');
      await page.getByLabel('Tên sản phẩm *', { exact: true }).fill(productName);
      await page.getByLabel('Danh mục *', { exact: true }).selectOption(categoryId);
      await page
        .getByLabel('Mô tả ngắn', { exact: true })
        .fill('Bản kiểm thử tự động sẽ được xóa sau khi hoàn thành.');
      await page.getByRole('button', { name: 'Chọn ảnh từ thư viện' }).click();
      const dialog = page.getByRole('dialog');
      await dialog.locator('.media-tile').first().waitFor();
      await dialog.locator('.media-tile').nth(0).click();
      await dialog.locator('.media-tile').nth(1).click();
      await dialog.getByRole('button', { name: 'Dùng ảnh đã chọn' }).click();
      await page.getByRole('button', { name: 'Đặt ảnh 2 làm đại diện' }).click();
      await page.getByRole('button', { name: 'Đưa ảnh 2 về trước' }).click();
      await page.getByLabel('Dữ liệu tham khảo', { exact: true }).check();
      // A valid MP4 with a free box verifies uploads larger than 10 MB through Next's rewrite.
      const fixture = await fs.readFile(path.join(root, 'tests/fixtures/sample.mp4'));
      const free = Buffer.alloc(12 * 1024 * 1024);
      free.writeUInt32BE(free.length, 0);
      free.write('free', 4, 'ascii');
      const uploadResponse = page.waitForResponse(
        (r) => r.url().endsWith('/api/admin/videos') && r.request().method() === 'POST',
      );
      await page
        .getByLabel('Chọn file video', { exact: true })
        .setInputFiles({
          name: `Giới thiệu QA ${suffix}.mp4`,
          mimeType: 'video/mp4',
          buffer: Buffer.concat([fixture, free]),
        });
      const uploadedResponse = await uploadResponse;
      const uploaded = (await uploadedResponse.json()).data;
      assert.equal(uploadedResponse.status(), 201);
      videoId = uploaded._id;
      videoSrc = uploaded.src;
      assert.ok(uploaded.bytes > 10 * 1024 * 1024);
      await page.locator('.selected-video video').waitFor();
      await page
        .getByLabel('Nội dung video bằng văn bản')
        .fill('Video kiểm thử chức năng phát, không phải video sản phẩm thật.');
      await page.getByLabel(catalog[0].name, { exact: true }).check();
      const saved = await submitAndRead('/api/admin/products', () =>
        page.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click(),
      );
      productId = saved._id;
      assert.equal(saved.images.length, 2);
      assert.equal(saved.thumbnail, saved.images[0]);
      assert.equal(saved.video, videoSrc);
      assert.equal(saved.categories.length, 2);
      await page.waitForURL('**/admin/san-pham');
      const publicResponse = await context.request.get(`${base}/api/products/${saved.slug}`);
      assert.equal(publicResponse.status(), 404);
      const anonymous = await browser.newContext();
      try {
        assert.equal((await anonymous.request.get(`${base}${videoSrc}`)).status(), 401);
      } finally {
        await anonymous.close();
      }
    },
  );
  await check('Admin edits and publishes; public gallery shows saved data', async () => {
    await goto(`/admin/san-pham/${productId}`);
    await page.getByLabel('Trạng thái', { exact: true }).selectOption('published');
    await page.getByRole('button', { name: 'Thêm thông số' }).click();
    await page.getByLabel('Tên thông số 1', { exact: true }).fill('Thông tin QA');
    await page.getByLabel('Giá trị thông số 1', { exact: true }).fill('Dữ liệu kiểm thử');
    const saved = await submitAndRead('/api/admin/products', () =>
      page.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click(),
    );
    await page.waitForURL('**/admin/san-pham');
    await goto(`/san-pham/${saved.slug}`);
    await page.getByRole('heading', { name: productName, exact: true }).waitFor();
    assert.equal(await page.locator('.gallery-thumbnails button').count(), 2);
    await page.getByRole('button', { name: 'Xem ảnh 2', exact: true }).click();
    await page.getByRole('button', { name: /Phóng to ảnh/ }).click();
    await page.getByRole('button', { name: 'Ảnh trước', exact: true }).click();
    await page.keyboard.press('Escape');
    const video = page.locator('.detail-video-section video');
    await video.waitFor();
    assert.equal(await video.getAttribute('preload'), 'none');
    await video.evaluate(async (element) => {
      element.muted = true;
      await element.play();
    });
    await page.waitForFunction(
      () => document.querySelector('.detail-video-section video').currentTime > 0.05,
    );
    await video.evaluate((element) => {
      element.pause();
      element.currentTime = 0.5;
    });
    await page.waitForFunction(
      () => !document.querySelector('.detail-video-section video').seeking,
    );
    await page.getByText('Nội dung video', { exact: true }).click();
    await page
      .getByText('Video kiểm thử chức năng phát, không phải video sản phẩm thật.', { exact: true })
      .waitFor();
    const anonymous = await browser.newContext();
    try {
      assert.equal(
        (
          await anonymous.request.get(`${base}${videoSrc}`, { headers: { Range: 'bytes=0-63' } })
        ).status(),
        206,
      );
    } finally {
      await anonymous.close();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await noOverflow();
    await page
      .locator('.detail-video-section')
      .screenshot({ path: path.join(root, 'reports/product-video-mobile.png') });
    await page.setViewportSize({ width: 768, height: 1024 });
    await noOverflow();
  });
  await check('Admin media search, settings persistence and tablet layout', async () => {
    await goto('/admin/hinh-anh');
    await page.getByRole('textbox', { name: 'Tìm tên file' }).fill('logo');
    await page.getByRole('button', { name: 'Tìm ảnh', exact: true }).click();
    await page.locator('.media-tile').filter({ hasText: 'logo.png' }).waitFor();
    await noOverflow();
    await goto('/admin/cai-dat');
    await page.getByLabel('Tên cửa hàng', { exact: true }).waitFor();
    assert.equal(
      await page.getByLabel('Số điện thoại', { exact: true }).inputValue(),
      '0869 572 198',
    );
    await submitAndRead('/api/admin/settings', () =>
      page.getByRole('button', { name: 'Lưu cài đặt', exact: true }).click(),
    );
    await noOverflow();
    await page.setViewportSize({ width: 390, height: 844 });
    await noOverflow();
  });
  await check('Admin API error state and retry recovers', async () => {
    await page.route('**/api/admin/media?**', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Lỗi kết nối kiểm thử.' } }),
      }),
    );
    await goto('/admin/hinh-anh');
    await page.locator('.form-error[role=alert]').waitFor();
    await page.unroute('**/api/admin/media?**');
    await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
    await page.locator('.media-tile').first().waitFor();
  });
  await check('Admin deletion confirmations and cleanup work', async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await goto('/admin/san-pham');
    await page.getByRole('textbox', { name: 'Tìm sản phẩm', exact: true }).fill(productName);
    await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
    await page.getByRole('button', { name: `Xóa ${productName}`, exact: true }).click();
    await page.getByRole('button', { name: 'Giữ lại', exact: true }).click();
    await page.getByRole('button', { name: `Xóa ${productName}`, exact: true }).click();
    await submitAndRead(`/api/admin/products/${productId}`, () =>
      page.getByRole('button', { name: 'Xác nhận xóa', exact: true }).click(),
    );
    productId = null;
    await goto('/admin/hinh-anh');
    await page
      .getByRole('button', { name: `Xóa video Giới thiệu QA ${suffix}.mp4`, exact: true })
      .click();
    await submitAndRead(`/api/admin/videos/${videoId}`, () =>
      page.getByRole('button', { name: 'Xác nhận xóa', exact: true }).click(),
    );
    videoId = null;
    assert.equal((await context.request.get(`${base}${videoSrc}`)).status(), 404);
    await goto('/admin/danh-muc');
    await page.getByRole('button', { name: `Xóa ${categoryName}`, exact: true }).click();
    await submitAndRead(`/api/admin/categories/${categoryId}`, () =>
      page.getByRole('button', { name: 'Xác nhận xóa', exact: true }).click(),
    );
    categoryId = null;
  });
  await check('Logout, 404, robots and sitemap', async () => {
    await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
    await page.waitForURL('**/admin/dang-nhap');
    assert.equal((await context.request.get(`${base}/api/admin/auth/me`)).status(), 401);
    await goto('/san-pham/does-not-exist-qa');
    await page.getByRole('heading', { name: /Góc nhỏ này/ }).waitFor();
    const robots = await context.request.get(`${base}/robots.txt`);
    assert.ok((await robots.text()).includes('Disallow: /admin'));
    const sitemap = await context.request.get(`${base}/sitemap.xml`);
    assert.equal(sitemap.status(), 200);
    assert.ok(!(await sitemap.text()).includes('giuong-pallet-anh'));
  });
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(root, 'reports/browser-results.json'),
    JSON.stringify(
      {
        passed: results.length,
        checks: results,
        pageErrors: errors,
        viewports: ['1440×1000', '768×1024', '390×844'],
      },
      null,
      2,
    ),
  );
  console.log(`${results.length} browser checks passed; no uncaught browser errors.`);
} catch (error) {
  await page.screenshot({ path: path.join(root, 'reports/browser-failure.png'), fullPage: true });
  throw error;
} finally {
  // Delete only test records created by this run, even if a browser assertion fails.
  if (productId)
    await context.request.delete(`${base}/api/admin/products/${productId}`, {
      headers: { Origin: base },
    });
  if (categoryId)
    await context.request.delete(`${base}/api/admin/categories/${categoryId}`, {
      headers: { Origin: base },
    });
  if (videoId)
    await context.request.delete(`${base}/api/admin/videos/${videoId}`, {
      headers: { Origin: base },
    });
  await browser.close();
}
