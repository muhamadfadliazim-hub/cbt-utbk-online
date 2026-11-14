import { prisma } from "@/lib/prisma";

interface SessionLike {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: string;
    isPremium?: boolean;
    pesantrenId?: string | null;
    schoolName?: string | null;
  } | null;
}

export async function ensureSessionUser(session: SessionLike): Promise<string> {
  const user = session.user;
  const userId = user?.id || "";
  const sessionEmail = typeof user?.email === "string" ? user.email : undefined;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(userId ? [{ id: userId }] : []),
        ...(sessionEmail ? [{ email: sessionEmail }] : []),
      ],
    },
    select: { id: true },
  });

  if (existingUser) {
    return existingUser.id;
  }

  const createdUser = await prisma.user.create({
    data: {
      ...(userId ? { id: userId } : {}),
      email: sessionEmail || `${userId || "student"}@az.cbt`,
      name: user?.name || "Peserta CBT",
      role: user?.role === "ADMIN" ? "ADMIN" : "STUDENT",
      isApproved: true,
      isPremium: Boolean(user?.isPremium),
      pesantrenId: user?.pesantrenId || null,
      schoolName: user?.schoolName || null,
    },
    select: { id: true },
  });

  return createdUser.id;
}

