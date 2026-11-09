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
  // Domain auto-join only applies to Google Workspace orgs
  hostedDomain: string | null;
  defaultSettings: {
    autoJoinByDomain: boolean;
    enableConversations: boolean;
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
  const [conversations, setConversations] = useState(
    defaultSettings.enableConversations,
  );

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateMembershipSettings({
        orgSlug,
        // Only what changed, so this page does not undo another admin's save
        ...(autoJoin !== defaultSettings.autoJoinByDomain
          ? { autoJoinByDomain: autoJoin }
          : {}),
        ...(conversations !== defaultSettings.enableConversations
          ? { enableConversations: conversations }
          : {}),
      });
      if (!result.success) {
        setError(result.error ?? "Failed to save settings");
      } else {
        router.refresh();
      }
    });
  };

  const hasChanges =
    autoJoin !== defaultSettings.autoJoinByDomain ||
    conversations !== defaultSettings.enableConversations;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership</CardTitle>
        <CardDescription>
          How people join this organization and the processes it runs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hostedDomain ? (
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
        ) : null}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="conversations">Conversations</Label>
            <p className="text-xs text-muted-foreground">
              Leads and admins record feedback conversations about members. When
              off, conversation pages and links are hidden from everyone.
            </p>
          </div>
          <Switch
            id="conversations"
            checked={conversations}
            onCheckedChange={setConversations}
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
