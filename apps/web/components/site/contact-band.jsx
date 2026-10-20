import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { ZaloButton } from '@/components/site/contact-buttons';
import { Reveal } from '@/components/site/reveal';
import { decor } from '@/lib/editorial-assets';
import { telHref } from '@/lib/contact';

// Khối kêu gọi tư vấn sáng màu trên nền ảnh trang trí, dùng chung ở cuối các trang.
export function ContactBand({
  settings,
  eyebrow = 'Bắt đầu từ một cuộc trò chuyện',
  title = ['Cùng chọn', 'một góc bình yên.'],
  description = 'Gửi KIHA mẫu giường bạn thích và kích thước phòng. Mình cùng tìm lựa chọn phù hợp nhé.',
}) {
  const image = decor('consultation-banner');
  const phone = telHref(settings?.phone);
  return (
    <section className="container-page py-16 sm:py-24" aria-labelledby="contact-band-title">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-sand sm:rounded-[2.75rem]">
          {image && (
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover object-right"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/80 to-ivory/10"
          />
          <div className="relative max-w-xl px-6 py-14 sm:px-12 sm:py-20 lg:px-16">
            <p className="eyebrow">{eyebrow}</p>
            <h2
              id="contact-band-title"
              className="display-title mt-4 text-[2.4rem] sm:text-5xl lg:text-[3.6rem]"
            >
              {title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-5 max-w-md text-[16px] text-muted-foreground">{description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ZaloButton settings={settings} size="lg" arrow className="px-7">
                Tư vấn Zalo
              </ZaloButton>
              {phone && (
                <a
                  href={phone}
                  className="inline-flex items-center gap-1 font-display text-[15px] text-walnut underline-offset-4 hover:underline"
                >
                  {settings.phone}
                  <ArrowUpRight className="size-4" />
                </a>
              )}
            </div>
          </div>
          {image && (
            <span className="absolute right-4 bottom-4 rounded-full bg-white/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
              Gợi ý không gian · Hình ảnh AI
            </span>
          )}
        </div>
      </Reveal>
    </section>
  );
}
