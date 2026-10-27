import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Called once a day by a Vercel Cron Job (see vercel.json) so the free
 * Supabase project never counts as inactive and gets paused.
 * Vercel sends "Authorization: Bearer <CRON_SECRET>" with every cron request.
 */
export async function GET() {
  const authorization = (await headers()).get("authorization") ?? "";
  if (!isAuthorized(authorization)) {
    return NextResponse.json({ ok: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  // A tiny real query: reads at most one id, returns no review content.
  const { error } = await createAdminClient().from("reviews").select("id").limit(1);
  if (error) {
    console.error("Keep-alive query failed", error);
    return NextResponse.json({ ok: false }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

function isAuthorized(authorization: string): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET is not set, so the keep-alive job cannot run. See the README.");
    return false;
  }
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization);
  return received.length === expected.length && timingSafeEqual(received, expected);
}
