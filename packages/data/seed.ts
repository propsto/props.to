import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { bootstrapTemplates } from "./bootstrap";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Use deterministic UUIDs for seeded entities to ensure consistency across builds.
// Only the app Vercel build seeds previews (PREVIEW_SEED=1), but every reseed
// must keep user IDs stable so existing sessions stay valid.
const SEED_IDS = {
  // Users
  mike: "00000000-0000-0000-0000-000000000001",
  bob: "00000000-0000-0000-0000-000000000002",
  john: "00000000-0000-0000-0000-000000000003",
  jane: "00000000-0000-0000-0000-000000000004",
  carol: "00000000-0000-0000-0000-000000000005",
  rita: "00000000-0000-0000-0000-000000000006",
  // Organizations
  acme: "00000000-0000-0000-0000-000000000010",
  globex: "00000000-0000-0000-0000-000000000011",
  // Group
  marketing: "00000000-0000-0000-0000-000000000020",
  // Integration (BigInt - use numeric strings)
  instagram: BigInt(50),
  // Uri (BigInt - use numeric strings)
  mikeInstagram: BigInt(60),
};

async function main() {
  // Clean up existing data in reverse dependency order
  await prisma.emailOutbox.deleteMany();
  await prisma.organizationInvite.deleteMany(); // invitedBy is RESTRICT, so before users
  await prisma.uriClaim.deleteMany();
  await prisma.uri.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.feedbackValue.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.feedbackLink.deleteMany();
  await prisma.feedbackRequest.deleteMany();
  await prisma.templateField.deleteMany();
  await prisma.groupAdmin.deleteMany();
  await prisma.group.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.feedbackTemplate.deleteMany();
  await prisma.templateCategory.deleteMany();
  await prisma.orgValue.deleteMany();
  await prisma.orgLevel.deleteMany();
  await prisma.slug.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log("Cleared existing seed data.");

  // Create root user (Mike Ryan) - personal account with GLOBAL scope slug
  const mike = await prisma.user.create({
    data: {
      id: SEED_IDS.mike,
      email: "mike.ryan@example.com",
      firstName: "Mike",
      lastName: "Ryan",
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
      image: "https://avatars.githubusercontent.com/u/1?v=4",
      dateOfBirth: new Date("1985-11-03"),
      password: await hash("P4ssw0rd", 10),
      onboardingCompletedAt: new Date(), // Mark as onboarding completed for E2E tests
      slug: {
        create: {
          slug: "mikeryan",
          scope: "GLOBAL",
          scopedToOrgId: null,
        },
      },
    },
  });

  // Create Mike's privacy settings (public profile for E2E testing)
  await prisma.userPrivacySettings.create({
    data: {
      userId: mike.id,
      profileVisibility: "PUBLIC",
      allowFeedbackFromAnyone: true,
      showEmailInProfile: false,
    },
  });

  // Create Organization (Acme Inc.) with GLOBAL scope slug
  const acme = await prisma.organization.create({
    data: {
      id: SEED_IDS.acme,
      name: "Acme Inc.",
      hostedDomain: "acme.com",
      slug: {
        create: {
          slug: "acme",
          scope: "GLOBAL",
          scopedToOrgId: null,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Add Mike as OWNER of the organization (for E2E testing)
  await prisma.organizationMember.create({
    data: {
      user: { connect: { id: mike.id } },
      organization: { connect: { id: acme.id } },
      role: "OWNER",
      joinedAt: new Date(),
    },
  });

  // Create Org Admin (Bob Jones) - org user with ORGANIZATION scope slug
  const bob = await prisma.user.create({
    data: {
      id: SEED_IDS.bob,
      email: "bob.jones@acme.com",
      password: await hash("P4ssw0rd", 10),
      firstName: "Bob",
      lastName: "Jones",
      role: "USER",
      hostedDomain: "acme.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: { create: { slug: "bobjones", scope: "GLOBAL" } },
    },
  });

  // Add Bob as ADMIN of the organization
  await prisma.organizationMember.create({
    data: {
      user: { connect: { id: bob.id } },
      organization: { connect: { id: acme.id } },
      role: "ADMIN",
      joinedAt: new Date(),
    },
  });

  // Create Org User 1 (John Doe) - org user with ORGANIZATION scope slug
  const john = await prisma.user.create({
    data: {
      id: SEED_IDS.john,
      email: "john.doe@acme.com",
      password: await hash("P4ssw0rd", 10),
      firstName: "John",
      lastName: "Doe",
      role: "USER",
      hostedDomain: "acme.com",
      dateOfBirth: new Date("1990-01-15"),
      personalEmail: "john.personal@example.com",
      personalEmailVerified: new Date(),
      onboardingCompletedAt: new Date(), // dual-member user signs in directly in E2E
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: { create: { slug: "johndoe", scope: "GLOBAL" } },
    },
  });

  // Add John as MEMBER of the organization
  await prisma.organizationMember.create({
    data: {
      user: { connect: { id: john.id } },
      organization: { connect: { id: acme.id } },
      role: "MEMBER",
      joinedAt: new Date(),
    },
  });

  // Create Org User 2 (Jane Smith) - org user with ORGANIZATION scope slug
  const jane = await prisma.user.create({
    data: {
      id: SEED_IDS.jane,
      email: "jane.smith@acme.com",
      password: await hash("P4ssw0rd", 10),
      firstName: "Jane",
      lastName: "Smith",
      role: "USER",
      hostedDomain: "acme.com",
      dateOfBirth: new Date("1991-06-20"),
      personalEmail: "jane.personal@example.com",
      personalEmailVerified: new Date(),
      onboardingCompletedAt: new Date(), // conversation subject signs in directly in E2E
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: { create: { slug: "janesmith", scope: "GLOBAL" } },
    },
  });

  // Add Jane as MEMBER of the organization
  await prisma.organizationMember.create({
    data: {
      user: { connect: { id: jane.id } },
      organization: { connect: { id: acme.id } },
      role: "MEMBER",
      joinedAt: new Date(),
    },
  });

  // Acme MEMBER the member-management E2E removes: org-scoped slug "rita.stone"
  // (so /acme/rita.stone/... resolves) and the org link "Rita at Acme"
  const rita = await prisma.user.create({
    data: {
      id: SEED_IDS.rita,
      email: "rita.stone@acme.com",
      password: await hash("P4ssw0rd", 10),
      firstName: "Rita",
      lastName: "Stone",
      role: "USER",
      hostedDomain: "acme.com",
      dateOfBirth: new Date("1992-03-10"),
      personalEmail: "rita.personal@example.com",
      personalEmailVerified: new Date(),
      onboardingCompletedAt: new Date(),
      slug: { create: { slug: "ritastone", scope: "GLOBAL" } },
    },
  });
  await prisma.slug.create({
    data: {
      slug: "rita.stone",
      scope: "ORGANIZATION",
      scopedToOrgId: acme.id,
      orgSlugOwnerId: rita.id,
    },
  });
  await prisma.organizationMember.create({
    data: {
      user: { connect: { id: rita.id } },
      organization: { connect: { id: acme.id } },
      role: "MEMBER",
    },
  });

  // Second organization (Globex) for tenant-isolation tests.
  // Carol owns it; John is ADMIN here and MEMBER of Acme (dual membership).
  const globex = await prisma.organization.create({
    data: {
      id: SEED_IDS.globex,
      name: "Globex Corp.",
      hostedDomain: "globex.com",
      slug: {
        create: { slug: "globex", scope: "GLOBAL", scopedToOrgId: null },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const carol = await prisma.user.create({
    data: {
      id: SEED_IDS.carol,
      email: "carol.white@globex.com",
      password: await hash("P4ssw0rd", 10),
      firstName: "Carol",
      lastName: "White",
      role: "USER",
      hostedDomain: "globex.com",
      dateOfBirth: new Date("1988-06-20"),
      personalEmail: "carol.personal@example.com",
      personalEmailVerified: new Date(),
      onboardingCompletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: { create: { slug: "carolwhite", scope: "GLOBAL" } },
    },
  });

  await prisma.organizationMember.create({
    data: {
      user: { connect: { id: carol.id } },
      organization: { connect: { id: globex.id } },
      role: "OWNER",
      joinedAt: new Date(),
    },
  });

  // Org-scoped slugs must be owned via orgSlugOwnerId, or /<org>/<user>/... never resolves
  await prisma.slug.createMany({
    data: [
      { slug: "bob.jones", scopedToOrgId: acme.id, orgSlugOwnerId: bob.id },
      { slug: "john.doe", scopedToOrgId: acme.id, orgSlugOwnerId: john.id },
      { slug: "jane.smith", scopedToOrgId: acme.id, orgSlugOwnerId: jane.id },
      {
        slug: "carol.white",
        scopedToOrgId: globex.id,
        orgSlugOwnerId: carol.id,
      },
    ].map(s => ({ ...s, scope: "ORGANIZATION" as const })),
  });

  await prisma.slug.create({
    data: {
      slug: "john.doe",
      scope: "ORGANIZATION",
      scopedToOrgId: globex.id,
      orgSlugOwnerId: john.id,
    },
  });
  await prisma.organizationMember.create({
    data: {
      user: { connect: { id: john.id } },
      organization: { connect: { id: globex.id } },
      role: "ADMIN",
      joinedAt: new Date(),
    },
  });

  // Create Marketing Group with ORGANIZATION scope slug
  const marketingGroup = await prisma.group.create({
    data: {
      id: SEED_IDS.marketing,
      name: "Marketing",
      organization: { connect: { id: acme.id } },
      slug: {
        create: {
          slug: "marketing",
          scope: "ORGANIZATION",
          scopedToOrgId: acme.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Assign John as admin to Marketing Group
  await prisma.groupAdmin.create({
    data: {
      user: { connect: { id: john.id } },
      group: { connect: { id: marketingGroup.id } },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Assign Jane to Marketing Group as user
  await prisma.group.update({
    where: {
      id: marketingGroup.id,
    },
    data: {
      users: {
        connect: { id: jane.id },
      },
    },
  });

  // Acme demo values (the values layer exists for an org when it has rows)
  await prisma.orgValue.createMany({
    data: [
      {
        name: "Ownership",
        description: "Takes responsibility for outcomes, not just tasks",
      },
      {
        name: "Candor",
        description: "Says what they think, kindly and directly",
      },
      {
        name: "Craft",
        description: "Cares about the quality of the work",
      },
    ].map((value, order) => ({ ...value, order, organizationId: acme.id })),
  });

  // Acme demo levels (the levels layer exists for an org when it has rows)
  await prisma.orgLevel.createMany({
    data: [
      { name: "Associate", summary: "Delivers well-scoped work with guidance" },
      {
        name: "Senior",
        summary: "Owns problems end to end and unblocks others",
        rubric: [
          {
            title: "Scope",
            body: "Leads a project from problem to launch without hand-holding",
          },
          {
            title: "Collaboration",
            body: "Reviews others' work and shares context before it is asked for",
          },
        ],
      },
      {
        name: "Lead",
        summary: "Sets direction and grows the people around them",
      },
    ].map((level, order) => ({ ...level, order, organizationId: acme.id })),
  });

  // What Candor looks like at Senior, shown beside the form for John
  const seniorLevel = await prisma.orgLevel.findUniqueOrThrow({
    where: {
      organizationId_name: { organizationId: acme.id, name: "Senior" },
    },
  });
  const candorValue = await prisma.orgValue.findFirstOrThrow({
    where: { organizationId: acme.id, name: "Candor" },
  });
  await prisma.orgLevelValueExpectation.create({
    data: {
      levelId: seniorLevel.id,
      valueId: candorValue.id,
      text: "Raises risks in the open before they become surprises",
    },
  });

  // John is the one Acme member with a level assigned
  await prisma.organizationMember.update({
    where: {
      userId_organizationId: { userId: john.id, organizationId: acme.id },
    },
    data: {
      level: {
        connect: {
          organizationId_name: { organizationId: acme.id, name: "Senior" },
        },
      },
    },
  });

  // Global categories and default templates come from the shared bootstrap
  const { propsTemplate, threeSixtyTemplate } =
    await bootstrapTemplates(prisma);

  // Associate Templates to Root User (Mike Ryan)
  await prisma.user.update({
    where: {
      id: mike.id,
    },
    data: {
      templates: {
        connect: [{ id: propsTemplate }, { id: threeSixtyTemplate }],
      },
    },
  });

  // Create sample feedback links for Mike
  await prisma.feedbackLink.create({
    data: {
      name: "Give me Props",
      slug: "mike-props",
      userId: mike.id,
      templateId: propsTemplate,
      feedbackType: "RECOGNITION",
      visibility: "PRIVATE",
      isActive: true,
    },
  });

  // Create a hidden feedback link for Mike (for testing hidden links feature)
  await prisma.feedbackLink.create({
    data: {
      name: "Private 1:1 Feedback",
      slug: "mike-hidden",
      userId: mike.id,
      templateId: propsTemplate,
      feedbackType: "THREE_SIXTY",
      visibility: "PRIVATE",
      isActive: true,
      isHidden: true,
    },
  });

  // Org-scoped links: one per org, used by the tenant-isolation E2E
  const johnAcmeLink = await prisma.feedbackLink.create({
    data: {
      name: "John at Acme",
      slug: "john-acme",
      userId: john.id,
      organizationId: acme.id,
      templateId: propsTemplate,
      isActive: true,
    },
  });
  await prisma.feedbackLink.create({
    data: {
      name: "Rita at Acme",
      slug: "rita-acme",
      userId: rita.id,
      organizationId: acme.id,
      templateId: propsTemplate,
      isActive: true,
    },
  });
  await prisma.feedbackLink.create({
    data: {
      name: "Carol at Globex",
      slug: "carol-globex",
      userId: carol.id,
      organizationId: globex.id,
      templateId: propsTemplate,
      isActive: true,
    },
  });

  // Pending org submissions to John, held for moderation (moderation E2E
  // approves one and rejects the other as Mike, the Acme owner)
  await prisma.feedback.createMany({
    data: ["approve", "reject"].map(kind => ({
      userId: john.id,
      submitterId: jane.id,
      submitterEmail: jane.email!,
      organizationId: acme.id,
      linkId: johnAcmeLink.id,
      feedbackType: "RECOGNITION" as const,
      visibility: "PRIVATE" as const,
      status: "PENDING_MODERATION" as const,
      templateId: propsTemplate,
      fieldsData: {
        "What do you appreciate about this person?": `Pending feedback to ${kind}`,
      },
    })),
  });

  // Create sample feedback for Mike from Jane
  await prisma.feedback.create({
    data: {
      userId: mike.id,
      submitterId: jane.id,
      submitterEmail: jane.email!,
      feedbackType: "RECOGNITION",
      visibility: "PRIVATE",
      status: "APPROVED",
      templateId: propsTemplate,
      fieldsData: {
        "What do you appreciate about this person?":
          "Mike always goes above and beyond to help the team succeed. His technical expertise is invaluable!",
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  // Create sample feedback for Mike from John
  await prisma.feedback.create({
    data: {
      userId: mike.id,
      submitterId: john.id,
      submitterEmail: john.email!,
      feedbackType: "RECOGNITION",
      visibility: "PRIVATE",
      status: "APPROVED",
      templateId: propsTemplate,
      fieldsData: {
        "What do you appreciate about this person?":
          "Great collaboration on the marketing project. Really appreciated the quick turnaround on deliverables.",
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });

  // Acme feedback to Mike tagged with a value (values layer E2E filters by it)
  const candor = await prisma.orgValue.findFirstOrThrow({
    where: { organizationId: acme.id, name: "Candor" },
  });
  await prisma.feedback.create({
    data: {
      userId: mike.id,
      submitterId: john.id,
      submitterEmail: john.email!,
      organizationId: acme.id,
      feedbackType: "RECOGNITION",
      visibility: "PRIVATE",
      status: "APPROVED",
      templateId: propsTemplate,
      fieldsData: {
        "What do you appreciate about this person?":
          "Told us early that the launch plan would slip, with a fix ready.",
      },
      values: { create: { valueId: candor.id } },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  });

  // Older feedback and audit entries so the received list and the audit log
  // have more than one page (page size 20)
  await prisma.feedback.createMany({
    data: Array.from({ length: 22 }, (_, i) => ({
      userId: mike.id,
      submitterId: jane.id,
      submitterEmail: jane.email!,
      feedbackType: "RECOGNITION" as const,
      visibility: "PRIVATE" as const,
      status: "APPROVED" as const,
      templateId: propsTemplate,
      fieldsData: {
        "What do you appreciate about this person?": `Older seeded feedback #${i + 1}`,
      },
      createdAt: new Date(Date.now() - (10 + i) * 24 * 60 * 60 * 1000),
    })),
  });
  await prisma.auditLog.createMany({
    data: Array.from({ length: 25 }, (_, i) => ({
      organizationId: acme.id,
      actorId: mike.id,
      action: "SETTINGS_UPDATED" as const,
      resourceType: "settings",
      createdAt: new Date(Date.now() - (10 + i) * 24 * 60 * 60 * 1000),
    })),
  });

  // Create a goal for Mike
  await prisma.goal.create({
    data: {
      userId: mike.id,
      title: "Improve public speaking skills",
      description: "Get better at presenting to large audiences",
      status: "IN_PROGRESS",
      progress: 30,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
  });

  const mikeInstagramUri = await prisma.uri.create({
    data: {
      id: SEED_IDS.mikeInstagram,
      uri: "https://instagram.com/mike.ryan",
      user: { connect: { id: mike.id } },
    },
  });

  // Create UriClaim for Mike Ryan
  await prisma.uriClaim.create({
    data: {
      user: { connect: { id: mike.id } },
      uri: { connect: { id: mikeInstagramUri.id } },
      claimedAt: new Date(),
    },
  });

  // Create Integration and Uri for Mike Ryan (Instagram) with GLOBAL scope
  await prisma.integration.create({
    data: {
      id: SEED_IDS.instagram,
      hostname: "instagram.com",
      uris: {
        connect: {
          id: mikeInstagramUri.id,
        },
      },
      slug: {
        create: {
          slug: "instagram",
          scope: "GLOBAL",
          scopedToOrgId: null,
        },
      },
    },
  });

  console.log("Seed script completed successfully!");
}

main()
  .catch(e => {
    console.error("Error seeding data:", e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
