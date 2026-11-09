"use client";

import { useTransition } from "react";
import { toast } from "@propsto/ui/atoms/sonner";
import { changeMemberLevelAction } from "./actions";

interface MemberLevelSelectProps {
  orgSlug: string;
  userId: string;
  name: string;
  levelId: string | null;
  levels: { id: string; name: string; archived: boolean }[];
}

// Level select for one member row. The server checks the level belongs to the org.
// Archived levels are offered only to the member already on one.
export function MemberLevelSelect({
  orgSlug,
  userId,
  name,
  levelId,
  levels,
}: MemberLevelSelectProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      aria-label={`Level for ${name}`}
      className="h-8 rounded-md border bg-transparent py-0 pr-8 pl-2 text-sm"
      value={levelId ?? ""}
      disabled={isPending}
      onChange={e => {
        const next = e.target.value || null;
        startTransition(async () => {
          const result = await changeMemberLevelAction(orgSlug, userId, next);
          if (result.success) toast.success("Level updated");
          else toast.error(result.error ?? "Something went wrong");
        });
      }}
    >
      <option value="">No level</option>
      {levels
        .filter(level => !level.archived || level.id === levelId)
        .map(level => (
          <option key={level.id} value={level.id}>
            {level.archived ? `${level.name} (archived)` : level.name}
          </option>
        ))}
    </select>
  );
}
