import { ZaloButton, PhoneButton } from '@/components/site/contact-buttons';
import { Reveal } from '@/components/site/reveal';

// Khối kêu gọi tư vấn dùng chung ở cuối trang chủ, danh sách và chi tiết sản phẩm.
export function ContactBand({
  settings,
  eyebrow = 'Tư vấn qua Zalo',
  title = 'Chưa chọn được mẫu giường phù hợp?',
  description = 'Gửi KIHA kích thước phòng, kích thước nệm và mẫu bạn thích. KIHA sẽ tư vấn và báo giá trực tiếp qua Zalo.',
}) {
  return (
    <section className="container-page py-16 sm:py-20" aria-labelledby="contact-band-title">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-walnut-deep px-6 py-12 text-ivory sm:px-12 sm:py-16 lg:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(100deg, transparent 0 26px, rgb(255 255 255 / 0.9) 26px 27px, transparent 27px 58px)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-wood/25 blur-3xl"
          />
          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="eyebrow text-wood">
                <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
                {eyebrow}
              </p>
              <h2
                id="contact-band-title"
                className="mt-4 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-[2.75rem]"
              >
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-[17px] text-ivory/75">{description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <ZaloButton
                settings={settings}
                variant="inverse"
                size="lg"
                arrow
                className="lg:min-w-64"
              />
              <PhoneButton
                settings={settings}
                variant="inverse-outline"
                size="lg"
                className="lg:min-w-64"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
