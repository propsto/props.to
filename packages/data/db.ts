import { PrismaClient, Prisma } from "@prisma/client";
import { constServer } from "@propsto/constants";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma as db, Prisma };

if (constServer.PROPSTO_ENV !== "production") globalThis.prismaGlobal = prisma;

export interface DbSuccess {
  success: true;
  data: any;
  error: null;
}

export interface DbError {
  success: false;
  data: null;
  error: string;
}

export type DbResult = DbSuccess | DbError;
