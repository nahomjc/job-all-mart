"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
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
import { approveJobAction, rejectJobAction } from "@/server/actions/admin";

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
	const [approveOpen, setApproveOpen] = useState(false);
	const [rejectOpen, setRejectOpen] = useState(false);
	const [reason, setReason] = useState("");

	if (jobStatus === "posted") return null;

	const busy = approvePending || rejectPending;

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

	return (
		<>
			<Button
				variant="success"
				className="h-11 w-full shrink-0 sm:w-auto"
				onClick={() => setApproveOpen(true)}
				disabled={busy}
			>
				<CheckCircle2 className="size-4" />
				Approve & publish
			</Button>
			<Button
				variant="destructive"
				className="h-11 w-full shrink-0 sm:w-auto"
				onClick={() => setRejectOpen(true)}
				disabled={busy}
			>
				<XCircle className="size-4" />
				Reject
			</Button>

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

			<Dialog open={rejectOpen} onOpenChange={(o) => !rejectPending && setRejectOpen(o)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject job</DialogTitle>
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
							disabled={rejectPending}
						>
							<XCircle className="size-4" />
							{rejectPending ? "Rejecting…" : "Reject job"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
