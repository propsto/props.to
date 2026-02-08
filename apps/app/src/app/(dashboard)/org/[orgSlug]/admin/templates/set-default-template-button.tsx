"use client";

import { useTransition } from "react";
import { Button } from "@propsto/ui/atoms/button";
import { Star, Loader2 } from "lucide-react";
import { setDefaultTemplateAction } from "./actions";

interface SetDefaultTemplateButtonProps {
  templateId: string;
  templateName: string;
  organizationId: string;
  orgSlug: string;
  isDefault: boolean;
}

export function SetDefaultTemplateButton({
  templateId,
  templateName,
  organizationId,
  orgSlug,
  isDefault,
}: SetDefaultTemplateButtonProps): React.ReactNode {
  const [isPending, startTransition] = useTransition();

  const handleClick = (): void => {
    startTransition(async () => {
      // If already default, unset it (pass null); otherwise set it
      await setDefaultTemplateAction(
        organizationId,
        isDefault ? null : templateId,
        orgSlug,
      );
    });
  };

  if (isDefault) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isPending}
        className="text-yellow-600 hover:text-yellow-700"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <Star className="mr-1 size-3 fill-current" />
            Default
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        "Set as default"
      )}
    </Button>
  );
}
