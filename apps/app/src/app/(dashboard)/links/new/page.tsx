import { auth } from "@/server/auth.server";
import {
  getUserTemplates,
  getDefaultTemplates,
  getOrganizationTemplates,
  getUserOrganizations,
} from "@propsto/data/repos";
import { CreateLinkForm } from "./create-link-form";

export default async function NewLinkPage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  // Get user's organization (if any)
  // Note: Currently only uses first org. Multi-org support would need UI to select which org's templates to show.
  const userOrgsResult = await getUserOrganizations(userId);
  const userOrgs = userOrgsResult.success ? userOrgsResult.data : [];
  const primaryOrg = userOrgs[0]?.organization;

  // Fetch available templates
  const [userTemplatesResult, defaultTemplatesResult, orgTemplatesResult] =
    await Promise.all([
      getUserTemplates(userId, { includePublic: false }),
      getDefaultTemplates(),
      primaryOrg
        ? getOrganizationTemplates(primaryOrg.id, { includePublic: false })
        : Promise.resolve({ success: true as const, data: [] }),
    ]);

  const userTemplates = userTemplatesResult.success
    ? userTemplatesResult.data
    : [];
  const defaultTemplates = defaultTemplatesResult.success
    ? defaultTemplatesResult.data
    : [];
  const orgTemplates = orgTemplatesResult.success
    ? orgTemplatesResult.data
    : [];

  // Combine templates, removing duplicates
  // Priority: user templates > org templates > default templates
  const allTemplates = [
    ...userTemplates,
    ...orgTemplates.filter(t => !userTemplates.some(ut => ut.id === t.id)),
    ...defaultTemplates.filter(
      t =>
        !userTemplates.some(ut => ut.id === t.id) &&
        !orgTemplates.some(ot => ot.id === t.id),
    ),
  ];

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-semibold">Create Feedback Link</h1>
        <p className="text-muted-foreground">
          Create a shareable link to collect feedback
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <CreateLinkForm
          templates={allTemplates}
          organizationName={primaryOrg?.name}
        />
      </div>
    </div>
  );
}
