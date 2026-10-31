"use client";

import { useState } from "react";
import { Button } from "@propsto/ui/atoms/button";
import { Label } from "@propsto/ui/atoms/label";
import { Textarea } from "@propsto/ui/atoms/textarea";
import { toast } from "@propsto/ui/atoms/sonner";
import { setLevelExpectationsAction } from "../actions";

interface ExpectationGridProps {
  orgSlug: string;
  levelId: string;
  // One row per org value with its current expectation text ("" for none)
  values: { id: string; name: string; text: string }[];
}

export function ExpectationGrid({
  orgSlug,
  levelId,
  values,
}: ExpectationGridProps): React.ReactNode {
  // Local edits only; untouched rows show the server's text
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  // Send only edited rows, so a save never reverts another admin's other rows
  const dirty = values.filter(
    v => edits[v.id] !== undefined && edits[v.id] !== v.text,
  );

  const save = async () => {
    setBusy(true);
    try {
      const result = await setLevelExpectationsAction(
        orgSlug,
        levelId,
        dirty.map(v => ({ valueId: v.id, text: edits[v.id] ?? "" })),
      );
      if (result.success) toast.success("Expectations saved");
      else toast.error(result.error ?? "Something went wrong");
    } catch {
      toast.error("Could not save the expectations, try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <fieldset disabled={busy} className="space-y-4">
      {values.map(value => (
        <div key={value.id} className="space-y-2">
          <Label htmlFor={`expectation-${value.id}`}>{value.name}</Label>
          <Textarea
            id={`expectation-${value.id}`}
            value={edits[value.id] ?? value.text}
            onChange={e =>
              setEdits(prev => ({ ...prev, [value.id]: e.target.value }))
            }
          />
        </div>
      ))}
      <Button onClick={() => void save()} disabled={busy || dirty.length === 0}>
        {busy ? "Saving..." : "Save expectations"}
      </Button>
    </fieldset>
  );
}
