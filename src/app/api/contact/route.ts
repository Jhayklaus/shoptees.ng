import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail, isEmailConfigured } from "@/lib/email/client";
import { contactFormToAdmin } from "@/lib/email/templates";
import { getSetting } from "@/lib/server/settings";

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(4000),
  // Honeypot — bots fill hidden fields. If present and non-empty we silently
  // accept and discard so the bot thinks it succeeded.
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

  // Honeypot trip — pretend success.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  if (!isEmailConfigured()) {
    console.warn("[contact] RESEND_API_KEY not set — message dropped:", parsed.data.email);
    return NextResponse.json(
      { error: "Contact form is not available right now." },
      { status: 503 },
    );
  }

  const adminEmail = (await getSetting("notifications.admin_email")).trim();
  if (!adminEmail) {
    console.error("[contact] notifications.admin_email not configured");
    return NextResponse.json(
      { error: "Contact form is not available right now." },
      { status: 503 },
    );
  }

  const result = await sendEmail({
    to: adminEmail,
    replyTo: parsed.data.email,
    ...contactFormToAdmin(parsed.data),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
