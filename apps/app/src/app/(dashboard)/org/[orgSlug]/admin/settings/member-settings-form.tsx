"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Label } from "@propsto/ui/atoms/label";
import { Switch } from "@propsto/ui/atoms/switch";
import { Button } from "@propsto/ui/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@propsto/ui/atoms/select";
import { updateMemberSettings } from "./actions";

interface MemberSettingsFormProps {
  orgSlug: string;
  defaultSettings: {
    defaultProfileVisibility: "PUBLIC" | "PRIVATE" | "ORGANIZATION";
    allowExternalFeedback: boolean;
    requireApprovalForPublicProfiles: boolean;
  };
}

export function MemberSettingsForm({
  orgSlug,
  defaultSettings,
}: MemberSettingsFormProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [visibility, setVisibility] = useState(
    defaultSettings.defaultProfileVisibility
  );
  const [allowExternal, setAllowExternal] = useState(
    defaultSettings.allowExternalFeedback
  );
  const [requireApproval, setRequireApproval] = useState(
    defaultSettings.requireApprovalForPublicProfiles
  );

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateMemberSettings({
        orgSlug,
        defaultProfileVisibility: visibility,
        allowExternalFeedback: allowExternal,
        requireApprovalForPublicProfiles: requireApproval,
      });

      if (!result.success) {
        setError(result.error ?? "Failed to save settings");
      } else {
        router.refresh();
      }
    });
  };

  const hasChanges =
    visibility !== defaultSettings.defaultProfileVisibility ||
    allowExternal !== defaultSettings.allowExternalFeedback ||
    requireApproval !== defaultSettings.requireApprovalForPublicProfiles;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Defaults</CardTitle>
        <CardDescription>
          Default settings applied to new organization members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="visibility">Default Profile Visibility</Label>
          <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
            <SelectTrigger id="visibility" className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ORGANIZATION">
                Organization Only
              </SelectItem>
              <SelectItem value="PUBLIC">Public</SelectItem>
              <SelectItem value="PRIVATE">Private</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Controls who can view member profiles by default
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="external">Allow External Feedback</Label>
            <p className="text-xs text-muted-foreground">
              Members can receive feedback from outside the organization
            </p>
          </div>
          <Switch
            id="external"
            checked={allowExternal}
            onCheckedChange={setAllowExternal}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="approval">Require Approval for Public Profiles</Label>
            <p className="text-xs text-muted-foreground">
              Admins must approve before members can make profiles public
            </p>
          </div>
          <Switch
            id="approval"
            checked={requireApproval}
            onCheckedChange={setRequireApproval}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isPending || !hasChanges}
        >
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
