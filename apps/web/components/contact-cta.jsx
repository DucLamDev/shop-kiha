import Link from 'next/link';
import { ArrowUpRight, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function ContactCTA({
  settings,
  variant = 'default',
  children = 'Tư vấn qua Zalo',
  className = '',
}) {
  return (
    <Button asChild variant={variant} className={className}>
      {settings?.zaloUrl ? (
        <a href={settings.zaloUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle />
          {children}
          <ArrowUpRight />
        </a>
      ) : (
        <Link href="/lien-he">
          <MessageCircle />
          Thông tin liên hệ
          <ArrowUpRight />
        </Link>
      )}
    </Button>
  );
}
export function PhoneCTA({ settings }) {
  return settings?.phone ? (
    <Button asChild variant="outline">
      <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>
        <Phone />
        {settings.phone}
      </a>
    </Button>
  ) : null;
}
export function ContactBand({ settings }) {
  return (
    <section className="contact-band">
      <div>
        <p className="eyebrow">MỘT GÓC NHỎ, MỘT KHỞI ĐẦU MỚI</p>
        <h2>
          Cùng tìm chiếc giường
          <br />
          dành cho bạn.
        </h2>
        <p>
          Gửi KIHA không gian và ý tưởng của bạn.
          <br />
          Chúng mình sẽ cùng trao đổi những lựa chọn phù hợp.
        </p>
      </div>
      <ContactCTA settings={settings}>Trò chuyện với KIHA</ContactCTA>
    </section>
  );
}
