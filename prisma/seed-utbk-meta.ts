import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { SNBT_TPS_CURRICULUM } from "./curriculum/snbt-tps";
import { SNBT_LITERASI_CURRICULUM } from "./curriculum/snbt-literasi";
import { TKA_SMA_WAJIB_SAINTEK } from "./curriculum/tka-sma-wajib-saintek";
import { TKA_SMA_SOSHUM } from "./curriculum/tka-sma-soshum";
import { TKA_SMP_SD_CURRICULUM } from "./curriculum/tka-smp-sd";
import { CurriculumSubjectSeed, ProgramExamType } from "./curriculum/types";

const connectionString =
  process.env.DATABASE_URL || "postgresql://muhamadfadliazim@localhost:5300/az_academy_cbt";
const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const ALL_CURRICULUM: CurriculumSubjectSeed[] = [
  ...SNBT_TPS_CURRICULUM,
  ...SNBT_LITERASI_CURRICULUM,
  ...TKA_SMA_WAJIB_SAINTEK,
  ...TKA_SMA_SOSHUM,
  ...TKA_SMP_SD_CURRICULUM,
];

async function main() {
  const existingNotice = await prisma.announcement.findFirst({
    where: { title: { contains: "Tryout Resmi UTBK-SNBT 2026" } },
  });

  if (!existingNotice) {
    await prisma.announcement.create({
      data: {
        title: "Tryout Resmi UTBK-SNBT 2026 — Paket 01 (160 Soal) Telah Dibuka",
        message:
          "Santri Pondok Pesantren Al Abqory dan Nurul Bantaniy dapat langsung mengerjakan Paket 01 (7 subtes resmi: PU, PPU, PBM, PK, LBI, LBE, PM • 160 soal • 195 menit • skoring IRT 3PL) melalui menu Pilihan Ujian.",
        audience: "SNBT",
        priority: "IMPORTANT",
      },
    });
    console.log("✓ Announcement UTBK-SNBT 2026 Paket 01 dibuat.");
  }

  const byProgram: Record<ProgramExamType, { subjects: number; chapters: number; materials: number }> = {
    SNBT: { subjects: 0, chapters: 0, materials: 0 },
    TKA_SMA: { subjects: 0, chapters: 0, materials: 0 },
    TKA_SMP: { subjects: 0, chapters: 0, materials: 0 },
    TKA_SD: { subjects: 0, chapters: 0, materials: 0 },
  };

  for (const subjectSeed of ALL_CURRICULUM) {
    byProgram[subjectSeed.examType].subjects += 1;

    const subject = await prisma.subject.upsert({
      where: { title: subjectSeed.title },
      update: { description: subjectSeed.description },
      create: {
        title: subjectSeed.title,
        description: subjectSeed.description,
      },
    });

    const targetChapterTitles = subjectSeed.chapters.map((c) => c.title);

    await prisma.chapter.deleteMany({
      where: {
        subjectId: subject.id,
        title: { notIn: targetChapterTitles },
      },
    });

    for (let cIdx = 0; cIdx < subjectSeed.chapters.length; cIdx++) {
      const chapSeed = subjectSeed.chapters[cIdx];
      byProgram[subjectSeed.examType].chapters += 1;

      let chapter = await prisma.chapter.findFirst({
        where: { subjectId: subject.id, title: chapSeed.title },
      });

      if (!chapter) {
        chapter = await prisma.chapter.create({
          data: {
            subjectId: subject.id,
            title: chapSeed.title,
            orderIndex: cIdx,
          },
        });
      } else {
        chapter = await prisma.chapter.update({
          where: { id: chapter.id },
          data: { orderIndex: cIdx },
        });
      }

      const targetMaterialTitles = chapSeed.materials.map((m) => m.title);
      await prisma.material.deleteMany({
        where: {
          chapterId: chapter.id,
          title: { notIn: targetMaterialTitles },
        },
      });

      for (let mIdx = 0; mIdx < chapSeed.materials.length; mIdx++) {
        const matSeed = chapSeed.materials[mIdx];
        byProgram[subjectSeed.examType].materials += 1;

        const existingMat = await prisma.material.findFirst({
          where: { chapterId: chapter.id, title: matSeed.title },
        });

        if (!existingMat) {
          await prisma.material.create({
            data: {
              chapterId: chapter.id,
              title: matSeed.title,
              description: matSeed.content,
              type: "ARTICLE",
              url: "/student/learn",
              duration: matSeed.duration,
              orderIndex: mIdx,
              examType: subjectSeed.examType,
              isPublished: true,
              publishedAt: new Date(),
            },
          });
        } else {
          await prisma.material.update({
            where: { id: existingMat.id },
            data: {
              description: matSeed.content,
              type: "ARTICLE",
              duration: matSeed.duration,
              orderIndex: mIdx,
              examType: subjectSeed.examType,
              isPublished: true,
              publishedAt: existingMat.publishedAt ?? new Date(),
            },
          });
        }
      }
    }

    console.log(
      `✓ [${subjectSeed.examType}] ${subjectSeed.title}: ${subjectSeed.chapters.length} bab, ${subjectSeed.chapters.reduce((s, c) => s + c.materials.length, 0)} modul`
    );
  }

  const [dbSubjects, dbChapters, dbPublishedMaterials] = await Promise.all([
    prisma.subject.count(),
    prisma.chapter.count(),
    prisma.material.count({ where: { isPublished: true } }),
  ]);

  console.log("Ringkasan per Program:", JSON.stringify(byProgram));
  console.log(
    `DB Verified -> subjects: ${dbSubjects}, chapters: ${dbChapters}, publishedMaterials: ${dbPublishedMaterials}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
