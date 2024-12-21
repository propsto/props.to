import { PrismaClient, Prisma } from "@prisma/client";
import { constServer } from "@propsto/constants/server";

const prismaClientSingleton = () => {
  return new PrismaClient() /*.$extends({
    result: {
      user: {
        name: {
          needs: { firstName: true, lastName: true },
          compute(user) {
            if (!user.firstName || !user.lastName) return null;
            return `${user.firstName} ${user.lastName}`;
          },
        },
        needsOnboarding: {
          needs: {
            firstName: true,
            lastName: true,
            image: true,
            dateOfBirth: true,
          },
          compute(user) {
            return Boolean(
              user.firstName && user.lastName && user.image && user.dateOfBirth,
            );
          },
        },
      },
    },
  })*/;
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma as db, Prisma, PrismaClient };

if (constServer.PROPSTO_ENV !== "production") globalThis.prismaGlobal = prisma;
