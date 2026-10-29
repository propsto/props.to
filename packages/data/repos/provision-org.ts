import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import {
  normalizeHostedDomain,
  orgUsernameFromEmail,
  planOrgProvisioning,
} from "../utils/provision-org";
import {
  addOrganizationMember,
  createOrganizationWithOwner,
  updateOrganizationMemberRole,
} from "./organization";
import { generateUniqueSlug } from "./slug";
import { createUser, createUserOrgSlug, getUserOrgSlug } from "./user";

const logger = createLogger("data");

// Create (or, on an existing org, only ensure the owner of) a Google Workspace
// organization from outside the onboarding flow. Safe to re-run.
export async function provisionOrganization(data: {
  hostedDomain: string;
  name: string;
  ownerEmail: string;
}): Promise<
  HandleEvent<{
    organizationId: string;
    slug: string;
    createdOrganization: boolean;
    ownerAction: "add" | "promote" | "none";
  }>
> {
  try {
    logger("provisionOrganization", data);
    const hostedDomain = normalizeHostedDomain(data.hostedDomain);
    const ownerEmail = data.ownerEmail.trim().toLowerCase();

    let user = await db.user.findUnique({ where: { email: ownerEmail } });
    if (!user) {
      const created = await createUser({
        email: ownerEmail,
        hostedDomain: ownerEmail.endsWith(`@${hostedDomain}`)
          ? hostedDomain
          : null,
      });
      if (!created.success || !created.data) {
        return handleError(new Error(created.error ?? "Could not create user"));
      }
      user = await db.user.findUniqueOrThrow({
        where: { id: created.data.id },
      });
    }

    const existing = await db.organization.findUnique({
      where: { hostedDomain },
      include: { slug: true },
    });
    const membership = existing
      ? await db.organizationMember.findUnique({
          where: {
            userId_organizationId: {
              userId: user.id,
              organizationId: existing.id,
            },
          },
        })
      : null;
    const plan = planOrgProvisioning({
      organizationExists: Boolean(existing),
      ownerRole: membership?.role ?? null,
    });

    if (!existing) {
      const slug = await generateUniqueSlug(
        hostedDomain.split(".")[0] ?? hostedDomain,
        "GLOBAL",
      );
      if (!slug.success) return handleError(new Error(slug.error));
      const org = await createOrganizationWithOwner({
        name: data.name,
        slug: slug.data,
        hostedDomain,
        ownerId: user.id,
        ownerEmail: user.email,
      });
      if (!org.success) return handleError(new Error(org.error));
      return handleSuccess({
        organizationId: org.data.id,
        slug: slug.data,
        createdOrganization: true,
        ownerAction: plan.ownerAction,
      });
    }

    if (plan.ownerAction === "add") {
      const added = await addOrganizationMember({
        userId: user.id,
        organizationId: existing.id,
        role: "OWNER",
      });
      if (!added.success) return handleError(new Error(added.error));
    } else if (plan.ownerAction === "promote") {
      const promoted = await updateOrganizationMemberRole({
        userId: user.id,
        organizationId: existing.id,
        role: "OWNER",
      });
      if (!promoted.success) return handleError(new Error(promoted.error));
    }

    // Ensure the owner has an org-scoped username, as onboarding gives them
    const orgSlug = await getUserOrgSlug({
      userId: user.id,
      organizationId: existing.id,
    });
    if (orgSlug.success && !orgSlug.data) {
      const username = await generateUniqueSlug(
        orgUsernameFromEmail(user.email) ?? "user",
        "ORGANIZATION",
        existing.id,
      );
      if (username.success) {
        await createUserOrgSlug({
          userId: user.id,
          organizationId: existing.id,
          slug: username.data,
        });
      }
    }

    return handleSuccess({
      organizationId: existing.id,
      slug: existing.slug?.slug ?? "",
      createdOrganization: false,
      ownerAction: plan.ownerAction,
    });
  } catch (e) {
    return handleError(e);
  }
}
