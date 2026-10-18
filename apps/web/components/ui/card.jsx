import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn('rounded-2xl border bg-card text-card-foreground shadow-soft', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-1 px-5 pt-5 sm:px-6 sm:pt-6', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h2
      data-slot="card-title"
      className={cn('font-display text-base font-bold tracking-tight', className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn('p-5 sm:p-6', className)} {...props} />;
}
