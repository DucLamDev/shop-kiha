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
        'flex flex-col items-center rounded-3xl border border-dashed border-charcoal/15 bg-white/60 px-6 py-16 text-center',
        className,
      )}
    >
      {Icon && (
        <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-walnut">
          <Icon className="size-7" strokeWidth={1.5} />
        </span>
      )}
      <Heading className="mt-5 text-xl font-bold sm:text-2xl">{title}</Heading>
      {description && <p className="mt-2 max-w-md text-muted-foreground">{description}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
