'use client';
import { useEffect, useRef, useState } from 'react';
import { Upload, Film, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ProductVideo } from '@/components/product-video';
import {
  useResource,
  ResourceState,
  FormError,
  DeleteDialog,
  Pager,
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
    <div className="video-upload">
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
      <Button
        type="button"
        variant="outline"
        disabled={progress !== null}
        onClick={() => input.current.click()}
      >
        <Upload />
        Tải video lên
      </Button>
      <p className="muted text-xs">
        MP4 hoặc WebM · Tối đa 100 MB. Nên dùng MP4 H.264/AAC để phát tốt trên điện thoại.
      </p>
      {progress !== null && (
        <div className="video-progress" role="status">
          <progress max={100} value={progress} aria-label="Tiến độ tải video" />
          <span>{progress === 100 ? 'Đang lưu video…' : `Đang tải ${progress}%`}</span>
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
  if (!resource.data || resource.error) return <ResourceState resource={resource} />;
  return (
    <>
      {!resource.data.total && (
        <p className="muted">
          Chưa có video. Tải video giới thiệu sản phẩm của bạn lên để bắt đầu.
        </p>
      )}
      <div className="video-library">
        {resource.data.items.map((video) => (
          <article className="video-library-item" key={video._id}>
            <ProductVideo src={video.src} name={video.name} />
            <p>{video.name}</p>
            <small className="muted">{(video.bytes / 1024 / 1024).toFixed(1)} MB</small>
            <div className="video-actions">
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
              >
                <Trash2 />
                Xóa
              </Button>
            </div>
          </article>
        ))}
      </div>
      <Pager page={page} pages={resource.data.pages} onChange={setPage} />
      <DeleteDialog
        item={deleting}
        onClose={() => setDeleting(null)}
        description="Xóa file video khỏi thư viện. Video đang gắn với sản phẩm phải được gỡ và lưu trước."
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
    <>
      <VideoUpload onUploaded={(video) => onChange(video.src)} onBusy={onBusy} />
      <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
        <Film />
        Chọn video đã tải
      </Button>
      {value && (
        <div className="selected-video">
          <ProductVideo key={value} src={value} poster={poster} />
          <Button type="button" variant="ghost" onClick={() => onChange('')}>
            <X />
            Gỡ video khỏi sản phẩm
          </Button>
          <p className="muted text-xs">
            Lưu sản phẩm để áp dụng thay đổi. Video vẫn được giữ trong thư viện.
          </p>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="media-dialog">
          <DialogTitle>Thư viện video</DialogTitle>
          <DialogDescription>Chọn một video giới thiệu cho sản phẩm.</DialogDescription>
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
    </>
  );
}

export function AdminVideos() {
  const [version, setVersion] = useState(0);
  return (
    <section className="admin-panel admin-video-library">
      <h2>Thư viện video</h2>
      <VideoUpload onUploaded={() => setVersion((value) => value + 1)} />
      <VideoLibrary version={version} />
    </section>
  );
}
