"use client";

import { useTransition } from "react";
import { Button } from "@propsto/ui/atoms/button";
import { Plus, Loader2 } from "lucide-react";
import { addDefaultTemplateToOrgAction } from "./actions";

interface AddDefaultTemplateButtonProps {
  templateId: string;
  organizationId: string;
  orgSlug: string;
}

export function AddDefaultTemplateButton({
  templateId,
  organizationId,
  orgSlug,
}: AddDefaultTemplateButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await addDefaultTemplateToOrgAction(templateId, organizationId, orgSlug);
    });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
      ) : (
        <Plus className="mr-1 h-3 w-3" />
      )}
      Add
    </Button>
  );
}
