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
  await prisma.goal.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.feedbackLink.deleteMany();
  await prisma.feedbackRequest.deleteMany();
  await prisma.templateField.deleteMany();
  await prisma.groupAdmin.deleteMany();
  await prisma.group.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.feedbackTemplate.deleteMany();
  await prisma.templateCategory.deleteMany();
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

  // Create Template Categories
  const recognitionCategory = await prisma.templateCategory.create({
    data: {
      name: "Recognition",
      description: "Templates for giving recognition and props",
      icon: "trophy",
    },
  });

  const reviewCategory = await prisma.templateCategory.create({
    data: {
      name: "Performance Reviews",
      description: "Templates for structured feedback and reviews",
      icon: "clipboard",
    },
  });

  // Create Default Templates

  // 1. Simple Props / Recognition Template
  const propsTemplate = await prisma.feedbackTemplate.create({
    data: {
      name: "Quick Props",
      description: "A simple template for giving quick recognition and props.",
      feedbackType: "RECOGNITION",
      isPublic: true,
      isDefault: true,
      categoryId: recognitionCategory.id,
      fields: {
        create: [
          {
            label: "What do you appreciate about this person?",
            type: "TEXTAREA",
            required: true,
            placeholder: "Share what they did well...",
            helpText: "Be specific about their actions and impact",
            order: 0,
          },
          {
            label: "What values did they demonstrate?",
            type: "SELECT",
            required: false,
            options: [
              "Collaboration",
              "Innovation",
              "Leadership",
              "Integrity",
              "Excellence",
              "Customer Focus",
            ],
            helpText: "Select the value that best fits",
            order: 1,
          },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 2. 360° Feedback Template
  const threeSixtyTemplate = await prisma.feedbackTemplate.create({
    data: {
      name: "360° Feedback",
      description:
        "Comprehensive feedback template for all-around performance insights.",
      feedbackType: "THREE_SIXTY",
      isPublic: true,
      isDefault: true,
      categoryId: reviewCategory.id,
      fields: {
        create: [
          {
            label: "How would you rate their overall performance?",
            type: "RATING",
            required: true,
            helpText: "1 = Needs Improvement, 5 = Exceptional",
            order: 0,
          },
          {
            label: "What are their key strengths?",
            type: "TEXTAREA",
            required: true,
            placeholder: "Describe their strongest areas...",
            order: 1,
          },
          {
            label: "What areas could they improve?",
            type: "TEXTAREA",
            required: true,
            placeholder: "Provide constructive feedback...",
            order: 2,
          },
          {
            label: "How well do they communicate?",
            type: "SCALE",
            required: true,
            helpText: "1 = Poor, 10 = Excellent",
            order: 3,
          },
          {
            label: "How well do they collaborate with others?",
            type: "SCALE",
            required: true,
            helpText: "1 = Poor, 10 = Excellent",
            order: 4,
          },
          {
            label: "Any additional comments?",
            type: "TEXTAREA",
            required: false,
            placeholder: "Share any other thoughts...",
            order: 5,
          },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 3. Anonymous Feedback Template
  const anonymousTemplate = await prisma.feedbackTemplate.create({
    data: {
      name: "Anonymous Feedback",
      description: "Share honest feedback anonymously.",
      feedbackType: "ANONYMOUS",
      isPublic: true,
      isDefault: true,
      categoryId: reviewCategory.id,
      fields: {
        create: [
          {
            label: "What feedback would you like to share?",
            type: "TEXTAREA",
            required: true,
            placeholder: "Your identity will remain anonymous...",
            order: 0,
          },
          {
            label: "Category",
            type: "SELECT",
            required: true,
            options: [
              "Work Quality",
              "Communication",
              "Leadership",
              "Teamwork",
              "Other",
            ],
            order: 1,
          },
          {
            label: "How important is this feedback?",
            type: "RADIO",
            required: true,
            options: ["Critical", "High", "Medium", "Low"],
            order: 2,
          },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 4. Leadership Feedback Template
  const leadershipTemplate = await prisma.feedbackTemplate.create({
    data: {
      name: "Leadership Feedback",
      description: "Provide feedback on leadership effectiveness.",
      feedbackType: "MANAGER_FEEDBACK",
      isPublic: true,
      isDefault: true,
      categoryId: reviewCategory.id,
      fields: {
        create: [
          {
            label: "How would you rate their leadership?",
            type: "RATING",
            required: true,
            helpText: "1 = Needs Improvement, 5 = Exceptional",
            order: 0,
          },
          {
            label: "Do they provide clear direction?",
            type: "SCALE",
            required: true,
            helpText: "1 = Never, 10 = Always",
            order: 1,
          },
          {
            label: "Do they support your professional growth?",
            type: "SCALE",
            required: true,
            helpText: "1 = Never, 10 = Always",
            order: 2,
          },
          {
            label: "What do they do well as a leader?",
            type: "TEXTAREA",
            required: true,
            placeholder: "Share specific examples...",
            order: 3,
          },
          {
            label: "How could they improve as a leader?",
            type: "TEXTAREA",
            required: true,
            placeholder: "Provide constructive suggestions...",
            order: 4,
          },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 5. Peer Review Template
  const peerReviewTemplate = await prisma.feedbackTemplate.create({
    data: {
      name: "Peer Review",
      description: "Template for peer-to-peer feedback.",
      feedbackType: "PEER_REVIEW",
      isPublic: true,
      isDefault: true,
      categoryId: reviewCategory.id,
      fields: {
        create: [
          {
            label: "How was it working with this person?",
            type: "TEXTAREA",
            required: true,
            placeholder: "Describe your collaboration experience...",
            order: 0,
          },
          {
            label: "Would you want to work with them again?",
            type: "RADIO",
            required: true,
            options: ["Definitely", "Probably", "Maybe", "Probably Not"],
            order: 1,
          },
          {
            label: "Overall rating of collaboration",
            type: "RATING",
            required: true,
            helpText: "1 = Difficult, 5 = Excellent",
            order: 2,
          },
          {
            label: "Any specific feedback?",
            type: "TEXTAREA",
            required: false,
            placeholder: "Additional thoughts...",
            order: 3,
          },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Associate Templates to Root User (Mike Ryan)
  await prisma.user.update({
    where: {
      id: mike.id,
    },
    data: {
      templates: {
        connect: [{ id: propsTemplate.id }, { id: threeSixtyTemplate.id }],
      },
    },
  });

  // Create sample feedback links for Mike
  await prisma.feedbackLink.create({
    data: {
      name: "Give me Props",
      slug: "mike-props",
      userId: mike.id,
      templateId: propsTemplate.id,
      feedbackType: "RECOGNITION",
      visibility: "PRIVATE",
      isActive: true,
    },
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
      templateId: propsTemplate.id,
      fieldsData: {
        "What do you appreciate about this person?":
          "Mike always goes above and beyond to help the team succeed. His technical expertise is invaluable!",
        "What values did they demonstrate?": "Excellence",
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
      templateId: propsTemplate.id,
      fieldsData: {
        "What do you appreciate about this person?":
          "Great collaboration on the marketing project. Really appreciated the quick turnaround on deliverables.",
        "What values did they demonstrate?": "Collaboration",
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
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
