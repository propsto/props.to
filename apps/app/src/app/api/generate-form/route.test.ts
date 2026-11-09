import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const auth = vi.hoisted(() => vi.fn());
const generateForm = vi.hoisted(() => vi.fn());
const checkAiFormRateLimit = vi.hoisted(() => vi.fn());

vi.mock("@/server/auth.server", () => ({ auth }));
vi.mock("@propsto/forms", () => ({ generateForm }));
vi.mock("@propsto/data/utils/rate-limit", () => ({ checkAiFormRateLimit }));
vi.mock("@propsto/constants/server", () => ({
  constServer: { OPENAI_API_KEY: "sk-test" },
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
  it("checks the AI form limit per user and refuses when it is spent", async () => {
    auth.mockResolvedValue({ user: { id: "user_1" } });
    checkAiFormRateLimit.mockResolvedValue({ success: true });
    expect((await generate()).status).toBe(200);
    expect(checkAiFormRateLimit).toHaveBeenLastCalledWith("user_1");

    checkAiFormRateLimit.mockResolvedValue({ success: false });
    const refused = await generate();
    expect(refused.status).toBe(429);
    expect(await refused.text()).toBe(
      "Too many requests. Please try again later.",
    );
    expect(generateForm).toHaveBeenCalledTimes(1);
  });
});
