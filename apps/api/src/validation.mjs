import { z } from 'zod';
const text = (max = 300) => z.string().trim().max(max);
const optionalText = (max = 300) => text(max).default('');
const slug = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang.');
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'ID không hợp lệ.');
const mediaPath = z
  .string()
  .regex(/^\/media\/[a-f0-9]{64}\.(?:jpg|png|webp|avif)$/, 'Hãy chọn ảnh từ thư viện.');
const optionalImage = z.union([mediaPath, z.literal('')]).default('');
function urlFor(hosts) {
  return z
    .union([
      z.literal(''),
      z
        .string()
        .url()
        .max(2048)
        .refine((value) => {
          const u = new URL(value);
          return (
            u.protocol === 'https:' &&
            !u.username &&
            !u.password &&
            hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`))
          );
        }, 'Liên kết HTTPS không thuộc kênh được hỗ trợ.'),
    ])
    .default('');
}
export const categoryInput = z
  .object({
    name: text(120).min(1),
    slug,
    description: optionalText(1000),
    image: optionalImage,
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(99999).default(0),
  })
  .strict();
export const productInput = z
  .object({
    name: text(160).min(1),
    slug,
    category: objectId,
    shortDescription: optionalText(300),
    description: optionalText(12000),
    images: z
      .array(mediaPath)
      .min(1, 'Chọn ít nhất một ảnh.')
      .max(30)
      .refine((a) => new Set(a).size === a.length, 'Ảnh không được trùng.'),
    thumbnail: mediaPath,
    price: z.number().min(0).max(1e12).nullable().default(null),
    priceLabel: optionalText(120),
    specifications: z
      .array(z.object({ label: text(120).min(1), value: text(500).min(1) }).strict())
      .max(30)
      .default([]),
    isFeatured: z.boolean().default(false),
    status: z.enum(['draft', 'published']).default('draft'),
    sortOrder: z.number().int().min(0).max(99999).default(0),
    seoTitle: optionalText(160),
    seoDescription: optionalText(320),
    seoImage: optionalImage,
    isDemo: z.boolean().default(false),
  })
  .strict()
  .refine((p) => p.images.includes(p.thumbnail), {
    path: ['thumbnail'],
    message: 'Ảnh đại diện phải thuộc bộ ảnh sản phẩm.',
  });
export const settingsInput = z
  .object({
    shopName: text(120).min(1),
    phone: z.union([
      z.literal(''),
      z.string().regex(/^\+?[\d\s().-]{8,20}$/, 'Số điện thoại không hợp lệ.'),
    ]),
    zaloUrl: urlFor(['zalo.me']),
    facebookUrl: urlFor(['facebook.com', 'fb.com']),
    tiktokUrl: urlFor(['tiktok.com']),
    mapsUrl: urlFor(['maps.app.goo.gl', 'google.com', 'goo.gl']),
    address: optionalText(500),
    logo: optionalImage,
    heroImage: optionalImage,
    aboutImage: optionalImage,
    heroTitle: text(180).min(1),
    heroDescription: text(500),
    aboutTitle: text(200),
    aboutDescription: text(3000),
    commitments: z
      .array(z.object({ title: text(120).min(1), description: text(500) }).strict())
      .max(6),
    seoTitle: text(160),
    seoDescription: text(320),
  })
  .strict();
export const loginInput = z
  .object({
    email: z
      .email()
      .max(254)
      .transform((v) => v.toLowerCase()),
    password: z.string().min(1).max(128),
  })
  .strict();
export const listInput = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(60).default(12),
    q: text(120).default(''),
    category: z.union([slug, z.literal('')]).default(''),
    sort: z.enum(['featured', 'newest', 'name', 'price-asc', 'price-desc']).default('featured'),
    featured: z.enum(['true', 'false']).optional(),
  })
  .strict();
export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
