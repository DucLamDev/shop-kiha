'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Field,
  FormError,
  useResource,
  ResourceState,
  DeleteDialog,
  MediaPicker,
  mutationError,
} from '@/components/admin/shared';
const blank = { name: '', slug: '', description: '', image: '', isActive: true, sortOrder: 0 };
export function AdminCategories() {
  const resource = useResource('/admin/categories');
  const [editor, setEditor] = useState(null),
    [deleted, setDeleted] = useState(null);
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Danh mục</h1>
          <p>Sắp xếp và quản lý nhóm sản phẩm.</p>
        </div>
        <Button onClick={() => setEditor({ ...blank })}>
          <Plus />
          Thêm danh mục
        </Button>
      </div>
      {!resource.data || resource.error ? (
        <ResourceState resource={resource} />
      ) : (
        <div className="admin-panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Slug</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {resource.data.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.sortOrder}</td>
                  <td>
                    <span className={`status-badge ${!c.isActive ? 'draft' : ''}`}>
                      {c.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Sửa ${c.name}`}
                        onClick={() => setEditor(c)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Xóa ${c.name}`}
                        onClick={() => setDeleted(c)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {resource.data.length === 0 && (
            <div className="empty-state">
              <p>Chưa có danh mục. Hãy tạo danh mục đầu tiên.</p>
            </div>
          )}
        </div>
      )}
      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <DialogContent>
          <DialogTitle>{editor?._id ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle>
          <DialogDescription className="muted mb-5">
            Ẩn danh mục sẽ ẩn các sản phẩm thuộc danh mục khỏi website.
          </DialogDescription>
          {editor && (
            <CategoryEditor
              key={editor._id || 'new'}
              initial={editor}
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
        description="Chỉ có thể xóa danh mục không còn sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước nếu cần."
      />
    </>
  );
}
function CategoryEditor({ initial, onSaved }) {
  const [form, setForm] = useState(
      Object.fromEntries(Object.keys(blank).map((k) => [k, initial[k] ?? blank[k]])),
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
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
    <form onSubmit={save}>
      <FormError error={error} />
      <div className="form-grid">
        <Field label="Tên danh mục *">
          <input
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
        <Field label="Slug *">
          <input
            required
            value={form.slug}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            onChange={(e) => set('slug', e.target.value)}
          />
        </Field>
        <Field label="Mô tả" className="form-full">
          <textarea
            maxLength={1000}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
        <Field label="Thứ tự">
          <input
            type="number"
            min="0"
            max="99999"
            value={form.sortOrder}
            onChange={(e) => set('sortOrder', Number(e.target.value))}
          />
        </Field>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
          />
          Hiển thị danh mục
        </label>
      </div>
      <MediaPicker
        multiple={false}
        value={form.image ? [form.image] : []}
        onChange={(v) => set('image', v[0] || '')}
        label="Ảnh danh mục"
      />
      {form.image && (
        <div className="mt-3">
          <Image src={form.image} alt="Ảnh danh mục" width={130} height={85} />
          <Button type="button" variant="ghost" size="sm" onClick={() => set('image', '')}>
            Bỏ ảnh
          </Button>
        </div>
      )}
      <div className="delete-actions">
        <Button disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu danh mục'}</Button>
      </div>
    </form>
  );
}
