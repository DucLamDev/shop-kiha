import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import { SectionHeading } from '@/components/site/section-heading';
import { RevealGroup, RevealItem } from '@/components/site/reveal';
import { cn } from '@/lib/utils';

// Bộ sưu tập: sản phẩm nổi bật do admin chọn, bố cục so le trên máy tính như mẫu.
export function Collection({ products, settings, featured }) {
  return (
    <section aria-labelledby="collection-title" className="pb-16 sm:pb-24">
      <div className="container-page">
        <SectionHeading
          id="collection-title"
          eyebrow={featured ? 'Bộ sưu tập KIHA' : 'Mới cập nhật'}
          title={['Một vài gợi ý', 'cho góc nghỉ của bạn.']}
          action={
            <Button asChild variant="outline" size="lg" className="px-7">
              <Link href="/san-pham">
                Xem tất cả mẫu
                <ArrowRight />
              </Link>
            </Button>
          }
        />
        {products.length > 0 ? (
          <RevealGroup className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {products.map((product, i) => (
              <RevealItem key={product._id} className={cn(i % 2 === 1 && 'lg:mt-8')}>
                <ProductCard
                  product={product}
                  settings={settings}
                  showFeaturedBadge={false}
                  imageSizes="(max-width: 1024px) 46vw, 23vw"
                />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <p className="mt-10 rounded-[1.75rem] border border-dashed border-walnut/20 p-10 text-center text-muted-foreground">
            Bộ sưu tập đang được KIHA cập nhật. Nhắn Zalo để xem các mẫu hiện có.
          </p>
        )}
      </div>
    </section>
  );
}
