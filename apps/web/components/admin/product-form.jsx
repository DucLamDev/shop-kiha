'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus, Star, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { slugify } from '@/lib/utils';
import { ProductVideoEditor } from '@/components/admin/videos';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  useResource,
  ResourceState,
  Field,
  FormError,
  MediaPicker,
  mutationError,
} from '@/components/admin/shared';
const empty = {
  name: '',
  slug: '',
  category: '',
  categories: [],
  video: '',
  videoDescription: '',
  shortDescription: '',
  description: '',
  images: [],
  thumbnail: '',
  price: null,
  priceLabel: '',
  specifications: [],
  isFeatured: false,
  status: 'draft',
  sortOrder: 0,
  seoTitle: '',
  seoDescription: '',
  seoImage: '',
  isDemo: false,
};
export function ProductForm({ id }) {
  const item = useResource(id ? `/admin/products/${id}` : null),
    cats = useResource('/admin/categories');
  if (!cats.data || cats.error) return <ResourceState resource={cats} />;
  if (id && (!item.data || item.error)) return <ResourceState resource={item} />;
  return <ProductEditor initial={item.data} categories={cats.data} id={id} />;
}
function ProductEditor({ initial, categories, id }) {
  const [form, setForm] = useState(() =>
    initial
      ? Object.fromEntries(Object.keys(empty).map((key) => [key, initial[key] ?? empty[key]]))
      : { ...empty, category: categories[0]?._id || '' },
  );
  const [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(null),
    [preview, setPreview] = useState(false);
  const router = useRouter();
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  function imagesChanged(images) {
    setForm((f) => ({
      ...f,
      images,
      thumbnail: images.includes(f.thumbnail) ? f.thumbnail : images[0] || '',
    }));
  }
  function move(index, direction) {
    const images = [...form.images],
      target = index + direction;
    if (target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]];
    set('images', images);
  }
  async function save(e) {
    e.preventDefault();
    if (uploading) return;
    setBusy(true);
    setError(null);
    try {
      if (!form.images.length) throw new Error('Chọn ít nhất một ảnh sản phẩm.');
      await api(`/admin/products${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        body: form,
      });
      toast.success(id ? 'Đã cập nhật sản phẩm.' : 'Đã tạo sản phẩm.');
      router.push('/admin/san-pham');
      router.refresh();
    } catch (err) {
      mutationError(err, setError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">
            <Link href="/admin/san-pham">Sản phẩm</Link>
          </p>
          <h1>{id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
        </div>
        <Button type="button" variant="outline" onClick={() => setPreview(true)}>
          <Eye />
          Xem trước
        </Button>
      </div>
      <form onSubmit={save}>
        <FormError error={error} />
        <div className="form-columns">
          <div>
            <section className="admin-panel">
              <h2>Thông tin sản phẩm</h2>
              <Field label="Tên sản phẩm *">
                <input
                  value={form.name}
                  required
                  maxLength={160}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      ...(!id && (!f.slug || f.slug === slugify(f.name))
                        ? { slug: slugify(name) }
                        : {}),
                    }));
                  }}
                />
              </Field>
              <Field
                label="Slug *"
                hint="Đường dẫn duy nhất, dùng chữ thường không dấu và dấu gạch ngang."
              >
                <input
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  maxLength={160}
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value)}
                />
              </Field>
              <Field label="Mô tả ngắn">
                <textarea
                  rows={2}
                  maxLength={300}
                  value={form.shortDescription}
                  onChange={(e) => set('shortDescription', e.target.value)}
                />
              </Field>
              <Field label="Mô tả chi tiết">
                <textarea
                  rows={6}
                  maxLength={12000}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              </Field>
            </section>
            <section className="admin-panel">
              <h2>Hình ảnh sản phẩm</h2>
              <MediaPicker value={form.images} onChange={imagesChanged} />
              <div className="selected-images">
                {form.images.map((src, i) => (
                  <div
                    key={src}
                    className={`selected-image ${src === form.thumbnail ? 'cover' : ''}`}
                  >
                    <Image src={src} alt={`Ảnh ${i + 1}`} width={100} height={75} />
                    <span>{src === form.thumbnail ? 'Ảnh đại diện' : `Ảnh ${i + 1}`}</span>
                    <div className="image-actions">
                      <button
                        type="button"
                        aria-label={`Đặt ảnh ${i + 1} làm đại diện`}
                        onClick={() => set('thumbnail', src)}
                      >
                        <Star size={12} fill={src === form.thumbnail ? '#b3996c' : 'none'} />
                      </button>
                      <button
                        type="button"
                        disabled={i === 0}
                        aria-label={`Đưa ảnh ${i + 1} về trước`}
                        onClick={() => move(i, -1)}
                      >
                        <ArrowLeft size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={i === form.images.length - 1}
                        aria-label={`Đưa ảnh ${i + 1} về sau`}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowRight size={12} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Bỏ ảnh ${i + 1}`}
                        onClick={() => imagesChanged(form.images.filter((v) => v !== src))}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="muted text-xs">
                Chọn ngôi sao để đặt ảnh đại diện. Các mũi tên thay đổi thứ tự gallery.
              </p>
            </section>
            <section className="admin-panel">
              <h2>Video giới thiệu</h2>
              <ProductVideoEditor
                value={form.video}
                onChange={(src) => set('video', src)}
                poster={form.thumbnail}
                onBusy={setUploading}
              />
              <Field
                label="Nội dung video bằng văn bản"
                hint="Mô tả thao tác hoặc chép lời nói để khách có thể đọc khi không bật âm thanh."
              >
                <textarea
                  rows={4}
                  maxLength={12000}
                  value={form.videoDescription}
                  onChange={(e) => set('videoDescription', e.target.value)}
                />
              </Field>
            </section>
            <section className="admin-panel">
              <h2>Thông số sản phẩm</h2>
              <p className="muted text-xs mb-4">Chỉ nhập thông tin thực tế đã được xác nhận.</p>
              {form.specifications.map((spec, i) => (
                <div key={i} className="spec-row">
                  <input
                    className="input"
                    aria-label={`Tên thông số ${i + 1}`}
                    placeholder="Ví dụ: Kích thước"
                    required
                    maxLength={120}
                    value={spec.label}
                    onChange={(e) =>
                      set(
                        'specifications',
                        form.specifications.map((s, n) =>
                          n === i ? { ...s, label: e.target.value } : s,
                        ),
                      )
                    }
                  />
                  <input
                    className="input"
                    aria-label={`Giá trị thông số ${i + 1}`}
                    placeholder="Giá trị đã xác nhận"
                    required
                    maxLength={500}
                    value={spec.value}
                    onChange={(e) =>
                      set(
                        'specifications',
                        form.specifications.map((s, n) =>
                          n === i ? { ...s, value: e.target.value } : s,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Xóa thông số ${i + 1}`}
                    onClick={() =>
                      set(
                        'specifications',
                        form.specifications.filter((_, n) => n !== i),
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={form.specifications.length >= 30}
                onClick={() =>
                  set('specifications', [...form.specifications, { label: '', value: '' }])
                }
              >
                <Plus />
                Thêm thông số
              </Button>
            </section>
          </div>
          <div>
            <section className="admin-panel">
              <h2>Hiển thị & phân loại</h2>
              <Field label="Danh mục *">
                <select
                  required
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => (
                    <option value={c._id} key={c._id}>
                      {c.name}
                      {!c.isActive ? ' (đang ẩn)' : ''}
                    </option>
                  ))}
                </select>
              </Field>
              {categories.length === 0 && (
                <Link className="text-link mb-4" href="/admin/danh-muc">
                  Tạo danh mục trước
                </Link>
              )}
              <fieldset className="additional-categories">
                <legend>Hiển thị thêm trong danh mục</legend>
                {categories
                  .filter((c) => c._id !== form.category)
                  .map((c) => (
                    <label className="checkbox-field" key={c._id}>
                      <input
                        type="checkbox"
                        checked={form.categories.includes(c._id)}
                        onChange={(e) =>
                          set(
                            'categories',
                            e.target.checked
                              ? [...form.categories, c._id]
                              : form.categories.filter((id) => id !== c._id),
                          )
                        }
                      />
                      {c.name}
                      {!c.isActive ? ' (đang ẩn)' : ''}
                    </label>
                  ))}
              </fieldset>
              <Field label="Trạng thái">
                <select value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="draft">Bản nháp</option>
                  <option value="published">Xuất bản</option>
                </select>
              </Field>
              <Field label="Thứ tự hiển thị">
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
                  checked={form.isFeatured}
                  onChange={(e) => set('isFeatured', e.target.checked)}
                />
                Sản phẩm nổi bật
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={form.isDemo}
                  onChange={(e) => set('isDemo', e.target.checked)}
                />
                Dữ liệu tham khảo
              </label>
              <p className="muted text-xs">
                Dữ liệu tham khảo không hiển thị ở production. Chỉ bỏ chọn sau khi xác nhận thông
                tin thật.
              </p>
            </section>
            <section className="admin-panel">
              <h2>Thông tin giá</h2>
              <Field label="Giá hiển thị (VND)" hint="Để trống nếu cần tư vấn báo giá.">
                <input
                  type="number"
                  min="0"
                  max="1000000000000"
                  step="1"
                  value={form.price ?? ''}
                  onChange={(e) =>
                    set('price', e.target.value === '' ? null : Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Nhãn giá khi chưa có giá">
                <input
                  value={form.priceLabel}
                  placeholder="Liên hệ báo giá"
                  maxLength={120}
                  onChange={(e) => set('priceLabel', e.target.value)}
                />
              </Field>
            </section>
            <section className="admin-panel">
              <h2>Tối ưu tìm kiếm</h2>
              <Field label="Tiêu đề SEO">
                <input
                  value={form.seoTitle}
                  maxLength={160}
                  onChange={(e) => set('seoTitle', e.target.value)}
                />
              </Field>
              <Field label="Mô tả SEO">
                <textarea
                  value={form.seoDescription}
                  maxLength={320}
                  onChange={(e) => set('seoDescription', e.target.value)}
                />
              </Field>
              <MediaPicker
                multiple={false}
                label="Ảnh chia sẻ"
                value={form.seoImage ? [form.seoImage] : []}
                onChange={(v) => set('seoImage', v[0] || '')}
              />
              {form.seoImage && (
                <div className="mt-3">
                  <Image src={form.seoImage} alt="Ảnh chia sẻ" width={180} height={100} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set('seoImage', '')}
                  >
                    Dùng ảnh đại diện
                  </Button>
                </div>
              )}
            </section>
          </div>
        </div>
        <div className="form-save">
          <Button asChild variant="outline">
            <Link href="/admin/san-pham">Hủy</Link>
          </Button>
          <Button type="submit" disabled={busy || uploading}>
            {uploading ? 'Đang tải video…' : busy ? 'Đang lưu…' : 'Lưu sản phẩm'}
          </Button>
        </div>
      </form>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent>
          <DialogTitle>{form.name || 'Sản phẩm chưa có tên'}</DialogTitle>
          <DialogDescription className="muted">
            Bản xem trước nội dung đang chỉnh sửa, chưa lưu lên website.
          </DialogDescription>
          {form.thumbnail && (
            <Image
              className="rounded mt-5"
              src={form.thumbnail}
              alt={form.name}
              width={520}
              height={350}
            />
          )}
          <p className="mt-4">{form.shortDescription}</p>
          <p className="mt-4 whitespace-pre-line text-xs text-stone-600">{form.description}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
