import "server-only";
import { requireAdmin } from "@/lib/auth";
import { PHOTO_BUCKET, REVIEWS_PAGE_SIZE, SIGNED_URL_TTL_SECONDS } from "@/lib/constants";
import { isDateString, startOfDayInIsrael } from "@/lib/dates";
import type { Review, ReviewStats, ReviewWithPhotos } from "@/lib/types";

export type ReviewFilters = {
  from?: string;
  to?: string;
  unreadOnly: boolean;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Reads the dashboard filters from the URL, ignoring anything invalid. */
export function parseFilters(searchParams: SearchParams): ReviewFilters {
  const from = first(searchParams.from);
  const to = first(searchParams.to);
  const page = Number.parseInt(first(searchParams.page) ?? "1", 10);
  return {
    from: isDateString(from) ? from : undefined,
    to: isDateString(to) ? to : undefined,
    unreadOnly: first(searchParams.unread) === "1",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export async function getStats(): Promise<ReviewStats> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.rpc("review_stats");
  if (error) throw error;
  return data as ReviewStats;
}

export async function getReviews(filters: ReviewFilters) {
  const supabase = await requireAdmin();
  const offset = (filters.page - 1) * REVIEWS_PAGE_SIZE;

  let query = supabase
    .from("reviews")
    .select("id, created_at, name, phone, liked, to_change, tags, photo_paths, source, is_read", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + REVIEWS_PAGE_SIZE - 1);

  if (filters.unreadOnly) query = query.eq("is_read", false);
  if (filters.from) query = query.gte("created_at", startOfDayInIsrael(filters.from).toISOString());
  if (filters.to) query = query.lt("created_at", startOfDayInIsrael(filters.to, 1).toISOString());

  const { data, count, error } = await query.returns<Review[]>();
  if (error) throw error;

  // One request signs every photo on the page. Links expire after 10 minutes.
  const paths = data.flatMap((review) => review.photo_paths);
  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data: urls, error: signError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
    if (signError) throw signError;
    for (const item of urls) {
      // Missing files (e.g. an upload that never finished) come back with an error: skip them.
      if (item.path && item.signedUrl && !item.error) signed.set(item.path, item.signedUrl);
    }
  }

  const reviews: ReviewWithPhotos[] = data.map((review) => ({
    ...review,
    photos: review.photo_paths
      .filter((path) => signed.has(path))
      .map((path) => ({ path, url: signed.get(path)! })),
  }));

  const total = count ?? 0;
  return { reviews, total, pageCount: Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE)) };
}
