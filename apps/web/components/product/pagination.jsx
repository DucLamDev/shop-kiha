import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CatalogLink } from '@/components/product/catalog-shell';
import { catalogHref } from '@/lib/catalog';
import { cn } from '@/lib/utils';

function pageList(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const list = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  // Thiếu đúng một trang thì hiện luôn số trang đó thay cho dấu “…”.
  return list.flatMap((n, i) => {
    const gap = i ? n - list[i - 1] : 1;
    return gap === 2 ? [n - 1, n] : gap > 2 ? ['…', n] : [n];
  });
}

const base =
  'inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-full px-3 font-display text-sm font-semibold transition-colors';

export function Pagination({ current, page, pages }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Phân trang" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <CatalogLink
          scrollToResults
          href={catalogHref(current, { page: page - 1 })}
          className={cn(base, 'border bg-white hover:border-charcoal/30')}
          aria-label="Trang trước"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Trước</span>
        </CatalogLink>
      ) : (
        <span
          className={cn(base, 'border bg-white/50 text-muted-foreground/60')}
          aria-hidden="true"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Trước</span>
        </span>
      )}
      {pageList(page, pages).map((n, i) =>
        n === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <CatalogLink
            key={n}
            scrollToResults
            href={catalogHref(current, { page: n })}
            aria-current={n === page ? 'page' : undefined}
            aria-label={`Trang ${n}`}
            className={cn(
              base,
              n === page
                ? 'bg-primary text-primary-foreground'
                : 'text-walnut hover:bg-white hover:shadow-soft',
            )}
          >
            {n}
          </CatalogLink>
        ),
      )}
      {page < pages ? (
        <CatalogLink
          scrollToResults
          href={catalogHref(current, { page: page + 1 })}
          className={cn(base, 'border bg-white hover:border-charcoal/30')}
          aria-label="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="size-4" />
        </CatalogLink>
      ) : (
        <span
          className={cn(base, 'border bg-white/50 text-muted-foreground/60')}
          aria-hidden="true"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
