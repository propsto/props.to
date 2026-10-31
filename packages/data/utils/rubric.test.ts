import { describe, expect, it } from "vitest";
import { cleanRubric, parseRubric } from "./rubric";

describe("parseRubric", () => {
  it("reads non-arrays as an empty rubric", () => {
    expect(parseRubric(null)).toEqual([]);
    expect(parseRubric({ title: "a", body: "b" })).toEqual([]);
  });

  it("keeps well-formed sections in order and drops malformed ones", () => {
    expect(
      parseRubric([
        { title: "Scope", body: "Owns a project", extra: 1 },
        { title: "Impact" },
        "text",
        null,
        { title: "Craft", body: "" },
      ]),
    ).toEqual([
      { title: "Scope", body: "Owns a project" },
      { title: "Craft", body: "" },
    ]);
  });
});

describe("cleanRubric", () => {
  it("trims sections and drops empty ones", () => {
    expect(
      cleanRubric([
        { title: "  Scope ", body: " Owns a project  " },
        { title: " ", body: "" },
        { title: "", body: "Body only" },
      ]),
    ).toEqual([
      { title: "Scope", body: "Owns a project" },
      { title: "", body: "Body only" },
    ]);
  });
});
