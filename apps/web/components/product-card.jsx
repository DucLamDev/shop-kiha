import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { priceText } from '@/lib/utils';
export function ProductCard({ product, settings }) {
  return (
    <article className="product-card">
      <Link href={`/san-pham/${product.slug}`} className="product-image">
        <Image
          src={product.thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 620px) 90vw, (max-width: 1000px) 45vw, 30vw"
        />
        <span className="product-badge">
          {product.isDemo
            ? 'Ảnh tham khảo'
            : product.isFeatured
              ? 'KIHA tuyển chọn'
              : product.category?.name}
        </span>
        <span className="product-open" aria-hidden="true">
          <ArrowUpRight size={21} />
        </span>
      </Link>
      <div className="product-card-body">
        <p className="product-category">{product.category?.name || 'KIHA COLLECTION'}</p>
        <Link href={`/san-pham/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <p className="product-short">{product.shortDescription}</p>
        <div className="product-card-bottom">
          <span>{priceText(product)}</span>
          {settings?.zaloUrl && (
            <a
              href={settings.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Tư vấn ${product.name} qua Zalo`}
            >
              <MessageCircle size={15} />
              <span>Tư vấn</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
