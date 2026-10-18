import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal, RevealGroup, RevealItem } from '@/components/site/reveal';
import { illustrationCaption } from '@/lib/editorial-assets';
import { lines, pad } from '@/lib/utils';

// Nội dung giới thiệu và cam kết đều lấy từ cấu hình admin (Cài đặt → Trang chủ).
export function AboutSection({ settings }) {
  const s = settings;
  const image = s.aboutImage || s.heroImage;
  const caption = illustrationCaption(image);
  const title = lines(s.aboutTitle);
  const commitments = s.commitments || [];
  if (!title.length && !s.aboutDescription && !commitments.length) return null;
  return (
    <section id="ve-kiha" aria-labelledby="about-title" className="bg-sand/55 py-16 sm:py-24">
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-wood-soft shadow-lift sm:aspect-[5/4] lg:aspect-[4/5]">
            {image && (
              <Image
                src={image}
                alt={caption || 'Không gian nội thất gỗ của KIHA'}
                fill
                sizes="(max-width: 1024px) 94vw, 40vw"
                className="object-cover"
              />
            )}
            {caption && (
              <span className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-charcoal/80 backdrop-blur">
                {caption}
              </span>
            )}
          </div>
          <div
            aria-hidden="true"
            className="absolute -top-5 -left-5 -z-10 hidden h-2/3 w-2/3 rounded-[2rem] border border-walnut/20 lg:block"
          />
        </Reveal>
        <div>
          <Reveal>
            <p className="eyebrow">
              <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
              Về KIHA
            </p>
            {title.length > 0 && (
              <h2
                id="about-title"
                className="mt-4 text-[2rem] font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-[2.75rem]"
              >
                {title.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            )}
            {s.aboutDescription && (
              <p className="prose-kiha mt-5 max-w-xl text-[17px]">{s.aboutDescription}</p>
            )}
          </Reveal>
          {commitments.length > 0 && (
            <RevealGroup className="mt-10 grid gap-3">
              {commitments.map((item, i) => (
                <RevealItem key={i}>
                  <div className="flex gap-5 rounded-2xl border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-walnut font-display text-sm font-bold text-ivory">
                      {pad(i + 1)}
                    </span>
                    <div>
                      <h3 className="font-display text-[17px] font-bold">{item.title}</h3>
                      {item.description && (
                        <p className="mt-1 text-[15px] text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
          <Reveal className="mt-8">
            <Button asChild variant="link" className="text-[15px]">
              <Link href="/lien-he">
                Liên hệ với KIHA
                <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
