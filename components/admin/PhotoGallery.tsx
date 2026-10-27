"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ReviewPhoto } from "@/lib/types";

type PhotoGalleryProps = { photos: ReviewPhoto[]; reviewerName: string };

/** Thumbnails that open a full-size viewer (lightbox) when tapped. */
export function PhotoGallery({ photos, reviewerName }: PhotoGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null && !dialog.open) dialog.showModal();
    if (openIndex === null && dialog.open) dialog.close();
  }, [openIndex]);

  if (photos.length === 0) return null;

  const count = photos.length;
  const showNext = () => setOpenIndex((index) => (index === null ? null : (index + 1) % count));
  const showPrevious = () => setOpenIndex((index) => (index === null ? null : (index - 1 + count) % count));

  return (
    <>
      <ul className="flex gap-2">
        {photos.map((photo, index) => (
          <li key={photo.path}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`הגדלת תמונה ${index + 1} של ${reviewerName}`}
              className="block size-24 overflow-hidden rounded-xl border border-line-strong bg-surface-2 transition hover:border-brass sm:size-28"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
              <img src={photo.url} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setOpenIndex(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpenIndex(null); // tap on the backdrop
        }}
        onKeyDown={(event) => {
          // In RTL the left arrow moves forward.
          if (event.key === "ArrowLeft") showNext();
          if (event.key === "ArrowRight") showPrevious();
        }}
        aria-label={`התמונות של ${reviewerName}`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 text-ink backdrop:bg-black/80"
      >
        {openIndex !== null && (
          <div
            className="flex size-full items-center justify-center p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpenIndex(null);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
            <img
              src={photos[openIndex].url}
              alt={`תמונה ${openIndex + 1} מתוך ${count} של ${reviewerName}`}
              className="max-h-full max-w-full rounded-lg object-contain"
            />

            <button
              type="button"
              autoFocus
              onClick={() => setOpenIndex(null)}
              aria-label="סגירה"
              className="absolute end-4 top-4 grid size-12 place-items-center rounded-full bg-surface/80 hover:bg-surface"
            >
              <X aria-hidden="true" className="size-6" />
            </button>

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="התמונה הקודמת"
                  className="absolute start-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-surface/80 hover:bg-surface"
                >
                  <ChevronRight aria-hidden="true" className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="התמונה הבאה"
                  className="absolute end-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-surface/80 hover:bg-surface"
                >
                  <ChevronLeft aria-hidden="true" className="size-6" />
                </button>
                <p className="absolute inset-x-0 bottom-6 mx-auto w-fit rounded-full bg-surface/80 px-3 py-1 text-sm tabular-nums">
                  {openIndex + 1} מתוך {count}
                </p>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
