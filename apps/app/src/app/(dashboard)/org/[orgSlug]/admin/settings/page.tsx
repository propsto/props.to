import { auth } from "@/server/auth.server";
import { db } from "@propsto/data";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Label } from "@propsto/ui/atoms/label";
import { Input } from "@propsto/ui/atoms/input";
import { Badge } from "@propsto/ui/atoms/badge";

interface SettingsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgAdminSettings({
  params,
}: SettingsPageProps): Promise<React.ReactNode> {
  const { orgSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  // Get organization with settings
  const org = await db.organization.findFirst({
    where: {
      slug: {
        slug: orgSlug,
      },
    },
    include: {
      slug: true,
      organizationSettings: true,
      defaultUserSettings: true,
      feedbackSettings: true,
    },
  });

  if (!org) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure organization settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>
              Basic organization information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input value={org.name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Organization URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">props.to/</span>
                <Input value={org.slug.slug} disabled className="max-w-[200px]" />
              </div>
            </div>
            {org.hostedDomain && (
              <div className="space-y-2">
                <Label>Google Workspace Domain</Label>
                <div className="flex items-center gap-2">
                  <Input value={org.hostedDomain} disabled />
                  <Badge variant="secondary">Verified</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Member Defaults</CardTitle>
            <CardDescription>
              Default settings for new organization members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Profile Visibility</Label>
              <div className="text-sm text-muted-foreground">
                {org.defaultUserSettings?.defaultProfileVisibility ?? "ORGANIZATION"}
              </div>
              <p className="text-xs text-muted-foreground">
                Controls who can view member profiles by default
              </p>
            </div>
            <div className="space-y-2">
              <Label>Allow External Feedback</Label>
              <div className="text-sm text-muted-foreground">
                {org.defaultUserSettings?.allowExternalFeedback ? "Yes" : "No"}
              </div>
              <p className="text-xs text-muted-foreground">
                Whether members can receive feedback from outside the organization
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Settings</CardTitle>
            <CardDescription>
              Configure how feedback works in your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Anonymous Feedback</Label>
              <div className="text-sm text-muted-foreground">
                {org.feedbackSettings?.allowAnonymousFeedback ? "Allowed" : "Not allowed"}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Feedback Moderation</Label>
              <div className="text-sm text-muted-foreground">
                {org.feedbackSettings?.enableFeedbackModeration ? "Enabled" : "Disabled"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground italic">
        Settings editing coming soon. Contact support to change organization settings.
      </p>
    </div>
  );
}
