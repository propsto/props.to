"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@propsto/ui/atoms/button";
import { Archive, ArchiveRestore, ArrowDown, ArrowUp } from "lucide-react";
import { reorderLevelsAction, setLevelArchivedAction } from "./actions";
import { LevelDialog, type OrgLevel } from "./level-dialog";

interface LevelListProps {
  levels: (OrgLevel & { memberCount: number })[];
  orgSlug: string;
  // Archived rows: no reordering or editing, Restore instead of Archive
  archived?: boolean;
}

export function LevelList({
  levels,
  orgSlug,
  archived = false,
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

  const setArchived = async (level: OrgLevel) => {
    setBusy(true);
    setError(null);
    try {
      const result = await setLevelArchivedAction(orgSlug, level.id, !archived);
      if (!result.success) {
        setError(
          result.error ?? `Failed to ${archived ? "restore" : "archive"} level`,
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {error && <p className="pb-4 text-sm text-destructive">{error}</p>}
      <ol
        className="divide-y"
        data-testid={archived ? "archived-levels" : "active-levels"}
      >
        {levels.map((level, index) => (
          <li
            key={level.id}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div>
              <Link
                href={`/org/${orgSlug}/admin/levels/${level.id}`}
                className="font-medium hover:underline"
              >
                {level.name}
              </Link>
              <span className="ml-2 text-sm text-muted-foreground">
                {level.memberCount} member{level.memberCount !== 1 ? "s" : ""}
              </span>
              {level.summary && (
                <p className="text-sm text-muted-foreground">{level.summary}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {archived ? null : (
                <>
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
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void setArchived(level)}
                disabled={busy}
                aria-label={`${archived ? "Restore" : "Archive"} ${level.name}`}
              >
                {archived ? (
                  <ArchiveRestore className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
              </Button>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
