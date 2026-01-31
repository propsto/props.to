import { auth } from "@/server/auth.server";
import { db } from "@propsto/data";
import { getOrganizationCategories, getGlobalCategories } from "@propsto/data/repos";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Badge } from "@propsto/ui/atoms/badge";
import { CategoryList } from "./category-list";
import { CreateCategoryDialog } from "./create-category-dialog";

interface CategoriesPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgAdminCategories({
  params,
}: CategoriesPageProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  // Get organization
  const org = await db.organization.findFirst({
    where: {
      slug: {
        slug: orgSlug,
      },
    },
  });

  if (!org) {
    return notFound();
  }

  // Get categories (org-specific and global)
  const [categoriesResult, globalCategoriesResult] = await Promise.all([
    getOrganizationCategories(org.id),
    getGlobalCategories(),
  ]);

  const customCategories = categoriesResult.success
    ? categoriesResult.data?.filter((c) => c.organizationId !== null) ?? []
    : [];

  const globalCategories = globalCategoriesResult.success
    ? globalCategoriesResult.data ?? []
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Feedback Categories</h2>
          <p className="text-sm text-muted-foreground">
            Manage custom feedback categories for your organization
          </p>
        </div>
        <CreateCategoryDialog orgSlug={orgSlug} />
      </div>

      {/* Custom Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Custom Categories
            <Badge variant="secondary">{customCategories.length}</Badge>
          </CardTitle>
          <CardDescription>
            Categories specific to your organization. You can edit or delete these.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customCategories.length > 0 ? (
            <CategoryList
              categories={customCategories}
              orgSlug={orgSlug}
              editable
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No custom categories yet. Create one to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Global Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            System Categories
            <Badge variant="outline">{globalCategories.length}</Badge>
          </CardTitle>
          <CardDescription>
            Default categories available to all organizations. These cannot be modified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {globalCategories.length > 0 ? (
            <CategoryList
              categories={globalCategories}
              orgSlug={orgSlug}
              editable={false}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No system categories available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
