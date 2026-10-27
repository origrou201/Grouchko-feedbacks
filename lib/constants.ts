export const SHOP_NAME = "grouchko barbershop";
export const BARBER_NAME = "אורי גרושקו";
export const BARBER_FIRST_NAME = "אורי";

export const PHOTO_BUCKET = "review-photos";
export const MAX_PHOTOS = 3;
export const MAX_ORIGINAL_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_PHOTO_DIMENSION = 1600;

export const MAX_NAME_LENGTH = 80;
export const MAX_TEXT_LENGTH = 1000;

// Spam protection
export const RATE_LIMIT_PER_HOUR = 20;
export const MIN_FILL_TIME_MS = 3000;

// Signed photo links in the dashboard expire after this many seconds.
export const SIGNED_URL_TTL_SECONDS = 10 * 60;

export const REVIEWS_PAGE_SIZE = 20;
export const TIME_ZONE = "Asia/Jerusalem";

// Stored keys (English) and the Hebrew labels shown to users.
export const TAGS = [
  { key: "sides", label: "צדדים" },
  { key: "top", label: "חלק עליון" },
  { key: "beard", label: "זקן" },
  { key: "lineup", label: "קו / קונטור" },
  { key: "length", label: "אורך" },
  { key: "fade", label: "פייד" },
] as const;

export type TagKey = (typeof TAGS)[number]["key"];
export const TAG_KEYS = TAGS.map((tag) => tag.key) as [TagKey, ...TagKey[]];

export function tagLabel(key: string): string {
  return TAGS.find((tag) => tag.key === key)?.label ?? key;
}

export const SOURCES = ["qr", "whatsapp", "direct"] as const;
export type ReviewSource = (typeof SOURCES)[number];

export const SOURCE_LABELS: Record<ReviewSource, string> = {
  qr: "סריקת QR",
  whatsapp: "קישור בוואטסאפ",
  direct: "כניסה ישירה",
};

// Maps the ?src= value in the form link to a stored source.
export function sourceFromParam(param: string | null): ReviewSource {
  if (param === "qr") return "qr";
  if (param === "wa") return "whatsapp";
  return "direct";
}

export const PHOTO_CONTENT_TYPES = ["image/webp", "image/jpeg"] as const;
export type PhotoContentType = (typeof PHOTO_CONTENT_TYPES)[number];
