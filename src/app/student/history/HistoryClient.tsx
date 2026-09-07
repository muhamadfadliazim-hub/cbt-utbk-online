"use client";
import { useState } from "react";
import { History, CalendarDays, CheckCircle, Award, Target, ChevronDown, ChevronUp, BarChart2, Download, BookOpen } from "lucide-react";
import Link from "next/link";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

type HistoryItem = {
  id: string;
  title: string;
  date: string;
  score: number;
  targetScore: number;
  status: string;
  category: string;
  isIRT: boolean;
  showDiscussion?: boolean;
  allowPdfDownload?: boolean;
  subscores: {
    subject: string;
    score: number;
    fullMark: number;
    correct: number;
    total: number;
  }[];
};

export default function HistoryClient({ historyData }: { historyData: HistoryItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async (item: HistoryItem) => {
    const element = document.getElementById(`raport-${item.id}`);
    if (!element) return;
    
    setIsDownloading(true);
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin:       10,
        filename:     `Raport_${item.title.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Gagal mendownload PDF", error);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    }
    setIsDownloading(false);
  };

  if (!historyData || historyData.length === 0) {
    return (
      <div className="flex-col gap-6" style={{ background: "white", padding: "25px", borderRadius: "1rem", boxShadow: "var(--shadow-sm)", animation: "fadeIn 0.5s ease-out", minHeight: "100%" }}>
        <h1 style={{ fontSize: "2.2rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
          <History size={36} color="var(--accent)" /> Riwayat & Raport Hasil
        </h1>
        <p className="text-muted" style={{ fontSize: "1.1rem" }}>Pantau terus perkembangan nilai dan kelemahan materi Anda.</p>

        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", marginTop: "2rem" }}>
          <History size={64} color="var(--border)" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "0.5rem" }}>Belum Ada Riwayat Ujian</h2>
          <p className="text-muted">Anda belum menyelesaikan tryout atau latihan apa pun. Yuk, mulai kerjakan!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col gap-6" style={{ background: "white", padding: "25px", borderRadius: "1rem", boxShadow: "var(--shadow-sm)", animation: "fadeIn 0.5s ease-out", minHeight: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
            <History size={36} color="var(--accent)" /> Riwayat & Raport Hasil
          </h1>
          <p className="text-muted" style={{ fontSize: "1.1rem" }}>Pantau terus perkembangan nilai dan kelemahan materi Anda.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
        {historyData.map((item) => (
          <div key={item.id} className="card" style={{ padding: 0, overflow: "hidden", border: `1px solid ${expandedId === item.id ? 'var(--primary)' : 'var(--border)'}`, transition: "all 0.3s" }}>
            {/* Header / Summary */}
            <div 
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              style={{ padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: expandedId === item.id ? "var(--surface-hover)" : "var(--surface)" }}
            >
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <div style={{ background: "var(--surface-hover)", width: "60px", height: "60px", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                  <Award size={30} color={item.score >= item.targetScore ? "var(--success)" : "var(--primary)"} />
                </div>
                <div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "5px" }}>
                    <span className="status-pill">{item.category}</span>
                    {item.isIRT && <span className="status-pill" style={{ background: "#FEF2F2", color: "#EF4444" }}>Skoring IRT</span>}
                  </div>
                  <h3 style={{ fontSize: "1.3rem", color: "var(--text)", marginBottom: "3px" }}>{item.title}</h3>
                  <p className="text-muted" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem" }}>
                    <CalendarDays size={14} /> Dikerjakan: {item.date}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                <div style={{ textAlign: "right" }}>
                  <p className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Skor Total</p>
                  <div style={{ fontSize: "2rem", fontWeight: "800", color: item.score >= item.targetScore ? "var(--success)" : "var(--primary)", fontFamily: "Outfit, sans-serif", lineHeight: 1 }}>
                    {item.score.toFixed(1)}
                  </div>
                </div>
                {expandedId === item.id ? <ChevronUp size={24} color="var(--text-muted)" /> : <ChevronDown size={24} color="var(--text-muted)" />}
              </div>
            </div>

            {/* Expanded Details / Raport */}
            {expandedId === item.id && (
              <div style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
                <div style={{ padding: "15px 30px", display: "flex", justifyContent: "flex-end", gap: "10px", background: "white", borderBottom: "1px solid var(--border)" }}>
                  {item.showDiscussion && (
                    <Link href={`/student/history/${item.id}/review`} style={{ padding: "8px 15px", background: "var(--primary)", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <BookOpen size={16} /> Tinjau Pembahasan {item.allowPdfDownload ? "& Unduh Soal" : ""}
                    </Link>
                  )}
                  <button 
                    onClick={() => handleDownloadPDF(item)}
                    disabled={isDownloading}
                    style={{ padding: "8px 15px", background: "var(--success)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: isDownloading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}
                  >
                    <Download size={16} /> {isDownloading ? "Menyiapkan PDF..." : "Unduh PDF"}
                  </button>
                </div>
                
                <div id={`raport-${item.id}`} style={{ padding: "2rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", background: "white" }}>
                  <div>
                    <div style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px dashed var(--border)" }}>
                      <h2 style={{ fontSize: "1.3rem", color: "var(--primary)", marginBottom: "5px" }}>Raport Hasil: {item.title}</h2>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Diselesaikan pada: {item.date}</p>
                    </div>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}><BarChart2 size={18} color="var(--accent)" /> Analisis Subtes</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {item.subscores.map((sub, idx) => {
                      const percentage = (sub.score / sub.fullMark) * 100;
                      return (
                        <div key={idx} style={{ padding: "1rem", background: "var(--surface-hover)", borderRadius: "0.8rem", border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <strong style={{ color: "var(--text)" }}>{sub.subject}</strong>
                            <strong style={{ color: "var(--primary)" }}>{sub.score} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: "normal" }}>/ {sub.fullMark}</span></strong>
                          </div>
                          {/* Progress bar */}
                          <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
                            <div style={{ width: `${percentage}%`, height: "100%", background: percentage > 70 ? "var(--success)" : percentage > 40 ? "var(--warning)" : "var(--danger)", borderRadius: "4px" }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>{sub.correct} dari {sub.total} benar</span>
                            <span style={{ color: "var(--text-muted)" }}>Akurasi: {Math.round((sub.correct / sub.total) * 100)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{ height: "250px", background: "var(--surface-hover)", borderRadius: "1rem", padding: "1rem", border: "1px solid var(--border)" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={item.subscores.map(s => ({ subject: s.subject.split(" ")[0], score: s.score }))}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 1000]} tick={false} />
                        <Tooltip />
                        <Radar name="Skor" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card" style={{ padding: "1.2rem", background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)", border: "1px solid #E2E8F0" }}>
                    <h4 style={{ fontSize: "0.95rem", marginBottom: "10px", color: "var(--text)" }}>Rekomendasi Sistem:</h4>
                    <ul style={{ paddingLeft: "1.2rem", color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "5px" }}>
                      {item.subscores.filter(s => (s.score/s.fullMark) < 0.5).length > 0 ? (
                        item.subscores.filter(s => (s.score/s.fullMark) < 0.5).map((s, i) => (
                          <li key={i}>Fokus tingkatkan materi <strong>{s.subject}</strong>.</li>
                        ))
                      ) : (
                        <li>Pertahankan nilaimu! Semua subtes sudah cukup baik.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
    </div>
  );
}
