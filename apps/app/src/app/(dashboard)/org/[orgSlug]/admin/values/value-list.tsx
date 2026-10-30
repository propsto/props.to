"use client";

import { useState } from "react";
import { Button } from "@propsto/ui/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@propsto/ui/atoms/dialog";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { deleteValueAction, reorderValuesAction } from "./actions";
import { ValueDialog, type OrgValue } from "./value-dialog";

interface ValueListProps {
  values: (OrgValue & { feedbackCount: number })[];
  orgSlug: string;
}

export function ValueList({
  values,
  orgSlug,
}: ValueListProps): React.ReactNode {
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<OrgValue | null>(null);
  const [error, setError] = useState<string | null>(null);

  const move = async (index: number, offset: -1 | 1) => {
    const ids = values.map(v => v.id);
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    setBusy(true);
    setError(null);
    try {
      const result = await reorderValuesAction(orgSlug, ids);
      if (!result.success) {
        setError(result.error ?? "Failed to reorder values");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    setBusy(true);
    setError(null);
    try {
      const result = await deleteValueAction(orgSlug, confirmDelete.id);
      if (result.success) {
        setConfirmDelete(null);
      } else {
        setError(result.error ?? "Failed to delete value");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {error && !confirmDelete && (
        <p className="pb-4 text-sm text-destructive">{error}</p>
      )}
      <ol className="divide-y">
        {values.map((value, index) => (
          <li
            key={value.id}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div>
              <span className="font-medium">{value.name}</span>
              {value.description && (
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void move(index, -1)}
                disabled={busy || index === 0}
                aria-label={`Move ${value.name} up`}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void move(index, 1)}
                disabled={busy || index === values.length - 1}
                aria-label={`Move ${value.name} down`}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <ValueDialog orgSlug={orgSlug} value={value} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setError(null);
                  setConfirmDelete(value);
                }}
                disabled={busy}
                aria-label={`Delete ${value.name}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ol>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={open => !open && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Value</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{confirmDelete?.name}
              &quot;? Values already used by feedback cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={busy}
            >
              {busy ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
