import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkSlugAvailability, updateOrgSlug } from "./slug-actions";
import { NOT_ORG_ADMIN } from "@/server/with-org-admin";

const repos = vi.hoisted(() => ({
  isSlugAvailable: vi.fn(),
  isSlugAvailableExcludingOrg: vi.fn(),
  updateOrganizationSlug: vi.fn(),
  verifyOrgAdminAccess: vi.fn(),
  createAuditLog: vi.fn(),
  auditHelpers: { logOrgUrlChange: vi.fn() },
}));
const auth = vi.hoisted(() => vi.fn());
const checkSlugCheckRateLimit = vi.hoisted(() => vi.fn());

vi.mock("@propsto/data/repos", () => repos);
vi.mock("@/server/auth.server", () => ({ auth }));
vi.mock("@propsto/data/utils/rate-limit", () => ({ checkSlugCheckRateLimit }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@propsto/logger", () => ({ createLogger: () => () => undefined }));

beforeEach(() => {
  vi.clearAllMocks();
  auth.mockResolvedValue({ user: { id: "user_1" } });
  checkSlugCheckRateLimit.mockResolvedValue({ success: true });
  repos.isSlugAvailable.mockResolvedValue({ success: true, data: true });
});

describe("checkSlugAvailability", () => {
  it("refuses an unauthenticated call without touching the DB", async () => {
    auth.mockResolvedValue(null);

    const result = await checkSlugAvailability("acme-new");

    expect(result).toEqual({ available: false, error: "Not authenticated" });
    expect(checkSlugCheckRateLimit).not.toHaveBeenCalled();
    expect(repos.isSlugAvailable).not.toHaveBeenCalled();
  });

  it("returns the links twin's rate-limit shape when limited", async () => {
    checkSlugCheckRateLimit.mockResolvedValue({ success: false });

    const result = await checkSlugAvailability("acme-new");

    expect(result).toEqual({
      available: false,
      error: "Too many requests. Please try again.",
    });
    expect(repos.isSlugAvailable).not.toHaveBeenCalled();
  });

  it("checks availability for a signed-in user under the limit", async () => {
    const result = await checkSlugAvailability("acme-new");

    expect(result).toEqual({ available: true });
    expect(repos.isSlugAvailable).toHaveBeenCalledWith("acme-new", "GLOBAL");
  });
});

describe("updateOrgSlug", () => {
  const membership = (role: string) => ({
    success: true,
    data: { role, organization: { id: "org_1", name: "Acme" } },
  });

  beforeEach(() => {
    repos.isSlugAvailableExcludingOrg.mockResolvedValue({
      success: true,
      data: true,
    });
    repos.updateOrganizationSlug.mockResolvedValue({
      success: true,
      data: { organizationId: "org_1" },
    });
  });

  it("refuses a caller who is not an admin of the org", async () => {
    repos.verifyOrgAdminAccess.mockResolvedValue({ success: true, data: null });

    const result = await updateOrgSlug("acme", "acme-new");

    expect(result).toEqual({ success: false, error: NOT_ORG_ADMIN });
    expect(repos.updateOrganizationSlug).not.toHaveBeenCalled();
  });

  it("refuses an admin who is not the owner", async () => {
    repos.verifyOrgAdminAccess.mockResolvedValue(membership("ADMIN"));

    const result = await updateOrgSlug("acme", "acme-new");

    expect(result).toEqual({
      success: false,
      error: "Only organization owners can change the URL",
    });
    expect(repos.updateOrganizationSlug).not.toHaveBeenCalled();
  });

  it("an owner changes the slug and gets it back in data", async () => {
    repos.verifyOrgAdminAccess.mockResolvedValue(membership("OWNER"));

    const result = await updateOrgSlug("acme", "acme-new");

    expect(result).toEqual({ success: true, data: { newSlug: "acme-new" } });
    expect(repos.updateOrganizationSlug).toHaveBeenCalledWith(
      "acme",
      "acme-new",
    );
    expect(repos.auditHelpers.logOrgUrlChange).toHaveBeenCalledWith(
      "org_1",
      "user_1",
      "acme",
      "acme-new",
    );
  });
});
