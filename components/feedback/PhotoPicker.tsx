"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { MAX_PHOTOS } from "@/lib/constants";
import { checkPickedFile, compressPhoto } from "@/lib/image";
import { randomUuid } from "@/lib/uuid";
import { messages } from "@/lib/validation";
import { FieldError } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";

/** A picked photo. `file` and `previewUrl` are null while it is still being compressed. */
export type PickedPhoto = { id: string; file: File | null; previewUrl: string | null };

type PhotoPickerProps = {
  photos: PickedPhoto[];
  onPhotosChange: Dispatch<SetStateAction<PickedPhoto[]>>;
  disabled?: boolean;
};

export function PhotoPicker({ photos, onPhotosChange, disabled }: PhotoPickerProps) {
  const [error, setError] = useState<string | null>(null);
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // Free the preview images from memory when the form goes away.
  useEffect(() => {
    return () => {
      for (const photo of photosRef.current) {
        if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
      }
    };
  }, []);

  const remaining = MAX_PHOTOS - photos.length;
  const isFull = remaining <= 0;

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = ""; // allow picking the same file again later
    if (files.length === 0) return;

    let problem: string | null = files.length > remaining ? messages.photoTooMany : null;
    const accepted: { id: string; file: File }[] = [];
    for (const file of files.slice(0, Math.max(remaining, 0))) {
      const fileProblem = checkPickedFile(file);
      if (fileProblem) problem = fileProblem;
      else accepted.push({ id: randomUuid(), file });
    }
    setError(problem);
    if (accepted.length === 0) return;

    onPhotosChange((current) =>
      [...current, ...accepted.map(({ id }) => ({ id, file: null, previewUrl: null }))].slice(0, MAX_PHOTOS),
    );

    await Promise.all(
      accepted.map(async ({ id, file }) => {
        try {
          const compressed = await compressPhoto(file);
          const previewUrl = URL.createObjectURL(compressed);
          onPhotosChange((current) => {
            if (!current.some((photo) => photo.id === id)) {
              URL.revokeObjectURL(previewUrl); // removed while compressing
              return current;
            }
            return current.map((photo) => (photo.id === id ? { id, file: compressed, previewUrl } : photo));
          });
        } catch {
          setError(messages.photoProcessingFailed);
          onPhotosChange((current) => current.filter((photo) => photo.id !== id));
        }
      }),
    );
  }

  function removePhoto(id: string) {
    const photo = photos.find((item) => item.id === id);
    if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    onPhotosChange((current) => current.filter((item) => item.id !== id));
    setError(null);
  }

  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="mb-1 text-base font-semibold text-ink">
        תמונות
        <span className="ms-2 text-sm font-normal text-muted">(לא חובה, אבל מאוד עוזר)</span>
      </legend>
      <p className="text-sm text-muted">
        אפשר לצלם עכשיו או לבחור מהגלריה, עד {MAX_PHOTOS} תמונות. תמונה של מה שאהבת (או פחות) שווה אלף
        מילים.
      </p>

      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-xl border border-line-strong bg-surface-2"
            >
              {photo.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                <img
                  src={photo.previewUrl}
                  alt={`תמונה ${index + 1} שנבחרה`}
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center text-brass" role="status">
                  <Spinner />
                  <span className="sr-only">מכין את התמונה…</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                aria-label={`הסרת תמונה ${index + 1}`}
                className="absolute end-1 top-1 grid size-10 place-items-center rounded-full bg-bg/80 text-ink backdrop-blur hover:bg-danger hover:text-white"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isFull && (
        <div className="grid grid-cols-2 gap-3">
          <PickButton icon={<Camera aria-hidden="true" className="size-5" />} label="צילום עכשיו" capture onChange={handleChange} disabled={disabled} />
          <PickButton icon={<ImagePlus aria-hidden="true" className="size-5" />} label="מהגלריה" multiple onChange={handleChange} disabled={disabled} />
        </div>
      )}

      <FieldError id="photos-error" message={error ?? undefined} />
    </fieldset>
  );
}

type PickButtonProps = {
  icon: ReactNode;
  label: string;
  capture?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

/** A styled label wrapping a hidden file input, so the whole button is tappable. */
function PickButton({ icon, label, capture, multiple, disabled, onChange }: PickButtonProps) {
  return (
    <label
      className={cn(
        buttonClasses("secondary", "cursor-pointer focus-within:outline-2 focus-within:outline-brass"),
        disabled && "pointer-events-none opacity-60",
      )}
    >
      {icon}
      {label}
      <input
        type="file"
        accept="image/*"
        capture={capture ? "environment" : undefined}
        multiple={multiple}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
    </label>
  );
}
