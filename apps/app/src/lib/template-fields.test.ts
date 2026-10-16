import { describe, expect, it } from "vitest";
import {
  labelAnswers,
  validateFieldAnswers,
  type FieldSpec,
} from "./template-fields";

const fields: FieldSpec[] = [
  {
    id: "f1",
    label: "What went well?",
    type: "TEXTAREA",
    required: true,
    options: null,
  },
  { id: "f2", label: "Rating", type: "RATING", required: false, options: null },
  {
    id: "f3",
    label: "Value",
    type: "SELECT",
    required: false,
    options: ["A", "B"],
  },
  {
    id: "f4",
    label: "Agree",
    type: "CHECKBOX",
    required: false,
    options: null,
  },
];

describe("validateFieldAnswers", () => {
  it("keeps known answers and drops unknown keys", () => {
    const r = validateFieldAnswers(fields, {
      f1: "Great",
      f2: 4,
      f3: "A",
      f4: true,
      evil: "x",
    });
    expect(r.data).toEqual({ f1: "Great", f2: 4, f3: "A", f4: true });
  });

  it("rejects a missing required field", () => {
    expect(validateFieldAnswers(fields, { f2: 3 }).error).toMatch(/required/);
  });

  it("rejects out-of-range ratings and unknown options", () => {
    expect(
      validateFieldAnswers(fields, { f1: "x", f2: 6 }).error,
    ).toBeDefined();
    expect(
      validateFieldAnswers(fields, { f1: "x", f2: 2.5 }).error,
    ).toBeDefined();
    expect(
      validateFieldAnswers(fields, { f1: "x", f3: "C" }).error,
    ).toBeDefined();
  });

  it("rejects wrong types and non-object input", () => {
    expect(validateFieldAnswers(fields, { f1: 42 }).error).toBeDefined();
    expect(validateFieldAnswers(fields, "nope").error).toMatch(/required/);
  });
});

describe("labelAnswers", () => {
  it("labels by field id, keeps legacy label keys, and orders by template", () => {
    const rows = labelAnswers(fields, {
      "Old label": "legacy",
      f2: 5,
      f1: "text",
      f4: false,
    });
    expect(rows.map(r => [r.label, r.type])).toEqual([
      ["What went well?", "TEXTAREA"],
      ["Rating", "RATING"],
      ["Old label", null],
    ]);
  });
});
