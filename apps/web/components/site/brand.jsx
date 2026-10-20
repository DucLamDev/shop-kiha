import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const defaultLogo = '/media/412aeb4108c6c241000120bf4dcdb000fa4b984976d5333de984b048071989b3.png';
export function Brand({ settings, className, href = '/', size = 'default' }) {
  const name = settings?.shopName || 'Nội Thất KIHA';
  return (
    <Link
      href={href}
      className={cn('kiha-brand inline-flex shrink-0 items-center rounded-xl', className)}
      aria-label={`${name} — Trang chủ`}
    >
      <Image
        src={settings?.logo || defaultLogo}
        alt={name}
        width={900}
        height={414}
        sizes={size === 'lg' ? '160px' : '112px'}
        className={cn('h-auto object-contain', size === 'lg' ? 'w-40' : 'w-24 sm:w-28')}
      />
    </Link>
  );
}
