'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { api } from '@/lib/api';
import { editorialImages } from '@/lib/editorial-assets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FormError } from '@/components/admin/shared';

export function Login() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null),
    [show, setShow] = useState(false);
  const router = useRouter();
  const image = editorialImages.hero?.src;
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
    <main id="main-content" className="grid min-h-dvh bg-ivory lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-charcoal lg:block">
        {image && (
          <Image src={image} alt="" fill sizes="55vw" className="object-cover opacity-70" preload />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-charcoal/10" />
        <div className="relative flex h-full flex-col justify-between p-12 text-ivory">
          <Link href="/" className="font-display text-4xl font-extrabold tracking-[-0.06em]">
            kiha<span className="text-wood">.</span>
          </Link>
          <div>
            <p className="max-w-md font-display text-4xl leading-tight font-extrabold tracking-[-0.03em]">
              Chăm chút bộ sưu tập giường gỗ của KIHA.
            </p>
            <p className="mt-4 max-w-sm text-ivory/70">
              Quản lý sản phẩm, danh mục, hình ảnh và thông tin liên hệ hiển thị trên website.
            </p>
          </div>
          <p className="text-xs text-ivory/50">Ảnh minh họa AI</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="font-display text-3xl font-extrabold tracking-[-0.06em] lg:hidden"
          >
            kiha<span className="text-wood">.</span>
          </Link>
          <span className="mt-10 flex size-12 items-center justify-center rounded-2xl bg-white text-walnut shadow-soft lg:mt-0">
            <LockKeyhole className="size-5" />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-[-0.03em]">Đăng nhập quản trị</h1>
          <p className="mt-2 text-muted-foreground">Dành cho tài khoản quản trị viên của KIHA.</p>
          <form className="mt-8 grid gap-5" onSubmit={submit}>
            <FormError error={error} />
            <Field label="Email quản trị">
              <Input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="ten@email.com"
                required
                maxLength={254}
              />
            </Field>
            <div className="grid gap-2">
              <label htmlFor="admin-password" className="text-sm font-semibold">
                Mật khẩu
              </label>
              <div className="relative">
                <Input
                  id="admin-password"
                  name="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  required
                  maxLength={128}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-pressed={show}
                  className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button disabled={busy} type="submit" size="lg" className="mt-2 w-full">
              {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
              {!busy && <ArrowRight />}
            </Button>
          </form>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Quay lại website
          </Link>
        </div>
      </div>
    </main>
  );
}
