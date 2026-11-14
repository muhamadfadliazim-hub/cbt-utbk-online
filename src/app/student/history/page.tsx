import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";
import { isIrtExamType, scoreExamAttempt } from "@/lib/examGrading";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: {
      exam: {
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
      },
    },
    orderBy: { startTime: "desc" },
  });

  const historyData = attempts.map((attempt) => {
    const showScore = attempt.exam.showScore;
    const showDiscussion = attempt.exam.showDiscussion;
    const allowPdfDownload = attempt.exam.allowPdfDownload;
    const isIRT = isIrtExamType(attempt.exam.type);
    const targetScore = isIRT ? 700 : 75;

    let parsedAnswers: Record<string, any> = {};
    try {
      if (attempt.answers) parsedAnswers = JSON.parse(attempt.answers);
    } catch { }

    let subscores: { subject: string; score: number | null; fullMark: number; correct: number | null; total: number }[] = [];
    let rawScore = attempt.score || 0;

    const hasSections = attempt.exam.sections.some((s) => s.questions.length > 0);
    if (hasSections) {
      const graded = scoreExamAttempt(attempt.exam.sections, parsedAnswers, attempt.exam.type);
      if (showScore || showDiscussion) {
        subscores = graded.subscores.map((s) => ({
          subject: s.subject,
          score: showScore ? s.score : null,
          fullMark: s.fullMark,
          correct: showDiscussion ? s.correct : null,
          total: s.total,
        }));
      }
      if (!isIRT || !attempt.score) {
        rawScore = graded.score;
      }
    }

    return {
      id: attempt.id,
      title: attempt.exam.title,
      date: new Date(attempt.startTime).toLocaleDateString("id-ID", { dateStyle: "long" }),
      score: showScore ? rawScore : null,
      targetScore,
      status: showScore ? (rawScore >= targetScore ? "LULUS" : "BELUM LULUS") : "MENUNGGU_ADMIN",
      category: attempt.exam.type,
      isIRT,
      subscores,
      showScore,
      showDiscussion,
      allowPdfDownload,
    };
  });

  return <HistoryClient historyData={historyData} />;
}
