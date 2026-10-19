import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-display text-sm font-semibold tracking-[-0.005em] transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-(--ease-soft) outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-walnut-deep hover:shadow-md',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-wood-soft',
        outline:
          'border border-charcoal/15 bg-white/80 text-foreground hover:border-charcoal/35 hover:bg-white',
        ghost: 'text-foreground hover:bg-secondary',
        link: 'rounded-none px-0 text-primary underline-offset-4 hover:underline',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        inverse: 'bg-ivory text-charcoal hover:bg-white',
        'inverse-outline': 'border border-ivory/35 text-ivory hover:border-ivory hover:bg-ivory/10',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-4 text-[13px]',
        lg: 'h-12 px-6 text-[15px]',
        icon: 'size-11',
        'icon-sm': 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
