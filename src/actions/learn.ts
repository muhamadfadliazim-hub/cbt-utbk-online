"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function toggleMaterialProgressAction(materialId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const sessionUser = session.user as any;
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: sessionUser.id },
        ...(sessionUser.email ? [{ email: sessionUser.email }] : []),
      ],
    },
    select: { id: true },
  });

  let userId = existingUser?.id;
  if (!userId) {
    const created = await prisma.user.create({
      data: {
        id: sessionUser.id,
        email: sessionUser.email || `${sessionUser.id}@az.cbt`,
        name: sessionUser.name || "Peserta CBT",
        role: sessionUser.role === "ADMIN" ? "ADMIN" : "STUDENT",
        isApproved: true,
        isPremium: Boolean(sessionUser.isPremium),
        pesantrenId: sessionUser.pesantrenId || null,
        schoolName: sessionUser.schoolName || null,
      },
      select: { id: true },
    });
    userId = created.id;
  }

  const existingProgress = await prisma.studentProgress.findUnique({
    where: {
      userId_materialId: { userId, materialId },
    },
  });

  if (existingProgress) {
    await prisma.studentProgress.delete({
      where: { id: existingProgress.id },
    });
    revalidatePath("/student/learn");
    return { success: true, completed: false };
  }

  await prisma.studentProgress.create({
    data: { userId, materialId },
  });
  revalidatePath("/student/learn");
  return { success: true, completed: true };
}

