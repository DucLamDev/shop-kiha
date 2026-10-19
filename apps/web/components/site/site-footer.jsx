import Link from 'next/link';
import { ArrowUpRight, Facebook, MapPin, MessageCircleMore, Music2, Phone } from 'lucide-react';
import { Brand } from '@/components/site/brand';
import { telHref } from '@/lib/contact';

export function SiteFooter({ settings, categories = [] }) {
  const s = settings || {};
  const socials = [
    { label: 'Zalo', href: s.zaloUrl, icon: MessageCircleMore },
    { label: 'Facebook', href: s.facebookUrl, icon: Facebook },
    { label: 'TikTok', href: s.tiktokUrl, icon: Music2 },
  ].filter((item) => item.href);
  const phoneHref = telHref(s.phone);
  return (
    <footer className="bg-charcoal pb-24 text-ivory/75 md:pb-0">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-20">
        <div className="max-w-sm">
          <Brand settings={s} inverse />
          <p className="mt-5 text-[15px] leading-relaxed">
            Giường gỗ pallet cho không gian sống giản dị, ấm áp. Xem mẫu trên website và nhắn KIHA
            qua Zalo để được tư vấn, báo giá.
          </p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2" aria-label="Mạng xã hội">
              {socials.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} của KIHA (mở tab mới)`}
                    className="flex size-10 items-center justify-center rounded-full border border-ivory/15 transition-colors hover:border-wood hover:bg-wood hover:text-charcoal"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label="Liên kết chân trang">
          <h2 className="font-display text-sm font-bold tracking-[0.14em] text-ivory uppercase">
            Khám phá
          </h2>
          <ul className="mt-5 space-y-3 text-[15px]">
            <li>
              <Link href="/" className="transition-colors hover:text-ivory">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/san-pham" className="transition-colors hover:text-ivory">
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/#ve-kiha" className="transition-colors hover:text-ivory">
                Về KIHA
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className="transition-colors hover:text-ivory">
                Liên hệ
              </Link>
            </li>
          </ul>
        </nav>
        {categories.length > 0 && (
          <nav aria-label="Danh mục sản phẩm">
            <h2 className="font-display text-sm font-bold tracking-[0.14em] text-ivory uppercase">
              Danh mục
            </h2>
            <ul className="mt-5 space-y-3 text-[15px]">
              {categories.map((c) => (
                <li key={c._id}>
                  <Link
                    href={`/san-pham?category=${c.slug}`}
                    className="transition-colors hover:text-ivory"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div>
          <h2 className="font-display text-sm font-bold tracking-[0.14em] text-ivory uppercase">
            {s.shopName || 'Nội Thất KIHA'}
          </h2>
          <ul className="mt-5 space-y-4 text-[15px]">
            {phoneHref && (
              <li>
                <a href={phoneHref} className="group flex items-start gap-3">
                  <Phone className="mt-1 size-4 shrink-0 text-wood" />
                  <span>
                    <span className="block text-xs text-ivory/55">Hotline</span>
                    <span className="font-display text-lg font-bold text-ivory group-hover:text-wood">
                      {s.phone}
                    </span>
                  </span>
                </a>
              </li>
            )}
            {(s.address || s.mapsUrl) && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 size-4 shrink-0 text-wood" />
                <span>
                  {s.address && <span className="block">{s.address}</span>}
                  {s.mapsUrl && (
                    <a
                      href={s.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline-offset-4 hover:text-ivory hover:underline"
                    >
                      Xem trên Google Maps
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                </span>
              </li>
            )}
            {!phoneHref && !s.mapsUrl && <li>Thông tin liên hệ đang được cập nhật.</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-page flex flex-col gap-2 py-6 text-[13px] text-ivory/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {s.shopName || 'Nội Thất KIHA'}. Tư vấn và đặt hàng qua
            Zalo.
          </p>
          <p>Ảnh sản phẩm do KIHA cung cấp.</p>
        </div>
      </div>
    </footer>
  );
}
