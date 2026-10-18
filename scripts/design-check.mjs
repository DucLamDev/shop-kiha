import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.SITE_URL || 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const results = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (/parent element with invalid|height value of 0/.test(message.text()))
      errors.push(message.text());
  });
  assert.equal((await page.goto(base, { waitUntil: 'networkidle' })).status(), 200);
  await page.locator('.hero-visual img').evaluate((img) => img.decode());
  await page.locator('img').evaluateAll(async (images) => {
    images.forEach((img) => {
      img.loading = 'eager';
    });
    await Promise.all(images.map((img) => img.decode()));
  });
  await page.screenshot({ path: 'reports/redesign-desktop-hero.png' });
  assert.equal(await page.locator('.kiha-home').getAttribute('data-motion'), 'running');
  await page.getByRole('button', { name: 'Tạm dừng chuyển động', exact: true }).click();
  assert.equal(await page.locator('.kiha-home').getAttribute('data-motion'), 'paused');
  assert.equal(
    await page.locator('.ribbon-track').evaluate((el) => getComputedStyle(el).animationPlayState),
    'paused',
  );
  results.push('Motion can be paused and resumed');
  await page.getByRole('button', { name: 'Bật chuyển động', exact: true }).click();
  const rows = page.locator('.category-row');
  await rows.nth(3).focus();
  assert.ok((await rows.nth(3).getAttribute('class')).includes('is-active'));
  assert.match(
    await page.locator('.category-preview-caption a').getAttribute('href'),
    /giuong-pallet-gap-lam-ghe-sofa/,
  );
  await rows.nth(1).hover();
  assert.ok((await rows.nth(1).getAttribute('class')).includes('is-active'));
  results.push('Category image previews follow keyboard focus and pointer hover');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Đã giảm chuyển động theo cài đặt thiết bị' }).waitFor();
  assert.equal(
    await page.locator('.ribbon-track').evaluate((el) => getComputedStyle(el).animationName),
    'none',
  );
  assert.equal(await page.locator('.kiha-home').getAttribute('data-motion'), 'paused');
  results.push('System reduced-motion preference disables decorative animation');
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      `Overflow at ${width}px`,
    );
    assert.equal(await rows.count(), 4);
    if (width === 390) {
      await page.screenshot({ path: 'reports/redesign-mobile-hero.png' });
      await page.screenshot({ path: 'reports/redesign-mobile.png', fullPage: true });
    }
    if (width === 1440)
      await page.screenshot({ path: 'reports/redesign-desktop.png', fullPage: true });
  }
  results.push('No horizontal overflow at 320, 390, 768, 1024 and 1440px');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('#kham-pha').screenshot({ path: 'reports/redesign-categories.png' });
  await page.locator('#ve-kiha img').evaluate((img) => img.decode());
  await page.locator('#ve-kiha').screenshot({ path: 'reports/redesign-story.png' });
  assert.match(await page.locator('.hero-caption').innerText(), /Hình minh họa AI/);
  assert.match(await page.locator('.story-art .image-credit').innerText(), /Hình minh họa AI/);
  results.push('Generated inspiration imagery is labeled separately from product photos');
  await page.goto(`${base}/lien-he`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'reports/redesign-contact.png', fullPage: true });
  assert.match(await page.locator('.contact-image-credit').innerText(), /Hình minh họa AI/);
  assert.deepEqual(errors, []);
  results.push('No browser runtime errors');
  await fs.writeFile(
    'reports/redesign-results.json',
    JSON.stringify({ passed: results.length, results, errors }, null, 2),
  );
  console.log(JSON.stringify({ passed: results.length, results, errors }, null, 2));
} finally {
  await browser.close();
}
