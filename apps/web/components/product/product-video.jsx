'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function ProductVideo({ src, poster, name, description, className }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn('grid gap-3', className)}>
      {/* Merchant recordings have no supplied caption track. A descriptive transcript can be added in admin. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        key={src}
        controls
        playsInline
        preload="none"
        poster={poster || undefined}
        aria-label={`Video giới thiệu ${name || 'sản phẩm'}`}
        onError={() => setFailed(true)}
        onLoadedData={() => setFailed(false)}
        className="aspect-video w-full rounded-2xl bg-charcoal object-contain"
      >
        <source src={src} type={src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        Trình duyệt của bạn không hỗ trợ phát video.
      </video>
      {failed && (
        <p role="status" className="text-sm text-muted-foreground">
          Không phát được video trên trình duyệt này.{' '}
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-walnut underline"
          >
            Mở video
          </a>
        </p>
      )}
      {description && (
        <details className="rounded-xl border bg-white px-4 py-3 text-sm">
          <summary className="cursor-pointer font-display font-semibold">Nội dung video</summary>
          <p className="prose-kiha mt-3">{description}</p>
        </details>
      )}
    </div>
  );
}
