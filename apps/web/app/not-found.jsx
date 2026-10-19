import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
export const metadata = { title: 'Không tìm thấy trang', robots: { index: false } };
export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center px-6 text-center"
    >
      <Link href="/" className="font-display text-4xl font-extrabold tracking-[-0.06em]">
        kiha<span className="text-wood">.</span>
      </Link>
      <p className="mt-10 font-display text-7xl font-extrabold tracking-tight text-wood-soft">
        404
      </p>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Không tìm thấy trang</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Đường dẫn có thể đã thay đổi hoặc trang không còn tồn tại.
      </p>
      <Button asChild className="mt-6">
        <Link href="/san-pham">
          <ArrowLeft />
          Xem sản phẩm KIHA
        </Link>
      </Button>
    </main>
  );
}
