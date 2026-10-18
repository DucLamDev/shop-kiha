import { Be_Vietnam_Pro, Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { siteUrl } from '@/lib/server-api';
import './globals.css';
const body = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});
const heading = Manrope({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-heading',
  display: 'swap',
});
export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'Nội Thất KIHA | Giường ngủ pallet', template: '%s | KIHA' },
  description: 'Giường ngủ pallet cho không gian sống của bạn. Xem bộ ảnh KIHA và tư vấn qua Zalo.',
  icons: { icon: '/icon.svg' },
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#f6f3ed' };
export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${body.variable} ${heading.variable}`}>
        <a href="#main-content" className="skip-link">
          Bỏ qua điều hướng
        </a>
        {children}
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
