'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useResource, ResourceState, Pager } from '@/components/admin/shared';
export function AdminMedia() {
  const [page, setPage] = useState(1),
    [query, setQuery] = useState(''),
    [draft, setDraft] = useState(''),
    [preview, setPreview] = useState(null);
  const resource = useResource(`/admin/media?limit=12&page=${page}&q=${encodeURIComponent(query)}`);
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Thư viện hình ảnh</h1>
          <p>{resource.data?.total ?? '…'} ảnh · Các file gốc được giữ nguyên.</p>
        </div>
      </div>
      <form
        className="admin-search"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(draft);
          setPage(1);
        }}
      >
        <input
          className="input"
          placeholder="Tìm tên file…"
          aria-label="Tìm tên file"
          value={draft}
          maxLength={120}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" variant="outline">
          Tìm ảnh
        </Button>
      </form>
      {!resource.data || resource.error ? (
        <ResourceState resource={resource} />
      ) : (
        <>
          <div className="media-grid">
            {resource.data.items.map((m) => (
              <button
                className="media-tile"
                key={m._id}
                onClick={() => setPreview(m)}
                title={m.name}
              >
                <div className="media-photo">
                  <Image src={m.src} alt={m.name} fill sizes="(max-width: 620px) 45vw, 25vw" />
                </div>
                <p>{m.name}</p>
                <small>
                  {m.width} × {m.height} · {m.format.toUpperCase()} · {Math.round(m.bytes / 1024)}{' '}
                  KB
                </small>
              </button>
            ))}
          </div>
          {resource.data.total === 0 && (
            <div className="empty-state">
              <p>Không tìm thấy ảnh.</p>
            </div>
          )}
          <Pager page={page} pages={resource.data.pages} onChange={setPage} />
        </>
      )}
      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent className="media-dialog">
          <DialogTitle>Xem ảnh gốc</DialogTitle>
          <DialogDescription className="muted text-xs break-all mb-4">
            {preview?.name}
          </DialogDescription>
          {preview && (
            <Image
              src={preview.src}
              alt={preview.name}
              width={preview.width}
              height={preview.height}
              sizes="90vw"
              style={{ width: '100%', height: 'auto', maxHeight: '68dvh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
