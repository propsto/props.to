import { createCatalog } from "@json-render/core";
import { z } from "zod";
import type { FormBuilderProvider, ProviderConfig } from "../provider";
import type {
  GenerateFormOptions,
  GenerateFormResult,
  FormField,
  FieldType,
} from "../types";
import { GeneratedFormSchema } from "../types";

/**
 * Form field catalog for json-render.
 * Maps our FieldType enum to json-render components.
 */
const formCatalog = createCatalog({
  components: {
    TextField: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().optional(),
        helpText: z.string().optional(),
        required: z.boolean().default(false),
      }),
    },
    TextArea: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().optional(),
        helpText: z.string().optional(),
        required: z.boolean().default(false),
      }),
    },
    NumberField: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().optional(),
        helpText: z.string().optional(),
        required: z.boolean().default(false),
      }),
    },
    Rating: {
      props: z.object({
        label: z.string(),
        helpText: z.string().optional(),
        required: z.boolean().default(false),
      }),
    },
    Scale: {
      props: z.object({
        label: z.string(),
        helpText: z.string().optional(),
        required: z.boolean().default(false),
      }),
    },
    Select: {
      props: z.object({
        label: z.string(),
        options: z.array(z.string()),
        placeholder: z.string().optional(),
        helpText: z.string().optional(),
        required: z.boolean().default(false),
      }),
    },
    Radio: {
      props: z.object({
        label: z.string(),
        options: z.array(z.string()),
        helpText: z.string().optional(),
        required: z.boolean().default(false),
      }),
    },
    Checkbox: {
      props: z.object({
        label: z.string(),
        helpText: z.string().optional(),
        required: z.boolean().default(false),
      }),
    },
    DateField: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().optional(),
        helpText: z.string().optional(),
        required: z.boolean().default(false),
      }),
    },
  },
  actions: {},
});

/**
 * Maps json-render component types to propsto FieldType.
 */
const componentToFieldType: Record<string, FieldType> = {
  TextField: "TEXT",
  TextArea: "TEXTAREA",
  NumberField: "NUMBER",
  Rating: "RATING",
  Scale: "SCALE",
  Select: "SELECT",
  Radio: "RADIO",
  Checkbox: "CHECKBOX",
  DateField: "DATE",
};

/**
 * Converts json-render tree output to propsto FormField array.
 */
function treeToFormFields(tree: unknown): FormField[] {
  const fields: FormField[] = [];

  function traverse(node: unknown, order: number): number {
    if (!node || typeof node !== "object") return order;

    const n = node as Record<string, unknown>;

    if (n.type && typeof n.type === "string" && componentToFieldType[n.type]) {
      const props = (n.props ?? {}) as Record<string, unknown>;
      fields.push({
        label: String(props.label ?? ""),
        type: componentToFieldType[n.type],
        required: Boolean(props.required),
        options: Array.isArray(props.options)
          ? props.options.map(String)
          : undefined,
        placeholder: props.placeholder ? String(props.placeholder) : undefined,
        helpText: props.helpText ? String(props.helpText) : undefined,
        order,
      });
      order++;
    }

    // Traverse children
    if (Array.isArray(n.children)) {
      for (const child of n.children) {
        order = traverse(child, order);
      }
    }

    return order;
  }

  traverse(tree, 0);
  return fields;
}

/**
 * JsonRenderProvider - Uses @json-render to generate forms via AI.
 *
 * This provider sends the user's prompt to an AI model along with our
 * form catalog schema. The AI generates JSON constrained to valid form
 * components, which we then convert to propsto's TemplateFieldData format.
 */
export class JsonRenderProvider implements FormBuilderProvider {
  readonly name = "json-render";
  private config: ProviderConfig;

  constructor(config: ProviderConfig = {}) {
    this.config = config;
  }

  /**
   * Get the catalog for use with AI or direct rendering.
   */
  getCatalog() {
    return formCatalog;
  }

  /**
   * Generate a form from natural language prompt.
   */
  async generateForm(options: GenerateFormOptions): Promise<GenerateFormResult> {
    const { prompt, context, maxFields = 10 } = options;

    try {
      // Build the system prompt with catalog info
      const systemPrompt = this.buildSystemPrompt(maxFields, context);

      // Call AI endpoint to generate JSON
      const response = await this.callAI(systemPrompt, prompt);

      if (!response.success || !response.tree) {
        return {
          success: false,
          error: response.error ?? "Failed to generate form",
          raw: response,
        };
      }

      // Convert tree to form fields
      const fields = treeToFormFields(response.tree);

      if (fields.length === 0) {
        return {
          success: false,
          error: "No valid form fields generated",
          raw: response.tree,
        };
      }

      // Extract form name from response or derive from prompt
      const formName = response.name ?? this.deriveFormName(prompt);

      const form = {
        name: formName,
        description: response.description,
        fields,
      };

      // Validate against schema
      const parsed = GeneratedFormSchema.safeParse(form);
      if (!parsed.success) {
        return {
          success: false,
          error: `Invalid form structure: ${parsed.error.message}`,
          raw: form,
        };
      }

      return {
        success: true,
        form: parsed.data,
        raw: response.tree,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.config.apiKey || this.config.endpoint);
  }

  private buildSystemPrompt(maxFields: number, context?: string): string {
    const catalogDescription = `
You are a form builder. Generate a JSON form structure using ONLY these field types:
- TextField: Single line text input
- TextArea: Multi-line text input
- NumberField: Numeric input
- Rating: 1-5 star rating
- Scale: 1-10 scale rating
- Select: Dropdown with options (requires options array)
- Radio: Radio button group (requires options array)
- Checkbox: Single checkbox
- DateField: Date picker

Output format:
{
  "name": "Form Name",
  "description": "Optional description",
  "tree": {
    "type": "Form",
    "children": [
      { "type": "Rating", "props": { "label": "How would you rate this?", "required": true } },
      { "type": "TextArea", "props": { "label": "Comments", "placeholder": "Share your thoughts..." } }
    ]
  }
}

Rules:
- Maximum ${maxFields} fields
- Use clear, concise labels
- Mark truly important fields as required
- For Select/Radio, provide sensible options
${context ? `\nContext: ${context}` : ""}
`;
    return catalogDescription;
  }

  private async callAI(
    systemPrompt: string,
    userPrompt: string
  ): Promise<{
    success: boolean;
    tree?: unknown;
    name?: string;
    description?: string;
    error?: string;
  }> {
    const endpoint = this.config.endpoint ?? "https://api.openai.com/v1/chat/completions";
    const model = this.config.model ?? "gpt-4o-mini";

    if (!this.config.apiKey) {
      return { success: false, error: "API key not configured" };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `API error: ${response.status} - ${text}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return { success: false, error: "Empty response from AI" };
    }

    try {
      const parsed = JSON.parse(content);
      return {
        success: true,
        tree: parsed.tree,
        name: parsed.name,
        description: parsed.description,
      };
    } catch {
      return { success: false, error: "Failed to parse AI response as JSON" };
    }
  }

  private deriveFormName(prompt: string): string {
    // Simple heuristic: capitalize first few words
    const words = prompt.split(/\s+/).slice(0, 4);
    return words
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
}

/**
 * Create a JsonRenderProvider with the given config.
 */
export function createJsonRenderProvider(config: ProviderConfig): JsonRenderProvider {
  return new JsonRenderProvider(config);
}
