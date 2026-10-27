import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import type { ReviewFilters } from "@/lib/reviews";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Input } from "@/components/ui/inputs";

/** A plain GET form: the filters live in the URL, so they survive refreshes and links. */
export function Filters({ filters }: { filters: ReviewFilters }) {
  const isFiltered = Boolean(filters.from || filters.to || filters.unreadOnly);

  return (
    <form
      method="get"
      action="/admin"
      aria-label="סינון משובים"
      className="grid grid-cols-2 items-end gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_auto_auto]"
    >
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        מתאריך
        <Input type="date" name="from" defaultValue={filters.from} max={filters.to} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        עד תאריך
        <Input type="date" name="to" defaultValue={filters.to} min={filters.from} />
      </label>
      <label className="col-span-2 flex min-h-12 cursor-pointer items-center gap-3 sm:col-span-1">
        <input
          type="checkbox"
          name="unread"
          value="1"
          defaultChecked={filters.unreadOnly}
          className="size-5 cursor-pointer accent-brass"
        />
        <span>רק שלא נקראו</span>
      </label>
      <div className="col-span-2 flex gap-2 sm:col-span-1">
        <Button type="submit" className="flex-1">
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          סינון
        </Button>
        {isFiltered && (
          <Link href="/admin" className={buttonClasses("ghost")}>
            ניקוי
          </Link>
        )}
      </div>
    </form>
  );
}
