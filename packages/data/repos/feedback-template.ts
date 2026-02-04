import { createLogger } from "@propsto/logger";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { FeedbackType, FieldType } from "@prisma/client";

const logger = createLogger("data");

// Types for template data
export type TemplateFieldData = {
  id?: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  order: number;
};

export type FeedbackTemplateWithFields = Prisma.FeedbackTemplateGetPayload<{
  include: {
    fields: { orderBy: { order: "asc" } };
    category: true;
    organizations: { select: { id: true } };
    users: { select: { id: true } };
    _count: { select: { feedbacks: true; links: true } };
  };
}>;

const templateInclude = Prisma.validator<Prisma.FeedbackTemplateInclude>()({
  fields: { orderBy: { order: "asc" } },
  category: true,
  organizations: { select: { id: true } },
  users: { select: { id: true } },
  _count: { select: { feedbacks: true, links: true } },
});

// Create a feedback template
export async function createFeedbackTemplate(data: {
  name: string;
  description?: string;
  feedbackType?: FeedbackType;
  categoryId?: string;
  isPublic?: boolean;
  isDefault?: boolean;
  fields?: TemplateFieldData[];
  userId?: string;
  organizationId?: string;
  groupId?: string;
}): Promise<HandleEvent<FeedbackTemplateWithFields>> {
  try {
    logger("createFeedbackTemplate", { name: data.name });

    const template = await db.feedbackTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        feedbackType: data.feedbackType ?? "RECOGNITION",
        categoryId: data.categoryId,
        isPublic: data.isPublic ?? false,
        isDefault: data.isDefault ?? false,
        ...(data.userId && { users: { connect: { id: data.userId } } }),
        ...(data.organizationId && {
          organizations: { connect: { id: data.organizationId } },
        }),
        ...(data.groupId && { groups: { connect: { id: data.groupId } } }),
        ...(data.fields && {
          fields: {
            create: data.fields.map((field, index) => ({
              label: field.label,
              type: field.type,
              required: field.required ?? false,
              options: field.options,
              placeholder: field.placeholder,
              helpText: field.helpText,
              order: field.order ?? index,
            })),
          },
        }),
      },
      include: templateInclude,
    });

    return handleSuccess(template);
  } catch (e) {
    return handleError(e);
  }
}

// Get template by ID
export async function getFeedbackTemplate(
  id: string,
): Promise<HandleEvent<FeedbackTemplateWithFields | null>> {
  try {
    logger("getFeedbackTemplate", { id });
    const template = await db.feedbackTemplate.findUnique({
      where: { id, deletedAt: null },
      include: templateInclude,
    });
    return handleSuccess(template);
  } catch (e) {
    return handleError(e);
  }
}

// Update template
export async function updateFeedbackTemplate(
  id: string,
  data: {
    name?: string;
    description?: string;
    feedbackType?: FeedbackType;
    categoryId?: string | null;
    isPublic?: boolean;
    fields?: TemplateFieldData[];
  },
): Promise<HandleEvent<FeedbackTemplateWithFields>> {
  try {
    logger("updateFeedbackTemplate", { id, data });

    // If fields are provided, delete existing and create new ones
    if (data.fields) {
      await db.templateField.deleteMany({ where: { templateId: id } });
    }

    const template = await db.feedbackTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.feedbackType && { feedbackType: data.feedbackType }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.fields && {
          fields: {
            create: data.fields.map((field, index) => ({
              label: field.label,
              type: field.type,
              required: field.required ?? false,
              options: field.options,
              placeholder: field.placeholder,
              helpText: field.helpText,
              order: field.order ?? index,
            })),
          },
        }),
      },
      include: templateInclude,
    });

    return handleSuccess(template);
  } catch (e) {
    return handleError(e);
  }
}

// Soft delete template
export async function deleteFeedbackTemplate(
  id: string,
): Promise<HandleEvent<FeedbackTemplateWithFields>> {
  try {
    logger("deleteFeedbackTemplate", { id });
    const template = await db.feedbackTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: templateInclude,
    });
    return handleSuccess(template);
  } catch (e) {
    return handleError(e);
  }
}

// Get templates for a user
export async function getUserTemplates(
  userId: string,
  options?: { includePublic?: boolean },
): Promise<HandleEvent<FeedbackTemplateWithFields[]>> {
  try {
    logger("getUserTemplates", { userId, options });
    const templates = await db.feedbackTemplate.findMany({
      where: {
        deletedAt: null,
        OR: [
          { users: { some: { id: userId } } },
          ...(options?.includePublic ? [{ isPublic: true }] : []),
        ],
      },
      include: templateInclude,
      orderBy: { createdAt: "desc" },
    });
    return handleSuccess(templates);
  } catch (e) {
    return handleError(e);
  }
}

// Get templates for an organization
export async function getOrganizationTemplates(
  organizationId: string,
  options?: { includePublic?: boolean },
): Promise<HandleEvent<FeedbackTemplateWithFields[]>> {
  try {
    logger("getOrganizationTemplates", { organizationId, options });
    const templates = await db.feedbackTemplate.findMany({
      where: {
        deletedAt: null,
        OR: [
          { organizations: { some: { id: organizationId } } },
          ...(options?.includePublic ? [{ isPublic: true }] : []),
        ],
      },
      include: templateInclude,
      orderBy: { createdAt: "desc" },
    });
    return handleSuccess(templates);
  } catch (e) {
    return handleError(e);
  }
}

// Get public templates
export async function getPublicTemplates(): Promise<
  HandleEvent<FeedbackTemplateWithFields[]>
> {
  try {
    logger("getPublicTemplates");
    const templates = await db.feedbackTemplate.findMany({
      where: { isPublic: true, deletedAt: null },
      include: templateInclude,
      orderBy: { createdAt: "desc" },
    });
    return handleSuccess(templates);
  } catch (e) {
    return handleError(e);
  }
}

// Get default system templates
export async function getDefaultTemplates(): Promise<
  HandleEvent<FeedbackTemplateWithFields[]>
> {
  try {
    logger("getDefaultTemplates");
    const templates = await db.feedbackTemplate.findMany({
      where: { isDefault: true, deletedAt: null },
      include: templateInclude,
      orderBy: { name: "asc" },
    });
    return handleSuccess(templates);
  } catch (e) {
    return handleError(e);
  }
}

// Duplicate a template
export async function duplicateTemplate(
  id: string,
  userId: string,
  newName?: string,
): Promise<HandleEvent<FeedbackTemplateWithFields>> {
  try {
    logger("duplicateTemplate", { id, userId, newName });

    const original = await db.feedbackTemplate.findUnique({
      where: { id },
      include: { fields: true },
    });

    if (!original) {
      return handleError(new Error("Template not found"));
    }

    const template = await db.feedbackTemplate.create({
      data: {
        name: newName ?? `${original.name} (Copy)`,
        description: original.description,
        feedbackType: original.feedbackType,
        categoryId: original.categoryId,
        isPublic: false,
        isDefault: false,
        users: { connect: { id: userId } },
        fields: {
          create: original.fields.map(field => ({
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options ?? undefined,
            placeholder: field.placeholder,
            helpText: field.helpText,
            order: field.order,
          })),
        },
      },
      include: templateInclude,
    });

    return handleSuccess(template);
  } catch (e) {
    return handleError(e);
  }
}

// Get template categories
export async function getTemplateCategories(): Promise<
  HandleEvent<
    Prisma.TemplateCategoryGetPayload<{
      include: { _count: { select: { templates: true } } };
    }>[]
  >
> {
  try {
    logger("getTemplateCategories");
    const categories = await db.templateCategory.findMany({
      include: { _count: { select: { templates: true } } },
      orderBy: { name: "asc" },
    });
    return handleSuccess(categories);
  } catch (e) {
    return handleError(e);
  }
}

// Create template category
export async function createTemplateCategory(data: {
  name: string;
  description?: string;
  icon?: string;
}): Promise<HandleEvent<Prisma.TemplateCategoryGetPayload<{}>>> {
  try {
    logger("createTemplateCategory", { name: data.name });
    const category = await db.templateCategory.create({ data });
    return handleSuccess(category);
  } catch (e) {
    return handleError(e);
  }
}

// Assign template to user
export async function assignTemplateToUser(
  templateId: string,
  userId: string,
): Promise<HandleEvent<FeedbackTemplateWithFields>> {
  try {
    logger("assignTemplateToUser", { templateId, userId });
    const template = await db.feedbackTemplate.update({
      where: { id: templateId },
      data: { users: { connect: { id: userId } } },
      include: templateInclude,
    });
    return handleSuccess(template);
  } catch (e) {
    return handleError(e);
  }
}

// Assign template to organization
export async function assignTemplateToOrganization(
  templateId: string,
  organizationId: string,
): Promise<HandleEvent<FeedbackTemplateWithFields>> {
  try {
    logger("assignTemplateToOrganization", { templateId, organizationId });
    const template = await db.feedbackTemplate.update({
      where: { id: templateId },
      data: { organizations: { connect: { id: organizationId } } },
      include: templateInclude,
    });
    return handleSuccess(template);
  } catch (e) {
    return handleError(e);
  }
}
