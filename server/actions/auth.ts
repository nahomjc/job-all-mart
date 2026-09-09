"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-next-path";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validations/auth";

export interface AuthActionState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function authCallbackUrl(next?: string): string {
  const url = new URL("/auth/callback", env.NEXT_PUBLIC_APP_URL);
  if (next) url.searchParams.set("next", next);
  return url.toString();
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, error: error.message };
  }
  redirect(safeNextPath(formData.get("next")));
}

export async function signupAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: authCallbackUrl("/login"),
    },
  });
  if (error) {
    if (isAlreadyRegisteredError(error.message)) {
      redirectToExistingAccountLogin(parsed.data.email, formData.get("next"));
    }
    return { ok: false, error: error.message };
  }
  // Supabase returns a user with empty identities when the email is already
  // registered (anti-enumeration). Send them to sign in with email filled in.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    redirectToExistingAccountLogin(parsed.data.email, formData.get("next"));
  }
  return { ok: true };
}

function isAlreadyRegisteredError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("user already exists") ||
    lower.includes("email address is already")
  );
}

function redirectToExistingAccountLogin(
  email: string,
  next: FormDataEntryValue | null,
): never {
  const params = new URLSearchParams({
    email,
    notice: "existing",
  });
  if (
    typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("://")
  ) {
    params.set("next", next);
  }
  redirect(`/login?${params.toString()}`);
}

export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: authCallbackUrl("/login?mode=reset"),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      error: "Your reset link expired. Request a new one.",
    };
  }
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: error.message };
  redirect(safeNextPath(formData.get("next"), "/dashboard"));
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
