"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function upgradeToPremium() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !(session.user as any).id) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = (session.user as any).id;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error upgrading to premium:", error);
    return { success: false, error: error.message };
  }
}
