"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { createInvite, removeAdmin, revokeInvite } from "@/lib/server/team";

const inviteSchema = z.object({
  email: z.string().trim().email().max(200),
  name: z.string().trim().max(200).optional(),
});

export async function inviteTeammateAction(
  values: { email: string; name?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await requireAdmin();
  if (!me) return { ok: false, error: "Unauthorized" };

  const parsed = inviteSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Build origin from the incoming request so the invite link uses the
  // current host (dev vs staging vs production) without needing extra config.
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const origin = host ? `${proto}://${host}` : "";

  const result = await createInvite({
    email: parsed.data.email,
    name: parsed.data.name,
    invitedById: me.id,
    invitedByName: me.name,
    origin,
  });

  if (!result.ok) {
    const messages = {
      already_admin: "Someone with that email is already an admin.",
      already_invited: "An invite is already pending for that email.",
      email_failed: "Could not send the invite email. Check Resend setup and try again.",
    } as const;
    return { ok: false, error: messages[result.reason] };
  }

  revalidatePath("/admin/team");
  return { ok: true };
}

export async function revokeInviteAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await requireAdmin();
  if (!me) return { ok: false, error: "Unauthorized" };
  await revokeInvite(id);
  revalidatePath("/admin/team");
  return { ok: true };
}

export async function removeAdminAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await requireAdmin();
  if (!me) return { ok: false, error: "Unauthorized" };
  if (me.id === id) return { ok: false, error: "You can't remove yourself." };
  await removeAdmin(id);
  revalidatePath("/admin/team");
  return { ok: true };
}
