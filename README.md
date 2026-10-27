# grouchko barbershop – Haircut Feedback

A small website where clients leave feedback on their haircut (with photos), and a private
dashboard where you read it.

- **Clients** scan the QR code at your station (or open the link you send on WhatsApp), fill in a
  short form in Hebrew, and can attach up to 3 photos.
- **You** log in to `/admin` to read the feedback, see the photos, mark reviews as read, delete
  them, and print the QR code.

Photos and feedback are private. Only you can see them, after logging in.

---

## What you need (all free to start)

| What | Why | Link |
|---|---|---|
| A **Supabase** account | Stores the reviews and photos, and handles your login | https://supabase.com |
| A **GitHub** account | Holds the website's code so Vercel can publish it | https://github.com |
| A **Vercel** account | Puts the website on the internet | https://vercel.com (sign up **with GitHub**) |
| **Node.js** (LTS version) | Only needed to run the site on your own computer | https://nodejs.org |
| **GitHub Desktop** | The easiest way to upload the code to GitHub | https://desktop.github.com |

The whole setup takes about 30–45 minutes the first time.

---

## Step 1 – Create the Supabase project

1. Go to https://supabase.com, sign in, and click **New project**.
2. Name it, for example `grouchko-feedback`.
3. Choose a strong **database password** and save it somewhere safe. (The website doesn't
   use it, but Supabase may ask for it later.)
4. For **Region**, pick the one closest to Israel, e.g. **Frankfurt (eu-central-1)**.
5. Click **Create new project** and wait a minute or two until it's ready.

## Step 2 – Create the tables, the photo storage and the security rules

1. In your Supabase project, open **SQL Editor** in the left menu.
2. Click **New query**.
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this project, copy **all**
   of its text, and paste it into the editor.
4. Click **Run**. You should see "Success. No rows returned".

This created:

- the `reviews` table (the feedback),
- a **private** storage bucket called `review-photos` (for the photos),
- security rules: visitors can't read anything, and only you can read or delete.

It's safe to run this file again later. It won't delete existing reviews.

## Step 3 – Create your admin login

1. In Supabase, go to **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Enter your email and a strong password, and tick **Auto Confirm User**. Click **Create user**.
4. Go back to **SQL Editor → New query**, paste the following (**replace the email with yours**),
   and click **Run**:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'your-email@example.com';
   ```

   It should say "Success. 1 rows affected". If it says **0 rows**, the email doesn't match
   exactly. Check it and run it again.

5. **Turn off public sign-ups**, so nobody else can create an account: go to
   **Authentication → Sign In / Providers** (on some versions: **Authentication → Settings**)
   and switch **off** "Allow new users to sign up". Save.

   Even if someone did create an account, they would see nothing: only users listed in
   `admins` can read reviews. Turning sign-ups off is an extra lock.

## Step 4 – Copy your Supabase keys

You need three values from Supabase. Keep this page open, because you'll paste them in the
next steps.

| Value | Where to find it in Supabase |
|---|---|
| **Project URL** (looks like `https://abcd1234.supabase.co`) | Click **Connect** at the top of the project, or **Project Settings → Data API** |
| **Publishable key** (starts with `sb_publishable_`) | **Project Settings → API Keys** |
| **Secret key** (starts with `sb_secret_`) | **Project Settings → API Keys**, under "Secret keys" (click to reveal) |

> Older Supabase projects call these the **anon public** key and the **service_role** key
> (under "Legacy API keys"). Those work too.

⚠️ **The secret key is like the master key to your data.** Never send it to anyone, never
post it online, and only paste it in the places this guide tells you to.

## Step 5 – Run the site on your computer (optional, but a good test)

1. Install **Node.js** (the "LTS" version) from https://nodejs.org.
2. Open a terminal in the project folder:
   - **Mac:** open the **Terminal** app, type `cd ` (with a space), drag the project folder into
     the window, and press Enter.
   - **Windows:** open the project folder, click the address bar, type `cmd`, and press Enter.
3. Make a copy of the file `.env.example` and name the copy `.env.local`. Open it in any text
   editor and fill in the values:

   | Name | What to put |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | The Project URL from Step 4 |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The publishable key from Step 4 |
   | `SUPABASE_SECRET_KEY` | The secret key from Step 4 |
   | `RATE_LIMIT_SALT` | Any long random text, at least 32 characters, e.g. from a password generator |
   | `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |
   | `CRON_SECRET` | Leave it as is. It's only used on Vercel (see Step 7). |

4. In the terminal, run these two commands. The first one takes a minute, and you only need it once:

   ```bash
   npm install
   npm run dev
   ```

5. Open http://localhost:3000 to see the feedback form, and http://localhost:3000/admin for the
   dashboard. Send yourself a test review, then check that it shows up in the dashboard.
6. To stop the site, press `Ctrl + C` in the terminal.

## Step 6 – Upload the code to GitHub

> **Already on GitHub?** If the code is already in your GitHub repository (for example
> `origrou201/Grouchko-feedbacks`), skip this step and go to Step 7.

1. Open **GitHub Desktop** and sign in with your GitHub account.
2. Choose **File → Add local repository…** and select the project folder.
   If it says "this directory does not appear to be a Git repository", click
   **create a repository** and then **Create repository**.
3. Click **Publish repository**. **Keep "Keep this code private" ticked.** Click Publish.

GitHub Desktop automatically skips `.env.local` (your keys) and the large `node_modules`
folder, so your secrets don't get uploaded.

## Step 7 – Put the site online with Vercel

1. Go to https://vercel.com, sign in with GitHub, and click **Add New… → Project**.
2. Find your repository in the list and click **Import**.
3. Open **Environment Variables** and add the same names as in Step 5, with these
   differences:
   - `RATE_LIMIT_SALT`: a new long random text (it doesn't have to match your computer's).
   - `CRON_SECRET`: another new long random text (at least 16 characters). It protects the daily
     keep-alive job (see below).
   - `NEXT_PUBLIC_SITE_URL`: leave it out for now. You'll add it in step 5 below.
4. Click **Deploy** and wait about a minute. Vercel gives you an address like
   `https://grouchko-feedback.vercel.app`.
5. Go to **Settings → Environment Variables**, add `NEXT_PUBLIC_SITE_URL` with that address
   (no `/` at the end), then go to **Deployments**, click the **⋯** next to the latest one, and
   choose **Redeploy**.
   (Without this, the QR code still uses the address you open the dashboard from. Setting it
   makes sure the QR code always points to the right site, which matters most if you later
   connect your own domain.)

From now on, every time code changes are pushed to GitHub, Vercel updates the site
automatically.

### The daily keep-alive job (keeps Supabase from pausing)

Free Supabase projects are **paused after about a week without activity**. In a quiet week
(holidays, vacation) your database could pause and the form would stop working. To prevent
this, the site includes a small **Vercel Cron Job**: once a day (around 06:00–07:00 Israel
time), Vercel calls `/api/keep-alive`, which runs a tiny database query. That's enough activity
to keep the project awake. It doesn't change or reveal any data.

It's set up automatically by the `vercel.json` file. You only need the `CRON_SECRET` variable
from item 3 above. To check that it works:

1. In Vercel, open your project → **Settings → Cron Jobs**. You should see `/api/keep-alive`.
2. Click **Run** next to it. Then open the **Logs** tab: the request should show status **200**.
   - **401** means `CRON_SECRET` is missing in Vercel. Add it, then redeploy (as in item 5 above).
   - **500** means the Supabase keys are wrong or the project is paused (see "Common questions").

## Step 8 – Print the QR code and share the link

1. Open `https://<your-site>/admin` and log in.
2. Click **קוד QR**, then **הדפסה**, to print the poster for your station.
3. On the same page you'll find the **WhatsApp link**. Copy it, or tap
   **שליחה עם הודעה מוכנה** to send it with a ready-made message.

The QR code and the WhatsApp link open the same form. The dashboard shows which one each client
used ("סריקת QR" / "קישור בוואטסאפ").

---

## Using the dashboard

- **Top of the page:** reviews this month, unread reviews, total reviews, and **"מה כדאי לשפר"**:
  the areas (tags) clients picked most often in reviews where they filled in "מה היית משנה?".
- **Filters:** by date range, or "רק שלא נקראו" (unread only).
- **On each review:** tap a photo to enlarge it (use the arrows to move between photos), tap the phone
  number to call, or tap the chat icon to open WhatsApp with that client.
- **סמן כנקרא / סמן כלא נקרא** marks a review as read or unread. **מחיקה** deletes the review
  **and its photos** permanently. It asks you to confirm first.

## Common questions

**I forgot my password / want to change it.**
In Supabase go to **Authentication → Users**, delete your user, create it again (Step 3,
items 1–3), then run the SQL from Step 3, item 4 again. Your reviews are not affected.

**The site suddenly shows errors after a long break.**
Free Supabase projects are **paused after about a week without activity**. The daily keep-alive
job (Step 7) prevents this, but if the project was paused anyway (for example because
`CRON_SECRET` wasn't set), open your project in Supabase and click **Restore project**, then
check the keep-alive job as described in Step 7.

**A client says the form told them to "try again later".**
To stop spam, each internet connection can send up to **20 reviews per hour**. That's
plenty, even when many clients share the shop's Wi-Fi. The block clears by itself within the hour.

**Can I change the texts or colors?**
Yes. The client page texts are in `app/page.tsx`, `components/feedback/` and
`app/thank-you/page.tsx`. The colors are at the top of `app/globals.css`, and the tags and the
shop/barber name are in `lib/constants.ts`.

---

## For developers

Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS v4 and Supabase (Postgres, Auth, Storage).

```
app/
  page.tsx                    Feedback form page (static)
  thank-you/                  Thank-you page
  api/reviews/route.ts        POST endpoint: honeypot, timing, validation, rate limit, insert,
                              returns signed upload URLs
  api/keep-alive/route.ts     Daily Vercel Cron target (needs CRON_SECRET): tiny query so the
                              free Supabase project isn't paused
  admin/login/                Login (server action)
  admin/(protected)/          Dashboard and QR page
  admin/actions.ts            Server actions: sign in/out, mark read, delete
components/{ui,feedback,admin}
lib/
  supabase/{server,admin,browser,proxy}.ts   Supabase clients (admin = secret key, server-only)
  auth.ts                     requireAdmin(): session check + is_admin() RPC
  reviews.ts                  Dashboard queries + signed photo URLs (10 min)
  validation.ts               Shared zod schema + Hebrew messages
  image.ts                    Client-side compression (max 1600px, WebP/JPEG)
  rate-limit.ts               Salted IP hash + check_rate_limit() RPC (20/hour/IP)
proxy.ts                      Refreshes the Supabase session and guards /admin
supabase/schema.sql           Tables, functions, grants, RLS, private bucket, storage policies
vercel.json                   Cron schedule: /api/keep-alive daily at 04:17 UTC
```

**Security model**

- `anon` has no table grants at all. Every submission goes through `POST /api/reviews`, which
  uses the secret key on the server after checking the honeypot field, the minimum fill time
  (3s), the input, and the per-IP rate limit (salted SHA-256 IP hash, stored in `rate_limits`).
- Photos go straight from the browser to the private `review-photos` bucket, using one-time
  signed upload URLs issued per path. The bucket only accepts JPEG/WebP up to 3MB.
- `authenticated` users can only `select`/`delete` reviews and update `is_read`, and only if
  `public.is_admin()` is true (user listed in `public.admins`). The same check covers reading
  and deleting storage objects. The dashboard runs as the logged-in user, so RLS applies to it.
- Re-submits with the same `submission_id` return the existing review (idempotent).

Scripts: `npm run dev`, `npm run build`, `npm run lint`.
