import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { priceText, cn } from '@/lib/utils';

// Card theo mẫu: ảnh thật trong khung be bo tròn, nhãn "Ảnh sản phẩm KIHA",
// nút mũi tên tròn; phần chữ đặt ngoài khung, nhẹ nhàng.
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
    <article className={cn('group relative flex h-full flex-col', className)}>
      <div className="rounded-[1.75rem] bg-sand p-2.5 transition-[background-color,box-shadow,transform] duration-500 ease-(--ease-soft) group-hover:-translate-y-1 group-hover:bg-wood-soft group-hover:shadow-lift">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem] bg-ivory-deep">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            preload={preload}
            sizes={imageSizes || '(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw'}
            className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.045]"
          />
          <span className="absolute top-2.5 left-2.5 rounded-full bg-ivory/92 px-2.5 py-1 text-[10px] font-medium text-walnut shadow-sm backdrop-blur sm:text-[11px]">
            {showFeaturedBadge && product.isFeatured ? 'KIHA gợi ý' : 'Ảnh sản phẩm KIHA'}
          </span>
          <span
            aria-hidden="true"
            className="absolute right-2.5 bottom-2.5 flex size-9 items-center justify-center rounded-full bg-ivory/95 text-walnut shadow-sm transition-[background-color,transform] duration-500 group-hover:-rotate-45 group-hover:bg-primary"
          >
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-1 pt-4">
        {product.category?.name && (
          <p className="text-xs text-muted-foreground">{product.category.name}</p>
        )}
        <h3 className="mt-1.5 line-clamp-2 font-display text-[17px] leading-snug tracking-[-0.01em] text-walnut sm:text-lg">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-[1.75rem] focus-visible:after:ring-[3px] focus-visible:after:ring-ring/40"
          >
            {product.name}
          </Link>
        </h3>
        {product.shortDescription && (
          <p className="mt-1.5 hidden text-[13px] leading-relaxed text-muted-foreground sm:line-clamp-2">
            {product.shortDescription}
          </p>
        )}
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-walnut/12 pt-3.5">
            <span className="text-[13px] text-muted-foreground">{priceText(product)}</span>
            {settings?.zaloUrl && (
              <a
                href={settings.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Tư vấn ${product.name} qua Zalo`}
                className="relative z-10 inline-flex items-center gap-1.5 rounded-full px-1 py-1 font-display text-[13px] text-walnut transition-colors hover:text-olive"
              >
                <MessageCircle className="size-4" strokeWidth={1.7} />
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
    <ul
      className={cn(
        'grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-7',
        className,
      )}
    >
      {products.map((product, i) => (
        <li key={product._id}>
          <ProductCard product={product} settings={settings} preload={i < preloadFirst} />
        </li>
      ))}
    </ul>
  );
}
