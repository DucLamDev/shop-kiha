'use client';
import { useCallback, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1];

export function ProductGallery({ product }) {
  const images = [product.thumbnail, ...product.images.filter((src) => src !== product.thumbnail)];
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const many = images.length > 1;
  const move = useCallback(
    (step) => setIndex((i) => (i + step + images.length) % images.length),
    [images.length],
  );
  const swipe = (_event, info) => {
    if (info.offset.x < -60) move(1);
    else if (info.offset.x > 60) move(-1);
  };

  return (
    <div className="min-w-0">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-[1.75rem] rounded-tr-[4rem] bg-sand">
        <AnimatePresence initial={false}>
          <motion.div
            key={images[index]}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease }}
            drag={many ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={swipe}
          >
            <Image
              src={images[index]}
              alt={`${product.name} — ảnh ${index + 1}`}
              fill
              preload={index === 0}
              sizes="(max-width: 1024px) 94vw, 56vw"
              className="pointer-events-none object-cover select-none"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-4 bottom-4 inline-flex h-10 items-center gap-2 rounded-full bg-white/92 px-4 font-display text-[13px] text-charcoal shadow-sm backdrop-blur transition-colors hover:bg-white"
          aria-label={`Phóng to ảnh ${product.name}`}
        >
          <Expand className="size-4" />
          Phóng to
        </button>
        {many && (
          <>
            <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 font-display text-xs text-walnut backdrop-blur">
              {index + 1} / {images.length}
            </span>
            <GalleryArrow side="left" onClick={() => move(-1)} />
            <GalleryArrow side="right" onClick={() => move(1)} />
          </>
        )}
      </div>
      {many && (
        <ul
          className="scrollbar-none mt-3 flex gap-2.5 overflow-x-auto p-0.5"
          aria-label="Ảnh sản phẩm"
        >
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                aria-pressed={index === i}
                className={cn(
                  'relative block h-16 w-22 overflow-hidden rounded-xl border-2 bg-white transition-[border-color,opacity] sm:h-20 sm:w-26',
                  index === i ? 'border-olive' : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                <Image src={src} alt="" fill sizes="110px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Ảnh do KIHA cung cấp. Kích thước, hoàn thiện và báo giá được xác nhận khi tư vấn.
      </p>
      <Lightbox
        open={open}
        onOpenChange={setOpen}
        images={images}
        index={index}
        move={move}
        name={product.name}
        many={many}
      />
    </div>
  );
}

function GalleryArrow({ side, onClick }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Ảnh trước' : 'Ảnh sau'}
      className={cn(
        'absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm backdrop-blur transition-[opacity,background-color] hover:bg-white md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}

function Lightbox({ open, onOpenChange, images, index, move, name, many }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ivory/97 backdrop-blur data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]"
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') move(-1);
            if (event.key === 'ArrowRight') move(1);
          }}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-walnut sm:px-6">
            <DialogPrimitive.Title className="line-clamp-1 font-display text-sm font-semibold sm:text-base">
              {name}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Ảnh {index + 1} trên {images.length}. Dùng phím mũi tên để chuyển ảnh.
            </DialogPrimitive.Description>
            <div className="flex items-center gap-3">
              {many && (
                <span className="font-display text-sm text-muted-foreground">
                  {index + 1} / {images.length}
                </span>
              )}
              <DialogPrimitive.Close
                className="flex size-10 items-center justify-center rounded-full bg-accent transition-colors hover:bg-sage-strong"
                aria-label="Đóng"
              >
                <X className="size-5" />
              </DialogPrimitive.Close>
            </div>
          </div>
          <div className="relative flex-1">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={images[index]}
                className="absolute inset-3 sm:inset-6"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                drag={many ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_e, info) => {
                  if (info.offset.x < -60) move(1);
                  else if (info.offset.x > 60) move(-1);
                }}
              >
                <Image
                  src={images[index]}
                  alt={`${name} — ảnh ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="pointer-events-none object-contain select-none"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
            {many && (
              <>
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Ảnh trước"
                  className="absolute top-1/2 left-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-walnut transition-colors hover:bg-sage-strong sm:left-6"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Ảnh sau"
                  className="absolute top-1/2 right-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-walnut transition-colors hover:bg-sage-strong sm:right-6"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
