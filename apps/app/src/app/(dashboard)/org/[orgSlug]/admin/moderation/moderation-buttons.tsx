"use client";

import { useTransition } from "react";
import { Button } from "@propsto/ui/atoms/button";
import { toast } from "@propsto/ui/atoms/sonner";
import { moderateFeedbackAction } from "./actions";

export function ModerationButtons({
  orgSlug,
  feedbackId,
}: {
  orgSlug: string;
  feedbackId: string;
}): React.ReactNode {
  const [isPending, startTransition] = useTransition();

  const decide = (decision: "approve" | "reject"): void => {
    startTransition(async () => {
      const result = await moderateFeedbackAction(
        orgSlug,
        feedbackId,
        decision,
      );
      if (!result.success) toast.error(result.error);
      else
        toast.success(
          decision === "approve" ? "Feedback approved" : "Feedback rejected",
        );
    });
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={isPending} onClick={() => decide("approve")}>
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => decide("reject")}
      >
        Reject
      </Button>
    </div>
  );
}
