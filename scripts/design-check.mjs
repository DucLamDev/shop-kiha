import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from '../apps/api/src/config.mjs';
import { launchBrowser } from './browser.mjs';
const base = process.env.SITE_URL || 'http://localhost:3000';
const reports = path.join(root, 'reports');
const browser = await launchBrowser();
const errors = [];
const results = [];
function pass(name) {
  results.push(name);
  console.log(`PASS ${name}`);
}
async function scrollThrough(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(900);
}
const contrast = (a, b) => {
  const lum = (value) => {
    const hex =
      value.length === 4 ? `#${[...value.slice(1)].map((ch) => ch + ch).join('')}` : value;
    const c = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
try {
  const products = (await (await fetch(`${base}/api/products?limit=1`)).json()).data;
  const settings = (await (await fetch(`${base}/api/settings/public`)).json()).data;
  const detail = `/san-pham/${products.items[0].slug}`;
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  assert.equal((await page.goto(base, { waitUntil: 'networkidle' })).status(), 200);
  const tokens = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    return Object.fromEntries(
      [
        '--background',
        '--foreground',
        '--muted-foreground',
        '--primary',
        '--primary-foreground',
        '--card',
        '--kiha-walnut',
        '--kiha-olive',
        '--kiha-sage',
      ].map((k) => [k, css.getPropertyValue(k).trim()]),
    );
  });
  for (const [fg, bg] of [
    ['--foreground', '--background'],
    ['--muted-foreground', '--background'],
    ['--muted-foreground', '--card'],
    ['--primary-foreground', '--primary'],
    ['--kiha-walnut', '--background'],
    ['--kiha-walnut', '--kiha-sage'],
    ['--kiha-olive', '--background'],
  ])
    assert.ok(contrast(tokens[fg], tokens[bg]) >= 4.5, `${fg} on ${bg}`);
  pass('Bảng màu kem – sage – nâu trầm đạt tương phản WCAG AA cho chữ');
  // Yêu cầu thiết kế: không thành phần nào dùng nền đen/tối.
  async function darkBackgrounds(target) {
    return target.evaluate(() => {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 1;
      const g = cv.getContext('2d', { willReadFrequently: true });
      return [...document.querySelectorAll('body *')]
        .filter((el) => {
          const bg = getComputedStyle(el).backgroundColor;
          if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') return false;
          g.fillStyle = '#fff';
          g.fillRect(0, 0, 1, 1);
          g.fillStyle = bg;
          g.fillRect(0, 0, 1, 1);
          const [r, gg, b] = g.getImageData(0, 0, 1, 1).data;
          return (0.2126 * r + 0.7152 * gg + 0.0722 * b) / 255 < 0.45;
        })
        .map((el) => `${el.tagName}.${String(el.className).slice(0, 60)}`);
    });
  }

  const fonts = await page.evaluate(() => ({
    body: getComputedStyle(document.body).fontFamily,
    heading: getComputedStyle(document.querySelector('h1')).fontFamily,
  }));
  assert.match(fonts.body, /Be Vietnam Pro/);
  assert.match(fonts.heading, /Manrope/);
  pass('Be Vietnam Pro cho nội dung, Manrope cho tiêu đề (next/font)');

  await page
    .locator('section[aria-labelledby="hero-title"] img')
    .first()
    .evaluate((img) => img.decode());
  await page.waitForTimeout(1300);
  assert.equal(
    await page.locator('#hero-title').evaluate((el) => getComputedStyle(el).opacity),
    '1',
  );
  assert.equal(
    await page.locator('header').evaluate((el) => getComputedStyle(el).position),
    'sticky',
  );
  await page.screenshot({ path: path.join(reports, 'redesign-desktop-hero.png') });
  if (settings.heroImage?.endsWith('.webp'))
    assert.match(
      await page.locator('section[aria-labelledby="hero-title"]').innerText(),
      /Hình ảnh AI/,
    );
  pass('Hero hiện mềm khi tải, header dính, ảnh minh họa AI có chú thích');

  const reveal = page
    .locator('#collection-title')
    .locator('xpath=ancestor::section//*[@data-reveal]')
    .first();
  assert.ok(Number(await reveal.evaluate((el) => getComputedStyle(el).opacity)) < 0.5);
  await scrollThrough(page);
  assert.equal(await reveal.evaluate((el) => getComputedStyle(el).opacity), '1');
  pass('Nội dung xuất hiện khi cuộn tới (scroll reveal)');

  if (settings.zaloUrl) {
    await page.getByRole('link', { name: 'Chat với KIHA qua Zalo' }).waitFor();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('link', { name: 'Chat với KIHA qua Zalo' }).waitFor({ state: 'detached' });
    pass('Nút Zalo nổi chỉ hiện sau khi cuộn qua phần đầu trang');
  }
  await page.screenshot({ path: path.join(reports, 'redesign-desktop.png'), fullPage: true });

  const card = page
    .locator('#collection-title')
    .locator('xpath=ancestor::section//article')
    .first();
  await card.scrollIntoViewIfNeeded();
  const before = await card.locator('img').evaluate((img) => getComputedStyle(img).scale);
  await card.hover();
  await page.waitForTimeout(800);
  const after = await card.locator('img').evaluate((img) => getComputedStyle(img).scale);
  assert.notEqual(before, after);
  pass('Card sản phẩm nhấc nhẹ và phóng ảnh vừa phải khi hover');

  await page.goto(`${base}/san-pham`, { waitUntil: 'networkidle' });
  const chips = page.getByRole('navigation', { name: 'Lọc theo danh mục' });
  const second = chips.getByRole('link').nth(1);
  const href = await second.getAttribute('href');
  await second.click();
  await page.waitForURL(`**${href}`);
  await page.waitForFunction(
    () => document.getElementById('ket-qua')?.getAttribute('aria-busy') === 'false',
  );
  assert.equal(await second.getAttribute('aria-current'), 'true');
  await page.goBack();
  await page.waitForURL('**/san-pham');
  await page.waitForFunction(
    () =>
      document.querySelector('nav[aria-label="Lọc theo danh mục"] a[aria-current="true"]')
        ?.textContent === 'Tất cả',
  );
  pass('Bộ lọc danh mục đổi URL, có trạng thái chờ và hoạt động với nút Back');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'networkidle' });
  assert.ok(
    parseFloat(
      await page.locator('#hero-title').evaluate((el) => getComputedStyle(el).animationDuration),
    ) < 0.01,
  );
  await scrollThrough(page);
  assert.equal(await reveal.evaluate((el) => getComputedStyle(el).opacity), '1');
  pass('Tôn trọng prefers-reduced-motion: tắt chuyển động, nội dung vẫn hiển thị');

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const phone = await mobile.newPage();
  phone.on('pageerror', (error) => errors.push(error.message));
  await phone.goto(`${base}${detail}`, { waitUntil: 'networkidle' });
  if (settings.zaloUrl) {
    const bar = phone.locator('div.fixed.bottom-0').filter({ hasText: 'Tư vấn qua Zalo' });
    await bar.waitFor();
    const box = await bar.boundingBox();
    assert.ok(box.y + box.height <= 844 + 1);
    await phone.evaluate(() => window.scrollTo(0, 900));
    await phone.waitForTimeout(500);
    assert.equal(
      await phone.getByRole('link', { name: 'Chat với KIHA qua Zalo' }).isVisible(),
      false,
    );
  }
  await phone.getByRole('button', { name: 'Mở menu' }).click();
  await phone.getByRole('dialog').getByRole('link', { name: 'Liên hệ', exact: true }).waitFor();
  await phone.keyboard.press('Escape');
  await phone.getByRole('dialog').waitFor({ state: 'hidden' });
  await phone.screenshot({ path: path.join(reports, 'redesign-mobile-product.png') });
  pass('Mobile: thanh Zalo/Gọi cố định ở trang chi tiết, không chồng nút nổi; menu drawer đóng/mở');
  await mobile.close();

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/san-pham', detail, '/lien-he']) {
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `Overflow at ${width}px on ${route}`,
      );
      if (width === 390 && route === '/')
        await page.screenshot({ path: path.join(reports, 'redesign-mobile.png'), fullPage: true });
      if (width === 1440 && route === '/lien-he')
        await page.screenshot({ path: path.join(reports, 'redesign-contact.png'), fullPage: true });
    }
  }
  pass('Không tràn ngang ở 320, 390, 768, 1024 và 1440px trên 4 trang khách hàng');

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of ['/', '/san-pham', detail, '/lien-he', '/admin/dang-nhap']) {
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    assert.deepEqual(await darkBackgrounds(page), [], `Nền tối trên ${route}`);
  }
  pass('Không thành phần nào dùng nền đen/tối (trang khách hàng và đăng nhập)');

  assert.deepEqual(errors, []);
  pass('Không có lỗi JavaScript khi chạy');
  await fs.writeFile(
    path.join(reports, 'redesign-results.json'),
    JSON.stringify({ passed: results.length, results, errors }, null, 2),
  );
  console.log(`${results.length} design checks passed.`);
} finally {
  await browser.close();
}
