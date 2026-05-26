"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, signupAction, type AuthActionState } from "@/server/actions/auth";

const initial: AuthActionState = { ok: false };

export function AuthForm() {
  const sp = useSearchParams();
  const mode = sp.get("mode") === "signup" ? "signup" : "login";

  const action = mode === "signup" ? signupAction : loginAction;
  const [state, formAction, pending] = useActionState(action, initial);

  if (state.ok && mode === "signup") {
    toast.success("Account created! Check your email to verify.");
  } else if (state.ok === false && state.error) {
    // Surface server error inline; toast on submit completion
  }

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            name="displayName"
            placeholder="Acme Corp"
            required
            minLength={2}
            maxLength={128}
          />
          <FieldError msg={state.fieldErrors?.displayName?.[0]} />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
        <FieldError msg={state.fieldErrors?.email?.[0]} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={6}
        />
        <FieldError msg={state.fieldErrors?.password?.[0]} />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/login?mode=signup" className="text-primary hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive">{msg}</p>;
}
