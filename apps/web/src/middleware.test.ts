import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

// NextResponse.rewrite sets this header to the destination; next() sets
// x-middleware-next. Asserting on them lets us test routing without a server.
function run(path: string, host = "props.to"): ReturnType<typeof middleware> {
  const req = new NextRequest(new URL(`https://${host}${path}`), {
    headers: { host },
  });
  return middleware(req);
}

describe("web middleware zone routing", () => {
  beforeEach(() => {
    // resolveAppUrl prefers PROPSTO_APP_URL; clear it so host-derivation is tested.
    delete process.env.PROPSTO_APP_URL;
  });

  it("rewrites public profile/feedback pages to the app", () => {
    const res = run("/leo/props-for-leo");
    expect(res.headers.get("x-middleware-rewrite")).toBe(
      "https://app.props.to/leo/props-for-leo",
    );
  });

  it("preserves the query string when rewriting to the app", () => {
    const res = run("/leo/props-for-leo?context=q3-review");
    expect(res.headers.get("x-middleware-rewrite")).toBe(
      "https://app.props.to/leo/props-for-leo?context=q3-review",
    );
  });

  it("leaves reserved web routes on the web zone", () => {
    const res = run("/pricing");
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("derives the app origin from the host for preview environments", () => {
    const res = run("/leo/props-for-leo", "pr-69.props.build");
    expect(res.headers.get("x-middleware-rewrite")).toBe(
      "https://app.pr-69.props.build/leo/props-for-leo",
    );
  });
});
