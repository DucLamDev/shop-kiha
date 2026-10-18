import { chromium } from 'playwright';
// Mặc định dùng Chrome đã cài trên máy. Trên máy chủ dev không có Chrome, đặt CHROMIUM_PATH
// trỏ tới Chromium/headless shell có sẵn; script không tự tải trình duyệt.
export function launchBrowser() {
  return chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : { channel: process.env.BROWSER_CHANNEL || 'chrome' }),
  });
}
