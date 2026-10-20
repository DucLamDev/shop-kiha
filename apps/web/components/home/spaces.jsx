import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Feather } from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal';
import { decor } from '@/lib/editorial-assets';
import { cn } from '@/lib/utils';

const rooms = [
  { role: 'room-bedroom', label: 'Phòng ngủ', shape: 'rounded-[6rem_2rem_2rem_2rem]' },
  { role: 'room-apartment', label: 'Căn hộ', shape: 'rounded-[2rem_6rem_2rem_2rem]' },
  { role: 'room-townhouse', label: 'Nhà phố', shape: 'rounded-[2rem_2rem_6rem_2rem]' },
];

// Dải nền cát ấm nối tiếp đường cong của hero, ảnh phối cảnh bo vòm.
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
        <div className="min-w-0">
          <RevealGroup className="spaces-gallery scrollbar-none grid auto-cols-[78%] grid-flow-col gap-3 overflow-x-auto pb-4 sm:grid-flow-row sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
            {rooms.map((room) => {
              const image = decor(room.role);
              return (
                <RevealItem key={room.role} className="snap-start">
                  <Link
                    href="/san-pham"
                    className={cn(
                      'kiha-photo-link group relative block overflow-hidden bg-sand',
                      'aspect-[4/5]',
                      room.shape,
                    )}
                  >
                    {image && (
                      <Image
                        src={image.src}
                        alt={`Gợi ý không gian ${room.label.toLowerCase()} với giường gỗ pallet`}
                        fill
                        sizes="(max-width: 640px) 78vw, 26vw"
                        className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transform-none"
                      />
                    )}
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-3 rounded-full bg-ivory/95 py-2 pr-3 pl-4 text-[13px] text-charcoal shadow-sm transition-colors group-hover:bg-wood">
                      {room.label}
                      <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-rotate-45" />
                    </span>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
            Vuốt để khám phá không gian <ArrowRight className="size-3.5" />
          </p>
        </div>
      </div>
    </section>
  );
}
