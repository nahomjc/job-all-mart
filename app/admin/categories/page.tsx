import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CategoryForm } from "@/components/admin/category-form";
import { categoryRepo } from "@/server/repositories/category";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const rows = await categoryRepo.listAll();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Categories</h1>

      <Card>
        <CardHeader>
          <CardTitle>New category</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No categories yet — create one to start receiving submissions.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Topic ID</TableHead>
                  <TableHead>Sort</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.slug}
                    </TableCell>
                    <TableCell>{c.telegramTopicId ?? "—"}</TableCell>
                    <TableCell>{c.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={c.active ? "success" : "outline"}>
                        {c.active ? "active" : "off"}
                      </Badge>
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
