"use client";

import { useState, useTransition } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { deleteReview, setReadStatus, type ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type ReviewActionsProps = { reviewId: string; reviewerName: string; isRead: boolean };

export function ReviewActions({ reviewId, reviewerName, isRead }: ReviewActionsProps) {
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
    });
  }

  if (confirmingDelete) {
    return (
      <div role="group" aria-label="אישור מחיקה" className="flex flex-col gap-3 rounded-xl border border-danger/40 bg-danger/10 p-3">
        <p className="text-sm">
          למחוק את המשוב של {reviewerName}? גם התמונות יימחקו, ואי אפשר לשחזר.
        </p>
        <div className="flex gap-2">
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => run(() => deleteReview(reviewId))}
            className="flex-1 bg-danger/20"
          >
            {pending ? <Spinner className="size-4" /> : <Trash2 aria-hidden="true" className="size-4" />}
            כן, למחוק
          </Button>
          <Button variant="ghost" disabled={pending} onClick={() => setConfirmingDelete(false)}>
            ביטול
          </Button>
        </div>
        {error && <p role="alert" className="text-sm text-danger-soft">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={pending} onClick={() => run(() => setReadStatus(reviewId, !isRead))}>
          {pending ? (
            <Spinner className="size-4" />
          ) : isRead ? (
            <Mail aria-hidden="true" className="size-4" />
          ) : (
            <MailOpen aria-hidden="true" className="size-4" />
          )}
          {isRead ? "סמן כלא נקרא" : "סמן כנקרא"}
        </Button>
        <Button variant="danger" disabled={pending} onClick={() => setConfirmingDelete(true)}>
          <Trash2 aria-hidden="true" className="size-4" />
          מחיקה
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-danger-soft">{error}</p>}
    </div>
  );
}
