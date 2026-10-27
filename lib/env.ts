// Reads environment variables with a clear error when one is missing.
// NEXT_PUBLIC_ variables must be referenced literally so Next.js can inline them.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable ${name}. See .env.example and the README.`);
  }
  return value;
}

export function supabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabasePublishableKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function siteUrl(): string | null {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || null;
}
