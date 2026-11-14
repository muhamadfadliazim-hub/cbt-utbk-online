export type ProgramExamType = "SNBT" | "TKA_SMA" | "TKA_SMP" | "TKA_SD";

export interface CurriculumMaterialSeed {
  title: string;
  duration: number;
  content: string;
}

export interface CurriculumChapterSeed {
  title: string;
  materials: CurriculumMaterialSeed[];
}

export interface CurriculumSubjectSeed {
  examType: ProgramExamType;
  title: string;
  description: string;
  chapters: CurriculumChapterSeed[];
}

