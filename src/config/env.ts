// Single source of truth for environment-dependent config.
//
// `NEXT_PUBLIC_APP_ENVIRONMENT` selects which Supabase project the app talks to:
//   - "staging"    → STAGING_DATABASE_URL  / STAGING_DIRECT_URL
//   - "production" → PROD_DATABASE_URL     / PROD_DIRECT_URL
//
// Used by:
//   - src/lib/db.ts          (Prisma client at app runtime)
//   - prisma.config.ts       (Prisma CLI: db push, migrate, studio)
//   - prisma/seed.ts + scripts/*.ts (seed scripts via tsx)

export type AppEnvironment = "staging" | "production";

export function resolveAppEnvironment(): AppEnvironment {
  const raw = process.env.NEXT_PUBLIC_APP_ENVIRONMENT;
  if (raw === "production") return "production";
  if (raw === "staging") return "staging";
  throw new Error(
    `NEXT_PUBLIC_APP_ENVIRONMENT must be "staging" or "production" (got: ${JSON.stringify(raw)})`,
  );
}

export function resolveDatabaseUrls(): { databaseUrl: string; directUrl: string } {
  const env = resolveAppEnvironment();
  const databaseUrl =
    env === "production" ? process.env.PROD_DATABASE_URL : process.env.STAGING_DATABASE_URL;
  const directUrl =
    env === "production" ? process.env.PROD_DIRECT_URL : process.env.STAGING_DIRECT_URL;

  if (!databaseUrl || !directUrl) {
    throw new Error(
      `Missing DB connection strings for "${env}". ` +
        `Expected ${env === "production" ? "PROD" : "STAGING"}_DATABASE_URL and *_DIRECT_URL.`,
    );
  }
  return { databaseUrl, directUrl };
}

export const appEnvironment: AppEnvironment = resolveAppEnvironment();
