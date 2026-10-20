import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from '../apps/api/src/config.mjs';
import { launchBrowser } from './browser.mjs';

const base = process.env.SITE_URL || 'http://localhost:3000';
const reports = path.join(root, 'reports');
const browser = await launchBrowser();
const results = [];
const errors = [];
const pass = (message) => {
  results.push(message);
  console.log(`PASS ${message}`);
};
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  const settings = (await (await context.request.get(`${base}/api/settings/public`)).json()).data;
  const products = (await (await context.request.get(`${base}/api/products?limit=1`)).json()).data;
  const detail = `/san-pham/${products.items[0].slug}`;
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    window.countSamples = [];
    const counter = [...document.querySelectorAll('[data-count-target]')].find(
      (element) => Number(element.dataset.countTarget) > 0,
    );
    if (!counter) return;
    const observer = new MutationObserver(() => window.countSamples.push(counter.innerText));
    observer.observe(counter, { characterData: true, childList: true, subtree: true });
    window.counterObserver = observer;
  });
  const stats = page.getByRole('region', { name: 'KIHA qua những con số' });
  await stats.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const samples = await page.evaluate(() => {
    window.counterObserver?.disconnect();
    return window.countSamples;
  });
  if (
    ['salesCount', 'interestedCount', 'positiveReviewCount'].some(
      (key) => settings.statistics?.[key] > 0,
    )
  )
    assert.ok(samples.length > 5, 'Counter must visibly animate across multiple frames');
  const counters = await page
    .locator('[data-count-target]')
    .evaluateAll((els) =>
      els.map((el) => ({ label: el.getAttribute('aria-label'), text: el.innerText })),
    );
  assert.ok(counters.every((counter) => counter.label === counter.text));
  for (const [key, field, label] of [
    ['sales', 'salesCount', 'Lượt bán'],
    ['interested', 'interestedCount', 'Khách hàng quan tâm'],
    ['reviews', 'positiveReviewCount', 'Lượt đánh giá tốt'],
  ]) {
    const item = stats.locator(`[data-stat="${key}"]`);
    assert.equal(await item.getByText(label, { exact: true }).count(), 1);
    if (Number.isFinite(settings.statistics?.[field])) {
      assert.equal(
        await item.locator('[data-count-target]').innerText(),
        new Intl.NumberFormat('vi-VN').format(settings.statistics[field]),
      );
    } else {
      assert.equal(await item.getByText('Đang cập nhật').count(), 1);
    }
  }
  assert.equal(await stats.getByText('Mẫu giường & nệm').count(), 0);
  assert.equal(await stats.getByText('Nhóm sản phẩm').count(), 0);
  await stats.screenshot({ path: path.join(reports, 'kiha-statistics.png') });
  pass(
    'Sales, interested customers and positive reviews animate to saved values; missing data stays explicit',
  );

  const dock = page.getByRole('navigation', { name: 'Liên hệ nhanh' });
  await dock.waitFor();
  for (const [label, href] of [
    ['Chat với KIHA qua Zalo', settings.zaloUrl],
    ['Ghé Facebook KIHA', settings.facebookUrl],
    ['Ghé TikTok KIHA', settings.tiktokUrl],
  ]) {
    const link = dock.getByRole('link', { name: label, exact: true });
    assert.equal(await link.getAttribute('href'), href);
    assert.equal(
      await link.locator('img').evaluate((img) => img.complete && img.naturalWidth > 0),
      true,
    );
  }
  const phone = dock.getByRole('button', { name: 'Hiện số điện thoại KIHA', exact: true });
  const phonePanel = dock.getByRole('region', { name: 'Số điện thoại KIHA' });
  assert.equal(await phonePanel.count(), 0, 'Phone number stays hidden until requested');
  assert.ok(
    await dock.locator('.contact-dock-link').evaluateAll((buttons) =>
      buttons.every((button) => {
        const bounds = button.getBoundingClientRect();
        return Math.abs(bounds.width - bounds.height) < 1 && button.innerText === '';
      }),
    ),
    'All four contact controls are round and icon-only',
  );
  assert.equal(
    await phone.evaluate((button) => getComputedStyle(button, '::before').animationName),
    'contact-ripple',
  );
  await phone.click();
  await phonePanel.waitFor();
  assert.equal(await phone.getAttribute('aria-expanded'), 'true');
  assert.equal(
    await phonePanel.getByRole('link', { name: `Gọi ${settings.phone}` }).getAttribute('href'),
    `tel:${settings.phone.replace(/\D/g, '')}`,
  );
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector('.contact-phone-panel')).opacity === '1',
  );
  await page.screenshot({ path: path.join(reports, 'kiha-desktop-phone-reveal.png') });
  await page.keyboard.press('Tab');
  assert.equal(
    await phonePanel.getByRole('link').evaluate((link) => link === document.activeElement),
    true,
  );
  await page.keyboard.press('Escape');
  await phonePanel.waitFor({ state: 'hidden' });
  assert.equal(await phone.evaluate((button) => button === document.activeElement), true);
  await phone.click();
  await phonePanel.waitFor();
  await page.mouse.click(10, 150);
  await phonePanel.waitFor({ state: 'hidden' });
  await phone.click();
  await phonePanel.waitFor();
  await phone.click();
  await phonePanel.waitFor({ state: 'hidden' });
  await dock.screenshot({ path: path.join(reports, 'kiha-social-dock.png') });
  pass(
    'Round icon-only dock pulses; phone reveals on click with valid call link, keyboard and outside dismissal',
  );

  await page.goto(`${base}/lien-he`, { waitUntil: 'networkidle' });
  const map = page.locator('.shop-map');
  await map.scrollIntoViewIfNeeded();
  const frame = map.locator('iframe');
  assert.equal(
    new URL(await frame.getAttribute('src')).searchParams.get('q'),
    `${settings.mapLocation.latitude},${settings.mapLocation.longitude}`,
  );
  const mapLink = map.getByRole('link', { name: 'Mở vị trí chính xác của KIHA trên Google Maps' });
  assert.equal(
    new URL(await mapLink.getAttribute('href')).searchParams.get('query'),
    `${settings.mapLocation.latitude},${settings.mapLocation.longitude}`,
  );
  await frame.contentFrame().locator('body').waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  await map.screenshot({ path: path.join(reports, 'kiha-google-map.png') });
  pass('Real Google Maps frame loads; preview and outgoing link use the same verified pin');

  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/san-pham', detail, '/lien-he']) {
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `Horizontal overflow at ${width}px on ${route}`,
      );
      if (width < 768 && route === '/') {
        assert.equal(await page.locator('.hero-controls').count(), 0);
        const explore = await page
          .locator('[data-hero-carousel]')
          .getByRole('link', { name: 'Khám phá', exact: true })
          .boundingBox();
        assert.ok(explore.x >= 0 && explore.x + explore.width <= width);
        await stats.scrollIntoViewIfNeeded();
        await dock.waitFor();
        const dockBox = await dock.boundingBox();
        assert.ok(
          dockBox.x >= 0 && dockBox.x + dockBox.width <= width && dockBox.y + dockBox.height <= 900,
        );
        assert.equal(await dock.getByRole('link').count(), 3);
        await phone.click();
        await phonePanel.waitFor();
        const panelBox = await phonePanel.boundingBox();
        assert.ok(
          panelBox.x >= 0 &&
            panelBox.x + panelBox.width <= width &&
            panelBox.y >= 0 &&
            panelBox.y + panelBox.height <= dockBox.y,
          `Phone popover fits above the dock at ${width}px`,
        );
        if (width === 390) {
          await page.waitForFunction(
            () => getComputedStyle(document.querySelector('.contact-phone-panel')).opacity === '1',
          );
          await page.screenshot({ path: path.join(reports, 'kiha-mobile-phone-reveal.png') });
        }
        await phonePanel.getByRole('button', { name: 'Đóng số điện thoại' }).click();
        await phonePanel.waitFor({ state: 'hidden' });
      }
      if (width === 390) {
        if (route === '/') {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: path.join(reports, 'kiha-mobile-home.png') });
          const spaces = page.locator('.spaces-gallery');
          await spaces.scrollIntoViewIfNeeded();
          await spaces.evaluate((el) => {
            el.scrollLeft = el.scrollWidth;
          });
          assert.ok(await spaces.evaluate((el) => el.scrollLeft > 100));
          await page.screenshot({ path: path.join(reports, 'kiha-mobile-spaces.png') });
          await page.locator('.category-section').scrollIntoViewIfNeeded();
          await page.waitForTimeout(900);
          await page.screenshot({ path: path.join(reports, 'kiha-mobile-categories.png') });
        }
        if (route === '/lien-he') {
          await page.locator('#channels-title').scrollIntoViewIfNeeded();
          await page.waitForTimeout(900);
          await page.screenshot({ path: path.join(reports, 'kiha-mobile-contact.png') });
        }
        if (route === detail) {
          const cta = page.locator('div.fixed.bottom-0').filter({ hasText: 'Tư vấn qua Zalo' });
          assert.ok(await cta.isVisible());
          assert.equal(await dock.isVisible(), false);
          await page.screenshot({ path: path.join(reports, 'kiha-mobile-product.png') });
        }
      }
    }
  }
  pass('Four store routes fit 320–1440px; mobile dock and product CTA do not overlap');

  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
  const menu = page.getByRole('dialog');
  const tiktok = menu.getByRole('link', { name: 'TikTok', exact: true });
  await tiktok.scrollIntoViewIfNeeded();
  const box = await tiktok.boundingBox();
  assert.ok(box.y >= 0 && box.y + box.height <= 568);
  await page.keyboard.press('Escape');
  await menu.waitFor({ state: 'hidden' });
  pass('Small-screen menu scrolls to its social links and closes with Escape');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'networkidle' });
  await stats.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  assert.ok(
    await page
      .locator('[data-count-target]')
      .evaluateAll((els) => els.every((el) => el.innerText === el.getAttribute('aria-label'))),
  );
  assert.equal(
    await phone.evaluate((button) => getComputedStyle(button, '::before').animationName),
    'none',
  );
  pass('Reduced-motion mode disables contact pulses and shows final counter values immediately');

  const credentials = await fs.readFile(path.join(root, '.local/admin-credentials.txt'), 'utf8');
  const email = credentials.match(/^Email: (.+)$/m)?.[1];
  const password = credentials.match(/^Password: (.+)$/m)?.[1];
  const login = await context.request.post(`${base}/api/admin/auth/login`, {
    headers: { Origin: base },
    data: { email, password },
  });
  assert.equal(login.status(), 200);
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/admin/cai-dat`, { waitUntil: 'networkidle' });
    assert.equal(
      await page.getByLabel('Vĩ độ', { exact: true }).inputValue(),
      String(settings.mapLocation.latitude),
    );
    assert.equal(
      await page.getByLabel('Kinh độ', { exact: true }).inputValue(),
      String(settings.mapLocation.longitude),
    );
    await page.getByRole('tab', { name: 'Nội dung trang chủ', exact: true }).click();
    for (const [label, field] of [
      ['Lượt bán', 'salesCount'],
      ['Khách hàng quan tâm', 'interestedCount'],
      ['Lượt đánh giá tốt', 'positiveReviewCount'],
    ]) {
      assert.equal(
        await page.getByLabel(label, { exact: true }).inputValue(),
        settings.statistics?.[field] == null ? '' : String(settings.statistics[field]),
      );
    }
    const statsHeading = page.getByRole('heading', { name: 'KIHA qua những con số', exact: true });
    await statsHeading.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(reports, 'kiha-statistics-admin.png') });
    pass(
      'Admin exposes saved map coordinates and editable customer/review fields without publishing test data',
    );
  } finally {
    await context.request.post(`${base}/api/admin/auth/logout`, { headers: { Origin: base } });
  }

  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(reports, 'mobile-contact-results.json'),
    JSON.stringify({ results, errors }, null, 2),
  );
} catch (error) {
  const pages = browser.contexts().flatMap((context) => context.pages());
  if (pages[0])
    await pages[0].screenshot({
      path: path.join(reports, 'mobile-contact-failure.png'),
      fullPage: true,
    });
  throw error;
} finally {
  await browser.close();
}
