"use client";

import { useState } from "react";
import { Check, Copy, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <Button onClick={() => window.print()}>
      <Printer aria-hidden="true" className="size-5" />
      הדפסה
    </Button>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("העתיקו את הקישור:", text);
    }
  }

  return (
    <Button variant="secondary" onClick={copy}>
      {copied ? <Check aria-hidden="true" className="size-4 text-success" /> : <Copy aria-hidden="true" className="size-4" />}
      <span aria-live="polite">{copied ? "הועתק!" : "העתקה"}</span>
    </Button>
  );
}
