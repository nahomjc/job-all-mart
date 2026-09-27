"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TelegramAuthButton } from "@/components/telegram-auth-button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  forgotPasswordAction,
  loginAction,
  signupAction,
  updatePasswordAction,
  type AuthActionState,
} from "@/server/actions/auth";

const initial: AuthActionState = { ok: false };

type AuthMode = "login" | "signup" | "forgot" | "reset";

function resolveMode(raw: string | null): AuthMode {
  if (raw === "signup" || raw === "forgot" || raw === "reset") return raw;
  return "login";
}

export function AuthForm() {
  const t = useTranslations("auth");
  const tn = useTranslations("nav");
  const tc = useTranslations("common");
  const sp = useSearchParams();
  const mode = resolveMode(sp.get("mode"));
  const oauthError = sp.get("error");
  const next = sp.get("next");
  const emailPrefill = sp.get("email") ?? "";
  const existingNotice = sp.get("notice") === "existing";
  const nextQuery = next ? `&next=${encodeURIComponent(next)}` : "";
  const nextSuffix = next ? `?next=${encodeURIComponent(next)}` : "";

  if (mode === "forgot") {
    return <ForgotPasswordForm nextSuffix={nextSuffix} emailPrefill={emailPrefill} />;
  }
  if (mode === "reset") {
    return <ResetPasswordForm next={next} />;
  }

  const action = mode === "signup" ? signupAction : loginAction;
  const [state, formAction, pending] = useActionState(action, initial);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.ok && mode === "signup") {
      toast.success(t("checkEmail"));
    }
  }, [state.ok, mode, t]);

  useEffect(() => {
    if (existingNotice && mode === "login") {
      toast.message(t("hasAccount"));
    }
  }, [existingNotice, mode, t]);

  const isSignup = mode === "signup";

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {isSignup ? t("createAccount") : t("welcomeBack")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignup ? t("loginSubtitle") : t("loginBody")}
        </p>
      </div>

      <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-sm">
        <ModeTab href={`/login${nextSuffix}`} active={!isSignup} label={tn("signIn")} />
        <ModeTab
          href={`/login?mode=signup${nextQuery}`}
          active={isSignup}
          label={tn("signUp")}
        />
      </div>

      {state.ok && isSignup ? (
        <SignupSuccess next={next} />
      ) : (
        <div className="space-y-4">
          <TelegramAuthButton mode={isSignup ? "signup" : "login"} />

          <form action={formAction} className="space-y-4">
            {next ? <input type="hidden" name="next" value={next} /> : null}
            {isSignup && (
              <Field
                id="displayName"
                label={t("displayName")}
                icon={UserIcon}
                error={state.fieldErrors?.displayName?.[0]}
              >
                <Input
                  id="displayName"
                  name="displayName"
                  placeholder="Acme Corp"
                  required
                  minLength={2}
                  maxLength={128}
                  className="h-11 pl-10"
                />
              </Field>
            )}

            <Field
              id="email"
              label={t("email")}
              icon={Mail}
              error={state.fieldErrors?.email?.[0]}
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                defaultValue={emailPrefill}
                className="h-11 pl-10"
              />
            </Field>

            <Field
              id="password"
              label={t("password")}
              icon={Lock}
              error={state.fieldErrors?.password?.[0]}
              headerExtra={
                !isSignup ? (
                  <Link
                    href={
                      emailPrefill
                        ? `/login?mode=forgot&email=${encodeURIComponent(emailPrefill)}`
                        : "/login?mode=forgot"
                    }
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {t("forgotPassword")}
                  </Link>
                ) : null
              }
            >
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder={isSignup ? "At least 6 characters" : "Your password"}
                required
                minLength={6}
                className="h-11 pl-10 pr-10"
              />
              <PasswordToggle
                show={showPassword}
                onToggle={() => setShowPassword((s) => !s)}
              />
            </Field>

            {existingNotice && !isSignup && !state.error && !oauthError ? (
              <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{t("hasAccount")}</span>
              </div>
            ) : null}

            {(state.error || oauthError) && (
              <ErrorAlert message={state.error ?? oauthError ?? tc("error")} />
            )}

            <Button
              type="submit"
              className="h-11 w-full text-base"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isSignup ? t("creatingAccount") : t("signingIn")}
                </>
              ) : isSignup ? (
                t("signupTitle")
              ) : (
                t("loginTitle")
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {isSignup ? (
                <>
                  {t("hasAccount")}{" "}
                  <Link
                    href={`/login${nextSuffix}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {tn("signIn")}
                  </Link>
                </>
              ) : (
                <>
                  {t("noAccount")}{" "}
                  <Link
                    href={`/login?mode=signup${nextQuery}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {t("createAccount")}
                  </Link>
                </>
              )}
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

function ForgotPasswordForm({
  nextSuffix,
  emailPrefill = "",
}: {
  nextSuffix: string;
  emailPrefill?: string;
}) {
  const t = useTranslations("auth");
  const tn = useTranslations("nav");
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initial,
  );

  useEffect(() => {
    if (state.ok) {
      toast.success(t("resetSent"));
    }
  }, [state.ok, t]);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("resetPassword")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("email")}</p>
      </div>

      {state.ok ? (
        <div className="space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <CheckCircle2 className="size-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">{t("checkEmail")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("resetSent")}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/login${nextSuffix}`}>{t("backToLogin")}</Link>
          </Button>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <Field
            id="email"
            label={t("email")}
            icon={Mail}
            error={state.fieldErrors?.email?.[0]}
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              defaultValue={emailPrefill}
              className="h-11 pl-10"
            />
          </Field>

          {state.error && <ErrorAlert message={state.error} />}

          <Button
            type="submit"
            className="h-11 w-full text-base"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("sendResetLink")}
              </>
            ) : (
              t("sendResetLink")
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={`/login${nextSuffix}`}
              className="font-medium text-primary hover:underline"
            >
              {tn("signIn")}
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

function ResetPasswordForm({ next }: { next: string | null }) {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initial,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("resetPassword")}
        </h1>
      </div>

      <form action={formAction} className="space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <Field
          id="password"
          label={t("password")}
          icon={Lock}
          error={state.fieldErrors?.password?.[0]}
        >
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="h-11 pl-10 pr-10"
          />
          <PasswordToggle
            show={showPassword}
            onToggle={() => setShowPassword((s) => !s)}
          />
        </Field>

        <Field
          id="confirmPassword"
          label={t("confirmPassword")}
          icon={Lock}
          error={state.fieldErrors?.confirmPassword?.[0]}
        >
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat password"
            required
            minLength={6}
            className="h-11 pl-10"
          />
        </Field>

        {state.error && <ErrorAlert message={state.error} />}

        <Button
          type="submit"
          className="h-11 w-full text-base"
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("resetPassword")}
            </>
          ) : (
            t("resetPassword")
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login?mode=forgot"
            className="font-medium text-primary hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </p>
      </form>
    </div>
  );
}

/* ─────────── Helpers ─────────── */

function ModeTab({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

interface FieldProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

function Field({
  id,
  label,
  icon: Icon,
  error,
  headerExtra,
  children,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {headerExtra}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? "Hide password" : "Show password"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
    >
      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function SignupSuccess({ next }: { next: string | null }) {
  const t = useTranslations("auth");
  const signInHref = next
    ? `/login?next=${encodeURIComponent(next)}`
    : "/login";
  return (
    <div className="space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <CheckCircle2 className="size-6" />
      </span>
      <div>
        <h2 className="text-lg font-semibold">{t("checkEmail")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("checkEmail")}
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href={signInHref}>{t("backToLogin")}</Link>
      </Button>
    </div>
  );
}
