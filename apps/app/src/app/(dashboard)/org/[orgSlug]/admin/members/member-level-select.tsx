"use client";

import { useTransition } from "react";
import { toast } from "@propsto/ui/atoms/sonner";
import { changeMemberLevelAction } from "./actions";

interface MemberLevelSelectProps {
  orgSlug: string;
  userId: string;
  name: string;
  levelId: string | null;
  levels: { id: string; name: string }[];
}

// Level select for one member row. The server checks the level belongs to the org.
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
      className="h-8 rounded-md border bg-transparent pr-8 pl-2 text-sm"
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
      {levels.map(level => (
        <option key={level.id} value={level.id}>
          {level.name}
        </option>
      ))}
    </select>
  );
}
