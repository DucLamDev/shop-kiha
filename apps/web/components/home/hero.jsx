import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ZaloButton } from '@/components/site/contact-buttons';
import { illustrationCaption } from '@/lib/editorial-assets';
import { cn, lines } from '@/lib/utils';

export function Hero({ settings, spotlight, productCount, categoryCount }) {
  const s = settings;
  const title = lines(s.heroTitle || 'Giường gỗ pallet\ncho tổ ấm của bạn.');
  const caption = illustrationCaption(s.heroImage);
  const stats = [
    productCount > 0 && { value: productCount, label: 'sản phẩm' },
    categoryCount > 0 && { value: categoryCount, label: 'dòng sản phẩm' },
    s.zaloUrl && { value: 'Zalo', label: 'tư vấn & báo giá' },
  ].filter(Boolean);

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 hidden h-full w-[42%] bg-ivory-deep lg:block"
      />
      <div className="container-page relative grid grid-cols-1 items-center gap-10 pt-8 pb-16 sm:pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-14 lg:pb-24">
        <div className="max-w-2xl">
          <p className="eyebrow kiha-rise">
            <span className="h-px w-8 bg-current opacity-60" aria-hidden="true" />
            Nội thất gỗ pallet KIHA
          </p>
          <h1
            id="hero-title"
            className="kiha-rise mt-5 text-[2.6rem] leading-[1.04] font-extrabold tracking-[-0.04em] sm:text-6xl lg:text-[4.4rem]"
            style={{ '--delay': '80ms' }}
          >
            {title.map((line, i) => (
              <span
                key={i}
                className={i === title.length - 1 && i > 0 ? 'block text-walnut' : 'block'}
              >
                {line}
              </span>
            ))}
          </h1>
          {s.heroDescription && (
            <p
              className="kiha-rise mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground sm:text-lg"
              style={{ '--delay': '160ms' }}
            >
              {s.heroDescription}
            </p>
          )}
          <div className="kiha-rise mt-8 flex flex-wrap gap-3" style={{ '--delay': '240ms' }}>
            <ZaloButton settings={s} size="lg" arrow />
            <Button asChild variant="outline" size="lg">
              <Link href="/san-pham">
                Xem tất cả sản phẩm
                <ArrowRight />
              </Link>
            </Button>
          </div>
          {stats.length > 0 && (
            <dl
              className="kiha-rise mt-10 grid max-w-lg grid-cols-3 border-t border-charcoal/10 pt-6"
              style={{ '--delay': '320ms' }}
            >
              {stats.map((item, i) => (
                <div
                  key={item.label}
                  className={cn(
                    'flex flex-col-reverse',
                    i && 'border-l border-charcoal/10 pl-4 sm:pl-6',
                  )}
                >
                  <dt className="mt-1 text-xs text-muted-foreground sm:text-[13px]">
                    {item.label}
                  </dt>
                  <dd className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="relative lg:pl-4">
          <div className="kiha-settle relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-sand shadow-lift sm:aspect-[16/11] lg:aspect-auto lg:h-[min(38rem,74vh)]">
            {s.heroImage && (
              <Image
                src={s.heroImage}
                alt={caption || 'Không gian phòng ngủ với giường gỗ pallet KIHA'}
                fill
                preload
                sizes="(max-width: 1024px) 94vw, 48vw"
                className="object-cover"
              />
            )}
            {caption && (
              <span className="absolute top-4 left-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-charcoal/80 backdrop-blur">
                {caption}
              </span>
            )}
          </div>
          {spotlight && (
            <Link
              href={`/san-pham/${spotlight.slug}`}
              className="kiha-rise group absolute -bottom-8 left-4 flex w-[min(19rem,calc(100%-2rem))] items-center gap-3 rounded-2xl border border-white/60 bg-white/95 p-2.5 pr-4 shadow-lift backdrop-blur transition-transform duration-500 hover:-translate-y-1 sm:left-6 lg:-left-10"
              style={{ '--delay': '500ms' }}
            >
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                <Image
                  src={spotlight.thumbnail}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-bold tracking-[0.12em] text-walnut uppercase">
                  Mẫu nổi bật
                </span>
                <span className="mt-0.5 line-clamp-2 font-display text-sm leading-snug font-bold">
                  {spotlight.name}
                </span>
              </span>
              <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-walnut" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
