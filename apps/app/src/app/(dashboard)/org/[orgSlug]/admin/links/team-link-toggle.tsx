"use client";

import { useParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@propsto/ui/atoms/button";
import { toast } from "@propsto/ui/atoms/sonner";
import { setTeamLinkActiveAction } from "./actions";

export function TeamLinkToggle({
  linkId,
  isActive,
}: {
  linkId: string;
  isActive: boolean;
}): React.ReactNode {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [isPending, startTransition] = useTransition();
  const next = !isActive;
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await setTeamLinkActiveAction(orgSlug, linkId, next);
          if (result.success) {
            toast.success(next ? "Team link resumed" : "Team link paused");
          } else {
            toast.error(result.error ?? "Failed to update team link");
          }
        });
      }}
    >
      {isActive ? "Pause" : "Resume"}
    </Button>
  );
}
