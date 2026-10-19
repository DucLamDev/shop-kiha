import 'server-only';
import { cache } from 'react';
export const getData = cache(async (path) => {
  if (!process.env.API_INTERNAL_URL) throw new Error('API_INTERNAL_URL chưa được cấu hình.');
  const response = await fetch(`${process.env.API_INTERNAL_URL}/api${path}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Không thể tải dữ liệu KIHA. Vui lòng thử lại.');
  return (await response.json()).data;
});
export const getSettings = async () => (await getData('/settings/public')) || {};
export const getCategories = async () => (await getData('/categories')) || [];
export function siteUrl(path = '') {
  return `${(process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')}${path}`;
}
export function pageMeta(title, description, path, image) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      locale: 'vi_VN',
      type: 'website',
      siteName: 'Nội Thất KIHA',
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}
export function jsonLd(data) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
