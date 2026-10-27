"use client";

import { Check } from "lucide-react";
import { TAGS, type TagKey } from "@/lib/constants";
import { cn } from "@/components/ui/cn";

type TagPickerProps = {
  selected: TagKey[];
  onToggle: (tag: TagKey) => void;
  disabled?: boolean;
};

export function TagPicker({ selected, onToggle, disabled }: TagPickerProps) {
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="mb-3 text-base font-semibold text-ink">
        על איזה חלק מדובר?
        <span className="ms-2 text-sm font-normal text-muted">(לא חובה, אפשר לבחור כמה)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => {
          const isSelected = selected.includes(tag.key);
          return (
            <button
              key={tag.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(tag.key)}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-base transition-colors",
                isSelected
                  ? "border-brass bg-brass/15 font-semibold text-brass-light"
                  : "border-line-strong bg-surface-2 text-ink/90 hover:border-brass/50",
              )}
            >
              {isSelected && <Check aria-hidden="true" className="size-4" />}
              {tag.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
