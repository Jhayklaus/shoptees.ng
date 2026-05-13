import "server-only";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? "";

// Default to Resend's sandbox sender if a verified domain isn't configured
// yet. Sandbox can only send TO the email on the Resend account, so for
// staging set EMAIL_FROM to a verified-domain sender once the domain is added.
export const EMAIL_FROM = process.env.EMAIL_FROM || "Shoptees <onboarding@resend.dev>";

export function isEmailConfigured() {
  return Boolean(RESEND_API_KEY);
}

export function isAudienceConfigured() {
  return Boolean(RESEND_API_KEY && RESEND_AUDIENCE_ID);
}

let client: Resend | null = null;
function getClient() {
  if (!RESEND_API_KEY) return null;
  if (!client) client = new Resend(RESEND_API_KEY);
  return client;
}

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

// Single chokepoint. Logs and swallows failures — email is best-effort and
// must never block an order from being marked PAID.
export async function sendEmail(args: SendArgs) {
  const c = getClient();
  if (!c) {
    console.warn("[email] RESEND_API_KEY not set — skipping send:", args.subject);
    return { ok: false as const, reason: "not_configured" };
  }
  try {
    const result = await c.emails.send({
      from: EMAIL_FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: args.replyTo,
    });
    if (result.error) {
      console.error("[email] send failed:", result.error);
      return { ok: false as const, reason: result.error.message };
    }
    return { ok: true as const, id: result.data?.id ?? null };
  } catch (e) {
    console.error("[email] send threw:", e);
    return { ok: false as const, reason: (e as Error).message };
  }
}

// Add a contact to the configured Resend audience. Used by the newsletter.
// Already-subscribed addresses are an upsert — Resend tolerates duplicates.
export async function addAudienceContact(args: {
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  const c = getClient();
  if (!c || !RESEND_AUDIENCE_ID) {
    return { ok: false as const, reason: "not_configured" };
  }
  try {
    const result = await c.contacts.create({
      audienceId: RESEND_AUDIENCE_ID,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      unsubscribed: false,
    });
    if (result.error) {
      // Resend returns an error for duplicates — treat as success.
      const msg = result.error.message?.toLowerCase() ?? "";
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        return { ok: true as const, alreadySubscribed: true };
      }
      console.error("[email] addAudienceContact failed:", result.error);
      return { ok: false as const, reason: result.error.message };
    }
    return { ok: true as const, alreadySubscribed: false };
  } catch (e) {
    console.error("[email] addAudienceContact threw:", e);
    return { ok: false as const, reason: (e as Error).message };
  }
}
