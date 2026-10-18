import { ProductForm } from '@/components/admin/product-form';
export default async function Page({ params }) {
  const { id } = await params;
  return <ProductForm id={id} />;
}
