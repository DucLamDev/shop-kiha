import editorial from '../../../data/editorial-media.json';
import decoration from '../../../data/decoration-media.json';
// Ảnh trang trí (AI) dùng cho bố cục; luôn có chú thích để không lẫn với ảnh sản phẩm thật.
const all = [...editorial, ...decoration];
export const editorialImages = Object.fromEntries(editorial.map((image) => [image.role, image]));
const byRole = Object.fromEntries(decoration.map((image) => [image.role, image]));
export function decor(role) {
  return byRole[role];
}
export function illustrationCaption(src) {
  return all.some((image) => image.src === src) ? 'Gợi ý không gian · Hình ảnh AI' : '';
}
