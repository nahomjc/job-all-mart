# Telegram integration guide

This app uses Telegram in three ways:

1. **Bot (Telegraf)** — employers submit jobs via `/postjob`, check status with `/myjobs`, and get onboarding via `/start`.
2. **Channel publishing** — after admin approval, jobs are posted to a **forum supergroup** (one topic per category).
3. **Membership gate** — users must join a **required channel** before they can post from the bot.

The web app and the bot share the same database (`users`, `jobs`, `payments`, `telegram_posts`).

---

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │           Next.js app               │
                    │  ┌─────────────┐  ┌──────────────┐  │
  Telegram users ──▶│  │ /api/       │  │ Admin        │  │
  (DM with bot)     │  │ telegram/   │  │ approve →    │  │
                    │  │ webhook     │  │ publishJob   │  │
                    │  └──────┬──────┘  └──────┬───────┘  │
                    │         │                 │          │
                    │         ▼                 ▼          │
                    │     Telegraf handlers + publisher    │
                    └─────────┬─────────────────┬──────────┘
                              │                 │
                              ▼                 ▼
                    ┌──────────────┐   ┌──────────────────┐
                    │  PostgreSQL  │   │ Telegram API     │
                    └──────────────┘   │ (supergroup +    │
                                       │  forum topics)   │
                                       └──────────────────┘
```

| Path | Purpose |
|------|---------|
| `lib/telegram/bot.ts` | Singleton Telegraf instance |
| `lib/telegram/handlers.ts` | Commands: `/start`, `/postjob`, `/myjobs`, … |
| `lib/telegram/wizard.ts` | Multi-step job submission + payment screenshot |
| `lib/telegram/publisher.ts` | Formats and sends approved jobs to the channel |
| `lib/telegram/client.ts` | `sendMessage`, `sendPhoto`, membership check |
| `app/api/telegram/webhook/route.ts` | Production webhook endpoint |
| `scripts/bot-polling.ts` | Local dev (no public URL) |
| `scripts/set-telegram-webhook.ts` | Register production webhook |

---

## Prerequisites

Before editing `.env`, set up Telegram assets:

### 1. Create the bot

1. Open [@BotFather](https://t.me/BotFather) in Telegram.
2. Send `/newbot`, follow prompts, copy the **HTTP API token**.
3. Optional: `/setcommands` for a cleaner command menu.

### 2. Required membership channel

Users must join this channel before `/postjob` works.

1. Create a **public channel** (e.g. `@YourJobsChannel`).
2. Add your bot as an **administrator** with permission to read members (needed for `getChatMember`).
3. Note the **username without `@`** → `TELEGRAM_REQUIRED_CHANNEL`.

### 3. Job posting supergroup (forum topics)

Approved jobs are published here, optionally into **per-category topics**.

1. Create a **supergroup** (not a basic group).
2. **Group settings → Topics** → enable **Forum**.
3. Add your bot as **administrator** with at least:
   - **Post messages**
   - **Manage topics** (if you use category topics)
4. Get the **chat ID** (numeric, usually `-100xxxxxxxxxx`):
   - Add [@RawDataBot](https://t.me/RawDataBot) to the group, or
   - Use Bot API `getUpdates` after the bot receives a message in the group.
5. Set `TELEGRAM_CHANNEL_ID` to that ID (include the minus sign).

### 4. Forum topic IDs (categories)

For each job category (IT, Remote, etc.):

1. In the supergroup, create a **topic** (e.g. "IT Jobs").
2. Open the topic → **⋯** → copy link. URL looks like:
   `https://t.me/c/1234567890/42` → topic id is **`42`** (last number).
3. In the admin UI: **Admin → Categories** → set **Telegram topic ID** for that category.

If `telegramTopicId` is empty, posts go to the **General** topic / main chat.

### 5. Admin notification chat (optional)

`TELEGRAM_ADMIN_NOTIFY_CHAT_ID` receives pings when someone submits via the bot.

- Can be your personal user id, a private group, or a dedicated admin channel.
- Get your user id from [@userinfobot](https://t.me/userinfobot) or from bot updates.

---

## Environment variables

Add these to `.env` (see `lib/env.ts` for the canonical list):

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token from BotFather |
| `TELEGRAM_CHANNEL_ID` | Yes | Supergroup chat id (`-100…`) where jobs are posted |
| `TELEGRAM_REQUIRED_CHANNEL` | Yes | Channel username **without** `@` (membership gate) |
| `TELEGRAM_WEBHOOK_SECRET` | Yes | Long random string; validated on every webhook request |
| `TELEGRAM_ADMIN_IDS` | No | Comma-separated Telegram user ids treated as admins (if used) |
| `TELEGRAM_ADMIN_NOTIFY_CHAT_ID` | No | Chat id for "new submission" notifications |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL (links in Telegram messages + webhook URL) |

Generate a webhook secret:

```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# macOS / Linux
openssl rand -hex 32
```

Example `.env` block:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_ID=-1001234567890
TELEGRAM_REQUIRED_CHANNEL=YourJobsChannel
TELEGRAM_WEBHOOK_SECRET=your-long-random-secret-here
TELEGRAM_ADMIN_NOTIFY_CHAT_ID=123456789
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Local development

You have two options. **Do not run both at the same time** — webhook and long-polling conflict.

### Option A: Long polling (recommended for localhost)

No public URL required. The bot process talks to Telegram directly.

```bash
# Terminal 1 — web app
npm run dev

# Terminal 2 — bot
npm run bot:dev
```

`bot:dev` deletes any existing webhook, then starts Telegraf in polling mode (`scripts/bot-polling.ts`).

### Option B: Webhook via tunnel

Use if you want to test the same path as production.

1. Expose localhost, e.g. `ngrok http 3000` → `https://abc123.ngrok.io`
2. Register webhook:

```bash
npm run bot:set-webhook https://abc123.ngrok.io/api/telegram/webhook
```

3. Run only `npm run dev` (do **not** run `bot:dev`).

Webhook handler: `POST /api/telegram/webhook`  
Health check: `GET /api/telegram/webhook` → `{ "status": "telegram webhook live" }`

---

## Production setup

### 1. Deploy the app

Ensure `NEXT_PUBLIC_APP_URL` is your real HTTPS domain (e.g. `https://jobs.example.com`).

### 2. Register the webhook

From your machine (with production `.env` loaded) or CI:

```bash
# Uses NEXT_PUBLIC_APP_URL from .env
npm run bot:set-webhook

# Or pass the URL explicitly
npm run bot:set-webhook https://jobs.example.com/api/telegram/webhook
```

This script (`scripts/set-telegram-webhook.ts`):

- Deletes the old webhook
- Sets `https://<domain>/api/telegram/webhook`
- Registers `secret_token` = `TELEGRAM_WEBHOOK_SECRET`
- Subscribes to `message`, `callback_query`, `my_chat_member`

### 3. Verify webhook

```bash
# Replace TOKEN and SECRET
curl -s "https://api.telegram.org/bot<TOKEN>/getWebhookInfo" | jq

# Test your endpoint (should return 403 without secret)
curl -s https://jobs.example.com/api/telegram/webhook

# Telegram will send the secret header on real updates — handled in code
```

### 4. Scheduled posts (Vercel Cron)

Jobs with `status = scheduled` and `scheduledAt <= now` are published by:

`GET /api/cron/scheduled-posts`  
Auth: `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`

Schedule is defined in `vercel.json` (every 5 minutes).

---

## End-to-end flows

### Bot: submit a job

```
/start          → upsert user in DB
/postjob        → membership check → wizard (title, company, …)
                → pick category (inline buttons)
                → upload payment screenshot
                → job status: pending_review
                → notify admins (TELEGRAM_ADMIN_NOTIFY_CHAT_ID)
```

Commands:

| Command | Description |
|---------|-------------|
| `/start` | Register / welcome |
| `/postjob` | Start submission wizard |
| `/myjobs` | List your jobs and statuses |
| `/pricing` | Pricing + link to site |
| `/cancel` | Cancel in-progress wizard |
| `/help` | Command list |

### Setup commands (discover `.env` values)

Use these while configuring Telegram — no need for @userinfobot or @RawDataBot.

| Command | Who can run | What you get |
|---------|-------------|--------------|
| `/myid` | Anyone | Your Telegram user id → `TELEGRAM_ADMIN_IDS` |
| `/chatid` | Admins* | Current chat id → `TELEGRAM_CHANNEL_ID` or `TELEGRAM_ADMIN_NOTIFY_CHAT_ID` |
| `/topicid` | Admins* | Forum `message_thread_id` → category **Telegram topic ID** in admin UI |
| `/setupids` | Admins* | Summary + copy-paste `.env` snippet for this context |

\*If `TELEGRAM_ADMIN_IDS` is **empty**, all setup commands work for everyone (bootstrap mode). After you set admin ids in `.env`, only those users can run `/chatid`, `/topicid`, and `/setupids`.

**Typical workflow:**

1. DM the bot → `/myid` → copy id into `TELEGRAM_ADMIN_IDS=...` in `.env`, restart app/bot.
2. Add bot to your **jobs supergroup** → run `/chatid` there → `TELEGRAM_CHANNEL_ID=-100...`
3. Open each **forum topic** → run `/topicid` → paste into **Admin → Categories**.
4. DM the bot again (or use an admin group) → `/chatid` → `TELEGRAM_ADMIN_NOTIFY_CHAT_ID=...`
5. Or run `/setupids` in each place for a combined block.

Optional: register commands in BotFather with `/setcommands`:

```
myid - Your Telegram user ID for .env
chatid - Chat ID for channel / notify (admin)
topicid - Forum topic ID (admin, run in topic)
setupids - All setup IDs + .env snippet (admin)
postjob - Submit a new job
myjobs - View your submissions
pricing - View pricing
help - Show commands
cancel - Cancel wizard
```

### Web: submit a job

Same lifecycle: `pending_payment` → upload proof → `pending_review` → admin verifies payment → admin approves.

### Admin: approve and publish

1. **Admin → Payments** — verify payment screenshot.
2. **Admin → Approval queue** — open job → **Approve & publish**.

What happens in code (`server/actions/admin.ts`):

1. Set job `status = approved`
2. Call `publishJobToTelegram(jobId)` (`lib/telegram/publisher.ts`)
3. Send message (or photo + caption) to `TELEGRAM_CHANNEL_ID`
4. If category has `telegramTopicId`, pass `message_thread_id`
5. Save row in `telegram_posts`
6. Set job `status = posted`, `postedAt`, `expiresAt`

**Important:** If step 2 fails (bad token, bot not admin, wrong chat id), the job stays at **`approved`** and will **not** appear on the public site (`listPublic` only returns `posted` jobs).

### Recovery when stuck at `approved`

On the admin job review page, if status is `approved` or `scheduled`:

- **Retry Telegram publish** — runs `publishJobToTelegram` again and shows the error in a toast.
- **Mark as posted (skip Telegram)** — sets `posted` without calling Telegram (for local UI testing).

---

## Admin: map categories to topics

1. Go to **Admin → Categories**.
2. For each category, set **Telegram topic ID** (integer from the topic link).
3. New approvals for that category post into that topic.

Schema field: `categories.telegram_topic_id` (`server/db/schema.ts`).

---

## Security

| Mechanism | Where |
|-----------|--------|
| Webhook secret header | `app/api/telegram/webhook/route.ts` — rejects requests without matching `X-Telegram-Bot-Api-Secret-Token` |
| Membership gate | `lib/telegram/client.ts` → `isUserInRequiredChannel` |
| Rate limit | 5 submissions / 24h per Telegram user (`lib/telegram/wizard.ts`) |
| Max pending posts | 3 per user |
| Payment lock | `approveJobAction` refuses approve if payment exists and is not `verified` |

---

## Troubleshooting

### Homepage shows "No jobs posted yet" but I have a job in the dashboard

Check job **status** in Admin or the dashboard:

| Status | On public site? |
|--------|-----------------|
| `pending_payment` | No |
| `pending_review` | No |
| `approved` | No (Telegram publish failed or not run yet) |
| `posted` | Yes |
| `rejected` | No |

Fix: complete payment → admin verify → **Approve & publish**, or use **Mark as posted (skip Telegram)** locally.

### `approve` succeeded but status is `approved`, not `posted`

`publishJobToTelegram` threw after approval. Common causes:

| Error symptom | Fix |
|---------------|-----|
| `chat not found` | Wrong `TELEGRAM_CHANNEL_ID`; bot not in group |
| `not enough rights` | Make bot admin with **Post messages** |
| `message thread not found` | Wrong **topic id** on category |
| `401 Unauthorized` | Invalid `TELEGRAM_BOT_TOKEN` |
| Network / timeout | Check server can reach `api.telegram.org` |

Use **Retry Telegram publish** on the admin job page to see the exact error.

### `/postjob` says I must join the channel

1. User must join `@TELEGRAM_REQUIRED_CHANNEL`.
2. Bot must be **admin** in that channel.
3. `TELEGRAM_REQUIRED_CHANNEL` must be the username **without** `@`.

### Webhook returns 403

`X-Telegram-Bot-Api-Secret-Token` does not match `TELEGRAM_WEBHOOK_SECRET`. Re-run:

```bash
npm run bot:set-webhook
```

### Bot does not respond locally

- Run `npm run bot:dev` in a **second** terminal.
- If you registered a webhook, delete it first: `bot:dev` does this automatically.
- Do not run `bot:dev` and webhook mode together.

### Polling vs webhook conflict

Only one update delivery mode at a time. Production = webhook; local = polling OR ngrok webhook.

---

## Quick test checklist

- [ ] Bot responds to `/start` in DM
- [ ] Non-member gets blocked on `/postjob`; member can proceed
- [ ] Wizard completes → job appears in **Admin → Approval queue** as `pending_review`
- [ ] Admin verifies payment → approves → message appears in supergroup (correct topic)
- [ ] Job status becomes `posted` → visible on `/` and `/jobs`
- [ ] `GET /api/telegram/webhook` returns OK (production)
- [ ] Webhook info shows no persistent error (`getWebhookInfo`)

---

## Useful commands

```bash
# Local bot (polling)
npm run bot:dev

# Register production webhook
npm run bot:set-webhook
npm run bot:set-webhook https://your-domain.com/api/telegram/webhook

# Make yourself admin (after web signup)
npm run db:make-admin

# Seed default categories
npm run db:seed
```

---

## Related docs

- Main README: [../README.md](../README.md) (architecture, env table, cron)
- Job lifecycle: `approveJobAction` in `server/actions/admin.ts`
- Publisher: `lib/telegram/publisher.ts`
