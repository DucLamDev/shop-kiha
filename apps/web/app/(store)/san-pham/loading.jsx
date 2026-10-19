import { Skeleton } from '@/components/ui/skeleton';
export default function CatalogLoading() {
  return (
    <div className="container-page pt-8 pb-16" aria-busy="true" aria-label="Đang tải sản phẩm">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-8 h-12 w-64" />
      <Skeleton className="mt-4 h-5 w-full max-w-lg" />
      <div className="mt-8 flex gap-3 border-y py-5">
        <Skeleton className="h-12 flex-1 rounded-full" />
        <Skeleton className="hidden h-12 w-56 rounded-full sm:block" />
      </div>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="overflow-hidden rounded-2xl border bg-white">
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-4 h-9 w-full rounded-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
