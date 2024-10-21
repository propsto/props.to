import { PrismaClient, Prisma } from "@prisma/client";
import { constServer } from "@propsto/constants/server";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma as db, Prisma, PrismaClient };

if (constServer.PROPSTO_ENV !== "production") globalThis.prismaGlobal = prisma;
