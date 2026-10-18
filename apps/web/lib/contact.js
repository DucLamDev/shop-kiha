// Mọi kênh liên hệ lấy từ cấu hình website (MongoDB, sửa tại /admin/cai-dat).
// Component chỉ gọi các hàm này, không tự ghép link ở nhiều nơi.
export function telHref(phone) {
  const digits = phone?.replace(/[^+\d]/g, '');
  return digits ? `tel:${digits}` : '';
}

// Tên hiển thị lấy từ chính đường dẫn đã cấu hình (vd. @noithatkiha), không tự đặt tên tài khoản.
function handle(url, fallback) {
  try {
    const first = new URL(url).pathname.split('/').filter(Boolean)[0];
    return first ? decodeURIComponent(first) : fallback;
  } catch {
    return fallback;
  }
}

export function contactChannels(settings) {
  const s = settings || {};
  return [
    { key: 'zalo', label: 'Zalo', value: 'Nhắn tin tư vấn', href: s.zaloUrl, external: true },
    { key: 'phone', label: 'Điện thoại', value: s.phone, href: telHref(s.phone), external: false },
    {
      key: 'facebook',
      label: 'Facebook',
      value: handle(s.facebookUrl, 'Trang Facebook'),
      href: s.facebookUrl,
      external: true,
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      value: handle(s.tiktokUrl, 'Kênh TikTok'),
      href: s.tiktokUrl,
      external: true,
    },
    {
      key: 'maps',
      label: 'Google Maps',
      value: s.address || 'Xem vị trí cửa hàng',
      href: s.mapsUrl,
      external: true,
    },
  ];
}
