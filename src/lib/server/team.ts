import "server-only";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { adminInviteEmail } from "@/lib/email/templates";
import { siteConfig } from "@/config/site";

const INVITE_TTL_DAYS = 7;

function makeToken() {
  // 32 random bytes → 64 hex chars. Hex is URL-safe; no need to encode.
  return randomBytes(32).toString("hex");
}

export function listAdmins() {
  return prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

export function listPendingInvites() {
  return prisma.adminInvite.findMany({
    where: { usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      expiresAt: true,
      createdAt: true,
      invitedBy: { select: { name: true } },
    },
  });
}

export async function createInvite(args: {
  email: string;
  name?: string;
  invitedById: string;
  invitedByName: string;
  origin: string;
}): Promise<
  | { ok: true; invite: { id: string; email: string; expiresAt: Date } }
  | { ok: false; reason: "already_admin" | "already_invited" | "email_failed" }
> {
  const email = args.email.toLowerCase().trim();

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return { ok: false, reason: "already_admin" };

  const openInvite = await prisma.adminInvite.findFirst({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (openInvite) return { ok: false, reason: "already_invited" };

  const token = makeToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
  const invite = await prisma.adminInvite.create({
    data: {
      email,
      name: args.name?.trim() || null,
      token,
      expiresAt,
      invitedById: args.invitedById,
    },
  });

  const inviteUrl = `${args.origin}/admin/accept?token=${token}`;
  const result = await sendEmail({
    to: email,
    ...adminInviteEmail({
      inviteUrl,
      invitedByName: args.invitedByName,
      brandName: siteConfig.name,
    }),
  });

  if (!result.ok) {
    // Roll the invite back so the user can retry from a clean slate. Avoids
    // a stuck "pending" row that no one ever received an email for.
    await prisma.adminInvite.delete({ where: { id: invite.id } }).catch(() => {});
    return { ok: false, reason: "email_failed" };
  }

  return { ok: true, invite: { id: invite.id, email: invite.email, expiresAt } };
}

export async function revokeInvite(id: string) {
  await prisma.adminInvite.delete({ where: { id } }).catch(() => {});
}

export async function removeAdmin(id: string) {
  // Caller is responsible for blocking self-removal — see the route handler.
  // Cascade on Session.userId means their sessions go too.
  await prisma.adminUser.delete({ where: { id } }).catch(() => {});
}

export async function findValidInviteByToken(token: string) {
  const invite = await prisma.adminInvite.findUnique({
    where: { token },
    select: { id: true, email: true, name: true, expiresAt: true, usedAt: true },
  });
  if (!invite) return null;
  if (invite.usedAt) return { ...invite, status: "used" as const };
  if (invite.expiresAt < new Date()) return { ...invite, status: "expired" as const };
  return { ...invite, status: "valid" as const };
}

export async function acceptInvite(args: {
  token: string;
  name: string;
  password: string;
}): Promise<
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "expired" | "used" | "email_taken" }
> {
  const invite = await findValidInviteByToken(args.token);
  if (!invite) return { ok: false, reason: "invalid" };
  if (invite.status === "used") return { ok: false, reason: "used" };
  if (invite.status === "expired") return { ok: false, reason: "expired" };

  // Race: someone may have signed up with this email between invite + accept.
  const collision = await prisma.adminUser.findUnique({ where: { email: invite.email } });
  if (collision) return { ok: false, reason: "email_taken" };

  const passwordHash = await bcrypt.hash(args.password, 10);
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.adminUser.create({
      data: {
        email: invite.email,
        name: args.name.trim(),
        passwordHash,
      },
    });
    await tx.adminInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });
    return created;
  });

  return { ok: true, userId: user.id };
}
