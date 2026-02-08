"use server";

import { auth } from "@/server/auth.server";
import {
  assignTemplateToOrganization,
  verifyOrgAdminAccess,
  createFeedbackTemplate,
  getOrganizationBySlug,
  setOrganizationDefaultTemplate,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";
import { FeedbackType } from "@prisma/client";
import type { FormField } from "@propsto/forms";

/**
 * Add a default template to an organization
 */
export async function addDefaultTemplateToOrgAction(
  templateId: string,
  organizationId: string,
  orgSlug: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify admin access
  const membershipResult = await verifyOrgAdminAccess(session.user.id, orgSlug);
  if (!membershipResult.success || !membershipResult.data) {
    return { success: false, error: "Not authorized" };
  }

  // Assign template to organization
  const result = await assignTemplateToOrganization(templateId, organizationId);
  if (!result.success) {
    return { success: false, error: result.error ?? "Failed to add template" };
  }

  revalidatePath(`/org/${orgSlug}/admin/templates`);
  return { success: true };
}

interface CreateOrgTemplateInput {
  name: string;
  description?: string;
  feedbackType: FeedbackType;
  fields: FormField[];
  orgSlug: string;
}

/**
 * Create a new template for an organization
 */
export async function createOrgTemplateAction(
  input: CreateOrgTemplateInput,
): Promise<{ success: boolean; error?: string; templateId?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify admin access
  const membershipResult = await verifyOrgAdminAccess(
    session.user.id,
    input.orgSlug,
  );
  if (!membershipResult.success || !membershipResult.data) {
    return { success: false, error: "Not authorized" };
  }

  // Get organization ID
  const orgResult = await getOrganizationBySlug(input.orgSlug);
  if (!orgResult.success || !orgResult.data) {
    return { success: false, error: "Organization not found" };
  }

  // Create template for organization
  const result = await createFeedbackTemplate({
    name: input.name,
    description: input.description,
    feedbackType: input.feedbackType,
    isPublic: false,
    organizationId: orgResult.data.id,
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

  revalidatePath(`/org/${input.orgSlug}/admin/templates`);
  return { success: true, templateId: result.data.id };
}

/**
 * Set or unset the default template for an organization
 */
export async function setDefaultTemplateAction(
  organizationId: string,
  templateId: string | null,
  orgSlug: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify admin access
  const membershipResult = await verifyOrgAdminAccess(session.user.id, orgSlug);
  if (!membershipResult.success || !membershipResult.data) {
    return { success: false, error: "Not authorized" };
  }

  // Set default template
  const result = await setOrganizationDefaultTemplate(
    organizationId,
    templateId,
  );
  if (!result.success) {
    return {
      success: false,
      error: result.error ?? "Failed to set default template",
    };
  }

  revalidatePath(`/org/${orgSlug}/admin/templates`);
  return { success: true };
}
