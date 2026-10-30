"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@propsto/ui/atoms/button";
import { Input } from "@propsto/ui/atoms/input";
import { Textarea } from "@propsto/ui/atoms/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { Label } from "@propsto/ui/atoms/label";
import { Switch } from "@propsto/ui/atoms/switch";
import { Checkbox } from "@propsto/ui/atoms/checkbox";
import { RadioGroup, RadioGroupItem } from "@propsto/ui/atoms/radio-group";
import type { FeedbackLinkWithRelations } from "@propsto/data/repos/feedback-link";
import {
  fieldOptions,
  SCALE_MAX,
  validateFieldAnswers,
  type FieldAnswer,
  type FieldAnswers,
  type FieldSpec,
} from "@/lib/template-fields";
import { submitFeedbackAction } from "../actions";

// Only what the form needs: the whole link (recipient id, org memberships, counts)
// would be serialized into the public page's client payload
export type PublicFeedbackLink = Pick<
  FeedbackLinkWithRelations,
  "id" | "visibility"
> & { template: Pick<FeedbackLinkWithRelations["template"], "fields"> };

export type PublicOrgValue = {
  id: string;
  name: string;
  description: string | null;
};

interface FeedbackSubmissionFormProps {
  link: PublicFeedbackLink;
  basePath: string;
  allowAnonymous?: boolean;
  values?: PublicOrgValue[];
}

export function FeedbackSubmissionForm({
  link,
  basePath,
  allowAnonymous = true,
  values = [],
}: FeedbackSubmissionFormProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAnonymous, setIsAnonymous] = useState(
    allowAnonymous && link.visibility === "ANONYMOUS",
  );
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [answers, setAnswers] = useState<FieldAnswers>({});
  const [valueIds, setValueIds] = useState<string[]>([]);
  const fields = link.template.fields;

  const setAnswer = (id: string, value: FieldAnswer | undefined): void =>
    setAnswers(prev => {
      const next = { ...prev };
      if (value === undefined || value === "") delete next[id];
      else next[id] = value;
      return next;
    });

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setError(null);

    const checked = validateFieldAnswers(fields, answers);
    if (checked.error !== undefined) {
      setError(checked.error);
      return;
    }
    const fieldsData = checked.data;

    startTransition(async () => {
      const result = await submitFeedbackAction({
        linkId: link.id,
        submitterName: isAnonymous ? undefined : submitterName || undefined,
        submitterEmail: isAnonymous ? undefined : submitterEmail || undefined,
        isAnonymous,
        fieldsData,
        valueIds,
      });
      if (result.success) {
        router.push(`${basePath}/thanks`);
      } else {
        setError(result.error ?? "Failed to submit feedback");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
        <CardDescription>
          Your feedback helps people grow and improve
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anonymous toggle */}
          {allowAnonymous && link.visibility !== "ANONYMOUS" && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Submit anonymously</Label>
                <p className="text-sm text-muted-foreground">
                  Your identity will be hidden from the recipient
                </p>
              </div>
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>
          )}

          {/* Submitter info (if not anonymous) */}
          {!isAnonymous && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="submitterName">Your Name (optional)</Label>
                <Input
                  id="submitterName"
                  placeholder="John Doe"
                  value={submitterName}
                  onChange={e => setSubmitterName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submitterEmail">Your Email (optional)</Label>
                <Input
                  id="submitterEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={submitterEmail}
                  onChange={e => setSubmitterEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Org values picker: only when the org defines values */}
          {values.length > 0 && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium leading-none">
                Which values did they show?
              </legend>
              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                {values.map(value => (
                  <div key={value.id} className="flex items-start gap-2">
                    <Checkbox
                      id={`value-${value.id}`}
                      checked={valueIds.includes(value.id)}
                      onCheckedChange={c =>
                        setValueIds(prev =>
                          c === true
                            ? [...prev, value.id]
                            : prev.filter(id => id !== value.id),
                        )
                      }
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor={`value-${value.id}`}>{value.name}</Label>
                      {value.description && (
                        <p className="text-sm text-muted-foreground">
                          {value.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          )}

          {/* Template fields */}
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive"> *</span>
                  )}
                </Label>
                <FieldInput
                  field={field}
                  value={answers[field.id]}
                  onChange={v => setAnswer(field.id, v)}
                />
                {field.helpText && (
                  <p className="text-sm text-muted-foreground">
                    {field.helpText}
                  </p>
                )}
              </div>
            ))}
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldSpec & { placeholder: string | null };
  value: FieldAnswer | undefined;
  onChange: (value: FieldAnswer | undefined) => void;
}): React.JSX.Element {
  const inputClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  switch (field.type) {
    case "TEXTAREA":
      return (
        <Textarea
          id={field.id}
          placeholder={field.placeholder ?? undefined}
          className="min-h-[120px]"
          value={typeof value === "string" ? value : ""}
          onChange={e => onChange(e.target.value)}
        />
      );
    case "TEXT":
      return (
        <Input
          id={field.id}
          placeholder={field.placeholder ?? undefined}
          value={typeof value === "string" ? value : ""}
          onChange={e => onChange(e.target.value)}
        />
      );
    case "NUMBER":
      return (
        <Input
          id={field.id}
          type="number"
          placeholder={field.placeholder ?? undefined}
          value={typeof value === "number" ? value : ""}
          onChange={e =>
            onChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
        />
      );
    case "DATE":
      return (
        <Input
          id={field.id}
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={e => onChange(e.target.value)}
        />
      );
    case "RATING":
    case "SCALE": {
      const max = SCALE_MAX[field.type]!;
      return (
        <div
          id={field.id}
          role="radiogroup"
          aria-label={field.label}
          className="flex flex-wrap gap-2"
        >
          {Array.from({ length: max }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              onClick={() => onChange(n)}
              className={`flex size-10 items-center justify-center rounded-full border-2 transition-colors ${
                value === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      );
    }
    case "SELECT":
      return (
        <select
          id={field.id}
          className={inputClass}
          value={typeof value === "string" ? value : ""}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">{field.placeholder ?? "Select..."}</option>
          {fieldOptions(field).map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case "RADIO":
      return (
        <RadioGroup
          id={field.id}
          value={typeof value === "string" ? value : ""}
          onValueChange={onChange}
        >
          {fieldOptions(field).map(o => (
            <div key={o} className="flex items-center gap-2">
              <RadioGroupItem id={`${field.id}-${o}`} value={o} />
              <Label htmlFor={`${field.id}-${o}`}>{o}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case "CHECKBOX":
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            id={field.id}
            checked={value === true}
            onCheckedChange={c => onChange(c === true ? true : undefined)}
          />
          <Label htmlFor={field.id}>{field.placeholder ?? "Yes"}</Label>
        </div>
      );
  }
}
