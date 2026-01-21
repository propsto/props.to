import { auth } from "@/server/auth.server";
import { getUserTemplates, getDefaultTemplates } from "@propsto/data/repos";
import { CreateLinkForm } from "./create-link-form";

export default async function NewLinkPage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  // Fetch available templates
  const [userTemplatesResult, defaultTemplatesResult] = await Promise.all([
    getUserTemplates(userId, { includePublic: false }),
    getDefaultTemplates(),
  ]);

  const userTemplates = userTemplatesResult.success
    ? userTemplatesResult.data
    : [];
  const defaultTemplates = defaultTemplatesResult.success
    ? defaultTemplatesResult.data
    : [];
  const allTemplates = [...userTemplates, ...defaultTemplates];

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-semibold">Create Feedback Link</h1>
        <p className="text-muted-foreground">
          Create a shareable link to collect feedback
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <CreateLinkForm templates={allTemplates} />
      </div>
    </div>
  );
}
