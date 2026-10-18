'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Field, FormError } from '@/components/admin/shared';
export function Login() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const router = useRouter();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    try {
      await api('/admin/auth/login', {
        method: 'POST',
        body: { email: data.get('email'), password: data.get('password') },
      });
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main-content" className="login-page">
      <div className="login-story">
        <Link href="/" className="wordmark">
          kiha.
        </Link>
        <div>
          <h2>
            Chăm chút
            <br />
            từng góc nhỏ.
          </h2>
          <p>Không gian quản trị của Nội Thất KIHA.</p>
        </div>
        <span className="text-xs">GIẢN DỊ · GẦN GŨI · ẤM ÁP</span>
      </div>
      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <p className="eyebrow">KIHA ADMIN</p>
          <h1>Chào bạn trở lại.</h1>
          <p>Đăng nhập để chăm chút cho bộ sưu tập của KIHA.</p>
          <FormError error={error} />
          <Field label="Email quản trị">
            <input
              name="email"
              type="email"
              autoComplete="username"
              placeholder="Email của bạn"
              required
              maxLength={254}
            />
          </Field>
          <Field label="Mật khẩu">
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              required
              maxLength={128}
            />
          </Field>
          <Button disabled={busy} type="submit">
            {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
            <ArrowRight />
          </Button>
          <Link href="/">Quay lại website KIHA</Link>
        </form>
      </div>
    </main>
  );
}
