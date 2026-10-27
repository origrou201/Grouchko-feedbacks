import { SHOP_NAME } from "@/lib/constants";
import { cn } from "./cn";

/** Shop wordmark: a brass monogram plus the name. */
export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-brass text-xl font-black text-brass"
      >
        G
      </span>
      {!compact && (
        <span dir="ltr" className="text-lg font-extrabold uppercase tracking-[0.18em] text-ink">
          {SHOP_NAME}
        </span>
      )}
    </div>
  );
}
