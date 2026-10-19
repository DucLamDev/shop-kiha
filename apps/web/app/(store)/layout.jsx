import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { ContactDock } from '@/components/site/contact-dock';
import { MotionProvider } from '@/components/site/reveal';
import { getCategories, getSettings } from '@/lib/server-api';
export const dynamic = 'force-dynamic';
export default async function StoreLayout({ children }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  return (
    <MotionProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader settings={settings} categories={categories} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter settings={settings} categories={categories} />
        <ContactDock settings={settings} />
      </div>
    </MotionProvider>
  );
}
