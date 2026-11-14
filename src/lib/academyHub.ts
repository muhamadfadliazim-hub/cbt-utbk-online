export type ExamCategory = "SNBT" | "TKA_SD" | "TKA_SMP" | "TKA_SMA";
export type PublicationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type QuestionKind = "PILIHAN_GANDA" | "PG_KOMPLEKS" | "BENAR_SALAH" | "ISIAN_SINGKAT";

export const examLabels: Record<ExamCategory, string> = {
  SNBT: "SNBT / UTBK",
  TKA_SD: "TKA 2027 — SD/MI",
  TKA_SMP: "TKA 2027 — SMP/MTs",
  TKA_SMA: "TKA 2026 — SMA/SMK/MA",
};

export type SectionDraft = { id: string; title: string; duration: number; questionTarget: number };

export const EXAM_TEMPLATES: Record<ExamCategory, SectionDraft[]> = {
  SNBT: [
    ["TPS — Penalaran Umum (PU)", 30, 30],
    ["TPS — Pengetahuan & Pemahaman Umum (PPU)", 15, 20],
    ["TPS — Pemahaman Bacaan & Menulis (PBM)", 25, 20],
    ["TPS — Pengetahuan Kuantitatif (PK)", 20, 20],
    ["Tes Literasi — Bahasa Indonesia (LBI)", 43, 30],
    ["Tes Literasi — Bahasa Inggris (LBE)", 20, 20],
    ["Tes Literasi — Penalaran Matematika (PM)", 43, 20],
  ].map(([title, duration, questionTarget], index) => ({
    id: `snbt-${index}`,
    title: String(title),
    duration: Number(duration),
    questionTarget: Number(questionTarget),
  })),
  TKA_SD: [
    ["Bahasa Indonesia", 75, 30],
    ["Matematika", 75, 30],
  ].map(([title, duration, questionTarget], index) => ({
    id: `sd-${index}`,
    title: String(title),
    duration: Number(duration),
    questionTarget: Number(questionTarget),
  })),
  TKA_SMP: [
    ["Bahasa Indonesia", 75, 30],
    ["Matematika", 75, 30],
  ].map(([title, duration, questionTarget], index) => ({
    id: `smp-${index}`,
    title: String(title),
    duration: Number(duration),
    questionTarget: Number(questionTarget),
  })),
  TKA_SMA: [
    ["Bahasa Indonesia", 75, 30],
    ["Matematika", 75, 30],
    ["Bahasa Inggris", 75, 30],
    ["Biologi", 75, 30],
    ["Fisika", 75, 30],
    ["Kimia", 75, 30],
    ["Matematika Tingkat Lanjut", 75, 30],
    ["Ekonomi", 75, 30],
    ["Geografi", 75, 30],
    ["Sosiologi", 75, 30],
    ["Sejarah", 75, 30],
    ["Pendidikan Pancasila", 75, 30],
    ["Bahasa Indonesia Tingkat Lanjut", 75, 30],
    ["Bahasa Inggris Tingkat Lanjut", 75, 30],
    ["Seni Budaya", 75, 30],
    ["PJOK", 75, 30],
  ].map(([title, duration, questionTarget], index) => ({
    id: `sma-${index}`,
    title: String(title),
    duration: Number(duration),
    questionTarget: Number(questionTarget),
  })),
};
