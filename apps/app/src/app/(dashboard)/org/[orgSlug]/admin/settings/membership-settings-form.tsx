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
import { updateMembershipSettings } from "./actions";

interface MembershipSettingsFormProps {
  orgSlug: string;
  hostedDomain: string;
  defaultSettings: {
    autoJoinByDomain: boolean;
  };
}

export function MembershipSettingsForm({
  orgSlug,
  hostedDomain,
  defaultSettings,
}: MembershipSettingsFormProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [autoJoin, setAutoJoin] = useState(defaultSettings.autoJoinByDomain);

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateMembershipSettings({
        orgSlug,
        autoJoinByDomain: autoJoin,
      });
      if (!result.success) {
        setError(result.error ?? "Failed to save settings");
      } else {
        router.refresh();
      }
    });
  };

  const hasChanges = autoJoin !== defaultSettings.autoJoinByDomain;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership</CardTitle>
        <CardDescription>
          How people from {hostedDomain} join this organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autojoin">Auto-join by email domain</Label>
            <p className="text-xs text-muted-foreground">
              Anyone who signs in with a @{hostedDomain} Google account joins
              automatically. When off, people join by invitation only.
            </p>
          </div>
          <Switch
            id="autojoin"
            checked={autoJoin}
            onCheckedChange={setAutoJoin}
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
