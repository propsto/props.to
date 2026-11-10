"use server";

import {
  assignTemplateToOrganization,
  createFeedbackTemplate,
  getOrganizationCategories,
  setOrganizationDefaultTemplate,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";
import { FeedbackType } from "@prisma/client";
import type { FormField } from "@propsto/forms";
import {
  withOrgAdmin,
  ok,
  fail,
  type ActionResult,
} from "@/server/with-org-admin";

/**
 * Add a default template to an organization
 */
export async function addDefaultTemplateToOrgAction(
  templateId: string,
  orgSlug: string,
): Promise<ActionResult> {
  // The org id comes from the membership, never the client
  return withOrgAdmin(orgSlug, async ({ org }) => {
    const result = await assignTemplateToOrganization(templateId, org.id);
    if (!result.success) return fail(result.error, "Failed to add template");

    revalidatePath(`/org/${orgSlug}/admin/templates`);
    return ok();
  });
}

interface CreateOrgTemplateInput {
  name: string;
  description?: string;
  feedbackType: FeedbackType;
  categoryId?: string;
  fields: FormField[];
  orgSlug: string;
}

/**
 * Create a new template for an organization
 */
export async function createOrgTemplateAction(
  input: CreateOrgTemplateInput,
): Promise<ActionResult<{ templateId: string }>> {
  return withOrgAdmin(input.orgSlug, async ({ org }) => {
    // A category must be one of this org's categories or a global one
    if (input.categoryId) {
      const categoriesResult = await getOrganizationCategories(org.id);
      if (
        !categoriesResult.success ||
        !categoriesResult.data.some(c => c.id === input.categoryId)
      ) {
        return fail("Category not found");
      }
    }

    // Create template for organization
    const result = await createFeedbackTemplate({
      name: input.name,
      description: input.description,
      feedbackType: input.feedbackType,
      categoryId: input.categoryId,
      isPublic: false,
      organizationId: org.id,
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

    if (!result.success) return fail(result.error, "Failed to create template");

    revalidatePath(`/org/${input.orgSlug}/admin/templates`);
    return ok({ templateId: result.data.id });
  });
}

/**
 * Set or unset the default template for an organization
 */
export async function setDefaultTemplateAction(
  templateId: string | null,
  orgSlug: string,
): Promise<ActionResult> {
  // The org id comes from the membership, never the client
  return withOrgAdmin(orgSlug, async ({ org }) => {
    const result = await setOrganizationDefaultTemplate(org.id, templateId);
    if (!result.success) {
      return fail(result.error, "Failed to set default template");
    }

    revalidatePath(`/org/${orgSlug}/admin/templates`);
    return ok();
  });
}
