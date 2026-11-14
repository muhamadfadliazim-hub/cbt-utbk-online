import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { isIrtExamType, scoreExamAttempt } from "@/lib/examGrading";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const pesantrenId = (session.user as any).pesantrenId || null;
  const firstName = session.user.name ? session.user.name.split(" ")[0] : "Siswa";

  const [user, attempts, nextExamRaw, announcements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { snbpTargetUniv: true, snbpTargetMajor: true },
    }),
    prisma.attempt.findMany({
      where: { userId },
      include: {
        exam: {
          include: {
            sections: {
              orderBy: { orderIndex: "asc" },
              include: { questions: { orderBy: { orderIndex: "asc" } } },
            },
          },
        },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.exam.findFirst({
      where: {
        status: "PUBLISHED",
        sections: { some: { questions: { some: {} } } },
        ...(pesantrenId ? { OR: [{ pesantrenId: null }, { pesantrenId }] } : {}),
      },
      orderBy: { scheduledAt: "desc" },
      include: {
        sections: {
          include: { _count: { select: { questions: true } } },
        },
      },
    }),
    prisma.announcement.findMany({
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  const totalExams = attempts.length;
  let averageScore = 0;
  const chartData: { name: string; score: number }[] = [];
  let latestSubscores: { subject: string; score: number | null; fullMark: number; correct: number | null; total: number }[] = [];

  if (totalExams > 0) {
    const scoreVisibleAttempts = attempts.filter((attempt) => attempt.exam.showScore);
    if (scoreVisibleAttempts.length > 0) {
      const irtAttempts = scoreVisibleAttempts.filter((a) => isIrtExamType(a.exam.type));
      const poolAttempts = irtAttempts.length > 0 ? irtAttempts : scoreVisibleAttempts;
      const totalScore = poolAttempts.reduce((acc, attempt) => acc + (attempt.score || 0), 0);
      averageScore = totalScore / poolAttempts.length;

      scoreVisibleAttempts.forEach((attempt, i) => {
        chartData.push({
          name: `TO ${i + 1}`,
          score: Math.round((attempt.score || 0) * 10) / 10,
        });
      });
    }

    const latest = attempts[attempts.length - 1];
    if (
      (latest.exam.showScore || latest.exam.showDiscussion) &&
      latest.exam.sections.some((s) => s.questions.length > 0)
    ) {
      let parsedAns: Record<string, any> = {};
      try {
        if (latest.answers) parsedAns = JSON.parse(latest.answers);
      } catch {}
      const graded = scoreExamAttempt(latest.exam.sections, parsedAns, latest.exam.type);
      latestSubscores = graded.subscores.map((s) => ({
        subject: s.subject,
        score: latest.exam.showScore ? s.score : null,
        fullMark: s.fullMark,
        correct: latest.exam.showDiscussion ? s.correct : null,
        total: s.total,
      }));
    }
  }

  const nextExam = nextExamRaw
    ? {
        id: nextExamRaw.id,
        title: nextExamRaw.title,
        scheduledAt: nextExamRaw.scheduledAt ? nextExamRaw.scheduledAt.toISOString() : null,
        totalDuration:
          Math.round(
            nextExamRaw.sections.reduce(
              (acc, s) => acc + (s.durationSeconds ?? s.durationMinutes * 60),
              0
            ) / 60
          ) || nextExamRaw.totalDuration,
        questionCount: nextExamRaw.sections.reduce((acc, s) => acc + s._count.questions, 0),
        sectionCount: nextExamRaw.sections.length,
      }
    : null;

  return (
    <DashboardClient
      firstName={firstName}
      snbpTargetUniv={user?.snbpTargetUniv || null}
      snbpTargetMajor={user?.snbpTargetMajor || null}
      averageScore={averageScore}
      totalExams={totalExams}
      chartData={chartData}
      nextExam={nextExam}
      latestSubscores={latestSubscores}
      announcements={announcements.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        publishedAt: a.publishedAt.toISOString(),
      }))}
    />
  );
}
