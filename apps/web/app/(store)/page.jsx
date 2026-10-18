import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategories, getData, getSettings, jsonLd, pageMeta, siteUrl } from '@/lib/server-api';
import { Button } from '@/components/ui/button';
import { Hero } from '@/components/home/hero';
import { CategoryShowcase } from '@/components/home/category-showcase';
import { AboutSection } from '@/components/home/about-section';
import { ProductCard } from '@/components/product/product-card';
import { SectionHeading } from '@/components/site/section-heading';
import { ContactBand } from '@/components/site/contact-band';
import { RevealGroup, RevealItem } from '@/components/site/reveal';

export async function generateMetadata() {
  const s = await getSettings();
  return {
    ...pageMeta(s.seoTitle || 'Nội Thất KIHA', s.seoDescription, '/', s.heroImage),
    title: { absolute: s.seoTitle || 'Nội Thất KIHA | Giường gỗ pallet' },
  };
}

// Mỗi danh mục: lấy tổng số sản phẩm công khai và ảnh dự phòng khi ảnh danh mục bị trùng.
async function categoryItems(categories) {
  const results = await Promise.all(
    categories.map((c) => getData(`/products?category=${c.slug}&limit=1`)),
  );
  const seen = new Set();
  return categories.map((category, i) => {
    const first = results[i]?.items?.[0];
    let image = category.image;
    if (!image || seen.has(image)) image = first?.thumbnail || image;
    seen.add(image);
    return { category, count: results[i]?.total || 0, image };
  });
}

export default async function Home() {
  const [settings, featured, categories, all] = await Promise.all([
    getSettings(),
    getData('/products?featured=true&limit=8'),
    getCategories(),
    getData('/products?limit=1'),
  ]);
  const hasFeatured = featured.items.length > 0;
  const [showcase, collection] = await Promise.all([
    categoryItems(categories),
    hasFeatured ? featured : getData('/products?sort=newest&limit=8'),
  ]);
  const s = settings;
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: s.shopName || 'Nội Thất KIHA',
    url: siteUrl('/'),
    ...(s.logo ? { logo: siteUrl(s.logo) } : {}),
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.address ? { address: s.address } : {}),
    sameAs: [s.facebookUrl, s.tiktokUrl, s.zaloUrl].filter(Boolean),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organization)} />
      <Hero
        settings={s}
        spotlight={collection.items[0]}
        productCount={all.total}
        categoryCount={categories.length}
      />
      <CategoryShowcase items={showcase} />
      <section aria-labelledby="featured-title" className="py-16 sm:py-24">
        <div className="container-page">
          <SectionHeading
            id="featured-title"
            eyebrow={hasFeatured ? 'KIHA tuyển chọn' : 'Mới cập nhật'}
            title={hasFeatured ? 'Sản phẩm nổi bật' : 'Mẫu giường mới'}
            description="Ảnh thực tế từ KIHA. Nhấn vào từng mẫu để xem chi tiết hoặc nhắn Zalo để được báo giá theo kích thước."
            action={
              <Button asChild variant="outline">
                <Link href="/san-pham">
                  Xem tất cả
                  <ArrowRight />
                </Link>
              </Button>
            }
          />
          {collection.items.length > 0 ? (
            <RevealGroup className="scrollbar-none -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-6">
              {collection.items.map((product) => (
                <RevealItem key={product._id} className="w-[82%] shrink-0 snap-start sm:w-auto">
                  <ProductCard
                    product={product}
                    settings={s}
                    showFeaturedBadge={false}
                    imageSizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 23vw"
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <p className="mt-10 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              Bộ sưu tập đang được KIHA cập nhật. Nhắn Zalo để xem các mẫu hiện có.
            </p>
          )}
        </div>
      </section>
      <AboutSection settings={s} />
      <ContactBand settings={s} />
    </>
  );
}
