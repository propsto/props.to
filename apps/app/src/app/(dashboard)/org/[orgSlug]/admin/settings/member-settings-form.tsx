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
import { updateMemberSettings } from "./actions";

interface MemberSettingsFormProps {
  orgSlug: string;
  defaultSettings: {
    allowExternalFeedback: boolean;
  };
}

export function MemberSettingsForm({
  orgSlug,
  defaultSettings,
}: MemberSettingsFormProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [allowExternal, setAllowExternal] = useState(
    defaultSettings.allowExternalFeedback,
  );

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateMemberSettings({
        orgSlug,
        allowExternalFeedback: allowExternal,
      });

      if (!result.success) {
        setError(result.error ?? "Failed to save settings");
      } else {
        router.refresh();
      }
    });
  };

  const hasChanges = allowExternal !== defaultSettings.allowExternalFeedback;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Defaults</CardTitle>
        <CardDescription>
          Default settings applied to new organization members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleSubmit} disabled={isPending || !hasChanges}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
