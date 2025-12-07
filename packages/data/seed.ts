import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create root user (Mike Ryan)
  const mike = await prisma.user.create({
    data: {
      email: "mike.ryan@gmail.com",
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
        },
      },
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
      slug: { connect: { id: acmeSlug.id } },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create Org Admin (Bob Jones)
  await prisma.user.create({
    data: {
      email: "bob.jones@acme.com",
      firstName: "Bob",
      lastName: "Jones",
      role: "ORGANIZATION_ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: {
        create: {
          slug: "bob.jones",
        },
      },
      organization: {
        connect: { id: acme.id },
      },
    },
  });

  // Create Org User 1 (John Doe)
  const john = await prisma.user.create({
    data: {
      email: "john.doe@acme.com",
      firstName: "John",
      lastName: "Doe",
      role: "USER",
      organization: { connect: { id: acme.id } },
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: {
        create: {
          slug: "john.doe",
        },
      },
    },
  });

  // Create Org User 2 (Jane Smith)
  const jane = await prisma.user.create({
    data: {
      email: "jane.smith@acme.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "USER",
      organization: { connect: { id: acme.id } },
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: {
        create: {
          slug: "jane.smith",
        },
      },
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
      organization: { connect: { id: acme.id } },
      slug: { connect: { id: marketingSlug.id } },
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
