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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  loginAction,
  signupAction,
  type AuthActionState,
} from "@/server/actions/auth";

const initial: AuthActionState = { ok: false };

export function AuthForm() {
  const sp = useSearchParams();
  const mode = sp.get("mode") === "signup" ? "signup" : "login";

  const action = mode === "signup" ? signupAction : loginAction;
  const [state, formAction, pending] = useActionState(action, initial);
  const [showPassword, setShowPassword] = useState(false);

  // Toast on successful signup (verification email sent)
  useEffect(() => {
    if (state.ok && mode === "signup") {
      toast.success("Account created! Check your email to verify.");
    }
  }, [state.ok, mode]);

  const isSignup = mode === "signup";

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignup
            ? "Start posting jobs on the channels in under a minute."
            : "Sign in to manage your posts and Telegram delivery."}
        </p>
      </div>

      {/* Mode switcher (segmented) */}
      <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-sm">
        <ModeTab href="/login" active={!isSignup} label="Sign in" />
        <ModeTab href="/login?mode=signup" active={isSignup} label="Sign up" />
      </div>

      {/* Success state for signup */}
      {state.ok && isSignup ? (
        <SignupSuccess />
      ) : (
        <form action={formAction} className="space-y-4">
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
                  href="/login?mode=forgot"
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
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </Field>

          {/* Inline error alert */}
          {state.error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
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
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link
                  href="/login?mode=signup"
                  className="font-medium text-primary hover:underline"
                >
                  Create an account
                </Link>
              </>
            )}
          </p>
        </form>
      )}
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

function SignupSuccess() {
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
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
