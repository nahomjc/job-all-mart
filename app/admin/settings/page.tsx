import { Radio } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { TelegramBroadcastForm } from "@/components/admin/telegram-broadcast-form";
import { env } from "@/lib/env";
import { settingsRepo } from "@/server/repositories/settings";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
	const broadcast = await settingsRepo.getTelegramBroadcast();

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Platform"
				title="Settings"
				description="Configure Telegram delivery and other platform options."
			/>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<Radio className="size-4" />
						</span>
						Telegram broadcast channel
					</CardTitle>
					<CardDescription>
						Post approved jobs to a public channel in addition to your forum
						group topics. Channels have no topics — every job goes to the main
						channel feed.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TelegramBroadcastForm
						initial={broadcast}
						groupChannelId={env.TELEGRAM_CHANNEL_ID}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
