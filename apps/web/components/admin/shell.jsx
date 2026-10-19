'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  BedDouble,
  Images,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Brand } from '@/components/site/brand';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const links = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/san-pham', label: 'Sản phẩm', icon: BedDouble },
  { href: '/admin/danh-muc', label: 'Danh mục', icon: Layers },
  { href: '/admin/hinh-anh', label: 'Ảnh & video', icon: Images },
  { href: '/admin/cai-dat', label: 'Cài đặt website', icon: Settings },
];

function isActive(pathname, href) {
  return href === '/admin' ? pathname === href : pathname.startsWith(href);
}

function SidebarNav({ pathname, onNavigate }) {
  return (
    <nav aria-label="Quản trị" className="grid gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-display text-sm font-semibold transition-colors',
              active
                ? 'bg-white text-walnut shadow-soft'
                : 'text-charcoal/70 hover:bg-white/60 hover:text-walnut',
            )}
          >
            {active && (
              <span
                className="absolute top-2 bottom-2 left-0 w-1 rounded-full bg-olive-light"
                aria-hidden="true"
              />
            )}
            <Icon className="size-4.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ admin, pathname, onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col border-r border-walnut/10 bg-sage px-4 py-6 text-charcoal">
      <div className="px-3" onClickCapture={onNavigate}>
        <Brand href="/admin" />
        <span className="mt-2 block text-[11px] tracking-[0.16em] text-olive uppercase">
          Quản trị website
        </span>
      </div>
      <div className="mt-10">
        <SidebarNav pathname={pathname} onNavigate={onNavigate} />
      </div>
      <div className="mt-auto grid gap-1 border-t border-walnut/10 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-charcoal/70 transition-colors hover:bg-white/60 hover:text-walnut"
        >
          Xem website
          <ArrowUpRight className="size-4" />
        </a>
        <div className="px-3 pt-3 pb-1">
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Đăng nhập với</p>
          <p className="truncate text-sm text-charcoal" title={admin.email}>
            {admin.email}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-charcoal/70 transition-colors hover:bg-white/60 hover:text-walnut"
        >
          <LogOut className="size-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ admin, children }) {
  const pathname = usePathname(),
    router = useRouter();
  const [open, setOpen] = useState(false);
  const current = links.find((l) => isActive(pathname, l.href));
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
    <div className="min-h-dvh bg-ivory lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh lg:block">
        <SidebarContent admin={admin} pathname={pathname} onLogout={logout} />
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-ivory/90 px-4 backdrop-blur-md sm:px-6 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex size-10 items-center justify-center rounded-full border bg-white"
                aria-label="Mở menu quản trị"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="border-0 p-0 [&>button]:text-charcoal/70 [&>button:hover]:bg-white/60"
            >
              <SheetTitle className="sr-only">Menu quản trị</SheetTitle>
              <SheetDescription className="sr-only">
                Điều hướng các trang quản trị KIHA
              </SheetDescription>
              <SidebarContent
                admin={admin}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
                onLogout={logout}
              />
            </SheetContent>
          </Sheet>
          <span className="font-display text-base font-bold">{current?.label || 'Quản trị'}</span>
        </header>
        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
