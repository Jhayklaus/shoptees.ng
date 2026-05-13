import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { isR2Configured, presignUpload } from "@/lib/r2";

const schema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp|avif|gif|svg\+xml)$/i, "Only image uploads are allowed"),
});

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "R2 not configured. Add R2_* vars to .env.local then restart the dev server." },
      { status: 501 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const result = await presignUpload(parsed.data);
  return NextResponse.json(result);
}
