import Link from 'next/link';
import Image from 'next/image';
import { illustrationCaption } from '@/lib/editorial-assets';
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { getData, getSettings, pageMeta } from '@/lib/server-api';
import { Breadcrumb } from '@/components/breadcrumb';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
export const metadata = pageMeta(
  'Bộ sưu tập giường pallet',
  'Khám phá các mẫu giường ngủ pallet tại KIHA. Tìm kiếm, lọc danh mục và tư vấn mẫu giường phù hợp qua Zalo.',
  '/san-pham',
);
export default async function Products({ searchParams }) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const key of ['q', 'category', 'sort', 'page'])
    if (typeof raw[key] === 'string') params.set(key, raw[key]);
  if (!['featured', 'newest', 'name', 'price-asc', 'price-desc'].includes(params.get('sort')))
    params.delete('sort');
  if (!/^[1-9]\d{0,4}$/.test(params.get('page') || '')) params.delete('page');
  if (params.has('q')) params.set('q', params.get('q').slice(0, 120));
  if (params.has('category') && !/^[a-z0-9-]{1,160}$/.test(params.get('category')))
    params.delete('category');
  const [products, categories, settings] = await Promise.all([
    getData(`/products?${params}`),
    getData('/categories'),
    getSettings(),
  ]);
  function link(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    return `/san-pham?${next}`;
  }
  return (
    <div className="container catalog-page">
      <Breadcrumb items={[{ label: 'Bộ sưu tập' }]} />
      <div className="catalog-heading catalog-editorial-heading">
        <div>
          <p className="eyebrow">CHỌN MỘT GÓC BÌNH YÊN</p>
          <h1>
            Bộ sưu tập KIHA<span>.</span>
          </h1>
          <p>Những gợi ý giường ngủ pallet cho không gian của bạn.</p>
        </div>
        {(settings.aboutImage || settings.heroImage) && (
          <figure className="catalog-inspiration">
            <Image
              src={settings.aboutImage || settings.heroImage}
              alt=""
              fill
              sizes="(max-width: 800px) 1px, 240px"
            />
            <figcaption>
              {illustrationCaption(settings.aboutImage || settings.heroImage) || 'Cảm hứng từ KIHA'}
            </figcaption>
          </figure>
        )}
      </div>
      <form action="/san-pham" className="catalog-tools">
        <div className="search-field">
          <Search size={19} />
          <input
            name="q"
            aria-label="Tìm tên sản phẩm"
            placeholder="Tìm chiếc giường của bạn…"
            defaultValue={params.get('q') || ''}
            maxLength={120}
          />
        </div>
        <input type="hidden" name="category" value={params.get('category') || ''} />
        <label className="sort-field">
          <SlidersHorizontal size={16} />
          <span className="sr-only">Sắp xếp sản phẩm</span>
          <select name="sort" defaultValue={params.get('sort') || 'featured'}>
            <option value="featured">Nổi bật</option>
            <option value="newest">Mới nhất</option>
            <option value="name">Tên A – Z</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </label>
        <Button type="submit" size="sm">
          Áp dụng
        </Button>
      </form>
      <div className="catalog-meta">
        <div className="category-pills">
          <Link className={!params.get('category') ? 'selected' : ''} href={link('category', '')}>
            Tất cả
          </Link>
          {categories.map((c) => (
            <Link
              className={params.get('category') === c.slug ? 'selected' : ''}
              href={link('category', c.slug)}
              key={c._id}
            >
              {c.name}
            </Link>
          ))}
        </div>
        <span>{products.total} sản phẩm</span>
      </div>
      {products.items.some((p) => p.isDemo) && (
        <p className="demo-note">
          Bản xem trước · Các nhãn ảnh tham khảo cần được KIHA xác nhận trước khi xuất bản chính
          thức.
        </p>
      )}
      {products.items.length ? (
        <div className="product-grid">
          {products.items.map((p) => (
            <ProductCard key={p._id} product={p} settings={settings} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={36} strokeWidth={1.2} />
          <h2>Chưa tìm thấy sản phẩm phù hợp</h2>
          <p>Thử từ khóa khác hoặc xem toàn bộ bộ sưu tập.</p>
          <Button asChild variant="outline">
            <Link href="/san-pham">Xóa bộ lọc</Link>
          </Button>
        </div>
      )}
      {products.pages > 1 && (
        <nav className="pagination" aria-label="Phân trang">
          {products.page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={link('page', String(products.page - 1))}>
                <ArrowLeft />
                Trang trước
              </Link>
            </Button>
          )}
          <span>
            Trang {products.page} / {products.pages}
          </span>
          {products.page < products.pages && (
            <Button asChild variant="outline" size="sm">
              <Link href={link('page', String(products.page + 1))}>
                Trang sau
                <ArrowRight />
              </Link>
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
