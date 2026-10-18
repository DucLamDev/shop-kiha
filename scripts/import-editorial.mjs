import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
const root = process.cwd();
const prompts = JSON.parse(
  await fs.readFile(path.join(root, 'data/editorial-prompts.json'), 'utf8'),
);
const manifest = [];
for (const image of prompts.images) {
  const input = path.join(root, 'output/imagegen', image.file);
  const buffer = await sharp(input)
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  const metadata = await sharp(buffer).metadata();
  const src = `/media/${sha256}.webp`;
  await fs.writeFile(path.join(root, 'apps/web/public', src), buffer);
  manifest.push({
    assetId: sha256,
    name: image.name,
    src,
    format: 'webp',
    width: metadata.width,
    height: metadata.height,
    bytes: buffer.length,
    sha256,
    role: image.role,
    origin: 'AI illustration',
    original: `output/imagegen/${image.file}`,
  });
}
await fs.writeFile(
  path.join(root, 'data/editorial-media.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log(manifest.map(({ role, bytes, src }) => ({ role, bytes, src })));
