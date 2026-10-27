import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

const base =
  "w-full rounded-xl border bg-surface-2 px-4 text-base text-ink placeholder:text-muted/60 transition-colors " +
  "focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/30";

function stateClasses(invalid?: boolean) {
  return invalid ? "border-danger" : "border-line-strong";
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(base, "min-h-12 py-3", stateClasses(invalid), className)}
      {...props}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(base, "min-h-28 resize-y py-3 leading-relaxed", stateClasses(invalid), className)}
      {...props}
    />
  );
}
