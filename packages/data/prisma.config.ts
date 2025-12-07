import { defineConfig } from "prisma/config";
import { constServer } from "@propsto/constants/server";

export default defineConfig({
  schema: "./schema.prisma",
  datasource: {
    url: constServer.DATABASE_URL,
  },
  migrations: {
    seed: "tsx ./seed.ts",
  },
});
