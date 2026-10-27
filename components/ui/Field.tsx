import type { ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

/** Label + input + hint + error message, wired together for screen readers. */
export function Field({ id, label, optional, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold text-ink">
        {label}
        {optional && <span className="ms-2 text-sm font-normal text-muted">(לא חובה)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm font-medium text-danger-soft">
      {message}
    </p>
  );
}

/** aria-describedby value matching the hint/error ids rendered by Field. */
export function describedBy(id: string, { hint, error }: { hint?: string; error?: string }) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
