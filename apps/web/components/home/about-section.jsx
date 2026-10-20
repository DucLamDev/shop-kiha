import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Feather } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/site/reveal';
import { lines } from '@/lib/utils';

// Tiêu đề lấy từ cấu hình; hai chữ cuối được nhấn màu nâu gỗ.
function Title({ text }) {
  const all = lines(text);
  return all.map((line, i) => {
    if (i < all.length - 1 || all.length === 1)
      return (
        <span key={i} className="block">
          {line}
        </span>
      );
    const words = line.split(' ');
    const tail = words.slice(-2).join(' ');
    return (
      <span key={i} className="block">
        {words.slice(0, -2).join(' ')} <span className="text-olive-light">{tail}</span>
      </span>
    );
  });
}

// Giới thiệu KIHA: nội dung từ Admin → Cài đặt → Nội dung trang chủ.
export function AboutSection({ settings }) {
  const s = settings;
  const image = s.aboutImage || s.heroImage;
  if (!s.aboutTitle && !s.aboutDescription) return null;
  return (
    <section id="ve-kiha" aria-labelledby="about-title" className="px-3 sm:px-5">
      <div className="mx-auto max-w-[90rem] overflow-hidden rounded-tr-[4rem] rounded-bl-[4rem] bg-sage py-14 sm:rounded-tr-[7rem] sm:rounded-bl-[7rem] sm:py-20">
        <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">Chào bạn, KIHA đây</p>
            {s.aboutTitle && (
              <h2
                id="about-title"
                className="display-title mt-4 text-[2.5rem] sm:text-5xl lg:text-[3.5rem]"
              >
                <Title text={s.aboutTitle} />
              </h2>
            )}
            {s.aboutDescription && (
              <p className="prose-kiha mt-5 max-w-lg text-[15px] sm:text-base">
                {s.aboutDescription}
              </p>
            )}
            <Button asChild variant="outline" size="lg" className="mt-8 px-7">
              <Link href="/lien-he">
                Trò chuyện cùng KIHA
                <ArrowRight />
              </Link>
            </Button>
          </Reveal>
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[12rem] rounded-b-[2rem] bg-wood-soft sm:aspect-[5/6]">
              {image && (
                <Image
                  src={image}
                  alt="Một góc nghỉ với giường gỗ pallet"
                  fill
                  sizes="(max-width: 1024px) 94vw, 40vw"
                  className="object-cover"
                />
              )}
            </div>
            <span
              aria-hidden="true"
              className="absolute -right-2 -bottom-6 flex size-32 flex-col items-center justify-center rounded-full border border-white bg-ivory/95 text-center shadow-soft sm:-right-6 sm:size-36"
            >
              <span className="text-[10px] tracking-wide text-muted-foreground">một góc mộc</span>
              <Feather className="my-2 size-6 text-walnut" strokeWidth={1.3} />
              <span className="text-[10px] tracking-wide text-muted-foreground">
                một chút an nhiên
              </span>
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
