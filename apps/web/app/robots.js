import { siteUrl } from '@/lib/server-api';
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: siteUrl('/sitemap.xml'),
  };
}
