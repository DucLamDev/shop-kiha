'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { cn, slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FormError,
  useResource,
  ResourceState,
  DeleteDialog,
  MediaPicker,
  PageHeader,
  EmptyRows,
  ImagePreview,
  fieldErrors,
  mutationError,
} from '@/components/admin/shared';

const blank = { name: '', slug: '', description: '', image: '', isActive: true, sortOrder: 0 };
const toInput = (c) => Object.fromEntries(Object.keys(blank).map((k) => [k, c[k] ?? blank[k]]));

export function AdminCategories() {
  const resource = useResource('/admin/categories');
  const [editor, setEditor] = useState(null),
    [deleted, setDeleted] = useState(null),
    [saving, setSaving] = useState({});

  async function toggle(c, isActive) {
    setSaving((s) => ({ ...s, [c._id]: true }));
    try {
      await api(`/admin/categories/${c._id}`, { method: 'PUT', body: { ...toInput(c), isActive } });
      toast.success(isActive ? 'Đã hiển thị danh mục.' : 'Đã ẩn danh mục khỏi website.');
      resource.refresh();
    } catch (err) {
      mutationError(err);
      toast.error(err.message);
    } finally {
      setSaving((s) => ({ ...s, [c._id]: false }));
    }
  }

  return (
    <>
      <PageHeader
        title="Danh mục"
        description="Nhóm sản phẩm hiển thị ở trang chủ, bộ lọc và menu. Ẩn danh mục sẽ ẩn sản phẩm chỉ thuộc danh mục đó."
      >
        <Button onClick={() => setEditor({ ...blank })}>
          <Plus />
          Thêm danh mục
        </Button>
      </PageHeader>
      {!resource.data || resource.error ? (
        <ResourceState resource={resource} />
      ) : resource.data.length === 0 ? (
        <Card>
          <EmptyRows
            icon={Layers}
            title="Chưa có danh mục"
            description="Tạo danh mục đầu tiên để phân nhóm sản phẩm."
          >
            <Button size="sm" onClick={() => setEditor({ ...blank })}>
              <Plus />
              Thêm danh mục
            </Button>
          </EmptyRows>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Danh mục</TableHead>
                <TableHead className="hidden sm:table-cell">Thứ tự</TableHead>
                <TableHead>Hiển thị</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resource.data.map((c) => (
                <TableRow key={c._id} className={cn(saving[c._id] && 'opacity-60')}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {c.image && (
                          <Image src={c.image} alt="" fill sizes="64px" className="object-cover" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          /san-pham?category={c.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {c.sortOrder}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={c.isActive}
                      disabled={saving[c._id]}
                      onCheckedChange={(v) => toggle(c, v)}
                      aria-label={`Hiển thị danh mục ${c.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Sửa ${c.name}`}
                        title="Sửa"
                        onClick={() => setEditor(c)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Xóa ${c.name}`}
                        title="Xóa"
                        className="hover:bg-[#fdf3f2] hover:text-destructive"
                        onClick={() => setDeleted(c)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editor?._id ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle>
            <DialogDescription>
              Tên và ảnh danh mục hiển thị ở trang chủ và bộ lọc sản phẩm.
            </DialogDescription>
          </DialogHeader>
          {editor && (
            <CategoryEditor
              key={editor._id || 'new'}
              initial={editor}
              onCancel={() => setEditor(null)}
              onSaved={() => {
                setEditor(null);
                resource.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <DeleteDialog
        key={deleted?._id || 'none'}
        item={deleted}
        onClose={() => setDeleted(null)}
        onDelete={async (c) => {
          await api(`/admin/categories/${c._id}`, { method: 'DELETE' });
          resource.refresh();
        }}
        description="Chỉ xóa được danh mục không còn sản phẩm. Nếu danh mục còn sản phẩm, hãy chuyển sản phẩm sang danh mục khác hoặc tạm ẩn danh mục thay vì xóa."
      />
    </>
  );
}

function CategoryEditor({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(toInput(initial)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const errors = fieldErrors(error);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/categories${initial._id ? `/${initial._id}` : ''}`, {
        method: initial._id ? 'PUT' : 'POST',
        body: form,
      });
      toast.success('Đã lưu danh mục.');
      onSaved();
    } catch (err) {
      mutationError(err, setError);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="grid gap-5">
      <FormError error={error} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tên danh mục" required error={errors.name}>
          <Input
            required
            value={form.name}
            maxLength={120}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({
                ...f,
                name,
                ...(!initial._id && (!f.slug || f.slug === slugify(f.name))
                  ? { slug: slugify(name) }
                  : {}),
              }));
            }}
          />
        </Field>
        <Field label="Slug" required error={errors.slug}>
          <Input
            required
            value={form.slug}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            onChange={(e) => set('slug', e.target.value)}
          />
        </Field>
      </div>
      <Field
        label="Mô tả"
        hint="Không bắt buộc. Hiển thị ở đầu trang danh mục."
        error={errors.description}
      >
        <Textarea
          maxLength={1000}
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Thứ tự hiển thị" error={errors.sortOrder}>
          <Input
            type="number"
            min="0"
            max="99999"
            value={form.sortOrder}
            onChange={(e) => set('sortOrder', Number(e.target.value))}
          />
        </Field>
        <div className="flex items-center justify-between gap-3 rounded-xl border px-4 sm:mt-7">
          <label htmlFor="category-active" className="text-sm font-semibold">
            Hiển thị danh mục
          </label>
          <Switch
            id="category-active"
            checked={form.isActive}
            onCheckedChange={(v) => set('isActive', v)}
          />
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">Ảnh danh mục</p>
        <MediaPicker
          multiple={false}
          value={form.image ? [form.image] : []}
          onChange={(v) => set('image', v[0] || '')}
          label="Chọn ảnh"
        />
        <ImagePreview src={form.image} alt="Ảnh danh mục" onRemove={() => set('image', '')} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Đang lưu…' : 'Lưu danh mục'}
        </Button>
      </DialogFooter>
    </form>
  );
}
