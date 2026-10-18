'use client';
import Link from 'next/link';
import { BedDouble, Eye, Images, Layers, Plus, Settings, ArrowUpRight } from 'lucide-react';
import { useResource, ResourceState } from '@/components/admin/shared';
import { Button } from '@/components/ui/button';
export function Dashboard() {
  const resource = useResource('/admin/stats');
  if (!resource.data) return <ResourceState resource={resource} />;
  const d = resource.data;
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">KHÔNG GIAN CỦA BẠN</p>
          <h1>Tổng quan</h1>
          <p>Chăm chút sản phẩm và kết nối với khách hàng.</p>
        </div>
        <Button asChild>
          <Link href="/admin/san-pham/tao-moi">
            <Plus />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>
      <div className="admin-stat-grid">
        {[
          ['Sản phẩm', d.products, BedDouble],
          ['Đang xuất bản', d.published, Eye],
          ['Danh mục', d.categories, Layers],
          ['Ảnh trong thư viện', d.media, Images],
        ].map(([label, value, Icon]) => (
          <div className="admin-stat" key={label}>
            <Icon size={22} />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="admin-panel">
        <h2>Tiếp tục công việc</h2>
        <div className="admin-quicklinks">
          <Link href="/admin/san-pham">
            <BedDouble size={23} />
            <strong>Chăm chút bộ sưu tập</strong>
            <span>Sửa nội dung, chọn ảnh và xuất bản sản phẩm.</span>
          </Link>
          <Link href="/admin/hinh-anh">
            <Images size={23} />
            <strong>Khám phá thư viện ảnh</strong>
            <span>Tất cả ảnh KIHA đã quét, kèm kích thước và định dạng.</span>
          </Link>
          <Link href="/admin/cai-dat">
            <Settings size={23} />
            <strong>Cập nhật website</strong>
            <span>Thông tin liên hệ, nội dung trang chủ và SEO.</span>
          </Link>
        </div>
      </div>
      <div className="admin-panel">
        <h2>Trước khi xuất bản chính thức</h2>
        <p className="muted text-xs leading-7">
          Xác nhận tên sản phẩm, danh mục, kích thước, giá và hình ảnh. Các bản ghi có nhãn “Ảnh
          tham khảo” chỉ phục vụ duyệt nội dung local và không xuất hiện ở môi trường production.
          Sau khi xác nhận dữ liệu thật, bỏ chọn “Dữ liệu tham khảo” trong sản phẩm.
        </p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/" target="_blank">
            Xem website hiện tại
            <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </>
  );
}
