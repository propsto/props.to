import { getOrganizationSettings } from "@propsto/data/repos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@propsto/ui/atoms";
import {
  CheckCircle,
  XCircle,
  Building2,
  Users,
  Settings,
  Shield,
} from "lucide-react";
import type { JSX } from "react";

interface OrganizationSettingsDisplayProps {
  organizationId: string;
}

export async function OrganizationSettingsDisplay({
  organizationId,
}: OrganizationSettingsDisplayProps): Promise<JSX.Element> {
  const settingsResult = await getOrganizationSettings(organizationId);

  if (!settingsResult.success) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>
            Unable to load organization settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {settingsResult.error ?? "No settings found"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    organization,
    defaultUserSettings,
    organizationSettings,
    feedbackSettings,
  } = settingsResult.data;

  return (
    <div className="space-y-6 w-full max-w-4xl">
      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Information
          </CardTitle>
          <CardDescription>Basic organization details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Name:</span>
              <p className="text-sm text-muted-foreground">
                {organization.name}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">URL Slug:</span>
              <p className="text-sm text-muted-foreground">
                props.to/org/{organization.slug.slug}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Default User Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Default User Settings
            {defaultUserSettings ? (
              <Badge variant="default">Configured</Badge>
            ) : (
              <Badge variant="secondary">Not Set</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Default settings applied to new organization users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {defaultUserSettings ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Default Profile Visibility
                </span>
                <Badge variant="outline">
                  {defaultUserSettings.defaultProfileVisibility.toLowerCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Allow external feedback</span>
                {defaultUserSettings.allowExternalFeedback ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Require approval for public profiles
                </span>
                {defaultUserSettings.requireApprovalForPublicProfiles ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No default user settings configured
            </p>
          )}
        </CardContent>
      </Card>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Organization Settings
            {organizationSettings ? (
              <Badge variant="default">Configured</Badge>
            ) : (
              <Badge variant="secondary">Not Set</Badge>
            )}
          </CardTitle>
          <CardDescription>General organization configuration</CardDescription>
        </CardHeader>
        <CardContent>
          {organizationSettings ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Allow user invites</span>
                {organizationSettings.allowUserInvites ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable group management</span>
                {organizationSettings.enableGroupManagement ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Require email verification</span>
                {organizationSettings.requireEmailVerification ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable SSO integration</span>
                {organizationSettings.enableSSOIntegration ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No organization settings configured
            </p>
          )}
        </CardContent>
      </Card>

      {/* Feedback Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Feedback & Moderation Settings
            {feedbackSettings ? (
              <Badge variant="default">Configured</Badge>
            ) : (
              <Badge variant="secondary">Not Set</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Feedback collection and moderation configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedbackSettings ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable organization feedback</span>
                {feedbackSettings.enableOrganizationFeedback ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Allow anonymous feedback</span>
                {feedbackSettings.allowAnonymousFeedback ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable feedback moderation</span>
                {feedbackSettings.enableFeedbackModeration ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-approve internal feedback</span>
                {feedbackSettings.autoApproveInternalFeedback ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No feedback settings configured
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
