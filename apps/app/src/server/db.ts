/* eslint-disable @typescript-eslint/no-unnecessary-condition -- globalForPrisma.prisma is not always truthy */
import { PrismaClient, withAccelerate } from "@propsto/prisma";
import { env } from "@/env.mjs";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends(withAccelerate());

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
