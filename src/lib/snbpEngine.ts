/**
 * SNBP 2027 planning model.
 *
 * The official framework gives at least 50% weight to all report-card subjects
 * and at most 50% to up to two supporting subjects, achievements and/or a
 * portfolio. Each PTN owns its exact formula, so this engine deliberately
 * returns an estimate and a confidence label instead of a claimed probability.
 * TKA 2026 is treated as a report-card validator, not as UTBK-SNBT.
 */

export type AchievementLevel = "NONE" | "SCHOOL" | "DISTRICT" | "PROVINCE" | "NATIONAL" | "INTERNATIONAL";

export interface AdvancedSNBPData {
  targetUniversity: string;
  targetMajor: string;
  competitiveness: number;
  choiceOrder: 1 | 2;
  isEligible: boolean;
  tkaScore: number;
  tkaSubjectsAligned: boolean;
  achievementCount: number;
  achievementLevel: AchievementLevel;
  portfolioRequired: boolean;
  portfolioScore: number;
  supportingSubjectCount: 1 | 2;
  semesters: {
    average: number;
    supportingSubject1: number;
    supportingSubject2: number;
  }[];
}

const achievementLevelScores: Record<AchievementLevel, number> = {
  NONE: 0,
  SCHOOL: 55,
  DISTRICT: 65,
  PROVINCE: 76,
  NATIONAL: 88,
  INTERNATIONAL: 96,
};

const clamp = (value: number, minimum = 0, maximum = 100) => Math.min(maximum, Math.max(minimum, value));
const average = (values: number[]) => values.reduce((sum, value) => sum + clamp(value), 0) / Math.max(values.length, 1);

export function getAchievementScore(level: AchievementLevel, count: number) {
  if (count <= 0 || level === "NONE") return 0;
  const countBonus = Math.min(3, count) * 1.5;
  return clamp(achievementLevelScores[level] + countBonus);
}

export function calculateAdvancedSNBP(data: AdvancedSNBPData) {
  const overallAvg = average(data.semesters.map((semester) => semester.average));
  const support1Avg = average(data.semesters.map((semester) => semester.supportingSubject1));
  const support2Avg = average(data.semesters.map((semester) => semester.supportingSubject2));
  const supportAvg = data.supportingSubjectCount === 1 ? support1Avg : (support1Avg + support2Avg) / 2;
  const achievementScore = getAchievementScore(data.achievementLevel, data.achievementCount);

  // Neutral 50:50 scenario within the official permitted range. The second
  // component prioritizes the two supporting subjects and only uses evidence
  // that the student actually supplies.
  const evidence: { score: number; weight: number }[] = [{ score: supportAvg, weight: 1 }];
  if (achievementScore > 0) evidence.push({ score: achievementScore, weight: 0.25 });
  if (data.portfolioRequired) evidence.push({ score: clamp(data.portfolioScore), weight: 0.35 });
  const evidenceWeight = evidence.reduce((sum, item) => sum + item.weight, 0);
  const component2Score = evidence.reduce((sum, item) => sum + item.score * item.weight, 0) / evidenceWeight;
  let estimatedIndex = overallAvg * 0.5 + component2Score * 0.5;
  
  // Booster TKA: TKA becomes a major predictive component if available and aligned (40% weight)
  if (data.tkaScore > 0 && data.tkaSubjectsAligned) {
    estimatedIndex = (estimatedIndex * 0.6) + (clamp(data.tkaScore) * 0.4);
  }

  // A competitiveness-derived comparison point. 
  // Base index for 100% tightness is ~75. Each halving of tightness (e.g. 50% -> 25% -> 12.5%) adds ~3 points.
  // We use a linear-log function to map 1%-100% tightness to an 76-92 score range.
  // 1% tightness -> required ~92. 100% tightness -> required ~76.
  const requiredIndex = clamp(76 + ((100 - Math.max(data.competitiveness, 0.1)) / 99) * 16, 76, 95);
  
  const tkaGap = Math.abs(supportAvg - clamp(data.tkaScore));
  const tkaValidation = data.tkaScore <= 0
    ? "BELUM DIISI"
    : !data.tkaSubjectsAligned
      ? "MAPEL TIDAK SELARAS"
      : tkaGap <= 3
        ? "KONSISTEN"
        : tkaGap <= 7
          ? "PERLU DICEK"
          : "SELISIH TINGGI";

  const firstSemester = clamp(data.semesters[0]?.average ?? 0);
  const lastSemester = clamp(data.semesters.at(-1)?.average ?? 0);
  const trend = lastSemester > firstSemester + 2 ? "Konsisten Naik" : lastSemester < firstSemester - 2 ? "Menurun" : "Stabil";

  let probability = "RENDAH";
  if (!data.isEligible) probability = "BELUM ELIGIBLE";
  else if (estimatedIndex >= requiredIndex + 2) probability = "TINGGI";
  else if (estimatedIndex >= requiredIndex - 2) probability = "SEDANG";

  // Penalti TKA: Jika TKA sangat tidak selaras atau selisih tinggi, PTN cenderung memblokir atau meragukan rapor.
  if (tkaValidation === "SELISIH TINGGI" || tkaValidation === "MAPEL TIDAK SELARAS") {
    probability = "RENDAH";
  } else if (tkaValidation === "PERLU DICEK" && probability === "TINGGI") {
    probability = "SEDANG";
  }

  const confidence = !data.isEligible || data.tkaScore <= 0
    ? "DATA BELUM LENGKAP"
    : tkaValidation === "KONSISTEN"
      ? "TINGGI"
      : tkaValidation === "PERLU DICEK"
        ? "SEDANG"
        : "RENDAH";

  const choiceNote = data.choiceOrder === 2
    ? "Pilihan kedua baru diseleksi bila Anda tidak lolos pada pilihan pertama."
    : "Pilihan pertama menjadi prioritas seleksi utama.";

  let diagnostic = `Indeks estimasi ${estimatedIndex.toFixed(2)} dibanding titik kompetitif ${requiredIndex.toFixed(2)} untuk keketatan ${data.competitiveness}%. ${choiceNote}`;
  if (!data.isEligible) {
    diagnostic = "Status eligible adalah syarat masuk SNBP. Minta sekolah memastikan data eligible dan PDSS sebelum membaca hasil rasionalisasi lainnya.";
  } else if (tkaValidation === "BELUM DIISI") {
    diagnostic += " Simulasi saat ini tidak memperhitungkan validasi silang dengan skor TKA (dianggap netral).";
  } else if (!data.tkaSubjectsAligned) {
    diagnostic += " Pilihan mapel TKA belum selaras dengan mapel rapor/prodi, sehingga validasi akademiknya berisiko.";
  } else if (tkaValidation === "SELISIH TINGGI") {
    diagnostic += ` Selisih rata-rata mapel pendukung dan TKA adalah ${tkaGap.toFixed(1)} poin; periksa kembali input atau konsistensi capaian.`;
  } else {
    diagnostic += ` TKA 2026 ${tkaValidation.toLowerCase()} terhadap nilai mapel pendukung.`;
  }

  return {
    overallAvg: Number(overallAvg.toFixed(2)),
    supportAvg: Number(supportAvg.toFixed(2)),
    component2Score: Number(component2Score.toFixed(2)),
    achievementScore: Number(achievementScore.toFixed(2)),
    finalScore: Number(estimatedIndex.toFixed(2)),
    requiredScore: Number(requiredIndex.toFixed(2)),
    trend,
    probability,
    diagnostic,
    tkaGap: Number(tkaGap.toFixed(2)),
    tkaValidation,
    confidence,
  };
}
