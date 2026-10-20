import { getCategories, getData, getSettings, jsonLd, pageMeta, siteUrl } from '@/lib/server-api';
import { Hero } from '@/components/home/hero';
import { Spaces } from '@/components/home/spaces';
import { CategoryGrid } from '@/components/home/category-grid';
import { Collection } from '@/components/home/collection';
import { DetailStory } from '@/components/home/detail-story';
import { FoldingShowcase } from '@/components/home/folding-showcase';
import { AboutSection } from '@/components/home/about-section';
import { Steps } from '@/components/home/steps';
import { VideoTeaser } from '@/components/home/video-teaser';
import { Faq, faqItems } from '@/components/home/faq';
import { ContactBand } from '@/components/site/contact-band';
import { ShopStatistics } from '@/components/home/shop-statistics';

export async function generateMetadata() {
  const s = await getSettings();
  return {
    ...pageMeta(s.seoTitle || 'Nội Thất KIHA', s.seoDescription, '/', s.heroImage),
    title: { absolute: s.seoTitle || 'Nội Thất KIHA | Giường gỗ pallet' },
  };
}

// Mỗi danh mục: tổng số sản phẩm công khai và một mẫu tiêu biểu (dùng cho khối giường gấp).
async function categoryItems(categories) {
  const results = await Promise.all(
    categories.map((c) => getData(`/products?category=${c.slug}&limit=1`)),
  );
  return categories.map((category, i) => ({
    category,
    count: results[i]?.total || 0,
    product: results[i]?.items?.[0],
  }));
}

const foldingLabel = (c) => (/sofa/.test(c.slug) ? 'Giường / sofa' : 'Gấp gọn');

export default async function Home() {
  const [settings, featured, categories] = await Promise.all([
    getSettings(),
    getData('/products?featured=true&limit=4'),
    getCategories(),
  ]);
  const hasFeatured = featured.items.length > 0;
  const [items, collection] = await Promise.all([
    categoryItems(categories),
    hasFeatured ? featured : getData('/products?sort=newest&limit=4'),
  ]);
  const folding = items
    .filter(({ category, product }) => /gap/.test(category.slug) && product)
    .map((item) => ({ ...item, label: foldingLabel(item.category) }));
  const s = settings;
  const structured = [
    {
      '@context': 'https://schema.org',
      '@type': 'FurnitureStore',
      name: s.shopName || 'Nội Thất KIHA',
      url: siteUrl('/'),
      ...(s.logo ? { logo: siteUrl(s.logo) } : {}),
      ...(s.phone ? { telephone: s.phone } : {}),
      ...(s.address ? { address: s.address } : {}),
      sameAs: [s.facebookUrl, s.tiktokUrl, s.zaloUrl].filter(Boolean),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems(s, categories).map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ];
  return (
    <>
      {structured.map((item, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(item)} />
      ))}
      <Hero settings={s} />
      <Spaces />
      <ShopStatistics statistics={s.statistics} />
      <CategoryGrid items={items} />
      <Collection products={collection.items} settings={s} featured={hasFeatured} />
      <DetailStory />
      <FoldingShowcase items={folding} settings={s} />
      <AboutSection settings={s} />
      <Steps steps={s.commitments} />
      <VideoTeaser settings={s} />
      <Faq settings={s} categories={categories} />
      <ContactBand settings={s} />
    </>
  );
}
