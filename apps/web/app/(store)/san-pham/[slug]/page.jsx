import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CircleCheck, MessageCircleMore, Phone } from 'lucide-react';
import { getData, getSettings, jsonLd, pageMeta, siteUrl } from '@/lib/server-api';
import { telHref } from '@/lib/contact';
import { hasPrice, priceText } from '@/lib/utils';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { ZaloButton, PhoneButton } from '@/components/site/contact-buttons';
import { SectionHeading } from '@/components/site/section-heading';
import { ContactBand } from '@/components/site/contact-band';
import { Reveal } from '@/components/site/reveal';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductGrid } from '@/components/product/product-card';
import { ProductVideo } from '@/components/product/product-video';
import { CopyProduct } from '@/components/product/copy-product';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getData(`/products/${encodeURIComponent(slug)}`);
  if (!p) return { title: 'Không tìm thấy sản phẩm', robots: { index: false } };
  return {
    ...pageMeta(
      p.seoTitle || p.name,
      p.seoDescription || p.shortDescription,
      `/san-pham/${p.slug}`,
      p.seoImage || p.thumbnail,
    ),
    ...(p.seoTitle ? { title: { absolute: p.seoTitle } } : {}),
    ...(p.isDemo ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProductDetail({ params }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getData(`/products/${encodeURIComponent(slug)}`),
    getSettings(),
  ]);
  if (!product) notFound();
  if (product.slug !== slug) permanentRedirect(`/san-pham/${product.slug}`);
  const category = product.category;
  const related = category
    ? await getData(`/products?category=${category.slug}&limit=5`)
    : { items: [] };
  const relatedItems = related.items.filter((p) => p._id !== product._id).slice(0, 4);
  const categories = product.categories?.length ? product.categories : [category].filter(Boolean);
  const s = settings;
  const productUrl = siteUrl(`/san-pham/${product.slug}`);
  const structured = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: siteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Sản phẩm', item: siteUrl('/san-pham') },
        ...(category
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: category.name,
                item: siteUrl(`/san-pham?category=${category.slug}`),
              },
            ]
          : []),
        { '@type': 'ListItem', position: category ? 4 : 3, name: product.name, item: productUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      url: productUrl,
      image: [product.thumbnail, ...product.images.filter((src) => src !== product.thumbnail)].map(
        (src) => siteUrl(src),
      ),
      ...(product.shortDescription || product.description
        ? { description: product.shortDescription || product.description }
        : {}),
      ...(category ? { category: category.name } : {}),
      brand: { '@type': 'Brand', name: 'KIHA' },
      // Chỉ khai báo giá khi admin đã nhập giá thật.
      ...(hasPrice(product)
        ? {
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'VND',
              url: productUrl,
            },
          }
        : {}),
    },
  ];

  return (
    <>
      {structured.map((item, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(item)} />
      ))}
      <div className="container-page pt-6 pb-8 sm:pt-8">
        <Breadcrumbs
          items={[
            { label: 'Sản phẩm', href: '/san-pham' },
            ...(category
              ? [{ label: category.name, href: `/san-pham?category=${category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <div className="kiha-rise">
            <ProductGallery product={product} />
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="kiha-rise flex flex-wrap gap-2" style={{ '--delay': '60ms' }}>
              {categories.map((c) => (
                <Link
                  key={c._id}
                  href={`/san-pham?category=${c.slug}`}
                  className="rounded-full border border-walnut/20 bg-white/70 px-3 py-1 text-xs font-bold tracking-wide text-walnut transition-colors hover:border-walnut hover:bg-white"
                >
                  {c.name}
                </Link>
              ))}
              {product.isDemo && (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Ảnh tham khảo · chưa xác nhận thông tin
                </span>
              )}
            </div>
            <h1
              className="kiha-rise mt-4 text-[2rem] leading-[1.12] font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-[2.6rem]"
              style={{ '--delay': '100ms' }}
            >
              {product.name}
            </h1>
            {product.shortDescription && (
              <p
                className="kiha-rise mt-4 text-[17px] text-muted-foreground"
                style={{ '--delay': '140ms' }}
              >
                {product.shortDescription}
              </p>
            )}
            <div
              className="kiha-rise mt-6 rounded-2xl border bg-white p-5 shadow-soft sm:p-6"
              style={{ '--delay': '180ms' }}
            >
              <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
                {hasPrice(product) ? 'Giá tham khảo' : 'Giá bán'}
              </p>
              <p className="mt-1 font-display text-[1.75rem] font-extrabold tracking-tight text-walnut">
                {priceText(product)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Gửi kích thước bạn cần, KIHA báo giá chính xác qua Zalo.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-2.5">
                <ZaloButton
                  settings={s}
                  size="lg"
                  className="h-auto min-h-12 py-3 whitespace-normal"
                  label={`Tư vấn ${product.name} qua Zalo (mở tab mới)`}
                >
                  Tư vấn sản phẩm qua Zalo
                </ZaloButton>
                <PhoneButton settings={s} size="lg">
                  Gọi {s.phone}
                </PhoneButton>
              </div>
              <CopyProduct name={product.name} className="mt-3" />
            </div>
            {s.commitments?.length > 0 && (
              <ul className="kiha-rise mt-6 grid gap-3" style={{ '--delay': '220ms' }}>
                {s.commitments.map((item, i) => (
                  <li key={i} className="flex gap-3 text-[15px]">
                    <CircleCheck className="mt-0.5 size-5 shrink-0 text-walnut" />
                    <span>
                      <strong className="font-semibold">{item.title}</strong>
                      {item.description && (
                        <span className="text-muted-foreground"> — {item.description}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Accordion
              type="multiple"
              defaultValue={['description', 'specs']}
              className="kiha-rise mt-8 border-t"
              style={{ '--delay': '260ms' }}
            >
              <AccordionItem value="description">
                <AccordionTrigger>Mô tả sản phẩm</AccordionTrigger>
                <AccordionContent>
                  <p className="prose-kiha text-[15px]">
                    {product.description || 'Liên hệ KIHA để tìm hiểu thêm về sản phẩm.'}
                  </p>
                </AccordionContent>
              </AccordionItem>
              {product.specifications.length > 0 && (
                <AccordionItem value="specs">
                  <AccordionTrigger>Thông số</AccordionTrigger>
                  <AccordionContent>
                    <dl className="divide-y rounded-xl border bg-white">
                      {product.specifications.map((spec, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[40%_1fr] gap-4 px-4 py-3 text-[15px]"
                        >
                          <dt className="text-muted-foreground">{spec.label}</dt>
                          <dd className="font-medium">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </div>
      </div>
      {product.video && (
        <section aria-labelledby="video-title" className="container-page py-12 sm:py-16">
          <Reveal>
            <SectionHeading
              id="video-title"
              eyebrow="Nhìn gần hơn"
              title="Video giới thiệu sản phẩm"
            />
            <ProductVideo
              className="mt-8"
              src={product.video}
              poster={product.thumbnail}
              name={product.name}
              description={product.videoDescription}
            />
          </Reveal>
        </section>
      )}
      {relatedItems.length > 0 && (
        <section aria-labelledby="related-title" className="border-t bg-white py-16 sm:py-20">
          <div className="container-page">
            <SectionHeading
              id="related-title"
              eyebrow={category?.name || 'Gợi ý'}
              title="Sản phẩm liên quan"
              action={
                <Button asChild variant="outline">
                  <Link href={category ? `/san-pham?category=${category.slug}` : '/san-pham'}>
                    Xem cả danh mục
                    <ArrowRight />
                  </Link>
                </Button>
              }
            />
            <ProductGrid products={relatedItems} settings={s} className="mt-10 lg:grid-cols-4" />
          </div>
        </section>
      )}
      <ContactBand settings={s} />
      <MobileCtaBar settings={s} name={product.name} />
    </>
  );
}

// Thanh liên hệ cố định trên điện thoại, chừa vùng an toàn của thiết bị.
function MobileCtaBar({ settings, name }) {
  const phone = telHref(settings.phone);
  if (!settings.zaloUrl && !phone) return null;
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 px-4 pt-3 shadow-[0_-12px_30px_-20px_rgb(38_36_34/0.4)] backdrop-blur md:hidden">
      <div className="flex gap-2.5">
        {phone && (
          <a
            href={phone}
            aria-label={`Gọi ${settings.phone}`}
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-charcoal/15 bg-white"
          >
            <Phone className="size-5" />
          </a>
        )}
        {settings.zaloUrl && (
          <a
            href={settings.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Tư vấn ${name} qua Zalo`}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary font-display text-[15px] font-semibold text-primary-foreground"
          >
            <MessageCircleMore className="size-5" />
            Tư vấn qua Zalo
          </a>
        )}
      </div>
    </div>
  );
}
