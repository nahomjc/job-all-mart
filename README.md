# Job Post — Telegram + Web platform

A full-stack job posting platform that lets employers submit jobs from either:

- the **web app** (Supabase auth), or
- the **Telegram bot** (auto-linked Telegram account — no signup needed).

Every submission goes through **admin moderation + payment verification** before
being published to the right **Telegram forum topic** of your supergroup.

Built with:

- Next.js 16 (App Router, Server Actions, Turbopack)
- React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui
- PostgreSQL · Drizzle ORM
- Supabase (Auth) · Cloudflare R2 (storage, presigned uploads)
- Telegraf (Telegram bot, webhook + polling modes)

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in real values
cp .env.example .env.local

# 3. Push schema to a fresh database
npm run db:push

# 4. Seed default categories (Vacancy, IT Jobs, Remote Jobs, ...)
npm run db:seed

# 5. Run the app
npm run dev

# 6. (separately) Run the Telegram bot in local polling mode
npm run bot:dev
```

Visit http://localhost:3000.

> **Make yourself an admin** — sign up via the web, then run this once in
> psql against your database:
>
> ```sql
> UPDATE users SET role = 'owner' WHERE email = 'you@yourdomain.com';
> ```

---

## Architecture

```
┌────────────┐        ┌──────────────┐        ┌─────────────┐
│  Website   │──────▶ │              │ ◀──────│ Telegram bot │
│ (Supabase) │        │  Next.js app │        │  (Telegraf)  │
└────────────┘        │   + Postgres │        └─────────────┘
                      │  + Drizzle   │
                      └──────┬───────┘
                             │
                       ┌─────┴──────┐
                       │            │
                  ┌────▼─────┐  ┌───▼──────────┐
                  │ Cloudflare│  │ Telegram    │
                  │    R2     │  │ supergroup  │
                  │ (uploads) │  │ + forum     │
                  └───────────┘  │ topics      │
                                 └─────────────┘
```

Every submission — from the web or from the bot — creates a single internal
`users` row and a single `jobs` row. Telegram users are upserted at `/start`
and never need a web account.

### Status lifecycle

```
draft ─▶ pending_payment ─▶ pending_review ─▶ approved ─▶ posted ─▶ expired
                                       │           │
                                       ▼           ▼
                                   rejected     scheduled ─▶ posted
```

The state machine is enforced by `jobRepo.setStatus` and the admin actions;
**approval refuses to publish if the linked payment is not `verified`**
(see `server/actions/admin.ts → approveJobAction`).

---

## Project structure

```
app/
├─ (public)/              Marketing site + job board (shared navbar/footer)
│   ├─ page.tsx           Home
│   ├─ jobs/[slug]/       Job detail
│   ├─ pricing/
│   └─ login/             Sign-in & sign-up
├─ dashboard/             Employer dashboard (auth required)
│   ├─ jobs/new/          Submission form
│   ├─ jobs/[id]/         Status, payment upload
│   ├─ analytics/
│   └─ settings/
├─ admin/                 Admin console (admin role required)
│   ├─ jobs/              Approval queue + per-job review
│   ├─ payments/          Pending payment verification
│   ├─ users/             Bans + roles
│   ├─ categories/        Map categories → Telegram topic IDs
│   └─ audit/             Audit log
├─ api/
│   ├─ telegram/webhook/  Telegraf webhook
│   ├─ upload/presign/    R2 presigned uploads (employer flow)
│   └─ cron/              Scheduled posts + job expiration
└─ layout.tsx             Root (theme provider, toaster)

components/               UI (shadcn/ui), navbar, footer, forms
lib/
├─ env.ts                 Type-safe env access
├─ auth.ts                Current-user + role helpers
├─ supabase/              Server + browser SSR clients
├─ r2.ts                  S3 client + presigned URL helper
├─ telegram/              Bot, wizard, publisher, membership check
├─ spam.ts                Heuristic spam scorer
├─ rate-limit.ts          In-memory token bucket
└─ validations/           Zod schemas (shared client/server)

server/
├─ db/                    Drizzle client + schema
├─ repositories/          One file per table (repository pattern)
└─ actions/               Server actions (auth, jobs, admin)

scripts/                  set-webhook, polling dev bot, seed
proxy.ts                  Next.js 16 proxy (renamed from middleware)
```

---

## Environment variables

See `.env.example` for the full list. The required ones in short:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Postgres connection string. Supabase pooled (Transaction) URI works. |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Supabase project credentials for the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key (never exposed). |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Cloudflare R2 bucket credentials. |
| `R2_PUBLIC_BASE_URL` | Public hostname serving the R2 bucket (e.g. `https://pub-xxx.r2.dev`). |
| `TELEGRAM_BOT_TOKEN` | From @BotFather. |
| `TELEGRAM_CHANNEL_ID` | The supergroup ID (`-100…`) where jobs are posted. **Must have forum topics enabled.** |
| `TELEGRAM_REQUIRED_CHANNEL` | Username (no `@`) of the channel users must join before posting. |
| `TELEGRAM_WEBHOOK_SECRET` | A long random string. Telegram sends it as a header on every webhook update. |
| `TELEGRAM_ADMIN_NOTIFY_CHAT_ID` | Chat that receives "new submission" pings. |
| `CRON_SECRET` | Bearer token expected by `/api/cron/*` endpoints. |

---

## Telegram bot setup

> **Full guide:** [docs/TELEGRAM.md](docs/TELEGRAM.md) — setup, env vars, webhook vs polling, topics, troubleshooting, and the `approved` → `posted` flow.

1. **Create the bot** with [@BotFather](https://t.me/BotFather): `/newbot`. Save
   the token into `TELEGRAM_BOT_TOKEN`.
2. **Make a supergroup with forum topics enabled.** Note the chat id (use
   `/start` against [@RawDataBot](https://t.me/RawDataBot) inside the group).
   Put it in `TELEGRAM_CHANNEL_ID` (must start with `-100…`).
3. **Make your bot an admin** in:
   - The required channel (`TELEGRAM_REQUIRED_CHANNEL`), so it can read
     `getChatMember` for membership checks.
   - The supergroup, with **"Manage Topics"** + **"Post Messages"** rights.
4. **Create one forum topic per category** in the supergroup. Right-click the
   topic → "Copy link" → the URL ends in `/<topic_id>`. Paste that number into
   the matching category at `/admin/categories`.
5. **Local dev (polling mode)** — convenient when you don't have a public URL:

   ```bash
   npm run bot:dev
   ```

6. **Production (webhook mode):**

   ```bash
   # Make sure NEXT_PUBLIC_APP_URL points to your real public URL
   npm run bot:set-webhook
   # or specify directly:
   npm run bot:set-webhook https://your-domain.com/api/telegram/webhook
   ```

   This registers the webhook **and the secret token**. Telegram will send the
   secret as the `X-Telegram-Bot-Api-Secret-Token` header — the route handler
   rejects anything else.

### Bot commands

| Command | What it does |
|---|---|
| `/start` | Upsert an internal user from the Telegram user, send onboarding. |
| `/postjob` | Multi-step submission wizard (membership-gated, rate-limited). |
| `/myjobs` | Lists the caller's posts and statuses. |
| `/pricing` | Inline pricing. |
| `/cancel` | Abort an in-progress wizard. |
| `/myid` | Your Telegram user id → `TELEGRAM_ADMIN_IDS`. |
| `/chatid` | Current chat id → channel or notify chat (admin). |
| `/topicid` | Forum topic id → Admin → Categories (admin, run inside topic). |
| `/setupids` | All setup ids + suggested `.env` block (admin). |

---

## Cloudflare R2 setup

1. Create a bucket (e.g. `jobpost-uploads`) and an API token with read/write on
   it. Plug the four values into `R2_ACCESS_*` / `R2_BUCKET`.
2. Either enable the bucket's public `r2.dev` URL or attach a custom CNAME, and
   set `R2_PUBLIC_BASE_URL` to its origin. This is the URL stored on records
   and rendered in `next/image`.
3. CORS — allow `PUT` from your app's origin so browsers can do presigned uploads:

   ```json
   [
     {
       "AllowedOrigins": ["https://your-domain.com", "http://localhost:3000"],
       "AllowedMethods": ["PUT", "GET"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

---

## Cron jobs

| Endpoint | Cadence | What it does |
|---|---|---|
| `GET /api/cron/scheduled-posts` | `*/5 * * * *` | Publishes jobs whose `scheduledAt` is due. |
| `GET /api/cron/expire-jobs` | `0 * * * *` | Marks `posted` jobs past `expiresAt` as `expired`. |

Both endpoints require either `Authorization: Bearer <CRON_SECRET>` or a
`?secret=<CRON_SECRET>` query param. Vercel Cron config is in `vercel.json`.

---

## Anti-spam & security

- **Required membership**: bot users must join `TELEGRAM_REQUIRED_CHANNEL`
  (`lib/telegram/client.ts → isUserInRequiredChannel`).
- **Rate limit**: max 5 submissions / 24h, max 3 pending posts at once
  (`lib/rate-limit.ts` + `server/actions/jobs.ts`).
- **Heuristic spam score**: blacklist regexes, shouting, suspicious TLDs,
  duplicate titles by same user, etc. (`lib/spam.ts`). Score ≥ 80 = reject;
  ≥ 50 = surface to admin (`spamScore` shown in the queue badge).
- **Submission lock**: `approveJobAction` refuses to publish until the linked
  payment is `verified`.
- **Webhook secret**: Telegram updates without the configured
  `x-telegram-bot-api-secret-token` header are rejected with 403.
- **Cron secret**: Same model for cron endpoints.
- **Admin audit log**: Every approval / rejection / payment verification /
  user ban writes to `audit_logs` (visible at `/admin/audit`).

---

## Database

Drizzle migrations live in `./drizzle`. Workflow:

```bash
# After editing server/db/schema.ts:
npm run db:generate    # emit a SQL migration
npm run db:migrate     # apply it

# Or push schema directly (fine for dev):
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

---

## Deployment

### Vercel (recommended)

1. Import the repo into Vercel.
2. Set the env vars in the dashboard (copy from `.env.example`).
3. `NEXT_PUBLIC_APP_URL` must be your production domain.
4. After first deploy, run `npm run bot:set-webhook` (locally, with the prod
   env vars) to register the webhook against `https://your-domain/api/telegram/webhook`.
5. Vercel Cron will pick up the `vercel.json` schedule automatically.

### Docker

```bash
docker compose up --build
```

This brings up Postgres + the app on port `3000`. Make sure your `.env.local`
has the secrets — `docker-compose.yml` forwards them.

To run the bot inside Docker as a separate worker, add a second service that
runs `node node_modules/tsx/dist/cli.mjs scripts/bot-polling.ts`. (Or run the
bot in webhook mode and you don't need this — the same web container handles
both HTTP traffic and Telegram updates.)

---

## Type-safety

- Drizzle infers row types directly from the schema (`server/db/schema.ts`
  exports `User`, `Job`, `Payment`, etc.).
- All validation is Zod (`lib/validations/*`). The same schema is used to
  validate form data inside Server Actions and to drive React Hook Form errors
  on the client.
- Run `npm run typecheck` to verify the project compiles.

---

## What's NOT included yet

Things this scaffold deliberately stubs or omits:

- **In-app payment processing.** We only verify payment screenshots manually
  — wire Stripe/Paystack/etc. into `submitPaymentAction` to automate.
- **AI spam detection.** `lib/spam.ts` is heuristic. Swap `detectSpam` for a
  call to OpenAI Moderation or a custom model and the rest of the app works
  unchanged.
- **Email notifications.** We notify users via Telegram. Plug your email
  provider into `notifyOwner` in `server/actions/admin.ts` if you also want
  email.
- **Sitemap & robots.** Add `app/sitemap.ts` and `app/robots.ts` (Next.js
  conventions) once you have stable URLs.
#   j o b - a l l - m a r t  
 