"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function saveSnbpTarget(univ: string, major: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    await prisma.user.update({
      where: { id: userId },
      data: {
        snbpTargetUniv: univ,
        snbpTargetMajor: major,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving SNBP target:", error);
    return { success: false, error: "Failed to save target" };
  }
}

export async function getSnbpTarget() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { snbpTargetUniv: true, snbpTargetMajor: true }
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching SNBP target:", error);
    return { success: false, error: "Failed to fetch target" };
  }
}

export async function getLatestTkaScore() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    // Find the latest attempt for an exam of type TKA_SMA
    const latestAttempt = await prisma.attempt.findFirst({
      where: {
        userId: userId,
        exam: {
          type: "TKA_SMA"
        }
      },
      orderBy: {
        endTime: 'desc'
      },
      select: {
        score: true
      }
    });

    return { success: true, score: latestAttempt?.score || 0 };
  } catch (error) {
    console.error("Error fetching TKA score:", error);
    return { success: false, error: "Failed to fetch score", score: 0 };
  }
}
