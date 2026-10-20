import Image from 'next/image';
import { MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const assets = {
  zalo: '/media/logo-social/zalo.png',
  facebook: '/media/logo-social/facebook.png',
  tiktok: '/media/logo-social/tiktok.jpg',
};

export function SocialIcon({ channel, className }) {
  const src = assets[channel];
  if (!src) {
    const Icon = channel === 'maps' ? MapPin : Phone;
    return (
      <Icon aria-hidden="true" className={cn('size-5 shrink-0', className)} strokeWidth={1.7} />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'social-icon relative inline-flex size-6 shrink-0 overflow-hidden rounded-full',
        className,
      )}
    >
      <Image src={src} alt="" fill sizes="40px" className="object-cover" />
    </span>
  );
}
