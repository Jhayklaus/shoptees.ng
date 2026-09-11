import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { importArchive } from "@/lib/server/import-archive";
import { revalidatePath } from "next/cache";

// One-off catalogue import, triggered from /admin/import.
//
// It exists as an endpoint because the production database is only reachable
// from inside the deployment. Guards, in order: an admin session, an explicit
// confirmation phrase before anything is written, and an import that only
// ever creates DRAFTS and is idempotent by slug. Safe to delete once the
// catalogue is in — it is this file plus the page that calls it.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CONFIRM = "IMPORT ARCHIVE";

const schema = z.object({
  apply: z.boolean().default(false),
  confirm: z.string().default(""),
});

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { apply, confirm } = parsed.data;

  if (apply && confirm !== CONFIRM) {
    return NextResponse.json(
      { error: `Type ${CONFIRM} to confirm before importing.` },
      { status: 400 },
    );
  }

  try {
    const report = await importArchive({ apply });
    if (apply) {
      revalidatePath("/admin/products");
      revalidatePath("/admin/collections");
      revalidatePath("/shop");
      revalidatePath("/collections");
    }
    return NextResponse.json(report);
  } catch (e) {
    console.error("[admin/import-archive]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Import failed" },
      { status: 500 },
    );
  }
}
