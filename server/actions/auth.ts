"use server";

import { headers } from "next/headers";
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

async function appOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto =
      h.get("x-forwarded-proto") ??
      (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return env.NEXT_PUBLIC_APP_URL;
}

async function authCallbackUrl(next?: string): Promise<string> {
  const url = new URL("/auth/callback", await appOrigin());
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
  let data: Awaited<ReturnType<typeof supabase.auth.signUp>>["data"];
  let error: Awaited<ReturnType<typeof supabase.auth.signUp>>["error"];
  try {
    const result = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { display_name: parsed.data.displayName },
        emailRedirectTo: await authCallbackUrl("/login"),
      },
    });
    data = result.data;
    error = result.error;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    console.error("[signupAction] threw:", message);
    return { ok: false, error: mapAuthDeliveryError(message) };
  }
  if (error) {
    console.error("[signupAction] supabase error:", {
      message: error.message,
      status: error.status,
      code: error.code,
      name: error.name,
    });
    if (isAlreadyRegisteredError(error.message)) {
      redirectToExistingAccountLogin(parsed.data.email, formData.get("next"));
    }
    return {
      ok: false,
      error: mapAuthDeliveryError(error.message, error.status, error.name),
    };
  }
  console.info("[signupAction] ok", {
    userId: data.user?.id,
    identities: data.user?.identities?.length ?? 0,
    email: data.user?.email,
  });
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

function mapAuthDeliveryError(
  message: string,
  status?: number,
  name?: string,
): string {
  const lower = (message || "").toLowerCase();
  const looksEmpty = !message || message === "{}" || message === "null";
  if (
    status === 504 ||
    name === "AuthRetryableFetchError" ||
    lower.includes("timed out") ||
    lower.includes("timeout") ||
    lower.includes("504") ||
    lower.includes("confirmation mail") ||
    lower.includes("error sending") ||
    lower.includes("smtp") ||
    lower.includes("context deadline") ||
    looksEmpty
  ) {
    return "Could not send the verification email (SMTP timeout). In Supabase Auth → SMTP, re-check Brevo host/port/login/SMTP key and that the sender email is verified in Brevo, then try again.";
  }
  return message;
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
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: await authCallbackUrl("/login?mode=reset"),
    },
  );
  if (error) return { ok: false, error: mapAuthDeliveryError(error.message, error.status, error.name) };
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
