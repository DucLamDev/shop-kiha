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
  title: { default: 'Nội Thất KIHA | Giường gỗ pallet', template: '%s | KIHA' },
  description:
    'Giường gỗ pallet cho không gian sống của bạn. Xem mẫu giường KIHA và tư vấn, báo giá qua Zalo.',
  icons: { icon: '/icon.svg' },
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f6f1ea',
};
export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${body.variable} ${heading.variable}`}>
      <body>
        <noscript>
          <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
        <a href="#main-content" className="skip-link">
          Bỏ qua điều hướng
        </a>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: '!rounded-2xl !border-border !font-sans !shadow-lift',
            },
          }}
        />
      </body>
    </html>
  );
}
