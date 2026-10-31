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
  const [texts, setTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(values.map(v => [v.id, v.text])),
  );
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const result = await setLevelExpectationsAction(
        orgSlug,
        levelId,
        values.map(v => ({ valueId: v.id, text: texts[v.id] ?? "" })),
      );
      if (result.success) toast.success("Expectations saved");
      else toast.error(result.error ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {values.map(value => (
        <div key={value.id} className="space-y-2">
          <Label htmlFor={`expectation-${value.id}`}>{value.name}</Label>
          <Textarea
            id={`expectation-${value.id}`}
            value={texts[value.id] ?? ""}
            onChange={e =>
              setTexts(prev => ({ ...prev, [value.id]: e.target.value }))
            }
          />
        </div>
      ))}
      <Button onClick={() => void save()} disabled={busy}>
        {busy ? "Saving..." : "Save expectations"}
      </Button>
    </div>
  );
}
