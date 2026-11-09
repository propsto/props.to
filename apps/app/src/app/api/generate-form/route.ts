import { auth } from "@/server/auth.server";
import { checkAiFormRateLimit } from "@propsto/data/utils/rate-limit";
import { constServer } from "@propsto/constants/server";
import { generateForm } from "@propsto/forms";

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = constServer.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      "AI form generation is not configured. Please add an OpenAI API key.",
      { status: 503 },
    );
  }

  const { prompt } = (await request.json()) as { prompt: string };
  if (!prompt || typeof prompt !== "string") {
    return new Response("Invalid prompt", { status: 400 });
  }

  const rateLimit = await checkAiFormRateLimit(session.user.id);
  if (!rateLimit.success) {
    return new Response("Too many requests. Please try again later.", {
      status: 429,
    });
  }

  return generateForm(prompt, { apiKey }).toTextStreamResponse();
}
