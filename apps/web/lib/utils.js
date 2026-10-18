import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function hasPrice(product) {
  return product?.price !== null && product?.price !== undefined;
}
export function priceText(product) {
  return hasPrice(product)
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)
    : product.priceLabel || 'Liên hệ báo giá';
}
export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
export function pad(n) {
  return String(n).padStart(2, '0');
}
export function lines(text) {
  return (text || '').split('\n').filter(Boolean);
}
