'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BedDouble,
  Layers,
  Images,
  Settings,
  LogOut,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
const links = [
  ['/admin', 'Tổng quan', LayoutDashboard],
  ['/admin/san-pham', 'Sản phẩm', BedDouble],
  ['/admin/danh-muc', 'Danh mục', Layers],
  ['/admin/hinh-anh', 'Hình ảnh', Images],
  ['/admin/cai-dat', 'Cài đặt website', Settings],
];
export function AdminShell({ admin, children }) {
  const pathname = usePathname(),
    router = useRouter();
  async function logout() {
    try {
      await api('/admin/auth/logout', { method: 'POST' });
      router.replace('/admin/dang-nhap');
      router.refresh();
    } catch {
      toast.error('Chưa thể đăng xuất. Vui lòng thử lại.');
    }
  }
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="wordmark" href="/admin">
          kiha<span>.</span>
        </Link>
        <p className="eyebrow">KHÔNG GIAN QUẢN TRỊ</p>
        <nav aria-label="Quản trị">
          {links.map(([href, title, Icon]) => (
            <Link
              className={
                (href === '/admin' ? pathname === href : pathname.startsWith(href)) ? 'active' : ''
              }
              key={href}
              href={href}
            >
              <Icon size={18} />
              {title}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank">
            Xem website
            <ArrowUpRight size={15} />
          </Link>
          <button onClick={logout}>
            <LogOut size={15} />
            Đăng xuất
          </button>
        </div>
      </aside>
      <div>
        <header className="admin-topbar">
          <span>Nội Thất KIHA / Quản trị website</span>
          <span>{admin.email}</span>
        </header>
        <main id="main-content" className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
