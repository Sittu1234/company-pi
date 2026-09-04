import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-navy shadow-sm placeholder:text-slate-400 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20 disabled:bg-slate-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[90px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy shadow-sm placeholder:text-slate-400 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-xs font-semibold text-slate-600", className)} {...props} />;
}

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-navy shadow-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
