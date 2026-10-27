import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { SHOP_NAME } from "@/lib/constants";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `משוב על התספורת | ${SHOP_NAME}`,
  description: "ספרו לי איך יצאה התספורת – זה עוזר לי להשתפר.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
