import Image from 'next/image';
import { ArrowUpRight, Play } from 'lucide-react';
import { Reveal } from '@/components/site/reveal';
import { decor } from '@/lib/editorial-assets';

// Dẫn sang kênh TikTok của KIHA; chỉ hiện khi kênh đã được cấu hình.
export function VideoTeaser({ settings }) {
  const image = decor('video');
  if (!settings.tiktokUrl) return null;
  return (
    <section aria-labelledby="video-title" className="pb-16 sm:pb-24">
      <div className="container-page grid grid-cols-1 items-end gap-8 lg:grid-cols-[0.8fr_1.4fr] lg:gap-14">
        <Reveal>
          <p className="eyebrow">Xem gần hơn, hiểu rõ hơn</p>
          <h2
            id="video-title"
            className="display-title mt-4 text-[2.5rem] sm:text-5xl lg:text-[3.4rem]"
          >
            <span className="block">Một góc nhìn</span>
            <span className="block">thật hơn về sản phẩm.</span>
          </h2>
          <a
            href={settings.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 border-b border-walnut/30 pb-1 font-display text-[15px] text-walnut hover:border-walnut"
          >
            Ghé TikTok KIHA
            <ArrowUpRight className="size-4" />
          </a>
        </Reveal>
        <Reveal>
          <a
            href={settings.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Xem video của KIHA trên TikTok (mở tab mới)"
            className="kiha-photo-link group relative block aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand sm:aspect-[16/9]"
          >
            {image && (
              <Image
                src={image.src}
                alt=""
                fill
                sizes="(max-width: 1024px) 94vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.08] group-focus-visible:scale-[1.08]"
              />
            )}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ivory from-10% via-ivory/80 via-40% to-transparent to-75%"
            />
            <span className="absolute top-[34%] left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 sm:top-[40%] items-center justify-center rounded-full bg-ivory/90 text-walnut shadow-soft transition-transform duration-500 group-hover:scale-110 sm:size-20">
              <Play className="ml-1 size-6" strokeWidth={1.4} />
            </span>
            <span className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <span className="block max-w-sm font-display text-2xl tracking-[-0.02em] text-walnut sm:text-3xl">
                Thêm một góc nhìn, thêm một lựa chọn.
              </span>
              <span className="mt-2 block text-[13px] text-muted-foreground sm:text-sm">
                Xem thêm video từ KIHA trên TikTok. Mẫu nào có video sẽ hiện ngay trên trang chi
                tiết sản phẩm.
              </span>
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
