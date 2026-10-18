import Link from 'next/link';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { Brand } from '@/components/header';
export function Footer({ settings }) {
  const socials = [
    ['Facebook', settings?.facebookUrl],
    ['TikTok', settings?.tiktokUrl],
    ['Zalo', settings?.zaloUrl],
  ];
  return (
    <>
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <Brand settings={settings} />
            <p>
              Chút mộc tự nhiên.
              <br />
              Chút bình yên mỗi ngày.
            </p>
          </div>
          <div>
            <h3>Khám phá</h3>
            <Link href="/san-pham">Giường ngủ pallet</Link>
            <Link href="/#ve-kiha">Câu chuyện KIHA</Link>
            <Link href="/lien-he">Liên hệ với KIHA</Link>
          </div>
          <div>
            <h3>Kết nối với chúng mình</h3>
            {socials
              .filter(([, url]) => url)
              .map(([label, url]) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer">
                  {label}
                  <ArrowUpRight size={14} />
                </a>
              ))}
          </div>
          <div>
            <h3>{settings?.shopName || 'Nội Thất KIHA'}</h3>
            {settings?.phone && (
              <a className="footer-phone" href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>
                {settings.phone}
              </a>
            )}
            {settings?.address && <p>{settings.address}</p>}
            {settings?.mapsUrl && (
              <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">
                Tìm KIHA trên bản đồ
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {settings?.shopName || 'KIHA'}. Dành cho những tổ ấm.
          </span>
          <Link href="/admin">Quản trị</Link>
          <span>Made for slow living.</span>
        </div>
        <div className="footer-art" aria-hidden="true">
          kiha.
        </div>
      </footer>
      {settings?.zaloUrl && (
        <a
          className="floating-zalo"
          href={settings.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat với KIHA qua Zalo"
        >
          <MessageCircle size={24} />
          <span>Zalo</span>
        </a>
      )}
    </>
  );
}
