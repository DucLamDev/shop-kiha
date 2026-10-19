// Nâng cấp cấu hình đã có sang bộ ảnh trang trí mới (data/decoration-media.json).
// Chỉ thay ảnh đầu trang / ảnh giới thiệu khi chúng vẫn là ảnh mặc định cũ hoặc đang trống;
// ảnh admin đã tự chọn được giữ nguyên. Ảnh sản phẩm không bị thay đổi.
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { config, root } from '../apps/api/src/config.mjs';
import { connectDb, Settings } from '../apps/api/src/models.mjs';
const read = async (file) => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const editorial = await read('data/editorial-media.json');
const decoration = await read('data/decoration-media.json');
const legacy = new Set(editorial.map((image) => image.src));
const pick = (role) => decoration.find((image) => image.role === role).src;
// Nội dung mặc định cũ → câu chữ theo mẫu thiết kế mới. Nội dung admin đã sửa được giữ nguyên.
const copy = await read('data/home-copy.json');
await connectDb(config.mongoUri);
try {
  const site = await Settings.findOne({ key: 'site' });
  if (site) {
    if (
      !site.heroImage ||
      legacy.has(site.heroImage) ||
      site.heroImage.startsWith('/media/96b35ba1')
    )
      site.heroImage = pick('hero');
    if (!site.aboutImage || legacy.has(site.aboutImage)) site.aboutImage = pick('story');
    for (const key of ['heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription'])
      if (!site[key] || site[key] === copy.previous[key]) site[key] = copy.current[key];
    const steps = JSON.stringify(
      (site.commitments || []).map(({ title, description }) => ({ title, description })),
    );
    if (steps === '[]' || steps === JSON.stringify(copy.previous.commitments))
      site.commitments = copy.current.commitments;
    await site.save();
  }
  console.log('Ảnh trang trí đã được cấu hình. Ảnh sản phẩm giữ nguyên.');
} finally {
  await mongoose.disconnect();
}
