import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Display name: </span>
            {user.displayName ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Email: </span>
            {user.email ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Telegram: </span>
            {user.telegramUsername
              ? `@${user.telegramUsername}`
              : user.telegramId ?? "Not linked"}
          </p>
          <p>
            <span className="text-muted-foreground">Auth provider: </span>
            {user.authProvider}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
