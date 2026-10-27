import "server-only";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { RATE_LIMIT_PER_HOUR } from "@/lib/constants";

/** The visitor's IP address as reported by Vercel (or "unknown" locally). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}

/** IPs are personal data, so only a salted hash is stored. */
export function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt) {
    throw new Error("Missing environment variable RATE_LIMIT_SALT. See .env.example.");
  }
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Records one submission for this IP. Returns false when the hourly limit is reached. */
export async function consumeRateLimit(supabase: SupabaseClient, ipHash: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_ip_hash: ipHash,
    p_limit: RATE_LIMIT_PER_HOUR,
    p_window_seconds: 60 * 60,
  });
  if (error) throw error;
  return data === true;
}
