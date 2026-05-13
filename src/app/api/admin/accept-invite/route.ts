import { NextResponse } from "next/server";
import { z } from "zod";
import { acceptInvite } from "@/lib/server/team";
import { createSession } from "@/lib/session";

const schema = z.object({
  token: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const result = await acceptInvite(parsed.data);
  if (!result.ok) {
    const messages = {
      invalid: "This invitation link is invalid.",
      expired: "This invitation has expired.",
      used: "This invitation has already been used.",
      email_taken: "Someone else already signed up with this email.",
    } as const;
    return NextResponse.json({ error: messages[result.reason] }, { status: 400 });
  }

  await createSession(result.userId);
  return NextResponse.json({ ok: true });
}
