import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal';
import { SectionHeading } from '@/components/site/section-heading';
import { decor } from '@/lib/editorial-assets';
import { pad } from '@/lib/utils';

export function CategoryGrid({ items }) {
  if (!items.length) return null;
  const scene = decor('sunroom');
  return (
    <section
      aria-labelledby="category-title"
      className="category-section relative overflow-hidden py-16 sm:py-24"
    >
      <div className="container-page relative">
        <SectionHeading
          id="category-title"
          eyebrow="Tìm mẫu hợp với bạn"
          title={['Một chiếc giường.', 'Nhiều cách sống.']}
          action={
            <p className="max-w-[18rem] text-[15px] leading-relaxed text-muted-foreground">
              Sát sàn thật thư thái, gấp gọn thật linh hoạt. Chọn kiểu giường dành cho nhịp sống của
              bạn.
            </p>
          }
        />
        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[0.85fr_1.65fr] lg:gap-8">
          <Reveal className="relative">
            <Link
              href="/san-pham"
              className="category-scene group relative isolate flex h-full min-h-[22rem] flex-col justify-end overflow-hidden bg-sand p-7 sm:min-h-[28rem] lg:min-h-0"
            >
              {scene && (
                <Image
                  src={scene.src}
                  alt="Góc phòng ngủ ngập nắng với giường pallet và cửa vòm"
                  fill
                  sizes="(max-width: 1024px) 90vw, 32vw"
                  className="category-scene-image -z-20 object-cover"
                />
              )}
              <div
                className="absolute inset-0 -z-10 bg-gradient-to-t from-ivory from-10% via-ivory/75 via-35% to-transparent to-65%"
                aria-hidden="true"
              />
              <span className="absolute top-8 left-7 inline-flex items-center gap-2 rounded-full border border-white/80 bg-ivory/90 px-4 py-2 text-[11px] font-medium tracking-widest text-walnut uppercase backdrop-blur">
                <span className="size-1.5 rounded-full bg-wood" />
                Bộ sưu tập KIHA
              </span>
              <div className="mb-2 max-w-[17rem]">
                <span className="eyebrow">Gỗ mộc. Nhà ấm.</span>
                <p className="mt-3 font-display text-[2.35rem] leading-[1.08] tracking-[-0.045em] text-walnut">
                  Một góc riêng,
                  <br />
                  vừa vặn với bạn.
                </p>
                <span className="mt-6 flex items-center justify-between border-t border-walnut/25 pt-4 text-sm text-walnut">
                  Khám phá tất cả
                  <span className="category-arrow flex size-10 items-center justify-center rounded-full border border-walnut/25 bg-ivory/90">
                    <ArrowUpRight className="size-5" />
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
          <RevealGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" stagger={0.07}>
            {items.map(({ category, count, product }, i) => {
              const image = category.image || product?.thumbnail;
              return (
                <RevealItem key={category._id} className="h-full">
                  <Link
                    href={`/san-pham?category=${category.slug}`}
                    className="category-card group flex h-full flex-col rounded-[1.5rem] border border-walnut/10 bg-ivory p-2.5"
                  >
                    <div className="relative aspect-[5/4] overflow-hidden rounded-[1rem] bg-sand">
                      {image ? (
                        <Image
                          src={image}
                          alt={product?.name || category.name}
                          fill
                          sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 18vw"
                          className="category-card-image object-cover"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center font-display text-5xl text-wood">
                          {pad(i + 1)}
                        </span>
                      )}
                      <span className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-ivory/95 font-display text-[10px] text-walnut">
                        {pad(i + 1)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col px-1.5 pt-3 pb-1">
                      <h3 className="min-h-12 text-sm leading-snug text-walnut sm:text-[15px]">
                        {category.name}
                      </h3>
                      <span className="mt-auto flex items-center justify-between gap-2 pt-3">
                        <span className="text-[11px] text-muted-foreground">
                          {count} mẫu để khám phá
                        </span>
                        <span className="category-arrow flex size-8 shrink-0 items-center justify-center rounded-full bg-sand text-walnut">
                          <ArrowRight className="size-4" />
                        </span>
                      </span>
                    </div>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
        <Reveal className="mt-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-walnut/15" />
          <p className="text-center text-[11px] tracking-wide text-muted-foreground sm:text-xs">
            Bạn chọn kiểu dáng. KIHA cùng bạn chọn kích thước.
          </p>
          <span className="h-px flex-1 bg-walnut/15" />
        </Reveal>
      </div>
    </section>
  );
}
