// Prisma config для локальной разработки (SQLite)
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.dev.prisma",
  migrations: {
    path: "prisma/migrations-dev",
  },
  datasource: {
    url: "file:prisma/dev.db",
  },
});
