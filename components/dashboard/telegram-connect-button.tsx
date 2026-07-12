"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startTelegramLinkAction } from "@/server/actions/profile";

export function TelegramConnectButton() {
	const [pending, startTransition] = useTransition();
	const [opened, setOpened] = useState(false);

	const connect = () => {
		startTransition(async () => {
			const r = await startTelegramLinkAction();
			if (r.ok && r.url) {
				setOpened(true);
				window.open(r.url, "_blank", "noopener,noreferrer");
			} else {
				toast.error(r.error ?? "Could not start the connection");
			}
		});
	};

	return (
		<div className="space-y-3">
			<Button
				onClick={connect}
				disabled={pending}
				className="h-11 w-full bg-[#229ED9] text-white hover:bg-[#1a8bc4] sm:w-auto"
			>
				<Send className="size-4" />
				{pending ? "Preparing link…" : "Connect Telegram"}
				<ExternalLink className="size-3.5 opacity-70" />
			</Button>
			<ol className="space-y-1 text-xs text-muted-foreground">
				<li>1. Tap the button — the bot opens in your Telegram app.</li>
				<li>
					2. In the chat, tap <strong>Start</strong> to confirm the connection.
				</li>
				<li>
					3. Come back and refresh — your account will show as connected.
				</li>
			</ol>
			{opened && (
				<p className="text-xs text-muted-foreground">
					Opened Telegram in a new tab. The link is valid for 10 minutes. After
					tapping Start in the bot, refresh this page.
				</p>
			)}
		</div>
	);
}
