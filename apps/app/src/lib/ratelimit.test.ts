import { describe, expect, it, vi } from "vitest";
import { checkFeedbackRateLimit } from "./ratelimit";

vi.mock("@propsto/constants/server", () => ({
  constServer: { UPSTASH_REDIS_REST_URL: "x", UPSTASH_REDIS_REST_TOKEN: "y" },
}));
vi.mock("@propsto/logger", () => ({ createLogger: () => () => undefined }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "10.0.0.1" }),
}));
vi.mock("@upstash/redis", () => ({ Redis: class {} }));
// Fixed-window counter per limiter instance, enough to check the keying
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = (tokens: number): number => tokens;
    counts = new Map<string, number>();
    tokens: number;
    constructor({ limiter }: { limiter: number }) {
      this.tokens = limiter;
    }
    async limit(key: string) {
      const n = (this.counts.get(key) ?? 0) + 1;
      this.counts.set(key, n);
      return {
        success: n <= this.tokens,
        limit: this.tokens,
        remaining: 0,
        reset: 0,
      };
    }
  },
}));

describe("checkFeedbackRateLimit", () => {
  it("limits per link+IP, with a higher per-IP ceiling", async () => {
    const submit = async (link: string): Promise<boolean> =>
      (await checkFeedbackRateLimit(link)).success;

    for (let i = 0; i < 10; i++) expect(await submit("link-a")).toBe(true);
    expect(await submit("link-a")).toBe(false);
    // Same office IP, another colleague's link: still allowed
    expect(await submit("link-b")).toBe(true);

    // 12 calls so far; per-IP ceiling is 120
    for (let i = 0; i < 108; i++) await submit(`link-${i}`);
    expect(await submit("link-z")).toBe(false);
  });
});
