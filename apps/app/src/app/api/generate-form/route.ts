import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";
import { auth } from "@/server/auth.server";
import { constServer } from "@propsto/constants/server";
import { FieldTypeSchema } from "@propsto/forms";

const formSchema = z.object({
  name: z.string().describe("A concise, descriptive name for the form"),
  description: z
    .string()
    .optional()
    .describe("Brief description of the form's purpose"),
  fields: z
    .array(
      z.object({
        label: z.string().describe("The question or field label"),
        type: FieldTypeSchema.describe("The field type"),
        required: z.boolean().describe("Whether this field is required"),
        options: z
          .array(z.string())
          .optional()
          .describe("Options for SELECT/RADIO fields"),
        placeholder: z.string().optional().describe("Placeholder text hint"),
        helpText: z.string().optional().describe("Help text for the field"),
      })
    )
    .describe("Form fields in order"),
});

const systemPrompt = `You are a form builder assistant. Create feedback forms based on user requests.

Generate a form with:
- A clear, descriptive name
- Optional description
- Up to 10 fields

Available field types:
- TEXT: Single line text
- TEXTAREA: Multi-line text  
- NUMBER: Numeric input
- RATING: 1-5 star rating
- SCALE: 1-10 scale
- SELECT: Dropdown (requires options)
- RADIO: Radio buttons (requires options)
- CHECKBOX: Single checkbox
- DATE: Date picker

Guidelines:
- Use clear, concise labels
- Only mark truly important fields as required
- For SELECT/RADIO, provide sensible options
- Keep forms focused and user-friendly`;

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = constServer.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      "AI form generation is not configured. Please add an OpenAI API key.",
      { status: 503 }
    );
  }

  const { prompt } = (await request.json()) as { prompt: string };
  if (!prompt || typeof prompt !== "string") {
    return new Response("Invalid prompt", { status: 400 });
  }

  const openai = createOpenAI({ apiKey });

  const result = streamObject({
    model: openai("gpt-4o-mini"),
    schema: formSchema,
    system: systemPrompt,
    prompt,
  });

  return result.toTextStreamResponse();
}
