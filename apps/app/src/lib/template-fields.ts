import type { TemplateField } from "@prisma/client";

// Pure rules for template-driven answers. Answers are keyed by field id so a
// label edit does not orphan stored feedback.

export type FieldSpec = Pick<
  TemplateField,
  "id" | "label" | "type" | "required" | "options"
>;

export type FieldAnswer = string | number | boolean;
export type FieldAnswers = Record<string, FieldAnswer>;

export const MAX_ANSWER_LENGTH = 10000;

export const SCALE_MAX: Partial<Record<TemplateField["type"], number>> = {
  RATING: 5,
  SCALE: 10,
};

export function fieldOptions(field: Pick<FieldSpec, "options">): string[] {
  return Array.isArray(field.options)
    ? field.options.filter((o): o is string => typeof o === "string")
    : [];
}

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || v === "" || v === false;
}

// Returns the answers to store, or the first validation error. Unknown keys are dropped.
export function validateFieldAnswers(
  fields: FieldSpec[],
  input: unknown,
):
  | { data: FieldAnswers; error?: undefined }
  | { data?: undefined; error: string } {
  const raw =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const data: FieldAnswers = {};

  for (const field of fields) {
    const v = raw[field.id];
    if (isBlank(v)) {
      if (field.required) return { error: `"${field.label}" is required` };
      continue;
    }
    const bad = { error: `"${field.label}" has an invalid answer` };
    switch (field.type) {
      case "TEXT":
      case "TEXTAREA": {
        if (typeof v !== "string") return bad;
        data[field.id] = v.slice(0, MAX_ANSWER_LENGTH);
        break;
      }
      case "NUMBER": {
        if (typeof v !== "number" || !Number.isFinite(v)) return bad;
        data[field.id] = v;
        break;
      }
      case "RATING":
      case "SCALE": {
        const max = SCALE_MAX[field.type]!;
        if (!Number.isInteger(v) || (v as number) < 1 || (v as number) > max)
          return bad;
        data[field.id] = v as number;
        break;
      }
      case "SELECT":
      case "RADIO": {
        if (typeof v !== "string" || !fieldOptions(field).includes(v))
          return bad;
        data[field.id] = v;
        break;
      }
      case "CHECKBOX": {
        if (v !== true) return bad;
        data[field.id] = true;
        break;
      }
      case "DATE": {
        if (typeof v !== "string" || Number.isNaN(Date.parse(v))) return bad;
        data[field.id] = v.slice(0, 10);
        break;
      }
    }
  }
  return { data };
}

// Display rows for stored answers: label from the template field when the key
// is a field id, otherwise the key itself (feedback stored before templates
// drove the form was keyed by label).
export function labelAnswers(
  fields: Pick<FieldSpec, "id" | "label" | "type">[],
  data: Record<string, unknown>,
): {
  key: string;
  label: string;
  type: TemplateField["type"] | null;
  value: unknown;
}[] {
  const byId = new Map(fields.map(f => [f.id, f]));
  const rows = Object.entries(data)
    .filter(([, v]) => !isBlank(v))
    .map(([key, value]) => {
      const f = byId.get(key);
      return { key, label: f?.label ?? key, type: f?.type ?? null, value };
    });
  const order = new Map(fields.map((f, i) => [f.id, i]));
  return rows.sort(
    (a, b) => (order.get(a.key) ?? Infinity) - (order.get(b.key) ?? Infinity),
  );
}
