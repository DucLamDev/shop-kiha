'use client';
import { createContext, useContext, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, MotionConfig, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
const ExperienceContext = createContext({ enabled: true, paused: false, toggle: () => {} });
export const useExperienceMotion = () => useContext(ExperienceContext);
const reducedQuery = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(callback) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
const reducedSnapshot = () => window.matchMedia(reducedQuery).matches;
const serverReducedSnapshot = () => false;
export function HomeExperience({ children }) {
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    reducedSnapshot,
    serverReducedSnapshot,
  );
  const enabled = !paused && !reduced;
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <ExperienceContext.Provider
      value={{ enabled, paused, toggle: () => setPaused((v) => !v), reduced }}
    >
      <MotionConfig reducedMotion={enabled ? 'user' : 'always'}>
        <div className="kiha-home" data-motion={enabled ? 'running' : 'paused'}>
          <motion.div
            className="reading-progress"
            style={{ scaleX: enabled ? progress : scrollYProgress }}
            aria-hidden="true"
          />
          {children}
        </div>
      </MotionConfig>
    </ExperienceContext.Provider>
  );
}
export function MotionControls() {
  const { paused, toggle, reduced } = useExperienceMotion();
  return (
    <button
      className="motion-toggle"
      onClick={toggle}
      aria-pressed={paused || Boolean(reduced)}
      disabled={Boolean(reduced)}
      aria-label={
        reduced
          ? 'Đã giảm chuyển động theo cài đặt thiết bị'
          : paused
            ? 'Bật chuyển động'
            : 'Tạm dừng chuyển động'
      }
    >
      {paused || reduced ? <Play size={12} /> : <Pause size={12} />}
      <span>
        {reduced ? 'Chuyển động tối giản' : paused ? 'Bật chuyển động' : 'Tạm dừng chuyển động'}
      </span>
    </button>
  );
}
export function Parallax({ children, className = '', distance = 24 }) {
  const ref = useRef(null);
  const { enabled } = useExperienceMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  return (
    <div ref={ref} className={`parallax-window ${className}`}>
      <motion.div className="parallax-image" style={{ y: enabled ? y : 0 }}>
        {children}
      </motion.div>
    </div>
  );
}
export function Magnetic({ children }) {
  const { enabled } = useExperienceMotion();
  const x = useSpring(0, { stiffness: 220, damping: 18 });
  const y = useSpring(0, { stiffness: 220, damping: 18 });
  function move(event) {
    if (!enabled || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.13);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.2);
  }
  return (
    <motion.div
      className="magnetic-wrap"
      style={{ x: enabled ? x : 0, y: enabled ? y : 0 }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
const descriptions = {
  'giuong-pallet-bet': 'Một góc nghỉ thấp, giản dị và gần gũi.',
  'giuong-pallet-hop': 'Đường nét gọn gàng cho không gian của bạn.',
  'giuong-pallet-gap-gon': 'Thêm linh hoạt cho nhịp sống mỗi ngày.',
  'giuong-pallet-gap-lam-ghe-sofa': 'Một thiết kế, nhiều khoảnh khắc tận hưởng.',
  'giuong-pallet-chan-cao': 'Thêm một lựa chọn cho góc nghỉ của bạn.',
  nem: 'Tìm chiếc nệm vừa vặn cùng giường của bạn.',
};
export function CategoryExplorer({ categories }) {
  const [active, setActive] = useState(0);
  const category = categories[active] || categories[0];
  return (
    <div className="category-grid category-explorer">
      <div className="category-rows">
        {categories.map((item, i) => (
          <Link
            key={item._id}
            href={`/san-pham?category=${item.slug}`}
            className={`category-card category-row ${active === i ? 'is-active' : ''}`}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            <span className="category-index">{String(i + 1).padStart(2, '0')}</span>
            <div className="category-mobile-photo">
              {item.image && <Image src={item.image} alt="" width={76} height={62} sizes="76px" />}
            </div>
            <div className="category-row-copy">
              <h3>{item.name}</h3>
              <div className="category-row-description">
                <p>
                  {item.description ||
                    descriptions[item.slug] ||
                    'Khám phá các mẫu giường trong bộ sưu tập.'}
                </p>
              </div>
            </div>
            <span className="category-row-arrow">
              <ArrowUpRight size={22} strokeWidth={1.3} />
            </span>
          </Link>
        ))}
      </div>
      <div className="category-preview">
        <div className="category-preview-images">
          {categories.map(
            (item, i) =>
              item.image && (
                <div
                  key={item._id}
                  className={`category-preview-layer ${active === i ? 'is-active' : ''}`}
                  aria-hidden={active !== i}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 800px) 1px, 45vw"
                  />
                </div>
              ),
          )}
        </div>
        <div className="category-preview-caption">
          <span>ẢNH THỰC TẾ TỪ KIHA</span>
          <Link href={`/san-pham?category=${category.slug}`}>
            Xem các mẫu <ArrowUpRight size={17} />
          </Link>
        </div>
        <span className="category-preview-number" aria-hidden="true">
          {String(active + 1).padStart(2, '0')}
          <small> / {String(categories.length).padStart(2, '0')}</small>
        </span>
      </div>
    </div>
  );
}
