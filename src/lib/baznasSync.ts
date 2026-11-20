import { prisma } from "@/lib/prisma";
import { SantriAttemptRecap, SantriTryoutScore } from "@/lib/baznasSeed";
import { buildAttemptRecap, loadExamsWithQuestionsMap } from "@/lib/attemptRecap";

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

  const examById = await loadExamsWithQuestionsMap(distinctExamIds);
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
      const recap = buildAttemptRecap(a, examById);
      const pkgStat = examStatsMap.get(recap.examId) || {
        examId: recap.examId,
        title: recap.examTitle,
        type: recap.examType,
        scoresBySantri: new Map<string, number>(),
      };
      const prevPkgScore = pkgStat.scoresBySantri.get(row.id) ?? -1;
      if (recap.score >= prevPkgScore) {
        pkgStat.scoresBySantri.set(row.id, recap.score);
      }
      examStatsMap.set(recap.examId, pkgStat);
      return recap;
    });

    const storedScores = parseManualScores(row.tryoutScores);
    // Preserve manually entered offline scores while replacing previously synced CBT entries
    const manualOnlyScores = storedScores.filter((s) => !s.attemptId);

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
