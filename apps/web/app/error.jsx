'use client';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }) {
  return (
    <main id="main-content" className="empty-state error-page">
      <p className="eyebrow">KIHA</p>
      <h1>Chưa thể tải nội dung</h1>
      <p>Kết nối đang gián đoạn. Vui lòng thử lại sau ít phút.</p>
      <Button onClick={() => reset()}>Thử tải lại</Button>
    </main>
  );
}
