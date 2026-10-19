import Image from 'next/image';
import { ArrowUpRight, Facebook, MapPin, MessageCircleMore, Music2, Phone } from 'lucide-react';
import { getSettings, pageMeta } from '@/lib/server-api';
import { contactChannels } from '@/lib/contact';
import { illustrationCaption } from '@/lib/editorial-assets';
import { cn, pad } from '@/lib/utils';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { ZaloButton, PhoneButton } from '@/components/site/contact-buttons';
import { RevealGroup, RevealItem, Reveal } from '@/components/site/reveal';

export const metadata = pageMeta(
  'Liên hệ',
  'Liên hệ Nội Thất KIHA qua Zalo, điện thoại, Facebook hoặc TikTok để được tư vấn và báo giá giường gỗ pallet.',
  '/lien-he',
);

const icons = {
  zalo: MessageCircleMore,
  phone: Phone,
  facebook: Facebook,
  tiktok: Music2,
  maps: MapPin,
};
const actions = {
  zalo: 'Mở Zalo',
  phone: 'Gọi ngay',
  facebook: 'Mở Facebook',
  tiktok: 'Xem TikTok',
  maps: 'Mở Google Maps',
};

export default async function Contact() {
  const s = await getSettings();
  const channels = contactChannels(s);
  const image = s.aboutImage || s.heroImage;
  const caption = illustrationCaption(image);
  const steps = s.commitments || [];
  return (
    <>
      <section className="container-page pt-6 pb-12 sm:pt-8 sm:pb-16">
        <Breadcrumbs items={[{ label: 'Liên hệ' }]} />
        <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="eyebrow kiha-rise">
              <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
              Liên hệ KIHA
            </p>
            <h1
              className="kiha-rise mt-4 text-[2.5rem] leading-[1.06] font-extrabold tracking-[-0.04em] sm:text-6xl"
              style={{ '--delay': '60ms' }}
            >
              Trò chuyện cùng KIHA
              <span className="block text-walnut">về chiếc giường bạn cần.</span>
            </h1>
            <p
              className="kiha-rise mt-6 max-w-xl text-[17px] text-muted-foreground sm:text-lg"
              style={{ '--delay': '120ms' }}
            >
              Gửi mẫu giường bạn thích cùng kích thước phòng và kích thước nệm. KIHA sẽ tư vấn, báo
              giá và trao đổi thông tin giao hàng trước khi bạn đặt.
            </p>
            <div className="kiha-rise mt-8 flex flex-wrap gap-3" style={{ '--delay': '180ms' }}>
              <ZaloButton settings={s} size="lg" arrow>
                Nhắn Zalo cho KIHA
              </ZaloButton>
              <PhoneButton settings={s} size="lg">
                Gọi {s.phone}
              </PhoneButton>
            </div>
          </div>
          <div className="kiha-settle relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-sand shadow-lift lg:aspect-[5/6]">
            {image && (
              <Image
                src={image}
                alt={caption || 'Không gian nội thất KIHA'}
                fill
                preload
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
        </div>
      </section>

      <section aria-labelledby="channels-title" className="border-y bg-white py-16 sm:py-20">
        <div className="container-page">
          <h2
            id="channels-title"
            className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl"
          >
            Kênh liên hệ
          </h2>
          <p className="mt-3 text-muted-foreground">
            Chọn kênh thuận tiện cho bạn. Các liên kết mạng xã hội mở trong tab mới.
          </p>
          <RevealGroup className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {channels.map((channel) => (
              <RevealItem key={channel.key}>
                <ChannelCard channel={channel} primary={channel.key === 'zalo'} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {(s.address || s.mapsUrl) && (
        <section aria-labelledby="map-title" className="container-page py-16 sm:py-20">
          <Reveal>
            <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] border bg-white shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
              <div className="p-8 sm:p-10">
                <p className="eyebrow">
                  <MapPin className="size-4" aria-hidden="true" />
                  Ghé cửa hàng
                </p>
                <h2 id="map-title" className="mt-4 text-3xl font-extrabold tracking-[-0.03em]">
                  Vị trí KIHA
                </h2>
                <p className="mt-3 text-muted-foreground">
                  {s.address ||
                    'Mở Google Maps để xem đường đi tới cửa hàng. Nên nhắn KIHA qua Zalo trước khi ghé để được hỗ trợ tốt nhất.'}
                </p>
                {s.mapsUrl && (
                  <a
                    href={s.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-5 font-display text-sm font-semibold text-ivory transition-colors hover:bg-walnut"
                  >
                    Mở Google Maps
                    <ArrowUpRight className="size-4" />
                  </a>
                )}
              </div>
              <div className="relative min-h-64 bg-ivory-deep">
                {s.address ? (
                  <iframe
                    title={`Bản đồ: ${s.address}`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`}
                    className="absolute inset-0 size-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <MapDecoration />
                )}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {steps.length > 0 && (
        <section aria-labelledby="steps-title" className="bg-sand/55 py-16 sm:py-20">
          <div className="container-page">
            <h2 id="steps-title" className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
              Đặt giường cùng KIHA
            </h2>
            <RevealGroup className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {steps.map((step, i) => (
                <RevealItem key={i}>
                  <div className="h-full rounded-2xl bg-white p-6 shadow-soft">
                    <span className="font-display text-sm font-extrabold text-walnut">
                      Bước {pad(i + 1)}
                    </span>
                    <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
                    {step.description && (
                      <p className="mt-2 text-[15px] text-muted-foreground">{step.description}</p>
                    )}
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
    </>
  );
}

function ChannelCard({ channel, primary }) {
  const Icon = icons[channel.key];
  const content = (
    <>
      <span
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-full',
          primary ? 'bg-ivory/15 text-ivory' : 'bg-secondary text-walnut',
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1 sm:mt-6">
        <span className="block text-xs font-bold tracking-[0.14em] uppercase opacity-70">
          {channel.label}
        </span>
        <span className="mt-1 block truncate font-display text-lg font-bold tracking-tight sm:text-xl">
          {channel.href ? channel.value : 'Đang cập nhật'}
        </span>
      </span>
      {channel.href && (
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 font-display text-sm font-semibold sm:mt-6',
            primary ? 'text-wood' : 'text-walnut',
          )}
        >
          <span className="hidden sm:inline">{actions[channel.key]}</span>
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      )}
    </>
  );
  const className = cn(
    'group flex h-full items-center gap-4 rounded-2xl border p-4 transition-[transform,box-shadow,border-color] duration-500 sm:flex-col sm:items-start sm:gap-0 sm:p-6',
    primary ? 'border-transparent bg-walnut-deep text-ivory' : 'bg-ivory/60',
    channel.href ? 'hover:-translate-y-1 hover:shadow-lift' : 'opacity-70',
    !primary && channel.href && 'hover:border-walnut/30 hover:bg-white',
  );
  if (!channel.href) return <div className={className}>{content}</div>;
  return (
    <a
      href={channel.href}
      className={className}
      aria-label={`${channel.label}: ${channel.value} — ${actions[channel.key]}`}
      {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
  );
}

function MapDecoration() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(var(--kiha-wood-soft) 1px, transparent 1px), linear-gradient(90deg, var(--kiha-wood-soft) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="absolute top-[38%] left-[-10%] h-10 w-[120%] -rotate-6 bg-white/80" />
      <div className="absolute top-[-10%] left-[58%] h-[120%] w-8 rotate-12 bg-white/80" />
      <span className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-walnut text-ivory shadow-lift">
        <MapPin className="size-7" />
      </span>
      <span className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-walnut/30 motion-reduce:hidden" />
    </div>
  );
}
