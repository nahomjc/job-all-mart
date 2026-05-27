"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { updateUserRoleAction } from "@/server/actions/admin";
import type { User } from "@/server/db/schema";

const ROLE_OPTIONS: { value: User["role"]; label: string; description: string }[] =
	[
		{
			value: "user",
			label: "User",
			description: "Can post jobs and use the dashboard only.",
		},
		{
			value: "admin",
			label: "Admin",
			description: "Can review jobs, payments, and manage users.",
		},
		{
			value: "owner",
			label: "Owner",
			description: "Full access, including assigning owner role.",
		},
	];

interface UpdateUserRoleFormProps {
	userId: string;
	currentRole: User["role"];
	actorId: string;
	actorRole: User["role"];
}

export function UpdateUserRoleForm({
	userId,
	currentRole,
	actorId,
	actorRole,
}: UpdateUserRoleFormProps) {
	const router = useRouter();
	const [role, setRole] = useState(currentRole);
	const [pending, startTransition] = useTransition();

	const isSelf = userId === actorId;
	const canAssignOwner = actorRole === "owner";
	const hasChange = role !== currentRole;

	useEffect(() => {
		setRole(currentRole);
	}, [currentRole]);

	if (isSelf) {
		return (
			<p className="text-sm text-muted-foreground">
				You cannot change your own role here. Ask another owner if you need an
				update.
			</p>
		);
	}

	const onSave = () => {
		startTransition(async () => {
			const result = await updateUserRoleAction(userId, role);
			if (result.ok) {
				toast.success("Role updated");
				router.refresh();
			} else {
				toast.error(result.error ?? "Failed to update role");
			}
		});
	};

	return (
		<div className="space-y-3 rounded-lg border bg-muted/20 p-4">
			<div className="flex items-center gap-2 text-sm font-medium">
				<Shield className="size-4 text-primary" />
				Update role
			</div>
			<div className="space-y-2">
				<Label htmlFor={`user-role-${userId}`}>Access level</Label>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Select
						value={role}
						onValueChange={(value) => setRole(value as User["role"])}
						disabled={pending}
					>
						<SelectTrigger
							id={`user-role-${userId}`}
							className="w-full sm:max-w-[200px]"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ROLE_OPTIONS.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
									disabled={option.value === "owner" && !canAssignOwner}
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						type="button"
						size="sm"
						disabled={pending || !hasChange}
						onClick={onSave}
					>
						{pending ? "Saving…" : "Save role"}
					</Button>
				</div>
				<p className="text-xs text-muted-foreground">
					{ROLE_OPTIONS.find((o) => o.value === role)?.description}
				</p>
				{!canAssignOwner && (
					<p className="text-xs text-muted-foreground">
						Only owners can assign the owner role or modify another owner.
					</p>
				)}
			</div>
		</div>
	);
}
