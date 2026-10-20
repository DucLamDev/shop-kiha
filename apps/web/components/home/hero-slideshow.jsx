'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const interval = 6500;

export function HeroSlideshow({ slides, intro, sceneDetails }) {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState([]);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(true);
  const [inView, setInView] = useState(true);
  const playing = !paused && !focused && !reducedMotion && visible && inView;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updatePreference();
    updateVisibility();
    preference.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.1,
    });
    observer.observe(root.current);
    return () => {
      preference.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!playing || ready.length < 2) return;
    const timer = window.setTimeout(() => {
      setActive((current) => {
        for (let step = 1; step < slides.length; step++) {
          const next = (current + step) % slides.length;
          if (ready.includes(next)) return next;
        }
        return current;
      });
    }, interval);
    return () => window.clearTimeout(timer);
  }, [active, playing, ready, slides.length]);

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      aria-roledescription="băng chuyền ảnh"
      data-hero-carousel
      data-active-slide={active}
      data-playing={playing}
      className="relative -mt-[76px] bg-sand sm:-mt-[84px]"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="relative min-h-[44rem] overflow-hidden sm:min-h-[50rem] lg:h-[min(54rem,100svh)] lg:min-h-[46rem]">
        <div className="hero-frames absolute inset-0">
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              className={cn('hero-frame', i === active && 'is-active')}
              aria-hidden={i !== active}
              data-slide={i}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                preload={i === 0}
                loading={i === 0 ? undefined : 'eager'}
                sizes="100vw"
                className="object-cover object-[62%_60%] lg:object-center"
                onLoad={() =>
                  setReady((current) => (current.includes(i) ? current : [...current, i]))
                }
                style={{ animationPlayState: playing ? 'running' : 'paused' }}
              />
            </div>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ivory/90 via-ivory/45 to-transparent lg:bg-gradient-to-r lg:from-ivory/85 lg:via-ivory/35 lg:to-transparent"
        />
        <div className="hero-copy container-page relative pt-28 pb-16 sm:pt-40 lg:h-full lg:pt-44 lg:pb-0">
          {intro}
          {slides.length > 1 && !reducedMotion && (
            <button
              type="button"
              aria-pressed={paused}
              onClick={() => setPaused((current) => !current)}
              className="sr-only focus:not-sr-only focus:absolute focus:bottom-14 focus:left-6 focus:z-20 focus:rounded-full focus:bg-ivory focus:px-4 focus:py-2 focus:text-walnut focus:outline-2 focus:outline-offset-4"
            >
              {paused ? 'Phát tự động banner' : 'Tạm dừng banner'}
            </button>
          )}
        </div>
        {sceneDetails}
      </div>
    </section>
  );
}
