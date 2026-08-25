"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

type Question = {
  id: string;
  type: string;
  content: string;
  options: string;
};

type Section = {
  id: string;
  title: string;
  durationMinutes: number;
  questions: Question[];
};

type ExamTakingClientProps = {
  exam: {
    id: string;
    title: string;
    totalDuration: number;
    sections: Section[];
  };
  attemptId: string;
};

export default function ExamTakingClient({ exam, attemptId }: ExamTakingClientProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(exam.totalDuration * 60);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentSection = exam.sections[currentSectionIdx];
  const currentQuestion = currentSection?.questions[currentQuestionIdx];

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/student/exams/${exam.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers })
      });
      if (res.ok) {
        router.push("/student/history");
      }
    } catch (error) {
      console.error(error);
    }
    setIsSubmitting(false);
  };

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (val: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: val });
  };

  if (!currentQuestion) return <div>Loading...</div>;

  const parsedOptions = JSON.parse(currentQuestion.options || "[]");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderBottom: "1px solid var(--border)", background: "white" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{exam.title}</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Bagian: {currentSection.title}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: timeLeft < 300 ? "var(--danger-light)" : "var(--primary-light)", color: timeLeft < 300 ? "var(--danger)" : "var(--primary)", padding: "8px 15px", borderRadius: "20px", fontWeight: "bold" }}>
            <Clock size={18} /> {formatTime(timeLeft)}
          </div>
          <button 
            onClick={() => { if(confirm("Kumpulkan ujian sekarang?")) handleSubmit() }}
            style={{ padding: "8px 20px", background: "var(--accent)", color: "white", borderRadius: "20px", border: "none", fontWeight: "bold", cursor: "pointer" }}>
            {isSubmitting ? "Menyimpan..." : "Selesai"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: Question Area */}
        <div style={{ flex: 1, padding: "30px", overflowY: "auto", borderRight: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", marginBottom: "30px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem", flexShrink: 0 }}>
              {currentQuestionIdx + 1}
            </div>
            <div style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "var(--text)", paddingTop: "8px" }} dangerouslySetInnerHTML={{ __html: currentQuestion.content }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginLeft: "55px" }}>
            {parsedOptions.map((opt: any, idx: number) => {
              const isSelected = answers[currentQuestion.id] === opt.value || answers[currentQuestion.id] === opt;
              const optVal = typeof opt === 'string' ? opt : opt.value;
              return (
                <div 
                  key={idx}
                  onClick={() => handleAnswer(optVal)}
                  style={{ 
                    padding: "15px 20px", 
                    borderRadius: "var(--radius-md)", 
                    border: `2px solid ${isSelected ? "var(--primary)" : "var(--border)"}`, 
                    background: isSelected ? "var(--primary-light)" : "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: `2px solid ${isSelected ? "var(--primary)" : "var(--text-muted)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isSelected && <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--primary)" }} />}
                  </div>
                  <span style={{ fontSize: "1rem" }}>{optVal}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Navigation Sidebar */}
        <div style={{ width: "300px", background: "white", padding: "20px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "15px" }}>Navigasi Soal</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", overflowY: "auto" }}>
            {currentSection.questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentQuestionIdx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "8px",
                    border: `2px solid ${isCurrent ? "var(--primary)" : isAnswered ? "var(--success)" : "var(--border)"}`,
                    background: isCurrent ? "var(--primary)" : isAnswered ? "var(--success-light)" : "white",
                    color: isCurrent ? "white" : isAnswered ? "var(--success)" : "var(--text)",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          
          <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
            <button 
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(p => p - 1)}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "10px 15px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: currentQuestionIdx === 0 ? "not-allowed" : "pointer" }}>
              <ChevronLeft size={16} /> Prev
            </button>
            <button 
              disabled={currentQuestionIdx === currentSection.questions.length - 1}
              onClick={() => setCurrentQuestionIdx(p => p + 1)}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "10px 15px", background: "var(--primary)", color: "white", border: "none", borderRadius: "var(--radius-sm)", cursor: currentQuestionIdx === currentSection.questions.length - 1 ? "not-allowed" : "pointer" }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
