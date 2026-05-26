import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2 font-semibold">
        <Briefcase className="size-5 text-primary" />
        <span>{process.env.NEXT_PUBLIC_APP_NAME ?? "JobPost"}</span>
      </Link>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your posts, or create an account.
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <AuthForm />
          </Suspense>
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Prefer Telegram?{" "}
        <a
          href={`https://t.me/${process.env.TELEGRAM_REQUIRED_CHANNEL ?? ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Post directly from the bot
        </a>
        .
      </p>
    </div>
  );
}
