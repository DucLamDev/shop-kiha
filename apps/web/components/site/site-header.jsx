'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowUpRight, Menu } from 'lucide-react';
import { SocialIcon } from '@/components/site/social-icon';
import { Brand } from '@/components/site/brand';
import { ZaloButton } from '@/components/site/contact-buttons';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { telHref } from '@/lib/contact';
import { cn } from '@/lib/utils';

export const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/#ve-kiha', label: 'Về KIHA' },
  { href: '/lien-he', label: 'Liên hệ' },
];

function isActive(pathname, href) {
  if (href.includes('#')) return false;
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

// Header dạng viên nổi trên nền ảnh/kem; dính đầu trang khi cuộn.
export function SiteHeader({ settings, categories = [] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const phoneHref = telHref(settings?.phone);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          'mx-auto flex h-16 max-w-[78rem] items-center justify-between gap-4 rounded-full border pr-2.5 pl-5 transition-[background-color,box-shadow,border-color] duration-300 sm:h-[4.25rem] sm:pl-7',
          scrolled
            ? 'border-white/70 bg-ivory/92 shadow-soft backdrop-blur-md'
            : 'border-white/60 bg-ivory/85 backdrop-blur-sm',
        )}
      >
        <Brand settings={settings} />
        <nav aria-label="Điều hướng chính" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href} className="relative">
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'kiha-nav-link relative z-10 block rounded-full px-4 py-2 font-display text-sm lg:px-5',
                      active ? 'text-charcoal' : 'text-charcoal/70 hover:text-walnut',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          {phoneHref && (
            <a
              href={phoneHref}
              className="hidden items-center gap-2 rounded-full px-3 py-2 font-display text-sm text-walnut transition-colors hover:text-olive lg:inline-flex"
            >
              <SocialIcon channel="phone" className="size-4" />
              {settings.phone}
            </a>
          )}
          <ZaloButton
            settings={settings}
            className="hidden h-11 px-5 sm:inline-flex"
            label="Tư vấn qua Zalo (mở tab mới)"
          >
            Tư vấn Zalo
          </ZaloButton>
          {settings?.zaloUrl && (
            <a
              href={settings.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Tư vấn qua Zalo"
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-4 font-display text-[13px] font-medium text-primary-foreground sm:hidden"
            >
              <SocialIcon channel="zalo" />
              Zalo
            </a>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex size-11 items-center justify-center rounded-full bg-accent text-charcoal transition-colors hover:bg-sage-strong md:hidden"
                aria-label="Mở menu"
              >
                <Menu className="size-5" strokeWidth={1.7} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <SheetTitle className="sr-only">Menu KIHA</SheetTitle>
              <SheetDescription className="sr-only">
                Điều hướng website và liên hệ tư vấn
              </SheetDescription>
              <Brand settings={settings} className="self-start" />
              <nav aria-label="Menu di động" className="mt-6">
                <ul className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.06, duration: 0.45 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive(pathname, link.href) ? 'page' : undefined}
                        className="flex min-h-12 items-center justify-between rounded-2xl px-3 py-2.5 font-display text-2xl tracking-[-0.03em] text-walnut transition-colors hover:bg-accent aria-[current=page]:bg-accent"
                      >
                        {link.label}
                        <ArrowUpRight className="size-5 opacity-50" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              {categories.length > 0 && (
                <div className="mt-6">
                  <p className="eyebrow px-3">Danh mục</p>
                  <ul className="mt-3 grid gap-0.5">
                    {categories.map((c) => (
                      <li key={c._id}>
                        <Link
                          href={`/san-pham?category=${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-3 py-2 text-[15px] text-muted-foreground transition-colors hover:bg-accent hover:text-charcoal"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-auto grid gap-2 pt-8">
                <div className="mb-2 grid grid-cols-2 gap-2">
                  {[
                    ['facebook', settings?.facebookUrl, 'Facebook'],
                    ['tiktok', settings?.tiktokUrl, 'TikTok'],
                  ]
                    .filter(([, href]) => href)
                    .map(([key, href, label]) => (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-walnut/10 bg-white/60 text-sm text-walnut"
                      >
                        <SocialIcon channel={key} />
                        {label}
                      </a>
                    ))}
                </div>
                <ZaloButton settings={settings} size="lg" className="w-full" />
                {phoneHref && (
                  <a
                    href={phoneHref}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-walnut/25 bg-white/60 font-display text-[15px] text-walnut"
                  >
                    <SocialIcon channel="phone" className="size-4" />
                    Gọi {settings.phone}
                  </a>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
