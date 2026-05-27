import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

export interface CategoryFieldsValues {
  name: string;
  slug: string;
  description: string;
  telegramTopicId: string;
  sortOrder: number;
  active: boolean;
}

interface CategoryFieldsProps {
  idPrefix: string;
  values?: Partial<CategoryFieldsValues>;
  showStatus?: boolean;
}

export function CategoryFields({
  idPrefix,
  values,
  showStatus = false,
}: CategoryFieldsProps) {
  const name = values?.name ?? "";
  const slug = values?.slug ?? "";
  const description = values?.description ?? "";
  const telegramTopicId =
    values?.telegramTopicId !== undefined && values.telegramTopicId !== ""
      ? String(values.telegramTopicId)
      : "";
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
          placeholder="IT Jobs"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-slug`}>Slug</Label>
        <Input
          id={`${idPrefix}-slug`}
          name="slug"
          defaultValue={slug}
          placeholder="it-jobs"
          className="font-mono text-sm"
          required
        />
        <p className="text-xs text-muted-foreground">
          Used in URLs. Lowercase, hyphens only.
        </p>
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
        <Label htmlFor={`${idPrefix}-telegramTopicId`}>Telegram topic ID</Label>
        <Input
          id={`${idPrefix}-telegramTopicId`}
          name="telegramTopicId"
          type="number"
          min={1}
          step={1}
          defaultValue={telegramTopicId}
          placeholder="4"
        />
        <p className="text-xs text-muted-foreground">
          From <span className="font-mono">/topicid</span> inside the forum topic
          (not the <span className="font-mono">-100…</span> chat id).
        </p>
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
            <option value="true">Active — visible on site & bot</option>
            <option value="false">Inactive — hidden from pickers</option>
          </select>
        </div>
      ) : (
        <input type="hidden" name="active" value="true" />
      )}
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          name="description"
          rows={3}
          defaultValue={description}
          placeholder="Optional short description for the website"
        />
      </div>
    </div>
  );
}
