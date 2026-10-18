import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getSettings } from '@/lib/server-api';
import '../editorial.css';
export const dynamic = 'force-dynamic';
export default async function StoreLayout({ children }) {
  const settings = await getSettings();
  return (
    <div className="storefront">
      <Header settings={settings} />
      <main id="main-content">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
