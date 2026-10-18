import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, MoveUpRight, Plus } from 'lucide-react';
import { getData, getSettings, pageMeta, siteUrl } from '@/lib/server-api';
import { illustrationCaption } from '@/lib/editorial-assets';
import { Button } from '@/components/ui/button';
import { ContactCTA } from '@/components/contact-cta';
import { ProductCard } from '@/components/product-card';
import { Reveal } from '@/components/motion';
import {
  HomeExperience,
  MotionControls,
  Parallax,
  Magnetic,
  CategoryExplorer,
} from '@/components/home-experience';

export async function generateMetadata() {
  const s = await getSettings();
  return {
    ...pageMeta(s?.seoTitle || 'Nội Thất KIHA', s?.seoDescription, '/', s?.heroImage),
    title: { absolute: s?.seoTitle || 'Nội Thất KIHA' },
  };
}
export default async function Home() {
  const [settings, products, categories] = await Promise.all([
    getSettings(),
    getData('/products?featured=true&limit=4'),
    getData('/categories'),
  ]);
  const s = settings || {};
  const title = (s.heroTitle || 'Một chút mộc.\nMột chốn bình yên.').split('\n');
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.shopName,
    url: siteUrl(),
    ...(s.phone ? { telephone: s.phone } : {}),
    sameAs: [s.facebookUrl, s.tiktokUrl, s.zaloUrl].filter(Boolean),
  };
  return (
    <HomeExperience>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, '\\u003c') }}
      />
      <section className="editorial-hero" aria-labelledby="home-title">
        <div className="hero-topline editorial-container">
          <span>
            <span className="status-dot" /> KHÔNG GIAN MỘC. NHỊP SỐNG RIÊNG.
          </span>
          <span>KIHA — THE PALLET EDIT</span>
        </div>
        <div className="hero-heading editorial-container">
          <h1 id="home-title">
            {title.map((line, i) => (
              <span key={i} style={{ '--line-delay': `${i * 140}ms` }}>
                {line}
              </span>
            ))}
          </h1>
          <div className="hero-introduction">
            <p>{s.heroDescription}</p>
            <Magnetic>
              <Button asChild className="editorial-button">
                <Link href="/san-pham">
                  Khám phá bộ sưu tập <ArrowUpRight size={19} />
                </Link>
              </Button>
            </Magnetic>
            <Link
              href={s.zaloUrl || '/lien-he'}
              className="hero-zalo-link"
              target={s.zaloUrl ? '_blank' : undefined}
              rel="noopener noreferrer"
            >
              Tư vấn cùng KIHA <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="hero-frame">
          <div className="hero-visual">
            <Parallax className="hero-parallax" distance={38}>
              {s.heroImage && (
                <Image
                  src={s.heroImage}
                  alt={illustrationCaption(s.heroImage) || 'Không gian giường pallet KIHA'}
                  fill
                  preload
                  sizes="100vw"
                />
              )}
            </Parallax>
          </div>
          <div className="hero-photo-top">
            <span>01 / MỘT GÓC AN YÊN</span>
            <Plus size={21} strokeWidth={1} />
          </div>
          <div className="hero-photo-bottom">
            <p>
              Nắng len qua.
              <br />
              <span>Nhà dịu lại.</span>
            </p>
            <Magnetic>
              <a
                href="#kham-pha"
                className="round-explore"
                aria-label="Khám phá các thiết kế giường pallet"
              >
                <ArrowDown size={26} strokeWidth={1.3} />
              </a>
            </Magnetic>
          </div>
          <div className="living-seal" aria-hidden="true">
            <span>KIHA / SỐNG CHẬM / KIHA / SỐNG CHẬM /</span>
            <Plus size={26} strokeWidth={1} />
          </div>
        </div>
        <div className="hero-caption editorial-container">
          <span>{illustrationCaption(s.heroImage) || 'Bộ sưu tập hình ảnh KIHA'}</span>
          <MotionControls />
        </div>
      </section>
      <div
        className="living-ribbon"
        aria-label="Ít bộn bề. Thêm an yên. Một chút mộc cho mỗi ngày."
      >
        <div className="ribbon-track" aria-hidden="true">
          {[0, 1].map((i) => (
            <div className="ribbon-content" key={i}>
              <span>Ít bộn bề.</span>
              <Plus />
              <span className="ribbon-outline">Thêm an yên.</span>
              <Plus />
              <span>Một chút mộc.</span>
              <Plus />
            </div>
          ))}
        </div>
      </div>
      {categories.length > 0 && (
        <section
          className="editorial-categories editorial-container"
          id="kham-pha"
          aria-labelledby="category-heading"
        >
          <Reveal className="editorial-section-heading">
            <p className="eyebrow">
              <span className="section-index">01 /</span> THIẾT KẾ CHO GÓC NHÀ
            </p>
            <div>
              <h2 id="category-heading">
                Một không gian.
                <br />
                <span>Nhiều cách tận hưởng.</span>
              </h2>
              <p>
                Từ một góc nghỉ nhỏ đến căn phòng của riêng bạn.
                <br />
                Tìm thiết kế hợp với nhịp sống của mình.
              </p>
            </div>
          </Reveal>
          <CategoryExplorer categories={categories} />
        </section>
      )}
      <section className="editorial-collection" id="bo-suu-tap">
        <div className="editorial-container">
          <Reveal className="editorial-section-heading">
            <p className="eyebrow">
              <span className="section-index">02 /</span> BỘ SƯU TẬP KIHA
            </p>
            <div>
              <h2>
                Chọn một chút mộc
                <br />
                <span>cho tổ ấm của bạn.</span>
              </h2>
              <Link className="text-link" href="/san-pham">
                Xem tất cả sản phẩm <ArrowUpRight size={19} />
              </Link>
            </div>
          </Reveal>
          <div className="collection-caption">
            <span>ẢNH SẢN PHẨM TỪ KIHA</span>
            <span>
              Chạm vào một mẫu để xem chi tiết <MoveUpRight size={13} />
            </span>
          </div>
          {products.items.some((p) => p.isDemo) && (
            <p className="demo-note">
              Bản xem trước · Các ảnh tham khảo đang chờ KIHA xác nhận thông tin sản phẩm.
            </p>
          )}
          <div className="product-grid home-products">
            {products.items.map((product, i) => (
              <Reveal key={product._id} delay={(i % 2) * 0.1}>
                <ProductCard product={product} settings={s} />
              </Reveal>
            ))}
          </div>
          {products.items.length === 0 && (
            <div className="empty-state">
              <h3>Bộ sưu tập đang được chuẩn bị</h3>
              <p>Trò chuyện cùng KIHA để xem các mẫu giường hiện có.</p>
              <ContactCTA settings={s} />
            </div>
          )}
        </div>
      </section>
      <section className="editorial-story" id="ve-kiha">
        <div className="editorial-container story-editorial-grid">
          <div className="story-art">
            <div className="story-image-frame">
              <Parallax distance={26}>
                {(s.aboutImage || s.heroImage) && (
                  <Image
                    src={s.aboutImage || s.heroImage}
                    alt={
                      illustrationCaption(s.aboutImage || s.heroImage) ||
                      'Chi tiết không gian nội thất KIHA'
                    }
                    fill
                    sizes="(max-width: 800px) 90vw, 42vw"
                  />
                )}
              </Parallax>
            </div>
            <span className="story-side-note">NHỮNG ĐIỀU GIẢN DỊ, Ở LẠI THẬT LÂU.</span>
            <p className="image-credit">{illustrationCaption(s.aboutImage || s.heroImage)}</p>
          </div>
          <Reveal className="editorial-story-copy">
            <p className="eyebrow">
              <span className="section-index">03 /</span> CÂU CHUYỆN KIHA
            </p>
            <h2>{s.aboutTitle}</h2>
            <div className="story-rule" />
            <p>{s.aboutDescription}</p>
            <p>
              Một không gian không cần quá nhiều.
              <br />
              Chỉ cần những điều thật sự dành cho bạn.
            </p>
            <Link href="/lien-he" className="text-link">
              Làm quen với KIHA <ArrowUpRight size={19} />
            </Link>
            <span className="story-signature" aria-hidden="true">
              a little wood,
              <br />a little peace.
            </span>
          </Reveal>
        </div>
        <span className="story-watermark" aria-hidden="true">
          sống chậm.
        </span>
      </section>
      <section className="editorial-process editorial-container">
        <Reveal className="editorial-section-heading">
          <p className="eyebrow">
            <span className="section-index">04 /</span> CÙNG KIHA BẮT ĐẦU
          </p>
          <div>
            <h2>
              Từ một ý tưởng.
              <br />
              <span>Đến một góc nhà.</span>
            </h2>
            <p>
              Chúng mình ở đây để lắng nghe
              <br />
              và cùng bạn tìm sự vừa vặn.
            </p>
          </div>
        </Reveal>
        <div className="process-grid">
          {s.commitments?.map((item, i) => (
            <Reveal className="process-step" key={i} delay={i * 0.12}>
              <div className="process-number">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <ArrowUpRight size={24} strokeWidth={1} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="editorial-invitation">
        <Parallax distance={32}>
          {s.heroImage && <Image src={s.heroImage} alt="" fill sizes="100vw" />}
        </Parallax>
        <div className="invitation-shade" />
        <Reveal className="invitation-copy">
          <p className="eyebrow">MỘT GÓC NHÀ ĐANG CHỜ BẠN</p>
          <h2>
            Bắt đầu bằng
            <br />
            <span>một lời chào.</span>
          </h2>
          <p>Kể KIHA nghe về không gian bạn đang nghĩ đến.</p>
          <Magnetic>
            <ContactCTA settings={s}>Nhắn KIHA qua Zalo</ContactCTA>
          </Magnetic>
        </Reveal>
        <span className="invitation-credit">{illustrationCaption(s.heroImage)}</span>
      </section>
    </HomeExperience>
  );
}
