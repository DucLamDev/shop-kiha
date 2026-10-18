import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { root } from '../apps/api/src/config.mjs';
import { Category, Product, Media, Settings } from '../apps/api/src/models.mjs';

const slugify = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export async function importOwnerCatalog({ refresh = false } = {}) {
  const manifest = JSON.parse(
    await fs.readFile(path.join(root, 'data/owner-catalog.json'), 'utf8'),
  );
  const catalog = JSON.parse(await fs.readFile(path.join(root, 'data/catalog.json'), 'utf8'));
  const mediaRoot = path.join(root, 'apps/web/public/media');
  if (manifest.unmatched.length || manifest.products.some((p) => !p.categories.length))
    throw new Error('Resolve unmatched/uncategorized owner images before import.');
  if (new Set(manifest.products.map((p) => p.sha256)).size !== manifest.products.length)
    throw new Error('Duplicate canonical product image.');
  // Validate every source before touching existing data; originals are never changed.
  for (const item of manifest.products) {
    const source = path.resolve(mediaRoot, item.original);
    if (!source.startsWith(mediaRoot + path.sep)) throw new Error('Invalid source path');
    const bytes = await fs.readFile(source);
    if (createHash('sha256').update(bytes).digest('hex') !== item.sha256)
      throw new Error(`Rescan changed source: ${item.original}`);
    if (!item.categories.every((name) => catalog.some((c) => c.name === name)))
      throw new Error(`Unknown category: ${item.name}`);
  }
  const backup = path.join(root, '.local/backups', `catalog-${Date.now()}.json`);
  await fs.mkdir(path.dirname(backup), { recursive: true });
  const before = {};
  for (const model of [Product, Category, Media, Settings])
    before[model.modelName] = await model.find().lean();
  await fs.writeFile(backup, JSON.stringify(before, null, 2));
  const images = new Map();
  for (const item of manifest.products) {
    const ext = { jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif' }[item.format];
    if (!ext) throw new Error(`Unsupported image ${item.original}`);
    const filename = `${item.sha256}.${ext}`,
      src = `/media/${filename}`;
    await fs.copyFile(path.join(mediaRoot, item.original), path.join(mediaRoot, filename));
    await Media.updateOne(
      { assetId: item.sha256 },
      {
        $set: {
          assetId: item.sha256,
          name: path.basename(item.original),
          src,
          sha256: item.sha256,
          format: item.format,
          width: item.width,
          height: item.height,
          bytes: item.bytes,
        },
      },
      { upsert: true },
    );
    images.set(item.sha256, src);
  }
  const categories = new Map(),
    featured = new Set();
  for (const [sortOrder, item] of catalog.entries()) {
    const first = manifest.products.find((p) => p.categories.includes(item.name));
    if (!first) continue;
    const image = images.get(first.sha256);
    const category = await Category.findOneAndUpdate(
      { slug: item.slug },
      {
        $setOnInsert: {
          name: item.name,
          description: '',
          image,
          isActive: true,
          sortOrder,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    if (!category.image || category.image.startsWith(`/media/${item.imagePrefix}`)) {
      category.image = image;
      await category.save();
    }
    categories.set(item.name, category);
    if (sortOrder < 4) featured.add(first.sha256);
  }
  const mapping = [];
  let created = 0;
  for (const [sortOrder, item] of manifest.products.entries()) {
    const src = images.get(item.sha256);
    const groups = item.categories
      .map((name) => categories.get(name))
      .sort((a, b) => a.sortOrder - b.sortOrder);
    let product = await Product.findOne({ sourceImageHash: item.sha256 });
    if (!product) {
      let slug = slugify(item.name).slice(0, 145).replace(/-$/, '');
      if (await Product.exists({ $or: [{ slug }, { previousSlugs: slug }] }))
        slug = `${slug}-${item.sha256.slice(0, 10)}`;
      product = await Product.create({
        name: item.name,
        slug,
        sourceImageHash: item.sha256,
        category: groups[0]._id,
        categories: groups.map((c) => c._id),
        images: [src],
        thumbnail: src,
        shortDescription:
          'Liên hệ Nội Thất KIHA để được tư vấn kích thước và báo giá theo nhu cầu của bạn.',
        description:
          'Xem hình ảnh mẫu và trao đổi cùng KIHA qua Zalo để xác nhận kích thước, hoàn thiện, giá và thông tin giao hàng trước khi đặt.',
        price: null,
        priceLabel: 'Liên hệ báo giá',
        specifications: [],
        isFeatured: featured.has(item.sha256),
        status: 'published',
        isDemo: false,
        sortOrder,
        seoTitle: `${item.name} | KIHA`.slice(0, 160),
        seoDescription: `Khám phá ${item.name} tại Nội Thất KIHA. Liên hệ Zalo để được tư vấn và báo giá.`,
      });
      created++;
    } else if (refresh) {
      // Reimport only the owner-supplied identity and grouping; preserve admin content, prices, videos and visibility.
      product.name = item.name;
      product.categories = groups.map((c) => c._id);
      if (!groups.some((c) => String(c._id) === String(product.category)))
        product.category = groups[0]._id;
      await product.save();
    }
    mapping.push({
      name: product.name,
      slug: product.slug,
      categories: groups.map((c) => c.name),
      source: item.original,
      sha256: item.sha256,
      src,
    });
  }
  // Archive only the untouched initial demo identities; never delete products or user files.
  const archived = await Product.updateMany(
    {
      isDemo: true,
      $or: Array.from({ length: 6 }, (_, i) => {
        const number = String(i + 1).padStart(2, '0');
        return { name: `Giường pallet · Ảnh ${number}`, slug: `giuong-pallet-anh-${number}` };
      }),
    },
    { $set: { status: 'draft', isFeatured: false } },
  );
  await fs.writeFile(
    path.join(root, 'data/product-image-map.json'),
    JSON.stringify(mapping, null, 2) + '\n',
  );
  console.log(
    JSON.stringify({
      products: mapping.length,
      categories: categories.size,
      created,
      archived: archived.modifiedCount,
      backup: path.relative(root, backup),
    }),
  );
  return mapping;
}
