import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/site/section-heading';
import { RevealGroup, RevealItem } from '@/components/site/reveal';

// items: [{ category, count, image }] — ảnh và số lượng lấy từ dữ liệu thật của từng danh mục.
export function CategoryShowcase({ items }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="category-title" className="border-y bg-white py-16 sm:py-24">
      <div className="container-page">
        <SectionHeading
          id="category-title"
          eyebrow="Danh mục sản phẩm"
          title="Chọn kiểu giường hợp với không gian của bạn"
          description="Mỗi dòng sản phẩm có nhiều kiểu dáng và kích thước. Chọn một danh mục để xem các mẫu KIHA đang có."
          action={
            <Button asChild variant="outline">
              <Link href="/san-pham">
                Tất cả sản phẩm
                <ArrowRight />
              </Link>
            </Button>
          }
        />
        <RevealGroup className="scrollbar-none -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 lg:gap-5">
          {items.map(({ category, count, image }) => (
            <RevealItem key={category._id} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <Link
                href={`/san-pham?category=${category.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-sand"
              >
                {image && (
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 31vw"
                    className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.06]"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent"
                />
                <span className="absolute top-3 right-3 flex size-10 scale-90 items-center justify-center rounded-full bg-white text-charcoal opacity-0 transition-[opacity,transform] duration-500 group-hover:scale-100 group-hover:opacity-100">
                  <ArrowUpRight className="size-4.5" />
                </span>
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <span>
                    <span className="block font-display text-xl leading-tight font-bold text-white">
                      {category.name}
                    </span>
                    {category.description && (
                      <span className="mt-1 line-clamp-1 block text-sm text-white/75">
                        {category.description}
                      </span>
                    )}
                  </span>
                  {count > 0 && (
                    <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {count} mẫu
                    </span>
                  )}
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
