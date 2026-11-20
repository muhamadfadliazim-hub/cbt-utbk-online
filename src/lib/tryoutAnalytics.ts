import { SantriAttemptRecap } from "@/lib/baznasSeed";

export interface ScoreBracketStat {
  label: string;
  count: number;
  pct: number;
  color: string;
}

export interface SubtestAggregateStat {
  subject: string;
  count: number;
  avgScore: number;
  fullMark: number;
  minScore: number;
  maxScore: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracyPct: number;
}

export interface TryoutAnalyticsResult {
  totalAttempts: number;
  averageScore: number;
  medianScore: number;
  minScore: number;
  maxScore: number;
  brackets: ScoreBracketStat[];
  subtestStats: SubtestAggregateStat[];
  strongestSubtest: SubtestAggregateStat | null;
  weakestSubtest: SubtestAggregateStat | null;
}

export function computeAttemptAnalytics(
  attempts: SantriAttemptRecap[],
  forceScale?: "IRT" | "KLASIK"
): TryoutAnalyticsResult {
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      medianScore: 0,
      minScore: 0,
      maxScore: 0,
      brackets: [],
      subtestStats: [],
      strongestSubtest: null,
      weakestSubtest: null,
    };
  }

  const sortedScores = attempts.map((a) => a.score).sort((a, b) => a - b);
  const sum = sortedScores.reduce((acc, v) => acc + v, 0);
  const mid = Math.floor(sortedScores.length / 2);
  const medianRaw =
    sortedScores.length % 2 === 1
      ? sortedScores[mid]
      : (sortedScores[mid - 1] + sortedScores[mid]) / 2;

  const isClassicOnly =
    forceScale === "KLASIK" ||
    (forceScale !== "IRT" && attempts.every((a) => !a.isIRT));

  const averageScore = isClassicOnly
    ? Math.round((sum / sortedScores.length) * 10) / 10
    : Math.round(sum / sortedScores.length);
  const medianScore = isClassicOnly
    ? Math.round(medianRaw * 10) / 10
    : Math.round(medianRaw);

  const bracketDefs = isClassicOnly
    ? [
        { label: ">= 80 (Sangat Baik)", match: (s: number) => s >= 80, color: "#059669" },
        { label: "65 – 79 (Baik)", match: (s: number) => s >= 65 && s < 80, color: "#0284C7" },
        { label: "50 – 64 (Cukup)", match: (s: number) => s >= 50 && s < 65, color: "#D97706" },
        { label: "< 50 (Perlu Pembinaan)", match: (s: number) => s < 50, color: "#DC2626" },
      ]
    : [
        { label: ">= 650 (Sangat Tinggi)", match: (s: number) => s >= 650, color: "#059669" },
        { label: "550 – 649 (Kompetitif)", match: (s: number) => s >= 550 && s < 650, color: "#10B981" },
        { label: "450 – 549 (Menengah)", match: (s: number) => s >= 450 && s < 550, color: "#0284C7" },
        { label: "350 – 449 (Pemantapan)", match: (s: number) => s >= 350 && s < 450, color: "#D97706" },
        { label: "< 350 (Dasar)", match: (s: number) => s < 350, color: "#DC2626" },
      ];

  const brackets: ScoreBracketStat[] = bracketDefs.map((def) => {
    const count = sortedScores.filter(def.match).length;
    return {
      label: def.label,
      count,
      pct: Math.round((count / sortedScores.length) * 100),
      color: def.color,
    };
  });

  const subMap = new Map<
    string,
    {
      subject: string;
      scores: number[];
      fullMark: number;
      totalCorrect: number;
      totalQuestions: number;
    }
  >();

  for (const att of attempts) {
    for (const sub of att.subscores || []) {
      const existing = subMap.get(sub.subject) || {
        subject: sub.subject,
        scores: [],
        fullMark: sub.fullMark || 1000,
        totalCorrect: 0,
        totalQuestions: 0,
      };
      existing.scores.push(sub.score);
      existing.totalCorrect += sub.correct || 0;
      existing.totalQuestions += sub.total || 0;
      subMap.set(sub.subject, existing);
    }
  }

  const subtestStats: SubtestAggregateStat[] = Array.from(subMap.values()).map((entry) => {
    const count = entry.scores.length;
    const avg = entry.scores.reduce((a, b) => a + b, 0) / Math.max(1, count);
    return {
      subject: entry.subject,
      count,
      avgScore: entry.fullMark <= 100 ? Math.round(avg * 10) / 10 : Math.round(avg),
      fullMark: entry.fullMark,
      minScore: Math.min(...entry.scores),
      maxScore: Math.max(...entry.scores),
      totalCorrect: entry.totalCorrect,
      totalQuestions: entry.totalQuestions,
      accuracyPct:
        entry.totalQuestions > 0
          ? Math.round((entry.totalCorrect / entry.totalQuestions) * 100)
          : 0,
    };
  });

  const sortedByScore = [...subtestStats].sort((a, b) => b.avgScore - a.avgScore);
  const strongestSubtest = sortedByScore[0] || null;
  const weakestSubtest =
    sortedByScore.length > 1 ? sortedByScore[sortedByScore.length - 1] : null;

  return {
    totalAttempts: attempts.length,
    averageScore,
    medianScore,
    minScore: sortedScores[0],
    maxScore: sortedScores[sortedScores.length - 1],
    brackets,
    subtestStats,
    strongestSubtest,
    weakestSubtest,
  };
}

function escapeCsvCell(val: string | number | null | undefined): string {
  const s = val === null || val === undefined ? "" : String(val);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsvFile(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((r) => r.map(escapeCsvCell).join(",")),
  ];
  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
