import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-brass text-bg font-bold hover:bg-brass-light active:bg-brass-dark disabled:bg-brass/50",
  secondary:
    "border border-line-strong bg-surface-2 text-ink hover:border-brass/60 active:bg-surface",
  ghost: "text-muted hover:text-ink hover:bg-surface-2",
  danger: "border border-danger/40 text-danger-soft hover:bg-danger/10",
};

export function buttonClasses(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-base transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-70",
    variants[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
