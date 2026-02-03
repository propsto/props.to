import { auth } from "@/server/auth.server";
import { getOrganizationBySlug } from "@propsto/data/repos";
import { notFound } from "next/navigation";
import { CreateOrgTemplateForm } from "./create-org-template-form";

interface NewTemplatePageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function NewOrgTemplatePage({
  params,
}: NewTemplatePageProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  // Get organization
  const orgResult = await getOrganizationBySlug(orgSlug);
  if (!orgResult.success || !orgResult.data) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Create Organization Template</h2>
        <p className="text-sm text-muted-foreground">
          Create a custom feedback template for your organization
        </p>
      </div>

      <CreateOrgTemplateForm orgSlug={orgSlug} />
    </div>
  );
}
