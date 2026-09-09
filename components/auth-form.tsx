"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
      toast.success("Account created! Check your email to verify.");
    }
  }, [state.ok, mode]);

  useEffect(() => {
    if (existingNotice && mode === "login") {
      toast.message("You already have an account. Please sign in.");
    }
  }, [existingNotice, mode]);

  const isSignup = mode === "signup";

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignup
            ? "Create an account to post a job."
            : "Sign in to post a job or manage your listings."}
        </p>
      </div>

      <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-sm">
        <ModeTab href={`/login${nextSuffix}`} active={!isSignup} label="Sign in" />
        <ModeTab
          href={`/login?mode=signup${nextQuery}`}
          active={isSignup}
          label="Sign up"
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
                label="Display name"
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
              label="Email address"
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
              label="Password"
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
                    Forgot password?
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
                <span>
                  You already have an account with this email. Please sign in.
                </span>
              </div>
            ) : null}

            {(state.error || oauthError) && (
              <ErrorAlert message={state.error ?? oauthError ?? "Something went wrong"} />
            )}

            <Button
              type="submit"
              className="h-11 w-full text-base"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isSignup ? "Creating account..." : "Signing in..."}
                </>
              ) : isSignup ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href={`/login${nextSuffix}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New here?{" "}
                  <Link
                    href={`/login?mode=signup${nextQuery}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Create an account
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
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initial,
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("If an account exists, we sent a reset link.");
    }
  }, [state.ok]);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {state.ok ? (
        <div className="space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <CheckCircle2 className="size-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Check your inbox</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              If an account exists for that email, we sent a password reset
              link. Open it to choose a new password.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/login${nextSuffix}`}>Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <Field
            id="email"
            label="Email address"
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
                Sending link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link
              href={`/login${nextSuffix}`}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

function ResetPasswordForm({ next }: { next: string | null }) {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initial,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Choose a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter a new password for your account.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <Field
          id="password"
          label="New password"
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
          label="Confirm password"
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
              Updating...
            </>
          ) : (
            "Update password"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Link expired?{" "}
          <Link
            href="/login?mode=forgot"
            className="font-medium text-primary hover:underline"
          >
            Request a new one
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
  const signInHref = next
    ? `/login?next=${encodeURIComponent(next)}`
    : "/login";
  return (
    <div className="space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <CheckCircle2 className="size-6" />
      </span>
      <div>
        <h2 className="text-lg font-semibold">Check your inbox</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a verification link to confirm your email. Once verified,
          come back and sign in.
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href={signInHref}>Back to sign in</Link>
      </Button>
    </div>
  );
}
