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
        { label: "65 - 79 (Baik)", match: (s: number) => s >= 65 && s < 80, color: "#0284C7" },
        { label: "50 - 64 (Cukup)", match: (s: number) => s >= 50 && s < 65, color: "#D97706" },
        { label: "< 50 (Perlu Pembinaan)", match: (s: number) => s < 50, color: "#DC2626" },
      ]
    : [
        { label: ">= 650 (Sangat Tinggi)", match: (s: number) => s >= 650, color: "#059669" },
        { label: "550 - 649 (Kompetitif)", match: (s: number) => s >= 550 && s < 650, color: "#10B981" },
        { label: "450 - 549 (Menengah)", match: (s: number) => s >= 450 && s < 550, color: "#0284C7" },
        { label: "350 - 449 (Pemantapan)", match: (s: number) => s >= 350 && s < 450, color: "#D97706" },
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

export function shortSubtestLabel(subject: string): string {
  const codeMatch = subject.match(/\(([^)]+)\)\s*$/);
  if (codeMatch) return codeMatch[1];
  return subject.length > 16 ? `${subject.slice(0, 14)}..` : subject;
}

export type ReportCell = string | number | null | undefined;

export interface ExportWorkbookOptions {
  filename: string;
  sheetName: string;
  title: string;
  subtitle?: string;
  headers: string[];
  rows: ReportCell[][];
  analytics?: TryoutAnalyticsResult;
  extraSummary?: { label: string; value: string | number }[];
}

export async function downloadExcelWorkbook(opts: ExportWorkbookOptions): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const normalizedRows = opts.rows.map((r) =>
    r.map((cell) => (cell === null || cell === undefined ? "-" : cell))
  );

  const mainSheetData: (string | number)[][] = [
    [opts.title],
    ...(opts.subtitle ? [[opts.subtitle]] : []),
    [],
    opts.headers,
    ...normalizedRows,
  ];

  const mainWs = XLSX.utils.aoa_to_sheet(mainSheetData);
  mainWs["!cols"] = opts.headers.map((h, colIdx) => {
    const headerRowOffset = opts.subtitle ? 3 : 2;
    let maxLen = h.length;
    for (let r = headerRowOffset + 1; r < mainSheetData.length; r++) {
      const val = String(mainSheetData[r]?.[colIdx] ?? "");
      if (val.length > maxLen) maxLen = val.length;
    }
    return { wch: Math.min(40, Math.max(8, maxLen + 3)) };
  });
  XLSX.utils.book_append_sheet(wb, mainWs, opts.sheetName.slice(0, 31));

  if (opts.analytics || (opts.extraSummary && opts.extraSummary.length > 0)) {
    const statsData: (string | number)[][] = [
      [opts.title],
      ["Ringkasan Statistik & Analisis Subtes"],
      [],
      ["Metrik", "Nilai"],
      ...(opts.extraSummary || []).map((s) => [s.label, s.value]),
    ];

    if (opts.analytics && opts.analytics.totalAttempts > 0) {
      statsData.push(
        ["Total Sesi Selesai", opts.analytics.totalAttempts],
        ["Rata-rata Skor", opts.analytics.averageScore],
        ["Median Skor", opts.analytics.medianScore],
        ["Skor Minimum", opts.analytics.minScore],
        ["Skor Maksimum", opts.analytics.maxScore],
        [],
        ["Distribusi Rentang Skor", "Jumlah Sesi", "Persentase (%)"],
        ...opts.analytics.brackets.map((b) => [b.label, b.count, b.pct]),
        []
      );

      if (opts.analytics.subtestStats.length > 0) {
        statsData.push(
          ["Subtes", "Jumlah Sesi", "Rata-rata Skor", "Min", "Max", "Total Benar", "Total Soal", "Akurasi (%)"],
          ...opts.analytics.subtestStats.map((s) => [
            s.subject,
            s.count,
            s.avgScore,
            s.minScore,
            s.maxScore,
            s.totalCorrect,
            s.totalQuestions,
            s.accuracyPct,
          ])
        );
      }
    }

    const statsWs = XLSX.utils.aoa_to_sheet(statsData);
    statsWs["!cols"] = [
      { wch: 42 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, statsWs, "Statistik & Subtes");
  }

  const outName = opts.filename.endsWith(".xlsx") ? opts.filename : `${opts.filename}.xlsx`;
  XLSX.writeFile(wb, outName);
}

export interface ExportPdfOptions {
  filename: string;
  title: string;
  subtitle?: string;
  accentRgb?: [number, number, number];
  kpis?: { label: string; value: string }[];
  headers: string[];
  rows: ReportCell[][];
  analytics?: TryoutAnalyticsResult;
}

export async function downloadPdfReport(opts: ExportPdfOptions): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const accent = opts.accentRgb || [30, 58, 138];

  // Top banner
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.rect(0, 0, pageWidth, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(opts.title, 12, 11);

  if (opts.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(opts.subtitle, 12, 18);
  }

  const printedAt = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  doc.setFontSize(8);
  doc.text(`Dicetak: ${printedAt} WIB`, pageWidth - 12, 18, { align: "right" });

  let cursorY = 30;

  if (opts.kpis && opts.kpis.length > 0) {
    const gap = 3;
    const boxW = (pageWidth - 24 - gap * (opts.kpis.length - 1)) / opts.kpis.length;
    opts.kpis.forEach((kpi, idx) => {
      const x = 12 + idx * (boxW + gap);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(x, cursorY, boxW, 14, 2, 2, "FD");
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(kpi.label, x + 3, cursorY + 5);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.text(String(kpi.value).slice(0, 24), x + 3, cursorY + 11);
    });
    cursorY += 19;
  }

  // Main participant/session recap table
  const cleanRows = opts.rows.map((r) =>
    r.map((cell) => (cell === null || cell === undefined ? "-" : String(cell)))
  );

  autoTable(doc, {
    startY: cursorY,
    head: [opts.headers],
    body: cleanRows,
    margin: { left: 12, right: 12, top: 14, bottom: 14 },
    theme: "grid",
    showHead: "everyPage",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: accent,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  cursorY = ((doc as any).lastAutoTable?.finalY ?? cursorY) + 8;

  // Subtest & Distribution analytics section if data available
  if (opts.analytics && opts.analytics.totalAttempts > 0) {
    if (cursorY > pageHeight - 50) {
      doc.addPage();
      cursorY = 16;
    }

    if (opts.analytics.subtestStats.length > 0) {
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Statistik Rata-rata per Subtes", 12, cursorY);

      autoTable(doc, {
        startY: cursorY + 3,
        head: [["Subtes", "Sesi", "Rata-rata", "Skor Min", "Skor Max", "Benar / Total", "Akurasi"]],
        body: opts.analytics.subtestStats.map((s) => [
          s.subject,
          String(s.count),
          String(s.avgScore),
          String(s.minScore),
          String(s.maxScore),
          `${s.totalCorrect}/${s.totalQuestions}`,
          `${s.accuracyPct}%`,
        ]),
        margin: { left: 12, right: 12, bottom: 14 },
        theme: "striped",
        styles: { fontSize: 8, cellPadding: 2.2 },
        headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: "bold" },
      });

      cursorY = ((doc as any).lastAutoTable?.finalY ?? cursorY) + 8;
    }

    if (opts.analytics.brackets.length > 0) {
      if (cursorY > pageHeight - 40) {
        doc.addPage();
        cursorY = 16;
      }
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Distribusi Rentang Skor", 12, cursorY);

      autoTable(doc, {
        startY: cursorY + 3,
        head: [["Rentang Skor", "Jumlah Sesi", "Persentase"]],
        body: opts.analytics.brackets.map((b) => [b.label, String(b.count), `${b.pct}%`]),
        margin: { left: 12, right: 12, bottom: 14 },
        theme: "striped",
        tableWidth: 140,
        styles: { fontSize: 8, cellPadding: 2.2 },
        headStyles: { fillColor: accent, textColor: [255, 255, 255], fontStyle: "bold" },
      });
    }
  }

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("AZ Academy CBT • Laporan Resmi Hasil Ujian", 12, pageHeight - 6);
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - 12, pageHeight - 6, {
      align: "right",
    });
  }

  const outName = opts.filename.endsWith(".pdf") ? opts.filename : `${opts.filename}.pdf`;
  doc.save(outName);
}
