import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { decor } from '@/lib/editorial-assets';
import { HeroSlideshow } from '@/components/home/hero-slideshow';
import { lines } from '@/lib/utils';

// Hero tràn viền: ảnh nằm dưới header nổi, chữ nâu trên nền sáng.
export function Hero({ settings }) {
  const s = settings;
  const title = lines(s.heroTitle || 'Một góc nhỏ.\nThật nhiều bình yên.');
  const description = lines(s.heroDescription);
  const slides = [
    {
      src: s.heroImage || decor('hero')?.src,
      alt: 'Phòng ngủ ấm áp với giường gỗ pallet và chăn linen',
    },
    { src: decor('hero')?.src, alt: 'Giường pallet trong căn phòng ngập nắng, bên cửa vòm' },
    { src: decor('video')?.src, alt: 'Góc nghỉ với giường gỗ tự nhiên bên cửa sổ' },
  ].filter((slide, i, all) => slide.src && all.findIndex((item) => item.src === slide.src) === i);
  const intro = (
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
        <Button asChild variant="outline" size="lg" className="bg-white/45 px-7 backdrop-blur">
          <Link href="/san-pham">
            Khám phá
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
  const sceneDetails = (
    <>
      <a
        href="#khong-gian"
        className="absolute right-10 bottom-14 hidden items-center gap-3 rounded-full bg-ivory/90 px-4 py-2 text-xs leading-snug text-walnut lg:flex"
      >
        <span>
          Cuộn xuống
          <br />
          khám phá thêm
        </span>
        <ArrowDown className="size-3.5 animate-bounce motion-reduce:animate-none" />
      </a>
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -bottom-px h-10 w-full text-sage sm:h-16"
      >
        <path fill="currentColor" d="M0 34 C 360 4 1080 4 1440 52 L1440 80 L0 80 Z" />
      </svg>
    </>
  );
  return <HeroSlideshow slides={slides} intro={intro} sceneDetails={sceneDetails} />;
}
