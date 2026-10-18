import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
export const dynamic = 'force-dynamic';
export default async function ProtectedLayout({ children }) {
  const jar = await cookies();
  const token = jar.get('kiha_session');
  if (!token) redirect('/admin/dang-nhap');
  const response = await fetch(`${process.env.API_INTERNAL_URL}/api/admin/auth/me`, {
    headers: { Cookie: `kiha_session=${token.value}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (response.status === 401 || response.status === 403) redirect('/admin/dang-nhap');
  if (!response.ok) throw new Error('Không thể kết nối với hệ thống quản trị.');
  const { data } = await response.json();
  return <AdminShell admin={data}>{children}</AdminShell>;
}
