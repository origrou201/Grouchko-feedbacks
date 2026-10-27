import type { ReactNode } from "react";
import { MessageCircle, Phone, ThumbsUp, Wrench } from "lucide-react";
import { SOURCE_LABELS, tagLabel } from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import type { ReviewWithPhotos } from "@/lib/types";
import { formatPhone } from "@/lib/validation";
import { cn } from "@/components/ui/cn";
import { PhotoGallery } from "./PhotoGallery";
import { ReviewActions } from "./ReviewActions";

export function ReviewCard({ review }: { review: ReviewWithPhotos }) {
  const missingPhotos = review.photo_paths.length - review.photos.length;

  return (
    <article
      aria-labelledby={`review-${review.id}`}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-surface p-5",
        review.is_read ? "border-line" : "border-brass/50 border-s-4 border-s-brass",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 id={`review-${review.id}`} className="flex items-center gap-2 text-lg font-bold">
            {!review.is_read && (
              <span className="rounded-full bg-brass px-2 py-0.5 text-xs font-bold text-bg">חדש</span>
            )}
            {review.name}
          </h3>
          <p className="text-sm text-muted">
            <time dateTime={review.created_at}>{formatDateTime(review.created_at)}</time>
            <span aria-hidden="true"> · </span>
            {SOURCE_LABELS[review.source]}
          </p>
        </div>
        {review.phone && <ContactLinks phone={review.phone} />}
      </header>

      {review.tags.length > 0 && (
        <ul aria-label="אזורים" className="flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-line-strong bg-surface-2 px-3 py-1 text-sm">
              {tagLabel(tag)}
            </li>
          ))}
        </ul>
      )}

      {review.liked && (
        <ReviewText icon={<ThumbsUp aria-hidden="true" className="size-4 text-success" />} title="מה היה טוב">
          {review.liked}
        </ReviewText>
      )}
      {review.to_change && (
        <ReviewText icon={<Wrench aria-hidden="true" className="size-4 text-brass" />} title="מה לשפר">
          {review.to_change}
        </ReviewText>
      )}
      {!review.liked && !review.to_change && <p className="text-sm text-muted">לא נכתב טקסט.</p>}

      <PhotoGallery photos={review.photos} reviewerName={review.name} />
      {missingPhotos > 0 && (
        <p className="text-sm text-muted">
          {missingPhotos === 1 ? "תמונה אחת לא עלתה" : `${missingPhotos} תמונות לא עלו`} (כנראה בעיית חיבור אצל הלקוח).
        </p>
      )}

      <ReviewActions reviewId={review.id} reviewerName={review.name} isRead={review.is_read} />
    </article>
  );
}

function ReviewText({ icon, title, children }: { icon: ReactNode; title: string; children: string }) {
  return (
    <section className="flex flex-col gap-1">
      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-muted">
        {icon}
        {title}
      </h4>
      <p className="whitespace-pre-line leading-relaxed">{children}</p>
    </section>
  );
}

function ContactLinks({ phone }: { phone: string }) {
  const international = `972${phone.slice(1)}`;
  return (
    <div className="flex gap-2">
      <a
        href={`tel:${phone}`}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line-strong px-3 text-sm hover:border-brass"
      >
        <Phone aria-hidden="true" className="size-4" />
        <span dir="ltr">{formatPhone(phone)}</span>
      </a>
      <a
        href={`https://wa.me/${international}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`וואטסאפ ל-${formatPhone(phone)}`}
        className="inline-flex min-h-11 items-center rounded-xl border border-line-strong px-3 hover:border-brass"
      >
        <MessageCircle aria-hidden="true" className="size-4" />
      </a>
    </div>
  );
}
