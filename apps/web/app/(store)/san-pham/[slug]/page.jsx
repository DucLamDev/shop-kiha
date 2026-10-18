import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { getData, getSettings, pageMeta, siteUrl } from '@/lib/server-api';
import { Breadcrumb } from '@/components/breadcrumb';
import { Gallery, CopyProduct } from '@/components/gallery';
import { ContactCTA, PhoneCTA } from '@/components/contact-cta';
import { ProductCard } from '@/components/product-card';
import { priceText } from '@/lib/utils';
import { ProductVideo } from '@/components/product-video';
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getData(`/products/${encodeURIComponent(slug)}`);
  if (!p) return { title: 'Không tìm thấy sản phẩm' };
  return {
    ...pageMeta(
      p.seoTitle || p.name,
      p.seoDescription || p.shortDescription,
      `/san-pham/${p.slug}`,
      p.seoImage || p.thumbnail,
    ),
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
  const related = await getData(`/products?category=${product.category.slug}&limit=4`);
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: siteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Sản phẩm', item: siteUrl('/san-pham') },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: siteUrl(`/san-pham/${product.slug}`),
      },
    ],
  };
  return (
    <div className="container detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }}
      />
      <Breadcrumb items={[{ label: 'Sản phẩm', href: '/san-pham' }, { label: product.name }]} />
      <div className="product-detail">
        <Gallery product={product} />
        <div className="product-info">
          <div className="product-category-links">
            {(product.categories?.length ? product.categories : [product.category]).map(
              (category) => (
                <Link
                  key={category._id}
                  className="eyebrow"
                  href={`/san-pham?category=${category.slug}`}
                >
                  {category.name}
                  <ArrowUpRight size={14} />
                </Link>
              ),
            )}
          </div>
          {product.isDemo && (
            <p className="demo-note">Ảnh tham khảo · Chưa xác nhận thông tin sản phẩm</p>
          )}
          <h1>{product.name}</h1>
          <p className="detail-short">{product.shortDescription}</p>
          <p className="detail-price">{priceText(product)}</p>
          <div className="detail-contact">
            <ContactCTA settings={settings}>Tư vấn sản phẩm qua Zalo</ContactCTA>
            <PhoneCTA settings={settings} />
          </div>
          <CopyProduct name={product.name} />
          <div className="advice-note">
            <MessageCircle size={20} strokeWidth={1.4} />
            <p>
              Chia sẻ mẫu bạn thích và kích thước không gian. KIHA sẽ trao đổi cùng bạn trước khi
              đặt hàng.
            </p>
          </div>
          <details open className="product-description">
            <summary>Về sản phẩm</summary>
            <p>{product.description || 'Liên hệ KIHA để tìm hiểu thêm về sản phẩm.'}</p>
          </details>
          {product.specifications.length > 0 && (
            <details open className="product-description">
              <summary>Thông tin chi tiết</summary>
              <dl>
                {product.specifications.map((spec, i) => (
                  <div key={i}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </div>
      </div>
      {product.video && (
        <section className="section detail-video-section" aria-labelledby="video-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NHÌN GẦN HƠN</p>
              <h2 id="video-heading">Video giới thiệu sản phẩm.</h2>
            </div>
          </div>
          <ProductVideo
            src={product.video}
            poster={product.thumbnail}
            name={product.name}
            description={product.videoDescription}
          />
        </section>
      )}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THÊM MỘT CHÚT CẢM HỨNG</p>
            <h2>Có thể bạn cũng thích.</h2>
          </div>
          <Link className="text-link" href="/san-pham">
            Xem bộ sưu tập
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {related.items
            .filter((p) => p._id !== product._id)
            .slice(0, 3)
            .map((p) => (
              <ProductCard key={p._id} product={p} settings={settings} />
            ))}
        </div>
      </section>
    </div>
  );
}
