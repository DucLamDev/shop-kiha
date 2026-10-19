import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { ZaloButton } from '@/components/site/contact-buttons';
import { Reveal } from '@/components/site/reveal';
import { decor } from '@/lib/editorial-assets';

// Câu trả lời chỉ mô tả cách KIHA tư vấn qua Zalo, không tự đặt chính sách bảo hành/giao hàng.
export function faqItems(settings, categories) {
  return [
    {
      q: 'Nên bắt đầu chọn giường từ đâu?',
      a: 'Hãy bắt đầu từ kích thước phòng và nệm bạn đang dùng, sau đó xem các danh mục để chọn kiểu dáng: sát sàn, giường hộp, chân cao hay gấp gọn. Gửi KIHA mẫu bạn thích để được gợi ý thêm.',
    },
    {
      q: 'KIHA có những kiểu giường pallet nào?',
      a: categories.length
        ? `Hiện có các nhóm: ${categories.map((c) => c.name).join(', ')}. Mỗi nhóm có nhiều kích thước để lựa chọn.`
        : 'Danh mục sản phẩm đang được KIHA cập nhật.',
      link: { href: '/san-pham', label: 'Xem tất cả sản phẩm' },
    },
    {
      q: 'Làm sao để biết giá và kích thước phù hợp?',
      a: 'Giá phụ thuộc vào mẫu, kích thước và hoàn thiện. Nhắn KIHA qua Zalo kèm mẫu và kích thước bạn cần để nhận báo giá cụ thể.',
    },
    {
      q: 'Tôi có thể xem video giới thiệu sản phẩm không?',
      a: `Mẫu nào có video sẽ hiển thị ngay trên trang chi tiết sản phẩm.${settings.tiktokUrl ? ' Bạn cũng có thể xem thêm trên kênh TikTok của KIHA.' : ''}`,
    },
    {
      q: 'Giao hàng và lắp ráp được trao đổi thế nào?',
      a: 'Thông tin giao hàng và lắp ráp được KIHA trao đổi, xác nhận cùng bạn qua Zalo trước khi đặt hàng.',
    },
  ];
}

export function Faq({ settings, categories }) {
  const items = faqItems(settings, categories);
  const image = decor('faq');
  return (
    <section aria-labelledby="faq-title" className="pb-8 sm:pb-12">
      <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow">Một chút giải đáp</p>
          <h2
            id="faq-title"
            className="display-title mt-4 text-[2.5rem] sm:text-5xl lg:text-[3.4rem]"
          >
            <span className="block">Có thể bạn</span>
            <span className="block">đang băn khoăn.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
            Chưa tìm thấy câu trả lời?
            <br />
            KIHA luôn sẵn lòng trò chuyện.
          </p>
          <ZaloButton settings={settings} variant="outline" size="lg" arrow className="mt-7 px-7">
            Hỏi KIHA qua Zalo
          </ZaloButton>
          {image && (
            <div className="relative mt-10 hidden aspect-[5/4] overflow-hidden rounded-[2rem_6rem_2rem_2rem] bg-sand lg:block">
              <Image src={image.src} alt="" fill sizes="36vw" className="object-cover" />
              <span className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
                Gợi ý không gian · Hình ảnh AI
              </span>
            </div>
          )}
        </Reveal>
        <Reveal>
          <Accordion type="single" collapsible className="border-t border-walnut/15">
            {items.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-walnut/15">
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger className="group flex flex-1 items-center justify-between gap-4 py-6 text-left text-[15px] text-charcoal outline-none transition-colors hover:text-walnut focus-visible:ring-[3px] focus-visible:ring-ring/25 sm:text-base">
                    {item.q}
                    <Plus
                      className="size-4 shrink-0 text-olive transition-transform duration-300 group-data-[state=open]:rotate-45"
                      aria-hidden="true"
                    />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionContent className="pr-8 text-[15px] leading-relaxed text-muted-foreground">
                  {item.a}
                  {item.link && (
                    <Link
                      href={item.link.href}
                      className="mt-3 block font-display text-walnut underline-offset-4 hover:underline"
                    >
                      {item.link.label} →
                    </Link>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
