import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  updateFeedbackSettingsAction,
  updateMemberSettings,
  updateMembershipSettings,
} from "./actions";

const repos = vi.hoisted(() => ({
  getOrganizationBySlug: vi.fn(),
  upsertOrganizationDefaultSettings: vi.fn(),
  upsertOrganizationFeedbackSettings: vi.fn(),
  upsertOrganizationSettings: vi.fn(),
  verifyOrgAdminAccess: vi.fn(),
  auditHelpers: { logSettingsUpdate: vi.fn() },
}));
const auth = vi.hoisted(() => vi.fn());

vi.mock("@propsto/data/repos", () => repos);
vi.mock("@/server/auth.server", () => ({ auth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@propsto/logger", () => ({ createLogger: () => () => undefined }));

const org = {
  id: "org_1",
  defaultUserSettings: null,
  organizationSettings: null,
  feedbackSettings: null,
};

const memberInput = {
  orgSlug: "acme",
  defaultProfileVisibility: "PUBLIC" as const,
  allowExternalFeedback: true,
  requireApprovalForPublicProfiles: false,
};

const feedbackInput = {
  allowAnonymousFeedback: true,
  enableFeedbackModeration: false,
  autoApproveInternalFeedback: true,
  allowMemberFormCreation: false,
};

const saveFailed = {
  success: false,
  data: undefined,
  error: "Record not found",
};

beforeEach(() => {
  vi.clearAllMocks();
  auth.mockResolvedValue({ user: { id: "user_1" } });
  repos.verifyOrgAdminAccess.mockResolvedValue({
    success: true,
    data: { role: "ADMIN" },
  });
  repos.getOrganizationBySlug.mockResolvedValue({ success: true, data: org });
});

describe("settings actions", () => {
  it("member settings: a failed upsert returns the error and writes no audit row", async () => {
    repos.upsertOrganizationDefaultSettings.mockResolvedValue(saveFailed);

    const result = await updateMemberSettings(memberInput);

    expect(result).toEqual({ success: false, error: "Record not found" });
    expect(repos.auditHelpers.logSettingsUpdate).not.toHaveBeenCalled();
  });

  it("feedback settings: a failed upsert returns the error and writes no audit row", async () => {
    repos.upsertOrganizationFeedbackSettings.mockResolvedValue(saveFailed);

    const result = await updateFeedbackSettingsAction("acme", feedbackInput);

    expect(result).toEqual({ success: false, error: "Record not found" });
    expect(repos.auditHelpers.logSettingsUpdate).not.toHaveBeenCalled();
  });

  it("a successful save writes the audit row", async () => {
    repos.upsertOrganizationFeedbackSettings.mockResolvedValue({
      success: true,
      data: {},
    });

    const result = await updateFeedbackSettingsAction("acme", feedbackInput);

    expect(result).toEqual({ success: true });
    expect(repos.auditHelpers.logSettingsUpdate).toHaveBeenCalledOnce();
  });

  it("invalid input is refused before any session or DB call", async () => {
    const results = await Promise.all([
      updateMemberSettings({
        ...memberInput,
        defaultProfileVisibility: "EVERYONE",
      } as never),
      updateMembershipSettings({
        orgSlug: "acme",
        autoJoinByDomain: "yes",
      } as never),
      updateFeedbackSettingsAction("acme", {
        ...feedbackInput,
        allowAnonymousFeedback: "true",
      } as never),
    ]);

    for (const result of results) {
      expect(result).toEqual({ success: false, error: "Invalid settings" });
    }
    expect(auth).not.toHaveBeenCalled();
    expect(repos.verifyOrgAdminAccess).not.toHaveBeenCalled();
    expect(repos.getOrganizationBySlug).not.toHaveBeenCalled();
  });
});
