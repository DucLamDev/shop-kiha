import Link from 'next/link';
import { ArrowRight, BedSingle, Feather, Sofa } from 'lucide-react';
import { RevealGroup, RevealItem } from '@/components/site/reveal';
import { SectionHeading } from '@/components/site/section-heading';
import { pad } from '@/lib/utils';

function iconFor(slug) {
  if (/sofa/.test(slug)) return Sofa;
  if (/nem/.test(slug)) return Feather;
  return BedSingle;
}

// Lưới danh mục kẻ mảnh như mẫu; số mẫu lấy từ dữ liệu thật của từng danh mục.
export function CategoryGrid({ items }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="category-title" className="py-16 sm:py-24">
      <div className="container-page">
        <SectionHeading
          id="category-title"
          eyebrow="Tìm mẫu hợp với bạn"
          title={['Một chiếc giường.', 'Nhiều cách sống.']}
          action={
            <p className="max-w-[16rem] text-[15px] leading-relaxed text-muted-foreground">
              Từ một góc ngủ tối giản đến không gian cần sự linh hoạt.
            </p>
          }
        />
        <RevealGroup className="mt-12 grid grid-cols-2 border-t border-walnut/15 md:grid-cols-3 xl:grid-cols-6">
          {items.map(({ category, count }, i) => {
            const Icon = iconFor(category.slug);
            return (
              <RevealItem
                key={category._id}
                className="border-b border-walnut/15 odd:border-r md:border-r md:odd:border-r md:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n)]:border-r xl:[&:nth-child(6n)]:border-r-0"
              >
                <Link
                  href={`/san-pham?category=${category.slug}`}
                  className="group flex h-full min-h-48 flex-col p-4 transition-colors hover:bg-white/70 sm:min-h-52 sm:p-5"
                >
                  <span className="text-xs text-muted-foreground">{pad(i + 1)}</span>
                  <Icon
                    className="mt-5 size-7 text-walnut transition-transform duration-500 group-hover:-translate-y-0.5"
                    strokeWidth={1.2}
                    aria-hidden="true"
                  />
                  <span className="mt-4 font-display text-[16px] leading-snug text-walnut sm:text-[17px]">
                    {category.name}
                  </span>
                  <span className="mt-auto flex items-center justify-between pt-6 text-xs text-muted-foreground">
                    {count} mẫu
                    <ArrowRight className="size-4 text-walnut transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
