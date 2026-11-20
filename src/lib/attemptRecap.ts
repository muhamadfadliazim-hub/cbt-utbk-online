import { prisma } from "@/lib/prisma";
import { isIrtExamType, scoreExamAttempt } from "@/lib/examGrading";
import { SantriAttemptRecap } from "@/lib/baznasSeed";

export function toJakartaDateString(input: Date | string): string {
  try {
    const d = input instanceof Date ? input : new Date(input);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export function roundExamScore(raw: number, examType?: string | null): number {
  return isIrtExamType(examType)
    ? Math.round(raw)
    : Math.round(raw * 10) / 10;
}

export async function loadExamsWithQuestionsMap(examIds: string[]) {
  const uniqueIds = Array.from(new Set(examIds.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return new Map<string, any>();
  }
  const exams = await prisma.exam.findMany({
    where: { id: { in: uniqueIds } },
    include: {
      sections: {
        orderBy: { orderIndex: "asc" },
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });
  return new Map(exams.map((e) => [e.id, e]));
}

export function buildAttemptRecap(
  attempt: {
    id: string;
    examId: string;
    startTime: Date | string;
    endTime?: Date | string | null;
    score?: number | null;
    answers?: string | null;
    exam?: { id?: string; title?: string | null; type?: string | null } | null;
  },
  examById: Map<string, any>
): SantriAttemptRecap {
  const fullExam = examById.get(attempt.examId);
  const examTitle = fullExam?.title || attempt.exam?.title || "Tryout CBT";
  const examType = fullExam?.type || attempt.exam?.type || "SNBT";
  const useIRT = isIrtExamType(examType);

  let parsedAnswers: Record<string, any> = {};
  try {
    parsedAnswers = JSON.parse(attempt.answers || "{}");
  } catch {
    parsedAnswers = {};
  }

  const graded = fullExam
    ? scoreExamAttempt(fullExam.sections, parsedAnswers, examType)
    : null;

  const finalScore = roundExamScore(
    attempt.score !== null && attempt.score !== undefined
      ? attempt.score
      : (graded?.score ?? 0),
    examType
  );

  const startMs = new Date(attempt.startTime).getTime();
  const completedDate = attempt.endTime || attempt.startTime;
  const endMs = new Date(completedDate).getTime();
  const durationMinutes = Math.max(1, Math.round(Math.max(0, endMs - startMs) / 60000));

  return {
    attemptId: attempt.id,
    examId: attempt.examId,
    examTitle,
    examType,
    score: finalScore,
    isIRT: useIRT,
    scaleMax: useIRT ? 1000 : 100,
    correctCount: graded?.correctCount ?? 0,
    answeredCount: graded?.answeredCount ?? 0,
    totalQuestions: graded?.totalQuestions ?? 0,
    durationMinutes,
    startedAt: new Date(attempt.startTime).toISOString(),
    completedAt: new Date(completedDate).toISOString(),
    date: toJakartaDateString(completedDate),
    subscores: graded?.subscores || [],
  };
}
