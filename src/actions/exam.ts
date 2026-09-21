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
  const exams = await prisma.exam.findMany({
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
  }));
}

export async function createExam(data: any) {
  try {
    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.category,
        totalDuration: data.durationMinutes,
        status: data.status,
        access: data.access,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
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
    await prisma.exam.update({ where: { id }, data: { status } });
    return { success: true };
  } catch (e) {
    return { error: "Gagal update status" };
  }
}

export async function deleteExamAction(id: string) {
  try {
    await prisma.exam.delete({ where: { id } });
    return { success: true };
  } catch (e) {
    return { error: "Gagal hapus ujian" };
  }
}

export async function getStudentExams(allowedTypes: any[]) {
  const where: any = { status: "PUBLISHED" };
  if (allowedTypes && allowedTypes.length > 0) {
    where.type = { in: allowedTypes };
  }
  const exams = await prisma.exam.findMany({
    where,
    orderBy: { scheduledAt: 'desc' },
    include: {
      sections: {
        include: { _count: { select: { questions: true } } }
      }
    }
  });
  return exams.map(exam => ({
    ...exam,
    questionCount: exam.sections.reduce((acc, sec) => acc + sec._count.questions, 0),
    sectionCount: exam.sections.length,
    category: exam.type, // UI uses category
    durationMinutes: exam.totalDuration
  }));
}
