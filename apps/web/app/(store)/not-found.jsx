import Link from 'next/link';
import { ArrowLeft, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/site/empty-state';
export default function StoreNotFound() {
  return (
    <div className="container-page py-16 sm:py-24">
      <EmptyState
        as="h1"
        icon={BedDouble}
        title="Không tìm thấy sản phẩm"
        description="Sản phẩm có thể đã được đổi tên, tạm ẩn hoặc không còn kinh doanh. Mời bạn xem các mẫu khác của KIHA."
      >
        <Button asChild>
          <Link href="/san-pham">
            <ArrowLeft />
            Về danh sách sản phẩm
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/lien-he">Liên hệ KIHA</Link>
        </Button>
      </EmptyState>
    </div>
  );
}
