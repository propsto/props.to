import type { OrganizationRole } from "@prisma/client";
import { db } from "../db";

// Minimal rows for the repo tests. Each call makes a fresh, unique record.
let n = 0;
const next = () => `${Date.now().toString(36)}${(n++).toString(36)}`;

export async function createUser(name = "user") {
  const id = `${name}-${next()}`;
  const slug = await db.slug.create({ data: { slug: id } });
  return db.user.create({
    data: { email: `${id}@example.com`, slugId: slug.id, firstName: name },
  });
}

export async function createOrganization(name = "org") {
  const id = `${name}-${next()}`;
  const slug = await db.slug.create({ data: { slug: id } });
  return db.organization.create({ data: { name: id, slugId: slug.id } });
}

export async function addMember(
  userId: string,
  organizationId: string,
  role: OrganizationRole = "MEMBER",
) {
  return db.organizationMember.create({
    data: { userId, organizationId, role },
  });
}

export async function createTemplate(organizationId?: string) {
  return db.feedbackTemplate.create({
    data: {
      name: `template-${next()}`,
      ...(organizationId && {
        organizations: { connect: { id: organizationId } },
      }),
    },
  });
}

export async function createGroupRow(organizationId: string, name = "group") {
  const id = `${name}-${next()}`;
  const slug = await db.slug.create({
    data: { slug: id, scope: "ORGANIZATION", scopedToOrgId: organizationId },
  });
  return db.group.create({
    data: { name: id, organizationId, slugId: slug.id },
  });
}
