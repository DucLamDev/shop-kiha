import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from '@/components/site/brand';
import { telHref } from '@/lib/contact';

const linkClass =
  'inline-flex items-center gap-1 text-[15px] text-muted-foreground transition-colors hover:text-walnut';

function External({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <ArrowUpRight className="size-3.5" />
    </a>
  );
}

// Footer nền xanh nhạt, bo góc như mẫu; mọi liên kết liên hệ lấy từ cấu hình.
export function SiteFooter({ settings, categories = [] }) {
  const s = settings || {};
  const phoneHref = telHref(s.phone);
  return (
    <footer className="rounded-t-[3rem] bg-sage-soft pb-28 sm:rounded-tl-[6rem] sm:rounded-tr-none md:pb-0">
      <div className="container-page grid gap-12 pt-16 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:pt-20">
        <div className="max-w-xs">
          <Brand settings={s} size="lg" />
          <p className="mt-6 font-display text-lg leading-snug text-walnut">
            Một góc nhỏ.
            <br />
            Thật nhiều bình yên.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Giường gỗ pallet cho không gian sống giản dị. Tư vấn và báo giá qua Zalo.
          </p>
        </div>
        <nav aria-label="Khám phá KIHA">
          <h2 className="font-display text-[15px] font-medium text-walnut">Khám phá KIHA</h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href="/san-pham" className={linkClass}>
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/#ve-kiha" className={linkClass}>
                Về KIHA
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className={linkClass}>
                Liên hệ
              </Link>
            </li>
          </ul>
          {categories.length > 0 && (
            <ul className="mt-6 space-y-2 border-t border-walnut/10 pt-5" aria-label="Danh mục">
              {categories.map((c) => (
                <li key={c._id}>
                  <Link href={`/san-pham?category=${c.slug}`} className={linkClass}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
        <div>
          <h2 className="font-display text-[15px] font-medium text-walnut">Mình trò chuyện nhé</h2>
          <ul className="mt-5 space-y-3">
            {phoneHref && (
              <li>
                <a href={phoneHref} className={linkClass}>
                  {s.phone}
                </a>
              </li>
            )}
            {s.zaloUrl && (
              <li>
                <External href={s.zaloUrl}>Zalo {s.shopName || 'KIHA'}</External>
              </li>
            )}
            {s.address && <li className="text-[15px] text-muted-foreground">{s.address}</li>}
            {s.mapsUrl && (
              <li>
                <External href={s.mapsUrl}>Xem vị trí trên Google Maps</External>
              </li>
            )}
            {!phoneHref && !s.zaloUrl && !s.mapsUrl && (
              <li className="text-[15px] text-muted-foreground">Thông tin đang được cập nhật.</li>
            )}
          </ul>
        </div>
        {(s.facebookUrl || s.tiktokUrl) && (
          <div>
            <h2 className="font-display text-[15px] font-medium text-walnut">Ghé thăm mỗi ngày</h2>
            <ul className="mt-5 space-y-3">
              {s.facebookUrl && (
                <li>
                  <External href={s.facebookUrl}>Facebook</External>
                </li>
              )}
              {s.tiktokUrl && (
                <li>
                  <External href={s.tiktokUrl}>TikTok</External>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <div className="container-page">
        <div className="flex flex-col gap-2 border-t border-walnut/10 py-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {s.shopName || 'Nội Thất KIHA'} · Giường ngủ pallet
          </p>
          <p>Ảnh sản phẩm do KIHA cung cấp · Ảnh không gian là hình minh họa AI</p>
        </div>
      </div>
    </footer>
  );
}
