import Image from 'next/image';
import { illustrationCaption } from '@/lib/editorial-assets';
import { ArrowUpRight, MapPin, Phone, MessageCircle } from 'lucide-react';
import { getSettings, pageMeta } from '@/lib/server-api';
import { Breadcrumb } from '@/components/breadcrumb';
import { ContactCTA, PhoneCTA } from '@/components/contact-cta';
export const metadata = pageMeta(
  'Liên hệ với KIHA',
  'Liên hệ Nội Thất KIHA qua Zalo, điện thoại, Facebook hoặc TikTok để được tư vấn giường ngủ pallet.',
  '/lien-he',
);
export default async function Contact() {
  const s = (await getSettings()) || {};
  return (
    <div className="container contact-page">
      <Breadcrumb items={[{ label: 'Liên hệ' }]} />
      <div className="contact-layout">
        <div>
          <p className="eyebrow">CHÚNG MÌNH Ở ĐÂY ĐỂ LẮNG NGHE</p>
          <h1>
            Góc nhà của bạn.
            <br />
            Câu chuyện của
            <br />
            <span>chúng mình.</span>
          </h1>
          <p className="contact-lead">
            Bạn đang tìm một chiếc giường pallet, hay chỉ vừa có một ý tưởng? Cứ nhắn KIHA nhé.
          </p>
          <div className="contact-buttons">
            <ContactCTA settings={s} />
            <PhoneCTA settings={s} />
          </div>
          <div className="contact-information">
            {s.phone && (
              <div>
                <Phone size={20} />
                <span>
                  <small>GỌI CHO KIHA</small>
                  <a href={`tel:${s.phone.replace(/[^+\d]/g, '')}`}>{s.phone}</a>
                </span>
              </div>
            )}
            {s.zaloUrl && (
              <div>
                <MessageCircle size={20} />
                <span>
                  <small>TƯ VẤN QUA ZALO</small>
                  <a href={s.zaloUrl} target="_blank" rel="noopener noreferrer">
                    Bắt đầu trò chuyện
                    <ArrowUpRight size={15} />
                  </a>
                </span>
              </div>
            )}
            {s.mapsUrl && (
              <div>
                <MapPin size={20} />
                <span>
                  <small>GHÉ THĂM KIHA</small>
                  {s.address && <p>{s.address}</p>}
                  <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer">
                    Xem vị trí trên Google Maps
                    <ArrowUpRight size={15} />
                  </a>
                </span>
              </div>
            )}
            {!s.phone && !s.zaloUrl && <p>Thông tin liên hệ đang được KIHA cập nhật.</p>}
          </div>
          <div className="social-links">
            {[
              ['Facebook', s.facebookUrl],
              ['TikTok', s.tiktokUrl],
            ]
              .filter(([, url]) => url)
              .map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer">
                  {name}
                  <ArrowUpRight size={17} />
                </a>
              ))}
          </div>
        </div>
        <div className="contact-photo">
          {(s.aboutImage || s.heroImage) && (
            <Image
              src={s.aboutImage || s.heroImage}
              alt={illustrationCaption(s.aboutImage || s.heroImage) || 'Một góc nội thất KIHA'}
              fill
              sizes="(max-width: 800px) 100vw, 45vw"
            />
          )}
          <div>
            <p>
              Chút mộc.
              <br />
              Chút an yên.
            </p>
            <span>NỘI THẤT KIHA</span>
          </div>
          <span className="contact-image-credit">
            {illustrationCaption(s.aboutImage || s.heroImage)}
          </span>
        </div>
      </div>
    </div>
  );
}
