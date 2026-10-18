import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { root } from '../apps/api/src/config.mjs';
const target = path.join(root, 'apps/web/public/media');
await fs.mkdir(target, { recursive: true });
await fs.mkdir(path.join(root, 'data'), { recursive: true });
await fs.mkdir(path.join(root, 'reports'), { recursive: true });
const manifest = [],
  rejected = [],
  seen = new Map();
async function scan(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const source = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await scan(source);
      continue;
    }
    try {
      const bytes = await fs.readFile(source),
        meta = await sharp(bytes).metadata();
      const extensions = { jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif' };
      if (!extensions[meta.format] || !meta.width || !meta.height)
        throw new Error('Unsupported image format');
      const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
      const filename = `${sha256}.${extensions[meta.format]}`;
      const original = path.relative(path.join(root, 'img'), source).replaceAll('\\', '/');
      await fs.copyFile(source, path.join(target, filename));
      manifest.push({
        assetId: sha256,
        name: entry.name,
        original,
        src: `/media/${filename}`,
        format: meta.format,
        width: meta.width,
        height: meta.height,
        bytes: bytes.length,
        sha256,
        duplicateOf: seen.get(sha256) || null,
      });
      seen.set(sha256, original);
    } catch (error) {
      rejected.push({ name: entry.name, reason: error.message });
    }
  }
}
await scan(path.join(root, 'img'));
await fs.writeFile(path.join(root, 'data/media-manifest.json'), JSON.stringify(manifest, null, 2));
await fs.writeFile(
  path.join(root, 'reports/media-summary.json'),
  JSON.stringify({ total: manifest.length, unique: seen.size, rejected }, null, 2),
);
console.log(
  `Scanned ${manifest.length} images; ${seen.size} unique; ${rejected.length} rejected. Original files preserved.`,
);
