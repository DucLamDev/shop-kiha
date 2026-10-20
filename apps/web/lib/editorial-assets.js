import editorial from '../../../data/editorial-media.json';
import decoration from '../../../data/decoration-media.json';
// Metadata nguồn ảnh chỉ dùng để nhận diện trong trình quản trị.
const all = [...editorial, ...decoration];
export const editorialImages = Object.fromEntries(editorial.map((image) => [image.role, image]));
const byRole = Object.fromEntries(decoration.map((image) => [image.role, image]));
export function decor(role) {
  return byRole[role];
}
export function isEditorialImage(src) {
  return all.some((image) => image.src === src);
}
