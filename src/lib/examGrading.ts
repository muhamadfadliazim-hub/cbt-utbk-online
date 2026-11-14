import { estimateAbilityMLE, scaleThetaToScore, StudentResponse } from "./irtEngine";

export type BinaryAnswer = "BENAR" | "SALAH";

export interface ParsedStatement {
  id: string;
  text: string;
}

export function parseQuestionOptions(rawOptions: string | any, type: string): {
  options: string[];
  statements: ParsedStatement[];
} {
  let parsed: any = [];
  if (typeof rawOptions === "string") {
    try {
      parsed = JSON.parse(rawOptions);
    } catch {
      parsed = [];
    }
  } else if (Array.isArray(rawOptions)) {
    parsed = rawOptions;
  }

  if (type === "BENAR_SALAH") {
    const statements: ParsedStatement[] = (Array.isArray(parsed) ? parsed : []).map((item: any, idx: number) => {
      if (typeof item === "string") {
        return { id: `st${idx + 1}`, text: item };
      }
      return {
        id: item?.id || `st${idx + 1}`,
        text: item?.text || String(item ?? ""),
      };
    });
    return { options: [], statements };
  }

  return {
    options: Array.isArray(parsed) ? parsed.map((o: any) => String(o)) : [],
    statements: [],
  };
}

export function parseAnswerKeyValue(rawKey: string | any): any {
  if (typeof rawKey !== "string") return rawKey;
  const trimmed = rawKey.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function normalizePositiveInteger(val: string): string | null {
  const cleaned = val.trim().replace(/\s+/g, "");
  if (!/^[0-9]+$/.test(cleaned)) return null;
  const parsed = Number.parseInt(cleaned, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return String(parsed);
}

function resolveOptionToLetter(val: string, options: string[]): string {
  const upper = val.trim().toUpperCase();
  if (["A", "B", "C", "D", "E"].includes(upper) && upper.length === 1) {
    return upper;
  }
  const idx = options.indexOf(val);
  if (idx >= 0) {
    return String.fromCharCode(65 + idx);
  }
  return val.trim();
}

export function evaluateQuestionAnswer(
  question: {
    id: string;
    type: string;
    options: string;
    answerKey: string;
  },
  studentAnswer: any
): { isCorrect: boolean; partialScore: number; answered: boolean } {
  if (studentAnswer === undefined || studentAnswer === null || studentAnswer === "") {
    return { isCorrect: false, partialScore: 0, answered: false };
  }

  const { options, statements } = parseQuestionOptions(question.options, question.type);
  const key = parseAnswerKeyValue(question.answerKey);

  if (question.type === "PILIHAN_GANDA") {
    if (typeof studentAnswer !== "string" || !studentAnswer.trim()) {
      return { isCorrect: false, partialScore: 0, answered: false };
    }
    const studentLetter = resolveOptionToLetter(studentAnswer, options);
    const keyLetter = typeof key === "string" ? resolveOptionToLetter(key, options) : String(key);
    const ok = studentLetter === keyLetter;
    return { isCorrect: ok, partialScore: ok ? 1 : 0, answered: true };
  }

  if (question.type === "PG_KOMPLEKS") {
    const arr = Array.isArray(studentAnswer) ? studentAnswer : [];
    if (arr.length === 0) return { isCorrect: false, partialScore: 0, answered: false };
    const studentSet = new Set(arr.map((a) => resolveOptionToLetter(String(a), options)));
    const keyArr = Array.isArray(key) ? key.map((k: any) => resolveOptionToLetter(String(k), options)) : [String(key)];
    const keySet = new Set(keyArr);
    const exact = studentSet.size === keySet.size && [...keySet].every((k) => studentSet.has(k));
    const hits = [...studentSet].filter((s) => keySet.has(s)).length;
    const wrong = [...studentSet].filter((s) => !keySet.has(s)).length;
    const partial = Math.max(0, (hits - wrong) / Math.max(1, keySet.size));
    return { isCorrect: exact, partialScore: exact ? 1 : partial, answered: true };
  }

  if (question.type === "BENAR_SALAH") {
    const ansObj = typeof studentAnswer === "object" && !Array.isArray(studentAnswer) ? studentAnswer : {};
    if (statements.length === 0 || Object.keys(ansObj).length === 0) {
      return { isCorrect: false, partialScore: 0, answered: false };
    }
    let matched = 0;
    statements.forEach((st, idx) => {
      const expected = Array.isArray(key) ? key[idx] : key?.[st.id];
      if (ansObj[st.id] && expected && String(ansObj[st.id]).toUpperCase() === String(expected).toUpperCase()) {
        matched++;
      }
    });
    const exact = matched === statements.length;
    return {
      isCorrect: exact,
      partialScore: matched / Math.max(1, statements.length),
      answered: Object.keys(ansObj).length > 0,
    };
  }

  if (question.type === "ISIAN_SINGKAT") {
    const raw = String(studentAnswer).trim();
    if (!raw) return { isCorrect: false, partialScore: 0, answered: false };
    const normStudent = normalizePositiveInteger(raw);
    if (!normStudent) return { isCorrect: false, partialScore: 0, answered: true };
    const validList = (Array.isArray(key) ? key : [key])
      .map((k) => normalizePositiveInteger(String(k)))
      .filter((k): k is string => k !== null);
    const ok = validList.includes(normStudent);
    return { isCorrect: ok, partialScore: ok ? 1 : 0, answered: true };
  }

  return { isCorrect: false, partialScore: 0, answered: false };
}

/**
 * IRT 3PL scaling applies only to SNBT / UTBK and TKA SMA.
 * TKA SD and TKA SMP use classical percentage grading on a 0–100 scale.
 */
export function isIrtExamType(examType?: string | null): boolean {
  if (!examType) return true;
  return examType !== "TKA_SD" && examType !== "TKA_SMP";
}

export function scoreExamAttempt(
  sections: {
    id: string;
    title: string;
    questions: {
      id: string;
      type: string;
      options: string;
      answerKey: string;
      difficultyParameter?: number;
      discriminationIndex?: number;
      guessingParameter?: number;
    }[];
  }[],
  answers: Record<string, any>,
  examType?: string | null
) {
  const useIRT = isIrtExamType(examType);
  const allResponses: StudentResponse[] = [];
  let totalCorrect = 0;
  let totalAnswered = 0;
  let totalQuestions = 0;

  const subscores = sections.map((sec) => {
    const secResponses: StudentResponse[] = [];
    let secCorrect = 0;
    let secEarned = 0;

    for (const q of sec.questions) {
      totalQuestions++;
      const res = evaluateQuestionAnswer(q, answers[q.id]);
      if (res.answered) totalAnswered++;
      if (res.isCorrect) {
        totalCorrect++;
        secCorrect++;
      }
      secEarned += res.partialScore;

      const item: StudentResponse = {
        questionId: q.id,
        isCorrect: res.isCorrect,
        partialScore: res.partialScore,
        params: {
          difficulty: q.difficultyParameter ?? 0,
          discrimination: q.discriminationIndex ?? 1,
          guessing: q.type === "PILIHAN_GANDA" ? (q.guessingParameter ?? 0.2) : 0.05,
        },
      };
      allResponses.push(item);
      secResponses.push(item);
    }

    const qCount = Math.max(1, sec.questions.length);
    const secScore = useIRT
      ? secResponses.length === 0 || secCorrect === 0
        ? Math.round((secCorrect / qCount) * 1000)
        : Math.round(scaleThetaToScore(estimateAbilityMLE(secResponses)))
      : Math.round((secEarned / qCount) * 1000) / 10;

    return {
      sectionId: sec.id,
      subject: sec.title,
      score: secScore,
      fullMark: useIRT ? 1000 : 100,
      correct: secCorrect,
      total: sec.questions.length,
    };
  });

  const totalEarned = allResponses.reduce(
    (sum, r) => sum + (r.partialScore ?? (r.isCorrect ? 1 : 0)),
    0
  );
  const overallScore = useIRT
    ? totalAnswered === 0 || totalCorrect === 0
      ? 0
      : Math.round(scaleThetaToScore(estimateAbilityMLE(allResponses)))
    : Math.round((totalEarned / Math.max(1, totalQuestions)) * 1000) / 10;

  return {
    score: overallScore,
    isIRT: useIRT,
    scaleMax: useIRT ? 1000 : 100,
    correctCount: totalCorrect,
    answeredCount: totalAnswered,
    totalQuestions,
    subscores,
  };
}

