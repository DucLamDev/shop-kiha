import { getData, siteUrl } from '@/lib/server-api';
export const dynamic = 'force-dynamic';
export default async function sitemap() {
  const entries = ['/', '/san-pham', '/lien-he'].map((path) => ({
    url: siteUrl(path),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));
  let page = 1;
  let pages = 1;
  do {
    const result = await getData(`/products?limit=60&page=${page}`);
    pages = result.pages;
    for (const p of result.items)
      if (!p.isDemo)
        entries.push({
          url: siteUrl(`/san-pham/${p.slug}`),
          lastModified: p.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
    page++;
  } while (page <= pages);
  return entries;
}
