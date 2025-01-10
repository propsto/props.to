import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create root user (Mike Ryan)
  const mikeSlug = await prisma.slug.create({
    data: {
      slug: "mikeryan",
    },
  });

  const mike = await prisma.user.create({
    data: {
      email: "mike.ryan@gmail.com",
      firstName: "Mike",
      lastName: "Ryan",
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
      image: "https://avatars.githubusercontent.com/u/1?v=4",
      slugId: mikeSlug.id, // Connect slug to user
    },
  });

  // Create Organization (Acme Inc.)
  const acmeSlug = await prisma.slug.create({
    data: {
      slug: "acme",
    },
  });

  const acme = await prisma.organization.create({
    data: {
      name: "Acme Inc.",
      slugId: acmeSlug.id, // Connect slug to organization
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create Org Admin (Bob Jones)
  const bobSlug = await prisma.slug.create({
    data: {
      slug: "bob.jones",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob.jones@acme.com",
      firstName: "Bob",
      lastName: "Jones",
      role: "ORGANIZATION_ADMIN",
      organizationId: acme.id, // Connect to organization
      createdAt: new Date(),
      updatedAt: new Date(),
      slugId: bobSlug.id, // Connect slug to user
    },
  });

  // Create Org User 1 (John Doe)
  const johnSlug = await prisma.slug.create({
    data: {
      slug: "john.doe",
    },
  });

  const john = await prisma.user.create({
    data: {
      email: "john.doe@acme.com",
      firstName: "John",
      lastName: "Doe",
      role: "USER",
      organizationId: acme.id, // Connect to organization
      createdAt: new Date(),
      updatedAt: new Date(),
      slugId: johnSlug.id, // Connect slug to user
    },
  });

  // Create Org User 2 (Jane Smith)
  const janeSlug = await prisma.slug.create({
    data: {
      slug: "jane.smith",
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: "jane.smith@acme.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "USER",
      organizationId: acme.id, // Connect to organization
      createdAt: new Date(),
      updatedAt: new Date(),
      slugId: janeSlug.id, // Connect slug to user
    },
  });

  // Create Marketing Group with its slug, admins and users
  const marketingSlug = await prisma.slug.create({
    data: {
      slug: "marketing",
    },
  });

  const marketingGroup = await prisma.group.create({
    data: {
      name: "Marketing",
      organizationId: acme.id, // Connect to organization
      slugId: marketingSlug.id, // Connect slug to group
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Assign John as admin to Marketing Group
  await prisma.groupAdmin.create({
    data: {
      userId: john.id,
      groupId: marketingGroup.id, // Connect group
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
      userId: mike.id,
    },
  });

  // Create UriClaim for Mike Ryan
  await prisma.uriClaim.create({
    data: {
      userId: mike.id,
      uriId: mikeInstagramUri.id,
      claimedAt: new Date(),
    },
  });

  // Create Integration and Uri for Mike Ryan (Instagram)
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
