"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { PHOTO_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type SignInState = { error: string | null; email: string };

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = signInSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) {
    return { error: "צריך למלא אימייל וסיסמה", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "האימייל או הסיסמה לא נכונים", email };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "לחשבון הזה אין הרשאה ללוח הבקרה", email };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const idSchema = z.uuid();

export async function setReadStatus(reviewId: string, isRead: boolean): Promise<ActionResult> {
  if (!idSchema.safeParse(reviewId).success) return { ok: false, error: "משוב לא תקין" };

  const supabase = await requireAdmin();
  const { error } = await supabase.from("reviews").update({ is_read: isRead }).eq("id", reviewId);
  if (error) return { ok: false, error: "לא הצלחנו לעדכן. נסו שוב." };

  refresh();
  return { ok: true };
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  if (!idSchema.safeParse(reviewId).success) return { ok: false, error: "משוב לא תקין" };

  const supabase = await requireAdmin();
  const { data: review, error: fetchError } = await supabase
    .from("reviews")
    .select("photo_paths")
    .eq("id", reviewId)
    .maybeSingle<{ photo_paths: string[] }>();
  if (fetchError) return { ok: false, error: "לא הצלחנו למחוק. נסו שוב." };
  if (!review) {
    refresh();
    return { ok: true };
  }

  // Photos first: if this fails the review stays, so nothing is left orphaned.
  if (review.photo_paths.length > 0) {
    const { error: storageError } = await supabase.storage.from(PHOTO_BUCKET).remove(review.photo_paths);
    if (storageError) return { ok: false, error: "לא הצלחנו למחוק את התמונות. נסו שוב." };
  }

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { ok: false, error: "לא הצלחנו למחוק. נסו שוב." };

  refresh();
  return { ok: true };
}
