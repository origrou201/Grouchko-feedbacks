import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { Logo } from "@/components/ui/Logo";
import { BARBER_NAME } from "@/lib/constants";

export default function FeedbackPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 pb-16 pt-8">
      <header className="flex flex-col gap-5">
        <Logo />
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold leading-tight">איך יצאה התספורת?</h1>
          <p className="text-lg leading-relaxed text-ink/85">
            תודה שבאת להסתפר אצלי! חשוב לי שכל תספורת תצא בדיוק כמו שרצית. כמה מילים – ותמונה, אם בא
            לך – עוזרות לי להשתפר מתספורת לתספורת. זה לוקח פחות מדקה.
          </p>
          <p className="font-semibold text-brass">– {BARBER_NAME}</p>
        </div>
      </header>

      <FeedbackForm />
    </main>
  );
}
