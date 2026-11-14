"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminTenantContext } from "@/lib/tenant";

export async function getExamForCbt(examId: string) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                sectionId: true,
                orderIndex: true,
                type: true,
                content: true,
                options: true,
              },
            },
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

// Admin Actions
export async function saveQuestion(data: any) {
  try {
    // Find the specific section in the exam
    const exam = await prisma.exam.findUnique({
      where: { id: data.packageId },
      include: { sections: true }
    });
    
    if (!exam) return { error: "Ujian tidak ditemukan" };
    
    const section = exam.sections.find((s: any) => s.title === data.section);
    if (!section) return { error: "Subtes tidak ditemukan" };

    const question = await prisma.question.create({
      data: {
        sectionId: section.id,
        type: data.type,
        content: data.content,
        options: JSON.stringify(data.options || []),
        answerKey: JSON.stringify(data.answerKey),
        explanation: data.explanation || "",
      }
    });

    return { success: true, questionId: question.id };
  } catch (error) {
    console.error("Error saving question:", error);
    return { error: "Gagal menyimpan soal" };
  }
}

export async function saveQuestionsBulk(questionsData: any[]) {
  try {
    if (questionsData.length === 0) return { success: true };
    
    // Group by packageId to fetch exams
    const packageId = questionsData[0].packageId;
    const exam = await prisma.exam.findUnique({
      where: { id: packageId },
      include: { sections: true }
    });
    
    if (!exam) return { error: "Ujian tidak ditemukan" };

    const questionsToCreate = questionsData.map((q: any) => {
      const section = exam.sections.find((s: any) => s.title === q.section);
      return {
        sectionId: section?.id || exam.sections[0].id,
        type: q.type,
        content: q.content,
        options: JSON.stringify(q.options || []),
        answerKey: JSON.stringify(q.answerKey),
        explanation: q.explanation || "",
      };
    });

    await prisma.question.createMany({
      data: questionsToCreate
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving bulk questions:", error);
    return { error: "Gagal mengimpor soal" };
  }
}

export async function getAdminExams() {
  const ctx = await getAdminTenantContext();
  const where: any = {};
  if (ctx?.activePesantrenId) {
    where.OR = [{ pesantrenId: ctx.activePesantrenId }, { pesantrenId: null }];
  }

  const exams = await prisma.exam.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { sections: true, attempts: true }
      },
      sections: {
        include: {
          _count: { select: { questions: true } }
        }
      }
    }
  });
  return exams.map(exam => ({
    ...exam,
    questionCount: exam.sections.reduce((acc, sec) => acc + sec._count.questions, 0),
    category: exam.type, // Map Prisma's 'type' to frontend's 'category'
    isGlobal: !exam.pesantrenId,
    canModify: ctx?.isSuperAdmin || exam.pesantrenId === ctx?.managedPesantrenId,
  }));
}

export async function createExam(data: any) {
  try {
    const ctx = await getAdminTenantContext();
    const ownerPesantrenId = ctx ? (ctx.managedPesantrenId || ctx.activePesantrenId || null) : null;

    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.category,
        totalDuration: data.durationMinutes,
        status: data.status,
        access: data.access,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        pesantrenId: ownerPesantrenId,
        targetSchools: data.targetSchools || [],
        targetUsers: data.targetUsers || [],
        showScore: data.showScore !== undefined ? Boolean(data.showScore) : true,
        showDiscussion: Boolean(data.showDiscussion),
        allowPdfDownload: Boolean(data.allowPdfDownload),
        continuousFlow: Boolean(data.continuousFlow),
        allowEarlyFinish: Boolean(data.allowEarlyFinish),
        sections: {
          create: data.sections.map((sec: any, index: number) => ({
            title: sec.title,
            durationMinutes: sec.duration,
            orderIndex: index,
          }))
        }
      }
    });
    return { success: true, examId: exam.id };
  } catch (error) {
    console.error("Error creating exam:", error);
    return { error: "Gagal membuat ujian" };
  }
}

export async function updateExamStatus(id: string, status: any) {
  try {
    const ctx = await getAdminTenantContext();
    if (!ctx) return { error: "Unauthorized" };
    if (!ctx.isSuperAdmin) {
      const existing = await prisma.exam.findUnique({ where: { id } });
      if (!existing || existing.pesantrenId !== ctx.managedPesantrenId) {
        return { error: "Hanya Super Admin atau pesantren pembuat yang dapat mengubah paket ini." };
      }
    }
    await prisma.exam.update({ where: { id }, data: { status } });
    return { success: true };
  } catch (e) {
    return { error: "Gagal update status" };
  }
}

export async function updateExamVisibilityAction(
  id: string,
  data: {
    showScore?: boolean;
    showDiscussion?: boolean;
    continuousFlow?: boolean;
    allowEarlyFinish?: boolean;
  }
) {
  try {
    const ctx = await getAdminTenantContext();
    if (!ctx) return { error: "Unauthorized" };
    if (!ctx.isSuperAdmin) {
      const existing = await prisma.exam.findUnique({ where: { id } });
      if (!existing || existing.pesantrenId !== ctx.managedPesantrenId) {
        return { error: "Hanya Super Admin atau pesantren pembuat yang dapat mengubah paket ini." };
      }
    }
    const updateData: {
      showScore?: boolean;
      showDiscussion?: boolean;
      continuousFlow?: boolean;
      allowEarlyFinish?: boolean;
    } = {};
    if (typeof data.showScore === "boolean") updateData.showScore = data.showScore;
    if (typeof data.showDiscussion === "boolean") updateData.showDiscussion = data.showDiscussion;
    if (typeof data.continuousFlow === "boolean") updateData.continuousFlow = data.continuousFlow;
    if (typeof data.allowEarlyFinish === "boolean") updateData.allowEarlyFinish = data.allowEarlyFinish;

    await prisma.exam.update({ where: { id }, data: updateData });
    revalidatePath("/admin/exams");
    revalidatePath("/student/history");
    revalidatePath("/student");
    revalidatePath("/student/exams");
    revalidatePath(`/cbt/${id}`);
    return { success: true };
  } catch (e) {
    return { error: "Gagal memperbarui kontrol pengaturan ujian" };
  }
}

export async function deleteExamAction(id: string) {
  try {
    const ctx = await getAdminTenantContext();
    if (!ctx) return { error: "Unauthorized" };
    if (!ctx.isSuperAdmin) {
      const existing = await prisma.exam.findUnique({ where: { id } });
      if (!existing || existing.pesantrenId !== ctx.managedPesantrenId) {
        return { error: "Hanya Super Admin atau pesantren pembuat yang dapat menghapus paket ini." };
      }
    }
    await prisma.exam.delete({ where: { id } });
    return { success: true };
  } catch (e) {
    return { error: "Gagal hapus ujian" };
  }
}

export async function getStudentExams(allowedTypes: any[], pesantrenId?: string | null) {
  const where: any = {
    status: "PUBLISHED",
    sections: {
      some: {
        questions: {
          some: {},
        },
      },
    },
  };
  if (allowedTypes && allowedTypes.length > 0) {
    where.type = { in: allowedTypes };
  }
  if (pesantrenId) {
    where.OR = [{ pesantrenId: null }, { pesantrenId }];
  }
  const exams = await prisma.exam.findMany({
    where,
    orderBy: { scheduledAt: "desc" },
    include: {
      sections: {
        orderBy: { orderIndex: "asc" },
        include: {
          _count: { select: { questions: true } },
        },
      },
    },
  });
  return exams.map((exam) => {
    const totalSeconds = exam.sections.reduce(
      (acc, sec) => acc + (sec.durationSeconds ?? sec.durationMinutes * 60),
      0
    );
    return {
      ...exam,
      questionCount: exam.sections.reduce((acc, sec) => acc + sec._count.questions, 0),
      sectionCount: exam.sections.length,
      category: exam.type,
      durationMinutes: totalSeconds > 0 ? Math.round(totalSeconds / 60) : exam.totalDuration,
      durationSeconds: totalSeconds,
    };
  });
}
