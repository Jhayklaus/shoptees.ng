import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE = "shoptees_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + MAX_AGE_SECONDS * 1000);
  const session = await prisma.session.create({ data: { userId, expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return session;
}

export async function destroySession() {
  const jar = await cookies();
  const sid = jar.get(COOKIE)?.value;
  if (sid) {
    await prisma.session.delete({ where: { id: sid } }).catch(() => {});
  }
  jar.delete(COOKIE);
}

export async function getCurrentSession() {
  const jar = await cookies();
  const sid = jar.get(COOKIE)?.value;
  if (!sid) return null;

  const session = await prisma.session.findUnique({
    where: { id: sid },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session;
}

export async function requireAdmin() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}
