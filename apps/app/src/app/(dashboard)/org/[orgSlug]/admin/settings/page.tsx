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
import { MemberSettingsForm } from "./member-settings-form";

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

  // Default settings if none exist
  const memberSettings = {
    defaultProfileVisibility: org.defaultUserSettings?.defaultProfileVisibility ?? "ORGANIZATION",
    allowExternalFeedback: org.defaultUserSettings?.allowExternalFeedback ?? false,
    requireApprovalForPublicProfiles: org.defaultUserSettings?.requireApprovalForPublicProfiles ?? true,
  } as const;

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

        {/* Member Settings - Editable */}
        <MemberSettingsForm
          orgSlug={orgSlug}
          defaultSettings={memberSettings}
        />

        {/* Feedback Settings - Read Only for now */}
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
            <p className="text-xs text-muted-foreground italic">
              Feedback settings editing coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
