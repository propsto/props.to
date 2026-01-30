/**
 * @propsto/forms
 *
 * AI-powered form generation with swappable providers.
 *
 * Usage:
 *   import { createFormBuilder } from "@propsto/forms";
 *
 *   const builder = createFormBuilder({
 *     provider: "json-render",
 *     apiKey: process.env.OPENAI_API_KEY,
 *   });
 *
 *   const result = await builder.generateForm({
 *     prompt: "Create a feedback form with 5-star rating and comments",
 *   });
 */

export * from "./types";
export * from "./provider";
export * from "./providers";

import type { FormBuilderProvider, ProviderConfig } from "./provider";
import { createJsonRenderProvider } from "./providers/json-render";

export type FormBuilderConfig = ProviderConfig & {
  /** Provider to use: "json-render" (default) */
  provider?: "json-render";
};

/**
 * Create a form builder with the specified provider.
 *
 * This factory function makes it easy to swap providers later
 * without changing consuming code.
 */
export function createFormBuilder(
  config: FormBuilderConfig
): FormBuilderProvider {
  const { provider = "json-render", ...providerConfig } = config;

  switch (provider) {
    case "json-render":
      return createJsonRenderProvider(providerConfig);
    default:
      throw new Error(`Unknown form builder provider: ${provider}`);
  }
}
