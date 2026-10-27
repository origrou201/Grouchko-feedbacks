import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata: Metadata = { title: "לוח בקרה | משובים" };

// Access is enforced by the proxy, by requireAdmin() in every page and action,
// and finally by row level security in the database.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh print:bg-white">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 print:p-0">{children}</main>
    </div>
  );
}
