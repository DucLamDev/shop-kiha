import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Brand({ settings, className, inverse = false, href = '/' }) {
  const name = settings?.shopName || 'Nội Thất KIHA';
  return (
    <Link
      href={href}
      className={cn('group inline-flex shrink-0 items-center gap-3 rounded-lg', className)}
      aria-label={`${name} — Trang chủ`}
    >
      {settings?.logo && !inverse ? (
        <Image
          src={settings.logo}
          width={87}
          height={40}
          alt="KIHA"
          loading="eager"
          className="h-9 w-auto sm:h-10"
        />
      ) : (
        <span
          className={cn(
            'font-display text-[1.9rem] leading-none font-extrabold tracking-[-0.06em]',
            inverse ? 'text-ivory' : 'text-charcoal',
          )}
        >
          kiha<span className="text-wood">.</span>
        </span>
      )}
      <span
        className={cn(
          'hidden border-l pl-3 text-[10px] leading-tight font-bold tracking-[0.18em] uppercase sm:block',
          inverse ? 'border-ivory/20 text-ivory/70' : 'border-charcoal/15 text-muted-foreground',
        )}
      >
        Nội thất
        <br />
        gỗ pallet
      </span>
    </Link>
  );
}
