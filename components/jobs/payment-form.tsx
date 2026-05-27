"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader } from "@/components/file-uploader";
import {
  submitPaymentAction,
  type ActionState,
} from "@/server/actions/jobs";

const initial: ActionState = { ok: false };

export function PaymentForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitPaymentAction, initial);

  if (state.ok) {
    toast.success("Payment submitted. Awaiting admin review.");
    router.push(`/dashboard/jobs/${jobId}`);
  } else if (state.error && !state.fieldErrors) {
    toast.error(state.error);
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="jobId" value={jobId} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount paid</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min={0}
            placeholder="10"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Select name="currency" defaultValue="USD" required>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="ETB">ETB - Ethiopian Birr</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="method">Method</Label>
          <Select name="method" defaultValue="bank_transfer">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Bank transfer</SelectItem>
              <SelectItem value="mobile_money">Mobile money</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="referenceCode">Reference code (optional)</Label>
          <Input
            id="referenceCode"
            name="referenceCode"
            placeholder="TXN-..."
            maxLength={64}
          />
        </div>
      </div>

      <FileUploader
        kind="payment"
        name="screenshotKey"
        label="Payment screenshot"
        helperText="PNG, JPG, WebP, or GIF — up to 5 MB."
      />

      {state.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Submit payment"}
        </Button>
      </div>
    </form>
  );
}
