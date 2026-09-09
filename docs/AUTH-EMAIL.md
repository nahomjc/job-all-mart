# Auth emails via Brevo (Supabase Custom SMTP)

Signup verification and password-reset emails are sent by **Supabase Auth** through **Brevo SMTP**. Credentials live in the Supabase dashboard, not in this app’s `.env`.

## Brevo

1. Verify your sender domain/email in Brevo.
2. Create an **SMTP key** (SMTP & API → SMTP). Use the SMTP key, not the API key.

## Supabase → Auth → SMTP

| Setting | Value |
|---------|--------|
| Host | `smtp-relay.brevo.com` |
| Port | `587` (STARTTLS — not 465 unless required) |
| Username | Brevo SMTP Login from the SMTP page, e.g. `xxxxx@smtp-brevo.com` |
| Password | Full Brevo **SMTP key** (reveal/copy in Brevo — not the API key) |
| Sender name / email | Must be a **verified** sender under Brevo → Senders, domains |

After saving, send a test signup. It should finish in a few seconds. If signup hangs ~30s then fails, SMTP auth/host/port is wrong or Brevo is blocking the send — check Supabase **Auth logs** and Brevo **Transactional → Email** / SMTP logs.

## Supabase → Auth → URL configuration

- **Site URL**: production app URL (same idea as `NEXT_PUBLIC_APP_URL`)
- **Redirect URLs** (allow list), include all of:
  - `{PROD_URL}/auth/callback`
  - `http://localhost:3000/auth/callback` (or whatever port you use locally)

App routes that consume email links: `/auth/callback` → then `/login` (confirm) or `/login?mode=reset` (recovery).
