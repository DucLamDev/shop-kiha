import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MessageCircleMore, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { priceText, cn } from '@/lib/utils';

export function ProductCard({
  product,
  settings,
  className,
  imageSizes,
  preload = false,
  showFeaturedBadge = true,
}) {
  const href = `/san-pham/${product.slug}`;
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-white shadow-soft transition-[transform,box-shadow] duration-500 ease-(--ease-soft) hover:-translate-y-1 hover:shadow-lift',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <Image
          src={product.thumbnail}
          alt={product.name}
          fill
          preload={preload}
          sizes={imageSizes || '(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw'}
          className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.045]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-charcoal/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {showFeaturedBadge && product.isFeatured && (
          <Badge variant="glass" className="absolute top-3 left-3 shadow-sm">
            <Sparkles />
            Nổi bật
          </Badge>
        )}
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 translate-y-3 items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 font-display text-[13px] font-semibold text-charcoal opacity-0 shadow-sm transition-[opacity,transform] duration-500 ease-(--ease-soft) group-hover:translate-y-0 group-hover:opacity-100"
        >
          Xem chi tiết <ArrowRight className="size-3.5" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {product.category?.name && (
          <p className="text-[11px] font-bold tracking-[0.12em] text-walnut uppercase">
            {product.category.name}
          </p>
        )}
        <h3 className="mt-1.5 line-clamp-2 font-display text-[17px] leading-snug font-bold tracking-[-0.01em]">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/40"
          >
            {product.name}
          </Link>
        </h3>
        {product.shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        )}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-3 border-t border-dashed pt-4">
            <span className="font-display text-[15px] font-bold text-walnut">
              {priceText(product)}
            </span>
            {settings?.zaloUrl && (
              <a
                href={settings.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Tư vấn ${product.name} qua Zalo`}
                className="relative z-10 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3.5 font-display text-[13px] font-semibold text-charcoal transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <MessageCircleMore className="size-4" />
                Tư vấn
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, settings, className, preloadFirst = 0 }) {
  return (
    <ul className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6', className)}>
      {products.map((product, i) => (
        <li key={product._id}>
          <ProductCard product={product} settings={settings} preload={i < preloadFirst} />
        </li>
      ))}
    </ul>
  );
}
