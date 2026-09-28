"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getTelebirrAccount } from "@/lib/payment-accounts";

export function PayToTelebirrCard({ className }: { className?: string }) {
	const tp = useTranslations("payment");
	const account = getTelebirrAccount();
	const [copied, setCopied] = useState(false);

	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(account);
			setCopied(true);
			toast.success(tp("copied"));
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Could not copy");
		}
	};

	return (
		<Card className={className ?? "border-primary/25 bg-primary/5"}>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<Smartphone className="size-4 text-primary" />
					{tp("payToTitle")}
				</CardTitle>
				<CardDescription>{tp("payToHint")}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3 rounded-xl border bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
					<div className="min-w-0">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							{tp("payToTelebirr")} · {tp("payToAccount")}
						</p>
						<p className="mt-1 font-mono text-xl font-semibold tracking-wide tabular-nums text-foreground sm:text-2xl">
							{account}
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						className="h-10 w-full shrink-0 gap-1.5 sm:w-auto"
						onClick={() => void onCopy()}
					>
						{copied ? (
							<Check className="size-4 text-amber-600" />
						) : (
							<Copy className="size-4" />
						)}
						{copied ? tp("copied") : tp("copyAccount")}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
