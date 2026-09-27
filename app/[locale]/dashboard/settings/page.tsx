import { AtSign, CheckCircle2, Mail, Send, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DisplayNameForm } from "@/components/dashboard/display-name-form";
import { TelegramConnectButton } from "@/components/dashboard/telegram-connect-button";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getBotUsername } from "@/lib/telegram/client";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();

  const displayName = user.displayName ?? user.email ?? "User";
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const botUsername = await getBotUsername();
  const telegramLinked =
    Boolean(user.telegramId) || Boolean(user.telegramUsername);
  const telegramHandle = user.telegramUsername
    ? `@${user.telegramUsername}`
    : user.telegramId != null
      ? String(user.telegramId)
      : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile and connected services."
      />

      {/* Profile */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 border-b">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/15 text-base font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate text-xl">{displayName}</CardTitle>
            <CardDescription>
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <DisplayNameForm defaultValue={user.displayName ?? ""} />

          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlyField
              icon={Mail}
              label="Email"
              value={user.email ?? "Not set"}
            />
            <ReadOnlyField
              icon={Shield}
              label="Role"
              value={user.role}
              capitalize
            />
          </div>
        </CardContent>
      </Card>

      {/* Telegram integration */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#2AABEE]/15 text-[#229ED9]">
                <Send className="size-5" />
              </span>
              <div>
                <CardTitle className="text-base">Telegram integration</CardTitle>
                <CardDescription>
                  Link Telegram to get bot replies and post jobs from chat.
                </CardDescription>
              </div>
            </div>
            <Badge variant={telegramLinked ? "success" : "outline"}>
              {telegramLinked ? "Connected" : "Not connected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {telegramLinked ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#2AABEE]/25 bg-[#2AABEE]/5 p-4">
              <CheckCircle2 className="size-5 shrink-0 text-[#229ED9]" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Telegram is connected</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <AtSign className="size-3.5 shrink-0" />
                  <span className="truncate">{telegramHandle}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  The bot can’t reply to you yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect your Telegram account so the bot can send you
                  submission updates, approval notices, and let you post jobs
                  directly from chat.
                </p>
              </div>

              {botUsername ? (
                <TelegramConnectButton />
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Telegram bot is not reachable right now. Please try again later
                  or contact an administrator.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-sm font-medium ${
            capitalize ? "capitalize" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
