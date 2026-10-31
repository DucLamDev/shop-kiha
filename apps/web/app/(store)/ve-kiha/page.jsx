import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, Feather, MessageCircle, Ruler, Sofa } from 'lucide-react';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { ContactBand } from '@/components/site/contact-band';
import { ZaloButton } from '@/components/site/contact-buttons';
import { Reveal } from '@/components/site/reveal';
import { Button } from '@/components/ui/button';
import { decor } from '@/lib/editorial-assets';
import { getSettings, pageMeta } from '@/lib/server-api';
import { pad } from '@/lib/utils';
import styles from './page.module.css';

const storyImage = decor('story');
const detailImage = decor('detail');
const measuringImage = decor('measuring');

export const metadata = pageMeta(
  'Về KIHA',
  'Khám phá Nội Thất KIHA và những chiếc giường ngủ pallet mộc mạc, linh hoạt. Cùng tìm một góc nghỉ vừa vặn với không gian và nhịp sống của bạn.',
  '/ve-kiha',
  storyImage.src,
);

const values = [
  {
    title: 'Mộc mạc, mà có nét riêng.',
    description:
      'Sắc gỗ ấm, một chiếc nệm êm và những món đồ bạn yêu thích. Góc nghỉ có thể bắt đầu từ những điều rất giản dị.',
  },
  {
    title: 'Một chiếc giường, nhiều cách sống.',
    description:
      'Từ giường pallet bệt, pallet hộp đến các mẫu gấp gọn và gấp làm ghế sofa — bạn có thể chọn theo cách mình sử dụng căn phòng.',
  },
  {
    title: 'Lắng nghe trước khi gợi ý.',
    description:
      'Kích thước nệm, diện tích phòng và nhu cầu mỗi ngày là điểm bắt đầu để KIHA cùng bạn chọn mẫu giường phù hợp.',
  },
];

const steps = [
  {
    icon: MessageCircle,
    title: 'Kể KIHA nghe về góc phòng của bạn',
    description: 'Gửi ảnh căn phòng, kích thước nệm hoặc mẫu giường bạn đang quan tâm qua Zalo.',
  },
  {
    icon: Ruler,
    title: 'Cùng chọn mẫu và kích thước',
    description:
      'Trao đổi về kiểu giường, cách sử dụng và khoảng trống bạn muốn dành cho sinh hoạt.',
  },
  {
    icon: Sofa,
    title: 'Thống nhất trước khi đặt',
    description: 'Hỏi rõ giá, thông tin sản phẩm và phương án giao hàng để chọn thật yên tâm.',
  },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <section aria-labelledby="about-page-title" className={styles.hero}>
        <div className="container-page">
          <Breadcrumbs items={[{ label: 'Về KIHA' }]} />
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className="eyebrow kiha-rise">
                <Feather aria-hidden="true" className="size-4" strokeWidth={1.4} />
                Về Nội Thất KIHA
              </p>
              <h1
                id="about-page-title"
                className="display-title kiha-rise mt-6 text-[2.75rem] sm:text-6xl xl:text-[4.5rem]"
                style={{ '--delay': '60ms' }}
              >
                Một góc mộc.
                <br />
                Một nơi để
                <br />
                <span className="text-olive-light">trở về.</span>
              </h1>
              <p
                className="kiha-rise mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-base"
                style={{ '--delay': '120ms' }}
              >
                KIHA mang những chiếc giường ngủ pallet vào không gian sống của bạn. Giản dị trong
                hình dáng, ấm áp trong cảm giác — để mỗi ngày trở về đều có một góc nghỉ của riêng
                mình.
              </p>
              <div className="kiha-rise mt-8 flex flex-wrap gap-3" style={{ '--delay': '180ms' }}>
                <Button asChild size="lg">
                  <Link href="/san-pham">
                    Khám phá giường KIHA <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#cau-chuyen">
                    Câu chuyện của mình <ArrowDown aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
            <div className={`${styles.collage} kiha-settle`}>
              <div className={styles.heroPhoto}>
                <Image
                  src={storyImage.src}
                  alt="Giường pallet và góc phòng ngập nắng với chăn mềm, đèn mây và sắc gỗ ấm"
                  fill
                  preload
                  sizes="(max-width: 640px) 82vw, (max-width: 1024px) 70vw, 42vw"
                  className="object-cover"
                />
              </div>
              <figure className={styles.detailPhoto}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={detailImage.src}
                    alt="Vân gỗ pallet bên lớp chăn linen"
                    fill
                    sizes="(max-width: 640px) 36vw, 200px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="pt-3 text-center font-display text-xs text-walnut sm:text-sm">
                  Đẹp từ điều giản dị.
                </figcaption>
              </figure>
              <span className={styles.seal} aria-hidden="true">
                <span>MỘT GÓC MỘC</span>
                <Feather className="size-7" strokeWidth={1.2} />
                <span>MỘT CHÚT AN YÊN</span>
              </span>
              <p className={styles.photoNote}>Gỗ ấm. Nắng dịu. Một chút bình yên.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="cau-chuyen" aria-labelledby="kiha-story-title" className={styles.story}>
        <div className="container-page grid items-center gap-10 lg:grid-cols-[0.9fr_1fr] lg:gap-20">
          <Reveal className="relative">
            <div className={styles.storyPhoto}>
              <Image
                src={settings.aboutImage || storyImage.src}
                alt="Chi tiết chất liệu gỗ và vải trong một góc nghỉ mang tinh thần mộc mạc của KIHA"
                fill
                sizes="(max-width: 1024px) 92vw, 42vw"
                className="object-cover"
              />
            </div>
            <div className={styles.storyCaption}>
              <Feather aria-hidden="true" className="size-6 shrink-0" strokeWidth={1.3} />
              <p className="font-display text-lg leading-snug sm:text-xl">
                Một chiếc giường.
                <br />
                Bắt đầu một góc thân quen.
              </p>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow">Tinh thần KIHA</p>
              <h2
                id="kiha-story-title"
                className="display-title mt-4 text-[2.5rem] whitespace-pre-line sm:text-5xl"
              >
                {settings.aboutTitle || 'Nhà là nơi\nta được là mình.'}
              </h2>
              <p className="prose-kiha mt-5 text-[15px] sm:text-base">
                {settings.aboutDescription ||
                  'Bắt đầu từ một chiếc giường pallet, KIHA cùng bạn tìm một góc nhỏ thân quen giữa những điều giản dị mỗi ngày.'}
              </p>
            </Reveal>
            <ol className="mt-8">
              {values.map((value, index) => (
                <li key={value.title} className="border-t border-walnut/15">
                  <Reveal delay={index * 0.06} className="flex gap-5 py-5">
                    <span className="pt-1 font-display text-sm text-olive-light">
                      {pad(index + 1)}
                    </span>
                    <div>
                      <h3 className="font-display text-lg text-walnut">{value.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="kiha-guide-title" className="container-page pt-16 sm:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow">Từ lời chào đến góc nghỉ của bạn</p>
              <h2 id="kiha-guide-title" className="display-title mt-4 text-[2.5rem] sm:text-5xl">
                Chọn giường,
                <br />
                mình cùng chọn.
              </h2>
              <p className="mt-5 max-w-lg text-[15px] text-muted-foreground sm:text-base">
                Bạn chưa cần biết chính xác mình muốn mẫu nào. Một vài chia sẻ về căn phòng đã đủ để
                bắt đầu cuộc trò chuyện.
              </p>
            </Reveal>
            <ol className="mt-8 space-y-6">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <Reveal delay={index * 0.06} className="flex gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-wood/40 bg-sand/60 text-walnut">
                      <step.icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-display text-base leading-snug text-walnut sm:text-lg">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
            <Reveal className="mt-8">
              <ZaloButton settings={settings} size="lg" arrow>
                Trò chuyện cùng KIHA
              </ZaloButton>
            </Reveal>
          </div>
          <Reveal className={styles.guidePhoto}>
            <Image
              src={measuringImage.src}
              alt="Thước dây và sổ ghi chú bên giường pallet, gợi ý chuẩn bị kích thước trước khi chọn giường"
              fill
              sizes="(max-width: 1024px) 92vw, 42vw"
              className="object-cover"
            />
            <div className={styles.guideNote}>
              <Ruler aria-hidden="true" className="size-5 text-walnut" strokeWidth={1.5} />
              <p className="font-display text-base text-walnut">Vừa với phòng. Hợp với bạn.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <ContactBand
        settings={settings}
        eyebrow="KIHA ở đây, sẵn sàng lắng nghe"
        title={['Góc nhỏ của bạn,', 'bắt đầu từ đây.']}
        description="Khám phá những mẫu giường pallet hoặc nhắn KIHA điều bạn đang tìm kiếm. Mình cùng chọn một chiếc giường để mỗi lần trở về thêm dễ chịu."
      />
    </>
  );
}
