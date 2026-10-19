'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Film, ImageIcon, ImageOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useResource,
  Pager,
  PageHeader,
  SearchBox,
  ResourceState,
  EmptyRows,
} from '@/components/admin/shared';
import { AdminVideos } from '@/components/admin/videos';

export function AdminMedia() {
  return (
    <>
      <PageHeader
        title="Ảnh & video"
        description="Thư viện dùng khi chọn ảnh sản phẩm, danh mục và ảnh thương hiệu. File gốc luôn được giữ nguyên."
      />
      <Tabs defaultValue="images">
        <TabsList aria-label="Loại tài nguyên">
          <TabsTrigger value="images">
            <ImageIcon />
            Hình ảnh
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Film />
            Video
          </TabsTrigger>
        </TabsList>
        <TabsContent value="images" className="mt-6">
          <ImageLibrary />
        </TabsContent>
        <TabsContent value="videos" className="mt-6">
          <AdminVideos />
        </TabsContent>
      </Tabs>
    </>
  );
}

function ImageLibrary() {
  const [page, setPage] = useState(1),
    [query, setQuery] = useState(''),
    [draft, setDraft] = useState(''),
    [preview, setPreview] = useState(null);
  const resource = useResource(`/admin/media?limit=24&page=${page}&q=${encodeURIComponent(query)}`);
  return (
    <>
      <SearchBox
        className="mb-5 max-w-xl"
        value={draft}
        onChange={setDraft}
        onSubmit={() => {
          setQuery(draft.trim());
          setPage(1);
        }}
        label="Tìm tên file"
        placeholder="Tìm theo tên file…"
      />
      {resource.error ? (
        <ResourceState resource={resource} />
      ) : !resource.data ? (
        <ul
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
          aria-busy="true"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <li key={i}>
              <Skeleton className="aspect-square" />
              <Skeleton className="mt-2 h-3 w-3/4" />
            </li>
          ))}
        </ul>
      ) : resource.data.total === 0 ? (
        <Card>
          <EmptyRows
            icon={ImageOff}
            title="Không tìm thấy ảnh"
            description="Thử từ khóa khác hoặc xóa từ khóa tìm kiếm."
          />
        </Card>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {resource.data.items.map((m) => (
              <li key={m._id}>
                <button
                  type="button"
                  onClick={() => setPreview(m)}
                  title={m.name}
                  className="group block w-full text-left"
                >
                  <span className="relative block aspect-square overflow-hidden rounded-xl border bg-secondary">
                    <Image
                      src={m.src}
                      alt={m.name}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1280px) 22vw, 15vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="mt-2 block truncate text-[13px] font-medium">{m.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {m.width}×{m.height} · {m.format.toUpperCase()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Pager
              page={page}
              pages={resource.data.pages}
              total={resource.data.total}
              label="ảnh"
              onChange={setPage}
            />
          </div>
        </>
      )}
      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="break-all">{preview?.name}</DialogTitle>
            <DialogDescription>
              {preview &&
                `${preview.width} × ${preview.height} px · ${preview.format.toUpperCase()} · ${Math.round(preview.bytes / 1024)} KB`}
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <Image
              src={preview.src}
              alt={preview.name}
              width={preview.width}
              height={preview.height}
              sizes="90vw"
              className="max-h-[68dvh] w-full rounded-xl bg-secondary object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
