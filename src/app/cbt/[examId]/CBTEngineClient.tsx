"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle, Clock, Crown, Flag, Layers, X } from "lucide-react";
import { getSupportingSubjects } from "@/lib/supportingSubjects";
import { parseQuestionContent, renderMarkdownWithMath } from "@/lib/renderMath";
import { CBT_ACTIVE_LOCK_KEY } from "@/components/student/CbtActiveLockGuard";

type BinaryAnswer = "BENAR" | "SALAH";
type Question = {
  id: string;
  type: "PILIHAN_GANDA" | "PG_KOMPLEKS" | "ISIAN_SINGKAT" | "BENAR_SALAH" | string;
  content: string;
  options?: string[];
  statements?: { id: string; text: string }[];
};

export type CBTSection = {
  id: string;
  title: string;
  description?: string | null;
  duration: number;
  questions: Question[];
};

type AnswerValue = string | string[] | Record<string, BinaryAnswer>;

function examIdentity(examId: string, examTitle?: string) {
  if (examId.includes("tka-sd")) return { label: "TKA 2026", title: examTitle || "SD/MI — Bahasa Indonesia & Matematika", color: "#7C3AED", isTka: true };
  if (examId.includes("tka-smp")) return { label: "TKA 2026", title: examTitle || "SMP/MTs — Bahasa Indonesia & Matematika", color: "#7C3AED", isTka: true };
  if (examId.includes("tka-sma")) return { label: "TKA 2026", title: examTitle || "SMA/MA/SMK — 3 Wajib & 2 Pilihan", color: "#7C3AED", isTka: true };
  return { label: "SNBT / UTBK", title: examTitle || "Tryout Resmi UTBK-SNBT", color: "#0EA5E9", isTka: false };
}

export default function CBTEngineClient({
  examId,
  userId,
  initialExam,
  initialSections,
  studentProfile,
}: {
  examId: string;
  userId?: string;
  initialExam: any;
  initialSections?: CBTSection[];
  studentProfile: any;
}) {
  const identity = useMemo(() => examIdentity(examId, initialExam?.title), [examId, initialExam?.title]);
  const [mounted, setMounted] = useState(false);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [cheatModalVisible, setCheatModalVisible] = useState(false);
  const [backLockVisible, setBackLockVisible] = useState(false);
  const hasSubmitted = useRef(false);
  const hasRestoredSession = useRef(false);
  const [sectionNotice, setSectionNotice] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitResult, setSubmitResult] = useState<{
    attemptId?: string;
    category?: string;
    isIRT?: boolean;
    showScore?: boolean;
    showDiscussion?: boolean;
    score?: number | null;
    correctCount?: number | null;
    totalQuestions?: number;
    subscores?: { subject: string; score: number | null; fullMark?: number; correct: number | null; total: number }[];
  } | null>(null);
  const exam = initialExam;
  const isContinuous = Boolean(exam?.continuousFlow);
  const canEarlyFinish = Boolean(exam?.allowEarlyFinish);
  const expectedTimerMode = isContinuous ? "CONTINUOUS" : "PER_SECTION";
  const [earlyConfirmAction, setEarlyConfirmAction] = useState<"NEXT_SECTION" | "FINISH_EXAM" | null>(null);

  const examSections = useMemo(() => {
    const validDbSections = (initialSections || []).filter((s) => s.questions && s.questions.length > 0);
    if (validDbSections.length === 0) return [];

    if (exam?.category === "TKA_SMA" && studentProfile?.targetMajor) {
      const supporting = getSupportingSubjects(studentProfile.targetMajor);
      const allowedNames = ["Bahasa Indonesia", "Matematika", "Bahasa Inggris", ...supporting.subjects];
      const filtered = validDbSections.filter((s) =>
        allowedNames.some((allowed) => s.title.toLowerCase().includes(allowed.toLowerCase()))
      );
      if (filtered.length > 0) return filtered;
    }

    return validDbSections;
  }, [initialSections, exam?.category, studentProfile?.targetMajor]);

  const totalExamDuration = useMemo(
    () => examSections.reduce((sum, s) => sum + s.duration, 0),
    [examSections]
  );

  const currentSection = examSections[currentSectionIdx];
  const currentQuestion = currentSection?.questions[currentQIdx];
  const [timeLeft, setTimeLeft] = useState(() =>
    isContinuous ? totalExamDuration || 1200 : currentSection?.duration || 1200
  );

  const parsedContent = useMemo(
    () => (currentQuestion ? parseQuestionContent(currentQuestion.content) : { prompt: "" }),
    [currentQuestion]
  );

  const advanceSection = useCallback(() => {
    setEarlyConfirmAction(null);
    if (isContinuous) {
      setIsFinished(true);
      return;
    }
    if (currentSectionIdx < examSections.length - 1) {
      const nextIndex = currentSectionIdx + 1;
      setSectionNotice(`${currentSection?.title || "Subtes"} selesai dan dikunci. Anda sekarang masuk ke ${examSections[nextIndex].title}.`);
      setCurrentSectionIdx(nextIndex);
      setCurrentQIdx(0);
      setTimeLeft(examSections[nextIndex].duration);
    } else {
      setIsFinished(true);
    }
  }, [currentSection?.title, currentSectionIdx, examSections, isContinuous]);

  const sessionStorageKey = `utbk-cbt:${userId || "anon"}:${exam?.id || examId}`;

  useEffect(() => {
    if (!hasRestoredSession.current) {
      hasRestoredSession.current = true;
      try {
        const saved =
          window.sessionStorage.getItem(sessionStorageKey) ||
          window.localStorage.getItem(sessionStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            const restoredSecIdx =
              typeof parsed.currentSectionIdx === "number" &&
              parsed.currentSectionIdx >= 0 &&
              parsed.currentSectionIdx < examSections.length
                ? parsed.currentSectionIdx
                : 0;
            setCurrentSectionIdx(restoredSecIdx);
            if (typeof parsed.currentQIdx === "number" && parsed.currentQIdx >= 0) {
              const maxQ = Math.max(0, (examSections[restoredSecIdx]?.questions.length || 1) - 1);
              setCurrentQIdx(Math.min(parsed.currentQIdx, maxQ));
            }
            if (parsed.answers && typeof parsed.answers === "object") {
              setAnswers(parsed.answers);
            }
            if (Array.isArray(parsed.flagged)) {
              setFlagged(parsed.flagged);
            }
            if (
              parsed.timerMode === expectedTimerMode &&
              typeof parsed.timeLeft === "number" &&
              parsed.timeLeft > 0
            ) {
              setTimeLeft(parsed.timeLeft);
            } else {
              setTimeLeft(
                isContinuous
                  ? totalExamDuration || 1200
                  : examSections[restoredSecIdx]?.duration || 1200
              );
            }
          }
        }
      } catch {
        // Ignore storage errors
      }
      setMounted(true);
    }

    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished && examSections.length > 0) {
        setTabWarnings((prev) => prev + 1);
        setCheatModalVisible(true);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFinished && examSections.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = () => {
      if (!isFinished && examSections.length > 0) {
        window.history.pushState({ cbtLocked: true }, "", window.location.href);
        setBackLockVisible(true);
      }
    };

    if (!isFinished && examSections.length > 0) {
      window.history.pushState({ cbtLocked: true }, "", window.location.href);
      try {
        window.localStorage.setItem(
          CBT_ACTIVE_LOCK_KEY,
          JSON.stringify({
            examId: exam?.id || examId,
            userId: userId || undefined,
            expiresAt: Date.now() + 8 * 60 * 60 * 1000,
          })
        );
      } catch {}
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [examSections, expectedTimerMode, isContinuous, isFinished, sessionStorageKey, totalExamDuration, exam?.id, examId, userId]);

  useEffect(() => {
    if (!mounted || isFinished || examSections.length === 0) return;
    try {
      const payload = JSON.stringify({
        timerMode: expectedTimerMode,
        currentSectionIdx,
        currentQIdx,
        answers,
        flagged,
        timeLeft,
      });
      window.sessionStorage.setItem(sessionStorageKey, payload);
      window.localStorage.setItem(sessionStorageKey, payload);
    } catch {
      // Ignore storage errors
    }
  }, [mounted, isFinished, examSections.length, sessionStorageKey, expectedTimerMode, currentSectionIdx, currentQIdx, answers, flagged, timeLeft]);

  const isAnswered = useCallback((question: Question) => {
    const answer = answers[question.id];
    if (question.type === "BENAR_SALAH") {
      return question.statements?.every((statement) => (answer as Record<string, BinaryAnswer> | undefined)?.[statement.id]) ?? false;
    }
    if (Array.isArray(answer)) return answer.length > 0;
    return typeof answer === "string" && answer.trim().length > 0;
  }, [answers]);

  useEffect(() => {
    if (isFinished && !hasSubmitted.current && examSections.length > 0) {
      hasSubmitted.current = true;
      const submit = async () => {
        setIsSubmitting(true);
        setSubmitError("");
        const totalDurationSeconds = examSections.reduce((sum, s) => sum + s.duration, 0);

        try {
          const res = await fetch("/api/student/exams/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examId: exam?.id || examId,
              answers,
              durationSeconds: totalDurationSeconds,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.success) {
            setSubmitResult(data);
            try {
              window.sessionStorage.removeItem(sessionStorageKey);
              window.localStorage.removeItem(sessionStorageKey);
              window.localStorage.removeItem(CBT_ACTIVE_LOCK_KEY);
            } catch {}
          } else {
            setSubmitError(data.error || "Gagal menyimpan hasil ujian ke server.");
            hasSubmitted.current = false;
          }
        } catch (e) {
          console.error("Failed to submit exam", e);
          setSubmitError("Koneksi terputus saat menyimpan ujian. Periksa jaringan Anda.");
          hasSubmitted.current = false;
        } finally {
          setIsSubmitting(false);
        }
      };
      submit();
    }
  }, [isFinished, exam, examId, answers, examSections, sessionStorageKey]);

  const advanceSectionRef = useRef(advanceSection);
  advanceSectionRef.current = advanceSection;

  useEffect(() => {
    if (isFinished || examSections.length === 0) return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          queueMicrotask(() => advanceSectionRef.current());
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isFinished, examSections.length]);

  const handleAnswer = (value: AnswerValue) => {
    setAnswers((current) => ({ ...current, [currentQuestion.id]: value }));
  };

  const handleMultipleChoice = (letter: string) => {
    const current = Array.isArray(answers[currentQuestion.id]) ? (answers[currentQuestion.id] as string[]) : [];
    handleAnswer(current.includes(letter) ? current.filter((item) => item !== letter) : [...current, letter]);
  };

  const handleBinary = (statementId: string, answer: BinaryAnswer) => {
    const current =
      typeof answers[currentQuestion.id] === "object" && !Array.isArray(answers[currentQuestion.id])
        ? (answers[currentQuestion.id] as Record<string, BinaryAnswer>)
        : {};
    handleAnswer({ ...current, [statementId]: answer });
  };

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  const isFirstQuestionOfSection = currentQIdx === 0;
  const isLastQuestionOfSection = currentQIdx >= (currentSection?.questions.length || 1) - 1;
  const isFirstSection = currentSectionIdx === 0;
  const isLastSection = currentSectionIdx >= examSections.length - 1;
  const isVeryLastQuestion = isLastSection && isLastQuestionOfSection;
  const canGoPrevious = isContinuous
    ? !(isFirstSection && isFirstQuestionOfSection)
    : !isFirstQuestionOfSection;
  const canGoNextInFlow = isContinuous ? !isVeryLastQuestion : !isLastQuestionOfSection;

  const handlePreviousQuestion = () => {
    if (currentQIdx > 0) {
      setCurrentQIdx(currentQIdx - 1);
      return;
    }
    if (isContinuous && currentSectionIdx > 0) {
      const prevSectionIdx = currentSectionIdx - 1;
      setCurrentSectionIdx(prevSectionIdx);
      setCurrentQIdx(Math.max(0, (examSections[prevSectionIdx]?.questions.length || 1) - 1));
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestionOfSection) {
      setCurrentQIdx(currentQIdx + 1);
      return;
    }
    if (isContinuous && !isLastSection) {
      setCurrentSectionIdx(currentSectionIdx + 1);
      setCurrentQIdx(0);
    }
  };

  if (!mounted) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "var(--utbk-bg)" }}>
        Memuat ruang ujian UTBK...
      </div>
    );
  }

  if (examSections.length === 0) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "calc(100vh - 70px)", background: "var(--utbk-bg)", padding: "2rem" }}>
        <div className="card" style={{ maxWidth: 540, textAlign: "center", padding: "2.5rem" }}>
          <AlertTriangle size={44} color="var(--warning)" style={{ margin: "0 auto 1rem" }} />
          <h1 style={{ color: "var(--primary)", marginBottom: "0.6rem" }}>Paket Soal Belum Tersedia</h1>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            Paket ujian <strong>{initialExam?.title || examId}</strong> belum memiliki butir soal di database. Pilih paket resmi yang telah berisi soal di halaman Pilihan Ujian.
          </p>
          <Link href="/student/exams" className="btn btn-primary">
            Kembali ke Daftar Ujian
          </Link>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const answeredCount = examSections.flatMap((section) => section.questions).filter(isAnswered).length;
    const total = examSections.flatMap((section) => section.questions).length;
    const canSeeScore = submitResult?.showScore ?? Boolean(exam?.showScore);
    const canSeeDiscussion = submitResult?.showDiscussion ?? Boolean(exam?.showDiscussion);
    const finalScore = canSeeScore ? submitResult?.score : null;

    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "calc(100vh - 70px)", background: "var(--utbk-bg)", padding: "2rem", overflowY: "auto" }}>
        <div className="card" style={{ maxWidth: 780, textAlign: "center", padding: "2.5rem", margin: "0 auto", width: "100%" }}>
          {isSubmitting ? (
            <>
              <div style={{ width: 78, height: 78, borderRadius: "50%", background: "#E2E8F0", display: "grid", placeItems: "center", margin: "0 auto 1.2rem" }}>...</div>
              <h1 style={{ color: "var(--primary)" }}>Memproses &amp; menyimpan jawaban ujian...</h1>
            </>
          ) : submitError ? (
            <>
              <div style={{ width: 78, height: 78, borderRadius: "50%", background: "#FEF2F2", display: "grid", placeItems: "center", margin: "0 auto 1.2rem" }}>
                <AlertTriangle size={40} color="var(--danger)" />
              </div>
              <h1 style={{ color: "var(--danger)" }}>Gagal Mengirim Jawaban</h1>
              <p style={{ color: "var(--text-muted)", margin: "0.7rem 0 1.4rem" }}>{submitError}</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSubmitError("");
                  setIsFinished(false);
                  setTimeout(() => setIsFinished(true), 20);
                }}
              >
                Coba Kirim Ulang
              </button>
            </>
          ) : (
            <>
              <div style={{ width: 78, height: 78, borderRadius: "50%", background: "#ECFDF5", display: "grid", placeItems: "center", margin: "0 auto 1.2rem" }}>
                <CheckCircle size={44} color="var(--success)" />
              </div>
              <h1 style={{ color: "var(--primary)" }}>Ujian Berhasil Dikirim</h1>
              <p style={{ color: "var(--text-muted)", margin: "0.7rem 0 1.2rem" }}>
                <strong>{answeredCount}</strong> dari <strong>{total}</strong> soal terjawab
                {canSeeDiscussion && submitResult?.correctCount !== null && submitResult?.correctCount !== undefined
                  ? ` • Benar: ${submitResult.correctCount} / ${submitResult.totalQuestions}`
                  : ""}
                .
              </p>

              {canSeeScore && finalScore !== null && finalScore !== undefined ? (
                <div style={{ background: "#F8FAFC", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {(submitResult?.isIRT ?? (exam?.category !== "TKA_SD" && exam?.category !== "TKA_SMP"))
                      ? exam?.category === "TKA_SMA"
                        ? "Skor IRT TKA SMA (Skala 200–1000)"
                        : "Estimasi Skor IRT UTBK-SNBT (Skala 200–1000)"
                      : "Nilai Akhir TKA (Skala 0–100)"}
                  </div>
                  <div style={{ fontSize: "2.6rem", fontWeight: 900, color: "var(--primary)", marginTop: 4 }}>{finalScore}</div>

                  {submitResult?.subscores && submitResult.subscores.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "0.65rem", marginTop: "1rem", textAlign: "left" }}>
                      {submitResult.subscores.map((s, idx) => (
                        <div key={idx} style={{ background: "white", border: "1px solid var(--border)", borderRadius: "0.65rem", padding: "0.65rem 0.8rem" }}>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>{s.subject}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                            <strong style={{ color: "var(--primary)", fontSize: "1.05rem" }}>
                              {s.score ?? "-"}
                              {s.score !== null && s.fullMark ? <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--text-muted)" }}> /{s.fullMark}</span> : null}
                            </strong>
                            {canSeeDiscussion && s.correct !== null && (
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.correct}/{s.total} benar</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: "#F8FAFC", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.5rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                  Skor dan rincian benar/salah dikontrol oleh Admin. Hasil resmi akan muncul di halaman Riwayat &amp; Raport setelah Admin mengizinkannya.
                </div>
              )}

              {studentProfile?.targetUniv && studentProfile?.targetMajor && (
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "0.85rem", padding: "0.95rem 1.2rem", marginBottom: "1.4rem", textAlign: "left", fontSize: "0.9rem", color: "#1E3A8A" }}>
                  Target PTN &amp; Program Studi Anda: <strong>{studentProfile.targetMajor} — {studentProfile.targetUniv}</strong>.{" "}
                  <Link href="/student/passing-grade" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}>
                    Cek peluang passing grade →
                  </Link>
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: "0.85rem", flexWrap: "wrap" }}>
            {submitResult?.attemptId && canSeeDiscussion && (
              <Link href={`/student/history/${submitResult.attemptId}/review`} className="btn btn-primary" style={{ background: "var(--accent)", gap: 8 }}>
                <BookOpen size={18} /> Lihat Pembahasan &amp; Kunci
              </Link>
            )}
            <Link href="/student/history" className="btn btn-primary" style={{ gap: 8 }}>
              Lihat Riwayat &amp; Raport
            </Link>
            <Link href="/student/profile" className="btn" style={{ background: "white", border: "1px solid var(--border)" }}>
              Atur Target PTN &amp; Jurusan
            </Link>
            <button className="btn" onClick={() => (window.location.href = "/student")} style={{ background: "white", border: "1px solid var(--border)" }}>
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-layout">
      <main className="exam-main">
        <div style={{ background: "white", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", boxShadow: "var(--shadow-sm)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="status-pill" style={{ background: identity.color, color: "white" }}>{identity.label}</span>
            <strong>{identity.title}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span className="status-pill" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
              <Layers size={14} /> Subtes {currentSectionIdx + 1} / {examSections.length}
            </span>
            <span className="status-pill" style={{ background: isContinuous ? "#ECFDF5" : "#FFFBEB", color: isContinuous ? "#047857" : "#B45309" }}>
              <Crown size={14} /> {isContinuous ? "Lanjut Terus (1 Timer Total)" : "Per Subtes (Standar UTBK)"}
            </span>
          </div>
        </div>

        <div
          style={{
            background: isContinuous ? "#1D4ED8" : "#EF4444",
            border: `1px solid ${isContinuous ? "#1E40AF" : "#DC2626"}`,
            padding: "10px 16px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "white",
            fontSize: "0.9rem",
          }}
        >
          <AlertTriangle size={20} strokeWidth={2.5} />
          <span>
            {isContinuous ? (
              <>
                <strong>MODE LANJUT TERUS (1 TIMER TOTAL):</strong> Seluruh subtes terhubung hingga akhir dengan 1 waktu total. Anda bebas berpindah antar subtes dan{" "}
                {canEarlyFinish
                  ? "dapat menekan Akhiri & Kumpulkan Ujian di akhir pengerjaan."
                  : "menunggu hingga timer total mencapai 00:00."}
              </>
            ) : (
              <>
                <strong>PERHATIAN:</strong> Sistem subtes terkunci maju. Anda tidak dapat kembali ke subtes sebelumnya setelah waktu habis{canEarlyFinish ? " atau setelah menekan Lanjut Subtes." : "."}
              </>
            )}
          </span>
        </div>

        {sectionNotice && (
          <div style={{ background: "#ECFDF5", color: "#065F46", padding: "0.8rem 1rem", borderRadius: "0.8rem", fontWeight: 600 }}>
            {sectionNotice}
          </div>
        )}

        {!currentQuestion ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "white", borderRadius: "var(--radius-lg)" }}>
            <h3>Tidak ada soal di paket ujian ini.</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>Pastikan Admin telah meng-input soal untuk subtes yang Anda pilih.</p>
          </div>
        ) : (
          <section style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "1.6rem 1.8rem", flex: 1, boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.9rem", marginBottom: "1.25rem", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px", fontWeight: 700 }}>
                  {currentSection.title}
                </div>
                <h2 style={{ fontSize: "1.15rem", color: "var(--primary)", margin: 0 }}>
                  Soal No. {currentQIdx + 1} <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)" }}>dari {currentSection.questions.length}</span>
                  <span className="status-pill" style={{ background: "var(--surface-hover)", color: "var(--primary)", marginLeft: 8, fontSize: "0.75rem" }}>
                    {currentQuestion.type.replaceAll("_", " ")}
                  </span>
                </h2>
              </div>
              <button
                onClick={() =>
                  setFlagged((current) =>
                    current.includes(currentQuestion.id)
                      ? current.filter((id) => id !== currentQuestion.id)
                      : [...current, currentQuestion.id]
                  )
                }
                style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 12px", background: flagged.includes(currentQuestion.id) ? "#FEF3C7" : "white", color: flagged.includes(currentQuestion.id) ? "#B45309" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}
              >
                <Flag size={16} fill={flagged.includes(currentQuestion.id) ? "currentColor" : "none"} /> Ragu-ragu
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: parsedContent.stimulus ? "minmax(280px, 1.05fr) minmax(300px, 1fr)" : "1fr",
                gap: "1.6rem",
                alignItems: "start",
              }}
            >
              {parsedContent.stimulus && (
                <div
                  className="utbk-stimulus-pane"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "1.2rem 1.35rem",
                    maxHeight: "62vh",
                    overflowY: "auto",
                    fontSize: "0.98rem",
                    lineHeight: 1.75,
                  }}
                >
                  {parsedContent.stimulusTitle && (
                    <div style={{ fontWeight: 800, color: "var(--primary)", marginBottom: "0.6rem", fontSize: "0.95rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.45rem" }}>
                      {parsedContent.stimulusTitle}
                    </div>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(parsedContent.stimulus) }} />
                </div>
              )}

              <div>
                <div
                  className="utbk-prompt-pane"
                  style={{ fontSize: "1.05rem", lineHeight: 1.75, marginBottom: "1.35rem" }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(parsedContent.prompt) }}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {currentQuestion.type === "PILIHAN_GANDA" &&
                    currentQuestion.options?.map((option: string, index: number) => {
                      const letter = String.fromCharCode(65 + index);
                      const isSelected = answers[currentQuestion.id] === letter || answers[currentQuestion.id] === option;
                      return (
                        <label
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 14,
                            padding: "13px 15px",
                            border: isSelected ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            background: isSelected ? "var(--surface-hover)" : "white",
                          }}
                        >
                          <input
                            type="radio"
                            name={currentQuestion.id}
                            checked={isSelected}
                            onChange={() => handleAnswer(letter)}
                            style={{ width: 19, height: 19, marginTop: 3, accentColor: "var(--primary)", flexShrink: 0 }}
                          />
                          <span style={{ display: "flex", alignItems: "baseline", gap: "8px", lineHeight: 1.6 }}>
                            <strong style={{ minWidth: "20px" }}>{letter}.</strong>
                            <span dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(option, true) }} />
                          </span>
                        </label>
                      );
                    })}

                  {currentQuestion.type === "PG_KOMPLEKS" &&
                    currentQuestion.options?.map((option: string, index: number) => {
                      const letter = String.fromCharCode(65 + index);
                      const currentArr = Array.isArray(answers[currentQuestion.id]) ? (answers[currentQuestion.id] as string[]) : [];
                      const checked = currentArr.includes(letter) || currentArr.includes(option);
                      return (
                        <label
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 14,
                            padding: "13px 15px",
                            border: checked ? "2px solid var(--accent)" : "1.5px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            background: checked ? "#FFFBEB" : "white",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleMultipleChoice(letter)}
                            style={{ width: 19, height: 19, marginTop: 3, accentColor: "var(--accent)", flexShrink: 0 }}
                          />
                          <span style={{ display: "flex", alignItems: "baseline", gap: "8px", lineHeight: 1.6 }}>
                            <strong style={{ minWidth: "20px" }}>{letter}.</strong>
                            <span dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(option, true) }} />
                          </span>
                        </label>
                      );
                    })}

                  {currentQuestion.type === "ISIAN_SINGKAT" && (
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                        Jawaban Singkat (Bilangan Bulat Positif):
                      </label>
                      <input
                        className="field"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={typeof answers[currentQuestion.id] === "string" ? (answers[currentQuestion.id] as string) : ""}
                        onChange={(event) => {
                          const digitsOnly = event.target.value.replace(/[^0-9]/g, "").replace(/^0+/, "");
                          handleAnswer(digitsOnly);
                        }}
                        placeholder="Masukkan bilangan bulat positif (mis. 18)…"
                        style={{ padding: "0.95rem 1rem", fontSize: "1.1rem", fontWeight: 700, maxWidth: "320px" }}
                      />
                      <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "6px" }}>
                        Hanya menerima bilangan bulat positif (angka 0–9; tanpa koma, titik, pecahan, atau tanda negatif).
                      </span>
                    </div>
                  )}

                  {currentQuestion.type === "BENAR_SALAH" && (
                    <div className="matrix-table">
                      <div className="matrix-row matrix-header">
                        <div className="matrix-cell matrix-statement">Pernyataan</div>
                        <div className="matrix-cell">Benar</div>
                        <div className="matrix-cell">Salah</div>
                      </div>
                      {currentQuestion.statements?.map((statement: any, index: number) => {
                        const answer = (answers[currentQuestion.id] as Record<string, BinaryAnswer> | undefined)?.[statement.id];
                        return (
                          <div className="matrix-row" key={statement.id}>
                            <div className="matrix-cell matrix-statement">
                              <strong style={{ marginRight: 8 }}>{index + 1}.</strong>
                              <span dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(statement.text, true) }} />
                            </div>
                            <div className="matrix-cell">
                              <button
                                type="button"
                                aria-label={`Pernyataan ${index + 1} benar`}
                                className={`matrix-choice ${answer === "BENAR" ? "selected-true" : ""}`}
                                onClick={() => handleBinary(statement.id, "BENAR")}
                              >
                                <Check size={18} />
                              </button>
                            </div>
                            <div className="matrix-cell">
                              <button
                                type="button"
                                aria-label={`Pernyataan ${index + 1} salah`}
                                className={`matrix-choice ${answer === "SALAH" ? "selected-false" : ""}`}
                                onClick={() => handleBinary(statement.id, "SALAH")}
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <button
            className="btn"
            onClick={handlePreviousQuestion}
            disabled={!canGoPrevious}
            style={{ background: "white", border: "1px solid var(--border)", gap: 8 }}
          >
            <ArrowLeft size={18} /> Sebelumnya
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            {canGoNextInFlow ? (
              <button
                className="btn btn-primary"
                onClick={handleNextQuestion}
                style={{ gap: 8 }}
              >
                {isContinuous && isLastQuestionOfSection && !isLastSection
                  ? "Lanjut ke Subtes Berikutnya"
                  : "Berikutnya"}{" "}
                <ArrowRight size={18} />
              </button>
            ) : canEarlyFinish ? (
              !isContinuous && !isLastSection ? (
                <button
                  className="btn"
                  onClick={() => setEarlyConfirmAction("NEXT_SECTION")}
                  style={{ background: "#059669", color: "white", gap: 8 }}
                >
                  Lanjut Subtes Berikutnya <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  className="btn"
                  onClick={() => setEarlyConfirmAction("FINISH_EXAM")}
                  style={{ background: "#059669", color: "white", gap: 8 }}
                >
                  <CheckCircle size={18} /> Akhiri &amp; Kumpulkan Ujian
                </button>
              )
            ) : (
              <button
                className="btn btn-primary"
                disabled
                style={{ gap: 8 }}
              >
                Berikutnya <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </main>

      <aside className="exam-aside">
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", textAlign: "center", borderTop: `5px solid ${isContinuous ? "var(--primary)" : "var(--danger)"}` }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
            {isContinuous ? "Sisa waktu total ujian" : "Sisa waktu subtes ini"}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 6 }}>
            <Clock size={28} color={isContinuous ? "var(--primary)" : "var(--danger)"} />
            <strong style={{ fontSize: "2.35rem", color: isContinuous ? "var(--primary)" : "var(--danger)", fontFamily: "Outfit, monospace" }}>
              {formatTime(timeLeft)}
            </strong>
          </div>
        </div>

        <div style={{ background: "white", padding: "1.25rem", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", flex: 1 }}>
          {isContinuous && examSections.length > 1 && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                Pindah Subtes (Mode Lanjut Terus)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {examSections.map((sec, sIdx) => {
                  const answeredInSec = sec.questions.filter((q) => isAnswered(q)).length;
                  const activeSec = sIdx === currentSectionIdx;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => {
                        setCurrentSectionIdx(sIdx);
                        setCurrentQIdx(0);
                      }}
                      title={sec.title}
                      style={{
                        padding: "5px 9px",
                        borderRadius: "8px",
                        border: activeSec ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: activeSec ? "var(--surface-hover)" : "white",
                        color: activeSec ? "var(--primary)" : "var(--text)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      S{sIdx + 1} ({answeredInSec}/{sec.questions.length})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <h3 style={{ fontSize: "1rem", marginBottom: "0.85rem" }}>Navigasi Soal ({currentSection?.questions.length || 0})</h3>
          {currentSection && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {currentSection.questions.map((question: any, index: number) => {
                const answered = isAnswered(question);
                const active = index === currentQIdx;
                const isFlagged = flagged.includes(question.id);
                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQIdx(index)}
                    style={{
                      height: 40,
                      borderRadius: 8,
                      border: active ? "2px solid var(--primary)" : "1px solid var(--border)",
                      background: isFlagged ? "#FEF3C7" : answered ? "var(--success)" : active ? "var(--surface-hover)" : "white",
                      color: answered && !isFlagged ? "white" : "var(--text)",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ marginTop: "1.2rem", display: "grid", gap: 6, color: "var(--text-muted)", fontSize: "0.78rem" }}>
            <span>Hijau: sudah dijawab</span>
            <span>Kuning: ditandai ragu-ragu</span>
            <span>Putih: belum dijawab</span>
          </div>

          {canEarlyFinish ? (
            <div style={{ marginTop: "1.2rem", display: "grid", gap: "0.55rem" }}>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  setEarlyConfirmAction(!isContinuous && !isLastSection ? "NEXT_SECTION" : "FINISH_EXAM")
                }
                style={{
                  width: "100%",
                  background: "#059669",
                  color: "white",
                  gap: 8,
                  padding: "0.8rem 1rem",
                }}
              >
                <CheckCircle size={18} />
                {!isContinuous && !isLastSection
                  ? "Selesaikan Subtes & Lanjut"
                  : "Akhiri & Kumpulkan Ujian"}
              </button>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
                Admin mengaktifkan opsi selesai langsung di akhir{" "}
                {isContinuous ? "ujian." : "subtes / ujian."}
              </div>
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                marginTop: "1.2rem",
                padding: "0.85rem",
                background: "#F8FAFC",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                fontSize: "0.78rem",
                lineHeight: 1.5,
              }}
            >
              Sesuai pengaturan admin, peserta tidak dapat mengakhiri{" "}
              {isContinuous ? "ujian sebelum timer total" : "subtes atau ujian sebelum timer subtes"}{" "}
              mencapai <strong>00:00</strong>.
            </div>
          )}
        </div>
      </aside>

      {earlyConfirmAction && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.72)", zIndex: 10001, display: "grid", placeItems: "center", padding: "1rem" }}>
          <div style={{ background: "white", padding: "28px", borderRadius: "14px", maxWidth: "460px", width: "100%", textAlign: "center", borderTop: "5px solid #059669" }}>
            <div style={{ display: "inline-flex", padding: "14px", background: "#ECFDF5", color: "#059669", borderRadius: "50%", marginBottom: "14px" }}>
              <CheckCircle size={30} />
            </div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)", marginBottom: "10px" }}>
              {earlyConfirmAction === "NEXT_SECTION"
                ? "Lanjut ke Subtes Berikutnya?"
                : "Akhiri & Kumpulkan Ujian?"}
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "14px", fontSize: "0.94rem" }}>
              {earlyConfirmAction === "NEXT_SECTION" ? (
                <>
                  Subtes <strong>{currentSection?.title}</strong> akan dikunci permanen dan Anda akan langsung masuk ke subtes berikutnya.
                </>
              ) : (
                <>
                  Seluruh jawaban Anda akan dikunci dan dikumpulkan sekarang ({examSections.reduce((sum, sec) => sum + sec.questions.filter((q) => isAnswered(q)).length, 0)} dari{" "}
                  {examSections.reduce((sum, sec) => sum + sec.questions.length, 0)} soal telah dijawab).
                </>
              )}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "18px" }}>
              <button
                type="button"
                className="btn"
                onClick={() => setEarlyConfirmAction(null)}
                style={{ background: "white", border: "1px solid var(--border)" }}
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const action = earlyConfirmAction;
                  setEarlyConfirmAction(null);
                  if (action === "NEXT_SECTION") {
                    advanceSection();
                  } else {
                    setIsFinished(true);
                  }
                }}
                style={{ background: "#059669", color: "white" }}
              >
                {earlyConfirmAction === "NEXT_SECTION" ? "Ya, Lanjut Subtes" : "Ya, Kumpulkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {backLockVisible && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.72)", zIndex: 10000, display: "grid", placeItems: "center", padding: "1rem" }}>
          <div style={{ background: "white", padding: "28px", borderRadius: "14px", maxWidth: "460px", textAlign: "center", borderTop: "5px solid var(--danger)" }}>
            <div style={{ display: "inline-flex", padding: "14px", background: "#FEF2F2", color: "var(--danger)", borderRadius: "50%", marginBottom: "14px" }}>
              <AlertTriangle size={30} />
            </div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)", marginBottom: "10px" }}>Ruang Ujian Terkunci</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "18px", fontSize: "0.95rem" }}>
              {canEarlyFinish ? (
                <>Anda tidak dapat kembali ke halaman Beranda sebelum menyelesaikan dan mengumpulkan ujian ini.</>
              ) : (
                <>
                  Anda tidak dapat kembali ke halaman Beranda atau meninggalkan ruang ujian sebelum seluruh{" "}
                  {isContinuous ? "waktu ujian selesai" : "subtes diselesaikan hingga tuntas"} (timer mencapai <strong>00:00</strong>).
                </>
              )}
            </p>
            <button className="btn btn-primary" onClick={() => setBackLockVisible(false)} style={{ width: "100%" }}>
              Lanjutkan Mengerjakan Ujian
            </button>
          </div>
        </div>
      )}

      {cheatModalVisible && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "grid", placeItems: "center" }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", maxWidth: "450px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: "15px", background: "var(--danger-light)", color: "var(--danger)", borderRadius: "50%", marginBottom: "15px" }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "10px" }}>Peringatan!</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Anda terdeteksi keluar dari halaman ujian. Harap tetap di halaman ini. Catatan perpindahan tab: <strong>{tabWarnings}</strong>
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--danger)", marginBottom: "20px" }}>
              Aktivitas ini dicatat untuk pengawas. Ujian tetap berjalan hingga waktu {isContinuous ? "ujian" : "subtes"} habis.
            </p>
            <button className="btn btn-primary" onClick={() => setCheatModalVisible(false)} style={{ width: "100%" }}>
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
