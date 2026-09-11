// Import the Collection Archive into the catalogue as DRAFTS, from the CLI.
//
//   npx tsx scripts/import-archive.ts            # dry run
//   npx tsx scripts/import-archive.ts --apply
//
// The import itself lives in src/lib/server/import-archive.ts, shared with
// the /admin/import page — production is only reachable from inside the
// deployment, so the same logic has to be runnable both ways.
//
// Artwork is served from public/archive (committed with the repo), so this
// needs no R2 credentials — only the *_DATABASE_URL pair for the target
// environment.

import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { resolveAppEnvironment } from "../src/config/env";
import { ARCHIVE_DESIGNS } from "../src/lib/archive-catalogue";

const APPLY = process.argv.includes("--apply");
const log = (s: string) => console.log(s);

/** Every flat the catalogue names must actually be in public/archive. */
function verifyArtwork() {
  const missing = ARCHIVE_DESIGNS.flatMap((d) =>
    d.colourways
      .map((c) => c.file)
      .filter((f) => !existsSync(path.join(process.cwd(), "public", "archive", f))),
  );
  if (missing.length) {
    missing.forEach((m) => log(`  ! missing public/archive/${m}`));
    throw new Error(`${missing.length} flat(s) missing — refusing to import a partial catalogue.`);
  }
  log(`Artwork check: ${missing.length === 0 ? "all flats present" : ""} in public/archive.`);
}

async function main() {
  verifyArtwork();
  const env = resolveAppEnvironment();
  log(APPLY ? `Importing into ${env.toUpperCase()}…` : `Dry run against ${env.toUpperCase()} — pass --apply to write.`);

  // Imported lazily so the artwork check runs before any DB connection.
  const { importArchive } = await import("../src/lib/server/import-archive");
  const report = await importArchive({ apply: APPLY });

  log(`\nCollections`);
  for (const c of report.collections) {
    log(`  ${c.action === "created" ? "+" : "="} ${c.slug} — ${c.action === "created" ? "created as draft" : `exists (${c.status})`}`);
  }
  log(`\nProducts`);
  for (const p of report.products) {
    const mark = p.action === "created" ? "+" : p.action === "updated" ? "~" : "!";
    log(`  ${mark} ${p.slug} — ${p.colourways} colourway(s), ${p.variants} variant(s)${p.reason ? ` — ${p.reason}` : ""}`);
  }
  log(
    APPLY
      ? "\nDone. Everything is DRAFT — review in /admin, set prices and stock, then publish."
      : "\nNothing written.",
  );
  await new PrismaClient().$disconnect();
}

main().catch((e) => {
  console.error("\n" + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
