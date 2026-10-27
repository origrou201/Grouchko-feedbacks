"use client";

import { useSearchParams } from "next/navigation";

/** Shown when the review was saved but some photos didn't upload. */
export function PhotoUploadNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("photos") !== "failed") return null;

  return (
    <p role="status" className="rounded-xl border border-brass/40 bg-brass/10 p-4 text-brass-light">
      המשוב נשמר, אבל חלק מהתמונות לא הצליחו לעלות. לא נורא – אפשר לשלוח לי אותן גם בוואטסאפ.
    </p>
  );
}
