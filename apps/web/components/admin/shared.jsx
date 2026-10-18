'use client';
import { cloneElement, useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { LoaderCircle, ImagePlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
export function Field({ label, hint, children, className = '' }) {
  const id = useId();
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id, ...(hint ? { 'aria-describedby': `${id}-hint` } : {}) })}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function FormError({ error }) {
  return error ? (
    <div className="form-error" role="alert">
      {error.message}
      {error.fields && (
        <ul>
          {error.fields.map((f, i) => (
            <li key={i}>
              {f.path}: {f.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : null;
}
export function ResourceState({ resource }) {
  if (resource.error)
    return (
      <div className="empty-state">
        <FormError error={resource.error} />
        <Button variant="outline" onClick={resource.refresh}>
          Thử lại
        </Button>
      </div>
    );
  return (
    <div className="empty-state" aria-busy="true">
      <LoaderCircle className="animate-spin" />
      <p>Đang tải dữ liệu…</p>
    </div>
  );
}
export function mutationError(error, setError) {
  setError(error);
  if (error.status === 401) {
    toast.error('Phiên đăng nhập đã hết hạn.');
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
    <Dialog
      open={Boolean(item)}
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent>
        <DialogTitle>Xóa {item?.name}?</DialogTitle>
        <DialogDescription className="confirm-description">
          {description ||
            'Thao tác này sẽ xóa bản ghi. Ảnh gốc trong thư viện vẫn được giữ nguyên.'}
        </DialogDescription>
        <FormError error={error} />
        <div className="delete-actions">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Giữ lại
          </Button>
          <Button variant="destructive" disabled={busy} onClick={remove}>
            {busy ? 'Đang xóa…' : 'Xác nhận xóa'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function Pager({ page, pages, onChange }) {
  return pages > 1 ? (
    <div className="pagination">
      <Button
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft />
      </Button>
      <span>
        Trang {page} / {pages}
      </span>
      <Button
        variant="outline"
        size="icon"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight />
      </Button>
    </div>
  ) : null;
}
export function MediaPicker({
  value = [],
  onChange,
  multiple = true,
  label = 'Chọn ảnh từ thư viện',
}) {
  const [open, setOpen] = useState(false),
    [selected, setSelected] = useState(value),
    [query, setQuery] = useState(''),
    [draftQuery, setDraftQuery] = useState(''),
    [page, setPage] = useState(1);
  const resource = useResource(
    open ? `/admin/media?limit=12&page=${page}&q=${encodeURIComponent(query)}` : null,
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
        variant="outline"
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
        <DialogContent className="media-dialog">
          <DialogTitle>Thư viện hình ảnh</DialogTitle>
          <DialogDescription className="muted">
            {multiple
              ? 'Chọn ảnh cho sản phẩm. Bạn có thể sắp xếp sau khi chọn.'
              : 'Chọn một ảnh từ thư viện KIHA.'}
          </DialogDescription>
          <div className="admin-search">
            <input
              className="input"
              aria-label="Tìm tên ảnh"
              placeholder="Tìm theo tên file…"
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setQuery(draftQuery);
                setPage(1);
              }}
            >
              Tìm ảnh
            </Button>
          </div>
          {resource.error ? (
            <FormError error={resource.error} />
          ) : !resource.data ? (
            <p>Đang tải ảnh…</p>
          ) : (
            <>
              <div className="media-grid">
                {resource.data.items.map((m) => (
                  <button
                    type="button"
                    key={m._id}
                    className={`media-tile ${selected.includes(m.src) ? 'selected' : ''}`}
                    onClick={() => toggle(m.src)}
                    aria-pressed={selected.includes(m.src)}
                    title={m.name}
                  >
                    <div className="media-photo">
                      <Image src={m.src} alt={m.name} fill sizes="200px" />
                    </div>
                    <p>{m.name}</p>
                    <small>
                      {m.width} × {m.height} · {m.format.toUpperCase()}
                    </small>
                  </button>
                ))}
              </div>
              {resource.data.total === 0 && <p>Không tìm thấy ảnh.</p>}
              <Pager page={page} pages={resource.data.pages} onChange={setPage} />
            </>
          )}
          <div className="media-picker-footer">
            <span className="muted">Đã chọn {selected.length} ảnh</span>
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
        </DialogContent>
      </Dialog>
    </>
  );
}
