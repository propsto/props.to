/**
 * @propsto/forms
 *
 * AI-powered form generation.
 *
 * Usage:
 *   import { generateForm } from "@propsto/forms";
 *
 *   const result = generateForm(
 *     "Create a feedback form with 5-star rating and comments",
 *     { apiKey: process.env.OPENAI_API_KEY },
 *   );
 *   return result.toTextStreamResponse();
 */

export * from "./types";
export * from "./generate";
