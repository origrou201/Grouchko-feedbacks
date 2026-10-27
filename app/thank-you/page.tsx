import { Suspense } from "react";
import { Heart } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { BARBER_NAME } from "@/lib/constants";
import { PhotoUploadNotice } from "./PhotoUploadNotice";

export default function ThankYouPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <Logo />
      <div className="grid size-20 place-items-center rounded-full bg-brass/15 text-brass">
        <Heart aria-hidden="true" className="size-10" />
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold">תודה רבה!</h1>
        <p className="text-lg leading-relaxed text-ink/85">
          המשוב שלך הגיע ישירות אליי. אני קורא כל מילה, וזה עוזר לי לדייק את התספורת הבאה שלך.
        </p>
        <p className="text-lg leading-relaxed text-ink/85">נתראה בפעם הבאה 💈</p>
        <p className="font-semibold text-brass">– {BARBER_NAME}</p>
      </div>
      <Suspense>
        <PhotoUploadNotice />
      </Suspense>
    </main>
  );
}
