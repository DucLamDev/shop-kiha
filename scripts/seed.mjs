import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { config, root } from '../apps/api/src/config.mjs';
import { connectDb, Media, Category, Product, Settings } from '../apps/api/src/models.mjs';
import { importOwnerCatalog } from './owner-catalog.mjs';
const hasOwnerCatalog = await fs.access(path.join(root, 'data/owner-catalog.json')).then(
  () => true,
  () => false,
);
const manifest = JSON.parse(await fs.readFile(path.join(root, 'data/media-manifest.json'), 'utf8'));
const editorial = JSON.parse(
  await fs.readFile(path.join(root, 'data/editorial-media.json'), 'utf8'),
);
const decoration = JSON.parse(
  await fs.readFile(path.join(root, 'data/decoration-media.json'), 'utf8'),
);
const catalog = JSON.parse(await fs.readFile(path.join(root, 'data/catalog.json'), 'utf8'));
const homeCopy = JSON.parse(await fs.readFile(path.join(root, 'data/home-copy.json'), 'utf8'));
const asset = (prefix) => {
  const item = manifest.find((m) => m.sha256.startsWith(prefix));
  if (!item) throw new Error(`Missing image ${prefix}`);
  return item.src;
};
await connectDb(config.mongoUri);
try {
  for (const { original: _original, duplicateOf: _duplicate, ...item } of [
    ...manifest,
    ...editorial,
    ...decoration,
  ])
    await Media.updateOne({ assetId: item.assetId }, { $setOnInsert: item }, { upsert: true });
  await Settings.updateOne(
    { key: 'site' },
    {
      $setOnInsert: {
        shopName: process.env.SHOP_NAME || 'Nội Thất KIHA',
        phone: process.env.SHOP_PHONE || '',
        zaloUrl: process.env.SHOP_ZALO_URL || '',
        facebookUrl: process.env.SHOP_FACEBOOK_URL || '',
        tiktokUrl: process.env.SHOP_TIKTOK_URL || '',
        mapsUrl: process.env.SHOP_MAPS_URL || '',
        address: process.env.SHOP_ADDRESS || '',
        logo: asset('412aeb41'),
        heroImage: decoration.find((image) => image.role === 'hero').src,
        aboutImage: decoration.find((image) => image.role === 'story').src,
        ...homeCopy.current,
        seoTitle: 'Nội Thất KIHA | Giường ngủ pallet',
        seoDescription:
          'Khám phá giường ngủ pallet tại Nội Thất KIHA. Xem hình ảnh sản phẩm và liên hệ qua Zalo để được tư vấn, báo giá.',
      },
    },
    { upsert: true },
  );
  const categories = new Map();
  for (const [sortOrder, item] of catalog.entries()) {
    const category = await Category.findOneAndUpdate(
      { slug: item.slug },
      {
        $setOnInsert: {
          name: item.name,
          description: '',
          image: asset(item.imagePrefix),
          isActive: true,
          sortOrder,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    categories.set(item.slug, category);
  }
  if (!hasOwnerCatalog && process.env.SEED_DEMO === 'true' && !config.production) {
    const legacyCategory = await Category.findOne({ slug: 'giuong-pallet', name: 'Giường pallet' });
    const references = [
      { image: 'a9f32d95', category: 'giuong-pallet-gap-lam-ghe-sofa', featured: false },
      { image: '29390038', category: 'giuong-pallet-gap-gon', featured: true },
      { image: '4aae5ff0', category: 'giuong-pallet-hop', featured: true },
      { image: 'db431e1b', category: 'giuong-pallet-gap-lam-ghe-sofa', featured: true },
      { image: 'c0ea3b5c', category: 'giuong-pallet-bet', featured: true },
      { image: 'fb30bca2', category: 'giuong-pallet-hop', featured: false },
    ];
    const mapping = [];
    for (let i = 0; i < references.length; i++) {
      const reference = references[i];
      const category = categories.get(reference.category);
      const src = asset(reference.image),
        number = String(i + 1).padStart(2, '0');
      const data = {
        name: `Giường pallet · Ảnh ${number}`,
        slug: `giuong-pallet-anh-${number}`,
        shortDescription: 'Gợi ý từ bộ ảnh KIHA. Liên hệ để xác nhận mẫu và báo giá hiện tại.',
        description:
          'Ảnh tham khảo được lấy từ thư viện KIHA. Tên hiển thị là nhãn ảnh chạy thử, chưa phải mã sản phẩm chính thức. Vui lòng trao đổi với KIHA để xác nhận mẫu, kích thước, vật liệu, hoàn thiện và giá hiện tại. Nội dung hoặc giá in sẵn trên ảnh có thể cần được cập nhật.',
        category: category._id,
        images: [src],
        thumbnail: src,
        price: null,
        priceLabel: 'Liên hệ báo giá',
        specifications: [],
        isFeatured: reference.featured,
        status: 'published',
        sortOrder: i,
        isDemo: true,
      };
      const saved = await Product.findOneAndUpdate(
        { slug: data.slug },
        { $setOnInsert: data },
        { upsert: true, returnDocument: 'after' },
      );
      // One-time migration of the original local placeholders into the owner's four categories.
      // Published real products and records already categorized by an admin are never changed.
      if (
        legacyCategory &&
        saved.isDemo &&
        saved.name === data.name &&
        String(saved.category) === String(legacyCategory._id)
      ) {
        saved.category = category._id;
        saved.isFeatured = reference.featured;
        if (i === 3 && saved.images.length === 1 && saved.thumbnail === asset('087c5800')) {
          saved.images = [src];
          saved.thumbnail = src;
        }
        await saved.save();
      }
      const actualCategory = await Category.findById(saved.category);
      mapping.push({
        slug: saved.slug,
        label: saved.name,
        category: actualCategory?.name,
        categorySlug: actualCategory?.slug,
        source: manifest.find((m) => m.src === saved.thumbnail)?.original,
        src: saved.thumbnail,
        reviewRequired: saved.isDemo,
      });
    }
    if (legacyCategory && !(await Product.exists({ category: legacyCategory._id }))) {
      await Category.deleteOne({ _id: legacyCategory._id });
    }
    await fs.writeFile(
      path.join(root, 'data/product-image-map.json'),
      JSON.stringify(mapping, null, 2),
    );
    console.log(
      'Seeded 6 clearly marked reference records for local review. Production API excludes demo records.',
    );
  }
  if (hasOwnerCatalog) await importOwnerCatalog();
  console.log('Media and initial settings seeded without overwriting existing content.');
} finally {
  await mongoose.disconnect();
}
