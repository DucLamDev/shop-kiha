'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import { contactChannels } from '@/lib/contact';
import { SocialIcon } from '@/components/site/social-icon';
import { cn } from '@/lib/utils';

function PhoneContact({ phone, href }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  const panelId = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false);
    };
    const dismissEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('focusin', dismissOutside);
    document.addEventListener('keydown', dismissEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('focusin', dismissOutside);
      document.removeEventListener('keydown', dismissEscape);
    };
  }, [open]);

  return (
    <div ref={container} className="contact-dock-phone">
      <button
        ref={trigger}
        type="button"
        aria-label="Hiện số điện thoại KIHA"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="contact-dock-link"
        style={{ '--contact-delay': '0s' }}
      >
        <span className="contact-dock-icon">
          <SocialIcon channel="phone" className="size-6" />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-label="Số điện thoại KIHA"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="contact-phone-panel"
          >
            <span className="contact-phone-caption">Gọi KIHA để được tư vấn</span>
            <a href={href} aria-label={`Gọi ${phone}`} className="contact-phone-number">
              {phone}
              <ArrowUpRight aria-hidden="true" className="size-5" />
            </a>
            <button
              type="button"
              aria-label="Đóng số điện thoại"
              className="contact-phone-close"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Nút liên hệ nổi: chỉ hiện sau khi cuộn qua phần đầu trang để không che CTA chính.
// Trang chi tiết sản phẩm đã có thanh CTA cố định trên điện thoại nên ẩn dock ở mobile.
export function ContactDock({ settings }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const ariaLabels = {
    zalo: 'Chat với KIHA qua Zalo',
    facebook: 'Ghé Facebook KIHA',
    tiktok: 'Ghé TikTok KIHA',
  };
  const channels = contactChannels(settings)
    .filter((channel) => channel.href && channel.key !== 'maps')
    .sort(
      (a, b) =>
        ['phone', 'facebook', 'tiktok', 'zalo'].indexOf(a.key) -
        ['phone', 'facebook', 'tiktok', 'zalo'].indexOf(b.key),
    );
  const onDetail = /^\/san-pham\/[^/]+/.test(pathname);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector('[data-hero-carousel]');
      setVisible(hero ? hero.getBoundingClientRect().bottom < 100 : window.scrollY > 180);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  if (!channels.length) return null;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          role="navigation"
          aria-label="Liên hệ nhanh"
          className={cn('contact-dock', onDetail && 'contact-dock-detail')}
        >
          {channels.map((channel, index) =>
            channel.key === 'phone' ? (
              <PhoneContact key={`${pathname}-phone`} phone={settings.phone} href={channel.href} />
            ) : (
              <a
                key={channel.key}
                href={channel.href}
                {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                aria-label={ariaLabels[channel.key]}
                className={cn(
                  'contact-dock-link',
                  channel.key === 'zalo' && 'contact-dock-primary',
                )}
                style={{ '--contact-delay': `${index * 0.55}s` }}
              >
                <span className="contact-dock-icon">
                  <SocialIcon channel={channel.key} className="size-8" />
                </span>
              </a>
            ),
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
