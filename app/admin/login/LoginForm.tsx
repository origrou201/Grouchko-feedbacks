"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { signIn, type SignInState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/inputs";
import { Spinner } from "@/components/ui/Spinner";

const initialState: SignInState = { error: null, email: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const notAdmin = useSearchParams().get("error") === "not-admin";
  const error = state.error ?? (notAdmin ? "לחשבון הזה אין הרשאה ללוח הבקרה" : null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field id="email" label="אימייל">
        <Input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} />
      </Field>
      <Field id="password" label="סיסמה">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>

      {error && (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-danger-soft">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? <Spinner /> : <LogIn aria-hidden="true" className="size-5 -scale-x-100" />}
        {pending ? "נכנס…" : "כניסה"}
      </Button>
    </form>
  );
}
