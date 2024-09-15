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
      username: "test",
      email: "test1@props.to",
      image: "https://avatars.githubusercontent.com/u/1?v=4",
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
