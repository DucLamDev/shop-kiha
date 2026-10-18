import Link from 'next/link';
import { ArrowLeft, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <Leaf size={45} strokeWidth={1} />
      <p className="eyebrow">404 · LẠC MỘT CHÚT THÔI</p>
      <h1>
        Góc nhỏ này
        <br />
        chưa có ở KIHA.
      </h1>
      <p>Trang có thể đã được chuyển đi hoặc sản phẩm không còn hiển thị.</p>
      <Button asChild>
        <Link href="/san-pham">
          <ArrowLeft />
          Về bộ sưu tập
        </Link>
      </Button>
    </main>
  );
}
