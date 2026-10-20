import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { SocialIcon } from '@/components/site/social-icon';
import { Button } from '@/components/ui/button';
import { telHref } from '@/lib/contact';

// Nút Zalo dùng chung cho mọi trang. Khi chưa cấu hình Zalo, dẫn về trang liên hệ
// thay vì hiển thị một liên kết giả.
export function ZaloButton({
  settings,
  children = 'Tư vấn qua Zalo',
  variant = 'default',
  size = 'default',
  className,
  label,
  arrow = false,
}) {
  if (!settings?.zaloUrl)
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link href="/lien-he">
          <MessageCircle strokeWidth={1.7} />
          Thông tin liên hệ
        </Link>
      </Button>
    );
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={settings.zaloUrl} target="_blank" rel="noopener noreferrer" aria-label={label}>
        <SocialIcon channel="zalo" />
        {children}
        {arrow && <ArrowRight className="size-4" />}
      </a>
    </Button>
  );
}

export function PhoneButton({
  settings,
  variant = 'outline',
  size = 'default',
  className,
  children,
}) {
  const href = telHref(settings?.phone);
  if (!href) return null;
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={href} aria-label={`Gọi ${settings.phone}`}>
        <SocialIcon channel="phone" />
        {children ?? settings.phone}
      </a>
    </Button>
  );
}
