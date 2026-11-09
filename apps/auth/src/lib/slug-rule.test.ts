import { describe, expect, it, vi } from "vitest";
import { slugRejection } from "./slug-rule";

// The repos barrel builds the Prisma client from the server env; the rule never queries it
vi.mock("@propsto/constants/server", () => ({
  constServer: { DATABASE_URL: "postgresql://localhost/test" },
}));

describe("slugRejection", () => {
  it("accepts a well-formed free slug regardless of case", () => {
    expect(slugRejection("acme-corp")).toBeNull();
    expect(slugRejection("Acme")).toBeNull();
  });

  it("refuses reserved slugs that would shadow dashboard routes", () => {
    expect(slugRejection("feedback")).toBe("This URL is reserved");
    expect(slugRejection("Links")).toBe("This URL is reserved");
  });

  it("refuses malformed slugs", () => {
    for (const slug of [
      "ab",
      "-acme",
      "acme-",
      "ac--me",
      "acme_corp",
      "a".repeat(31),
    ]) {
      expect(slugRejection(slug)).toMatch(/lowercase letters/);
    }
  });
});
