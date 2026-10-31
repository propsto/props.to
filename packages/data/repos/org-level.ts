import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

import {
  cleanRubric,
  parseRubric,
  type OrgLevelRubricSection,
} from "../utils/rubric";

export type { OrgLevelRubricSection };

export type CreateOrgLevelInput = {
  name: string;
  summary?: string;
  organizationId: string;
};

export type UpdateOrgLevelInput = {
  name?: string;
  // Omitted keeps the current summary; an empty string clears it
  summary?: string;
  // Omitted keeps the current rubric; sections with no title and no body are dropped
  rubric?: OrgLevelRubricSection[];
};

export type OrgLevelExpectationInput = { valueId: string; text: string };

function cleanName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Name is required");
  }
  return trimmed;
}

/**
 * Get an organization's levels in display order
 */
export async function getOrgLevels(organizationId: string) {
  try {
    logger("getOrgLevels", { organizationId });

    const levels = await db.orgLevel.findMany({
      where: { organizationId },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { members: true } } },
    });

    return handleSuccess(levels);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Create a level at the end of the organization's list
 */
export async function createOrgLevel(input: CreateOrgLevelInput) {
  try {
    logger("createOrgLevel", { input });
    const name = cleanName(input.name);
    const { organizationId } = input;

    // Lock the org row so concurrent creates append in turn instead of sharing an order
    const level = await db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Organization" WHERE id = ${organizationId} FOR UPDATE`;

      const existing = await tx.orgLevel.findFirst({
        where: { name, organizationId },
      });
      if (existing) {
        throw new Error("A level with this name already exists");
      }

      const last = await tx.orgLevel.findFirst({
        where: { organizationId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      return tx.orgLevel.create({
        data: {
          name,
          summary: input.summary?.trim() || null,
          organizationId,
          order: (last?.order ?? -1) + 1,
        },
      });
    });

    return handleSuccess(level);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Update a level of this organization
 */
export async function updateOrgLevel(
  levelId: string,
  organizationId: string,
  input: UpdateOrgLevelInput,
) {
  try {
    logger("updateOrgLevel", { levelId, organizationId, input });

    const existing = await db.orgLevel.findFirst({
      where: { id: levelId, organizationId },
    });
    if (!existing) {
      throw new Error("Level not found");
    }

    const name = input.name === undefined ? undefined : cleanName(input.name);
    if (name && name !== existing.name) {
      const duplicate = await db.orgLevel.findFirst({
        where: { name, organizationId, NOT: { id: levelId } },
      });
      if (duplicate) {
        throw new Error("A level with this name already exists");
      }
    }

    const level = await db.orgLevel.update({
      where: { id: levelId },
      data: {
        name,
        summary:
          input.summary === undefined
            ? undefined
            : input.summary.trim() || null,
        rubric:
          input.rubric === undefined ? undefined : cleanRubric(input.rubric),
      },
    });

    return handleSuccess(level);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Get one level of this organization with its rubric and per-value expectations
 */
export async function getOrgLevel(levelId: string, organizationId: string) {
  try {
    logger("getOrgLevel", { levelId, organizationId });

    const level = await db.orgLevel.findFirst({
      where: { id: levelId, organizationId },
      include: { expectations: { select: { valueId: true, text: true } } },
    });
    if (!level) {
      return handleSuccess(null);
    }

    return handleSuccess({ ...level, rubric: parseRubric(level.rubric) });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Set a level's expectation text for the given values; values not listed keep theirs.
 * An empty text removes that value's expectation; values must belong to the org.
 */
export async function setOrgLevelExpectations(
  levelId: string,
  organizationId: string,
  expectations: OrgLevelExpectationInput[],
) {
  try {
    logger("setOrgLevelExpectations", { levelId, organizationId });

    const entries = expectations.map(e => ({
      valueId: e.valueId,
      text: e.text.trim(),
    }));
    const valueIds = [...new Set(entries.map(e => e.valueId))];

    // Lock the level row so concurrent saves apply one after the other
    await db.$transaction(async tx => {
      const locked = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "OrgLevel"
        WHERE id = ${levelId} AND "organizationId" = ${organizationId}
        FOR UPDATE`;
      if (locked.length === 0) {
        throw new Error("Level not found");
      }

      const owned = await tx.orgValue.count({
        where: { id: { in: valueIds }, organizationId },
      });
      if (owned !== valueIds.length) {
        throw new Error("Value list is out of date, reload and try again");
      }

      await tx.orgLevelValueExpectation.deleteMany({
        where: {
          levelId,
          valueId: { in: entries.filter(e => !e.text).map(e => e.valueId) },
        },
      });
      for (const e of entries.filter(e => e.text)) {
        await tx.orgLevelValueExpectation.upsert({
          where: { levelId_valueId: { levelId, valueId: e.valueId } },
          create: { levelId, valueId: e.valueId, text: e.text },
          update: { text: e.text },
        });
      }
    });

    return handleSuccess({ saved: entries.filter(e => e.text).length });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * A member's level in this organization with its rubric and expectations,
 * or null when the member has no level
 */
export async function getMemberLevel(organizationId: string, userId: string) {
  try {
    logger("getMemberLevel", { organizationId, userId });

    const member = await db.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      select: {
        level: {
          select: {
            name: true,
            summary: true,
            rubric: true,
            expectations: { select: { valueId: true, text: true } },
          },
        },
      },
    });
    if (!member?.level) {
      return handleSuccess(null);
    }

    return handleSuccess({
      ...member.level,
      rubric: parseRubric(member.level.rubric),
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Set the display order of an organization's levels.
 * orderedIds must list exactly the organization's levels.
 */
export async function reorderOrgLevels(
  organizationId: string,
  orderedIds: string[],
) {
  try {
    logger("reorderOrgLevels", { organizationId, orderedIds });

    const current = await db.orgLevel.findMany({
      where: { organizationId },
      select: { id: true },
    });
    const currentIds = new Set(current.map(l => l.id));
    if (
      orderedIds.length !== currentIds.size ||
      new Set(orderedIds).size !== orderedIds.length ||
      orderedIds.some(id => !currentIds.has(id))
    ) {
      throw new Error("Level list is out of date, reload and try again");
    }

    await db.$transaction(
      orderedIds.map((id, order) =>
        db.orgLevel.update({ where: { id }, data: { order } }),
      ),
    );

    return handleSuccess({ reordered: true });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Assign a level to a member of this organization, or clear it with null.
 * Returns the previous and new level names for the audit log.
 */
export async function setOrganizationMemberLevel(
  organizationId: string,
  userId: string,
  levelId: string | null,
) {
  try {
    logger("setOrganizationMemberLevel", { organizationId, userId, levelId });

    // Lock the member row so the returned previous level is the one this write replaced
    const change = await db.$transaction(async tx => {
      const locked = await tx.$queryRaw<
        { id: string; levelId: string | null }[]
      >`
        SELECT id, "levelId" FROM "OrganizationMember"
        WHERE "userId" = ${userId} AND "organizationId" = ${organizationId}
        FOR UPDATE`;
      if (locked.length === 0) {
        throw new Error("Member not found");
      }
      const member = locked[0];

      const previous = member.levelId
        ? await tx.orgLevel.findUnique({
            where: { id: member.levelId },
            select: { name: true },
          })
        : null;

      const level = levelId
        ? await tx.orgLevel.findFirst({
            where: { id: levelId, organizationId },
            select: { id: true, name: true },
          })
        : null;
      if (levelId && !level) {
        throw new Error("Level not found");
      }

      await tx.organizationMember.update({
        where: { id: member.id },
        data: { levelId: level?.id ?? null },
      });

      return { from: previous?.name ?? null, to: level?.name ?? null };
    });

    return handleSuccess(change);
  } catch (e) {
    return handleError(e);
  }
}
