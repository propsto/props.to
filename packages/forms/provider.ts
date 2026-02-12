import type {
  GenerateFormOptions,
  GenerateFormResult,
  PartialGeneratedForm,
} from "./types";

/**
 * Abstract interface for form generation providers.
 * Implement this to add new form generation backends.
 *
 * Current implementations:
 * - JsonRenderProvider: Uses @json-render for AI-powered form creation
 *
 * Future possibilities:
 * - ManualProvider: No AI, just returns empty template
 * - TemplateProvider: Returns pre-defined templates based on keywords
 */
export interface FormBuilderProvider {
  /** Provider identifier */
  readonly name: string;

  /**
   * Generate a form from a natural language prompt.
   */
  generateForm(options: GenerateFormOptions): Promise<GenerateFormResult>;

  /**
   * Stream form generation with progressive updates.
   * Returns an async generator that yields partial forms.
   */
  streamGenerateForm?(
    options: GenerateFormOptions
  ): AsyncGenerator<PartialGeneratedForm, GenerateFormResult, unknown>;

  /**
   * Check if the provider is properly configured and ready.
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Provider configuration options.
 */
export interface ProviderConfig {
  /** API key for AI services (if needed) */
  apiKey?: string;
  /** Model to use for generation */
  model?: string;
  /** Custom endpoint URL */
  endpoint?: string;
}
