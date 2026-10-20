import Link from 'next/link';
import { Feather } from 'lucide-react';
import { cn } from '@/lib/utils';

// Logo chữ KIHA kèm lông vũ theo mẫu thiết kế. Logo ảnh trong cài đặt vẫn dùng cho SEO/JSON-LD.
export function Brand({ settings, className, href = '/', size = 'default' }) {
  const name = settings?.shopName || 'Nội Thất KIHA';
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex shrink-0 items-center gap-3 rounded-full text-walnut',
        className,
      )}
      aria-label={`${name} — Trang chủ`}
    >
      <Feather
        className={cn(
          'shrink-0 -rotate-12 transition-transform duration-500 group-hover:rotate-0',
          size === 'lg' ? 'size-7' : 'size-6',
        )}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span
        className={cn(
          'font-display leading-none font-medium tracking-[0.42em]',
          size === 'lg' ? 'text-2xl' : 'text-xl sm:text-[1.4rem]',
        )}
      >
        KIHA
      </span>
    </Link>
  );
}
