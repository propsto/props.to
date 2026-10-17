import { describe, expect, it } from "vitest";
import { redactEvent, scrubUrl } from "../sentry";

describe("sentry redaction", () => {
  it("drops query strings carrying token, code or callbackUrl", () => {
    expect(scrubUrl("https://auth.x/invite?token=abc")).toBe(
      "https://auth.x/invite",
    );
    expect(scrubUrl("/api/auth/callback/google?state=s&code=c")).toBe(
      "/api/auth/callback/google",
    );
    expect(scrubUrl("/signin?callbackUrl=%2Fadmin")).toBe("/signin");
    expect(scrubUrl("/feedback?page=2")).toBe("/feedback?page=2");
  });

  it("strips cookies, auth headers, bodies and sensitive URLs", () => {
    const event = redactEvent({
      request: {
        url: "https://auth.x/new-password?token=secret",
        query_string: "token=secret",
        cookies: { "authjs.session-token": "s" },
        data: { password: "P4ssw0rd" },
        headers: {
          Cookie: "a=b",
          authorization: "Bearer t",
          "user-agent": "ua",
          Referer: "https://auth.x/new-password?token=x",
          "next-router-state-tree": "%5B%22token%22%2C%22x%22%5D",
          "next-url": "/invite?token=x",
        },
      },
      breadcrumbs: [
        { category: "navigation", data: { from: "/a?code=1", to: "/b" } },
        { category: "fetch", data: { url: "/api/x?token=1", method: "GET" } },
      ],
    });
    expect(event.request).toEqual({
      url: "https://auth.x/new-password",
      headers: { "user-agent": "ua" },
    });
    expect(event.breadcrumbs?.[0]?.data).toEqual({ from: "/a", to: "/b" });
    expect(event.breadcrumbs?.[1]?.data).toEqual({
      url: "/api/x",
      method: "GET",
    });
  });
});
