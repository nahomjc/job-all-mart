import { FolderKanban } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { CategoryCreateDialog } from "@/components/admin/category-create-dialog";
import { CategoryEditDialog } from "@/components/admin/category-edit-dialog";
import { categoryRepo } from "@/server/repositories/category";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const rows = await categoryRepo.listAll();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Taxonomy"
        title="Categories"
        description="Map your Telegram topic IDs to slugs and control which categories show on the site."
        actions={<CategoryCreateDialog />}
      />

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FolderKanban className="size-6" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium">No categories yet</p>
                <p className="text-sm text-muted-foreground">
                  Use Add Category to create one and start receiving submissions.
                </p>
              </div>
              <CategoryCreateDialog />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Topic ID</TableHead>
                  <TableHead>Sort</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {c.slug}
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums">
                      {c.telegramTopicId ?? "—"}
                    </TableCell>
                    <TableCell>{c.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={c.active ? "success" : "outline"}>
                        {c.active ? "active" : "off"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <CategoryEditDialog category={c} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
