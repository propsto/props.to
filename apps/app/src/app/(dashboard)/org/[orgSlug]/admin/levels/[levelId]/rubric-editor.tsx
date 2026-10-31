"use client";

import { useState } from "react";
import { Button } from "@propsto/ui/atoms/button";
import { Input } from "@propsto/ui/atoms/input";
import { Label } from "@propsto/ui/atoms/label";
import { Textarea } from "@propsto/ui/atoms/textarea";
import { toast } from "@propsto/ui/atoms/sonner";
import { Plus, Trash2 } from "lucide-react";
import { updateLevelAction } from "../actions";

type Section = { title: string; body: string };

interface RubricEditorProps {
  orgSlug: string;
  levelId: string;
  summary: string;
  rubric: Section[];
}

export function RubricEditor({
  orgSlug,
  levelId,
  summary: initialSummary,
  rubric,
}: RubricEditorProps): React.ReactNode {
  const [summary, setSummary] = useState(initialSummary);
  const [sections, setSections] = useState<Section[]>(rubric);
  const [busy, setBusy] = useState(false);

  const setSection = (index: number, patch: Partial<Section>) =>
    setSections(prev =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );

  // Send only what changed, so a save never reverts another admin's edit to the other field
  const summaryDirty = summary !== initialSummary;
  const rubricDirty = JSON.stringify(sections) !== JSON.stringify(rubric);

  const save = async () => {
    setBusy(true);
    try {
      const result = await updateLevelAction(orgSlug, levelId, {
        ...(summaryDirty && { summary }),
        ...(rubricDirty && { rubric: sections }),
      });
      if (result.success) toast.success("Rubric saved");
      else toast.error(result.error ?? "Something went wrong");
    } catch {
      toast.error("Could not save the rubric, try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <fieldset disabled={busy} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="level-summary">Summary</Label>
        <Textarea
          id="level-summary"
          value={summary}
          onChange={e => setSummary(e.target.value)}
        />
      </div>

      {sections.map((section, index) => (
        <fieldset key={index} className="space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`rubric-title-${index}`}>
              Section {index + 1} title
            </Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setSections(prev => prev.filter((_, i) => i !== index))
              }
              aria-label={`Remove section ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Input
            id={`rubric-title-${index}`}
            value={section.title}
            onChange={e => setSection(index, { title: e.target.value })}
          />
          <Label htmlFor={`rubric-body-${index}`}>
            Section {index + 1} body
          </Label>
          <Textarea
            id={`rubric-body-${index}`}
            value={section.body}
            onChange={e => setSection(index, { body: e.target.value })}
          />
        </fieldset>
      ))}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() =>
            setSections(prev => [...prev, { title: "", body: "" }])
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add section
        </Button>
        <Button
          onClick={() => void save()}
          disabled={busy || (!summaryDirty && !rubricDirty)}
        >
          {busy ? "Saving..." : "Save rubric"}
        </Button>
      </div>
    </fieldset>
  );
}
