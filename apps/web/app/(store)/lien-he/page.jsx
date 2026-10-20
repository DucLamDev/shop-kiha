import { ArrowUpRight } from 'lucide-react';
import { getSettings, pageMeta } from '@/lib/server-api';
import { contactChannels } from '@/lib/contact';
import { cn, pad } from '@/lib/utils';
import { PageIntro } from '@/components/site/page-intro';
import { ZaloButton, PhoneButton } from '@/components/site/contact-buttons';
import { RevealGroup, RevealItem } from '@/components/site/reveal';
import { SocialIcon } from '@/components/site/social-icon';
import { ShopMap } from '@/components/site/shop-map';

export const metadata = pageMeta(
  'Liên hệ',
  'Liên hệ Nội Thất KIHA qua Zalo, điện thoại, Facebook hoặc TikTok để được tư vấn và báo giá giường gỗ pallet.',
  '/lien-he',
);

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
  const steps = s.commitments || [];
  return (
    <>
      <PageIntro
        breadcrumbs={[{ label: 'Liên hệ' }]}
        eyebrow="Liên hệ KIHA"
        title={['Trò chuyện cùng KIHA', 'về chiếc giường bạn cần.']}
        description="Gửi mẫu giường bạn thích cùng kích thước phòng và kích thước nệm. KIHA sẽ tư vấn, báo giá và trao đổi thông tin giao hàng trước khi bạn đặt."
        imageRole="flatlay"
      >
        <div className="flex flex-wrap gap-3">
          <ZaloButton settings={s} size="lg" arrow className="px-7">
            Nhắn Zalo cho KIHA
          </ZaloButton>
          <PhoneButton settings={s} size="lg">
            Gọi {s.phone}
          </PhoneButton>
        </div>
      </PageIntro>

      <section aria-labelledby="channels-title" className="py-16 sm:py-20">
        <div className="container-page">
          <h2 id="channels-title" className="display-title text-[2.4rem] sm:text-5xl">
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

      <ShopMap settings={s} />

      {steps.length > 0 && (
        <section aria-labelledby="steps-title" className="pb-8 sm:pb-12">
          <div className="container-page">
            <h2 id="steps-title" className="display-title text-[2.4rem] sm:text-5xl">
              Đặt giường cùng KIHA
            </h2>
            <RevealGroup className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {steps.map((step, i) => (
                <RevealItem key={i}>
                  <div className="h-full border-t border-walnut/15 pt-5">
                    <span className="font-display text-5xl font-light tracking-[-0.04em] text-olive-light">
                      {pad(i + 1)}
                    </span>
                    <h3 className="mt-3 font-display text-lg text-walnut">{step.title}</h3>
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
  const content = (
    <>
      <span
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-full',
          primary ? 'bg-white/70 text-walnut' : 'bg-accent text-olive',
        )}
      >
        <SocialIcon
          channel={channel.key}
          className={channel.key === 'phone' || channel.key === 'maps' ? 'size-6' : 'size-9'}
        />
      </span>
      <span className="min-w-0 flex-1 sm:mt-6">
        <span className="block text-xs tracking-[0.14em] uppercase opacity-75">
          {channel.label}
        </span>
        <span className="mt-1 block break-words font-display text-base tracking-[-0.02em] text-walnut sm:text-xl">
          {channel.href ? channel.value : 'Đang cập nhật'}
        </span>
      </span>
      {channel.href && (
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 font-display text-sm font-semibold sm:mt-6',
            'text-walnut',
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
    primary ? 'border-transparent bg-primary text-charcoal' : 'border-walnut/12 bg-white/50',
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
