import { auth } from "@/server/auth.server";
import { requireOrgAdmin } from "@/server/require-org-admin";
import {
  getOrganizationBySlug,
  getOrganizationCategories,
} from "@propsto/data/repos";
import { notFound } from "next/navigation";
import { CreateOrgTemplateForm } from "./create-org-template-form";

interface NewTemplatePageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function NewOrgTemplatePage({
  params,
}: NewTemplatePageProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  // Page-level guard: the layout's notFound does not stop this page from rendering data.
  await requireOrgAdmin(orgSlug);
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  // Get organization
  const orgResult = await getOrganizationBySlug(orgSlug);
  if (!orgResult.success || !orgResult.data) {
    return notFound();
  }

  // Org categories first, then the global ones
  const categoriesResult = await getOrganizationCategories(orgResult.data.id);
  const categories = categoriesResult.success
    ? categoriesResult.data.map(category => ({
        id: category.id,
        name: category.name,
        isGlobal: category.organizationId === null,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Create Organization Template</h2>
        <p className="text-sm text-muted-foreground">
          Create a custom feedback template for your organization
        </p>
      </div>

      <CreateOrgTemplateForm orgSlug={orgSlug} categories={categories} />
    </div>
  );
}
