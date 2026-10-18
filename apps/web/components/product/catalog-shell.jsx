'use client';
import { createContext, useContext, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { LoaderCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { catalogHref, sortOptions } from '@/lib/catalog';
import { cn } from '@/lib/utils';

const CatalogContext = createContext(null);

// Bộ lọc điều hướng bằng URL bên trong transition: danh sách cũ mờ đi trong lúc server
// trả kết quả mới, không tải toàn bộ sản phẩm về trình duyệt.
export function CatalogShell({ current, categories, hasPrices, children }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigate = (href) => startTransition(() => router.push(href, { scroll: false }));
  return (
    <CatalogContext.Provider value={{ navigate, isPending }}>
      <CatalogToolbar current={current} categories={categories} hasPrices={hasPrices} />
      <div
        id="ket-qua"
        aria-busy={isPending}
        className={cn(
          'scroll-mt-40 transition-opacity duration-300',
          isPending && 'pointer-events-none opacity-45',
        )}
      >
        {children}
      </div>
    </CatalogContext.Provider>
  );
}

export function CatalogLink({ href, scrollToResults = false, onClick, ...props }) {
  const catalog = useContext(CatalogContext);
  return (
    <Link
      href={href}
      scroll={false}
      onClick={(event) => {
        onClick?.(event);
        if (!catalog || event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        catalog.navigate(href);
        if (scrollToResults)
          document
            .getElementById('ket-qua')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
      {...props}
    />
  );
}

function CatalogToolbar({ current, categories, hasPrices }) {
  const { navigate, isPending } = useContext(CatalogContext);
  const options = sortOptions.filter((o) => hasPrices || !o.needsPrice);
  const chips = [{ slug: '', name: 'Tất cả' }, ...categories];
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 border-y py-5 lg:sticky lg:top-[4.75rem] lg:z-30 lg:-mx-4 lg:rounded-b-2xl lg:border-x lg:border-t-0 lg:bg-ivory/90 lg:px-4 lg:backdrop-blur-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          role="search"
          action="/san-pham"
          className="relative flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            const q = new FormData(event.currentTarget).get('q')?.toString().trim() || '';
            navigate(catalogHref(current, { q }));
          }}
        >
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            key={current.q}
            name="q"
            type="search"
            defaultValue={current.q}
            maxLength={120}
            placeholder="Tìm tên giường, ví dụ: gấp 3 khúc"
            aria-label="Tìm sản phẩm theo tên"
            className="h-12 w-full rounded-full border border-input bg-white pr-28 pl-11 text-[15px] shadow-[inset_0_1px_1px_rgb(38_36_34/0.03)] transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/75 hover:border-charcoal/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {current.category && <input type="hidden" name="category" value={current.category} />}
          {current.sort !== 'featured' && <input type="hidden" name="sort" value={current.sort} />}
          {current.q && (
            <CatalogLink
              href={catalogHref(current, { q: '' })}
              aria-label="Xóa từ khóa"
              className="absolute top-1/2 right-[5.6rem] flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </CatalogLink>
          )}
          <button
            type="submit"
            className="absolute top-1.5 right-1.5 bottom-1.5 inline-flex items-center rounded-full bg-charcoal px-4 font-display text-[13px] font-semibold text-ivory transition-colors hover:bg-walnut"
          >
            Tìm
          </button>
        </form>
        <div className="flex items-center gap-2 sm:w-56">
          <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Select
            value={current.sort}
            onValueChange={(sort) => navigate(catalogHref(current, { sort }))}
          >
            <SelectTrigger aria-label="Sắp xếp sản phẩm" className="h-12 rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <nav aria-label="Lọc theo danh mục" className="min-w-0 flex-1">
          <ul className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
            {chips.map((c) => {
              const active = current.category === c.slug;
              return (
                <li key={c.slug || 'all'} className="relative shrink-0">
                  {active && (
                    <motion.span
                      layoutId="catalog-chip"
                      className="absolute inset-0 rounded-full bg-charcoal"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <CatalogLink
                    href={catalogHref(current, { category: c.slug })}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'relative z-10 block rounded-full border px-4 py-2 font-display text-[13px] font-semibold whitespace-nowrap transition-colors',
                      active
                        ? 'border-transparent text-ivory'
                        : 'border-charcoal/12 bg-white/70 text-charcoal/80 hover:border-charcoal/30 hover:text-charcoal',
                    )}
                  >
                    {c.name}
                  </CatalogLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center text-walnut transition-opacity',
            isPending ? 'opacity-100' : 'opacity-0',
          )}
          role="status"
          aria-live="polite"
        >
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          <span className="sr-only">{isPending ? 'Đang tải sản phẩm' : ''}</span>
        </span>
      </div>
    </div>
  );
}
