import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendOrgInviteEmail } from "./org-invite";
import { sendMagicLinkEmail } from "./magic-link";

const resendSend = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: resendSend };
  },
}));
vi.mock("@propsto/constants/server", () => ({
  constServer: {
    EMAIL_PROVIDER: "resend",
    RESEND_API_KEY: "test-key",
    EMAIL_FROM: "Props <noreply@example.com>",
  },
}));
vi.mock("@propsto/data/repos", () => ({ createOutboxEmail: vi.fn() }));
vi.mock("@react-email/components", () => ({
  render: vi.fn(() => Promise.resolve("rendered")),
}));
vi.mock("nodemailer", () => ({ createTransport: vi.fn() }));
vi.mock("@propsto/logger", () => ({ createLogger: () => () => undefined }));
vi.mock("../templates", () => ({
  OrgInviteEmail: () => null,
  MagicLinkEmail: () => null,
}));

const invite = {
  orgName: "Acme",
  role: "MEMBER",
  inviteLink: "https://auth.example.com/invite?token=t",
};

const rejected = (name: string) => ({
  data: null,
  error: { name, message: "The from address is not verified" },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("send through Resend", () => {
  it("reports an accepted send as success", async () => {
    resendSend.mockResolvedValue({ data: { id: "email_1" }, error: null });
    expect(await sendOrgInviteEmail("ana@example.com", invite)).toEqual(
      expect.objectContaining({ success: true }),
    );
  });

  it("reports a rejected send as a failure", async () => {
    resendSend.mockResolvedValue(rejected("validation_error"));
    expect(await sendOrgInviteEmail("ana@example.com", invite)).toEqual(
      expect.objectContaining({ success: false, error: "Unexpected error" }),
    );
  });

  it("keeps the rate limit message", async () => {
    resendSend.mockResolvedValue(rejected("rate_limit_exceeded"));
    const result = await sendOrgInviteEmail("ana@example.com", invite);
    expect(result.error).toBe("Contact your admin, emails can't be sent.");
  });

  it("fails the magic link on a rejected send", async () => {
    resendSend.mockResolvedValue(rejected("validation_error"));
    expect(
      await sendMagicLinkEmail(
        "ana@example.com",
        "https://auth.example.com/x",
        new Date(Date.now() + 3_600_000),
      ),
    ).toEqual(expect.objectContaining({ success: false }));
  });

  it("passes the sender address and recipient to the provider", async () => {
    resendSend.mockResolvedValue({ data: { id: "email_1" }, error: null });
    await sendOrgInviteEmail("ana@example.com", invite);
    expect(resendSend).toHaveBeenCalledTimes(1);
    expect(resendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Props <noreply@example.com>",
        to: ["ana@example.com"],
      }),
    );
  });
});
