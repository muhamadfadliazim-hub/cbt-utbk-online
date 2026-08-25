"use server";

import { prisma } from "@/lib/prisma";

export async function getExamForCbt(examId: string) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            questions: true,
          }
        }
      }
    });
    
    if (!exam) return { error: "Ujian tidak ditemukan di database" };

    return { success: true, exam };
  } catch (error) {
    console.error("Error fetching exam:", error);
    return { error: "Gagal mengambil data ujian" };
  }
}

export async function resetStudentAttempts(userId: string) {
  try {
    await prisma.attempt.deleteMany({
      where: { userId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error resetting all attempts:", error);
    return { error: "Gagal mereset riwayat ujian" };
  }
}

export async function resetSingleAttempt(attemptId: string) {
  try {
    await prisma.attempt.delete({
      where: { id: attemptId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting attempt:", error);
    return { error: "Gagal menghapus sesi ujian" };
  }
}

export async function saveMockExamAttempt(examId: string, score: number) {
  try {
    const { getServerSession } = await import("next-auth/next");
    const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    // Check if the dummy exam exists, create if not
    let exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          id: examId,
          title: "Mock TKA SMA",
          type: "TKA_SMA",
          status: "PUBLISHED",
          access: "EXCLUSIVE",
          totalDuration: 120,
        }
      });
    }

    await prisma.attempt.create({
      data: {
        userId,
        examId: exam.id,
        score,
        endTime: new Date(),
        answers: "{}",
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving mock exam attempt:", error);
    return { success: false, error: "Failed to save attempt" };
  }
}
