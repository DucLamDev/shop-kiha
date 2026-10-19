'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Eye,
  ImagePlus,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { cn, slugify } from '@/lib/utils';
import { emptyProduct, toProductInput } from '@/lib/product-input';
import { ProductVideoEditor } from '@/components/admin/videos';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useResource,
  ResourceState,
  Field,
  FormError,
  MediaPicker,
  NativeSelect,
  Panel,
  ImagePreview,
  fieldErrors,
  mutationError,
} from '@/components/admin/shared';

export function ProductForm({ id }) {
  const item = useResource(id ? `/admin/products/${id}` : null),
    cats = useResource('/admin/categories');
  if (!cats.data || cats.error) return <ResourceState resource={cats} />;
  if (id && (!item.data || item.error)) return <ResourceState resource={item} />;
  return <ProductEditor initial={item.data} categories={cats.data} id={id} />;
}

function Counter({ value, max }) {
  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        value.length > max * 0.9 ? 'text-gold' : 'text-muted-foreground',
      )}
    >
      {value.length}/{max}
    </span>
  );
}

function ToggleRow({ title, description, checked, onCheckedChange, id }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-semibold">{title}</span>
        {description && (
          <span className="mt-0.5 block text-[13px] text-muted-foreground">{description}</span>
        )}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
    </div>
  );
}

function ProductEditor({ initial, categories, id }) {
  const start = useMemo(
    () =>
      initial ? toProductInput(initial) : { ...emptyProduct, category: categories[0]?._id || '' },
    [initial, categories],
  );
  const [form, setForm] = useState(start);
  const [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(null),
    [preview, setPreview] = useState(false);
  const router = useRouter();
  const errors = fieldErrors(error);
  const dirty = JSON.stringify(form) !== JSON.stringify(start);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (!dirty || busy) return;
    const warn = (event) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);

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
  function setSpec(i, key, value) {
    set(
      'specifications',
      form.specifications.map((s, n) => (n === i ? { ...s, [key]: value } : s)),
    );
  }
  async function save(e) {
    e.preventDefault();
    if (uploading) return;
    setBusy(true);
    setError(null);
    try {
      if (!form.images.length)
        throw Object.assign(new Error('Chọn ít nhất một ảnh sản phẩm.'), {
          fields: [{ path: 'images', message: 'Chọn ít nhất một ảnh từ thư viện.' }],
        });
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
      setBusy(false);
    }
  }

  const mainCategory = categories.find((c) => c._id === form.category);
  const published = form.status === 'published';

  return (
    <>
      <Link
        href="/admin/san-pham"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Sản phẩm
      </Link>
      <div className="mt-3 mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="display-title text-3xl sm:text-4xl">
              {id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
            </h1>
            <Badge variant={published ? 'success' : 'muted'}>
              {published ? 'Đang hiển thị' : 'Bản nháp'}
            </Badge>
          </div>
          {id && <p className="mt-1.5 truncate text-[15px] text-muted-foreground">{start.name}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {id && initial?.status === 'published' && (
            <Button asChild variant="ghost">
              <a href={`/san-pham/${initial.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Xem trên website
              </a>
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => setPreview(true)}>
            <Eye />
            Xem trước
          </Button>
        </div>
      </div>
      <form onSubmit={save}>
        <FormError error={error} className="mb-6" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid min-w-0 grid-cols-1 content-start gap-6">
            <Panel title="Thông tin cơ bản">
              <div className="grid gap-5">
                <Field label="Tên sản phẩm" required error={errors.name}>
                  <Input
                    value={form.name}
                    required
                    maxLength={160}
                    placeholder="Ví dụ: Giường pallet hộp 20cm"
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
                  label="Đường dẫn (slug)"
                  required
                  error={errors.slug}
                  hint={`Hiển thị tại /san-pham/${form.slug || '…'}. Đổi slug sẽ tự chuyển hướng từ đường dẫn cũ.`}
                >
                  <Input
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    maxLength={160}
                    value={form.slug}
                    onChange={(e) => set('slug', e.target.value)}
                  />
                </Field>
                <Field
                  label="Mô tả ngắn"
                  error={errors.shortDescription}
                  hint="Hiển thị trên card sản phẩm và đầu trang chi tiết."
                >
                  <Textarea
                    rows={2}
                    maxLength={300}
                    value={form.shortDescription}
                    onChange={(e) => set('shortDescription', e.target.value)}
                  />
                </Field>
                <Field label="Mô tả chi tiết" error={errors.description}>
                  <Textarea
                    rows={7}
                    maxLength={12000}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </Field>
              </div>
            </Panel>

            <Panel
              title="Hình ảnh sản phẩm"
              description="Ảnh có ngôi sao là ảnh đại diện. Dùng mũi tên để sắp xếp thứ tự gallery."
              action={<MediaPicker value={form.images} onChange={imagesChanged} label="Chọn ảnh" />}
            >
              {form.images.length === 0 ? (
                <div
                  className={cn(
                    'flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center',
                    errors.images && 'border-destructive/40 bg-[#fdf3f2]',
                  )}
                >
                  <ImagePlus className="size-8 text-muted-foreground" />
                  <p className="mt-3 font-semibold">Chưa có ảnh</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {errors.images || 'Chọn ảnh từ thư viện KIHA để tạo gallery sản phẩm.'}
                  </p>
                </div>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {form.images.map((src, i) => {
                    const cover = src === form.thumbnail;
                    return (
                      <li
                        key={src}
                        className={cn(
                          'overflow-hidden rounded-xl border-2 bg-white',
                          cover ? 'border-olive' : 'border-border',
                        )}
                      >
                        <div className="relative aspect-[4/3] bg-secondary">
                          <Image
                            src={src}
                            alt={`Ảnh ${i + 1}`}
                            fill
                            sizes="200px"
                            className="object-cover"
                          />
                          <span
                            className={cn(
                              'absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-bold',
                              cover ? 'bg-primary text-charcoal' : 'bg-white/90 text-charcoal',
                            )}
                          >
                            {cover ? 'Ảnh đại diện' : `Ảnh ${i + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 p-1.5">
                          <button
                            type="button"
                            aria-label={`Đặt ảnh ${i + 1} làm đại diện`}
                            aria-pressed={cover}
                            onClick={() => set('thumbnail', src)}
                            className={cn(
                              'flex size-8 items-center justify-center rounded-lg hover:bg-secondary',
                              cover ? 'text-gold' : 'text-muted-foreground',
                            )}
                          >
                            <Star className="size-4" fill={cover ? 'currentColor' : 'none'} />
                          </button>
                          <span className="flex">
                            <button
                              type="button"
                              disabled={i === 0}
                              aria-label={`Đưa ảnh ${i + 1} lên trước`}
                              onClick={() => move(i, -1)}
                              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-30"
                            >
                              <ArrowLeft className="size-4" />
                            </button>
                            <button
                              type="button"
                              disabled={i === form.images.length - 1}
                              aria-label={`Đưa ảnh ${i + 1} ra sau`}
                              onClick={() => move(i, 1)}
                              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-30"
                            >
                              <ArrowRight className="size-4" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Bỏ ảnh ${i + 1}`}
                              onClick={() => imagesChanged(form.images.filter((v) => v !== src))}
                              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-[#fdf3f2] hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <Panel
              title="Thông số sản phẩm"
              description="Chỉ nhập thông tin thực tế đã được xác nhận (kích thước, chất liệu, chiều cao…)."
            >
              {form.specifications.length > 0 && (
                <div className="mb-4 grid gap-2.5">
                  {form.specifications.map((spec, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[14rem_1fr_auto]"
                    >
                      <Input
                        aria-label={`Tên thông số ${i + 1}`}
                        placeholder="Ví dụ: Kích thước"
                        required
                        maxLength={120}
                        value={spec.label}
                        onChange={(e) => setSpec(i, 'label', e.target.value)}
                        className="col-span-2 sm:col-span-1"
                      />
                      <Input
                        aria-label={`Giá trị thông số ${i + 1}`}
                        placeholder="Giá trị đã xác nhận"
                        required
                        maxLength={500}
                        value={spec.value}
                        onChange={(e) => setSpec(i, 'value', e.target.value)}
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
                </div>
              )}
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
            </Panel>

            <Panel
              title="Video giới thiệu"
              description="Không bắt buộc. Mỗi sản phẩm gắn một video."
            >
              <ProductVideoEditor
                value={form.video}
                onChange={(src) => set('video', src)}
                poster={form.thumbnail}
                onBusy={setUploading}
              />
              <Field
                className="mt-5"
                label="Nội dung video bằng văn bản"
                hint="Mô tả thao tác hoặc chép lời để khách đọc được khi không bật âm thanh."
              >
                <Textarea
                  rows={4}
                  maxLength={12000}
                  value={form.videoDescription}
                  onChange={(e) => set('videoDescription', e.target.value)}
                />
              </Field>
            </Panel>
          </div>

          <div className="grid min-w-0 grid-cols-1 content-start gap-6">
            <Panel title="Hiển thị">
              <div className="-my-3 divide-y">
                <ToggleRow
                  id="product-published"
                  title="Hiển thị trên website"
                  description={
                    published
                      ? 'Khách hàng xem được sản phẩm.'
                      : 'Đang là bản nháp, chỉ admin thấy.'
                  }
                  checked={published}
                  onCheckedChange={(v) => set('status', v ? 'published' : 'draft')}
                />
                <ToggleRow
                  id="product-featured"
                  title="Sản phẩm nổi bật"
                  description="Xuất hiện ở mục nổi bật trên trang chủ."
                  checked={form.isFeatured}
                  onCheckedChange={(v) => set('isFeatured', v)}
                />
                <ToggleRow
                  id="product-demo"
                  title="Dữ liệu tham khảo"
                  description="Không hiển thị ở production. Bỏ chọn sau khi xác nhận thông tin thật."
                  checked={form.isDemo}
                  onCheckedChange={(v) => set('isDemo', v)}
                />
              </div>
              <Field
                className="mt-5"
                label="Thứ tự hiển thị"
                hint="Số nhỏ hiển thị trước khi sắp xếp theo “Nổi bật”."
                error={errors.sortOrder}
              >
                <Input
                  type="number"
                  min="0"
                  max="99999"
                  value={form.sortOrder}
                  onChange={(e) => set('sortOrder', Number(e.target.value))}
                />
              </Field>
            </Panel>

            <Panel title="Phân loại">
              <Field label="Danh mục chính" required error={errors.category}>
                <NativeSelect
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
                </NativeSelect>
              </Field>
              {categories.length === 0 && (
                <Button asChild variant="link" className="mt-2">
                  <Link href="/admin/danh-muc">Tạo danh mục trước</Link>
                </Button>
              )}
              {categories.length > 1 && (
                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold">Hiển thị thêm trong danh mục</legend>
                  <div className="mt-3 grid gap-2.5">
                    {categories
                      .filter((c) => c._id !== form.category)
                      .map((c) => {
                        const checkboxId = `extra-category-${c._id}`;
                        return (
                          <div key={c._id} className="flex items-center gap-2.5">
                            <Checkbox
                              id={checkboxId}
                              checked={form.categories.includes(c._id)}
                              onCheckedChange={(checked) =>
                                set(
                                  'categories',
                                  checked
                                    ? [...form.categories, c._id]
                                    : form.categories.filter((v) => v !== c._id),
                                )
                              }
                            />
                            <label htmlFor={checkboxId} className="cursor-pointer text-sm">
                              {c.name}
                              {!c.isActive && (
                                <span className="text-muted-foreground"> (đang ẩn)</span>
                              )}
                            </label>
                          </div>
                        );
                      })}
                  </div>
                </fieldset>
              )}
            </Panel>

            <Panel title="Giá">
              <div className="grid gap-5">
                <Field
                  label="Giá hiển thị (VND)"
                  hint="Để trống nếu cần tư vấn báo giá."
                  error={errors.price}
                >
                  <Input
                    type="number"
                    min="0"
                    max="1000000000000"
                    step="1"
                    inputMode="numeric"
                    value={form.price ?? ''}
                    onChange={(e) =>
                      set('price', e.target.value === '' ? null : Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Nhãn khi chưa có giá" error={errors.priceLabel}>
                  <Input
                    value={form.priceLabel}
                    placeholder="Liên hệ báo giá"
                    maxLength={120}
                    onChange={(e) => set('priceLabel', e.target.value)}
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Tối ưu tìm kiếm (SEO)">
              <div className="grid gap-5">
                <Field label="Tiêu đề SEO" error={errors.seoTitle}>
                  <Input
                    value={form.seoTitle}
                    maxLength={160}
                    placeholder={form.name || 'Mặc định dùng tên sản phẩm'}
                    onChange={(e) => set('seoTitle', e.target.value)}
                  />
                </Field>
                <Field label="Mô tả SEO" error={errors.seoDescription}>
                  <Textarea
                    rows={3}
                    value={form.seoDescription}
                    maxLength={320}
                    placeholder={form.shortDescription || 'Mặc định dùng mô tả ngắn'}
                    onChange={(e) => set('seoDescription', e.target.value)}
                  />
                </Field>
                <div className="flex justify-end -mt-3">
                  <Counter value={form.seoDescription} max={320} />
                </div>
                <div
                  className="min-w-0 overflow-hidden rounded-xl border bg-ivory/60 p-4"
                  aria-label="Xem trước kết quả tìm kiếm"
                >
                  <p className="truncate text-xs text-muted-foreground">
                    /san-pham/{form.slug || '…'}
                  </p>
                  <p className="mt-1 line-clamp-1 text-[15px] font-semibold text-[#1a0dab]">
                    {form.seoTitle || form.name || 'Tên sản phẩm'}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
                    {form.seoDescription ||
                      form.shortDescription ||
                      'Mô tả sản phẩm sẽ hiển thị ở đây.'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Ảnh chia sẻ mạng xã hội</p>
                  <p className="mt-0.5 mb-3 text-[13px] text-muted-foreground">
                    Mặc định dùng ảnh đại diện.
                  </p>
                  <MediaPicker
                    multiple={false}
                    label="Chọn ảnh chia sẻ"
                    value={form.seoImage ? [form.seoImage] : []}
                    onChange={(v) => set('seoImage', v[0] || '')}
                  />
                  <ImagePreview
                    src={form.seoImage}
                    alt="Ảnh chia sẻ"
                    removeLabel="Dùng ảnh đại diện"
                    onRemove={() => set('seoImage', '')}
                  />
                </div>
              </div>
            </Panel>
          </div>
        </div>
        <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t bg-ivory/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div className="flex items-center justify-between gap-3">
            <p className="hidden text-sm text-muted-foreground sm:block">
              {uploading
                ? 'Đang tải video…'
                : dirty
                  ? 'Có thay đổi chưa lưu.'
                  : 'Chưa có thay đổi.'}
            </p>
            <div className="ml-auto flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/san-pham">Hủy</Link>
              </Button>
              <Button type="submit" disabled={busy || uploading}>
                {uploading ? 'Đang tải video…' : busy ? 'Đang lưu…' : 'Lưu sản phẩm'}
              </Button>
            </div>
          </div>
        </div>
      </form>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xem trước sản phẩm</DialogTitle>
            <DialogDescription>Nội dung đang chỉnh sửa, chưa lưu lên website.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 sm:grid-cols-[16rem_1fr]">
            {form.thumbnail ? (
              <div className="pointer-events-none">
                <ProductCard
                  product={{ ...form, _id: 'preview', category: mainCategory }}
                  settings={{}}
                  imageSizes="256px"
                />
              </div>
            ) : (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Chưa có ảnh đại diện.
              </p>
            )}
            <div className="min-w-0">
              <h3 className="text-xl font-bold">{form.name || 'Sản phẩm chưa có tên'}</h3>
              {form.shortDescription && (
                <p className="mt-2 text-muted-foreground">{form.shortDescription}</p>
              )}
              {form.description && <p className="prose-kiha mt-4 text-sm">{form.description}</p>}
              {form.specifications.length > 0 && (
                <dl className="mt-4 divide-y rounded-xl border text-sm">
                  {form.specifications.map((s, i) => (
                    <div key={i} className="grid grid-cols-2 gap-3 px-3 py-2">
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
