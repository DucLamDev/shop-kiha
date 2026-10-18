import { cn } from '@/lib/utils';

export const fieldBase =
  'w-full min-w-0 rounded-xl border border-input bg-white px-3.5 text-[15px] text-foreground shadow-[inset_0_1px_1px_rgb(38_36_34/0.03)] transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/75 hover:border-charcoal/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-destructive/15';

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(fieldBase, 'h-11 py-2', className)}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldBase, 'min-h-24 py-2.5 leading-relaxed', className)}
      {...props}
    />
  );
}
