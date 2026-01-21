import Link from "next/link";
import { auth } from "@/server/auth.server";
import { getUserTemplates, getDefaultTemplates } from "@propsto/data/repos";
import { NoTemplatesState } from "@/app/_components/empty-state";
import { TemplateList } from "@/app/_components/template-list";
import { Button } from "@propsto/ui/atoms/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@propsto/ui/atoms/tabs";
import { Plus } from "lucide-react";

export default async function TemplatesPage(): Promise<React.ReactNode> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  // Fetch user templates and default templates in parallel
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
  const hasTemplates = userTemplates.length > 0 || defaultTemplates.length > 0;

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Feedback Templates</h1>
          <p className="text-muted-foreground">
            Templates define the questions asked when collecting feedback
          </p>
        </div>
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="mr-2 size-4" />
            Create Template
          </Link>
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        {!hasTemplates ? (
          <NoTemplatesState />
        ) : (
          <Tabs defaultValue="my-templates" className="w-full">
            <TabsList>
              <TabsTrigger value="my-templates">
                My Templates ({userTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="default">
                Default Templates ({defaultTemplates.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-templates" className="mt-6">
              {userTemplates.length === 0 ? (
                <NoTemplatesState />
              ) : (
                <TemplateList templates={userTemplates} showActions />
              )}
            </TabsContent>
            <TabsContent value="default" className="mt-6">
              {defaultTemplates.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No default templates available
                </div>
              ) : (
                <TemplateList templates={defaultTemplates} showDuplicate />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
