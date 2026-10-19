import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal';
import { decor } from '@/lib/editorial-assets';
import { pad } from '@/lib/utils';

const notes = ['Vẻ mộc mạc của gỗ', 'Kết hợp chất liệu mềm', 'Giữ khoảng thở cho căn phòng'];

// "Nhìn gần hơn": khối be bo góc lệch, ảnh chi tiết và nhành ô liu trang trí.
export function DetailStory() {
  const image = decor('detail');
  const olive = decor('olive');
  return (
    <section aria-labelledby="detail-title" className="px-3 sm:px-5">
      <div className="relative mx-auto max-w-[90rem] overflow-hidden rounded-tl-[4rem] rounded-br-[4rem] bg-sand/70 py-14 sm:rounded-tl-[7rem] sm:rounded-br-[7rem] sm:py-20">
        {olive && (
          <Image
            src={olive.src}
            alt=""
            width={360}
            height={360}
            className="pointer-events-none absolute -right-14 -bottom-10 w-56 opacity-60 sm:w-80"
          />
        )}
        <div className="container-page relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem_6rem_2rem_6rem] bg-wood-soft">
              {image && (
                <Image
                  src={image.src}
                  alt="Chi tiết giường gỗ pallet với chăn linen dưới nắng"
                  fill
                  sizes="(max-width: 1024px) 94vw, 46vw"
                  className="object-cover"
                />
              )}
              <span className="absolute right-4 bottom-4 rounded-full bg-white/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
                Gợi ý không gian · Hình ảnh AI
              </span>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow">Đẹp từ những điều giản dị</p>
              <h2
                id="detail-title"
                className="display-title mt-4 text-[2.5rem] sm:text-5xl lg:text-[3.4rem]"
              >
                <span className="block">Nhìn gần hơn.</span>
                <span className="block">Yêu thêm một chút.</span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Những thanh gỗ sáng, bề mặt linen mềm và ánh nắng qua cửa. Một gợi ý để góc nghỉ trở
                nên ấm áp, vừa đủ.
              </p>
            </Reveal>
            <RevealGroup className="mt-8 border-t border-walnut/15">
              {notes.map((note, i) => (
                <RevealItem key={note}>
                  <p className="flex items-baseline gap-6 border-b border-walnut/15 py-4 text-[15px] text-walnut">
                    <span className="text-xs text-olive-light">{pad(i + 1)}</span>
                    {note}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>
            <Reveal className="mt-8">
              <Button asChild variant="outline" size="lg" className="px-7">
                <Link href="/#ve-kiha">
                  Câu chuyện KIHA
                  <ArrowRight />
                </Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
