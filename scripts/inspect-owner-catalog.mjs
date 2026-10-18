import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { root } from '../apps/api/src/config.mjs';
const media = path.join(root, 'apps/web/public/media');
const source = path.join(media, 'Tên Giường');
const groups = path.join(media, 'Phân loại');
const products = [],
  unmatched = [];
async function inspect(file) {
  const buffer = await fs.readFile(file);
  const meta = await sharp(buffer).metadata();
  return {
    sha256: createHash('sha256').update(buffer).digest('hex'),
    format: meta.format,
    width: meta.width,
    height: meta.height,
    bytes: buffer.length,
  };
}
for (const entry of (await fs.readdir(source, { withFileTypes: true })).sort((a, b) =>
  a.name.localeCompare(b.name, 'vi'),
)) {
  if (!entry.isFile()) continue;
  products.push({
    name: path.parse(entry.name).name.trim().replace(/\s+/g, ' '),
    original: `Tên Giường/${entry.name}`,
    ...(await inspect(path.join(source, entry.name))),
    categories: [],
  });
}
for (const folder of await fs.readdir(groups, { withFileTypes: true })) {
  if (!folder.isDirectory()) continue;
  for (const entry of await fs.readdir(path.join(groups, folder.name), { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const item = await inspect(path.join(groups, folder.name, entry.name));
    const matches = products.filter((p) => p.sha256 === item.sha256);
    if (matches.length !== 1)
      unmatched.push({
        category: folder.name,
        file: entry.name,
        sha256: item.sha256,
        matches: matches.length,
      });
    else if (!matches[0].categories.includes(folder.name)) matches[0].categories.push(folder.name);
  }
}
await fs.writeFile(
  path.join(root, 'data/owner-catalog.json'),
  JSON.stringify({ source: 'apps/web/public/media', products, unmatched }, null, 2) + '\n',
);
console.log(
  JSON.stringify(
    {
      count: products.length,
      categories: [...new Set(products.flatMap((p) => p.categories))],
      uncategorized: products.filter((p) => !p.categories.length).map((p) => p.name),
      unmatched,
      products: products.map(({ name, categories, format }) => ({ name, categories, format })),
    },
    null,
    2,
  ),
);
