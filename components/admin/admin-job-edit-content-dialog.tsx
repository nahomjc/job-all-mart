"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateJobContentAction } from "@/server/actions/admin";

type AdminJobEditContentDialogProps = {
	jobId: string;
	title: string;
	description: string;
	triggerClassName?: string;
	triggerLabel?: string;
};

export function AdminJobEditContentDialog({
	jobId,
	title,
	description,
	triggerClassName,
	triggerLabel = "Edit title & description",
}: AdminJobEditContentDialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [pending, startTransition] = useTransition();
	const [draftTitle, setDraftTitle] = useState(title);
	const [draftDescription, setDraftDescription] = useState(description);

	const onOpenChange = (next: boolean) => {
		if (pending) return;
		if (next) {
			setDraftTitle(title);
			setDraftDescription(description);
		}
		setOpen(next);
	};

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		startTransition(async () => {
			const result = await updateJobContentAction({ ok: false }, formData);
			if (result.ok) {
				toast.success("Title and description updated");
				setOpen(false);
				router.refresh();
			} else {
				toast.error(result.error ?? "Failed to update job");
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className={triggerClassName ?? "h-11 w-full shrink-0 sm:w-auto"}
				>
					<Pencil className="size-4" />
					{triggerLabel}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit job content</DialogTitle>
					<DialogDescription>
						Update the title and description shown on the site and used when
						publishing to Telegram.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					<input type="hidden" name="jobId" value={jobId} />
					<div className="space-y-2">
						<Label htmlFor={`edit-job-title-${jobId}`}>Title</Label>
						<Input
							id={`edit-job-title-${jobId}`}
							name="title"
							value={draftTitle}
							onChange={(e) => setDraftTitle(e.target.value)}
							maxLength={200}
							required
							disabled={pending}
							className="h-11"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor={`edit-job-description-${jobId}`}>
							Description
						</Label>
						<Textarea
							id={`edit-job-description-${jobId}`}
							name="description"
							value={draftDescription}
							onChange={(e) => setDraftDescription(e.target.value)}
							rows={10}
							required
							disabled={pending}
							className="min-h-50 resize-y"
						/>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={pending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={pending}>
							{pending ? "Saving…" : "Save changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
