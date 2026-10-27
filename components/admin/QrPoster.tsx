import { BARBER_NAME, SHOP_NAME } from "@/lib/constants";

/** The printable poster. White background so it prints cleanly on any printer. */
export function QrPoster({ qrSvg, url }: { qrSvg: string; url: string }) {
  return (
    <div
      id="qr-poster"
      className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-2xl bg-white p-8 text-center text-neutral-900 shadow-xl print:max-w-none print:rounded-none print:p-16 print:shadow-none"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="grid size-14 place-items-center rounded-full border-[3px] border-neutral-900 text-2xl font-black">
          G
        </span>
        <span dir="ltr" className="text-xl font-extrabold uppercase tracking-[0.2em]">
          {SHOP_NAME}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold print:text-5xl">איך יצאה התספורת?</h2>
        <p className="text-lg text-neutral-700 print:text-2xl">
          סרקו את הקוד והשאירו משוב קצר – זה עוזר לי להשתפר
        </p>
      </div>

      <div
        role="img"
        aria-label={`קוד QR לטופס המשוב: ${url}`}
        className="w-full max-w-72 print:max-w-[11cm] [&_svg]:h-auto [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />

      <div className="flex flex-col gap-1">
        <p className="text-lg font-bold print:text-2xl">תודה! ✂️</p>
        <p className="text-neutral-700 print:text-xl">{BARBER_NAME}</p>
      </div>
    </div>
  );
}
