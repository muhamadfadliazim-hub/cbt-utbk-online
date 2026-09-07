"use client";
import { useAcademyHub } from "@/lib/academyHub";
import { ArrowLeft, Printer, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function ReviewClient({ 
  examId, 
  examTitle, 
  allowPdfDownload, 
  studentAnswers 
}: { 
  examId: string; 
  examTitle: string; 
  allowPdfDownload: boolean; 
  studentAnswers: Record<string, string>;
}) {
  const { state } = useAcademyHub();
  const questions = state.questions.filter(q => q.packageId === examId);

  // Group by section
  const sections = [...new Set(questions.map(q => q.section))];

  return (
    <div className="flex-col gap-6" style={{ background: "white", padding: "25px", borderRadius: "1rem", minHeight: "100%" }}>
      {/* Hide this top bar when printing */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-header { display: block !important; }
          body { background: white !important; }
          .flex-col { gap: 10px !important; padding: 0 !important; }
          .question-card { break-inside: avoid; border: none !important; box-shadow: none !important; margin-bottom: 20px !important; padding: 10px 0 !important; border-bottom: 1px solid #ccc !important; }
          .explanation-box { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; }
        }
      `}</style>
      
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Link href="/student/history" style={{ padding: "8px", background: "var(--surface)", borderRadius: "8px", color: "var(--text)", display: "flex" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: "1.5rem", color: "var(--primary)", margin: 0 }}>Review: {examTitle}</h1>
            <p className="text-muted" style={{ fontSize: "0.9rem", margin: 0 }}>Tinjau ulang soal dan pelajari pembahasannya.</p>
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

      {questions.length === 0 ? (
        <div className="no-print" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          Soal dan pembahasan untuk paket ini belum tersedia.
        </div>
      ) : (
        sections.map(section => (
          <div key={section} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.3rem", color: "var(--text)", paddingBottom: "10px", borderBottom: "2px solid var(--primary)", marginBottom: "1.5rem" }}>
              Subtes: {section}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {questions.filter(q => q.section === section).map((q, index) => {
                const studentAns = studentAnswers[q.id];
                const isCorrect = studentAns === q.answerKey;

                return (
                  <div key={q.id} className="question-card" style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "12px", background: "var(--surface-hover)" }}>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                      <strong style={{ minWidth: "25px", color: "var(--primary)" }}>{index + 1}.</strong>
                      <div dangerouslySetInnerHTML={{ __html: q.content }} style={{ lineHeight: 1.6 }} />
                    </div>

                    <div style={{ paddingLeft: "35px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "15px" }}>
                      {q.options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const isStudentChoice = studentAns === letter;
                        const isRightAnswer = q.answerKey === letter;
                        
                        let bgColor = "white";
                        let borderColor = "var(--border)";
                        if (isRightAnswer) { bgColor = "#ECFDF5"; borderColor = "var(--success)"; }
                        else if (isStudentChoice) { bgColor = "#FEF2F2"; borderColor = "var(--danger)"; }

                        return (
                          <div key={i} style={{ display: "flex", padding: "10px 15px", background: bgColor, border: `1px solid ${borderColor}`, borderRadius: "8px", alignItems: "flex-start", gap: "10px" }}>
                            <strong style={{ width: "20px" }}>{letter}.</strong>
                            <div dangerouslySetInnerHTML={{ __html: opt }} />
                            {isRightAnswer && <CheckCircle2 size={18} color="var(--success)" style={{ marginLeft: "auto" }} />}
                            {isStudentChoice && !isRightAnswer && <XCircle size={18} color="var(--danger)" style={{ marginLeft: "auto" }} />}
                          </div>
                        )
                      })}
                    </div>

                    <div className="explanation-box" style={{ marginLeft: "35px", padding: "15px", background: "white", borderRadius: "8px", borderLeft: "4px solid var(--accent)" }}>
                      <strong style={{ display: "block", marginBottom: "8px", color: "var(--text)" }}>Kunci Jawaban: {q.answerKey}</strong>
                      <strong style={{ display: "block", marginBottom: "5px", color: "var(--text)" }}>Pembahasan:</strong>
                      <div dangerouslySetInnerHTML={{ __html: q.explanation || "<i>Tidak ada pembahasan khusus untuk soal ini.</i>" }} style={{ lineHeight: 1.6, color: "var(--text-muted)" }} />
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
