'use client';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CircleCheck,
  CircleDashed,
  Eye,
  FilePen,
  Images,
  Layers,
  Plus,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useResource,
  ResourceState,
  PageHeader,
  Panel,
  formatDate,
} from '@/components/admin/shared';

const contactFields = [
  ['phone', 'Số điện thoại'],
  ['zaloUrl', 'Zalo'],
  ['facebookUrl', 'Facebook'],
  ['tiktokUrl', 'TikTok'],
  ['mapsUrl', 'Google Maps'],
  ['address', 'Địa chỉ'],
];

export function Dashboard() {
  const stats = useResource('/admin/stats');
  const recent = useResource('/admin/products?sort=newest&limit=5');
  const settings = useResource('/admin/settings');
  if (!stats.data || stats.error) return <ResourceState resource={stats} />;
  const d = stats.data;
  const cards = [
    { label: 'Sản phẩm', value: d.products, icon: BedDouble, href: '/admin/san-pham' },
    {
      label: 'Đang hiển thị',
      value: d.published,
      icon: Eye,
      href: '/admin/san-pham?status=published',
    },
    {
      label: 'Bản nháp',
      value: d.products - d.published,
      icon: FilePen,
      href: '/admin/san-pham?status=draft',
    },
    { label: 'Danh mục', value: d.categories, icon: Layers, href: '/admin/danh-muc' },
    { label: 'Ảnh trong thư viện', value: d.media, icon: Images, href: '/admin/hinh-anh' },
  ];
  const configured = settings.data
    ? contactFields.map(([key, label]) => ({ label, ok: Boolean(settings.data[key]) }))
    : [];
  return (
    <>
      <PageHeader
        eyebrow="Quản trị KIHA"
        title="Tổng quan"
        description="Theo dõi bộ sưu tập và cập nhật nội dung hiển thị trên website."
      >
        <Button asChild variant="outline">
          <a href="/" target="_blank" rel="noopener noreferrer">
            Xem website
            <ArrowUpRight />
          </a>
        </Button>
        <Button asChild>
          <Link href="/admin/san-pham/tao-moi">
            <Plus />
            Thêm sản phẩm
          </Link>
        </Button>
      </PageHeader>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <li key={label}>
            <Link href={href} className="group block h-full">
              <Card className="h-full p-5 transition-[transform,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lift">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-walnut">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 font-display text-3xl font-extrabold tracking-tight">{value}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Sản phẩm mới thêm"
          description="5 sản phẩm được tạo gần nhất."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/san-pham">
                Tất cả
                <ArrowRight />
              </Link>
            </Button>
          }
        >
          {!recent.data ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : (
            <ul className="divide-y">
              {recent.data.items.map((p) => (
                <li key={p._id}>
                  <Link
                    href={`/admin/san-pham/${p._id}`}
                    className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-ivory"
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {p.thumbnail && (
                        <Image
                          src={p.thumbnail}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {p.category?.name} · {formatDate(p.createdAt)}
                      </span>
                    </span>
                    <Badge variant={p.status === 'published' ? 'success' : 'muted'}>
                      {p.status === 'published' ? 'Hiển thị' : 'Nháp'}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <div className="grid min-w-0 grid-cols-1 content-start gap-6">
          <Panel
            title="Thông tin liên hệ"
            description="Website chỉ hiện các kênh đã được cấu hình."
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/cai-dat">
                  <Settings />
                  Sửa
                </Link>
              </Button>
            }
          >
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {configured.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  {item.ok ? (
                    <CircleCheck className="size-4 text-success" aria-hidden="true" />
                  ) : (
                    <CircleDashed className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className={item.ok ? '' : 'text-muted-foreground'}>
                    {item.label}
                    <span className="sr-only">{item.ok ? ': đã cấu hình' : ': chưa có'}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Lối tắt">
            <ul className="grid gap-2">
              {[
                ['/admin/danh-muc', 'Sắp xếp danh mục', Layers],
                ['/admin/hinh-anh', 'Thư viện ảnh & video', Images],
                ['/admin/cai-dat', 'Nội dung trang chủ & SEO', Settings],
              ].map(([href, label, Icon]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:border-walnut/30 hover:bg-ivory"
                  >
                    <Icon className="size-4 text-walnut" />
                    {label}
                    <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
