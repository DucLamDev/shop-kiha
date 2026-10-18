'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
export function Gallery({ product }) {
  const images = [product.thumbnail, ...product.images.filter((src) => src !== product.thumbnail)];
  const [index, setIndex] = useState(0);
  const move = (n) => setIndex((i) => (i + n + images.length) % images.length);
  return (
    <div className="gallery">
      <Dialog>
        <DialogTrigger asChild>
          <button className="gallery-main" aria-label={`Phóng to ảnh ${product.name}`}>
            <Image
              src={images[index]}
              alt={`${product.name} — ảnh ${index + 1}`}
              fill
              sizes="(max-width: 800px) 95vw, 55vw"
              preload
            />
            <span>
              <ZoomIn size={18} />
              Phóng to ảnh
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="lightbox">
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Ảnh {index + 1} / {images.length}. Sử dụng các nút để chuyển ảnh.
          </DialogDescription>
          <div className="lightbox-image">
            <Image
              src={images[index]}
              alt={product.name}
              fill
              sizes="95vw"
              style={{ objectFit: 'contain' }}
            />
          </div>
          {images.length > 1 && (
            <div className="gallery-controls">
              <Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Ảnh trước">
                <ChevronLeft />
              </Button>
              <span>
                {index + 1} / {images.length}
              </span>
              <Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Ảnh sau">
                <ChevronRight />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((src, i) => (
            <button
              key={src}
              className={index === i ? 'selected' : ''}
              onClick={() => setIndex(i)}
              aria-label={`Xem ảnh ${i + 1}`}
              aria-pressed={index === i}
            >
              <Image src={src} alt="" fill sizes="100px" />
            </button>
          ))}
        </div>
      )}
      <p className="image-note">
        Ảnh do KIHA cung cấp. Vui lòng xác nhận báo giá hiện tại khi tư vấn.
      </p>
    </div>
  );
}
export function CopyProduct({ name }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`Mình muốn tư vấn ${name}: ${window.location.href}`);
      setCopied(true);
      toast.success('Đã sao chép. Bạn có thể dán nội dung vào Zalo.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Không thể sao chép. Bạn có thể sao chép đường dẫn trên thanh địa chỉ.');
    }
  }
  return (
    <button className="copy-product" onClick={copy}>
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? 'Đã sao chép' : 'Sao chép thông tin để gửi Zalo'}
    </button>
  );
}
