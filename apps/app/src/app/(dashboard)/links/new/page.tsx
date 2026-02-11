import { auth } from "@/server/auth.server";
import {
  getUserTemplates,
  getDefaultTemplates,
  getOrganizationTemplates,
  getUserOrganizations,
  getOrganizationFeedbackSettingsData,
} from "@propsto/data/repos";
import { CreateLinkForm } from "./create-link-form";

export default async function NewLinkPage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  // Get all user's organizations
  const userOrgsResult = await getUserOrganizations(userId);
  const userOrgs = userOrgsResult.success ? userOrgsResult.data : [];

  // Fetch templates and settings from all orgs + personal + defaults
  const orgDataPromises = userOrgs.map(async m => {
    const [templatesResult, settingsResult] = await Promise.all([
      getOrganizationTemplates(m.organization.id, { includePublic: false }),
      getOrganizationFeedbackSettingsData(m.organization.id),
    ]);
    return {
      orgId: m.organization.id,
      orgName: m.organization.name,
      templates: templatesResult.success ? templatesResult.data : [],
      allowMemberFormCreation:
        settingsResult.success && settingsResult.data
          ? settingsResult.data.allowMemberFormCreation
          : true,
    };
  });

  const [userTemplatesResult, defaultTemplatesResult, ...orgDataResults] =
    await Promise.all([
      getUserTemplates(userId, { includePublic: false }),
      getDefaultTemplates(),
      ...orgDataPromises,
    ]);

  const userTemplates = userTemplatesResult.success
    ? userTemplatesResult.data
    : [];
  const defaultTemplates = defaultTemplatesResult.success
    ? defaultTemplatesResult.data
    : [];

  // Build org templates map (orgId -> templates + settings)
  const orgTemplatesMap: Record<
    string,
    {
      orgName: string;
      templates: typeof userTemplates;
      allowMemberFormCreation: boolean;
    }
  > = {};
  for (const result of orgDataResults) {
    orgTemplatesMap[result.orgId] = {
      orgName: result.orgName,
      templates: result.templates,
      allowMemberFormCreation: result.allowMemberFormCreation,
    };
  }

  // Combine all templates, removing duplicates
  const allOrgTemplates = orgDataResults.flatMap(r => r.templates);
  const allTemplates = [
    ...userTemplates,
    ...allOrgTemplates.filter(t => !userTemplates.some(ut => ut.id === t.id)),
    ...defaultTemplates.filter(
      t =>
        !userTemplates.some(ut => ut.id === t.id) &&
        !allOrgTemplates.some(ot => ot.id === t.id),
    ),
  ];

  // Build organizations list for the account selector
  const organizations = userOrgs.map(m => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug.slug,
  }));

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
          organizations={organizations}
          orgTemplatesMap={orgTemplatesMap}
        />
      </div>
    </div>
  );
}
