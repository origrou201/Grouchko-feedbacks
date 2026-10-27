"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { BARBER_FIRST_NAME, MAX_NAME_LENGTH, MAX_TEXT_LENGTH, PHOTO_BUCKET, sourceFromParam, type TagKey } from "@/lib/constants";
import { getBrowserClient } from "@/lib/supabase/browser";
import { randomUuid } from "@/lib/uuid";
import {
  messages,
  validateFeedbackFields,
  type FeedbackFieldErrors,
  type SubmissionInput,
  type SubmissionResponse,
} from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, FieldError, describedBy } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/inputs";
import { Spinner } from "@/components/ui/Spinner";
import { PhotoPicker, type PickedPhoto } from "./PhotoPicker";
import { TagPicker } from "./TagPicker";

type Status = "idle" | "saving" | "uploading";

// Order used to focus the first field with an error.
const FIELD_ORDER = ["name", "phone", "liked", "toChange", "consent"] as const;

const hints = {
  phone: "רק אם בא לך שאחזור אליך",
};

export function FeedbackForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [liked, setLiked] = useState("");
  const [toChange, setToChange] = useState("");
  const [tags, setTags] = useState<TagKey[]>([]);
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<FeedbackFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  // Created on the first submit and reused for retries, so the server never saves it twice.
  const submissionId = useRef<string | null>(null);
  const isSubmitting = useRef(false);
  const openedAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const busy = status !== "idle";
  const photosProcessing = photos.some((photo) => photo.file === null);

  function clearError(field: keyof FeedbackFieldErrors) {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }

  function toggleTag(tag: TagKey) {
    setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting.current || photosProcessing) return;

    const fields = { name, phone, liked, toChange, tags, consent: consent as true };
    const fieldErrors = validateFeedbackFields(fields);
    if (fieldErrors) {
      setErrors(fieldErrors);
      setFormError(null);
      const firstInvalid = FIELD_ORDER.find((field) => fieldErrors[field]);
      if (firstInvalid) document.getElementById(firstInvalid)?.focus();
      return;
    }

    isSubmitting.current = true;
    setStatus("saving");
    setErrors({});
    setFormError(null);
    let succeeded = false;

    try {
      const readyPhotos = photos.map((photo) => photo.file).filter((file): file is File => file !== null);
      const body: SubmissionInput = {
        ...fields,
        submissionId: (submissionId.current ??= randomUuid()),
        source: sourceFromParam(new URLSearchParams(window.location.search).get("src")),
        photos: readyPhotos.map((file) => ({ contentType: file.type as "image/webp" | "image/jpeg" })),
        website: honeypot.current?.value ?? "",
        elapsedMs: Date.now() - openedAt.current,
      };

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result: SubmissionResponse = await response
        .json()
        .catch(() => ({ ok: false, error: messages.generic }));

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      let photosFailed = false;
      if (result.uploads.length > 0) {
        setStatus("uploading");
        const uploaded = await Promise.all(
          result.uploads.map((upload, index) => uploadPhoto(upload.path, upload.token, readyPhotos[index])),
        );
        photosFailed = uploaded.includes(false);
      }

      succeeded = true;
      router.replace(photosFailed ? "/thank-you?photos=failed" : "/thank-you");
    } catch {
      setFormError(messages.network);
    } finally {
      // After success the button stays disabled until the thank-you page opens.
      if (!succeeded) {
        isSubmitting.current = false;
        setStatus("idle");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5" aria-busy={busy}>
      <Card className="flex flex-col gap-5">
        <Field id="name" label="שם" error={errors.name}>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="איך קוראים לך?"
            maxLength={MAX_NAME_LENGTH}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearError("name");
            }}
            invalid={Boolean(errors.name)}
            aria-required="true"
            aria-describedby={describedBy("name", { error: errors.name })}
            disabled={busy}
          />
        </Field>

        <Field id="phone" label="טלפון" optional hint={hints.phone} error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="050-1234567"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              clearError("phone");
            }}
            invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone", { hint: hints.phone, error: errors.phone })}
            disabled={busy}
          />
        </Field>
      </Card>

      <Card className="flex flex-col gap-5">
        <TagPicker selected={tags} onToggle={toggleTag} disabled={busy} />

        <Field id="liked" label="מה אהבת?" optional error={errors.liked}>
          <Textarea
            id="liked"
            name="liked"
            placeholder="למשל: הפייד יצא חלק, הקו של הזקן מדויק…"
            maxLength={MAX_TEXT_LENGTH}
            value={liked}
            onChange={(event) => {
              setLiked(event.target.value);
              clearError("liked");
            }}
            invalid={Boolean(errors.liked)}
            aria-describedby={describedBy("liked", { error: errors.liked })}
            disabled={busy}
          />
        </Field>

        <Field id="toChange" label="מה היית משנה?" optional error={errors.toChange}>
          <Textarea
            id="toChange"
            name="toChange"
            placeholder="למשל: קצת קצר מדי למעלה, הצדדים לא יצאו סימטריים…"
            maxLength={MAX_TEXT_LENGTH}
            value={toChange}
            onChange={(event) => {
              setToChange(event.target.value);
              clearError("toChange");
            }}
            invalid={Boolean(errors.toChange)}
            aria-describedby={describedBy("toChange", { error: errors.toChange })}
            disabled={busy}
          />
        </Field>
      </Card>

      <Card>
        <PhotoPicker photos={photos} onPhotosChange={setPhotos} disabled={busy} />
      </Card>

      {/* Honeypot: invisible to people, bots tend to fill it in. */}
      <div aria-hidden="true" className="pointer-events-none absolute size-px overflow-hidden opacity-0">
        <label htmlFor="website">אתר אינטרנט</label>
        <input ref={honeypot} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="consent"
          className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-4"
        >
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked);
              clearError("consent");
            }}
            aria-invalid={Boolean(errors.consent) || undefined}
            aria-describedby={describedBy("consent", { error: errors.consent })}
            disabled={busy}
            className="mt-0.5 size-6 shrink-0 cursor-pointer accent-brass"
          />
          <span className="leading-relaxed text-ink/90">
            אני מאשר/ת שהמשוב והתמונות יישמרו ויהיו גלויים רק ל{BARBER_FIRST_NAME}, לצורך שיפור השירות.
          </span>
        </label>
        <FieldError id="consent-error" message={errors.consent} />
      </div>

      {formError && (
        <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-danger-soft">
          {formError}
        </div>
      )}

      <Button type="submit" disabled={busy || photosProcessing} className="min-h-14 text-lg">
        {busy || photosProcessing ? <Spinner /> : <Send aria-hidden="true" className="size-5 -scale-x-100" />}
        <span aria-live="polite">{submitLabel(status, photosProcessing)}</span>
      </Button>
    </form>
  );
}

function submitLabel(status: Status, photosProcessing: boolean): string {
  if (status === "saving") return "שולח את המשוב…";
  if (status === "uploading") return "מעלה את התמונות…";
  if (photosProcessing) return "רגע, מכין את התמונות…";
  return "שליחת המשוב";
}

/** Uploads one photo with its one-time link, retrying once on failure. */
async function uploadPhoto(path: string, token: string, file: File | undefined): Promise<boolean> {
  if (!file) return false;
  const storage = getBrowserClient().storage.from(PHOTO_BUCKET);
  for (let attempt = 0; attempt < 2; attempt++) {
    const { error } = await storage.uploadToSignedUrl(path, token, file, { contentType: file.type });
    if (!error) return true;
  }
  return false;
}
