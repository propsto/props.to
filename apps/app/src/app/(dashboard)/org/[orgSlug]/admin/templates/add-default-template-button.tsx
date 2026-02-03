"use client";

import { useTransition } from "react";
import { Button } from "@propsto/ui/atoms/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "@propsto/ui/atoms/sonner";
import { addDefaultTemplateToOrgAction } from "./actions";

interface AddDefaultTemplateButtonProps {
  templateId: string;
  templateName: string;
  organizationId: string;
  orgSlug: string;
}

export function AddDefaultTemplateButton({
  templateId,
  templateName,
  organizationId,
  orgSlug,
}: AddDefaultTemplateButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await addDefaultTemplateToOrgAction(
        templateId,
        organizationId,
        orgSlug,
      );

      if (result.success) {
        toast.success(`"${templateName}" added to your templates`);
      } else {
        toast.error(result.error ?? "Failed to add template");
      }
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
