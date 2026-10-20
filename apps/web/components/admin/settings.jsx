'use client';
import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { isEditorialImage } from '@/lib/editorial-assets';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useResource,
  ResourceState,
  Field,
  FormError,
  MediaPicker,
  PageHeader,
  Panel,
  ImagePreview,
  fieldErrors,
  mutationError,
} from '@/components/admin/shared';

const keys = [
  'shopName',
  'phone',
  'zaloUrl',
  'facebookUrl',
  'tiktokUrl',
  'mapsUrl',
  'mapLocation',
  'statistics',
  'address',
  'logo',
  'heroImage',
  'aboutImage',
  'heroTitle',
  'heroDescription',
  'aboutTitle',
  'aboutDescription',
  'commitments',
  'seoTitle',
  'seoDescription',
];
const tabOf = {
  contact: [
    'shopName',
    'phone',
    'zaloUrl',
    'facebookUrl',
    'tiktokUrl',
    'mapsUrl',
    'mapLocation',
    'address',
  ],
  brand: ['logo', 'heroImage', 'aboutImage'],
  home: [
    'heroTitle',
    'heroDescription',
    'aboutTitle',
    'aboutDescription',
    'commitments',
    'statistics',
  ],
  seo: ['seoTitle', 'seoDescription'],
};

const contactFields = [
  ['shopName', 'Tên cửa hàng', 'text', 'Nội Thất KIHA', 'Hiển thị ở chân trang và dữ liệu SEO.'],
  ['phone', 'Số điện thoại', 'tel', '0900 000 000', 'Dùng cho nút Gọi điện trên website.'],
  ['zaloUrl', 'Liên kết Zalo', 'url', 'https://zalo.me/…', 'Chỉ nhận liên kết https://zalo.me.'],
  ['facebookUrl', 'Facebook', 'url', 'https://www.facebook.com/…', ''],
  ['tiktokUrl', 'TikTok', 'url', 'https://www.tiktok.com/@…', ''],
  [
    'mapsUrl',
    'Google Maps',
    'url',
    'https://maps.app.goo.gl/…',
    'Liên kết chia sẻ vị trí từ Google Maps.',
  ],
];

export function AdminSettings() {
  const resource = useResource('/admin/settings');
  if (!resource.data || resource.error) return <ResourceState resource={resource} />;
  return <SettingsEditor initial={resource.data} />;
}

function SettingsEditor({ initial }) {
  const defaults = {
    commitments: [],
    mapLocation: null,
    statistics: {
      salesCount: null,
      interestedCount: null,
      positiveReviewCount: null,
      customerCount: null,
      ratingAverage: null,
      reviewCount: null,
      source: '',
    },
  };
  const [saved, setSaved] = useState(() =>
    Object.fromEntries(keys.map((k) => [k, initial[k] ?? (k in defaults ? defaults[k] : '')])),
  );
  const [form, setForm] = useState(saved),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(null),
    [tab, setTab] = useState('contact');
  const errors = fieldErrors(error);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const tabHasError = (name) =>
    Object.keys(errors).some((p) => tabOf[name].includes(p.split('.')[0]));

  useEffect(() => {
    if (!dirty || busy) return;
    const warn = (event) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);

  function setCommitment(i, key, value) {
    set(
      'commitments',
      form.commitments.map((v, n) => (n === i ? { ...v, [key]: value } : v)),
    );
  }
  function moveCommitment(i, step) {
    const list = [...form.commitments];
    [list[i], list[i + step]] = [list[i + step], list[i]];
    set('commitments', list);
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = {
        ...form,
        mapLocation:
          form.mapLocation?.latitude == null && form.mapLocation?.longitude == null
            ? null
            : form.mapLocation,
      };
      const result = await api('/admin/settings', { method: 'PUT', body });
      const next = Object.fromEntries(keys.map((k) => [k, result?.[k] ?? form[k]]));
      setSaved(next);
      setForm(next);
      toast.success('Đã cập nhật cấu hình website.');
    } catch (err) {
      mutationError(err, setError);
      const first = Object.keys(tabOf).find((name) =>
        (err.fields || []).some((f) => tabOf[name].includes(String(f.path).split('.')[0])),
      );
      if (first) setTab(first);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBusy(false);
    }
  }
  const tabs = [
    ['contact', 'Liên hệ'],
    ['brand', 'Hình ảnh thương hiệu'],
    ['home', 'Nội dung trang chủ'],
    ['seo', 'SEO'],
  ];
  return (
    <>
      <PageHeader
        title="Cài đặt website"
        description="Thông tin liên hệ, hình ảnh thương hiệu và nội dung hiển thị trên trang chủ."
      />
      <form onSubmit={save}>
        <FormError error={error} className="mb-6" />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="Nhóm cài đặt">
            {tabs.map(([value, label]) => (
              <TabsTrigger key={value} value={value}>
                {label}
                {tabHasError(value) && (
                  <span className="size-2 rounded-full bg-destructive" aria-label="có lỗi" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="contact" className="mt-6">
            <Panel
              title="Thông tin liên hệ"
              description="Bỏ trống kênh chưa có. Website chỉ hiển thị liên kết đã được cấu hình, không tạo link giả."
            >
              <div className="grid gap-5 md:grid-cols-2">
                {contactFields.map(([key, label, type, placeholder, hint]) => (
                  <Field
                    label={label}
                    key={key}
                    hint={hint || undefined}
                    error={errors[key]}
                    required={key === 'shopName'}
                  >
                    <Input
                      type={type}
                      required={key === 'shopName'}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                    />
                  </Field>
                ))}
                <Field
                  label="Địa chỉ"
                  className="md:col-span-2"
                  error={errors.address}
                  hint="Khi có địa chỉ, trang liên hệ hiển thị bản đồ nhúng."
                >
                  <Input
                    maxLength={500}
                    placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 rounded-2xl border bg-ivory/50 p-4 md:col-span-2 md:grid-cols-2">
                  <p className="text-sm text-muted-foreground md:col-span-2">
                    Tọa độ ghim cửa hàng trên Google Maps. Khi có đủ hai tọa độ, bản đồ sẽ ưu tiên
                    vị trí này thay vì tìm theo địa chỉ.
                  </p>
                  {[
                    ['latitude', 'Vĩ độ', -90, 90],
                    ['longitude', 'Kinh độ', -180, 180],
                  ].map(([key, label, min, max]) => (
                    <Field key={key} label={label} error={errors[`mapLocation.${key}`]}>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min={min}
                        max={max}
                        value={form.mapLocation?.[key] ?? ''}
                        onChange={(event) =>
                          set('mapLocation', {
                            latitude: form.mapLocation?.latitude ?? null,
                            longitude: form.mapLocation?.longitude ?? null,
                            [key]: event.target.value === '' ? null : Number(event.target.value),
                          })
                        }
                      />
                    </Field>
                  ))}
                </div>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="brand" className="mt-6">
            <Panel
              title="Hình ảnh thương hiệu"
              description="Chọn logo, ảnh banner đầu tiên và ảnh phần giới thiệu. Thông tin nguồn ảnh chỉ hiển thị trong quản trị."
            >
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  ['logo', 'Logo cửa hàng', 'Hiển thị ở đầu trang.'],
                  ['heroImage', 'Ảnh đầu trang chủ', 'Ảnh lớn cạnh tiêu đề trang chủ.'],
                  ['aboutImage', 'Ảnh phần giới thiệu', 'Dùng ở mục Về KIHA và trang liên hệ.'],
                ].map(([key, label, hint]) => (
                  <div key={key} className="rounded-2xl border bg-ivory/50 p-4">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="mt-0.5 mb-3 text-[13px] text-muted-foreground">{hint}</p>
                    <MediaPicker
                      multiple={false}
                      label="Chọn ảnh"
                      value={form[key] ? [form[key]] : []}
                      onChange={(v) => set(key, v[0] || '')}
                    />
                    <ImagePreview src={form[key]} alt={label} onRemove={() => set(key, '')} />
                    {isEditorialImage(form[key]) && (
                      <p className="mt-2 text-xs text-muted-foreground">Ảnh minh họa AI</p>
                    )}
                    {errors[key] && (
                      <p className="mt-2 text-[13px] text-destructive">{errors[key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="home" className="mt-6 grid gap-6">
            <Panel
              title="KIHA qua những con số"
              description="Ba chỉ số trên trang chủ có hiệu ứng đếm tăng khi cuộn tới. Nhập số liệu thực tế của cửa hàng; để trống sẽ hiển thị “Đang cập nhật”. Đây là số liệu do KIHA tổng hợp, không tự tăng theo lượt truy cập website."
            >
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  ['salesCount', 'Lượt bán', 100000000, 1],
                  ['interestedCount', 'Khách hàng quan tâm', 100000000, 1],
                  ['positiveReviewCount', 'Lượt đánh giá tốt', 100000000, 1],
                ].map(([key, label, max, step]) => (
                  <Field key={key} label={label} error={errors[`statistics.${key}`]}>
                    <Input
                      type="number"
                      inputMode={step === 1 ? 'numeric' : 'decimal'}
                      min={0}
                      max={max}
                      step={step}
                      value={form.statistics[key] ?? ''}
                      onChange={(event) =>
                        set('statistics', {
                          ...form.statistics,
                          [key]: event.target.value === '' ? null : Number(event.target.value),
                        })
                      }
                    />
                  </Field>
                ))}
                <Field
                  label="Nguồn / thời điểm cập nhật"
                  className="md:col-span-3"
                  error={errors['statistics.source']}
                >
                  <Input
                    maxLength={300}
                    value={form.statistics.source || ''}
                    placeholder="Nguồn đánh giá và thời điểm tổng hợp"
                    onChange={(event) =>
                      set('statistics', { ...form.statistics, source: event.target.value })
                    }
                  />
                </Field>
              </div>
            </Panel>
            <Panel
              title="Phần đầu trang chủ"
              description="Mỗi dòng trong tiêu đề hiển thị trên một dòng riêng."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Tiêu đề" required error={errors.heroTitle}>
                  <Textarea
                    required
                    rows={3}
                    maxLength={180}
                    value={form.heroTitle}
                    onChange={(e) => set('heroTitle', e.target.value)}
                  />
                </Field>
                <Field label="Mô tả" error={errors.heroDescription}>
                  <Textarea
                    rows={3}
                    maxLength={500}
                    value={form.heroDescription}
                    onChange={(e) => set('heroDescription', e.target.value)}
                  />
                </Field>
              </div>
            </Panel>
            <Panel title="Giới thiệu KIHA">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Tiêu đề" error={errors.aboutTitle}>
                  <Textarea
                    rows={3}
                    maxLength={200}
                    value={form.aboutTitle}
                    onChange={(e) => set('aboutTitle', e.target.value)}
                  />
                </Field>
                <Field label="Nội dung" error={errors.aboutDescription}>
                  <Textarea
                    rows={5}
                    maxLength={3000}
                    value={form.aboutDescription}
                    onChange={(e) => set('aboutDescription', e.target.value)}
                  />
                </Field>
              </div>
            </Panel>
            <Panel
              title="Cam kết & quy trình tư vấn"
              description="Hiển thị ở trang chủ, trang sản phẩm và trang liên hệ. Chỉ dùng nội dung KIHA xác nhận được. Tối đa 6 mục."
            >
              <ol className="grid gap-3">
                {form.commitments.map((item, i) => (
                  <li
                    key={i}
                    className="grid gap-3 rounded-2xl border bg-ivory/50 p-4 md:grid-cols-[2.25rem_1fr_1.4fr_auto] md:items-start"
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-accent font-display text-sm text-olive">
                      {i + 1}
                    </span>
                    <Field label="Tiêu đề" required error={errors[`commitments.${i}.title`]}>
                      <Input
                        required
                        maxLength={120}
                        value={item.title}
                        onChange={(e) => setCommitment(i, 'title', e.target.value)}
                      />
                    </Field>
                    <Field label="Nội dung" error={errors[`commitments.${i}.description`]}>
                      <Input
                        maxLength={500}
                        value={item.description}
                        onChange={(e) => setCommitment(i, 'description', e.target.value)}
                      />
                    </Field>
                    <div className="flex gap-1 md:mt-7">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={i === 0}
                        aria-label={`Đưa mục ${i + 1} lên`}
                        onClick={() => moveCommitment(i, -1)}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={i === form.commitments.length - 1}
                        aria-label={`Đưa mục ${i + 1} xuống`}
                        onClick={() => moveCommitment(i, 1)}
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Bỏ mục ${i + 1}`}
                        className="hover:bg-[#fdf3f2] hover:text-destructive"
                        onClick={() =>
                          set(
                            'commitments',
                            form.commitments.filter((_, n) => n !== i),
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={form.commitments.length >= 6}
                onClick={() =>
                  set('commitments', [...form.commitments, { title: '', description: '' }])
                }
              >
                <Plus />
                Thêm mục
              </Button>
            </Panel>
          </TabsContent>

          <TabsContent value="seo" className="mt-6">
            <Panel
              title="SEO mặc định"
              description="Dùng cho trang chủ và khi trang không có nội dung SEO riêng."
            >
              <div className="grid gap-5">
                <Field label="Tiêu đề website" error={errors.seoTitle} hint="Nên dưới 60 ký tự.">
                  <Input
                    maxLength={160}
                    value={form.seoTitle}
                    onChange={(e) => set('seoTitle', e.target.value)}
                  />
                </Field>
                <Field
                  label="Mô tả website"
                  error={errors.seoDescription}
                  hint="Nên trong khoảng 120–160 ký tự."
                >
                  <Textarea
                    rows={3}
                    maxLength={320}
                    value={form.seoDescription}
                    onChange={(e) => set('seoDescription', e.target.value)}
                  />
                </Field>
                <div
                  className="min-w-0 overflow-hidden rounded-xl border bg-ivory/60 p-4"
                  aria-label="Xem trước kết quả tìm kiếm"
                >
                  <p className="text-xs text-muted-foreground">Trang chủ</p>
                  <p className="mt-1 line-clamp-1 text-[15px] font-semibold text-[#1a0dab]">
                    {form.seoTitle || form.shopName}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
                    {form.seoDescription}
                  </p>
                </div>
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
        <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t bg-ivory/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {dirty ? 'Có thay đổi chưa lưu.' : 'Mọi thay đổi đã được lưu.'}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!dirty || busy}
                onClick={() => {
                  setForm(saved);
                  setError(null);
                }}
              >
                Hoàn tác
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Đang lưu…' : 'Lưu cài đặt'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
