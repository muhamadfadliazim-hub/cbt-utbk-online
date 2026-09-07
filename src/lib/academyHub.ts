"use client";

import { useCallback, useEffect, useState } from "react";

export type ExamCategory = "SNBT" | "TKA_SD" | "TKA_SMP" | "TKA_SMA";
export type PublicationStatus = "DRAFT" | "PUBLISHED";
export type QuestionKind = "PILIHAN_GANDA" | "PG_KOMPLEKS" | "BENAR_SALAH" | "ISIAN_SINGKAT";

export interface ExamPackage {
  id: string;
  title: string;
  category: ExamCategory;
  description: string;
  durationMinutes: number;
  sectionCount: number;
  questionCount: number;
  access: "EXCLUSIVE" | "OPEN";
  status: PublicationStatus;
  scheduledAt: string;
  createdAt: string;
  targetSchools?: string[];
  targetUsers?: string[];
  showDiscussion?: boolean;
  allowPdfDownload?: boolean;
}

export interface AcademyAnnouncement {
  id: string;
  title: string;
  message: string;
  audience: "ALL" | ExamCategory;
  priority: "NORMAL" | "IMPORTANT" | "URGENT";
  publishedAt: string;
}

export interface QuestionRecord {
  id: string;
  packageId: string;
  section: string;
  type: QuestionKind;
  content: string;
  options: string[];
  answerKey: string | string[];
  statements?: { text: string; answer: "BENAR" | "SALAH" }[];
  explanation: string;
  createdAt: string;
}

export interface LearningMaterialRecord {
  id: string;
  title: string;
  subject: string;
  category: ExamCategory;
  type: "VIDEO" | "PDF" | "ARTICLE";
  url: string;
  durationMinutes: number;
  description: string;
  status: PublicationStatus;
  createdAt: string;
}

interface AcademyHubState {
  exams: ExamPackage[];
  announcements: AcademyAnnouncement[];
  questions: QuestionRecord[];
  materials: LearningMaterialRecord[];
  studentProfile: {
    name: string;
    targetUniv: string;
    targetMajor: string;
  };
  revision: number;
}

const STORAGE_KEY = "az-academy-content-hub-v1";
const CHANNEL_NAME = "az-academy-live-sync";

export const examLabels: Record<ExamCategory, string> = {
  SNBT: "SNBT / UTBK",
  TKA_SD: "TKA 2027 — SD/MI",
  TKA_SMP: "TKA 2027 — SMP/MTs",
  TKA_SMA: "TKA 2026 — SMA/SMK/MA",
};

export type SectionDraft = { id: string; title: string; duration: number; questionTarget: number };

export const EXAM_TEMPLATES: Record<ExamCategory, SectionDraft[]> = {
  SNBT: [
    ["Penalaran Umum", 30, 30], ["Pengetahuan & Pemahaman Umum", 15, 20], ["Pemahaman Bacaan & Menulis", 25, 20], ["Pengetahuan Kuantitatif", 20, 20], ["Literasi Bahasa Indonesia", 42, 30], ["Literasi Bahasa Inggris", 20, 20], ["Penalaran Matematika", 43, 20],
  ].map(([title, duration, questionTarget], index) => ({ id: `snbt-${index}`, title: String(title), duration: Number(duration), questionTarget: Number(questionTarget) })),
  TKA_SD: [["Bahasa Indonesia", 75, 30], ["Matematika", 75, 30]].map(([title, duration, questionTarget], index) => ({ id: `sd-${index}`, title: String(title), duration: Number(duration), questionTarget: Number(questionTarget) })),
  TKA_SMP: [["Bahasa Indonesia", 75, 30], ["Matematika", 75, 30]].map(([title, duration, questionTarget], index) => ({ id: `smp-${index}`, title: String(title), duration: Number(duration), questionTarget: Number(questionTarget) })),
  TKA_SMA: [
    ["Bahasa Indonesia", 75, 30], ["Matematika", 75, 30], ["Bahasa Inggris", 75, 30],
    ["Biologi", 75, 30], ["Fisika", 75, 30], ["Kimia", 75, 30], ["Matematika Tingkat Lanjut", 75, 30],
    ["Ekonomi", 75, 30], ["Geografi", 75, 30], ["Sosiologi", 75, 30], ["Sejarah", 75, 30],
    ["Pendidikan Pancasila", 75, 30], ["Bahasa Indonesia Tingkat Lanjut", 75, 30], 
    ["Bahasa Inggris Tingkat Lanjut", 75, 30], ["Seni Budaya", 75, 30], ["PJOK", 75, 30]
  ].map(([title, duration, questionTarget], index) => ({ id: `sma-${index}`, title: String(title), duration: Number(duration), questionTarget: Number(questionTarget) })),
};

const DEFAULT_STATE: AcademyHubState = {
  revision: 1,
  studentProfile: {
    name: "Siswa Simulasi",
    targetUniv: "Universitas Indonesia",
    targetMajor: "Kedokteran",
  },
  exams: [
    {
      id: "snbt-eksklusif-01",
      title: "Tryout SNBT Eksklusif #01",
      category: "SNBT",
      description: "Simulasi penuh TPS dan Literasi dengan timer per subtes dan laporan IRT.",
      durationMinutes: 195,
      sectionCount: 7,
      questionCount: 155,
      access: "EXCLUSIVE",
      status: "PUBLISHED",
      scheduledAt: "2026-08-23T08:00:00+07:00",
      createdAt: "2026-08-20T08:00:00+07:00",
    },
    {
      id: "snbt-eksklusif-02",
      title: "Tryout SNBT Eksklusif #02",
      category: "SNBT",
      description: "Simulasi penuh tahap 2 dengan tingkat kesulitan lebih tinggi.",
      durationMinutes: 195,
      sectionCount: 7,
      questionCount: 155,
      access: "EXCLUSIVE",
      status: "PUBLISHED",
      scheduledAt: "2026-09-01T08:00:00+07:00",
      createdAt: "2026-08-25T08:00:00+07:00",
    },
    {
      id: "tka-sd-literasi-01",
      title: "Simulasi TKA 2027 — SD/MI",
      category: "TKA_SD",
      description: "Latihan Bahasa Indonesia dan Matematika kelas 6 berdasarkan kerangka TKA 2026. Bukan ujian resmi.",
      durationMinutes: 150,
      sectionCount: 2,
      questionCount: 60,
      access: "OPEN",
      status: "PUBLISHED",
      scheduledAt: "2026-08-24T09:00:00+07:00",
      createdAt: "2026-08-20T08:10:00+07:00",
    },
    {
      id: "tka-smp-diagnostik-01",
      title: "Simulasi TKA 2027 — SMP/MTs",
      category: "TKA_SMP",
      description: "Latihan Bahasa Indonesia dan Matematika kelas 9 berdasarkan kerangka TKA 2026. Bukan ujian resmi.",
      durationMinutes: 150,
      sectionCount: 2,
      questionCount: 60,
      access: "EXCLUSIVE",
      status: "PUBLISHED",
      scheduledAt: "2026-08-25T09:00:00+07:00",
      createdAt: "2026-08-20T08:20:00+07:00",
    },
    {
      id: "tka-sma-saintek-01",
      title: "Simulasi TKA 2026 — SMA/MA/SMK #01",
      category: "TKA_SMA",
      description: "Latihan Bahasa Indonesia, Matematika, Bahasa Inggris, dan dua mapel pilihan. Bukan UTBK-SNBT dan bukan ujian resmi.",
      durationMinutes: 375,
      sectionCount: 5,
      questionCount: 150,
      access: "EXCLUSIVE",
      status: "PUBLISHED",
      scheduledAt: "2026-08-26T13:00:00+07:00",
      createdAt: "2026-08-20T08:30:00+07:00",
    },
    {
      id: "tka-sma-saintek-02",
      title: "Simulasi TKA 2026 — SMA/MA/SMK #02",
      category: "TKA_SMA",
      description: "Latihan pemantapan konsep untuk 3 mapel wajib dan mapel pilihan.",
      durationMinutes: 375,
      sectionCount: 5,
      questionCount: 150,
      access: "OPEN",
      status: "PUBLISHED",
      scheduledAt: "2026-09-05T13:00:00+07:00",
      createdAt: "2026-08-25T08:30:00+07:00",
    },
  ],
  announcements: [
    {
      id: "welcome-snbt-2027",
      title: "Simulasi SNBT Eksklusif dibuka",
      message: "Paket #01 sudah tersedia. Pastikan perangkat dan koneksi siap sebelum memulai.",
      audience: "SNBT",
      priority: "IMPORTANT",
      publishedAt: "2026-08-20T08:45:00+07:00",
    },
  ],
  questions: [],
  materials: [
    {
      id: "material-pu-logika",
      title: "Trik Cepat Logika Pernyataan",
      subject: "Penalaran Umum",
      category: "SNBT",
      type: "VIDEO",
      url: "https://www.youtube.com/",
      durationMinutes: 18,
      description: "Konsep inti dan latihan singkat sebelum mengerjakan tryout.",
      status: "PUBLISHED",
      createdAt: "2026-08-20T09:00:00+07:00",
    },
  ],
};

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

function applyOfficialTkaMetadata(exam: ExamPackage) {
  if (!exam.id.startsWith("tka-")) return exam;
  const officialDefault = DEFAULT_STATE.exams.find((item) => item.id === exam.id);
  if (!officialDefault) return exam;
  return {
    ...exam,
    title: officialDefault.title,
    description: officialDefault.description,
    durationMinutes: officialDefault.durationMinutes,
    sectionCount: officialDefault.sectionCount,
    questionCount: officialDefault.questionCount,
  };
}

function readState(): AcademyHubState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<AcademyHubState>;
    return {
      exams: (parsed.exams ?? DEFAULT_STATE.exams).map(applyOfficialTkaMetadata),
      announcements: parsed.announcements ?? DEFAULT_STATE.announcements,
      questions: parsed.questions ?? DEFAULT_STATE.questions,
      materials: parsed.materials ?? DEFAULT_STATE.materials,
      studentProfile: parsed.studentProfile ?? DEFAULT_STATE.studentProfile,
      revision: parsed.revision ?? DEFAULT_STATE.revision,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useAcademyHub() {
  const [state, setState] = useState<AcademyHubState>(DEFAULT_STATE);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => setState(readState()), 0);

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setState(readState());
    };
    window.addEventListener("storage", onStorage);

    const channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;
    if (channel) channel.onmessage = () => setState(readState());

    return () => {
      window.clearTimeout(hydrationTimer);
      window.removeEventListener("storage", onStorage);
      channel?.close();
    };
  }, []);

  const commit = useCallback((recipe: (current: AcademyHubState) => AcademyHubState) => {
    setState((current) => {
      const next = { ...recipe(current), revision: current.revision + 1 };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({ revision: next.revision });
        channel.close();
      }
      return next;
    });
  }, []);

  const saveExam = useCallback((exam: Omit<ExamPackage, "id" | "createdAt"> & { id?: string }) => {
    const now = new Date().toISOString();
    const record: ExamPackage = { ...exam, id: exam.id ?? makeId("exam"), createdAt: now };
    commit((current) => ({
      ...current,
      exams: [record, ...current.exams.filter((item) => item.id !== record.id)],
    }));
    return record;
  }, [commit]);

  const setExamStatus = useCallback((id: string, status: PublicationStatus) => {
    commit((current) => ({
      ...current,
      exams: current.exams.map((exam) => exam.id === id ? { ...exam, status } : exam),
    }));
  }, [commit]);

  const addAnnouncement = useCallback((announcement: Omit<AcademyAnnouncement, "id" | "publishedAt">) => {
    commit((current) => ({
      ...current,
      announcements: [{ ...announcement, id: makeId("notice"), publishedAt: new Date().toISOString() }, ...current.announcements],
    }));
  }, [commit]);

  const addQuestion = useCallback((question: Omit<QuestionRecord, "id" | "createdAt">) => {
    commit((current) => ({
      ...current,
      questions: [{ ...question, id: makeId("question"), createdAt: new Date().toISOString() }, ...current.questions],
    }));
  }, [commit]);

  const addQuestions = useCallback((questions: Omit<QuestionRecord, "id" | "createdAt">[]) => {
    const timestamp = new Date().toISOString();
    commit((current) => ({
      ...current,
      questions: [
        ...questions.map((question) => ({ ...question, id: makeId("question"), createdAt: timestamp })),
        ...current.questions,
      ],
    }));
  }, [commit]);

  const addMaterial = useCallback((material: Omit<LearningMaterialRecord, "id" | "createdAt">) => {
    commit((current) => ({
      ...current,
      materials: [{ ...material, id: makeId("material"), createdAt: new Date().toISOString() }, ...current.materials],
    }));
  }, [commit]);

  const deleteExam = useCallback((id: string) => {
    commit((current) => ({
      ...current,
      exams: current.exams.filter(exam => exam.id !== id),
    }));
  }, [commit]);

  return { state, saveExam, setExamStatus, deleteExam, addAnnouncement, addQuestion, addQuestions, addMaterial };
}
