import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  PU_INDUKTIF_QUESTIONS,
  PU_DEDUKTIF_QUESTIONS,
  PU_KUANTITATIF_QUESTIONS,
  SeedQuestion,
} from "./utbk-paket1/pu";
import { PPU_QUESTIONS, PBM_QUESTIONS } from "./utbk-paket1/ppu_pbm";
import { PK_QUESTIONS } from "./utbk-paket1/pk";
import { LBI_QUESTIONS, LBE_QUESTIONS } from "./utbk-paket1/lbi_lbe";
import { PM_QUESTIONS } from "./utbk-paket1/pm";

const connectionString =
  process.env.DATABASE_URL || "postgresql://muhamadfadliazim@localhost:5300/az_academy_cbt";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const EXAM_ID = "utbk-snbt-2026-paket-01";

interface SubtestSpec {
  title: string;
  description: string;
  durationMinutes: number;
  durationSeconds: number;
  questions: SeedQuestion[];
}

const PU_ALL_QUESTIONS: SeedQuestion[] = [
  ...PU_INDUKTIF_QUESTIONS.map((q, idx) => ({
    ...q,
    orderIndex: idx,
    stimulusTitle: q.stimulusTitle || "Sub-bagian 1: Penalaran Induktif (No. 1–10)",
  })),
  ...PU_DEDUKTIF_QUESTIONS.map((q, idx) => ({
    ...q,
    orderIndex: 10 + idx,
    stimulusTitle: q.stimulusTitle || "Sub-bagian 2: Penalaran Deduktif (No. 11–20)",
  })),
  ...PU_KUANTITATIF_QUESTIONS.map((q, idx) => ({
    ...q,
    orderIndex: 20 + idx,
    stimulusTitle: q.stimulusTitle
      ? `Penalaran Kuantitatif — ${q.stimulusTitle}`
      : "Sub-bagian 3: Penalaran Kuantitatif (No. 21–30)",
  })),
];

const SUBTESTS: SubtestSpec[] = [
  {
    title: "TPS — Penalaran Umum (PU)",
    description: "30 soal • 30 menit (Induktif 10, Deduktif 10, Kuantitatif 10)",
    durationMinutes: 30,
    durationSeconds: 1800,
    questions: PU_ALL_QUESTIONS,
  },
  {
    title: "TPS — Pengetahuan & Pemahaman Umum (PPU)",
    description: "20 soal • 15 menit",
    durationMinutes: 15,
    durationSeconds: 900,
    questions: PPU_QUESTIONS,
  },
  {
    title: "TPS — Pemahaman Bacaan & Menulis (PBM)",
    description: "20 soal • 25 menit",
    durationMinutes: 25,
    durationSeconds: 1500,
    questions: PBM_QUESTIONS,
  },
  {
    title: "TPS — Pengetahuan Kuantitatif (PK)",
    description: "20 soal • 20 menit",
    durationMinutes: 20,
    durationSeconds: 1200,
    questions: PK_QUESTIONS,
  },
  {
    title: "Tes Literasi — Bahasa Indonesia (LBI)",
    description: "30 soal • 42,5 menit (42 menit 30 detik)",
    durationMinutes: 43,
    durationSeconds: 2550,
    questions: LBI_QUESTIONS,
  },
  {
    title: "Tes Literasi — Bahasa Inggris (LBE)",
    description: "20 soal • 20 menit",
    durationMinutes: 20,
    durationSeconds: 1200,
    questions: LBE_QUESTIONS,
  },
  {
    title: "Tes Literasi — Penalaran Matematika (PM)",
    description: "20 soal • 42,5 menit (42 menit 30 detik)",
    durationMinutes: 43,
    durationSeconds: 2550,
    questions: PM_QUESTIONS,
  },
];

async function main() {
  const totalQ = SUBTESTS.reduce((acc, s) => acc + s.questions.length, 0);
  const totalSec = SUBTESTS.reduce((acc, s) => acc + s.durationSeconds, 0);
  console.log(`Seeding ${EXAM_ID}: ${SUBTESTS.length} subtes resmi, ${totalQ} soal, ${totalSec / 60} menit...`);

  // Replace existing sections/questions idempotently while keeping existing Attempts intact if exam exists
  const existing = await prisma.exam.findUnique({ where: { id: EXAM_ID } });
  if (existing) {
    await prisma.section.deleteMany({ where: { examId: EXAM_ID } });
    await prisma.exam.update({
      where: { id: EXAM_ID },
      data: {
        title: "Tryout Resmi UTBK-SNBT 2026 — Paket 01 (160 Soal)",
        description:
          "7 Subtes resmi SNBT 2026: TPS (PU 30/30 mnt, PPU 20/15 mnt, PBM 20/25 mnt, PK 20/20 mnt) & Tes Literasi (LBI 30/42,5 mnt, LBE 20/20 mnt, PM 20/42,5 mnt).",
        type: "SNBT",
        status: "PUBLISHED",
        access: "OPEN",
        totalDuration: 195,
        pesantrenId: null,
        showScore: true,
        showDiscussion: true,
        allowPdfDownload: true,
        scheduledAt: new Date("2026-08-23T08:00:00+07:00"),
      },
    });
  } else {
    await prisma.exam.create({
      data: {
        id: EXAM_ID,
        title: "Tryout Resmi UTBK-SNBT 2026 — Paket 01 (160 Soal)",
        description:
          "7 Subtes resmi SNBT 2026: TPS (PU 30/30 mnt, PPU 20/15 mnt, PBM 20/25 mnt, PK 20/20 mnt) & Tes Literasi (LBI 30/42,5 mnt, LBE 20/20 mnt, PM 20/42,5 mnt).",
        type: "SNBT",
        status: "PUBLISHED",
        access: "OPEN",
        totalDuration: 195,
        pesantrenId: null,
        showScore: true,
        showDiscussion: true,
        allowPdfDownload: true,
        scheduledAt: new Date("2026-08-23T08:00:00+07:00"),
        publishedAt: new Date(),
      },
    });
  }

  for (let sIdx = 0; sIdx < SUBTESTS.length; sIdx++) {
    const spec = SUBTESTS[sIdx];
    const section = await prisma.section.create({
      data: {
        examId: EXAM_ID,
        title: spec.title,
        description: spec.description,
        durationMinutes: spec.durationMinutes,
        durationSeconds: spec.durationSeconds,
        orderIndex: sIdx,
      },
    });

    await prisma.question.createMany({
      data: spec.questions.map((q) => {
        const contentPayload = q.stimulus
          ? JSON.stringify({
              stimulusTitle: q.stimulusTitle,
              stimulus: q.stimulus,
              prompt: q.prompt,
            })
          : q.prompt;

        return {
          sectionId: section.id,
          orderIndex: q.orderIndex,
          type: q.type,
          content: contentPayload,
          options: JSON.stringify(q.options || []),
          answerKey: JSON.stringify(q.answerKey),
          explanation: q.explanation,
          difficultyParameter: q.difficultyParameter ?? (q.type === "PILIHAN_GANDA" ? 0.1 : 0.6),
          discriminationIndex: 1.2,
          guessingParameter: q.type === "PILIHAN_GANDA" ? 0.2 : 0.05,
        };
      }),
    });

    console.log(`  ✓ ${spec.title}: ${spec.questions.length} soal (${spec.durationSeconds}s)`);
  }

  console.log("Selesai seeding Tryout UTBK-SNBT 2026 Paket 01!");
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

