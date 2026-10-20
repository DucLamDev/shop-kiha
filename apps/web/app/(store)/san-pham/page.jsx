import { SearchX, X } from 'lucide-react';
import { getCategories, getData, getSettings, jsonLd, pageMeta, siteUrl } from '@/lib/server-api';
import { catalogHref, parseCatalogQuery } from '@/lib/catalog';
import { PageIntro } from '@/components/site/page-intro';
import { CatalogLink, CatalogShell } from '@/components/product/catalog-shell';
import { ProductGrid } from '@/components/product/product-card';
import { Pagination } from '@/components/product/pagination';
import { EmptyState } from '@/components/site/empty-state';
import { ContactBand } from '@/components/site/contact-band';
import { ZaloButton } from '@/components/site/contact-buttons';
import { buttonVariants } from '@/components/ui/button';

const LIMIT = 12;

export async function generateMetadata({ searchParams }) {
  const current = parseCatalogQuery(await searchParams);
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === current.category);
  const path = category ? `/san-pham?category=${category.slug}` : '/san-pham';
  const meta = pageMeta(
    category ? category.name : 'Sản phẩm giường gỗ pallet',
    category?.description ||
      `Xem ${category ? category.name.toLowerCase() : 'các mẫu giường gỗ pallet'} tại Nội Thất KIHA. Tìm kiếm, lọc theo danh mục và tư vấn, báo giá qua Zalo.`,
    path,
  );
  // Trang kết quả tìm kiếm không cần lập chỉ mục riêng.
  return current.q ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function Products({ searchParams }) {
  const current = parseCatalogQuery(await searchParams);
  const query = new URLSearchParams({
    limit: String(LIMIT),
    page: String(current.page),
    sort: current.sort,
  });
  if (current.q) query.set('q', current.q);
  if (current.category) query.set('category', current.category);
  const [products, categories, settings, priced] = await Promise.all([
    getData(`/products?${query}`),
    getCategories(),
    getSettings(),
    getData('/products?sort=price-desc&limit=1'),
  ]);
  const category = categories.find((c) => c.slug === current.category);
  const hasPrices = priced?.items?.[0]?.price != null;
  const outOfRange = products.total > 0 && products.items.length === 0;
  const first = products.total ? (products.page - 1) * LIMIT + 1 : 0;
  const last = Math.min(products.page * LIMIT, products.total);
  const breadcrumb = {
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
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumb)} />
      <PageIntro
        breadcrumbs={
          category
            ? [{ label: 'Sản phẩm', href: '/san-pham' }, { label: category.name }]
            : [{ label: 'Sản phẩm' }]
        }
        eyebrow={category ? 'Danh mục' : 'Bộ sưu tập KIHA'}
        title={category ? category.name : ['Mỗi chiếc giường,', 'một góc nghỉ.']}
        description={
          category?.description ||
          'Giường gỗ pallet nhiều kiểu dáng và kích thước. Chọn mẫu bạn thích rồi nhắn KIHA qua Zalo để được tư vấn và báo giá.'
        }
        imageRole="collection"
      />
      <div className="container-page pb-4">
        <CatalogShell current={current} categories={categories} hasPrices={hasPrices}>
          <div className="mt-6 mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {products.items.length > 0 ? (
                <>
                  Hiển thị{' '}
                  <strong className="text-foreground">
                    {first}–{last}
                  </strong>{' '}
                  trên <strong className="text-foreground">{products.total}</strong> sản phẩm
                </>
              ) : (
                'Không có sản phẩm phù hợp'
              )}
            </p>
            {current.q && (
              <CatalogLink
                href={catalogHref(current, { q: '' })}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent py-1.5 pr-2.5 pl-3.5 text-[13px] transition-colors hover:bg-sage-strong"
              >
                Từ khóa: “{current.q}”
                <X className="size-3.5" aria-label="Bỏ từ khóa" />
              </CatalogLink>
            )}
          </div>
          {products.items.length > 0 ? (
            <ProductGrid products={products.items} settings={settings} preloadFirst={0} />
          ) : (
            <EmptyState
              icon={SearchX}
              title={outOfRange ? 'Trang này không có sản phẩm' : 'Chưa tìm thấy mẫu phù hợp'}
              description={
                outOfRange
                  ? `Danh sách hiện có ${products.total} sản phẩm. Quay về trang đầu để xem tiếp.`
                  : current.q
                    ? `Không có sản phẩm nào khớp với “${current.q}”. Thử từ khóa ngắn hơn hoặc xem tất cả sản phẩm.`
                    : 'Danh mục này đang được KIHA cập nhật. Bạn có thể xem các danh mục khác hoặc nhắn Zalo để hỏi mẫu hiện có.'
              }
            >
              <CatalogLink
                href={outOfRange ? catalogHref(current, { page: 1 }) : '/san-pham'}
                className={buttonVariants({ variant: 'outline' })}
              >
                {outOfRange ? 'Về trang đầu' : 'Xóa bộ lọc'}
              </CatalogLink>
              <ZaloButton settings={settings} />
            </EmptyState>
          )}
          <Pagination current={current} page={products.page} pages={products.pages} />
        </CatalogShell>
      </div>
      <ContactBand settings={settings} />
    </>
  );
}
