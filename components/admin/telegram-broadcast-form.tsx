"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	testTelegramBroadcastAction,
	updateTelegramBroadcastAction,
} from "@/server/actions/admin";
import type { TelegramBroadcastSettings } from "@/server/repositories/settings";

interface TelegramBroadcastFormProps {
	initial: TelegramBroadcastSettings;
	groupChannelId: string;
}

export function TelegramBroadcastForm({
	initial,
	groupChannelId,
}: TelegramBroadcastFormProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [testing, startTest] = useTransition();

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		startTransition(async () => {
			const result = await updateTelegramBroadcastAction(
				{ ok: false },
				formData,
			);
			if (result.ok) {
				toast.success("Telegram broadcast settings saved");
				router.refresh();
			} else {
				toast.error(result.error ?? "Failed to save settings");
			}
		});
	};

	const onTest = () => {
		startTest(async () => {
			const result = await testTelegramBroadcastAction();
			if (result.ok) {
				toast.success("Test message sent — check your channel");
			} else {
				toast.error(result.error ?? "Test failed");
			}
		});
	};

	return (
		<form onSubmit={onSubmit} className="space-y-5">
			<div className="space-y-1.5">
				<Label htmlFor="broadcast-channel-id">Broadcast channel ID</Label>
				<Input
					id="broadcast-channel-id"
					name="channelId"
					defaultValue={initial.channelId ?? ""}
					placeholder="-1001234567890 or @your_channel"
					className="font-mono text-sm"
					autoComplete="off"
				/>
				<p className="text-xs text-muted-foreground">
					Add the bot as an <strong>admin</strong> of your channel, then run{" "}
					<span className="font-mono">/chatid</span> inside the channel and paste
					the id here. Jobs still post to your forum group (
					<span className="font-mono">{groupChannelId}</span>); when enabled, the
					same job is also posted to this channel.
				</p>
			</div>

			<div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
				<input
					id="broadcast-enabled"
					name="enabled"
					type="checkbox"
					value="true"
					defaultChecked={initial.enabled}
					className="mt-1 size-4 rounded border-input"
				/>
				<div className="space-y-1">
					<Label htmlFor="broadcast-enabled" className="cursor-pointer">
						Also post approved jobs to the broadcast channel
					</Label>
					<p className="text-xs text-muted-foreground">
						When off, only the forum group (with category topics) receives new
						posts.
					</p>
				</div>
			</div>

			<div className="flex flex-wrap justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={onTest}
					disabled={testing || !initial.channelId}
					title={
						initial.channelId
							? "Send a test message to the saved channel"
							: "Save a channel ID first"
					}
				>
					{testing ? "Sending…" : "Send test message"}
				</Button>
				<Button type="submit" disabled={pending}>
					{pending ? "Saving…" : "Save settings"}
				</Button>
			</div>
			<p className="text-xs text-muted-foreground">
				The test uses the <strong>saved</strong> channel ID. If you just changed
				it, click <strong>Save settings</strong> first, then test.
			</p>
		</form>
	);
}
