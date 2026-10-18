'use client';
import { useState } from 'react';

export function ProductVideo({ src, poster, name, description }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="product-video">
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
      >
        <source src={src} type={src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        Trình duyệt của bạn không hỗ trợ phát video.
      </video>
      {failed && (
        <p role="status">
          Không phát được video trên trình duyệt này.{' '}
          <a href={src} target="_blank" rel="noreferrer">
            Mở video
          </a>
        </p>
      )}
      {description && (
        <details className="video-transcript">
          <summary>Nội dung video</summary>
          <p>{description}</p>
        </details>
      )}
    </div>
  );
}
