'use client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

const sides = {
  right:
    'inset-y-0 right-0 h-full w-[min(88vw,24rem)] border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  left: 'inset-y-0 left-0 h-full w-[min(86vw,20rem)] border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
};

export function SheetContent({ className, children, side = 'right', ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed z-50 flex flex-col bg-background shadow-lift outline-none data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500 data-[state=open]:ease-(--ease-soft)',
          sides[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Đóng"
        >
          <X className="size-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
