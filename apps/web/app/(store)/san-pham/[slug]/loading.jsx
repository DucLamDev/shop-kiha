import { Skeleton } from '@/components/ui/skeleton';
export default function ProductLoading() {
  return (
    <div className="container-page pt-8 pb-16" aria-busy="true" aria-label="Đang tải sản phẩm">
      <Skeleton className="h-4 w-72" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
          <div className="mt-3 flex gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-26" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="mt-5 h-10 w-full" />
          <Skeleton className="mt-3 h-10 w-2/3" />
          <Skeleton className="mt-6 h-5 w-full" />
          <Skeleton className="mt-8 h-56 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
