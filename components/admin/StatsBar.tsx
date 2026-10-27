import { tagLabel } from "@/lib/constants";
import type { ReviewStats } from "@/lib/types";
import { Card } from "@/components/ui/Card";

const numberFormat = new Intl.NumberFormat("he-IL");

export function StatsBar({ stats }: { stats: ReviewStats }) {
  return (
    <section aria-labelledby="stats-title" className="flex flex-col gap-3">
      <h2 id="stats-title" className="sr-only">
        סיכום
      </h2>
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="משובים החודש" value={stats.this_month} />
        <StatTile label="לא נקראו" value={stats.unread} highlight={stats.unread > 0} />
        <StatTile label="סה״כ משובים" value={stats.total} />
      </div>
      <ImprovementTags stats={stats} />
    </section>
  );
}

function StatTile({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <span className="flex items-center gap-1.5 text-sm text-muted">
        {highlight && <span aria-hidden="true" className="size-2 rounded-full bg-brass" />}
        {label}
      </span>
      <span className="text-3xl font-bold tabular-nums text-ink">{numberFormat.format(value)}</span>
    </Card>
  );
}

/** The areas mentioned most in reviews where the client wrote "what would you change". */
function ImprovementTags({ stats }: { stats: ReviewStats }) {
  const top = stats.change_tags.slice(0, 6);
  const max = Math.max(1, ...top.map((item) => item.count));

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-bold">מה כדאי לשפר</h3>
        <p className="text-sm text-muted">
          האזורים שסומנו הכי הרבה במשובים שבהם מילאו &quot;מה היית משנה?&quot; (
          {numberFormat.format(stats.with_changes)} משובים)
        </p>
      </div>
      {top.length === 0 ? (
        <p className="text-sm text-muted">עדיין אין מספיק נתונים.</p>
      ) : (
        <ul className="flex max-w-xl flex-col gap-2.5">
          {top.map((item) => (
            <li key={item.tag} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3 text-sm">
              <span className="text-ink">{tagLabel(item.tag)}</span>
              <span className="h-2.5 overflow-hidden rounded bg-surface-2" aria-hidden="true">
                <span
                  className="block h-full rounded bg-brass"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </span>
              <span className="text-end font-semibold tabular-nums text-ink">
                {numberFormat.format(item.count)}
                <span className="sr-only"> משובים</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
