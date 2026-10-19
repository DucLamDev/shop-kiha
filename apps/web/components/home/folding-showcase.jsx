'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/site/reveal';
import { cn, priceText } from '@/lib/utils';

// items: [{ category, product, label }] — mỗi nhóm giường gấp hiển thị một mẫu thật.
export function FoldingShowcase({ items, settings }) {
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  const current = items[active] || items[0];
  const product = current.product;
  return (
    <section aria-labelledby="folding-title" className="py-16 sm:py-24">
      <div className="container-page grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow">Cho không gian linh hoạt</p>
          <h2
            id="folding-title"
            className="display-title mt-4 text-[2.5rem] sm:text-5xl lg:text-[3.4rem]"
          >
            <span className="block">Gấp gọn một nhịp.</span>
            <span className="block">Rộng thêm một góc.</span>
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Khám phá các nhóm giường gấp gọn và giường gấp làm ghế sofa cho nhu cầu thay đổi trong
            ngày.
          </p>
          {items.length > 1 && (
            <div
              role="tablist"
              aria-label="Nhóm giường gấp"
              className="mt-8 inline-flex rounded-full bg-accent p-1.5"
            >
              {items.map((item, i) => (
                <button
                  key={item.category._id}
                  role="tab"
                  type="button"
                  aria-selected={active === i}
                  aria-controls="folding-panel"
                  onClick={() => setActive(i)}
                  className={cn(
                    'relative rounded-full px-6 py-2.5 font-display text-sm transition-colors',
                    active === i ? 'text-charcoal' : 'text-muted-foreground hover:text-charcoal',
                  )}
                >
                  {active === i && (
                    <motion.span
                      layoutId="folding-tab"
                      className="absolute inset-0 rounded-full bg-white shadow-soft"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </button>
              ))}
            </div>
          )}
          <p className="mt-5 max-w-sm text-[13px] text-muted-foreground">
            Mỗi lựa chọn hiển thị một mẫu thực tế khác nhau. KIHA tư vấn cách sử dụng theo đúng sản
            phẩm.
          </p>
          <Button asChild variant="outline" size="lg" className="mt-6 px-7">
            <Link href={`/san-pham?category=${current.category.slug}`}>
              Khám phá nhóm giường gấp
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
        <div id="folding-panel" role="tabpanel" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={product._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-[2rem] rounded-tr-[5rem] bg-sand p-3 sm:p-4"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] rounded-tr-[4rem] bg-ivory-deep">
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 94vw, 52vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute top-3 left-3 rounded-full bg-ivory/92 px-2.5 py-1 text-[11px] text-walnut">
                  Ảnh sản phẩm KIHA
                </span>
              </div>
              <div className="px-2 pt-5 pb-2 sm:px-3">
                <p className="text-xs text-muted-foreground">{current.category.name}</p>
                <h3 className="mt-1.5 font-display text-xl tracking-[-0.02em] text-walnut sm:text-2xl">
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="after:absolute after:inset-0 after:rounded-[2rem]"
                  >
                    {product.name}
                  </Link>
                </h3>
                <div className="mt-4 flex items-center justify-between border-t border-walnut/12 pt-3.5 text-[13px]">
                  <span className="text-muted-foreground">{priceText(product)}</span>
                  {settings?.zaloUrl && (
                    <a
                      href={settings.zaloUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Tư vấn ${product.name} qua Zalo`}
                      className="relative z-10 inline-flex items-center gap-1.5 font-display text-walnut hover:text-olive"
                    >
                      <MessageCircle className="size-4" strokeWidth={1.7} />
                      Tư vấn
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
