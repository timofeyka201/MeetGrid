// Prisma config для production (Railway/PostgreSQL)
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prod.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
