import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "כניסה ללוח הבקרה" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-4 py-12">
      <Logo />
      <Card className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold">כניסה ללוח הבקרה</h1>
          <p className="text-muted">האזור הזה פרטי – רק לאורי.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </Card>
    </main>
  );
}
