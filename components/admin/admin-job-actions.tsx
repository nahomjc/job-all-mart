"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  approveJobAction,
  rejectJobAction,
  scheduleJobAction,
  featureJobAction,
  verifyPaymentAction,
  rejectPaymentAction,
  type AdminActionState,
} from "@/server/actions/admin";

const initial: AdminActionState = { ok: false };

interface AdminJobActionsProps {
  jobId: string;
  paymentId?: string;
  paymentStatus?: string;
  jobStatus: string;
}

export function AdminJobActions(props: AdminJobActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const runApprove = () => {
    startTransition(async () => {
      const r = await approveJobAction(props.jobId);
      if (r.ok) {
        toast.success("Approved & posted to Telegram");
        router.refresh();
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  };

  const runVerifyPayment = () => {
    if (!props.paymentId) return;
    startTransition(async () => {
      const r = await verifyPaymentAction(props.paymentId!);
      if (r.ok) {
        toast.success("Payment verified");
        router.refresh();
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  };

  return (
    <div className="space-y-4">
      {props.paymentId && props.paymentStatus !== "verified" && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <p className="font-medium text-amber-700 dark:text-amber-400">
            Payment is {props.paymentStatus}. Verify it before approving the job.
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="success"
              onClick={runVerifyPayment}
              disabled={pending}
            >
              Verify payment
            </Button>
            <RejectPaymentDialog paymentId={props.paymentId} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={runApprove}
          disabled={pending || props.jobStatus === "posted"}
          variant="success"
        >
          {pending ? "Approving..." : "Approve & publish"}
        </Button>
        <RejectJobDialog jobId={props.jobId} />
        <ScheduleJobDialog jobId={props.jobId} />
        <FeatureJobDialog jobId={props.jobId} />
      </div>
    </div>
  );
}

function RejectJobDialog({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(rejectJobAction, initial);
  if (state.ok) {
    toast.success("Job rejected");
    router.refresh();
  } else if (state.error) {
    toast.error(state.error);
  }
  return (
    <form action={action} className="flex w-full max-w-md gap-2 md:max-w-none">
      <input type="hidden" name="jobId" value={jobId} />
      <Input name="reason" placeholder="Reason for rejection..." required />
      <Button type="submit" variant="destructive" disabled={pending}>
        Reject
      </Button>
    </form>
  );
}

function ScheduleJobDialog({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(scheduleJobAction, initial);
  if (state.ok) {
    toast.success("Scheduled");
    router.refresh();
  } else if (state.error) {
    toast.error(state.error);
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="jobId" value={jobId} />
      <Label className="text-xs">Schedule:</Label>
      <Input
        name="scheduledAt"
        type="datetime-local"
        className="w-auto"
        required
      />
      <Button type="submit" variant="secondary" disabled={pending}>
        Schedule
      </Button>
    </form>
  );
}

function FeatureJobDialog({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(featureJobAction, initial);
  if (state.ok) {
    toast.success("Pinned");
    router.refresh();
  } else if (state.error) {
    toast.error(state.error);
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="jobId" value={jobId} />
      <Label className="text-xs">Pin (days):</Label>
      <Input
        name="pinDays"
        type="number"
        min={0}
        max={30}
        defaultValue={1}
        className="w-20"
      />
      <Button type="submit" variant="outline" disabled={pending}>
        Feature
      </Button>
    </form>
  );
}

function RejectPaymentDialog({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(rejectPaymentAction, initial);
  if (state.ok) {
    toast.success("Payment rejected");
    router.refresh();
  } else if (state.error) {
    toast.error(state.error);
  }
  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="paymentId" value={paymentId} />
      <Input
        name="reason"
        placeholder="Reject reason..."
        required
        className="w-56"
      />
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        Reject
      </Button>
    </form>
  );
}
