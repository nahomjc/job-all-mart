"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	approveJobAction,
	rejectJobAction,
	republishJobAction,
} from "@/server/actions/admin";

type AdminJobHeaderActionsProps = {
	jobId: string;
	jobTitle: string;
	jobStatus: string;
	hasPayment?: boolean;
	paymentVerified?: boolean;
};

export function AdminJobHeaderActions({
	jobId,
	jobTitle,
	jobStatus,
}: AdminJobHeaderActionsProps) {
	const router = useRouter();
	const [approvePending, startApprove] = useTransition();
	const [rejectPending, startReject] = useTransition();
	const [repostPending, startRepost] = useTransition();
	const [approveOpen, setApproveOpen] = useState(false);
	const [rejectOpen, setRejectOpen] = useState(false);
	const [repostOpen, setRepostOpen] = useState(false);
	const [reason, setReason] = useState("");

	const isPosted = jobStatus === "posted";
	const canApproveReject =
		!isPosted && jobStatus !== "rejected" && jobStatus !== "expired";
	const canRepost =
		isPosted || jobStatus === "approved" || jobStatus === "scheduled";

	const busy = approvePending || rejectPending || repostPending;

	const openApproveConfirm = () => {
		// Defer so the dropdown fully closes before the confirm dialog opens.
		window.setTimeout(() => setApproveOpen(true), 0);
	};

	const openRejectConfirm = () => {
		window.setTimeout(() => setRejectOpen(true), 0);
	};

	const runApprove = () => {
		startApprove(async () => {
			const r = await approveJobAction(jobId);
			if (r.ok) {
				toast.success("Approved and published to Telegram");
				setApproveOpen(false);
				router.refresh();
			} else {
				toast.error(r.error ?? "Approval failed");
			}
		});
	};

	const runReject = () => {
		if (!reason.trim()) {
			toast.error("Please add a rejection reason");
			return;
		}
		const formData = new FormData();
		formData.set("jobId", jobId);
		formData.set("reason", reason.trim());
		startReject(async () => {
			const r = await rejectJobAction({ ok: false }, formData);
			if (r.ok) {
				toast.success("Job rejected");
				setRejectOpen(false);
				setReason("");
				router.refresh();
			} else {
				toast.error(r.error ?? "Rejection failed");
			}
		});
	};

	const runRepost = () => {
		startRepost(async () => {
			const r = await republishJobAction(jobId);
			if (r.ok) {
				toast.success("Re-posted to Telegram");
				setRepostOpen(false);
				router.refresh();
			} else {
				toast.error(r.error ?? "Telegram re-post failed");
			}
		});
	};

	if (!canApproveReject && !canRepost) return null;

	return (
		<>
			{canRepost ? (
				<Button
					variant="outline"
					className="h-11 w-full shrink-0 sm:w-auto"
					onClick={() => setRepostOpen(true)}
					disabled={busy}
				>
					<Send className="size-4" />
					Re-post to Telegram
				</Button>
			) : null}

			{canApproveReject ? (
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="default"
							className="h-11 min-h-11 w-full shrink-0 touch-manipulation sm:w-auto"
							disabled={busy}
						>
							Review decision
							<ChevronDown className="size-4 opacity-70" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="min-w-56 p-1.5"
						onCloseAutoFocus={(e) => e.preventDefault()}
					>
						<DropdownMenuItem
							className="min-h-11 cursor-pointer gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-amber-800 focus:bg-amber-500/10 focus:text-amber-900 dark:text-amber-300 dark:focus:text-amber-200"
							onSelect={(e) => {
								e.preventDefault();
								openApproveConfirm();
							}}
						>
							<CheckCircle2 className="size-4 shrink-0" />
							Approve & publish
						</DropdownMenuItem>
						<DropdownMenuItem
							className="min-h-11 cursor-pointer gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
							onSelect={(e) => {
								e.preventDefault();
								openRejectConfirm();
							}}
						>
							<XCircle className="size-4 shrink-0" />
							Reject
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : null}

			<Dialog
				open={repostOpen}
				onOpenChange={(o) => !repostPending && setRepostOpen(o)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Re-post to Telegram?</DialogTitle>
						<DialogDescription>
							This will send a new Telegram post for{" "}
							<span className="font-medium text-foreground">{jobTitle}</span>{" "}
							with the current job details (title, description, logo, salary,
							etc.).
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							className="h-11"
							onClick={() => setRepostOpen(false)}
							disabled={repostPending}
						>
							Cancel
						</Button>
						<Button
							className="h-11"
							onClick={runRepost}
							disabled={repostPending}
						>
							<Send className="size-4" />
							{repostPending ? "Posting…" : "Yes, re-post"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={approveOpen}
				onOpenChange={(o) => !approvePending && setApproveOpen(o)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Approve & publish?</DialogTitle>
						<DialogDescription>
							This will approve{" "}
							<span className="font-medium text-foreground">{jobTitle}</span>{" "}
							and publish it to Telegram. Continue?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							className="h-11"
							onClick={() => setApproveOpen(false)}
							disabled={approvePending}
						>
							Cancel
						</Button>
						<Button
							variant="success"
							className="h-11"
							onClick={runApprove}
							disabled={approvePending}
						>
							<CheckCircle2 className="size-4" />
							{approvePending ? "Publishing…" : "Yes, publish"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={rejectOpen}
				onOpenChange={(o) => !rejectPending && setRejectOpen(o)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject job?</DialogTitle>
						<DialogDescription>
							Add a reason for rejecting{" "}
							<span className="font-medium text-foreground">{jobTitle}</span>.
							The employer will be notified.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<Label
							htmlFor="header-reject-reason"
							className="text-xs text-muted-foreground"
						>
							Rejection reason <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="header-reject-reason"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							rows={4}
							placeholder="e.g. Payment screenshot unclear, job content violates policy…"
							disabled={rejectPending}
							className="min-w-0 resize-none"
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							className="h-11"
							onClick={() => setRejectOpen(false)}
							disabled={rejectPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							className="h-11"
							onClick={runReject}
							disabled={rejectPending || !reason.trim()}
						>
							<XCircle className="size-4" />
							{rejectPending ? "Rejecting…" : "Yes, reject"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
