"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";

const links = [
  { href: "/admin", label: "משובים" },
  { href: "/admin/qr", label: "קוד QR" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="ניווט בלוח הבקרה" className="flex gap-1">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-xl px-3 font-semibold transition-colors",
              active ? "bg-surface-2 text-brass" : "text-muted hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
