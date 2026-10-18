import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const buttonVariants = cva(
  'button inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'button-primary',
        outline: 'button-outline',
        ghost: 'button-ghost',
        destructive: 'button-danger',
      },
      size: { default: '', sm: 'button-sm', icon: 'button-icon' },
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
