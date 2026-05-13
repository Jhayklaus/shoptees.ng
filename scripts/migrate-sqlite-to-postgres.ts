// One-off: copy rows from prisma/dev.db.bak (SQLite) into Supabase (Postgres).
// Run AFTER `prisma db push` against the Postgres target. Idempotent via skipDuplicates.
//
//   npx tsx scripts/migrate-sqlite-to-postgres.ts
//
// Requires Node 22+ for `node:sqlite`.

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const SQLITE_PATH = path.resolve(process.cwd(), "prisma/dev.db.bak");

const sqlite = new DatabaseSync(SQLITE_PATH, { readOnly: true });
const prisma = new PrismaClient();

type Row = Record<string, unknown>;

function readAll(table: string): Row[] {
  return sqlite.prepare(`SELECT * FROM "${table}"`).all() as Row[];
}

// Prisma's SQLite connector stores DateTime as ISO-8601 TEXT. Convert to Date
// so Postgres receives a proper timestamp.
function toDate(v: unknown): Date | null {
  if (v == null) return null;
  if (v instanceof Date) return v;
  if (typeof v === "number") return new Date(v);
  return new Date(String(v));
}

function mapDates<T extends Row>(row: T, fields: (keyof T)[]): T {
  const out = { ...row };
  for (const f of fields) {
    if (out[f] != null) (out as Row)[f as string] = toDate(out[f]) as unknown;
  }
  return out;
}

async function copy<T extends Row>(
  label: string,
  rows: T[],
  insert: (data: T[]) => Promise<{ count: number }>,
) {
  if (rows.length === 0) {
    console.log(`  ${label.padEnd(14)} — 0 rows (skipped)`);
    return;
  }
  const { count } = await insert(rows);
  console.log(`  ${label.padEnd(14)} — ${count}/${rows.length} inserted`);
}

async function main() {
  console.log(`Source : ${SQLITE_PATH}`);
  console.log(`Target : Postgres (via DATABASE_URL)\n`);

  // Order respects foreign keys.
  await copy("AdminUser", readAll("AdminUser"), (data) =>
    prisma.adminUser.createMany({
      data: data.map((r) => mapDates(r, ["createdAt"])) as never,
      skipDuplicates: true,
    }),
  );

  await copy("Category", readAll("Category"), (data) =>
    prisma.category.createMany({
      data: data.map((r) => mapDates(r, ["createdAt"])) as never,
      skipDuplicates: true,
    }),
  );

  await copy("Product", readAll("Product"), (data) =>
    prisma.product.createMany({
      data: data.map((r) => mapDates(r, ["createdAt", "updatedAt"])) as never,
      skipDuplicates: true,
    }),
  );

  await copy("Variant", readAll("Variant"), (data) =>
    prisma.variant.createMany({
      data: data.map((r) => mapDates(r, ["createdAt"])) as never,
      skipDuplicates: true,
    }),
  );

  await copy("ProductImage", readAll("ProductImage"), (data) =>
    prisma.productImage.createMany({ data: data as never, skipDuplicates: true }),
  );

  await copy("Customer", readAll("Customer"), (data) =>
    prisma.customer.createMany({
      data: data.map((r) => mapDates(r, ["createdAt"])) as never,
      skipDuplicates: true,
    }),
  );

  await copy("Address", readAll("Address"), (data) =>
    prisma.address.createMany({
      data: data.map((r) => mapDates(r, ["createdAt"])) as never,
      skipDuplicates: true,
    }),
  );

  await copy("Order", readAll("Order"), (data) =>
    prisma.order.createMany({
      data: data.map((r) => mapDates(r, ["createdAt", "updatedAt"])) as never,
      skipDuplicates: true,
    }),
  );

  await copy("OrderItem", readAll("OrderItem"), (data) =>
    prisma.orderItem.createMany({ data: data as never, skipDuplicates: true }),
  );

  await copy("Session", readAll("Session"), (data) =>
    prisma.session.createMany({
      data: data.map((r) => mapDates(r, ["expiresAt", "createdAt"])) as never,
      skipDuplicates: true,
    }),
  );

  await copy("SiteSetting", readAll("SiteSetting"), (data) =>
    prisma.siteSetting.createMany({ data: data as never, skipDuplicates: true }),
  );

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    sqlite.close();
    await prisma.$disconnect();
  });
