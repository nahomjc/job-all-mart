import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const selectClassName = cn(
	"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

export interface PricingPlanFieldsValues {
	name: string;
	slug: string;
	description: string;
	priceLabel: string;
	cadence: string;
	features: string;
	ctaLabel: string;
	ctaHref: string;
	highlight: boolean;
	sortOrder: number;
	active: boolean;
}

interface PricingPlanFieldsProps {
	idPrefix: string;
	values?: Partial<PricingPlanFieldsValues>;
	showStatus?: boolean;
}

export function PricingPlanFields({
	idPrefix,
	values,
	showStatus = false,
}: PricingPlanFieldsProps) {
	const name = values?.name ?? "";
	const slug = values?.slug ?? "";
	const description = values?.description ?? "";
	const priceLabel = values?.priceLabel ?? "";
	const cadence = values?.cadence ?? "/post";
	const features = values?.features ?? "";
	const ctaLabel = values?.ctaLabel ?? "Post a job";
	const ctaHref = values?.ctaHref ?? "/post/new";
	const highlight = values?.highlight ?? false;
	const sortOrder = values?.sortOrder ?? 0;
	const active = values?.active ?? true;

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<div className="space-y-1.5 sm:col-span-2">
				<Label htmlFor={`${idPrefix}-name`}>Name</Label>
				<Input
					id={`${idPrefix}-name`}
					name="name"
					defaultValue={name}
					placeholder="Basic"
					required
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${idPrefix}-slug`}>Slug</Label>
				<Input
					id={`${idPrefix}-slug`}
					name="slug"
					defaultValue={slug}
					placeholder="basic"
					className="font-mono text-sm"
					required
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${idPrefix}-sortOrder`}>Sort order</Label>
				<Input
					id={`${idPrefix}-sortOrder`}
					name="sortOrder"
					type="number"
					defaultValue={sortOrder}
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${idPrefix}-priceLabel`}>Price</Label>
				<Input
					id={`${idPrefix}-priceLabel`}
					name="priceLabel"
					defaultValue={priceLabel}
					placeholder="ETB 500"
					required
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${idPrefix}-cadence`}>Cadence</Label>
				<Input
					id={`${idPrefix}-cadence`}
					name="cadence"
					defaultValue={cadence}
					placeholder="/post"
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${idPrefix}-ctaLabel`}>Button label</Label>
				<Input
					id={`${idPrefix}-ctaLabel`}
					name="ctaLabel"
					defaultValue={ctaLabel}
					placeholder="Buy a post"
					required
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${idPrefix}-ctaHref`}>Button link</Label>
				<Input
					id={`${idPrefix}-ctaHref`}
					name="ctaHref"
					defaultValue={ctaHref}
					placeholder="/post/new"
					required
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${idPrefix}-highlight`}>Highlight</Label>
				<select
					id={`${idPrefix}-highlight`}
					name="highlight"
					defaultValue={highlight ? "true" : "false"}
					className={selectClassName}
				>
					<option value="false">Normal card</option>
					<option value="true">Featured (primary border)</option>
				</select>
			</div>
			{showStatus ? (
				<div className="space-y-1.5">
					<Label htmlFor={`${idPrefix}-active`}>Status</Label>
					<select
						id={`${idPrefix}-active`}
						name="active"
						defaultValue={active ? "true" : "false"}
						className={selectClassName}
					>
						<option value="true">Active — shown on /pricing</option>
						<option value="false">Inactive — hidden</option>
					</select>
				</div>
			) : (
				<input type="hidden" name="active" value="true" />
			)}
			<div className="space-y-1.5 sm:col-span-2">
				<Label htmlFor={`${idPrefix}-description`}>Short description</Label>
				<Textarea
					id={`${idPrefix}-description`}
					name="description"
					rows={2}
					defaultValue={description}
					placeholder="For a few posts at a time."
				/>
			</div>
			<div className="space-y-1.5 sm:col-span-2">
				<Label htmlFor={`${idPrefix}-features`}>Features</Label>
				<Textarea
					id={`${idPrefix}-features`}
					name="features"
					rows={5}
					defaultValue={features}
					placeholder={"Same-day review\nLogo and company name\nWebsite and Telegram"}
				/>
				<p className="text-xs text-muted-foreground">
					One feature per line.
				</p>
			</div>
		</div>
	);
}
