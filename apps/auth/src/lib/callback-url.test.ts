import { describe, expect, it } from "vitest";
import { isAllowedRedirect } from "./callback-url";

const base = "https://auth.props.to";

describe("isAllowedRedirect", () => {
  it("allows relative paths, this origin and PROPSTO_HOST subdomains", () => {
    expect(isAllowedRedirect("/welcome?x=1", base, "props.to")).toBe(true);
    expect(isAllowedRedirect(`${base}/invite?token=t`, base, "props.to")).toBe(
      true,
    );
    expect(
      isAllowedRedirect("https://app.props.to/links", base, "props.to"),
    ).toBe(true);
    expect(
      isAllowedRedirect("https://app.pr-1.props.build/", base, "props.build"),
    ).toBe(true);
  });

  it("refuses other hosts, lookalikes, protocol-relative and junk", () => {
    expect(isAllowedRedirect("https://evil.com/", base, "props.to")).toBe(
      false,
    );
    expect(isAllowedRedirect("https://evilprops.to/", base, "props.to")).toBe(
      false,
    );
    expect(isAllowedRedirect("//evil.com", base, "props.to")).toBe(false);
    expect(isAllowedRedirect("not a url", base, "props.to")).toBe(false);
    expect(isAllowedRedirect("https://app.props.to/", base, undefined)).toBe(
      false,
    );
  });
});
