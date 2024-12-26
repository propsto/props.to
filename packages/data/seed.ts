import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: {
      email: "test@props.to",
    },
    create: {
      firstName: "Test",
      lastName: "Account 1",
      username: "test-324jn2j3n42j-l2j3n46n56l7567n-0sfv9dfvnfvjn-qwen5n234j",
      email: "test1@props.to",
      image: "https://avatars.githubusercontent.com/u/1?v=4",
      dateOfBirth: new Date(),
    },
    update: {},
  });
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
