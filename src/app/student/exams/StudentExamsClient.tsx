"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BellRing, CalendarDays, Clock3, Crown, FileCheck2, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { ExamCategory, examLabels } from "@/lib/academyHub";

const filters: ("ALL" | ExamCategory)[] = ["ALL", "SNBT", "TKA_SD", "TKA_SMP", "TKA_SMA"];

export default function StudentExamsClient({
  initialExams,
  allowedTypes,
  initialQuery = "",
  announcements = [],
}: {
  initialExams: any[];
  allowedTypes: ExamCategory[];
  initialQuery?: string;
  announcements?: { id: string; title: string; message: string }[];
}) {
  const { data: session } = useSession();
  const [activeFilter, setActiveFilter] = useState<"ALL" | ExamCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const availableFilters = useMemo(() => {
    if (allowedTypes.length === 0) return filters;
    return ["ALL" as const, ...allowedTypes];
  }, [allowedTypes]);

  const userEmail = (session?.user as any)?.email || "";
  const userSchool = (session?.user as any)?.schoolName || "";

  const exams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialExams.filter((exam) => {
      if (allowedTypes.length > 0 && !allowedTypes.includes(exam.category)) return false;
      if (activeFilter !== "ALL" && exam.category !== activeFilter) return false;
      if (q && !exam.title.toLowerCase().includes(q) && !(exam.description || "").toLowerCase().includes(q)) {
        return false;
      }

      const hasTargetSchools = exam.targetSchools && exam.targetSchools.length > 0;
      const hasTargetUsers = exam.targetUsers && exam.targetUsers.length > 0;
      if (hasTargetSchools || hasTargetUsers) {
        const matchesSchool = hasTargetSchools && exam.targetSchools!.includes(userSchool);
        const matchesUser = hasTargetUsers && exam.targetUsers!.includes(userEmail);
        if (!matchesSchool && !matchesUser) return false;
      }

      return true;
    });
  }, [initialExams, activeFilter, allowedTypes, userEmail, userSchool, searchQuery]);

  return (
    <div className="flex-col gap-8">
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
            <GraduationCap size={36} color="var(--accent)" /> Pilihan Ujian
          </h1>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1.05rem" }}>
            Tryout resmi UTBK-SNBT 2026 berstandar penuh (7 subtes, 160 soal, 195 menit).
          </p>
        </div>
        <div className="exam-tabs" aria-label="Filter jenis ujian">
          {availableFilters.map((filter) => (
            <button key={filter} className={`exam-tab ${activeFilter === filter ? "active" : ""}`} onClick={() => setActiveFilter(filter)}>
              {filter === "ALL" ? "Semua" : examLabels[filter]}
            </button>
          ))}
        </div>
      </section>

      {activeFilter === "ALL" || activeFilter === "SNBT" ? (
        <section className="card" style={{ padding: "1.15rem 1.4rem", display: "flex", gap: "0.9rem", alignItems: "flex-start", borderLeft: "5px solid #0EA5E9" }}>
          <ShieldCheck size={22} color="#0EA5E9" style={{ flex: "0 0 auto", marginTop: 2 }} />
          <div>
            <strong style={{ display: "block", marginBottom: 4 }}>7 Subtes Resmi UTBK-SNBT 2026 (160 Soal / 195 Menit)</strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.86rem", lineHeight: 1.6 }}>
              1) PU (30 soal: Induktif 10, Deduktif 10, Kuantitatif 10 — 30 mnt), 2) PPU (20 soal — 15 mnt), 3) PBM (20 soal — 25 mnt), 4) PK (20 soal — 20 mnt), 5) LBI (30 soal — 42,5 mnt), 6) LBE (20 soal — 20 mnt), 7) PM (20 soal — 42,5 mnt). Sistem terkunci maju per subtes dengan skoring IRT 3PL.
            </span>
          </div>
        </section>
      ) : (
        <section className="card" style={{ padding: "1.15rem 1.4rem", display: "flex", gap: "0.9rem", alignItems: "flex-start", borderLeft: "5px solid #7C3AED" }}>
          <GraduationCap size={22} color="#7C3AED" style={{ flex: "0 0 auto", marginTop: 2 }} />
          <div>
            <strong style={{ display: "block" }}>Kategori {examLabels[activeFilter]}</strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.86rem", lineHeight: 1.6 }}>
              Paket evaluasi mata pelajaran TKA sesuai jenjang pendidikan.
            </span>
          </div>
        </section>
      )}

      {announcements.length > 0 && (
        <section className="card" style={{ padding: "1rem 1.35rem", display: "flex", gap: "0.8rem", borderLeft: "5px solid var(--accent)" }}>
          <BellRing size={20} color="var(--accent)" style={{ flex: "0 0 auto", marginTop: 2 }} />
          <div>
            <strong style={{ display: "block", fontSize: "0.92rem" }}>{announcements[0].title}</strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>{announcements[0].message}</span>
          </div>
        </section>
      )}

      {searchQuery && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "white", fontSize: "0.9rem" }}>
          <span>Hasil pencarian: <strong>&ldquo;{searchQuery}&rdquo;</strong></span>
          <button
            onClick={() => setSearchQuery("")}
            style={{ background: "rgba(255,255,255,0.2)", color: "white", border: 0, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}
          >
            Reset
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
        {exams.map((exam) => (
          <article className="card" key={exam.id} style={{ padding: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "1.5rem", background: exam.category === "SNBT" ? "linear-gradient(135deg,#0EA5E9,#2563EB)" : "linear-gradient(135deg,#7C3AED,#A855F7)", color: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.7rem" }}>
                <span className="status-pill" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>{examLabels[exam.category as ExamCategory]}</span>
                {exam.access === "EXCLUSIVE" && (
                  <span className="status-pill" style={{ background: "#F59E0B", color: "white" }}>
                    <Crown size={13} /> Eksklusif
                  </span>
                )}
              </div>
              <h2 style={{ color: "white", fontSize: "1.35rem", marginTop: "1rem", lineHeight: 1.35 }}>{exam.title}</h2>
              <p style={{ opacity: 0.9, marginTop: "0.45rem", fontSize: "0.88rem", lineHeight: 1.55 }}>{exam.description}</p>
            </div>
            <div style={{ padding: "1.4rem", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.7rem", marginBottom: "1rem" }}>
                <div style={{ background: "#F8FAFC", padding: "0.75rem", borderRadius: "0.75rem", textAlign: "center" }}>
                  <Clock3 size={18} color="var(--primary)" style={{ margin: "0 auto" }} />
                  <strong style={{ display: "block", fontSize: "0.86rem", marginTop: "4px" }}>{exam.durationMinutes} mnt</strong>
                </div>
                <div style={{ background: "#F8FAFC", padding: "0.75rem", borderRadius: "0.75rem", textAlign: "center" }}>
                  <FileCheck2 size={18} color="var(--primary)" style={{ margin: "0 auto" }} />
                  <strong style={{ display: "block", fontSize: "0.86rem", marginTop: "4px" }}>{exam.questionCount} soal</strong>
                </div>
                <div style={{ background: "#F8FAFC", padding: "0.75rem", borderRadius: "0.75rem", textAlign: "center" }}>
                  <Sparkles size={18} color="var(--accent)" style={{ margin: "0 auto" }} />
                  <strong style={{ display: "block", fontSize: "0.86rem", marginTop: "4px" }}>{exam.sectionCount} subtes</strong>
                </div>
              </div>
              {exam.scheduledAt && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.75rem" }}>
                  <CalendarDays size={17} /> {new Date(exam.scheduledAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} WIB
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "1rem" }}>
                <span className="status-pill" style={{ background: exam.continuousFlow ? "#EFF6FF" : "#F1F5F9", color: exam.continuousFlow ? "#1D4ED8" : "#334155", fontSize: "0.74rem" }}>
                  {exam.continuousFlow ? "Lanjut Terus (1 Timer Total)" : "Per Subtes Terkunci"}
                </span>
                <span className="status-pill" style={{ background: exam.allowEarlyFinish ? "#ECFDF5" : "#FEF3C7", color: exam.allowEarlyFinish ? "#047857" : "#92400E", fontSize: "0.74rem" }}>
                  {exam.allowEarlyFinish ? "Boleh Selesai di Akhir" : "Wajib Tunggu 00:00"}
                </span>
              </div>
              <Link href={`/cbt/${exam.id}`} className="btn btn-primary" style={{ marginTop: "auto", gap: "8px" }}>
                Masuk Ruang Ujian <ArrowRight size={18} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {exams.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          Belum ada paket ujian terbit yang berisi soal untuk kategori ini.
        </div>
      )}
    </div>
  );
}
