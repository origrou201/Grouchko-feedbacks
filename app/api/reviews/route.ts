import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { consumeRateLimit, getClientIp, hashIp } from "@/lib/rate-limit";
import { MIN_FILL_TIME_MS, PHOTO_BUCKET } from "@/lib/constants";
import { messages, submissionSchema, type SubmissionResponse } from "@/lib/validation";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Saves a client's feedback. Steps:
 *   1. Validate the body (honeypot, timing, fields).
 *   2. Return the existing review if this exact submission was already saved.
 *   3. Apply the per-IP rate limit.
 *   4. Insert the review and return one-time upload links for its photos.
 * The browser then uploads the photos straight to the private bucket.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply({ ok: false, error: messages.generic }, 400);
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return reply({ ok: false, error: messages.generic }, 400);
  }
  const input = parsed.data;

  // Bots fill in the hidden field. Pretend it worked so they learn nothing.
  if (input.website.trim() !== "") {
    return reply({ ok: true, reviewId: null, uploads: [] });
  }

  if (input.elapsedMs < MIN_FILL_TIME_MS) {
    return reply({ ok: false, error: messages.tooFast }, 400);
  }

  try {
    const supabase = createAdminClient();

    // A retry of the same submission (double tap, flaky network) returns the same review.
    const existing = await findBySubmissionId(supabase, input.submissionId);
    if (existing) {
      return reply({ ok: true, reviewId: existing.id, uploads: await signUploads(supabase, existing.photo_paths) });
    }

    const allowed = await consumeRateLimit(supabase, hashIp(getClientIp(request.headers)));
    if (!allowed) {
      return reply({ ok: false, error: messages.rateLimited }, 429);
    }

    const reviewId = crypto.randomUUID();
    const photoPaths = input.photos.map(
      (photo, index) => `${reviewId}/${index + 1}.${photo.contentType === "image/webp" ? "webp" : "jpg"}`,
    );

    const { error } = await supabase.from("reviews").insert({
      id: reviewId,
      submission_id: input.submissionId,
      name: input.name,
      phone: input.phone,
      liked: input.liked,
      to_change: input.toChange,
      tags: input.tags,
      photo_paths: photoPaths,
      source: input.source,
      consent: input.consent,
    });

    if (error) {
      // Two identical requests raced each other: the other one won, use its review.
      if (error.code === "23505") {
        const winner = await findBySubmissionId(supabase, input.submissionId);
        if (winner) {
          return reply({ ok: true, reviewId: winner.id, uploads: await signUploads(supabase, winner.photo_paths) });
        }
      }
      throw error;
    }

    return reply({ ok: true, reviewId, uploads: await signUploads(supabase, photoPaths) });
  } catch (error) {
    console.error("Failed to save review", error);
    return reply({ ok: false, error: messages.generic }, 500);
  }
}

function reply(body: SubmissionResponse, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function findBySubmissionId(supabase: AdminClient, submissionId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, photo_paths")
    .eq("submission_id", submissionId)
    .maybeSingle<{ id: string; photo_paths: string[] }>();
  if (error) throw error;
  return data;
}

/** One-time links (valid for 2 hours) that allow uploading exactly one file each. */
async function signUploads(supabase: AdminClient, paths: string[]) {
  return Promise.all(
    paths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUploadUrl(path, { upsert: true });
      if (error) throw error;
      return { path: data.path, token: data.token };
    }),
  );
}
