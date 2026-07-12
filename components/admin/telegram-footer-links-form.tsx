"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTelegramFooterLinksAction } from "@/server/actions/admin";
import type { TelegramFooterLink } from "@/server/repositories/settings";

interface TelegramFooterLinksFormProps {
	initial: TelegramFooterLink[];
}

type Row = TelegramFooterLink & { key: string };

let rowCounter = 0;
const makeRow = (link: TelegramFooterLink): Row => ({
	popup: "",
	...link,
	key: `row-${rowCounter++}`,
});

export function TelegramFooterLinksForm({
	initial,
}: TelegramFooterLinksFormProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [links, setLinks] = useState<Row[]>(
		(initial.length > 0 ? initial : [{ label: "", url: "" }]).map(makeRow),
	);

	const update = (i: number, patch: Partial<TelegramFooterLink>) => {
		setLinks((prev) =>
			prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
		);
	};

	const remove = (i: number) => {
		setLinks((prev) => prev.filter((_, idx) => idx !== i));
	};

	const add = () => {
		setLinks((prev) => [...prev, makeRow({ label: "", url: "" })]);
	};

	const onSave = () => {
		startTransition(async () => {
			const result = await updateTelegramFooterLinksAction(
				links.map(({ label, url, popup }) => ({ label, url, popup })),
			);
			if (result.ok) {
				toast.success("Channel buttons saved");
				router.refresh();
			} else {
				toast.error(result.error ?? "Failed to save buttons");
			}
		});
	};

	return (
		<div className="space-y-4">
			<div className="space-y-3">
				{links.map((link, i) => (
					<div
						key={link.key}
						className="space-y-2 rounded-lg border bg-muted/30 p-3"
					>
						<div className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
							<div className="space-y-1.5">
								<Label
									htmlFor={`footer-label-${i}`}
									className="text-xs text-muted-foreground"
								>
									Button label
								</Label>
								<Input
									id={`footer-label-${i}`}
									value={link.label}
									onChange={(e) => update(i, { label: e.target.value })}
									placeholder="e.g. Follow on TikTok"
									disabled={pending}
									maxLength={64}
								/>
							</div>
							<div className="space-y-1.5">
								<Label
									htmlFor={`footer-url-${i}`}
									className="text-xs text-muted-foreground"
								>
									Link URL
								</Label>
								<Input
									id={`footer-url-${i}`}
									value={link.url}
									onChange={(e) => update(i, { url: e.target.value })}
									placeholder="https://tiktok.com/@yourbrand"
									disabled={pending}
									className="font-mono text-sm"
									autoComplete="off"
								/>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
								onClick={() => remove(i)}
								disabled={pending}
								title="Remove button"
							>
								<Trash2 className="size-4" />
							</Button>
						</div>
						<div className="space-y-1.5">
							<Label
								htmlFor={`footer-popup-${i}`}
								className="text-xs text-muted-foreground"
							>
								Popup text (optional — used only when no URL is set)
							</Label>
							<Textarea
								id={`footer-popup-${i}`}
								value={link.popup ?? ""}
								onChange={(e) => update(i, { popup: e.target.value })}
								rows={2}
								maxLength={200}
								placeholder="Shown as a popup when tapped (max 200 chars). Leave empty for a normal link button."
								disabled={pending}
								className="resize-none text-sm"
							/>
						</div>
					</div>
				))}
			</div>

			<div className="flex flex-wrap items-center justify-between gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={add}
					disabled={pending || links.length >= 8}
				>
					<Plus className="size-4" />
					Add button
				</Button>
				<Button type="button" onClick={onSave} disabled={pending}>
					{pending ? "Saving…" : "Save buttons"}
				</Button>
			</div>
			<p className="text-xs text-muted-foreground">
				Buttons with a valid <span className="font-mono">https://</span> URL open
				that link. If you leave the URL empty and add popup text, the button
				shows that text as a popup instead. Buttons attach under every approved
				job post (group and broadcast channel), each on its own row.
			</p>
		</div>
	);
}
