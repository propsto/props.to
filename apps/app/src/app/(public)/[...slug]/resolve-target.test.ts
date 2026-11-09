import { beforeEach, describe, expect, it, vi } from "vitest";
import { decodeSegments, resolveTarget } from "./resolve-target";

const repos = vi.hoisted(() => ({
  resolveSlug: vi.fn(),
  resolveOrgSlug: vi.fn(),
  resolveByEmail: vi.fn(),
}));
const rateLimit = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  EMAIL_LOOKUP_RATE_LIMIT: { limit: 10, windowMs: 60_000 },
}));

vi.mock("@propsto/data/repos", () => repos);
vi.mock("@propsto/data/utils/rate-limit", () => rateLimit);
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}));

const user = { type: "user", userId: "u1", slug: "johndoe" };
const org = { type: "organization", organizationId: "o1", slug: "acme" };

beforeEach(() => {
  vi.clearAllMocks();
  rateLimit.checkRateLimit.mockReturnValue({ allowed: true });
  repos.resolveSlug.mockResolvedValue({ success: true, data: null });
  repos.resolveOrgSlug.mockResolvedValue({ success: true, data: null });
  repos.resolveByEmail.mockResolvedValue({ success: true, data: null });
});

describe("resolveTarget", () => {
  it("returns null for no segments and for more than three", async () => {
    expect(await resolveTarget(undefined)).toBeNull();
    expect(await resolveTarget([])).toBeNull();
    expect(await resolveTarget(["a", "b", "c", "d"])).toBeNull();
    expect(repos.resolveSlug).not.toHaveBeenCalled();
  });

  it("treats a trailing thanks segment as the thanks page without a lookup", async () => {
    expect(
      await resolveTarget(["acme", "john.doe", "props", "thanks"]),
    ).toEqual({ kind: "thanks" });
    expect(await resolveTarget(["johndoe", "thanks"])).toEqual({
      kind: "thanks",
    });
    expect(repos.resolveSlug).not.toHaveBeenCalled();
    expect(repos.resolveOrgSlug).not.toHaveBeenCalled();
  });

  it("resolves one segment to a user profile or an org", async () => {
    repos.resolveSlug.mockResolvedValueOnce({
      success: true,
      data: { ...user, resolvedVia: "slug" },
    });
    expect(await resolveTarget(["johndoe"])).toEqual({
      kind: "profile",
      userId: "u1",
      slug: "johndoe",
      email: undefined,
    });

    repos.resolveSlug.mockResolvedValueOnce({ success: true, data: org });
    expect(await resolveTarget(["acme"])).toEqual({
      kind: "org",
      organizationId: "o1",
    });

    expect(await resolveTarget(["nobody"])).toBeNull();
  });

  it("resolves the dotted email form by email, rate limited, and keeps the email for the redirect", async () => {
    repos.resolveByEmail.mockResolvedValue({
      success: true,
      data: { ...user, resolvedVia: "email" },
    });

    expect(await resolveTarget(["john.doe@acme.com"])).toEqual({
      kind: "profile",
      userId: "u1",
      slug: "johndoe",
      email: "john.doe@acme.com",
    });
    expect(repos.resolveByEmail).toHaveBeenCalledWith("john.doe@acme.com");
    expect(repos.resolveSlug).not.toHaveBeenCalled();
    expect(rateLimit.checkRateLimit).toHaveBeenCalledWith(
      "email-lookup:203.0.113.7",
      rateLimit.EMAIL_LOOKUP_RATE_LIMIT,
    );
  });

  it("does not look an email up once the rate limit is spent", async () => {
    rateLimit.checkRateLimit.mockReturnValue({ allowed: false });

    expect(await resolveTarget(["jane.roe@acme.com"])).toBeNull();
    expect(repos.resolveByEmail).not.toHaveBeenCalled();
  });

  it("does not take a dotted username for an email", async () => {
    repos.resolveSlug.mockResolvedValueOnce({ success: true, data: org });

    expect(await resolveTarget(["acme.io"])).toEqual({
      kind: "org",
      organizationId: "o1",
    });
    expect(repos.resolveSlug).toHaveBeenCalledWith("acme.io");
    expect(rateLimit.checkRateLimit).not.toHaveBeenCalled();
  });

  it("resolves /<username>/<linkSlug> to a personal link", async () => {
    repos.resolveSlug.mockResolvedValueOnce({ success: true, data: user });

    expect(await resolveTarget(["johndoe", "1on1"])).toEqual({
      kind: "link",
      recipient: { type: "user", userId: "u1", organizationId: null },
      recipientSlug: "johndoe",
      linkSlug: "1on1",
      basePath: "/johndoe/1on1",
    });
    expect(repos.resolveOrgSlug).not.toHaveBeenCalled();
  });

  it("resolves /<orgSlug>/<slug> to an org member or a group", async () => {
    repos.resolveSlug.mockResolvedValue({ success: true, data: org });
    repos.resolveOrgSlug.mockResolvedValueOnce({
      success: true,
      data: { type: "user", userId: "u1", organizationId: "o1" },
    });
    expect(await resolveTarget(["acme", "john.doe"])).toEqual({
      kind: "org-member",
      userId: "u1",
      organizationId: "o1",
      orgSlug: "acme",
      userSlug: "john.doe",
    });
    expect(repos.resolveOrgSlug).toHaveBeenCalledWith("acme", "john.doe");

    repos.resolveOrgSlug.mockResolvedValueOnce({
      success: true,
      data: { type: "group", groupId: "g1", organizationId: "o1" },
    });
    expect(await resolveTarget(["acme", "eng"])).toEqual({
      kind: "group",
      groupId: "g1",
      orgSlug: "acme",
      groupSlug: "eng",
    });

    // An entity needs a link segment
    repos.resolveOrgSlug.mockResolvedValueOnce({
      success: true,
      data: { type: "entity", entityId: "e1", organizationId: "o1" },
    });
    expect(await resolveTarget(["acme", "app"])).toBeNull();
  });

  it("does not resolve two segments under an unknown first slug", async () => {
    expect(await resolveTarget(["nobody", "eng"])).toBeNull();
    expect(repos.resolveOrgSlug).not.toHaveBeenCalled();
  });

  it("resolves three segments to an org user link, a group link or an entity", async () => {
    repos.resolveOrgSlug.mockResolvedValueOnce({
      success: true,
      data: { type: "user", userId: "u1", organizationId: "o1" },
    });
    expect(await resolveTarget(["acme", "john.doe", "props"])).toEqual({
      kind: "link",
      recipient: { type: "user", userId: "u1", organizationId: "o1" },
      recipientSlug: "john.doe",
      linkSlug: "props",
      basePath: "/acme/john.doe/props",
    });

    repos.resolveOrgSlug.mockResolvedValueOnce({
      success: true,
      data: { type: "group", groupId: "g1", organizationId: "o1" },
    });
    expect(await resolveTarget(["acme", "eng", "retro"])).toEqual({
      kind: "link",
      recipient: { type: "group", groupId: "g1", organizationId: "o1" },
      recipientSlug: "eng",
      linkSlug: "retro",
      basePath: "/acme/eng/retro",
    });

    repos.resolveOrgSlug.mockResolvedValueOnce({
      success: true,
      data: { type: "entity", entityId: "e1", organizationId: "o1" },
    });
    expect(await resolveTarget(["acme", "app", "review"])).toEqual({
      kind: "entity",
      entityId: "e1",
      linkSlug: "review",
      basePath: "/acme/app/review",
    });

    expect(await resolveTarget(["acme", "nobody", "x"])).toBeNull();
    expect(repos.resolveSlug).not.toHaveBeenCalled();
  });
});

describe("decodeSegments", () => {
  it("decodes percent-encoded segments and keeps malformed ones", () => {
    expect(decodeSegments(["john.doe%40acme.com", "%E0%A4%A"])).toEqual([
      "john.doe@acme.com",
      "%E0%A4%A",
    ]);
    expect(decodeSegments(undefined)).toBeUndefined();
  });
});
