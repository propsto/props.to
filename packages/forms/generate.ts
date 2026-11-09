import { createOpenAI } from "@ai-sdk/openai";
import { streamObject, type DeepPartial, type StreamObjectResult } from "ai";
import { z } from "zod";
import { FieldTypeSchema } from "./types";

/**
 * The shape the model is asked to produce. Fields carry no `order`;
 * callers number them by position.
 */
export const GeneratedFormOutputSchema = z.object({
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
      }),
    )
    .describe("Form fields in order"),
});

export type GeneratedFormOutput = z.infer<typeof GeneratedFormOutputSchema>;

export type GenerateFormStream = StreamObjectResult<
  DeepPartial<GeneratedFormOutput>,
  GeneratedFormOutput,
  never
>;

export interface GenerateFormConfig {
  /** OpenAI API key */
  apiKey: string;
  /** Model to use, gpt-4o-mini by default */
  model?: string;
  /** Maximum number of fields to generate, 10 by default */
  maxFields?: number;
  /** Optional context about the use case */
  context?: string;
}

function buildSystemPrompt(maxFields: number, context?: string): string {
  return `You are a form builder assistant. Create feedback forms based on user requests.

Generate a form with:
- A clear, descriptive name
- Optional description
- Up to ${maxFields} fields

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
- Keep forms focused and user-friendly${context ? `\n\nContext: ${context}` : ""}`;
}

/**
 * Generate a form from a natural language prompt.
 *
 * Returns the AI SDK stream: return `toTextStreamResponse()` from a route
 * for `useObject`, or await `object` for the complete form.
 */
export function generateForm(
  prompt: string,
  {
    apiKey,
    model = "gpt-4o-mini",
    maxFields = 10,
    context,
  }: GenerateFormConfig,
): GenerateFormStream {
  const openai = createOpenAI({ apiKey });
  const stream = streamObject({
    model: openai(model),
    schema: GeneratedFormOutputSchema,
    system: buildSystemPrompt(maxFields, context),
    prompt,
  });
  return stream;
}
