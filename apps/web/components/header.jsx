'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Phone, ArrowUpRight, Search } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ContactCTA } from '@/components/contact-cta';
const links = [
  { href: '/', name: 'Trang chủ' },
  { href: '/san-pham', name: 'Sản phẩm' },
  { href: '/#ve-kiha', name: 'Về KIHA' },
  { href: '/lien-he', name: 'Liên hệ' },
];
export function Brand({ settings }) {
  return (
    <Link className="brand" href="/" aria-label={`${settings?.shopName || 'KIHA'} — Trang chủ`}>
      {settings?.logo ? (
        <Image
          src={settings.logo}
          width={106}
          height={49}
          alt="KIHA"
          loading="eager"
          className="brand-image"
        />
      ) : (
        <span className="wordmark">
          kiha<span>.</span>
        </span>
      )}
      <span className="brand-tagline">NỘI THẤT CHO TỔ ẤM</span>
    </Link>
  );
}
export function Header({ settings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="announcement">
        <span>Một chút mộc cho không gian sống của bạn.</span>
        <a
          href={settings?.zaloUrl || '/lien-he'}
          target={settings?.zaloUrl ? '_blank' : undefined}
          rel="noopener noreferrer"
        >
          Kết nối với KIHA <ArrowUpRight size={12} />
        </a>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Brand settings={settings} />
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href))
                    ? 'active'
                    : ''
                }
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link href="/san-pham" className="search-shortcut" aria-label="Tìm sản phẩm">
              <Search size={20} />
            </Link>
            {settings?.phone && (
              <a className="header-phone" href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>
                <Phone size={15} />
                {settings.phone}
              </a>
            )}
            <span className="desktop-contact">
              <ContactCTA settings={settings} />
            </span>
            <span className="mobile-contact">
              <ContactCTA settings={settings}>Zalo</ContactCTA>
            </span>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="mobile-menu icon-button" aria-label="Mở menu">
                  <Menu />
                </button>
              </DialogTrigger>
              <DialogContent className="nav-drawer">
                <DialogTitle className="wordmark">KIHA</DialogTitle>
                <DialogDescription className="muted">Nội thất cho tổ ấm</DialogDescription>
                <nav aria-label="Menu di động">
                  {links.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                      {link.name}
                      <ArrowUpRight size={20} />
                    </Link>
                  ))}
                </nav>
                <ContactCTA settings={settings} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
    </>
  );
}
