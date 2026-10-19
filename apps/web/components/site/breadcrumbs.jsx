import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Breadcrumbs({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-[13px] text-muted-foreground', className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <li>
          <Link href="/" className="transition-colors hover:text-foreground">
            Trang chủ
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="line-clamp-1 font-medium text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
