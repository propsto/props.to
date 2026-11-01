"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth.server";
import {
  verifyOrgAdminAccess,
  createAuditLog,
  createEntity,
  updateEntity,
  deleteEntity,
  getEntity,
  createEntityFeedbackLink,
  isValidSlugFormat,
} from "@propsto/data/repos";

type ActionResult = { success: true } | { success: false; error: string };

const MAX_NAME = 100;
const MAX_DESCRIPTION = 500;

async function verifyAdminAccess(orgSlug: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const membership = await verifyOrgAdminAccess(session.user.id, orgSlug);
  if (!membership.success || !membership.data) return null;
  return {
    orgId: membership.data.organization.id,
    userId: session.user.id,
  };
}

function cleanEntityInput(data: {
  name: string;
  slug: string;
  description?: string;
}): { name: string; slug: string; description: string | null } | string {
  const name = data.name.trim().slice(0, MAX_NAME);
  const slug = data.slug.trim().toLowerCase();
  if (!name) return "Name is required";
  if (!isValidSlugFormat(slug)) {
    return "Slug must be 3-30 lowercase letters, numbers or dashes";
  }
  const description = data.description?.trim().slice(0, MAX_DESCRIPTION);
  return { name, slug, description: description || null };
}

export async function createEntityAction(
  orgSlug: string,
  data: { name: string; slug: string; description?: string },
): Promise<ActionResult> {
  const access = await verifyAdminAccess(orgSlug);
  if (!access) return { success: false, error: "Not authorized" };
  const input = cleanEntityInput(data);
  if (typeof input === "string") return { success: false, error: input };

  const result = await createEntity({
    organizationId: access.orgId,
    name: input.name,
    slug: input.slug,
    description: input.description ?? undefined,
  });
  if (!result.success) {
    return { success: false, error: result.error ?? "Failed to create entity" };
  }
  await createAuditLog({
    organizationId: access.orgId,
    actorId: access.userId,
    action: "ENTITY_CREATED",
    resourceType: "entity",
    resourceId: result.data.id,
    details: { name: input.name, slug: input.slug },
  });
  revalidatePath(`/org/${orgSlug}/admin/entities`);
  return { success: true };
}

export async function updateEntityAction(
  orgSlug: string,
  entityId: string,
  data: { name: string; slug: string; description?: string },
): Promise<ActionResult> {
  const access = await verifyAdminAccess(orgSlug);
  if (!access) return { success: false, error: "Not authorized" };
  const input = cleanEntityInput(data);
  if (typeof input === "string") return { success: false, error: input };

  // The repo matches the id within the admin's org only
  const result = await updateEntity(entityId, access.orgId, input);
  if (!result.success) {
    return { success: false, error: result.error ?? "Failed to update entity" };
  }
  await createAuditLog({
    organizationId: access.orgId,
    actorId: access.userId,
    action: "ENTITY_UPDATED",
    resourceType: "entity",
    resourceId: entityId,
    details: { name: input.name, slug: input.slug },
  });
  revalidatePath(`/org/${orgSlug}/admin/entities`);
  return { success: true };
}

// Deletes the entity with its links and feedback
export async function deleteEntityAction(
  orgSlug: string,
  entityId: string,
): Promise<ActionResult> {
  const access = await verifyAdminAccess(orgSlug);
  if (!access) return { success: false, error: "Not authorized" };

  const result = await deleteEntity(entityId, access.orgId);
  if (!result.success) {
    return { success: false, error: result.error ?? "Failed to delete entity" };
  }
  await createAuditLog({
    organizationId: access.orgId,
    actorId: access.userId,
    action: "ENTITY_DELETED",
    resourceType: "entity",
    resourceId: entityId,
    details: { name: result.data.name },
  });
  revalidatePath(`/org/${orgSlug}/admin/entities`);
  return { success: true };
}

export async function createEntityLinkAction(
  orgSlug: string,
  entityId: string,
  data: { name: string; slug?: string; templateId: string },
): Promise<ActionResult> {
  const access = await verifyAdminAccess(orgSlug);
  if (!access) return { success: false, error: "Not authorized" };
  const entity = await getEntity(entityId, access.orgId);
  if (!entity.data) return { success: false, error: "Entity not found" };

  const name = data.name.trim().slice(0, MAX_NAME);
  if (!name) return { success: false, error: "Name is required" };
  const slug = data.slug?.trim().toLowerCase() || undefined;
  if (slug && !isValidSlugFormat(slug)) {
    return {
      success: false,
      error: "Slug must be 3-30 lowercase letters, numbers or dashes",
    };
  }

  // The repo refuses a template that is neither a default nor the org's
  const result = await createEntityFeedbackLink({
    entityId,
    organizationId: access.orgId,
    templateId: data.templateId,
    name,
    slug,
  });
  if (!result.success) {
    return { success: false, error: result.error ?? "Failed to create link" };
  }
  await createAuditLog({
    organizationId: access.orgId,
    actorId: access.userId,
    action: "ENTITY_LINK_CREATED",
    resourceType: "entity",
    resourceId: entityId,
    details: { name, slug: result.data.slug, linkId: result.data.id },
  });
  revalidatePath(`/org/${orgSlug}/admin/entities`);
  return { success: true };
}
