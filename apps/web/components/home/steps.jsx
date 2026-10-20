import { SectionHeading } from '@/components/site/section-heading';
import { RevealGroup, RevealItem } from '@/components/site/reveal';
import { pad } from '@/lib/utils';

// Các bước tư vấn = mục "Cam kết & quy trình" trong cài đặt admin.
export function Steps({ steps }) {
  if (!steps?.length) return null;
  return (
    <section aria-labelledby="steps-title" className="py-16 sm:py-24">
      <div className="container-page">
        <SectionHeading
          id="steps-title"
          eyebrow="Từ ý tưởng đến góc nghỉ"
          title={['Chọn giường,', 'nhẹ nhàng thôi.']}
          description="Một vài điều để KIHA hiểu bạn hơn và tư vấn đúng nhu cầu."
        />
        <RevealGroup className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
          {steps.map((step, i) => (
            <RevealItem key={i}>
              <p className="border-b border-walnut/15 pb-4 font-display text-5xl font-light tracking-[-0.04em] text-olive-light sm:text-6xl">
                {pad(i + 1)}
              </p>
              <h3 className="mt-5 font-display text-[17px] tracking-[-0.01em] text-walnut sm:text-lg">
                {step.title}
              </h3>
              {step.description && (
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                  {step.description}
                </p>
              )}
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
