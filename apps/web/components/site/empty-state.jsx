import { cn } from '@/lib/utils';

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
  as: Heading = 'h2',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-3xl border border-dashed border-walnut/20 bg-white/50 px-6 py-16 text-center',
        className,
      )}
    >
      {Icon && (
        <span className="flex size-16 items-center justify-center rounded-full bg-accent text-olive">
          <Icon className="size-7" strokeWidth={1.5} />
        </span>
      )}
      <Heading className="display-title mt-5 text-2xl sm:text-3xl">{title}</Heading>
      {description && <p className="mt-2 max-w-md text-muted-foreground">{description}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
