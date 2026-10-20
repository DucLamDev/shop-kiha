import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold [&_svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        sage: 'border-transparent bg-accent text-olive',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border bg-white/70 text-foreground',
        success: 'border-transparent bg-[#e5efe6] text-success',
        muted: 'border-transparent bg-muted text-muted-foreground',
        glass: 'border-white/40 bg-white/85 text-charcoal backdrop-blur',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Badge({ className, variant, ...props }) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
