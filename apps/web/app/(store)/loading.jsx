import { Skeleton } from '@/components/ui/skeleton';
export default function Loading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-label="Đang tải nội dung">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-6 h-12 w-2/3 max-w-xl" />
      <Skeleton className="mt-4 h-5 w-1/2 max-w-md" />
      <Skeleton className="mt-10 aspect-[16/7] w-full rounded-[2rem]" />
    </div>
  );
}
