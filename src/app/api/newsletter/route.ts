import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addAudienceContact,
  isAudienceConfigured,
  sendEmail,
} from "@/lib/email/client";
import { newsletterWelcome } from "@/lib/email/templates";

const schema = z.object({
  email: z.string().trim().email().max(200),
  // Honeypot.
  website: z.string().max(0).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  if (parsed.data.website) return NextResponse.json({ ok: true });

  if (!isAudienceConfigured()) {
    console.warn("[newsletter] Resend audience not configured — signup dropped:", parsed.data.email);
    return NextResponse.json(
      { error: "Newsletter signups are not available right now." },
      { status: 503 },
    );
  }

  const add = await addAudienceContact({ email: parsed.data.email });
  if (!add.ok) {
    return NextResponse.json(
      { error: "Could not add your email. Please try again." },
      { status: 502 },
    );
  }

  // Welcome email for new subscribers. Must be awaited — on serverless the
  // function is frozen once the response returns, so a fire-and-forget send
  // gets killed before it reaches Resend. sendEmail swallows failures, so an
  // email error can never block the signup itself. Skip if Resend says they
  // were already subscribed — they got this once.
  if (!add.alreadySubscribed) {
    const sent = await sendEmail({ to: parsed.data.email, ...newsletterWelcome() });
    if (!sent.ok) {
      console.error("[newsletter] welcome email failed:", sent.reason, "to:", parsed.data.email);
    }
  }

  return NextResponse.json({ ok: true, alreadySubscribed: add.alreadySubscribed });
}
