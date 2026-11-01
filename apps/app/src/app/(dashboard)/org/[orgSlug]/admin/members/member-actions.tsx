"use client";

import { useTransition } from "react";
import type { OrganizationRole } from "@prisma/client";
import { Button } from "@propsto/ui/atoms/button";
import { toast } from "@propsto/ui/atoms/sonner";
import { UserMinusIcon } from "lucide-react";
import { changeMemberRoleAction, removeMemberAction } from "./actions";

interface MemberActionsProps {
  orgSlug: string;
  userId: string;
  name: string;
  role: OrganizationRole;
  canGrantOwner: boolean;
}

// Role select and remove button for one member row. The server re-checks every rule.
export function MemberActions({
  orgSlug,
  userId,
  name,
  role,
  canGrantOwner,
}: MemberActionsProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const roles: OrganizationRole[] = canGrantOwner
    ? ["OWNER", "ADMIN", "MEMBER"]
    : ["ADMIN", "MEMBER"];

  const run = (
    action: () => Promise<{ success: boolean; error?: string }>,
    done: string,
  ) => {
    startTransition(async () => {
      const result = await action();
      if (result.success) toast.success(done);
      else toast.error(result.error ?? "Something went wrong");
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <select
        aria-label={`Role for ${name}`}
        className="h-8 rounded-md border bg-transparent pr-8 pl-2 text-sm"
        value={role}
        disabled={isPending}
        onChange={e => {
          const next = e.target.value as OrganizationRole;
          run(
            () => changeMemberRoleAction(orgSlug, userId, next),
            "Role updated",
          );
        }}
      >
        {roles.map(r => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        aria-label={`Remove ${name}`}
        title="Remove member"
        onClick={() => {
          if (
            !window.confirm(
              `Remove ${name}? Their org links are paused and their org URL stops working.`,
            )
          )
            return;
          run(() => removeMemberAction(orgSlug, userId), "Member removed");
        }}
      >
        <UserMinusIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
