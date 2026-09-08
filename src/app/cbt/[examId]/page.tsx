"use client";

import { use, useCallback, useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle, Clock, Crown, Flag, X } from "lucide-react";
import { useAcademyHub } from "@/lib/academyHub";
import { getSupportingSubjects } from "@/lib/supportingSubjects";
import { renderMarkdownWithMath } from "@/lib/renderMath";

type BinaryAnswer = "BENAR" | "SALAH";
type Question = {
  id: string;
  type: "PILIHAN_GANDA" | "PG_KOMPLEKS" | "ISIAN_SINGKAT" | "BENAR_SALAH";
  content: string;
  options?: string[];
  statements?: { id: string; text: string }[];
};

const MOCK_SECTIONS: { id: string; title: string; duration: number; questions: Question[] }[] = [
  {
    id: "s1",
    title: "Penalaran Umum",
    duration: 1800,
    questions: [
      { id: "q1", type: "PILIHAN_GANDA", content: "Jika seluruh peserta yang lolos verifikasi mengikuti ujian, kesimpulan yang paling tepat adalah…", options: ["Semua pendaftar mengikuti ujian", "Sebagian peserta tidak terverifikasi", "Peserta ujian pasti lolos seleksi", "Peserta terverifikasi mengikuti ujian", "Tidak dapat disimpulkan"] },
      {
        id: "q2",
        type: "BENAR_SALAH",
        content: "Tentukan Benar atau Salah untuk setiap pernyataan berikut.",
        statements: [
          { id: "st1", text: "Susunan 25 meja berbentuk persegi 5 × 5 memerlukan 20 kursi di sisi luar." },
          { id: "st2", text: "Susunan 25 meja memanjang memerlukan 50 kursi." },
          { id: "st3", text: "Susunan 18 meja memanjang memerlukan 38 kursi." },
        ],
      },
      { id: "q3", type: "PG_KOMPLEKS", content: "Pilih semua bilangan prima berikut.", options: ["2", "3", "4", "7", "10"] },
    ],
  },
  {
    id: "s2",
    title: "Pengetahuan Kuantitatif",
    duration: 1200,
    questions: [
      { id: "q4", type: "ISIAN_SINGKAT", content: "Akar kuadrat dari 144 adalah…" },
      { id: "q5", type: "PILIHAN_GANDA", content: "Jika x = 2, maka 2x + 5 = …", options: ["7", "8", "9", "10", "11"] },
    ],
  },
];

type AnswerValue = string | string[] | Record<string, BinaryAnswer>;

function examIdentity(examId: string) {
  if (examId.includes("tka-sd")) return { label: "TKA 2026", title: "SD/MI — Bahasa Indonesia & Matematika", color: "#7C3AED", isTka: true };
  if (examId.includes("tka-smp")) return { label: "TKA 2026", title: "SMP/MTs — Bahasa Indonesia & Matematika", color: "#7C3AED", isTka: true };
  if (examId.includes("tka-sma")) return { label: "TKA 2026", title: "SMA/MA/SMK — 3 Wajib & 2 Pilihan", color: "#7C3AED", isTka: true };
  return { label: "SNBT / UTBK", title: "Tryout Eksklusif #01", color: "#0EA5E9", isTka: false };
}

export default function CBTEngine({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const identity = useMemo(() => examIdentity(examId), [examId]);
  const [mounted, setMounted] = useState(false);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [cheatModalVisible, setCheatModalVisible] = useState(false);
  const hasSubmitted = useRef(false);
  const [sectionNotice, setSectionNotice] = useState("");
  const [majorsData, setMajorsData] = useState<any[]>([]);
  const [targetPtn, setTargetPtn] = useState("");
  const [targetProdiId, setTargetProdiId] = useState("");
  const { state: { exams, questions, studentProfile } } = useAcademyHub();

  const exam = useMemo(() => exams.find((e: any) => e.id === examId), [exams, examId]);

  const examSections = useMemo(() => {
    if (!exam) return MOCK_SECTIONS;
    
    const examQuestions = questions.filter((q: any) => q.packageId === examId);
    if (examQuestions.length === 0) return MOCK_SECTIONS; 

    const grouped = examQuestions.reduce((acc: any, q: any) => {
      if (!acc[q.section]) acc[q.section] = [];
      acc[q.section].push({
        ...q,
        statements: q.statements?.map((s: any, i: number) => ({
          ...s,
          id: s.id || `st-${i}`
        }))
      });
      return acc;
    }, {} as Record<string, Question[]>);
    
    let allowedSections = Object.keys(grouped);
    
    if (exam.category === "TKA_SMA" && studentProfile?.targetMajor) {
      const supporting = getSupportingSubjects(studentProfile.targetMajor);
      const allowedNames = ["Bahasa Indonesia", "Matematika", "Bahasa Inggris", ...supporting.subjects];
      allowedSections = allowedSections.filter((s) => allowedNames.some((allowed) => s.toLowerCase().includes(allowed.toLowerCase())));
    }
    
    const defaultDuration = Math.floor(exam.durationMinutes * 60 / allowedSections.length) || 1200;
    
    return allowedSections.map((secName, idx) => ({
      id: `sec-${idx}`,
      title: secName,
      duration: defaultDuration,
      questions: grouped[secName]
    }));
  }, [exam, questions, studentProfile]);

  useEffect(() => {
    if (isFinished) {
      fetch("/data/majors-2027.json")
        .then((res) => res.json())
        .then((data) => setMajorsData(data.majors || []))
        .catch(console.error);
    }
  }, [isFinished]);

  const ptnList = useMemo(() => {
    const list = Array.from(new Set(majorsData.map((m: any) => m.ptn))).filter(Boolean);
    list.sort();
    return list as string[];
  }, [majorsData]);

  const prodiList = useMemo(() => {
    if (!targetPtn) return [];
    return majorsData.filter((m: any) => m.ptn === targetPtn && m.snbt).sort((a: any, b: any) => a.major.localeCompare(b.major));
  }, [majorsData, targetPtn]);

  const selectedProdi = useMemo(() => {
    return majorsData.find((m: any) => m.id === targetProdiId);
  }, [majorsData, targetProdiId]);


  const currentSection = examSections[currentSectionIdx];
  const currentQuestion = currentSection?.questions[currentQIdx];
  const [timeLeft, setTimeLeft] = useState(currentSection?.duration || 1200);

  const handleSectionComplete = useCallback(() => {
    if (currentSectionIdx < examSections.length - 1) {
      const nextIndex = currentSectionIdx + 1;
      setSectionNotice(`${currentSection?.title || 'Subtes'} selesai. Anda masuk ke ${examSections[nextIndex].title}.`);
      setCurrentSectionIdx(nextIndex);
      setCurrentQIdx(0);
      setTimeLeft(examSections[nextIndex].duration);
    } else {
      setIsFinished(true);
    }
  }, [currentSection?.title, currentSectionIdx, examSections]);

  useEffect(() => {
    setMounted(true);
    
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        setTabWarnings(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setIsFinished(true); // Auto-submit on 3rd violation
            alert("Ujian dihentikan paksa karena pelanggaran (berpindah tab melebihi batas).");
          } else {
            setCheatModalVisible(true);
          }
          return newCount;
        });
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isFinished]);

  useEffect(() => {
    if (isFinished && !hasSubmitted.current) {
      hasSubmitted.current = true;
      const submit = async () => {
        setIsSubmitting(true);
        const answeredCount = examSections.flatMap((section) => section.questions).filter(isAnswered).length;
        const total = examSections.flatMap((section) => section.questions).length;
        const score = total > 0 ? (answeredCount / total) * 800 : 0;
        const totalDuration = examSections.reduce((sum, s) => sum + s.duration, 0) / 60;

        try {
          await fetch("/api/student/exams/submit-mock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examId: exam?.id || examId,
              examTitle: exam?.title || "Tryout",
              examType: exam?.category || "SNBT",
              answers,
              score,
              duration: totalDuration,
            }),
          });
        } catch (e) {
          console.error("Failed to submit exam", e);
        } finally {
          setIsSubmitting(false);
        }
      };
      submit();
    }
  }, [isFinished, exam, examId, answers, examSections]);

  useEffect(() => {
    if (isFinished) return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          queueMicrotask(handleSectionComplete);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentSectionIdx, handleSectionComplete, isFinished]);

  const handleAnswer = (value: AnswerValue) => {
    setAnswers((current) => ({ ...current, [currentQuestion.id]: value }));
  };

  const handleMultipleChoice = (option: string) => {
    const current = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] as string[] : [];
    handleAnswer(current.includes(option) ? current.filter((item) => item !== option) : [...current, option]);
  };

  const handleBinary = (statementId: string, answer: BinaryAnswer) => {
    const current = typeof answers[currentQuestion.id] === "object" && !Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] as Record<string, BinaryAnswer> : {};
    handleAnswer({ ...current, [statementId]: answer });
  };

  const isAnswered = (question: Question) => {
    const answer = answers[question.id];
    if (question.type === "BENAR_SALAH") return question.statements?.every((statement) => (answer as Record<string, BinaryAnswer> | undefined)?.[statement.id]) ?? false;
    if (Array.isArray(answer)) return answer.length > 0;
    return typeof answer === "string" && answer.trim().length > 0;
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  if (!mounted) return <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "var(--utbk-bg)" }}>Memuat ujian...</div>;

  if (isFinished) {
    const answeredCount = examSections.flatMap((section) => section.questions).filter(isAnswered).length;
    const total = examSections.flatMap((section) => section.questions).length;
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "calc(100vh - 60px)", background: "var(--utbk-bg)", padding: "2rem" }}>
        <div className="card" style={{ maxWidth: 700, textAlign: "center", padding: "3rem", margin: "0 auto", width: "100%" }}>
          {isSubmitting ? (
            <>
              <div style={{ width: 78, height: 78, borderRadius: "50%", background: "#E2E8F0", display: "grid", placeItems: "center", margin: "0 auto 1.2rem" }}>...</div>
              <h1 style={{ color: "var(--primary)" }}>Sedang menyimpan hasil...</h1>
            </>
          ) : (
            <>
              <div style={{ width: 78, height: 78, borderRadius: "50%", background: "#ECFDF5", display: "grid", placeItems: "center", margin: "0 auto 1.2rem" }}><CheckCircle size={44} color="var(--success)" /></div>
              <h1 style={{ color: "var(--primary)" }}>Ujian berhasil dikirim</h1>
              <p style={{ color: "var(--text-muted)", margin: "0.7rem 0 1.5rem" }}>
                {answeredCount} dari {total} soal terjawab. Hasil Anda sudah tersimpan di Riwayat Tryout. 
                {exam?.category !== "SNBT" ? (
                  <strong style={{ display: "block", marginTop: "10px", fontSize: "1.1rem", color: "var(--primary)" }}>
                    Skor Akhir: {(answeredCount / total * 800).toFixed(0)}
                  </strong>
                ) : (
                  <strong style={{ display: "block", marginTop: "10px", fontSize: "1rem", color: "var(--text)" }}>
                    Skor SNBT Anda akan diproses menggunakan sistem IRT dan akan diumumkan setelah seluruh peserta selesai ujian.
                  </strong>
                )}
              </p>
            </>
          )}
          
          {exam?.category === "SNBT" && (
            <div style={{ background: "var(--surface-hover)", padding: "1.5rem", borderRadius: "var(--radius-lg)", marginBottom: "2rem", textAlign: "left", opacity: isSubmitting ? 0.5 : 1, pointerEvents: isSubmitting ? "none" : "auto" }}>
              <h3 style={{ marginBottom: "1rem" }}>Bandingkan Skormu dengan Target Jurusan (SNBT)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <select className="field" value={targetPtn} onChange={(e) => { setTargetPtn(e.target.value); setTargetProdiId(""); }}>
                  <option value="">-- Pilih PTN --</option>
                  {ptnList.map((ptn) => <option key={ptn} value={ptn}>{ptn}</option>)}
                </select>
                <select className="field" value={targetProdiId} onChange={(e) => setTargetProdiId(e.target.value)} disabled={!targetPtn}>
                  <option value="">-- Pilih Program Studi --</option>
                  {prodiList.map((p: any) => <option key={p.id} value={p.id}>{p.major}</option>)}
                </select>
              </div>
              
              {selectedProdi && selectedProdi.snbt && (
                <div style={{ marginTop: "1.5rem", padding: "1.5rem", background: "white", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: 0, color: "var(--primary)" }}>{selectedProdi.major}</h4>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{selectedProdi.ptn}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Target Aman SNBT</div>
                      <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--primary)" }}>
                        {selectedProdi.snbt.safeTarget}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Karena skor menggunakan sistem IRT, pastikan Anda mengisi dengan teliti dan hindari asal menebak.
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button className="btn btn-primary" onClick={() => window.location.href = "/student"} style={{ marginTop: "1rem" }}>Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 60px)", background: "var(--utbk-bg)", padding: 20, gap: 20 }}>
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "white", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="status-pill" style={{ background: identity.color, color: "white" }}>{identity.label}</span>
            <strong>{identity.title}</strong>
          </div>
          <span className="status-pill" style={{ background: "#FFFBEB", color: "#B45309" }}><Crown size={14} /> Ruang Eksklusif</span>
        </div>


        <div style={{ background: "#EF4444", border: "1px solid #DC2626", padding: "12px 18px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 12, color: "white", fontSize: "0.95rem", boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)" }}>
          <AlertTriangle size={22} strokeWidth={2.5} /> <strong>PERHATIAN PENTING:</strong> Anda tidak dapat kembali ke subtes sebelumnya setelah subtes diselesaikan.
        </div>

        {sectionNotice && <div style={{ background: "#ECFDF5", color: "#065F46", padding: "0.8rem 1rem", borderRadius: "0.8rem" }}>{sectionNotice}</div>}

        {!currentQuestion ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "white", borderRadius: "var(--radius-lg)" }}>
            <h3>Tidak ada soal di paket ujian ini.</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>Pastikan Admin telah meng-input soal untuk subtes yang Anda pilih.</p>
          </div>
        ) : (
        <section style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "2rem", flex: 1, boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.7rem" }}>
            <div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px", fontWeight: 600 }}>Subtes: {examSections[currentSectionIdx].title}</div>
              <h2 style={{ fontSize: "1.15rem", color: "var(--primary)" }}>Soal No. {currentQIdx + 1} <span className="status-pill" style={{ background: "var(--surface-hover)", color: "var(--primary)", marginLeft: 8 }}>{currentQuestion.type.replaceAll("_", " ")}</span></h2>
            </div>
            <button onClick={() => setFlagged((current) => current.includes(currentQuestion.id) ? current.filter((id) => id !== currentQuestion.id) : [...current, currentQuestion.id])} style={{ border: 0, background: "transparent", color: flagged.includes(currentQuestion.id) ? "var(--warning)" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Flag size={18} fill={flagged.includes(currentQuestion.id) ? "currentColor" : "none"} /> Ragu-ragu</button>
          </div>

          <div 
            style={{ fontSize: "1.08rem", lineHeight: 1.8, marginBottom: "1.6rem" }}
            dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(currentQuestion.content) }} 
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {currentQuestion.type === "PILIHAN_GANDA" && currentQuestion.options?.map((option: string, index: number) => (
              <label key={option} style={{ display: "flex", alignItems: "center", gap: 15, padding: 15, border: answers[currentQuestion.id] === option ? "2px solid var(--primary)" : "2px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", background: answers[currentQuestion.id] === option ? "var(--surface-hover)" : "white" }}>
                <input type="radio" name={currentQuestion.id} checked={answers[currentQuestion.id] === option} onChange={() => handleAnswer(option)} style={{ width: 20, height: 20, accentColor: "var(--primary)" }} />
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong>{String.fromCharCode(65 + index)}.</strong> 
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(option, true) }} />
                </span>
              </label>
            ))}

            {currentQuestion.type === "PG_KOMPLEKS" && currentQuestion.options?.map((option: string) => {
              const checked = Array.isArray(answers[currentQuestion.id]) && (answers[currentQuestion.id] as string[]).includes(option);
              return (
                <label key={option} style={{ display: "flex", alignItems: "center", gap: 15, padding: 15, border: checked ? "2px solid var(--accent)" : "2px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", background: checked ? "#FFFBEB" : "white" }}>
                  <input type="checkbox" checked={checked} onChange={() => handleMultipleChoice(option)} style={{ width: 20, height: 20, accentColor: "var(--accent)" }} /> 
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(option, true) }} />
                </label>
              );
            })}

            {currentQuestion.type === "ISIAN_SINGKAT" && <input className="field" value={typeof answers[currentQuestion.id] === "string" ? answers[currentQuestion.id] as string : ""} onChange={(event) => handleAnswer(event.target.value)} placeholder="Ketik jawaban eksak di sini…" style={{ padding: "1rem", fontSize: "1.05rem" }} />}

            {currentQuestion.type === "BENAR_SALAH" && (
              <div className="matrix-table">
                <div className="matrix-row matrix-header">
                  <div className="matrix-cell matrix-statement">Pernyataan</div><div className="matrix-cell">Benar</div><div className="matrix-cell">Salah</div>
                </div>
                {currentQuestion.statements?.map((statement: any, index: number) => {
                  const answer = (answers[currentQuestion.id] as Record<string, BinaryAnswer> | undefined)?.[statement.id];
                  return (
                    <div className="matrix-row" key={statement.id}>
                      <div className="matrix-cell matrix-statement"><strong style={{ marginRight: 8 }}>{index + 1}.</strong><span dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(statement.text, true) }} /></div>
                      <div className="matrix-cell"><button aria-label={`Pernyataan ${index + 1} benar`} className={`matrix-choice ${answer === "BENAR" ? "selected-true" : ""}`} onClick={() => handleBinary(statement.id, "BENAR")}><Check size={18} /></button></div>
                      <div className="matrix-cell"><button aria-label={`Pernyataan ${index + 1} salah`} className={`matrix-choice ${answer === "SALAH" ? "selected-false" : ""}`} onClick={() => handleBinary(statement.id, "SALAH")}><X size={18} /></button></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button className="btn" onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} disabled={currentQIdx === 0} style={{ background: "white", border: "1px solid var(--border)", gap: 8 }}><ArrowLeft size={18} /> Sebelumnya</button>
          {currentQIdx === currentSection.questions.length - 1 ? (
            <button className="btn btn-primary" onClick={handleSectionComplete} style={{ background: "var(--accent)", gap: 8 }}>Selesaikan Subtes <CheckCircle size={18} /></button>
          ) : (
            <button className="btn btn-primary" onClick={() => setCurrentQIdx(currentQIdx + 1)} style={{ gap: 8 }}>Berikutnya <ArrowRight size={18} /></button>
          )}
        </div>
      </main>

      <aside style={{ width: 330, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", textAlign: "center", borderTop: "5px solid var(--danger)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Sisa waktu {currentSection.title}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8 }}><Clock size={30} color="var(--danger)" /><strong style={{ fontSize: "2.4rem", color: "var(--danger)", fontFamily: "Outfit, monospace" }}>{formatTime(timeLeft)}</strong></div>
        </div>
        <div style={{ background: "white", padding: "1.4rem", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", flex: 1 }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>Navigasi Soal</h3>
          {currentSection && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 9 }}>
            {currentSection.questions.map((question: any, index: number) => {
              const answered = isAnswered(question);
              const active = index === currentQIdx;
              const isFlagged = flagged.includes(question.id);
              return <button key={question.id} onClick={() => setCurrentQIdx(index)} style={{ height: 42, borderRadius: 8, border: active ? "2px solid var(--primary)" : "1px solid var(--border)", background: isFlagged ? "#FEF3C7" : answered ? "var(--success)" : active ? "var(--surface-hover)" : "white", color: answered && !isFlagged ? "white" : "var(--text)", fontWeight: 800, cursor: "pointer" }}>{index + 1}</button>;
            })}
          </div>
          )}
          <div style={{ marginTop: "1.5rem", display: "grid", gap: 8, color: "var(--text-muted)", fontSize: "0.8rem" }}>
            <span>Hijau: sudah lengkap</span><span>Kuning: ragu-ragu</span><span>Putih: belum dijawab</span>
          </div>
        </div>
      </aside>
      {cheatModalVisible && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "grid", placeItems: "center" }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", maxWidth: "450px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: "15px", background: "var(--danger-light)", color: "var(--danger)", borderRadius: "50%", marginBottom: "15px" }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "10px" }}>Peringatan!</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Anda terdeteksi keluar dari halaman ujian. Harap tetap di halaman ini. Pelanggaran: <strong>{tabWarnings} / 3</strong>
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--danger)", marginBottom: "20px" }}>
              Jika mencapai 3 kali pelanggaran, ujian akan dihentikan paksa.
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
