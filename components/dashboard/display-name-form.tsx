"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	updateDisplayNameAction,
	type ProfileActionState,
} from "@/server/actions/profile";

const initial: ProfileActionState = { ok: false };

export function DisplayNameForm({
	defaultValue,
}: {
	defaultValue: string;
}) {
	const router = useRouter();
	const [state, action, pending] = useActionState(
		updateDisplayNameAction,
		initial,
	);

	useEffect(() => {
		if (state.ok) {
			toast.success("Display name updated");
			router.refresh();
		} else if (state.error) {
			toast.error(state.error);
		}
	}, [state, router]);

	return (
		<form action={action} className="space-y-3">
			<Label
				htmlFor="displayName"
				className="text-xs uppercase tracking-wider text-muted-foreground"
			>
				Display name
			</Label>
			<div className="flex flex-col gap-2 sm:flex-row">
				<div className="relative min-w-0 flex-1">
					<User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="displayName"
						name="displayName"
						defaultValue={defaultValue}
						placeholder="Your name"
						required
						minLength={2}
						maxLength={80}
						disabled={pending}
						className="h-11 pl-9"
					/>
				</div>
				<Button
					type="submit"
					className="h-11 shrink-0 sm:w-auto"
					disabled={pending}
				>
					<Check className="size-4" />
					{pending ? "Saving…" : "Save"}
				</Button>
			</div>
			<p className="text-xs text-muted-foreground">
				This is the name shown across your dashboard and on your job posts.
			</p>
		</form>
	);
}
