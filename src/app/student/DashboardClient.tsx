"use client";
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BellRing, BookOpen, Trophy, Target, Clock, ArrowRight } from 'lucide-react';
import { useAcademyHub } from '@/lib/academyHub';

interface DashboardClientProps {
  firstName: string;
  snbpTargetUniv: string | null;
  snbpTargetMajor: string | null;
  averageScore: number;
  totalExams: number;
  chartData: { name: string; score: number }[];
  nextExam: any;
}

export default function DashboardClient({
  firstName,
  snbpTargetUniv,
  snbpTargetMajor,
  averageScore,
  totalExams,
  chartData,
  nextExam,
}: DashboardClientProps) {
  const { state } = useAcademyHub();
  const latestNotice = state.announcements[0];

  const hasTarget = snbpTargetUniv && snbpTargetMajor;
  const hasData = chartData.length > 0;

  return (
    <div className="flex-col gap-8" style={{ animation: "fadeIn 0.6s ease-out" }}>
      {/* Banner */}
      <div className="card" style={{ 
        background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)", 
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "none",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "10px", fontWeight: "800", color: "white" }}>
            Halo, {firstName}! <span style={{fontSize: "2.5rem"}}>🚀</span>
          </h1>
          <p style={{ opacity: 0.9, fontSize: "1.1rem", color: "white" }}>
            {hasTarget 
              ? <>Target mimpimu di <strong style={{ color: "white" }}>{snbpTargetMajor} {snbpTargetUniv}</strong> semakin dekat. Terus berjuang!</>
              : <>Tentukan target kampus impianmu di fitur Rasionalisasi SNBP!</>
            }
          </p>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "1.2rem 2.5rem", borderRadius: "1rem", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "0.85rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>Rata-rata Skor UTBK</div>
            <div style={{ fontSize: "3rem", fontWeight: "800", color: "#60A5FA", fontFamily: "Outfit, sans-serif", lineHeight: 1 }}>
              {hasData ? averageScore.toFixed(1) : "-"}
            </div>
          </div>
        </div>
      </div>

      {latestNotice && (
        <div className="card" style={{ padding: "1.15rem 1.4rem", display: "flex", gap: "12px", alignItems: "flex-start", borderLeft: "5px solid var(--accent)" }}>
          <BellRing size={21} color="var(--accent)" />
          <div><strong style={{ display: "block" }}>{latestNotice.title}</strong><span style={{ color: "var(--text-muted)", fontSize: "0.86rem" }}>{latestNotice.message}</span></div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Chart */}
          <div className="card">
            <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
              <Trophy size={20} color="var(--accent)" /> Perkembangan Tryout
            </h2>
            <div style={{ height: "300px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", background: "var(--surface)", color: "var(--text)" }}
                      itemStyle={{ color: "var(--accent)", fontWeight: "bold" }}
                    />
                    <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  <p style={{ marginBottom: "10px" }}>Belum ada data tryout.</p>
                  <Link href="/student/exams" className="btn btn-outline" style={{ display: "inline-block", padding: "8px 15px", fontSize: "0.9rem" }}>
                    Mulai Kerjakan Tryout
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Next Tryout */}
          {nextExam && (
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: "1.5rem" }}>Jadwal Terdekat</h2>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-hover)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ background: "white", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                    <Clock size={30} color="var(--accent)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", color: "var(--primary)", marginBottom: "0.3rem" }}>{nextExam.title}</h3>
                    <p className="text-muted" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      Dibuka: {new Date(nextExam.scheduledAt).toLocaleDateString("id-ID", { dateStyle: "medium" })} • Durasi: {nextExam.totalDuration} Menit
                    </p>
                  </div>
                </div>
                <Link href={`/cbt/${nextExam.id}`} className="btn btn-primary" style={{ padding: "0.75rem 2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  Kerjakan <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Mini Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ background: "#EFF6FF", padding: "15px", borderRadius: "12px" }}>
              <BookOpen size={28} color="var(--accent)" />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Total Tryout</p>
              <h3 style={{ fontSize: "1.8rem", color: "var(--primary)", fontFamily: "Outfit, sans-serif" }}>{totalExams} Selesai</h3>
            </div>
          </div>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ background: "#ECFDF5", padding: "15px", borderRadius: "12px" }}>
              <Target size={28} color="var(--success)" />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Rasionalisasi SNBP</p>
              <h3 style={{ fontSize: "1.8rem", color: "var(--success)", fontFamily: "Outfit, sans-serif" }}>
                {hasTarget ? "Diset" : "Belum Diset"}
              </h3>
            </div>
          </div>
          
          {/* Quick links */}
          {hasData && (
            <div className="card" style={{ flex: 1 }}>
              <h3 className="card-title" style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>Kelemahan Materi</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "15px" }}>
                <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "500", color: "var(--text)", fontSize: "0.9rem" }}>Data Analisis Subtest akan muncul di sini setelah lebih banyak riwayat ujian.</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
