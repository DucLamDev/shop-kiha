'use client';

import { useEffect, useRef, useState } from 'react';
import { HeartHandshake, ShoppingBag, Star } from 'lucide-react';

const icons = {
  sales: ShoppingBag,
  interested: HeartHandshake,
  reviews: Star,
};
const format = (value, decimals) =>
  new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

function CountUp({ value, decimals = 0, suffix = '' }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    let frame;
    let started = false;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => {
      if (preference.matches) {
        cancelAnimationFrame(frame);
        setDisplay(value);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        observer.disconnect();
        if (preference.matches) return;
        setDisplay(0);
        const start = performance.now();
        const tick = (time) => {
          const progress = Math.min((time - start) / 1600, 1);
          setDisplay(value * (1 - (1 - progress) ** 3));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.65 },
    );
    observer.observe(ref.current);
    preference.addEventListener('change', finish);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', finish);
    };
  }, [value]);
  return (
    <span
      ref={ref}
      aria-label={`${format(value, decimals)}${suffix}`}
      data-count-target={value}
      className="tabular-nums"
    >
      <span aria-hidden="true">
        {format(display, decimals)}
        <span className="text-[.55em]">{suffix}</span>
      </span>
    </span>
  );
}

export function ShopStatistics({ statistics }) {
  const stats = statistics || {};
  const items = [
    { key: 'sales', value: stats.salesCount, label: 'Lượt bán' },
    { key: 'interested', value: stats.interestedCount, label: 'Khách hàng quan tâm' },
    { key: 'reviews', value: stats.positiveReviewCount, label: 'Lượt đánh giá tốt' },
  ];
  return (
    <section
      className="stats-section container-page pt-10 sm:pt-16"
      aria-label="KIHA qua những con số"
    >
      <div className="stats-panel">
        <div className="stats-heading">
          <p className="eyebrow">Cùng KIHA, thêm một góc ấm</p>
          <p className="mt-2 font-display text-xl leading-snug text-walnut sm:text-2xl">
            Những con số,
            <br className="hidden lg:block" /> một hành trình.
          </p>
        </div>
        <div className="stats-grid" style={{ '--stat-count': items.length }}>
          {items.map((item) => {
            const Icon = icons[item.key];
            return (
              <div key={item.key} className="stat-item" data-stat={item.key}>
                <span className="stat-icon">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-[2.35rem] leading-none tracking-[-0.045em] text-walnut sm:text-5xl">
                    {Number.isFinite(item.value) && item.value >= 0 ? (
                      <CountUp key={item.value} value={item.value} />
                    ) : (
                      <span className="text-lg tracking-normal text-muted-foreground">
                        Đang cập nhật
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-[13px]">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {stats.source && (
        <p className="mt-3 text-right text-xs text-muted-foreground">{stats.source}</p>
      )}
    </section>
  );
}
