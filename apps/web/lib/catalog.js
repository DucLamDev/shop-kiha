// Truy vấn danh sách sản phẩm nằm trên URL (/san-pham?q=&category=&sort=&page=) để
// chia sẻ được và hoạt động với nút back/forward. Dùng chung cho server và client.
export const sortOptions = [
  { value: 'featured', label: 'Nổi bật' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'name', label: 'Tên A – Z' },
  { value: 'price-asc', label: 'Giá tăng dần', needsPrice: true },
  { value: 'price-desc', label: 'Giá giảm dần', needsPrice: true },
];

export function parseCatalogQuery(raw = {}) {
  const pick = (key) => (typeof raw[key] === 'string' ? raw[key].trim() : '');
  const sort = pick('sort');
  const page = pick('page');
  const category = pick('category');
  return {
    q: pick('q').slice(0, 120),
    category: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category) && category.length <= 160 ? category : '',
    sort: sortOptions.some((o) => o.value === sort) ? sort : 'featured',
    page: /^[1-9]\d{0,4}$/.test(page) ? Number(page) : 1,
  };
}

export function catalogHref(current, patch = {}) {
  const next = { ...current, page: 1, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set('q', next.q);
  if (next.category) params.set('category', next.category);
  if (next.sort && next.sort !== 'featured') params.set('sort', next.sort);
  if (next.page > 1) params.set('page', String(next.page));
  const query = params.toString();
  return query ? `/san-pham?${query}` : '/san-pham';
}
