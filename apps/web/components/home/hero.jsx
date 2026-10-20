import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, Feather, Lamp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ZaloButton } from '@/components/site/contact-buttons';
import { illustrationCaption } from '@/lib/editorial-assets';
import { lines } from '@/lib/utils';

const hotspots = [
  { label: 'Tựa đầu, tựa bình yên', className: 'top-[44%] left-[44%]' },
  { label: 'Mộc mạc từ những thanh gỗ', className: 'top-[67%] left-[39%]' },
];
const promises = [
  { icon: MessageCircle, label: 'Lắng nghe nhu cầu' },
  { icon: Feather, label: 'Gợi ý mẫu phù hợp' },
  { icon: Lamp, label: 'Chọn góc nghỉ của riêng bạn' },
];

// Hero tràn viền: ảnh nằm dưới header nổi, chữ nâu trên nền sáng, thẻ tư vấn bên phải.
export function Hero({ settings }) {
  const s = settings;
  const title = lines(s.heroTitle || 'Một góc nhỏ.\nThật nhiều bình yên.');
  const description = lines(s.heroDescription);
  const caption = illustrationCaption(s.heroImage);
  return (
    <section
      aria-labelledby="hero-title"
      className="relative -mt-[76px] bg-sage pb-2 sm:-mt-[84px] lg:pb-0"
    >
      <div className="relative h-[44rem] overflow-hidden sm:h-[50rem] lg:h-[min(54rem,100svh)] lg:min-h-[46rem]">
        {s.heroImage && (
          <Image
            src={s.heroImage}
            alt={caption || 'Phòng ngủ sáng với giường gỗ pallet'}
            fill
            preload
            sizes="100vw"
            className="kiha-settle object-cover object-[62%_60%] lg:object-center"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-ivory/85 via-ivory/35 to-transparent lg:bg-gradient-to-r lg:from-ivory/75 lg:via-ivory/20 lg:to-transparent"
        />
        <div className="container-page relative pt-32 sm:pt-40 lg:pt-44">
          <div className="max-w-3xl">
            <p className="eyebrow kiha-rise">Nội thất KIHA · Mộc mạc từng góc nhỏ</p>
            <h1
              id="hero-title"
              className="display-title kiha-rise mt-5 text-[2.75rem] sm:text-6xl lg:text-[4.6rem]"
              style={{ '--delay': '80ms' }}
            >
              {title.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
            {description.length > 0 && (
              <p
                className="kiha-rise mt-6 max-w-md text-[15px] leading-relaxed text-charcoal/75 sm:text-base"
                style={{ '--delay': '160ms' }}
              >
                {description.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </p>
            )}
            <div className="kiha-rise mt-8" style={{ '--delay': '240ms' }}>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/45 px-7 backdrop-blur"
              >
                <Link href="/san-pham">
                  Khám phá
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {hotspots.map((spot, i) => (
          <span
            key={spot.label}
            aria-hidden="true"
            className={`kiha-rise absolute hidden items-center gap-3 lg:flex ${spot.className}`}
            style={{ '--delay': `${600 + i * 150}ms` }}
          >
            <span className="relative flex size-5 items-center justify-center rounded-full border-2 border-white bg-olive-light shadow-sm">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/60 motion-reduce:hidden" />
            </span>
            <span className="rounded-xl bg-white/95 px-3.5 py-2 text-xs text-charcoal shadow-soft">
              {spot.label}
            </span>
          </span>
        ))}
        <a
          href="#khong-gian"
          className="absolute bottom-24 left-5 hidden items-center gap-3 border-l border-walnut/40 py-1 pl-4 text-xs leading-snug text-walnut sm:flex lg:bottom-20 lg:left-14"
        >
          <span>
            Cuộn xuống
            <br />
            khám phá thêm
          </span>
          <ArrowDown className="size-3.5 animate-bounce motion-reduce:animate-none" />
        </a>
        {caption && (
          <span className="absolute right-4 bottom-20 hidden rounded-full bg-white/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur sm:block lg:bottom-14">
            {caption}
          </span>
        )}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="absolute inset-x-0 -bottom-px h-10 w-full text-sage sm:h-16"
        >
          <path fill="currentColor" d="M0 34 C 360 4 1080 4 1440 52 L1440 80 L0 80 Z" />
        </svg>
      </div>
      <div className="relative z-10 container-page -mt-40 sm:-mt-48 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-28 lg:mt-0 lg:flex lg:justify-end">
        <div
          className="kiha-rise pointer-events-auto rounded-[1.75rem] border border-white/80 bg-ivory/95 p-6 shadow-lift backdrop-blur-md lg:w-[21rem]"
          style={{ '--delay': '420ms' }}
        >
          <div className="flex gap-4">
            <Feather className="mt-1 size-6 shrink-0 text-olive" strokeWidth={1.4} />
            <div>
              <h2 className="font-display text-lg tracking-[-0.02em] text-walnut">
                Tìm chiếc giường của bạn
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Chia sẻ nhu cầu, KIHA cùng bạn chọn mẫu giường phù hợp.
              </p>
            </div>
          </div>
          <ZaloButton settings={s} size="lg" arrow className="mt-5 w-full">
            Tư vấn Zalo
          </ZaloButton>
          <ul className="mt-5 hidden grid-cols-3 divide-x divide-walnut/10 text-center lg:grid">
            {promises.map(({ icon: Icon, label }) => (
              <li key={label} className="px-2">
                <Icon className="mx-auto size-5 text-walnut" strokeWidth={1.4} />
                <span className="mt-2 block text-[11px] leading-snug text-muted-foreground">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
