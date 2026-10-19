import { AdminProducts } from '@/components/admin/products';
export default async function Page({ searchParams }) {
  const { status } = await searchParams;
  const initial = ['draft', 'published'].includes(status) ? status : '';
  return <AdminProducts key={initial || 'all'} initialStatus={initial} />;
}
