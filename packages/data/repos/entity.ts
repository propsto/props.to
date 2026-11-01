import { createLogger } from "@propsto/logger";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { SlugScope } from "@prisma/client";

const logger = createLogger("data");

// Entities are named things an org collects feedback about (a product, event,
// service). Their feedback has no recipient person (userId is null, enforced by a
// DB check), so it never reaches anyone's received feedback or personal record.

const entityInclude = Prisma.validator<Prisma.EntityInclude>()({
  slug: { select: { slug: true } },
  feedbackLinks: {
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      template: { select: { id: true, name: true } },
      _count: { select: { feedbacks: true } },
    },
    orderBy: { createdAt: "asc" },
  },
  _count: { select: { feedbacks: { where: { status: "APPROVED" } } } },
});

export type EntityWithLinks = Prisma.EntityGetPayload<{
  include: typeof entityInclude;
}>;

async function assertSlugFree(
  slug: string,
  organizationId: string,
  exceptSlugId?: string,
): Promise<void> {
  const existing = await db.slug.findFirst({
    where: {
      slug,
      scope: SlugScope.ORGANIZATION,
      scopedToOrgId: organizationId,
      ...(exceptSlugId && { id: { not: exceptSlugId } }),
    },
    select: { id: true },
  });
  if (existing) {
    throw new Error("That slug is already used in this organization");
  }
}

export async function createEntity(data: {
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
}): Promise<HandleEvent<EntityWithLinks>> {
  try {
    logger("createEntity", { organizationId: data.organizationId });
    const slug = data.slug.toLowerCase();
    await assertSlugFree(slug, data.organizationId);
    const entity = await db.entity.create({
      data: {
        name: data.name,
        description: data.description,
        organization: { connect: { id: data.organizationId } },
        slug: {
          create: {
            slug,
            scope: SlugScope.ORGANIZATION,
            scopedToOrgId: data.organizationId,
          },
        },
      },
      include: entityInclude,
    });
    return handleSuccess(entity);
  } catch (e) {
    return handleError(e);
  }
}

// Scoped to the org so an id from another org never matches
export async function getEntity(
  id: string,
  organizationId: string,
): Promise<HandleEvent<EntityWithLinks | null>> {
  try {
    logger("getEntity", { id, organizationId });
    const entity = await db.entity.findFirst({
      where: { id, organizationId },
      include: entityInclude,
    });
    return handleSuccess(entity);
  } catch (e) {
    return handleError(e);
  }
}

export async function getOrganizationEntities(
  organizationId: string,
): Promise<HandleEvent<EntityWithLinks[]>> {
  try {
    logger("getOrganizationEntities", { organizationId });
    const entities = await db.entity.findMany({
      where: { organizationId },
      include: entityInclude,
      orderBy: { name: "asc" },
    });
    return handleSuccess(entities);
  } catch (e) {
    return handleError(e);
  }
}

// For the public page: the entity behind an org-scoped slug
export async function getEntityForPublicPage(id: string) {
  try {
    logger("getEntityForPublicPage", { id });
    const entity = await db.entity.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        organization: { select: { id: true, name: true } },
      },
    });
    return handleSuccess(entity);
  } catch (e) {
    return handleError(e);
  }
}

export async function updateEntity(
  id: string,
  organizationId: string,
  data: { name?: string; slug?: string; description?: string | null },
): Promise<HandleEvent<EntityWithLinks>> {
  try {
    logger("updateEntity", { id, organizationId });
    const current = await db.entity.findFirst({
      where: { id, organizationId },
      select: { slugId: true },
    });
    if (!current) throw new Error("Entity not found");
    const slug = data.slug?.toLowerCase();
    if (slug) await assertSlugFree(slug, organizationId, current.slugId);
    const entity = await db.entity.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        ...(slug && { slug: { update: { slug } } }),
      },
      include: entityInclude,
    });
    return handleSuccess(entity);
  } catch (e) {
    return handleError(e);
  }
}

// Deleting the slug cascades to the entity, its links and its feedback, so no
// entity feedback is ever left without its entity
export async function deleteEntity(
  id: string,
  organizationId: string,
): Promise<HandleEvent<{ id: string; name: string }>> {
  try {
    logger("deleteEntity", { id, organizationId });
    const entity = await db.entity.findFirst({
      where: { id, organizationId },
      select: { id: true, name: true, slugId: true },
    });
    if (!entity) throw new Error("Entity not found");
    await db.slug.delete({ where: { id: entity.slugId } });
    return handleSuccess({ id: entity.id, name: entity.name });
  } catch (e) {
    return handleError(e);
  }
}

// Approved feedback about an entity, for its admin page
export async function getEntityFeedback(
  entityId: string,
  organizationId: string,
  options?: { take?: number },
) {
  try {
    logger("getEntityFeedback", { entityId, organizationId });
    const feedbacks = await db.feedback.findMany({
      where: { entityId, organizationId, status: "APPROVED" },
      select: {
        id: true,
        createdAt: true,
        context: true,
        visibility: true,
        fieldsData: true,
        templateId: true,
        submitterName: true,
        submitter: { select: { firstName: true, lastName: true } },
        link: { select: { name: true } },
        values: { select: { value: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      // ponytail: newest 100, add paging when an entity collects more
      take: options?.take ?? 100,
    });
    return handleSuccess(feedbacks);
  } catch (e) {
    return handleError(e);
  }
}
