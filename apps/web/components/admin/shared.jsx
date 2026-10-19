'use client';
import { cloneElement, useEffect, useId, useState } from 'react';
import Image from 'next/image';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ImageOff,
  ImagePlus,
  RotateCcw,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, fieldBase } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function useResource(path, revision = 0) {
  const [data, setData] = useState(null),
    [error, setError] = useState(null),
    [version, setVersion] = useState(0),
    [loading, setLoading] = useState(Boolean(path));
  useEffect(() => {
    if (!path) return;
    let live = true;
    api(path)
      .then((result) => {
        if (live) {
          setData(result);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (live) {
          setError(err);
          setLoading(false);
          if (err.status === 401) window.location.assign('/admin/dang-nhap');
        }
      });
    return () => {
      live = false;
    };
  }, [path, version, revision]);
  return {
    data,
    error,
    loading,
    refresh: () => {
      setLoading(true);
      setVersion((v) => v + 1);
    },
  };
}

// Lỗi Zod từ API trả về dạng [{ path, message }] → { path: message } để hiện dưới từng ô.
export function fieldErrors(error) {
  return Object.fromEntries((error?.fields || []).map((f) => [f.path, f.message]));
}

export function Field({ label, hint, error, children, className = '', required = false }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');
  return (
    <div className={cn('grid content-start gap-2', className)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {cloneElement(children, {
        id,
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        ...(error ? { 'aria-invalid': true } : {}),
      })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[13px] text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[13px] font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function NativeSelect({ className, children, ...props }) {
  return (
    <div className="relative">
      <select className={cn(fieldBase, 'h-11 appearance-none pr-10', className)} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

export function FormError({ error, className }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-xl border border-destructive/25 bg-[#fdf3f2] p-4 text-sm text-destructive',
        className,
      )}
    >
      <CircleAlert className="mt-0.5 size-4.5 shrink-0" />
      <div>
        <p className="font-semibold">{error.message}</p>
        {error.fields?.length > 0 && (
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[13px]">
            {error.fields.map((f, i) => (
              <li key={i}>
                {f.path ? `${f.path}: ` : ''}
                {f.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="display-title text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, description, children, className, action }) {
  return (
    <Card className={cn('p-5 sm:p-6', className)}>
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </Card>
  );
}

export function LoadingState({ rows = 4 }) {
  return (
    <Card className="p-5 sm:p-6" aria-busy="true" aria-label="Đang tải dữ liệu">
      <div className="space-y-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="size-12 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ResourceState({ resource, rows }) {
  if (resource.error)
    return (
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-[#fdf3f2] text-destructive">
          <CircleAlert className="size-6" />
        </span>
        <div>
          <p className="font-display font-bold">Không tải được dữ liệu</p>
          <p className="mt-1 text-sm text-muted-foreground">{resource.error.message}</p>
        </div>
        <Button variant="outline" onClick={resource.refresh}>
          <RotateCcw />
          Thử lại
        </Button>
      </Card>
    );
  return <LoadingState rows={rows} />;
}

export function EmptyRows({ icon: Icon = ImageOff, title, description, children }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-walnut">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 font-display font-bold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function mutationError(error, setError) {
  setError?.(error);
  if (error.status === 401) {
    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    window.location.assign('/admin/dang-nhap');
  }
}

export function DeleteDialog({ item, onClose, onDelete, description }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await onDelete(item);
      toast.success('Đã xóa thành công.');
      onClose();
    } catch (e) {
      mutationError(e, setError);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AlertDialog
      open={Boolean(item)}
      onOpenChange={(open) => {
        if (!open && !busy) {
          setError(null);
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogTitle>Xóa “{item?.name}”?</AlertDialogTitle>
        <AlertDialogDescription>
          {description ||
            'Thao tác này không thể hoàn tác. Ảnh gốc trong thư viện vẫn được giữ nguyên.'}
        </AlertDialogDescription>
        <FormError error={error} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Giữ lại</AlertDialogCancel>
          <Button variant="destructive" disabled={busy} onClick={remove}>
            {busy ? 'Đang xóa…' : 'Xác nhận xóa'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Pager({ page, pages, onChange, total, label = 'mục' }) {
  if (pages <= 1)
    return total ? (
      <p className="text-sm text-muted-foreground">
        {total} {label}
      </p>
    ) : null;
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {total !== undefined && `${total} ${label} · `}Trang {page} / {pages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Trang trước"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          aria-label="Trang sau"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export function SearchBox({ value, onChange, onSubmit, placeholder, label, className }) {
  return (
    <form
      role="search"
      className={cn('relative', className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        maxLength={120}
        onChange={(e) => onChange(e.target.value)}
        className="pr-24 pl-10"
      />
      <Button type="submit" size="sm" variant="secondary" className="absolute top-1 right-1 h-9">
        Tìm
      </Button>
    </form>
  );
}

export function MediaPicker({
  value = [],
  onChange,
  multiple = true,
  label = 'Chọn ảnh từ thư viện',
  variant = 'outline',
}) {
  const [open, setOpen] = useState(false),
    [selected, setSelected] = useState(value),
    [query, setQuery] = useState(''),
    [draftQuery, setDraftQuery] = useState(''),
    [page, setPage] = useState(1);
  const resource = useResource(
    open ? `/admin/media?limit=18&page=${page}&q=${encodeURIComponent(query)}` : null,
  );
  function toggle(src) {
    setSelected((items) =>
      multiple ? (items.includes(src) ? items.filter((v) => v !== src) : [...items, src]) : [src],
    );
  }
  return (
    <>
      <Button
        type="button"
        variant={variant}
        size="sm"
        onClick={() => {
          setSelected(value);
          setOpen(true);
        }}
      >
        <ImagePlus />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl gap-5">
          <DialogHeader>
            <DialogTitle>Thư viện hình ảnh</DialogTitle>
            <DialogDescription>
              {multiple
                ? 'Chọn một hoặc nhiều ảnh. Thứ tự chọn là thứ tự trong gallery, có thể sắp xếp lại sau.'
                : 'Chọn một ảnh từ thư viện KIHA.'}
            </DialogDescription>
          </DialogHeader>
          <SearchBox
            value={draftQuery}
            onChange={setDraftQuery}
            onSubmit={() => {
              setQuery(draftQuery);
              setPage(1);
            }}
            label="Tìm tên ảnh"
            placeholder="Tìm theo tên file…"
          />
          {resource.error ? (
            <FormError error={resource.error} />
          ) : !resource.data ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {Array.from({ length: 12 }, (_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : resource.data.total === 0 ? (
            <EmptyRows title="Không tìm thấy ảnh" description="Thử từ khóa khác." />
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {resource.data.items.map((m) => {
                const order = selected.indexOf(m.src);
                return (
                  <li key={m._id}>
                    <button
                      type="button"
                      onClick={() => toggle(m.src)}
                      aria-pressed={order >= 0}
                      title={m.name}
                      className={cn(
                        'group relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-secondary transition-[border-color,box-shadow]',
                        order >= 0
                          ? 'border-olive shadow-[0_0_0_3px_rgb(95_106_82/0.2)]'
                          : 'border-transparent hover:border-charcoal/20',
                      )}
                    >
                      <Image src={m.src} alt={m.name} fill sizes="160px" className="object-cover" />
                      <span
                        className={cn(
                          'absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full border text-[11px] font-bold transition-colors',
                          order >= 0
                            ? 'border-olive bg-primary text-charcoal'
                            : 'border-white bg-white/70 text-transparent',
                        )}
                      >
                        {order >= 0 ? multiple ? order + 1 : <Check className="size-3.5" /> : ''}
                      </span>
                      <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-ivory to-ivory/0 px-2 pt-4 pb-1.5 text-left text-[10px] text-charcoal">
                        {m.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {resource.data && (
            <Pager
              page={page}
              pages={resource.data.pages}
              total={resource.data.total}
              label="ảnh"
              onChange={setPage}
            />
          )}
          <DialogFooter className="items-center border-t pt-4 sm:justify-between">
            <span className="text-sm text-muted-foreground">Đã chọn {selected.length} ảnh</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onChange(selected);
                  setOpen(false);
                }}
              >
                Dùng ảnh đã chọn
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ImagePreview({ src, alt, onRemove, removeLabel = 'Bỏ ảnh', className }) {
  if (!src) return null;
  return (
    <div className={cn('mt-3 flex items-center gap-3', className)}>
      <span className="relative block h-20 w-28 overflow-hidden rounded-xl border bg-secondary">
        <Image src={src} alt={alt} fill sizes="112px" className="object-contain" />
      </span>
      {onRemove && (
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          {removeLabel}
        </Button>
      )}
    </div>
  );
}

export function formatDate(value, withTime = true) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(new Date(value));
}
