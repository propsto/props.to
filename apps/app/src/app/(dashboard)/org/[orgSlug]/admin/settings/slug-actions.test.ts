import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkSlugAvailability } from "./slug-actions";

const repos = vi.hoisted(() => ({
  isSlugAvailable: vi.fn(),
  isSlugAvailableExcludingOrg: vi.fn(),
  updateOrganizationSlug: vi.fn(),
  verifyOrgAdminAccess: vi.fn(),
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
