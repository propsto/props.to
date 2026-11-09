import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const auth = vi.hoisted(() => vi.fn());
const generateForm = vi.hoisted(() => vi.fn());

vi.mock("@/server/auth.server", () => ({ auth }));
vi.mock("@/lib/ratelimit", () => import("../../../lib/ratelimit"));
vi.mock("@propsto/forms", () => ({ generateForm }));
vi.mock("@propsto/constants/server", () => ({
  constServer: {
    OPENAI_API_KEY: "sk-test",
    UPSTASH_REDIS_REST_URL: "x",
    UPSTASH_REDIS_REST_TOKEN: "y",
  },
}));
vi.mock("@propsto/logger", () => ({ createLogger: () => () => undefined }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
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

function generate(): Promise<Response> {
  return POST(
    new Request("http://localhost/api/generate-form", {
      method: "POST",
      body: JSON.stringify({ prompt: "A peer review form" }),
    }),
  );
}

beforeEach(() => {
  generateForm.mockReturnValue({
    toTextStreamResponse: () => new Response("{}"),
  });
});

describe("POST /api/generate-form", () => {
  it("allows 20 generations an hour per user, then refuses", async () => {
    auth.mockResolvedValue({ user: { id: "user_1" } });
    for (let i = 0; i < 20; i++) expect((await generate()).status).toBe(200);

    const refused = await generate();
    expect(refused.status).toBe(429);
    expect(await refused.text()).toBe(
      "Too many requests. Please try again later.",
    );
    expect(generateForm).toHaveBeenCalledTimes(20);

    // Another user has their own allowance
    auth.mockResolvedValue({ user: { id: "user_2" } });
    expect((await generate()).status).toBe(200);
  });
});
