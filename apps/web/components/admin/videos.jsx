'use client';
import { useEffect, useRef, useState } from 'react';
import { Film, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductVideo } from '@/components/product/product-video';
import {
  useResource,
  ResourceState,
  FormError,
  DeleteDialog,
  Pager,
  EmptyRows,
  mutationError,
} from './shared';

export function VideoUpload({ onUploaded, onBusy }) {
  const [progress, setProgress] = useState(null),
    [error, setError] = useState(null);
  const request = useRef(null),
    input = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  function upload(file) {
    if (!file) return;
    setError(null);
    if (!/\.(mp4|webm)$/i.test(file.name) || file.size > 100 * 1024 * 1024) {
      setError(new Error('Chọn video MP4/WebM, tối đa 100 MB.'));
      return;
    }
    const xhr = new XMLHttpRequest();
    request.current = xhr;
    setProgress(0);
    onBusy?.(true);
    xhr.open('POST', '/api/admin/videos');
    xhr.timeout = 5 * 60 * 1000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let result;
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        /* Proxy may return a non-JSON error. */
      }
      if (xhr.status >= 200 && xhr.status < 300 && result?.data) {
        onUploaded(result.data);
        toast.success('Đã tải video lên.');
      } else
        mutationError(
          Object.assign(
            new Error(result?.error?.message || 'Tải video không thành công. Vui lòng thử lại.'),
            { status: xhr.status },
          ),
          setError,
        );
    };
    xhr.onerror = () => setError(new Error('Mất kết nối khi tải video. Vui lòng thử lại.'));
    xhr.ontimeout = () => setError(new Error('Tải video quá lâu. Kiểm tra kết nối rồi thử lại.'));
    xhr.onloadend = () => {
      setProgress(null);
      onBusy?.(false);
      request.current = null;
    };
    const body = new FormData();
    body.append('video', file);
    xhr.send(body);
  }
  return (
    <div className="grid gap-3">
      <input
        ref={input}
        className="sr-only"
        tabIndex={-1}
        aria-label="Chọn file video"
        type="file"
        accept="video/mp4,video/webm,.mp4,.webm"
        disabled={progress !== null}
        onChange={(event) => {
          upload(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={progress !== null}
          onClick={() => input.current.click()}
        >
          <Upload />
          Tải video lên
        </Button>
        <p className="text-[13px] text-muted-foreground">
          MP4 hoặc WebM, tối đa 100 MB. Nên dùng MP4 H.264/AAC để phát tốt trên điện thoại.
        </p>
      </div>
      {progress !== null && (
        <div className="flex items-center gap-3 rounded-xl border bg-ivory px-4 py-3" role="status">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-olive-light transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-28 text-right text-sm tabular-nums">
            {progress === 100 ? 'Đang lưu…' : `Đang tải ${progress}%`}
          </span>
          <Button type="button" size="sm" variant="ghost" onClick={() => request.current?.abort()}>
            Hủy tải
          </Button>
        </div>
      )}
      <FormError error={error} />
    </div>
  );
}

function VideoLibrary({ onSelect, version = 0 }) {
  const [page, setPage] = useState(1),
    [deleting, setDeleting] = useState(null);
  const resource = useResource(`/admin/videos?limit=6&page=${page}`, version);
  if (!resource.data || resource.error) return <ResourceState resource={resource} rows={2} />;
  return (
    <>
      {!resource.data.total ? (
        <EmptyRows
          icon={Film}
          title="Chưa có video"
          description="Tải video giới thiệu sản phẩm lên để bắt đầu."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resource.data.items.map((video) => (
            <li key={video._id} className="rounded-2xl border bg-white p-3">
              <ProductVideo src={video.src} name={video.name} />
              <p className="mt-3 truncate text-sm font-semibold" title={video.name}>
                {video.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(video.bytes / 1024 / 1024).toFixed(1)} MB
              </p>
              <div className="mt-3 flex gap-2">
                {onSelect && (
                  <Button type="button" size="sm" onClick={() => onSelect(video)}>
                    Dùng video này
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleting(video)}
                  aria-label={`Xóa video ${video.name}`}
                  className="hover:bg-[#fdf3f2] hover:text-destructive"
                >
                  <Trash2 />
                  Xóa
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5">
        <Pager page={page} pages={resource.data.pages} onChange={setPage} />
      </div>
      <DeleteDialog
        item={deleting}
        onClose={() => setDeleting(null)}
        description="Xóa file video khỏi thư viện. Video đang gắn với sản phẩm phải được gỡ khỏi sản phẩm và lưu trước."
        onDelete={async (video) => {
          await api(`/admin/videos/${video._id}`, { method: 'DELETE' });
          setPage(1);
          resource.refresh();
        }}
      />
    </>
  );
}

export function ProductVideoEditor({ value, onChange, poster, onBusy }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-4">
      <VideoUpload onUploaded={(video) => onChange(video.src)} onBusy={onBusy} />
      <div>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Film />
          Chọn video đã tải
        </Button>
      </div>
      {value && (
        <div className="grid gap-3 rounded-2xl border bg-ivory/60 p-3">
          <ProductVideo key={value} src={value} poster={poster} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-muted-foreground">
              Lưu sản phẩm để áp dụng. Gỡ video không xóa file khỏi thư viện.
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              <X />
              Gỡ video
            </Button>
          </div>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Thư viện video</DialogTitle>
            <DialogDescription>Chọn một video giới thiệu cho sản phẩm.</DialogDescription>
          </DialogHeader>
          {open && (
            <VideoLibrary
              onSelect={(video) => {
                onChange(video.src);
                setOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminVideos() {
  const [version, setVersion] = useState(0);
  return (
    <Card className="p-5 sm:p-6">
      <VideoUpload onUploaded={() => setVersion((value) => value + 1)} />
      <div className="mt-6">
        <VideoLibrary version={version} />
      </div>
    </Card>
  );
}
