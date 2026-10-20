import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from '../apps/api/src/config.mjs';
import { launchBrowser } from './browser.mjs';
const base = process.env.SITE_URL || 'http://localhost:3000';
const credentials = await fs.readFile(path.join(root, '.local/admin-credentials.txt'), 'utf8');
const email = credentials.match(/^Email: (.+)$/m)?.[1],
  password = credentials.match(/^Password: (.+)$/m)?.[1];
if (!email || !password)
  throw new Error('Run npm run admin:create -- --generate-local before browser QA.');
const browser = await launchBrowser();
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
// Kỳ vọng lấy từ chính cấu hình đang lưu trong MongoDB, không ghi cứng thông tin liên hệ.
const settings = (await (await context.request.get(`${base}/api/settings/public`)).json()).data;
const categories = (await (await context.request.get(`${base}/api/categories`)).json()).data;
async function check(name, task) {
  await task();
  results.push(name);
  console.log(`PASS ${name}`);
}
async function goto(route) {
  return page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 60000 });
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
  await check('Desktop home, configured contact links, image loading and layout', async () => {
    assert.equal((await goto('/')).status(), 200);
    await noOverflow();
    assert.ok(await page.locator('h1').innerText());
    const showcase = page.locator('section[aria-labelledby="category-title"]');
    assert.equal(
      await showcase.locator('a[href^="/san-pham?category="]').count(),
      categories.length,
    );
    for (const category of categories)
      await showcase.getByText(category.name, { exact: true }).waitFor();
    if (settings.zaloUrl) assert.ok(await page.locator(`a[href="${settings.zaloUrl}"]`).count());
    await page
      .locator('section[aria-labelledby="hero-title"] img')
      .first()
      .evaluate((img) => img.decode());
    await page.screenshot({ path: path.join(root, 'reports/home-desktop.png'), fullPage: true });
    const broken = await page
      .locator('img')
      .evaluateAll((images) => images.filter((i) => i.complete && !i.naturalWidth).length);
    assert.equal(broken, 0);
  });
  await check('Catalog search, empty state, sort, category URL and back navigation', async () => {
    await goto('/san-pham');
    await page.getByRole('searchbox', { name: 'Tìm sản phẩm theo tên' }).fill(`absent-${suffix}`);
    await page.getByRole('button', { name: 'Tìm', exact: true }).click();
    await page.getByRole('heading', { name: 'Chưa tìm thấy mẫu phù hợp' }).waitFor();
    assert.ok(page.url().includes('q='));
    await page.getByRole('link', { name: 'Xóa bộ lọc' }).click();
    await page.locator('#ket-qua article').first().waitFor();
    await page.waitForURL((url) => !url.search.includes('q='));
    await page.getByRole('combobox', { name: 'Sắp xếp sản phẩm' }).click();
    await page.getByRole('option', { name: 'Tên A – Z' }).click();
    await page.waitForURL('**/san-pham?sort=name');
    await page
      .getByRole('navigation', { name: 'Lọc theo danh mục' })
      .getByRole('link', { name: categories[0].name, exact: true })
      .click();
    await page.waitForURL(`**/san-pham?category=${categories[0].slug}&sort=name`);
    await page.locator(`h1:has-text("${categories[0].name}")`).waitFor();
    for (const category of categories) {
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
    await page.waitForURL('**/san-pham?sort=name');
    await page.locator('h1', { hasText: 'Mỗi chiếc giường' }).waitFor();
  });
  await check('Product details and accessible image lightbox', async () => {
    await page.locator('#ket-qua article h3 a').first().click();
    await page.waitForURL('**/san-pham/*');
    await page.getByRole('button', { name: /Phóng to ảnh/ }).click();
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.ok(await page.locator('link[rel="canonical"]').getAttribute('href'));
    const ld = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    assert.ok(ld.some((text) => JSON.parse(text)['@type'] === 'Product'));
    await noOverflow();
    await page.screenshot({ path: path.join(root, 'reports/product-desktop.png'), fullPage: true });
  });
  await check('Contact page uses configured Zalo, phone, Facebook, TikTok and Maps', async () => {
    await goto('/lien-he');
    const tel = settings.phone ? `tel:${settings.phone.replace(/[^+\d]/g, '')}` : '';
    for (const href of [
      tel,
      settings.zaloUrl,
      settings.facebookUrl,
      settings.tiktokUrl,
      settings.mapsUrl,
    ])
      if (href) assert.ok(await page.locator(`a[href="${href}"]`).count(), href);
    for (const href of [settings.facebookUrl, settings.tiktokUrl].filter(Boolean))
      assert.equal(
        await page.locator(`a[href="${href}"]`).first().getAttribute('target'),
        '_blank',
      );
    await noOverflow();
  });
  await check('Mobile drawer, product CTA bar and contact layouts at 390px', async () => {
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
    await page.locator('#ket-qua article h3 a').first().click();
    await page.waitForURL('**/san-pham/*');
    if (settings.zaloUrl)
      await page
        .getByRole('link', { name: /^Tư vấn .* qua Zalo$/ })
        .last()
        .waitFor();
    await noOverflow();
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
    await page.getByLabel(/^Tên danh mục/).fill(categoryName);
    const saved = await submitAndRead('/api/admin/categories', () =>
      page.getByRole('button', { name: 'Lưu danh mục', exact: true }).click(),
    );
    categoryId = saved._id;
    await page.getByText(categoryName, { exact: true }).waitFor();
  });
  await check(
    'Admin product create, media selection, gallery order and draft privacy',
    async () => {
      await goto('/admin/san-pham/tao-moi');
      await page.getByLabel(/^Tên sản phẩm/).fill(productName);
      await page.getByLabel(/^Danh mục chính/).selectOption(categoryId);
      await page
        .getByLabel('Mô tả ngắn', { exact: true })
        .fill('Bản kiểm thử tự động sẽ được xóa sau khi hoàn thành.');
      await page.getByRole('button', { name: 'Chọn ảnh', exact: true }).click();
      const dialog = page.getByRole('dialog');
      const tiles = dialog.locator('ul button[aria-pressed]');
      await tiles.first().waitFor();
      await tiles.nth(0).click();
      await tiles.nth(1).click();
      await dialog.getByRole('button', { name: 'Dùng ảnh đã chọn' }).click();
      await page.getByRole('button', { name: 'Đặt ảnh 2 làm đại diện' }).click();
      await page.getByRole('button', { name: 'Đưa ảnh 2 lên trước' }).click();
      await page.getByRole('switch', { name: /^Dữ liệu tham khảo/ }).click();
      // A valid MP4 with a free box verifies uploads larger than 10 MB through Next's rewrite.
      const fixture = await fs.readFile(path.join(root, 'tests/fixtures/sample.mp4'));
      const free = Buffer.alloc(12 * 1024 * 1024);
      free.writeUInt32BE(free.length, 0);
      free.write('free', 4, 'ascii');
      const uploadResponse = page.waitForResponse(
        (r) => r.url().endsWith('/api/admin/videos') && r.request().method() === 'POST',
      );
      await page.getByLabel('Chọn file video', { exact: true }).setInputFiles({
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
      await page.locator('form video').waitFor();
      await page
        .getByLabel('Nội dung video bằng văn bản')
        .fill('Video kiểm thử chức năng phát, không phải video sản phẩm thật.');
      await page.getByRole('checkbox', { name: categories[0].name, exact: true }).click();
      const saved = await submitAndRead('/api/admin/products', () =>
        page.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click(),
      );
      productId = saved._id;
      assert.equal(saved.images.length, 2);
      assert.equal(saved.thumbnail, saved.images[0]);
      assert.equal(saved.video, videoSrc);
      assert.equal(saved.categories.length, 2);
      assert.equal(saved.status, 'draft');
      assert.equal(saved.isDemo, true);
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
    await page.getByRole('switch', { name: /^Hiển thị trên website/ }).click();
    await page.getByRole('button', { name: 'Thêm thông số' }).click();
    await page.getByLabel('Tên thông số 1', { exact: true }).fill('Thông tin QA');
    await page.getByLabel('Giá trị thông số 1', { exact: true }).fill('Dữ liệu kiểm thử');
    const saved = await submitAndRead('/api/admin/products', () =>
      page.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click(),
    );
    assert.equal(saved.status, 'published');
    await page.waitForURL('**/admin/san-pham');
    await goto(`/san-pham/${saved.slug}`);
    await page.getByRole('heading', { name: productName, exact: true }).waitFor();
    await page.getByText('Thông tin QA', { exact: true }).waitFor();
    assert.equal(await page.locator('ul[aria-label="Ảnh sản phẩm"] button').count(), 2);
    await page.getByRole('button', { name: 'Xem ảnh 2', exact: true }).click();
    await page.getByRole('button', { name: /Phóng to ảnh/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Ảnh trước', exact: true }).click();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');
    const video = page.locator('section[aria-labelledby="video-title"] video');
    await video.waitFor();
    assert.equal(await video.getAttribute('preload'), 'none');
    await video.evaluate(async (element) => {
      element.muted = true;
      await element.play();
    });
    await page.waitForFunction(
      () =>
        document.querySelector('section[aria-labelledby="video-title"] video').currentTime > 0.05,
    );
    await video.evaluate((element) => {
      element.pause();
      element.currentTime = 0.5;
    });
    await page.waitForFunction(
      () => !document.querySelector('section[aria-labelledby="video-title"] video').seeking,
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
      .locator('section[aria-labelledby="video-title"]')
      .screenshot({ path: path.join(root, 'reports/product-video-mobile.png') });
    await page.setViewportSize({ width: 768, height: 1024 });
    await noOverflow();
  });
  await check('Admin list toggles featured and status through the backend', async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await goto('/admin/san-pham');
    await page.getByRole('searchbox', { name: 'Tìm sản phẩm' }).fill(productName);
    await page.getByRole('button', { name: 'Tìm', exact: true }).click();
    await page.getByRole('button', { name: `Đánh dấu nổi bật ${productName}` }).waitFor();
    const featured = await submitAndRead(`/api/admin/products/${productId}`, () =>
      page.getByRole('button', { name: `Đánh dấu nổi bật ${productName}` }).click(),
    );
    assert.equal(featured.isFeatured, true);
    await page.getByRole('button', { name: `Bỏ nổi bật ${productName}` }).waitFor();
    const draft = await submitAndRead(`/api/admin/products/${productId}`, () =>
      page.getByRole('switch', { name: `Hiển thị ${productName} trên website` }).click(),
    );
    assert.equal(draft.status, 'draft');
    assert.equal((await context.request.get(`${base}/api/products/${draft.slug}`)).status(), 404);
  });
  await check('Admin media search, settings persistence and tablet layout', async () => {
    await goto('/admin/hinh-anh');
    await page.getByRole('searchbox', { name: 'Tìm tên file' }).fill('logo');
    await page.getByRole('button', { name: 'Tìm', exact: true }).click();
    await page.getByRole('button', { name: /logo\.png/ }).waitFor();
    await noOverflow();
    await goto('/admin/cai-dat');
    await page.getByLabel(/^Tên cửa hàng/).waitFor();
    assert.equal(
      await page.getByLabel('Số điện thoại', { exact: true }).inputValue(),
      settings.phone || '',
    );
    await submitAndRead('/api/admin/settings', () =>
      page.getByRole('button', { name: 'Lưu cài đặt', exact: true }).click(),
    );
    await page.getByRole('tab', { name: 'SEO' }).click();
    await page.getByLabel('Tiêu đề website').waitFor();
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
    await page.getByText('Lỗi kết nối kiểm thử.').waitFor();
    await page.unroute('**/api/admin/media?**');
    await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
    await page.locator('main ul li button').first().waitFor();
  });
  await check('Admin deletion confirmations and cleanup work', async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await goto('/admin/san-pham');
    await page.getByRole('searchbox', { name: 'Tìm sản phẩm' }).fill(productName);
    await page.getByRole('button', { name: 'Tìm', exact: true }).click();
    await page.getByRole('button', { name: `Xóa ${productName}`, exact: true }).click();
    await page.getByRole('button', { name: 'Giữ lại', exact: true }).click();
    await page.getByRole('button', { name: `Xóa ${productName}`, exact: true }).click();
    await submitAndRead(`/api/admin/products/${productId}`, () =>
      page.getByRole('button', { name: 'Xác nhận xóa', exact: true }).click(),
    );
    productId = null;
    await goto('/admin/hinh-anh');
    await page.getByRole('tab', { name: 'Video' }).click();
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
    await page.getByRole('heading', { name: 'Không tìm thấy sản phẩm' }).waitFor();
    assert.equal(
      await page.locator('meta[name="robots"]').first().getAttribute('content'),
      'noindex',
    );
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
