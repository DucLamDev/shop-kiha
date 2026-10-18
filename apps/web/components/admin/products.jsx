'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BedDouble, ExternalLink, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toProductInput } from '@/lib/product-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useResource,
  ResourceState,
  DeleteDialog,
  Pager,
  PageHeader,
  SearchBox,
  NativeSelect,
  EmptyRows,
  mutationError,
  formatDate,
} from '@/components/admin/shared';

const statuses = [
  ['', 'Tất cả trạng thái'],
  ['published', 'Đang hiển thị'],
  ['draft', 'Bản nháp'],
];

export function AdminProducts({ initialStatus = '' }) {
  const [page, setPage] = useState(1),
    [query, setQuery] = useState(''),
    [draft, setDraft] = useState(''),
    [status, setStatus] = useState(initialStatus),
    [category, setCategory] = useState(''),
    [deleted, setDeleted] = useState(null),
    [saving, setSaving] = useState({});
  const params = new URLSearchParams({ limit: '12', page: String(page), sort: 'newest' });
  if (query) params.set('q', query);
  if (status) params.set('status', status);
  if (category) params.set('category', category);
  const resource = useResource(`/admin/products?${params}`);
  const categories = useResource('/admin/categories');

  async function remove(item) {
    await api(`/admin/products/${item._id}`, { method: 'DELETE' });
    if (resource.data.items.length === 1 && page > 1) setPage(page - 1);
    else resource.refresh();
  }

  // Bật/tắt nhanh từ bảng: gửi lại toàn bộ dữ liệu sản phẩm để backend validate như form sửa.
  async function patch(item, changes, message) {
    setSaving((s) => ({ ...s, [item._id]: true }));
    try {
      await api(`/admin/products/${item._id}`, {
        method: 'PUT',
        body: toProductInput({ ...item, ...changes }),
      });
      toast.success(message);
      resource.refresh();
    } catch (err) {
      mutationError(err);
      toast.error(err.message);
    } finally {
      setSaving((s) => ({ ...s, [item._id]: false }));
    }
  }

  const filters = (
    <div className="mb-4 grid gap-3 md:grid-cols-[1fr_12rem_14rem]">
      <SearchBox
        value={draft}
        onChange={setDraft}
        onSubmit={() => {
          setQuery(draft.trim());
          setPage(1);
        }}
        label="Tìm sản phẩm"
        placeholder="Tìm theo tên sản phẩm…"
      />
      <NativeSelect
        aria-label="Lọc theo trạng thái"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
      >
        {statuses.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect
        aria-label="Lọc theo danh mục"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setPage(1);
        }}
      >
        <option value="">Tất cả danh mục</option>
        {categories.data?.map((c) => (
          <option key={c._id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </NativeSelect>
    </div>
  );

  return (
    <>
      <PageHeader title="Sản phẩm" description="Quản lý nội dung, hình ảnh và trạng thái hiển thị.">
        <Button asChild>
          <Link href="/admin/san-pham/tao-moi">
            <Plus />
            Thêm sản phẩm
          </Link>
        </Button>
      </PageHeader>
      {filters}
      {!resource.data || resource.error ? (
        <ResourceState resource={resource} rows={6} />
      ) : (
        <Card className="overflow-hidden">
          {resource.data.total === 0 ? (
            <EmptyRows
              icon={BedDouble}
              title="Không có sản phẩm phù hợp"
              description="Thử bỏ bộ lọc hoặc tạo sản phẩm mới."
            >
              <Button asChild size="sm">
                <Link href="/admin/san-pham/tao-moi">
                  <Plus />
                  Thêm sản phẩm
                </Link>
              </Button>
            </EmptyRows>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="hidden lg:table-cell">Danh mục</TableHead>
                      <TableHead>Hiển thị</TableHead>
                      <TableHead>Nổi bật</TableHead>
                      <TableHead className="hidden xl:table-cell">Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resource.data.items.map((p) => (
                      <TableRow key={p._id} className={cn(saving[p._id] && 'opacity-60')}>
                        <TableCell>
                          <ProductCell product={p} />
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          {p.category?.name || '—'}
                        </TableCell>
                        <TableCell>
                          <StatusSwitch product={p} busy={saving[p._id]} onPatch={patch} />
                        </TableCell>
                        <TableCell>
                          <FeaturedToggle product={p} busy={saving[p._id]} onPatch={patch} />
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-muted-foreground xl:table-cell">
                          {formatDate(p.createdAt, false)}
                        </TableCell>
                        <TableCell>
                          <RowActions product={p} onDelete={() => setDeleted(p)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ul className="divide-y md:hidden">
                {resource.data.items.map((p) => (
                  <li key={p._id} className={cn('grid gap-3 p-4', saving[p._id] && 'opacity-60')}>
                    <ProductCell product={p} />
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <StatusSwitch product={p} busy={saving[p._id]} onPatch={patch} />
                        <FeaturedToggle product={p} busy={saving[p._id]} onPatch={patch} />
                      </div>
                      <RowActions product={p} onDelete={() => setDeleted(p)} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="border-t px-4 py-3">
            <Pager
              page={page}
              pages={resource.data.pages}
              total={resource.data.total}
              label="sản phẩm"
              onChange={setPage}
            />
          </div>
        </Card>
      )}
      <DeleteDialog
        key={deleted?._id || 'none'}
        item={deleted}
        onClose={() => setDeleted(null)}
        onDelete={remove}
        description="Sản phẩm sẽ bị xóa khỏi website và trang quản trị. Ảnh gốc và video trong thư viện vẫn được giữ nguyên."
      />
    </>
  );
}

function ProductCell({ product: p }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {p.thumbnail && (
          <Image src={p.thumbnail} alt="" fill sizes="64px" className="object-cover" />
        )}
      </span>
      <div className="min-w-0">
        <Link
          href={`/admin/san-pham/${p._id}`}
          className="line-clamp-2 text-sm font-semibold hover:text-walnut"
        >
          {p.name}
        </Link>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="truncate">/{p.slug}</span>
          {p.isDemo && <Badge variant="muted">Tham khảo</Badge>}
        </p>
      </div>
    </div>
  );
}

function StatusSwitch({ product: p, busy, onPatch }) {
  const published = p.status === 'published';
  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
      <Switch
        checked={published}
        disabled={busy}
        aria-label={`Hiển thị ${p.name} trên website`}
        onCheckedChange={(checked) =>
          onPatch(
            p,
            { status: checked ? 'published' : 'draft' },
            checked ? 'Đã hiển thị sản phẩm trên website.' : 'Đã chuyển sản phẩm về bản nháp.',
          )
        }
      />
      <span className={published ? 'text-success' : 'text-muted-foreground'}>
        {published ? 'Hiển thị' : 'Nháp'}
      </span>
    </label>
  );
}

function FeaturedToggle({ product: p, busy, onPatch }) {
  return (
    <button
      type="button"
      disabled={busy}
      aria-pressed={p.isFeatured}
      aria-label={p.isFeatured ? `Bỏ nổi bật ${p.name}` : `Đánh dấu nổi bật ${p.name}`}
      title={p.isFeatured ? 'Bỏ khỏi sản phẩm nổi bật' : 'Đưa vào sản phẩm nổi bật'}
      onClick={() =>
        onPatch(
          p,
          { isFeatured: !p.isFeatured },
          p.isFeatured ? 'Đã bỏ khỏi sản phẩm nổi bật.' : 'Đã thêm vào sản phẩm nổi bật.',
        )
      }
      className={cn(
        'flex size-9 items-center justify-center rounded-full transition-colors hover:bg-secondary disabled:opacity-50',
        p.isFeatured ? 'text-gold' : 'text-muted-foreground/60',
      )}
    >
      <Star className="size-4.5" fill={p.isFeatured ? 'currentColor' : 'none'} />
    </button>
  );
}

function RowActions({ product: p, onDelete }) {
  return (
    <div className="flex justify-end gap-1">
      {p.status === 'published' && (
        <Button asChild variant="ghost" size="icon-sm">
          <a
            href={`/san-pham/${p.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Xem ${p.name} trên website`}
            title="Xem trên website"
          >
            <ExternalLink />
          </a>
        </Button>
      )}
      <Button asChild variant="ghost" size="icon-sm">
        <Link href={`/admin/san-pham/${p._id}`} aria-label={`Sửa ${p.name}`} title="Sửa">
          <Pencil />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label={`Xóa ${p.name}`}
        title="Xóa"
        className="hover:bg-[#fdf3f2] hover:text-destructive"
      >
        <Trash2 />
      </Button>
    </div>
  );
}
