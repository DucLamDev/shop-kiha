'use client';
import Link from 'next/link';
import { RotateCcw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/site/empty-state';
export default function StoreError({ reset }) {
  return (
    <div className="container-page py-16 sm:py-24">
      <EmptyState
        as="h1"
        icon={WifiOff}
        title="Chưa thể tải nội dung"
        description="Kết nối tới hệ thống KIHA đang gián đoạn. Vui lòng thử lại sau ít phút hoặc liên hệ trực tiếp với KIHA."
      >
        <Button onClick={() => reset()}>
          <RotateCcw />
          Thử tải lại
        </Button>
        <Button asChild variant="outline">
          <Link href="/lien-he">Thông tin liên hệ</Link>
        </Button>
      </EmptyState>
    </div>
  );
}
