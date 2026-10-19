import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Feather } from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal';
import { decor } from '@/lib/editorial-assets';
import { cn } from '@/lib/utils';

const rooms = [
  { role: 'room-bedroom', label: 'Phòng ngủ', shape: 'rounded-[6rem_2rem_2rem_2rem]' },
  { role: 'room-apartment', label: 'Căn hộ', shape: 'rounded-[2rem_6rem_2rem_2rem] mt-6 sm:mt-0' },
  { role: 'room-townhouse', label: 'Nhà phố', shape: 'rounded-[2rem_2rem_6rem_2rem]' },
];

// Dải nền xanh xô thơm nối tiếp đường cong của hero, ảnh phối cảnh bo vòm.
export function Spaces() {
  return (
    <section
      id="khong-gian"
      aria-labelledby="spaces-title"
      className="bg-sage pt-10 pb-16 sm:pt-16 sm:pb-24"
    >
      <div className="container-page grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.8fr_1.6fr] lg:gap-14">
        <Reveal>
          <p className="eyebrow">Không gian sống</p>
          <h2
            id="spaces-title"
            className="display-title mt-4 text-[2.6rem] sm:text-5xl lg:text-[3.5rem]"
          >
            <span className="block">Góc nghỉ,</span>
            <span className="block">theo cách bạn.</span>
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Mỗi không gian đều có một câu chuyện riêng. Bắt đầu từ một góc nhỏ bạn yêu, rồi cùng
            KIHA chọn chiếc giường phù hợp.
          </p>
          <Feather
            className="mt-8 hidden size-9 text-olive-light lg:block"
            strokeWidth={1.2}
            aria-hidden="true"
          />
        </Reveal>
        <div>
          <RevealGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {rooms.map((room, i) => {
              const image = decor(room.role);
              return (
                <RevealItem key={room.role} className={cn(i === 2 && 'col-span-2 sm:col-span-1')}>
                  <Link
                    href="/san-pham"
                    className={cn(
                      'group relative block overflow-hidden bg-sand',
                      i === 2 ? 'aspect-[16/10] sm:aspect-[4/5]' : 'aspect-[4/5]',
                      room.shape,
                    )}
                  >
                    {image && (
                      <Image
                        src={image.src}
                        alt={`Gợi ý không gian ${room.label.toLowerCase()} với giường gỗ pallet`}
                        fill
                        sizes="(max-width: 640px) 46vw, 26vw"
                        className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-105"
                      />
                    )}
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-3 rounded-full bg-ivory/95 py-2 pr-3 pl-4 text-[13px] text-charcoal shadow-sm transition-colors group-hover:bg-white">
                      {room.label}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
          <p className="mt-4 text-right text-[11px] text-muted-foreground">
            Gợi ý phối cảnh · Hình ảnh AI
          </p>
        </div>
      </div>
    </section>
  );
}
