import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(root, '.env'), quiet: true });
export default {
  poweredByHeader: false,
  devIndicators: false,
  // Allow the API's 100 MiB video limit plus multipart headers through rewrites.
  experimental: { proxyClientMaxBodySize: '105mb', proxyTimeout: 300000 },
  turbopack: { root },
  async rewrites() {
    if (!process.env.API_INTERNAL_URL) throw new Error('Set API_INTERNAL_URL in .env');
    return [{ source: '/api/:path*', destination: `${process.env.API_INTERNAL_URL}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};
