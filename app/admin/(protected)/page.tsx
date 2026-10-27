import { Suspense } from "react";
import { Inbox } from "lucide-react";
import { Filters } from "@/components/admin/Filters";
import { Pagination } from "@/components/admin/Pagination";
import { ReviewCard } from "@/components/admin/ReviewCard";
import { StatsBar } from "@/components/admin/StatsBar";
import { Spinner } from "@/components/ui/Spinner";
import { getReviews, getStats, parseFilters } from "@/lib/reviews";

export default function DashboardPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">משובים</h1>

      <Suspense fallback={<LoadingBlock label="טוען סיכום…" />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<LoadingBlock label="טוען משובים…" />}>
        <ReviewsSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Stats() {
  const stats = await getStats();
  return <StatsBar stats={stats} />;
}

async function ReviewsSection({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  const filters = parseFilters(await searchParams);
  const { reviews, total, pageCount } = await getReviews(filters);
  const isFiltered = Boolean(filters.from || filters.to || filters.unreadOnly);

  return (
    <section aria-labelledby="reviews-title" className="flex flex-col gap-4">
      <h2 id="reviews-title" className="sr-only">
        רשימת משובים
      </h2>
      <Filters filters={filters} />
      <p className="text-sm text-muted" aria-live="polite">
        {total === 1 ? "משוב אחד" : `${total.toLocaleString("he-IL")} משובים`}
        {isFiltered && " שמתאימים לסינון"}
      </p>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">
          <Inbox aria-hidden="true" className="size-10" />
          <p>{isFiltered ? "אין משובים שמתאימים לסינון." : "עוד אין משובים. ברגע שלקוח ישלח, הוא יופיע כאן."}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}

      <Pagination filters={filters} pageCount={pageCount} />
    </section>
  );
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 rounded-2xl border border-line bg-surface p-8 text-muted">
      <Spinner className="text-brass" />
      {label}
    </div>
  );
}
