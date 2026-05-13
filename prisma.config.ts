// Prisma CLI config. Runs before schema.prisma is parsed, so we use it to
// route DATABASE_URL / DIRECT_URL based on NEXT_PUBLIC_APP_ENVIRONMENT.
//
// Prisma 6+ does NOT auto-load .env when a prisma.config.ts is present, so
// we load it explicitly here before resolving.

import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";
import { resolveDatabaseUrls } from "./src/config/env";

const { databaseUrl, directUrl } = resolveDatabaseUrls();
process.env.DATABASE_URL = databaseUrl;
process.env.DIRECT_URL = directUrl;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
