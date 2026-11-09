"use server";

import { revalidatePath } from "next/cache";
import { cleanLinkInput } from "@/lib/link-input";
import {
  withOrgAdmin,
  ok,
  fail,
  type ActionResult,
} from "@/server/with-org-admin";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntity,
  createEntityFeedbackLink,
  isValidSlugFormat,
} from "@propsto/data/repos";

const MAX_NAME = 100;
const MAX_DESCRIPTION = 500;

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
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const input = cleanEntityInput(data);
    if (typeof input === "string") return fail(input);

    const result = await createEntity({
      organizationId: org.id,
      name: input.name,
      slug: input.slug,
      description: input.description ?? undefined,
    });
    if (!result.success) return fail(result.error, "Failed to create entity");

    await audit(
      "ENTITY_CREATED",
      { type: "entity", id: result.data.id },
      { name: input.name, slug: input.slug },
    );
    revalidatePath(`/org/${orgSlug}/admin/entities`);
    return ok();
  });
}

export async function updateEntityAction(
  orgSlug: string,
  entityId: string,
  data: { name: string; slug: string; description?: string },
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const input = cleanEntityInput(data);
    if (typeof input === "string") return fail(input);

    // The repo matches the id within the admin's org only
    const result = await updateEntity(entityId, org.id, input);
    if (!result.success) return fail(result.error, "Failed to update entity");

    await audit(
      "ENTITY_UPDATED",
      { type: "entity", id: entityId },
      { name: input.name, slug: input.slug },
    );
    revalidatePath(`/org/${orgSlug}/admin/entities`);
    return ok();
  });
}

// Deletes the entity with its links and feedback
export async function deleteEntityAction(
  orgSlug: string,
  entityId: string,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await deleteEntity(entityId, org.id);
    if (!result.success) return fail(result.error, "Failed to delete entity");

    await audit(
      "ENTITY_DELETED",
      { type: "entity", id: entityId },
      { name: result.data.name },
    );
    revalidatePath(`/org/${orgSlug}/admin/entities`);
    return ok();
  });
}

export async function createEntityLinkAction(
  orgSlug: string,
  entityId: string,
  data: { name: string; slug?: string; templateId: string },
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const entity = await getEntity(entityId, org.id);
    if (!entity.data) return fail("Entity not found");

    const cleaned = cleanLinkInput({ name: data.name, slug: data.slug });
    if (!cleaned.success) return fail(cleaned.error);
    const name = cleaned.name!;
    const slug = cleaned.slug;

    // The repo refuses a template that is neither a default nor the org's
    const result = await createEntityFeedbackLink({
      entityId,
      organizationId: org.id,
      templateId: data.templateId,
      name,
      slug,
    });
    if (!result.success) return fail(result.error, "Failed to create link");

    await audit(
      "ENTITY_LINK_CREATED",
      { type: "entity", id: entityId },
      { name, slug: result.data.slug, linkId: result.data.id },
    );
    revalidatePath(`/org/${orgSlug}/admin/entities`);
    return ok();
  });
}
