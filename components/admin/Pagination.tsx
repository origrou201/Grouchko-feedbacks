import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReviewFilters } from "@/lib/reviews";
import { buttonClasses } from "@/components/ui/Button";

function pageHref(filters: ReviewFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.unreadOnly) params.set("unread", "1");
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

// In RTL, "previous" points right and "next" points left.
export function Pagination({ filters, pageCount }: { filters: ReviewFilters; pageCount: number }) {
  if (pageCount <= 1) return null;
  const { page } = filters;

  return (
    <nav aria-label="עמודים" className="flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={pageHref(filters, page - 1)} className={buttonClasses("secondary")}>
          <ChevronRight aria-hidden="true" className="size-5" />
          הקודם
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted">
        עמוד {page} מתוך {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={pageHref(filters, page + 1)} className={buttonClasses("secondary")}>
          הבא
          <ChevronLeft aria-hidden="true" className="size-5" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
