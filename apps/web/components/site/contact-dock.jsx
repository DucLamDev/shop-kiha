'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircleMore, Phone } from 'lucide-react';
import { telHref } from '@/lib/contact';
import { cn } from '@/lib/utils';

// Nút liên hệ nổi: chỉ hiện sau khi cuộn qua phần đầu trang để không che CTA chính.
// Trang chi tiết sản phẩm đã có thanh CTA cố định trên điện thoại nên ẩn dock ở mobile.
export function ContactDock({ settings }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const phoneHref = telHref(settings?.phone);
  const onDetail = /^\/san-pham\/[^/]+/.test(pathname);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!settings?.zaloUrl && !phoneHref) return null;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'fixed right-4 z-30 flex-col items-end gap-2 sm:right-6',
            'bottom-[max(1rem,env(safe-area-inset-bottom))] md:bottom-8',
            onDetail ? 'hidden md:flex' : 'flex',
          )}
        >
          {phoneHref && (
            <a
              href={phoneHref}
              aria-label={`Gọi ${settings.phone}`}
              className="group hidden h-12 items-center gap-2 rounded-full border border-charcoal/10 bg-white pr-2 pl-4 font-display text-sm font-bold text-charcoal shadow-lift transition-colors hover:border-walnut/40 md:inline-flex"
            >
              {settings.phone}
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-walnut group-hover:text-white">
                <Phone className="size-4" />
              </span>
            </a>
          )}
          {settings?.zaloUrl && (
            <a
              href={settings.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat với KIHA qua Zalo"
              className="inline-flex h-13 items-center gap-2 rounded-full bg-primary pr-5 pl-2 font-display text-sm font-bold text-primary-foreground shadow-lift transition-colors hover:bg-walnut-deep"
            >
              <span className="relative flex size-9 items-center justify-center rounded-full bg-white/15">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/20 motion-reduce:hidden" />
                <MessageCircleMore className="size-5" />
              </span>
              Chat Zalo
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
