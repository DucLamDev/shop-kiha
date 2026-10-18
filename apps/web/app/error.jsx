'use client';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }) {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center px-6 text-center"
    >
      <p className="eyebrow">KIHA</p>
      <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Chưa thể tải nội dung</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Kết nối đang gián đoạn. Vui lòng thử lại sau ít phút.
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        <RotateCcw />
        Thử tải lại
      </Button>
    </main>
  );
}
