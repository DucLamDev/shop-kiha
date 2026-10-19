'use client';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        'scrollbar-none inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-accent p-1.5',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 font-display text-[13px] font-semibold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/25 data-[state=active]:bg-white data-[state=active]:text-charcoal data-[state=active]:shadow-soft [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1',
        className,
      )}
      {...props}
    />
  );
}
