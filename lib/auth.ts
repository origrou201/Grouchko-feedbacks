import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns a Supabase client for the logged-in admin, or sends the visitor
 * to the login page. Cached so a page calls Supabase Auth only once.
 * Row level security in the database is the final guard either way.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/admin/login");

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) redirect("/admin/login?error=not-admin");

  return supabase;
});
