import { ArrowUpRight, MapPin, Navigation } from 'lucide-react';
import { shopLocation } from '@/lib/shop-location';
import { Reveal } from '@/components/site/reveal';

export function ShopMap({ settings }) {
  const { embedUrl, openUrl, directionsUrl } = shopLocation(settings);
  if (!openUrl) return null;
  return (
    <section aria-labelledby="map-title" className="container-page pb-14 sm:py-16">
      <Reveal>
        <div className="shop-map grid overflow-hidden rounded-[2rem] border border-walnut/10 bg-sand/60 lg:grid-cols-[0.85fr_1.15fr] lg:rounded-tr-[5rem]">
          <div className="p-6 sm:p-10 lg:py-12">
            <p className="eyebrow">
              <MapPin className="size-4" />
              Ghé cửa hàng
            </p>
            <h2 id="map-title" className="display-title mt-4 text-4xl sm:text-5xl">
              Vị trí KIHA
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {settings.address || 'Chạm vào bản đồ để mở vị trí cửa hàng trên Google Maps.'}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Nhắn KIHA trước khi ghé để mình đón bạn chu đáo hơn nhé.
            </p>
            <a
              href={directionsUrl}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-display text-sm text-primary-foreground shadow-soft transition-colors hover:bg-wood-soft"
            >
              <Navigation className="size-4" />
              Chỉ đường đến KIHA
              <ArrowUpRight className="size-4" />
            </a>
          </div>
          <div className="relative min-h-[20rem] bg-ivory-deep sm:min-h-[24rem]">
            {embedUrl && (
              <iframe
                title="Bản đồ vị trí cửa hàng Nội Thất KIHA"
                src={embedUrl}
                className="pointer-events-none absolute inset-0 size-full border-0"
                loading="lazy"
                tabIndex={-1}
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
            <a
              href={openUrl}
              className="group absolute inset-0 rounded-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-wood"
              aria-label="Mở vị trí chính xác của KIHA trên Google Maps"
            >
              <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-white bg-ivory/95 px-4 py-2.5 text-xs text-walnut shadow-soft backdrop-blur transition-transform group-hover:-translate-y-1">
                <MapPin className="size-4" />
                Nội Thất KIHA
                <ArrowUpRight className="size-4" />
              </span>
              {!embedUrl && (
                <span className="absolute inset-0 flex items-center justify-center text-walnut">
                  Xem vị trí trên Google Maps <ArrowUpRight className="ml-2 size-5" />
                </span>
              )}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
