import { describe, expect, it, vi } from "vitest";
import { cleanLinkInput, MAX_LINK_NAME } from "./link-input";

// The repos barrel builds the Prisma client from the server env; the cleaner never queries it
vi.mock("@propsto/constants/server", () => ({
  constServer: { DATABASE_URL: "postgresql://localhost/test" },
}));

describe("cleanLinkInput", () => {
  it("trims the name and normalizes the slug", () => {
    expect(
      cleanLinkInput({ name: "  Team pulse ", slug: " Team-Pulse " }),
    ).toEqual({ success: true, name: "Team pulse", slug: "team-pulse" });
  });

  it("leaves an empty slug undefined so one is generated", () => {
    expect(cleanLinkInput({ name: "Pulse", slug: "  " })).toEqual({
      success: true,
      name: "Pulse",
      slug: undefined,
    });
  });

  it("refuses the reserved thanks slug", () => {
    const result = cleanLinkInput({ name: "Pulse", slug: "Thanks" });
    expect(result.success).toBe(false);
  });

  it("refuses a malformed slug", () => {
    for (const slug of ["ab", "a--b", "-abc", "has space", "x".repeat(31)]) {
      expect(cleanLinkInput({ name: "Pulse", slug }).success).toBe(false);
    }
  });

  it("refuses an empty or over-long name", () => {
    expect(cleanLinkInput({ name: "   " }).success).toBe(false);
    expect(
      cleanLinkInput({ name: "x".repeat(MAX_LINK_NAME + 1) }).success,
    ).toBe(false);
    expect(cleanLinkInput({ name: "x".repeat(MAX_LINK_NAME) }).success).toBe(
      true,
    );
  });

  it("checks only the slug when no name is given", () => {
    expect(cleanLinkInput({ slug: "my-link" })).toEqual({
      success: true,
      name: undefined,
      slug: "my-link",
    });
    expect(cleanLinkInput({ slug: "thanks" }).success).toBe(false);
  });
});
