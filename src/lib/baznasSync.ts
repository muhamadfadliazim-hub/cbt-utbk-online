import { prisma } from "@/lib/prisma";
import { isIrtExamType, scoreExamAttempt } from "@/lib/examGrading";
import { SantriAttemptRecap, SantriTryoutScore } from "@/lib/baznasSeed";

function toJakartaDateString(input: Date | string): string {
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

function normalizeName(name?: string | null): string {
  return (name || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function parseManualScores(raw: string | null | undefined): SantriTryoutScore[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function roundScore(raw: number, examType?: string | null): number {
  return isIrtExamType(examType)
    ? Math.round(raw)
    : Math.round(raw * 10) / 10;
}

export interface EnrichedBaznasSantri {
  [key: string]: any;
  tryoutScores: SantriTryoutScore[];
  attemptHistory: SantriAttemptRecap[];
  attemptCount: number;
  latestScore: number | null;
  averageScore: number;
}

export interface PesantrenTryoutSummary {
  totalSantri: number;
  santriSudahTo: number;
  totalAttempts: number;
  averageScoreParticipating: number;
  highestSantri: { name: string; score: number } | null;
  examPackages: {
    examId: string;
    title: string;
    type: string;
    participantCount: number;
    averageScore: number;
  }[];
}

/**
 * Resolves live CBT Attempt records for BaznasSantri rows in a pesantren,
 * computes IRT/classical overall and per-subtest recaps, and synchronizes
 * stale BaznasSantri.tryoutScores / averageScore fields back to PostgreSQL.
 */
export async function enrichSantriWithAttempts(
  santriRows: any[],
  pesantrenId: string
): Promise<{
  santriList: EnrichedBaznasSantri[];
  tryoutSummary: PesantrenTryoutSummary;
}> {
  if (santriRows.length === 0) {
    return {
      santriList: [],
      tryoutSummary: {
        totalSantri: 0,
        santriSudahTo: 0,
        totalAttempts: 0,
        averageScoreParticipating: 0,
        highestSantri: null,
        examPackages: [],
      },
    };
  }

  const emails = Array.from(
    new Set(
      santriRows
        .map((r) => String(r.emailLogin || "").trim().toLowerCase())
        .filter(Boolean)
    )
  );

  const users = await prisma.user.findMany({
    where: {
      OR: [
        ...(emails.length > 0
          ? emails.map((email) => ({ email: { equals: email, mode: "insensitive" as const } }))
          : []),
        { pesantrenId, role: "STUDENT" },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      pesantrenId: true,
      attempts: {
        orderBy: { startTime: "asc" },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
      },
    },
  });

  const userByEmail = new Map<string, (typeof users)[number]>();
  const userByNameInPesantren = new Map<string, (typeof users)[number]>();
  for (const u of users) {
    if (u.email) {
      userByEmail.set(u.email.trim().toLowerCase(), u);
    }
    if (u.pesantrenId === pesantrenId && u.name) {
      userByNameInPesantren.set(normalizeName(u.name), u);
    }
  }

  const distinctExamIds = Array.from(
    new Set(
      users.flatMap((u) =>
        u.attempts
          .filter((a) => a.endTime !== null || a.score !== null)
          .map((a) => a.examId)
      )
    )
  );

  const exams =
    distinctExamIds.length > 0
      ? await prisma.exam.findMany({
          where: { id: { in: distinctExamIds } },
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
        })
      : [];

  const examById = new Map(exams.map((e) => [e.id, e]));
  const dbUpdates: Promise<any>[] = [];

  const examStatsMap = new Map<
    string,
    { examId: string; title: string; type: string; scoresBySantri: Map<string, number> }
  >();

  const enrichedList: EnrichedBaznasSantri[] = santriRows.map((row) => {
    const emailKey = String(row.emailLogin || "").trim().toLowerCase();
    const matchedUser =
      (emailKey ? userByEmail.get(emailKey) : undefined) ||
      userByNameInPesantren.get(normalizeName(row.name));

    const completedAttempts = (matchedUser?.attempts || []).filter(
      (a) => a.endTime !== null || a.score !== null
    );

    const attemptHistoryChronological: SantriAttemptRecap[] = completedAttempts.map((a) => {
      const fullExam = examById.get(a.examId);
      const examTitle = fullExam?.title || a.exam?.title || "Tryout CBT";
      const examType = fullExam?.type || a.exam?.type || "SNBT";
      const useIRT = isIrtExamType(examType);

      let parsedAnswers: Record<string, any> = {};
      try {
        parsedAnswers = JSON.parse(a.answers || "{}");
      } catch {
        parsedAnswers = {};
      }

      const graded = fullExam
        ? scoreExamAttempt(fullExam.sections, parsedAnswers, examType)
        : null;

      const finalScore = roundScore(
        a.score !== null && a.score !== undefined ? a.score : (graded?.score ?? 0),
        examType
      );

      const completedDate = a.endTime || a.startTime;
      const durationMs = Math.max(0, new Date(completedDate).getTime() - new Date(a.startTime).getTime());

      const pkgStat = examStatsMap.get(a.examId) || {
        examId: a.examId,
        title: examTitle,
        type: examType,
        scoresBySantri: new Map<string, number>(),
      };
      const prevPkgScore = pkgStat.scoresBySantri.get(row.id) ?? -1;
      if (finalScore >= prevPkgScore) {
        pkgStat.scoresBySantri.set(row.id, finalScore);
      }
      examStatsMap.set(a.examId, pkgStat);

      return {
        attemptId: a.id,
        examId: a.examId,
        examTitle,
        examType,
        score: finalScore,
        isIRT: useIRT,
        scaleMax: useIRT ? 1000 : 100,
        correctCount: graded?.correctCount ?? 0,
        answeredCount: graded?.answeredCount ?? 0,
        totalQuestions: graded?.totalQuestions ?? 0,
        durationMinutes: Math.max(1, Math.round(durationMs / 60000)),
        startedAt: new Date(a.startTime).toISOString(),
        completedAt: new Date(completedDate).toISOString(),
        date: toJakartaDateString(completedDate),
        subscores: graded?.subscores || [],
      };
    });

    const realAttemptIds = new Set(attemptHistoryChronological.map((a) => a.attemptId));
    const storedScores = parseManualScores(row.tryoutScores);
    // Preserve manually entered offline scores while replacing previously synced CBT entries
    const manualOnlyScores = storedScores.filter(
      (s) => !s.attemptId && !realAttemptIds.has(String(s.attemptId || ""))
    );

    const liveCbtScores: SantriTryoutScore[] = attemptHistoryChronological.map((a) => ({
      attemptId: a.attemptId,
      examId: a.examId,
      tryoutName: a.examTitle,
      score: a.score,
      date: a.date,
      examType: a.examType,
      isIRT: a.isIRT,
      scaleMax: a.scaleMax,
      correctCount: a.correctCount,
      totalQuestions: a.totalQuestions,
    }));

    const mergedTryoutScores = [...manualOnlyScores, ...liveCbtScores];
    const mergedAvg =
      mergedTryoutScores.length > 0
        ? Math.round(
            mergedTryoutScores.reduce((acc, s) => acc + Number(s.score || 0), 0) /
              mergedTryoutScores.length
          )
        : 0;

    const serializedMerged = JSON.stringify(mergedTryoutScores);
    if (row.tryoutScores !== serializedMerged || row.averageScore !== mergedAvg) {
      dbUpdates.push(
        prisma.baznasSantri
          .update({
            where: { id: row.id },
            data: {
              tryoutScores: serializedMerged,
              averageScore: mergedAvg,
            },
          })
          .catch((err) => {
            console.error(`Failed syncing BaznasSantri ${row.id}:`, err);
          })
      );
    }

    const attemptHistoryNewestFirst = [...attemptHistoryChronological].reverse();
    const latestScore =
      mergedTryoutScores.length > 0
        ? mergedTryoutScores[mergedTryoutScores.length - 1].score
        : null;

    return {
      ...row,
      tryoutScores: mergedTryoutScores,
      attemptHistory: attemptHistoryNewestFirst,
      attemptCount: attemptHistoryChronological.length,
      latestScore,
      averageScore: mergedAvg,
    };
  });

  if (dbUpdates.length > 0) {
    await Promise.all(dbUpdates);
  }

  const participating = enrichedList.filter((s) => s.tryoutScores.length > 0);
  const averageScoreParticipating =
    participating.length > 0
      ? Math.round(
          participating.reduce((acc, s) => acc + (s.averageScore || 0), 0) / participating.length
        )
      : 0;

  let highestSantri: { name: string; score: number } | null = null;
  for (const s of participating) {
    const score = s.latestScore ?? s.averageScore;
    if (!highestSantri || score > highestSantri.score) {
      highestSantri = { name: s.name, score };
    }
  }

  const examPackages = Array.from(examStatsMap.values()).map((pkg) => {
    const scores = Array.from(pkg.scoresBySantri.values());
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    return {
      examId: pkg.examId,
      title: pkg.title,
      type: pkg.type,
      participantCount: scores.length,
      averageScore: avg,
    };
  });

  return {
    santriList: enrichedList,
    tryoutSummary: {
      totalSantri: enrichedList.length,
      santriSudahTo: participating.length,
      totalAttempts: enrichedList.reduce((acc, s) => acc + s.attemptCount, 0),
      averageScoreParticipating,
      highestSantri,
      examPackages,
    },
  };
}

/**
 * Synchronizes a submitting student's CBT attempts back to their matching
 * BaznasSantri record(s) when present. Safe no-op for non-santri students.
 */
export async function syncBaznasSantriForUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, pesantrenId: true },
  });
  if (!user?.email) return;

  const matchingSantri = await prisma.baznasSantri.findMany({
    where: {
      emailLogin: { equals: user.email.trim(), mode: "insensitive" },
    },
  });
  if (matchingSantri.length === 0) return;

  const grouped = new Map<string, typeof matchingSantri>();
  for (const row of matchingSantri) {
    const list = grouped.get(row.pesantrenId) || [];
    list.push(row);
    grouped.set(row.pesantrenId, list);
  }

  await Promise.all(
    Array.from(grouped.entries()).map(([pesantrenId, rows]) =>
      enrichSantriWithAttempts(rows, pesantrenId)
    )
  );
}
