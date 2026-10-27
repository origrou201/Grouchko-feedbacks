import { z } from "zod";
import {
  MAX_NAME_LENGTH,
  MAX_PHOTOS,
  MAX_TEXT_LENGTH,
  PHOTO_CONTENT_TYPES,
  SOURCES,
  TAG_KEYS,
} from "@/lib/constants";

export const messages = {
  nameRequired: "נשמח לדעת איך קוראים לך",
  nameTooLong: `השם ארוך מדי (עד ${MAX_NAME_LENGTH} תווים)`,
  phoneInvalid: "מספר הטלפון לא נראה תקין. לדוגמה: 050-1234567",
  textTooLong: `אפשר לכתוב עד ${MAX_TEXT_LENGTH.toLocaleString("he-IL")} תווים`,
  consentRequired: "כדי לשלוח צריך לאשר את שמירת המשוב",
  photoNotImage: "אפשר להעלות רק תמונות",
  photoTooLarge: "התמונה גדולה מדי (עד 10MB)",
  photoTooMany: `אפשר להעלות עד ${MAX_PHOTOS} תמונות`,
  photoProcessingFailed: "לא הצלחנו לעבד את התמונה הזאת. נסו תמונה אחרת.",
  tooFast: "רגע, זה היה מהיר מדי 🙂 נסו לשלוח שוב בעוד כמה שניות.",
  rateLimited: "התקבלו הרבה משובים מהרשת הזאת בשעה האחרונה. נסו שוב מאוחר יותר.",
  generic: "משהו השתבש בשליחה. נסו שוב בעוד רגע.",
  network: "נראה שאין חיבור לאינטרנט. בדקו את החיבור ונסו שוב.",
} as const;

/**
 * Accepts 050-1234567, 0501234567, 050 123 4567, +972501234567 or 972-50-1234567
 * and returns the 10-digit local form (0501234567), or null if it isn't valid.
 */
export function normalizeIsraeliMobile(input: string): string | null {
  let digits = input.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+972")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("972")) digits = "0" + digits.slice(3);
  return /^05\d{8}$/.test(digits) ? digits : null;
}

/** 0501234567 → 050-1234567 */
export function formatPhone(phone: string): string {
  return `${phone.slice(0, 3)}-${phone.slice(3)}`;
}

const optionalText = z
  .string()
  .trim()
  .max(MAX_TEXT_LENGTH, { error: messages.textTooLong })
  .transform((value) => (value === "" ? null : value));

// Fields the client fills in. Shared by the form (browser) and the API (server).
export const feedbackFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: messages.nameRequired })
    .max(MAX_NAME_LENGTH, { error: messages.nameTooLong }),
  phone: z
    .string()
    .trim()
    .max(30, { error: messages.phoneInvalid })
    .transform((value, ctx) => {
      if (value === "") return null;
      const normalized = normalizeIsraeliMobile(value);
      if (!normalized) {
        ctx.addIssue({ code: "custom", message: messages.phoneInvalid });
        return z.NEVER;
      }
      return normalized;
    }),
  liked: optionalText,
  toChange: optionalText,
  tags: z
    .array(z.enum(TAG_KEYS))
    .max(TAG_KEYS.length)
    .transform((tags) => [...new Set(tags)]),
  consent: z.literal(true, { error: messages.consentRequired }),
});

export type FeedbackFieldsInput = z.input<typeof feedbackFieldsSchema>;
export type FeedbackFieldErrors = Partial<Record<keyof FeedbackFieldsInput, string>>;

// The full request body sent to POST /api/reviews.
export const submissionSchema = feedbackFieldsSchema.extend({
  submissionId: z.uuid(),
  source: z.enum(SOURCES),
  photos: z
    .array(z.object({ contentType: z.enum(PHOTO_CONTENT_TYPES) }))
    .max(MAX_PHOTOS),
  // Honeypot: a hidden field that people never see, so it must stay empty.
  website: z.string().max(200),
  // How long the form was open before submitting (measured in the browser).
  elapsedMs: z.number().int().nonnegative(),
});

export type SubmissionInput = z.input<typeof submissionSchema>;

export type SubmissionResponse =
  | { ok: true; reviewId: string | null; uploads: { path: string; token: string }[] }
  | { ok: false; error: string };

/** Returns the first error message per field, or null when the fields are valid. */
export function validateFeedbackFields(input: FeedbackFieldsInput): FeedbackFieldErrors | null {
  const result = feedbackFieldsSchema.safeParse(input);
  if (result.success) return null;

  const errors: FeedbackFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof FeedbackFieldsInput | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
