'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowUpRight, Menu, MessageCircleMore, Phone } from 'lucide-react';
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
  { href: '/lien-he', label: 'Liên hệ' },
];

function isActive(pathname, href) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

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
    <>
      <div className="bg-charcoal text-ivory/85">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-xs">
          <p className="truncate">
            <span className="font-semibold text-ivory">Giường gỗ pallet KIHA</span>
            <span className="hidden sm:inline"> · Tư vấn kích thước &amp; báo giá qua Zalo</span>
          </p>
          {phoneHref && (
            <a
              href={phoneHref}
              className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-ivory transition-colors hover:text-wood"
            >
              <Phone className="size-3.5" />
              {settings.phone}
            </a>
          )}
        </div>
      </div>
      <header
        className={cn(
          'sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300',
          scrolled
            ? 'border-border bg-ivory/90 shadow-[0_8px_30px_-18px_rgb(38_36_34/0.35)] backdrop-blur-md'
            : 'border-transparent bg-ivory',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4 md:h-[4.75rem]">
          <Brand settings={settings} />
          <nav aria-label="Điều hướng chính" className="hidden md:block">
            <ul className="flex items-center gap-1 rounded-full border border-charcoal/10 bg-white/60 p-1">
              {navLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href} className="relative">
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-charcoal"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative z-10 block rounded-full px-5 py-2 font-display text-sm font-semibold transition-colors',
                        active ? 'text-ivory' : 'text-charcoal/75 hover:text-charcoal',
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
                className="hidden items-center gap-2 rounded-full px-3 py-2 font-display text-sm font-bold text-charcoal transition-colors hover:text-walnut lg:inline-flex"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-secondary">
                  <Phone className="size-4" />
                </span>
                {settings.phone}
              </a>
            )}
            <ZaloButton
              settings={settings}
              size="sm"
              className="hidden h-10 px-4 sm:inline-flex"
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
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-3.5 font-display text-[13px] font-semibold text-primary-foreground sm:hidden"
              >
                <MessageCircleMore className="size-4" />
                Zalo
              </a>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  className="inline-flex size-10 items-center justify-center rounded-full border border-charcoal/10 bg-white/70 text-charcoal transition-colors hover:bg-white md:hidden"
                  aria-label="Mở menu"
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="px-6 pt-6 pb-8">
                <SheetTitle className="sr-only">Menu KIHA</SheetTitle>
                <SheetDescription className="sr-only">
                  Điều hướng website và liên hệ tư vấn
                </SheetDescription>
                <Brand settings={settings} className="self-start" />
                <nav aria-label="Menu di động" className="mt-10">
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
                          className="flex items-center justify-between rounded-xl px-3 py-3 font-display text-2xl font-bold tracking-tight transition-colors hover:bg-secondary aria-[current=page]:text-walnut"
                        >
                          {link.label}
                          <ArrowUpRight className="size-5 opacity-50" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>
                {categories.length > 0 && (
                  <div className="mt-8">
                    <p className="eyebrow px-3">Danh mục</p>
                    <ul className="mt-3 grid gap-0.5">
                      {categories.map((c) => (
                        <li key={c._id}>
                          <Link
                            href={`/san-pham?category=${c.slug}`}
                            onClick={() => setOpen(false)}
                            className="block rounded-lg px-3 py-2 text-[15px] text-charcoal/80 transition-colors hover:bg-secondary hover:text-charcoal"
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-auto grid gap-2 pt-8">
                  <ZaloButton settings={settings} size="lg" className="w-full" />
                  {phoneHref && (
                    <a
                      href={phoneHref}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-charcoal/15 bg-white font-display text-[15px] font-semibold"
                    >
                      <Phone className="size-4" />
                      Gọi {settings.phone}
                    </a>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
