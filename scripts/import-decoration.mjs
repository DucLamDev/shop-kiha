// Đăng ký ảnh trang trí trong apps/web/public/media/decoration/ vào thư viện ảnh.
// Giữ nguyên file gốc; tạo bản sao tên SHA-256 để dùng qua validator ảnh của API.
// Các file "… - Copy" trùng nội dung được bỏ qua.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { root } from '../apps/api/src/config.mjs';

const dir = path.join(root, 'apps/web/public/media/decoration');
const roles = {
  '01': ['hero', 'Phòng nắng (ảnh đầu trang)'],
  '02': ['room-bedroom', 'Phòng ngủ'],
  '03': ['room-apartment', 'Căn hộ'],
  '04': ['room-townhouse', 'Nhà phố'],
  '05': ['detail', 'Chi tiết gỗ và linen'],
  '06': ['story', 'Góc nghỉ an yên'],
  '07': ['consultation-banner', 'Nền tư vấn'],
  '08': ['olive', 'Nhành ô liu (trang trí)'],
  '09': ['sunroom', 'Phòng ngập nắng'],
  10: ['collection', 'Phòng ngủ bộ sưu tập'],
  11: ['daybed', 'Giường gấp làm sofa'],
  12: ['flatlay', 'Bàn phác thảo'],
  13: ['measuring', 'Đo kích thước'],
  14: ['faq', 'Góc đọc sách'],
  15: ['video', 'Phòng ngủ cho video'],
};
const files = (await fs.readdir(dir)).filter((f) => /^\d{2}-[a-z-]+\.webp$/.test(f)).sort();
const manifest = [];
const seen = new Set();
for (const file of files) {
  const buffer = await fs.readFile(path.join(dir, file));
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  if (seen.has(sha256)) continue;
  seen.add(sha256);
  const meta = await sharp(buffer).metadata();
  if (meta.format !== 'webp') throw new Error(`${file} không phải WebP thật (${meta.format}).`);
  const [role, label] = roles[file.slice(0, 2)] || [file.replace(/\.webp$/, ''), file];
  const src = `/media/${sha256}.webp`;
  await fs.writeFile(path.join(root, 'apps/web/public', src), buffer);
  manifest.push({
    assetId: sha256,
    name: `AI · ${label} (ảnh trang trí)`,
    src,
    format: 'webp',
    width: meta.width,
    height: meta.height,
    bytes: buffer.length,
    sha256,
    role,
    origin: 'AI illustration',
    original: `apps/web/public/media/decoration/${file}`,
  });
}
await fs.writeFile(
  path.join(root, 'data/decoration-media.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log(`Đã đăng ký ${manifest.length} ảnh trang trí vào data/decoration-media.json.`);
