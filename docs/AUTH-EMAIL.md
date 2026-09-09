# Auth emails via Brevo (Supabase Custom SMTP)

Signup verification and password-reset emails are sent by **Supabase Auth** through **Brevo SMTP**. Credentials live in the Supabase dashboard, not in this app’s `.env`.

## Brevo

1. Verify your sender domain/email in Brevo.
2. Create an **SMTP key** (SMTP & API → SMTP).

## Supabase → Auth → SMTP

| Setting | Value |
|---------|--------|
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | Brevo account email |
| Password | Brevo SMTP key |
| Sender name / email | Your verified Brevo sender |

## Supabase → Auth → URL configuration

- **Site URL**: same as `NEXT_PUBLIC_APP_URL`
- **Redirect URLs**: include `{APP_URL}/auth/callback` (and local `http://localhost:.../auth/callback` if needed)

App routes that consume email links: `/auth/callback` → then `/login` (confirm) or `/login?mode=reset` (recovery).
