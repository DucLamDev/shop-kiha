// Chuyển bản ghi sản phẩm (có thể đã populate danh mục) thành đúng các trường API cho phép ghi.
// API dùng schema strict nên không gửi _id, timestamps hay trường nội bộ.
export const emptyProduct = {
  name: '',
  slug: '',
  category: '',
  categories: [],
  video: '',
  videoDescription: '',
  shortDescription: '',
  description: '',
  images: [],
  thumbnail: '',
  price: null,
  priceLabel: '',
  specifications: [],
  isFeatured: false,
  status: 'draft',
  sortOrder: 0,
  seoTitle: '',
  seoDescription: '',
  seoImage: '',
  isDemo: false,
};

const idOf = (value) => (value && typeof value === 'object' ? value._id : value) || '';

export function toProductInput(item) {
  const out = {};
  for (const [key, fallback] of Object.entries(emptyProduct)) {
    const value = item?.[key];
    out[key] = value === undefined || (value === null && key !== 'price') ? fallback : value;
  }
  out.category = idOf(out.category);
  out.categories = (out.categories || []).map(idOf).filter(Boolean);
  out.specifications = (out.specifications || []).map(({ label = '', value = '' }) => ({
    label,
    value,
  }));
  return out;
}
