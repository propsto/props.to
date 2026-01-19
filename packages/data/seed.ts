import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean up existing data in reverse dependency order
  await prisma.uriClaim.deleteMany();
  await prisma.uri.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.groupAdmin.deleteMany();
  await prisma.group.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.feedbackTemplate.deleteMany();
  await prisma.slug.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log("Cleared existing seed data.");

  // Create root user (Mike Ryan) - personal account with GLOBAL scope slug
  const mike = await prisma.user.create({
    data: {
      email: "mike.ryan@example.com",
      firstName: "Mike",
      lastName: "Ryan",
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
      image: "https://avatars.githubusercontent.com/u/1?v=4",
      dateOfBirth: new Date("1985-11-03"),
      password: await hash("P4ssw0rd", 10),
      slug: {
        create: {
          slug: "mikeryan",
          scope: "GLOBAL",
          scopedToOrgId: null,
        },
      },
    },
  });

  // Create Organization (Acme Inc.) with GLOBAL scope slug
  const acme = await prisma.organization.create({
    data: {
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

  // Create Org Admin (Bob Jones) - org user with ORGANIZATION scope slug
  const bob = await prisma.user.create({
    data: {
      email: "bob.jones@acme.com",
      firstName: "Bob",
      lastName: "Jones",
      role: "USER",
      hostedDomain: "acme.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: {
        create: {
          slug: "bob.jones",
          scope: "ORGANIZATION",
          scopedToOrgId: acme.id,
        },
      },
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
      email: "john.doe@acme.com",
      firstName: "John",
      lastName: "Doe",
      role: "USER",
      hostedDomain: "acme.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: {
        create: {
          slug: "john.doe",
          scope: "ORGANIZATION",
          scopedToOrgId: acme.id,
        },
      },
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
      email: "jane.smith@acme.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "USER",
      hostedDomain: "acme.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: {
        create: {
          slug: "jane.smith",
          scope: "ORGANIZATION",
          scopedToOrgId: acme.id,
        },
      },
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

  // Create Marketing Group with ORGANIZATION scope slug
  const marketingGroup = await prisma.group.create({
    data: {
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

  // Create Feedback Template (Default)
  const feedbackTemplate = await prisma.feedbackTemplate.create({
    data: {
      name: "Default",
      description: "A default feedback template for users.",
      price: 0,
      filePath: "@propsto/templates/feedback/default",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Associate Template to Root User (Mike Ryan)
  await prisma.user.update({
    where: {
      id: mike.id,
    },
    data: {
      templates: {
        connect: { id: feedbackTemplate.id },
      },
    },
  });

  const mikeInstagramUri = await prisma.uri.create({
    data: {
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
