'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  useResource,
  ResourceState,
  Field,
  FormError,
  MediaPicker,
  mutationError,
} from '@/components/admin/shared';
export function AdminSettings() {
  const resource = useResource('/admin/settings');
  if (!resource.data || resource.error) return <ResourceState resource={resource} />;
  return <SettingsEditor initial={resource.data} />;
}
function SettingsEditor({ initial }) {
  const [form, setForm] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api('/admin/settings', { method: 'PUT', body: form });
      toast.success('Đã cập nhật cấu hình website.');
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
          <h1>Cài đặt website</h1>
          <p>Thông tin thương hiệu, liên hệ và nội dung trang chủ.</p>
        </div>
      </div>
      <form onSubmit={save}>
        <FormError error={error} />
        <section className="admin-panel">
          <h2>Thông tin liên hệ</h2>
          <div className="form-grid">
            {[
              ['shopName', 'Tên cửa hàng', 'text'],
              ['phone', 'Số điện thoại', 'tel'],
              ['zaloUrl', 'Liên kết Zalo', 'url'],
              ['facebookUrl', 'Facebook', 'url'],
              ['tiktokUrl', 'TikTok', 'url'],
              ['mapsUrl', 'Google Maps', 'url'],
            ].map(([key, label, type]) => (
              <Field label={label} key={key}>
                <input
                  type={type}
                  required={key === 'shopName'}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                />
              </Field>
            ))}
            <Field label="Địa chỉ" className="form-full">
              <input
                maxLength={500}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
              />
            </Field>
          </div>
          <p className="muted text-xs">
            Bỏ trống kênh chưa có thông tin. Website chỉ hiển thị liên kết đã được cấu hình.
          </p>
        </section>
        <section className="admin-panel">
          <h2>Hình ảnh thương hiệu</h2>
          <p className="muted text-xs mb-5">
            Ảnh có tên bắt đầu bằng “AI” dùng minh họa không gian. Website tự hiển thị chú thích cho
            các ảnh này.
          </p>
          <div className="form-grid">
            {[
              ['logo', 'Logo cửa hàng'],
              ['heroImage', 'Ảnh trang chủ'],
              ['aboutImage', 'Ảnh câu chuyện KIHA'],
            ].map(([key, label]) => (
              <div key={key}>
                <p className="text-xs mb-3">{label}</p>
                <MediaPicker
                  multiple={false}
                  label={`Chọn ${label.toLowerCase()}`}
                  value={form[key] ? [form[key]] : []}
                  onChange={(v) => set(key, v[0] || '')}
                />
                {form[key] && (
                  <div className="mt-4 mb-5">
                    <Image
                      src={form[key]}
                      alt={label}
                      width={240}
                      height={140}
                      style={{ objectFit: 'contain', background: '#f0ece4', borderRadius: 4 }}
                    />
                    <Button type="button" size="sm" variant="ghost" onClick={() => set(key, '')}>
                      Bỏ ảnh
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="admin-panel">
          <h2>Nội dung trang chủ</h2>
          <div className="form-grid">
            <Field label="Tiêu đề hero">
              <textarea
                required
                maxLength={180}
                value={form.heroTitle}
                onChange={(e) => set('heroTitle', e.target.value)}
              />
            </Field>
            <Field label="Mô tả hero">
              <textarea
                maxLength={500}
                value={form.heroDescription}
                onChange={(e) => set('heroDescription', e.target.value)}
              />
            </Field>
            <Field label="Tiêu đề giới thiệu">
              <textarea
                maxLength={200}
                value={form.aboutTitle}
                onChange={(e) => set('aboutTitle', e.target.value)}
              />
            </Field>
            <Field label="Nội dung giới thiệu">
              <textarea
                maxLength={3000}
                value={form.aboutDescription}
                onChange={(e) => set('aboutDescription', e.target.value)}
              />
            </Field>
          </div>
        </section>
        <section className="admin-panel">
          <h2>Nội dung tư vấn & cam kết</h2>
          <p className="muted text-xs mb-5">Chỉ sử dụng cam kết mà KIHA có thể xác nhận.</p>
          {form.commitments.map((item, i) => (
            <div className="form-grid" key={i}>
              <Field label={`Tiêu đề ${i + 1}`}>
                <input
                  required
                  maxLength={120}
                  value={item.title}
                  onChange={(e) =>
                    set(
                      'commitments',
                      form.commitments.map((v, n) =>
                        n === i ? { ...v, title: e.target.value } : v,
                      ),
                    )
                  }
                />
              </Field>
              <div className="flex gap-2">
                <Field label="Nội dung" className="flex-1">
                  <textarea
                    maxLength={500}
                    value={item.description}
                    onChange={(e) =>
                      set(
                        'commitments',
                        form.commitments.map((v, n) =>
                          n === i ? { ...v, description: e.target.value } : v,
                        ),
                      )
                    }
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6"
                  aria-label={`Bỏ nội dung ${i + 1}`}
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
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={form.commitments.length >= 6}
            onClick={() =>
              set('commitments', [...form.commitments, { title: '', description: '' }])
            }
          >
            <Plus />
            Thêm nội dung
          </Button>
        </section>
        <section className="admin-panel">
          <h2>SEO mặc định</h2>
          <Field label="Tiêu đề website">
            <input
              maxLength={160}
              value={form.seoTitle}
              onChange={(e) => set('seoTitle', e.target.value)}
            />
          </Field>
          <Field label="Mô tả website">
            <textarea
              maxLength={320}
              value={form.seoDescription}
              onChange={(e) => set('seoDescription', e.target.value)}
            />
          </Field>
        </section>
        <div className="form-save">
          <Button type="submit" disabled={busy}>
            {busy ? 'Đang lưu…' : 'Lưu cài đặt'}
          </Button>
        </div>
      </form>
    </>
  );
}
