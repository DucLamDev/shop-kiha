import Image from 'next/image';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { decor } from '@/lib/editorial-assets';

// Đầu trang con: nền cát ấm, tiêu đề nét mảnh, ảnh trang trí bo vòm bên phải.
export function PageIntro({ breadcrumbs, eyebrow, title, description, imageRole, children }) {
  const image = imageRole ? decor(imageRole) : null;
  const titleLines = Array.isArray(title) ? title : [title];
  return (
    <section className="page-intro px-3 pt-4 sm:px-5">
      <div className="mx-auto max-w-[90rem] overflow-hidden rounded-[2rem] rounded-tr-[5rem] bg-sage sm:rounded-tr-[8rem]">
        <div className="container-page grid grid-cols-1 items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.3fr_0.7fr] lg:py-16">
          <div>
            <Breadcrumbs items={breadcrumbs} />
            {eyebrow && <p className="eyebrow kiha-rise mt-8">{eyebrow}</p>}
            <h1
              className="display-title kiha-rise mt-4 text-[2.6rem] sm:text-6xl lg:text-[4rem]"
              style={{ '--delay': '60ms' }}
            >
              {titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
            {description && (
              <p
                className="kiha-rise mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base"
                style={{ '--delay': '120ms' }}
              >
                {description}
              </p>
            )}
            {children && (
              <div className="kiha-rise mt-8" style={{ '--delay': '180ms' }}>
                {children}
              </div>
            )}
          </div>
          {image && (
            <div className="kiha-settle relative hidden aspect-[4/5] max-h-[26rem] overflow-hidden rounded-t-[10rem] rounded-b-[2rem] bg-sand lg:block">
              <Image src={image.src} alt="" fill preload sizes="28vw" className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
