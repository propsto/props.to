import { getUserPreferences } from "@propsto/data/repos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@propsto/ui/atoms";
import { CheckCircle, XCircle } from "lucide-react";
import type { JSX } from "react";

interface UserPreferencesDisplayProps {
  userId: string;
}

export async function UserPreferencesDisplay({
  userId,
}: UserPreferencesDisplayProps): Promise<JSX.Element> {
  const preferencesResult = await getUserPreferences(userId);

  if (!preferencesResult.success) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
          <CardDescription>Unable to load user preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {preferencesResult.error ?? "No preferences found"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { notificationPreferences, privacySettings, accountSettings } =
    preferencesResult.data;

  return (
    <div className="space-y-6 w-full max-w-2xl">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Notification Preferences</span>
            {notificationPreferences ? (
              <Badge variant="default">Configured</Badge>
            ) : (
              <Badge variant="secondary">Not Set</Badge>
            )}
          </CardTitle>
          <CardDescription>Your notification settings</CardDescription>
        </CardHeader>
        <CardContent>
          {notificationPreferences ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {notificationPreferences.emailNotifications ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Email Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                {notificationPreferences.feedbackAlerts ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Feedback Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                {notificationPreferences.weeklyDigest ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Weekly Digest</span>
              </div>
              <div className="flex items-center gap-2">
                {notificationPreferences.marketingEmails ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Marketing Emails</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No notification preferences set
            </p>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Privacy Settings</span>
            {privacySettings ? (
              <Badge variant="default">Configured</Badge>
            ) : (
              <Badge variant="secondary">Not Set</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Your privacy and visibility settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {privacySettings ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Visibility</span>
                <Badge variant="outline">
                  {privacySettings.profileVisibility.toLowerCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Allow feedback from anyone</span>
                {privacySettings.allowFeedbackFromAnyone ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show email in profile</span>
                {privacySettings.showEmailInProfile ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No privacy settings configured
            </p>
          )}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Account Settings</span>
            {accountSettings ? (
              <Badge variant="default">Configured</Badge>
            ) : (
              <Badge variant="secondary">Not Set</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Your account type and organization settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accountSettings ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Type</span>
                <Badge variant="outline">
                  {accountSettings.accountType.toLowerCase()}
                </Badge>
              </div>
              {accountSettings.organizationName ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Organization</span>
                  <span className="text-sm">
                    {accountSettings.organizationName}
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No account settings configured
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
