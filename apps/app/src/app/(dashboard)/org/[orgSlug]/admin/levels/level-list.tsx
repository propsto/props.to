"use client";

import { useState } from "react";
import { Button } from "@propsto/ui/atoms/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { reorderLevelsAction } from "./actions";
import { LevelDialog, type OrgLevel } from "./level-dialog";

interface LevelListProps {
  levels: (OrgLevel & { memberCount: number })[];
  orgSlug: string;
}

export function LevelList({
  levels,
  orgSlug,
}: LevelListProps): React.ReactNode {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const move = async (index: number, offset: -1 | 1) => {
    const ids = levels.map(l => l.id);
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    setBusy(true);
    setError(null);
    try {
      const result = await reorderLevelsAction(orgSlug, ids);
      if (!result.success) {
        setError(result.error ?? "Failed to reorder levels");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {error && <p className="pb-4 text-sm text-destructive">{error}</p>}
      <ol className="divide-y">
        {levels.map((level, index) => (
          <li
            key={level.id}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div>
              <span className="font-medium">{level.name}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {level.memberCount} member{level.memberCount !== 1 ? "s" : ""}
              </span>
              {level.summary && (
                <p className="text-sm text-muted-foreground">{level.summary}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void move(index, -1)}
                disabled={busy || index === 0}
                aria-label={`Move ${level.name} up`}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void move(index, 1)}
                disabled={busy || index === levels.length - 1}
                aria-label={`Move ${level.name} down`}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <LevelDialog orgSlug={orgSlug} level={level} />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
