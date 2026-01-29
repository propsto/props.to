"use server";

import { auth } from "@/server/auth.server";
import { createFeedbackTemplate } from "@propsto/data/repos";
import { createFormBuilder } from "@propsto/forms";
import { constServer } from "@propsto/constants/server";
import { FeedbackType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { FormField } from "@propsto/forms";

interface GenerateFormInput {
  prompt: string;
}

interface GenerateFormResult {
  success: boolean;
  error?: string;
  form?: {
    name: string;
    description?: string;
    fields: FormField[];
  };
}

export async function generateFormAction(
  input: GenerateFormInput
): Promise<GenerateFormResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const apiKey = constServer.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "AI form generation is not configured. Please add an OpenAI API key.",
    };
  }

  const builder = createFormBuilder({
    provider: "json-render",
    apiKey,
  });

  const result = await builder.generateForm({ prompt: input.prompt });

  if (!result.success || !result.form) {
    return {
      success: false,
      error: result.error ?? "Failed to generate form",
    };
  }

  return {
    success: true,
    form: result.form,
  };
}

interface CreateTemplateInput {
  name: string;
  description?: string;
  feedbackType: FeedbackType;
  isPublic: boolean;
  fields: FormField[];
}

interface CreateTemplateResult {
  success: boolean;
  error?: string;
  templateId?: string;
}

export async function createTemplateAction(
  input: CreateTemplateInput
): Promise<CreateTemplateResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await createFeedbackTemplate({
    name: input.name,
    description: input.description,
    feedbackType: input.feedbackType,
    isPublic: input.isPublic,
    userId: session.user.id,
    fields: input.fields.map((field, index) => ({
      label: field.label,
      type: field.type,
      required: field.required ?? false,
      options: field.options,
      placeholder: field.placeholder,
      helpText: field.helpText,
      order: field.order ?? index,
    })),
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error ?? "Failed to create template",
    };
  }

  revalidatePath("/templates");

  return { success: true, templateId: result.data.id };
}
