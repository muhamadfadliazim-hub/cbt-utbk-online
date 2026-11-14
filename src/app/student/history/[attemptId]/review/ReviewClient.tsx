"use client";
import { ArrowLeft, Printer, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { parseQuestionContent, renderMarkdownWithMath } from "@/lib/renderMath";
import { evaluateQuestionAnswer } from "@/lib/examGrading";

type ReviewQuestion = {
  id: string;
  type: string;
  content: string;
  options: string[];
  statements: { id: string; text: string }[];
  rawOptions: string;
  rawAnswerKey: string;
  answerKey: any;
  explanation: string;
};

type ReviewSection = {
  id: string;
  title: string;
  questions: ReviewQuestion[];
};

export default function ReviewClient({
  examTitle,
  allowPdfDownload,
  sections,
  studentAnswers,
}: {
  examTitle: string;
  allowPdfDownload: boolean;
  sections: ReviewSection[];
  studentAnswers: Record<string, any>;
}) {
  return (
    <div className="flex-col gap-6" style={{ background: "white", padding: "25px", borderRadius: "1rem", minHeight: "100%" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-header { display: block !important; }
          body { background: white !important; }
          .question-card { break-inside: avoid; border: none !important; box-shadow: none !important; margin-bottom: 20px !important; padding: 10px 0 !important; border-bottom: 1px solid #ccc !important; }
        }
      `}</style>

      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Link href="/student/history" style={{ padding: "8px", background: "var(--surface)", borderRadius: "8px", color: "var(--text)", display: "flex" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: "1.5rem", color: "var(--primary)", margin: 0 }}>Pembahasan: {examTitle}</h1>
            <p className="text-muted" style={{ fontSize: "0.9rem", margin: 0 }}>Tinjau ulang soal, kunci jawaban resmi, dan pembahasannya.</p>
          </div>
        </div>
        {allowPdfDownload && (
          <button onClick={() => window.print()} style={{ padding: "10px 20px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <Printer size={18} /> Unduh PDF / Cetak
          </button>
        )}
      </div>

      <div className="print-header" style={{ display: "none" }}>
        <h1 style={{ fontSize: "18pt", textAlign: "center", marginBottom: "20px", color: "black" }}>Pembahasan Soal: {examTitle}</h1>
      </div>

      {sections.length === 0 ? (
        <div className="no-print" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          Soal dan pembahasan untuk paket ini belum tersedia.
        </div>
      ) : (
        sections.map((section) => (
          <div key={section.id} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", color: "var(--text)", paddingBottom: "10px", borderBottom: "2px solid var(--primary)", marginBottom: "1.25rem" }}>
              {section.title}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}>
              {section.questions.map((q, index) => {
                const studentAns = studentAnswers[q.id];
                const evalRes = evaluateQuestionAnswer(
                  { id: q.id, type: q.type, options: q.rawOptions, answerKey: q.rawAnswerKey },
                  studentAns
                );
                const parsed = parseQuestionContent(q.content);

                return (
                  <div key={q.id} className="question-card" style={{ padding: "1.35rem", border: `1.5px solid ${evalRes.isCorrect ? "#A7F3D0" : "var(--border)"}`, borderRadius: "12px", background: "#FAFAF9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <strong style={{ color: "var(--primary)", fontSize: "1.02rem" }}>Soal No. {index + 1}</strong>
                      <span
                        className="status-pill"
                        style={{
                          background: evalRes.isCorrect ? "#ECFDF5" : evalRes.answered ? "#FEF2F2" : "#F1F5F9",
                          color: evalRes.isCorrect ? "#047857" : evalRes.answered ? "#DC2626" : "#64748B",
                        }}
                      >
                        {evalRes.isCorrect ? "Benar" : evalRes.answered ? "Kurang Tepat" : "Tidak Dijawab"}
                      </span>
                    </div>

                    {parsed.stimulus && (
                      <div style={{ padding: "0.9rem 1.1rem", background: "white", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "12px", fontSize: "0.93rem", lineHeight: 1.65 }}>
                        {parsed.stimulusTitle && <strong style={{ display: "block", marginBottom: "6px", color: "var(--primary)" }}>{parsed.stimulusTitle}</strong>}
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(parsed.stimulus) }} />
                      </div>
                    )}

                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(parsed.prompt) }} style={{ lineHeight: 1.65, marginBottom: "12px" }} />

                    {q.type === "PILIHAN_GANDA" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                        {q.options.map((opt, i) => {
                          const letter = String.fromCharCode(65 + i);
                          const isStudentChoice = studentAns === letter || studentAns === opt;
                          const isRightAnswer = q.answerKey === letter || q.answerKey === opt;

                          let bgColor = "white";
                          let borderColor = "var(--border)";
                          if (isRightAnswer) {
                            bgColor = "#ECFDF5";
                            borderColor = "var(--success)";
                          } else if (isStudentChoice) {
                            bgColor = "#FEF2F2";
                            borderColor = "var(--danger)";
                          }

                          return (
                            <div key={i} style={{ display: "flex", padding: "10px 14px", background: bgColor, border: `1.5px solid ${borderColor}`, borderRadius: "8px", alignItems: "center", gap: "10px" }}>
                              <strong style={{ width: "20px" }}>{letter}.</strong>
                              <div dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(opt, true) }} />
                              {isRightAnswer && <CheckCircle2 size={18} color="var(--success)" style={{ marginLeft: "auto", flexShrink: 0 }} />}
                              {isStudentChoice && !isRightAnswer && <XCircle size={18} color="var(--danger)" style={{ marginLeft: "auto", flexShrink: 0 }} />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type === "ISIAN_SINGKAT" && (
                      <div style={{ marginBottom: "14px", display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.92rem" }}>
                        <span>Jawaban Kamu: <strong>{studentAns || "—"}</strong></span>
                        <span>Kunci Resmi: <strong style={{ color: "var(--success)" }}>{Array.isArray(q.answerKey) ? q.answerKey[0] : String(q.answerKey)}</strong></span>
                      </div>
                    )}

                    {q.type === "BENAR_SALAH" && (
                      <div style={{ marginBottom: "14px", background: "white", borderRadius: "8px", border: "1px solid var(--border)", overflow: "hidden" }}>
                        {q.statements.map((st, idx) => {
                          const expected = Array.isArray(q.answerKey) ? q.answerKey[idx] : q.answerKey?.[st.id];
                          const yours = studentAns?.[st.id];
                          return (
                            <div key={st.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "9px 12px", borderBottom: idx < q.statements.length - 1 ? "1px solid var(--border)" : "none", fontSize: "0.9rem" }}>
                              <span><strong>{idx + 1}.</strong> <span dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(st.text, true) }} /></span>
                              <span style={{ whiteSpace: "nowrap" }}>
                                Kamu: <strong>{yours || "—"}</strong> | Kunci: <strong style={{ color: "var(--success)" }}>{expected}</strong>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="explanation-box" style={{ padding: "12px 14px", background: "white", borderRadius: "8px", borderLeft: "4px solid var(--accent)" }}>
                      <strong style={{ display: "block", marginBottom: "4px", color: "var(--text)" }}>
                        Kunci Jawaban: {Array.isArray(q.answerKey) ? q.answerKey.join(", ") : String(q.answerKey)}
                      </strong>
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(q.explanation || "_Tidak ada pembahasan._") }} style={{ lineHeight: 1.6, color: "var(--text-muted)", fontSize: "0.92rem" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
