import { Suspense } from "react";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { MessageCircle } from "lucide-react";
import { CopyButton, PrintButton } from "@/components/admin/ClientButtons";
import { QrPoster } from "@/components/admin/QrPoster";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { requireAdmin } from "@/lib/auth";
import { siteUrl } from "@/lib/env";

export default function QrPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 print:hidden">
        <h1 className="text-2xl font-extrabold">קוד QR לעמדה</h1>
        <p className="text-muted">מדפיסים, שמים ליד המראה, והלקוחות סורקים אחרי התספורת.</p>
      </div>
      <Suspense
        fallback={
          <div role="status" className="flex justify-center p-10 text-brass">
            <Spinner />
          </div>
        }
      >
        <QrContent />
      </Suspense>
    </div>
  );
}

async function QrContent() {
  await requireAdmin();
  const baseUrl = siteUrl() ?? (await originFromRequest());
  const qrUrl = `${baseUrl}/?src=qr`;
  const whatsappUrl = `${baseUrl}/?src=wa`;

  const qrSvg = await QRCode.toString(qrUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#0b0b0c", light: "#ffffff" },
  });

  const whatsappMessage = `היי! תודה שבאת להסתפר 🙏 אשמח לשמוע איך יצאה התספורת, זה לוקח פחות מדקה: ${whatsappUrl}`;

  return (
    <div className="flex flex-col gap-6">
      <QrPoster qrSvg={qrSvg} url={qrUrl} />

      <div className="flex justify-center print:hidden">
        <PrintButton />
      </div>

      <Card className="flex flex-col gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">קישור לשליחה בוואטסאפ</h2>
          <p className="text-sm text-muted">
            הקישור הזה מסומן כ&quot;וואטסאפ&quot;, כך שבלוח הבקרה תראה מאיפה הגיע כל משוב.
          </p>
        </div>
        <p dir="ltr" className="break-all rounded-xl border border-line-strong bg-surface-2 p-3 text-start font-mono text-sm">
          {whatsappUrl}
        </p>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={whatsappUrl} />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("secondary")}
          >
            <MessageCircle aria-hidden="true" className="size-4" />
            שליחה עם הודעה מוכנה
          </a>
        </div>
      </Card>
    </div>
  );
}

async function originFromRequest(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
