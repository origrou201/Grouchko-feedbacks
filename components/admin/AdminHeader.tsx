import { LogOut } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { Logo } from "@/components/ui/Logo";
import { AdminNav } from "./AdminNav";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur print:hidden">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo compact />
          <AdminNav />
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted hover:bg-surface-2 hover:text-ink"
          >
            <LogOut aria-hidden="true" className="size-5 -scale-x-100" />
            <span className="max-sm:sr-only">יציאה</span>
          </button>
        </form>
      </div>
    </header>
  );
}
