import { createLogger } from "@propsto/logger";
import type { AuditAction, Prisma } from "@prisma/client";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

export type CreateAuditLogInput = {
  organizationId: string;
  actorId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
};

export type AuditLogFilters = {
  organizationId: string;
  actorId?: string;
  action?: AuditAction;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
};

/**
 * Create a new audit log entry
 */
export async function createAuditLog(input: CreateAuditLogInput) {
  try {
    logger("createAuditLog", { input });

    const auditLog = await db.auditLog.create({
      data: {
        organizationId: input.organizationId,
        actorId: input.actorId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        details: input.details,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });

    return handleSuccess(auditLog);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Get audit logs for an organization with optional filters
 */
export async function getAuditLogs(
  filters: AuditLogFilters,
  options: { limit?: number; offset?: number } = {},
) {
  try {
    logger("getAuditLogs", { filters, options });

    const { limit = 50, offset = 0 } = options;

    const where: Prisma.AuditLogWhereInput = {
      organizationId: filters.organizationId,
    };

    if (filters.actorId) {
      where.actorId = filters.actorId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.auditLog.count({ where }),
    ]);

    return handleSuccess({ logs, total, limit, offset });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Get a single audit log by ID
 */
export async function getAuditLogById(id: string, organizationId: string) {
  try {
    logger("getAuditLogById", { id, organizationId });

    const auditLog = await db.auditLog.findFirst({
      where: { id, organizationId },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    });

    return handleSuccess(auditLog);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Helper to log common admin actions
 */
export const auditHelpers = {
  async logSettingsUpdate(
    organizationId: string,
    actorId: string,
    settingsType: string,
    changes: Record<string, { old: unknown; new: unknown }>,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return createAuditLog({
      organizationId,
      actorId,
      action: "SETTINGS_UPDATED",
      resourceType: settingsType,
      details: JSON.parse(JSON.stringify({ changes })) as Prisma.InputJsonValue,
      ...metadata,
    });
  },

  async logCategoryAction(
    organizationId: string,
    actorId: string,
    action: "CATEGORY_CREATED" | "CATEGORY_UPDATED" | "CATEGORY_DELETED",
    categoryId: string,
    details?: Record<string, unknown>,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return createAuditLog({
      organizationId,
      actorId,
      action,
      resourceType: "category",
      resourceId: categoryId,
      details: details
        ? (JSON.parse(JSON.stringify(details)) as Prisma.InputJsonValue)
        : undefined,
      ...metadata,
    });
  },

  async logMemberAction(
    organizationId: string,
    actorId: string,
    action: "MEMBER_INVITED" | "MEMBER_REMOVED" | "MEMBER_ROLE_CHANGED",
    memberId: string,
    details?: Record<string, unknown>,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return createAuditLog({
      organizationId,
      actorId,
      action,
      resourceType: "member",
      resourceId: memberId,
      details: details
        ? (JSON.parse(JSON.stringify(details)) as Prisma.InputJsonValue)
        : undefined,
      ...metadata,
    });
  },

  async logOrgUrlChange(
    organizationId: string,
    actorId: string,
    oldSlug: string,
    newSlug: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return createAuditLog({
      organizationId,
      actorId,
      action: "ORG_URL_CHANGED",
      resourceType: "organization",
      resourceId: organizationId,
      details: { oldSlug, newSlug } as Prisma.InputJsonValue,
      ...metadata,
    });
  },
};
