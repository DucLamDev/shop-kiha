import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  id,
  align = 'left',
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'items-center text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className="eyebrow">
            <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className="mt-3 text-[1.85rem] font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-[2.6rem]"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-[17px]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
