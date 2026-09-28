"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { motion, useDragControls } from "framer-motion";
import {
	AtSign,
	Briefcase,
	Calendar,
	ExternalLink,
	GripHorizontal,
	Mail,
	Receipt,
	Shield,
	User,
	X,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { UserAvatar } from "@/components/admin/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, statusLabel } from "@/lib/format";
import {
	userAvatarUrl,
	userDisplayName,
} from "@/lib/user-display";
import { cn } from "@/lib/utils";

export type EmployerProfileDialogUser = {
	id: string;
	displayName: string | null;
	email: string | null;
	avatarUrl: string | null;
	telegramUsername: string | null;
	telegramId: number | null;
	telegramVerifiedMembership: boolean;
	authProvider: string;
	source: string;
	role: string;
	status: string;
	banReason: string | null;
	createdAt: string | Date;
};

type EmployerProfileDialogProps = {
	user: EmployerProfileDialogUser;
	jobCount: number;
	paymentCount: number;
	companyLogoUrl?: string | null;
};

function statusVariant(
	status: string,
): "success" | "destructive" | "warning" | "secondary" {
	if (status === "active") return "success";
	if (status === "banned") return "destructive";
	return "warning";
}

export function EmployerProfileDialog({
	user,
	jobCount,
	paymentCount,
	companyLogoUrl,
}: EmployerProfileDialogProps) {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const dragControls = useDragControls();

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	const name = userDisplayName(user);
	const avatar = userAvatarUrl(user, companyLogoUrl);
	const joined = new Date(user.createdAt);
	const telegram =
		user.telegramUsername != null
			? `@${user.telegramUsername}`
			: user.telegramId != null
				? String(user.telegramId)
				: null;

	return (
		<>
			<Button
				type="button"
				variant="outline"
				className="h-11 w-full"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
			>
				<User className="size-4" />
				{open ? "Hide user profile" : "View user profile"}
			</Button>

			{mounted &&
				open &&
				createPortal(
					<motion.div
						role="dialog"
						aria-modal="false"
						aria-labelledby="employer-floating-title"
						drag
						dragListener={false}
						dragControls={dragControls}
						dragMomentum={false}
						dragElastic={0.04}
						initial={{ opacity: 0, scale: 0.96, y: 12 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						className={cn(
							"fixed z-100 flex w-[min(100vw-1.5rem,26rem)] max-h-[min(85dvh,640px)] flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground",
							"shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)]",
							"left-[max(0.75rem,calc(100vw-27.5rem))] top-[max(4.5rem,12vh)]",
						)}
					>
						<div
							className="flex cursor-grab touch-none items-center gap-2 border-b bg-muted/40 px-3 py-2.5 active:cursor-grabbing"
							onPointerDown={(e) => dragControls.start(e)}
						>
							<GripHorizontal
								className="size-4 shrink-0 text-muted-foreground"
								aria-hidden
							/>
							<div className="min-w-0 flex-1 select-none">
								<p
									id="employer-floating-title"
									className="truncate text-sm font-semibold"
								>
									Employer profile
								</p>
								<p className="truncate text-[11px] text-muted-foreground">
									Drag to move · Esc to close
								</p>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="size-8 shrink-0"
								aria-label="Close employer profile"
								onPointerDown={(e) => e.stopPropagation()}
								onClick={() => setOpen(false)}
							>
								<X className="size-4" />
							</Button>
						</div>

						<div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
							<div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
								<UserAvatar name={name} imageUrl={avatar} />
								<div className="min-w-0">
									<p className="truncate font-semibold">{name}</p>
									<p className="truncate text-sm text-muted-foreground">
										{user.email ?? telegram ?? "No contact"}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-2">
								<StatChip
									icon={Briefcase}
									label="Jobs"
									value={String(jobCount)}
								/>
								<StatChip
									icon={Receipt}
									label="Payments"
									value={String(paymentCount)}
								/>
								<StatChip
									icon={Shield}
									label="Status"
									value={statusLabel(user.status)}
								/>
							</div>

							<dl className="grid gap-3 text-sm sm:grid-cols-2">
								<Detail icon={Mail} label="Email" value={user.email ?? "—"} />
								<Detail
									icon={AtSign}
									label="Telegram"
									value={telegram ?? "—"}
								/>
								<Detail label="Auth provider" value={user.authProvider} />
								<Detail label="Source" value={user.source} />
								<Detail
									label="Role"
									value={
										<Badge variant="secondary" className="capitalize">
											{user.role}
										</Badge>
									}
								/>
								<Detail
									label="Account status"
									value={
										<Badge
											variant={statusVariant(user.status)}
											className="capitalize"
										>
											{user.status}
										</Badge>
									}
								/>
								<Detail
									label="Channel member"
									value={
										user.telegramVerifiedMembership ? "Verified" : "No"
									}
								/>
								<Detail
									icon={Calendar}
									label="Joined"
									value={`${format(joined, "MMM d, yyyy")} · ${formatRelativeTime(joined)}`}
								/>
							</dl>

							{user.status === "banned" && user.banReason ? (
								<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
									<p className="font-medium text-destructive">Ban reason</p>
									<p className="mt-1 text-muted-foreground">{user.banReason}</p>
								</div>
							) : null}
						</div>

						<div className="border-t bg-muted/20 p-3">
							<Button asChild variant="outline" className="h-11 w-full">
								<Link href={`/admin/users/${user.id}`}>
									<ExternalLink className="size-4" />
									Open full profile
								</Link>
							</Button>
						</div>
					</motion.div>,
					document.body,
				)}
		</>
	);
}

function StatChip({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Briefcase;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-xl border bg-card p-2.5 text-center">
			<Icon className="mx-auto size-3.5 text-muted-foreground" />
			<p className="mt-1 truncate text-sm font-semibold">{value}</p>
			<p className="text-[10px] uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
		</div>
	);
}

function Detail({
	icon: Icon,
	label,
	value,
}: {
	icon?: typeof Mail;
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="min-w-0 rounded-lg border bg-muted/10 px-3 py-2">
			<p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
				{Icon ? <Icon className="size-3" /> : null}
				{label}
			</p>
			<div className="mt-1 min-w-0 break-words font-medium">{value}</div>
		</div>
	);
}
