import { auth } from "@/server/auth.server";
import { CreateTemplateForm } from "./create-template-form";

export default async function NewTemplatePage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-semibold">Create Template</h1>
        <p className="text-muted-foreground">
          Define the questions for collecting feedback
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <CreateTemplateForm />
      </div>
    </div>
  );
}
