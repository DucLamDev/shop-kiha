import Link from 'next/link';
import { ArrowUpRight, MessageCircleMore, Phone } from 'lucide-react';
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
          <MessageCircleMore />
          Thông tin liên hệ
        </Link>
      </Button>
    );
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={settings.zaloUrl} target="_blank" rel="noopener noreferrer" aria-label={label}>
        <MessageCircleMore />
        {children}
        {arrow && <ArrowUpRight className="size-4 opacity-70" />}
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
        <Phone />
        {children ?? settings.phone}
      </a>
    </Button>
  );
}
