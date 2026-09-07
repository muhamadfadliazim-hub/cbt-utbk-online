"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BellRing, CalendarDays, Clock3, Crown, ExternalLink, FileCheck2, GraduationCap, Info, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { ExamCategory, examLabels, useAcademyHub } from "@/lib/academyHub";

const filters: ("ALL" | ExamCategory)[] = ["ALL", "SNBT", "TKA_SD", "TKA_SMP", "TKA_SMA"];

export default function ExamCatalogPage() {
  const { state } = useAcademyHub();
  const { data: session } = useSession();
  const [activeFilter, setActiveFilter] = useState<"ALL" | ExamCategory>("ALL");

  const allowedTypes: ExamCategory[] = (session?.user as any)?.allowedExamTypes || [];

  const availableFilters = useMemo(() => {
    if (allowedTypes.length === 0) return filters;
    return ["ALL" as const, ...allowedTypes];
  }, [allowedTypes]);

  const userEmail = (session?.user as any)?.email || "";
  const userSchool = (session?.user as any)?.schoolName || "";

  const exams = useMemo(() => {
    return state.exams.filter((exam) => {
      if (exam.status !== "PUBLISHED") return false;
      if (allowedTypes.length > 0 && !allowedTypes.includes(exam.category)) return false;
      if (activeFilter !== "ALL" && exam.category !== activeFilter) return false;

      const hasTargetSchools = exam.targetSchools && exam.targetSchools.length > 0;
      const hasTargetUsers = exam.targetUsers && exam.targetUsers.length > 0;
      
      if (hasTargetSchools || hasTargetUsers) {
        const matchesSchool = hasTargetSchools && exam.targetSchools!.includes(userSchool);
        const matchesUser = hasTargetUsers && exam.targetUsers!.includes(userEmail);
        
        if (!matchesSchool && !matchesUser) {
          return false;
        }
      }

      return true;
    });
  }, [state.exams, activeFilter, allowedTypes, userEmail, userSchool]);
  const announcements = state.announcements.filter((item) => item.audience === "ALL" || activeFilter === "ALL" || item.audience === activeFilter).slice(0, 3);

  return (
    <div className="flex-col gap-8">
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", color: "white", display: "flex", alignItems: "center", gap: "10px" }}><GraduationCap size={36} color="var(--accent)" /> Pilihan Ujian</h1>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1.05rem" }}>Ruang latihan terpisah untuk SNBT/UTBK dan TKA 2026.</p>
        </div>
        <div className="exam-tabs" aria-label="Filter jenis ujian">
          {availableFilters.map((filter) => (
            <button key={filter} className={`exam-tab ${activeFilter === filter ? "active" : ""}`} onClick={() => setActiveFilter(filter)}>
              {filter === "ALL" ? "Semua" : examLabels[filter]}
            </button>
          ))}
        </div>
      </section>

      <section className="card" style={{ padding: "1.1rem 1.35rem", display: "flex", gap: ".8rem", borderLeft: "5px solid #7C3AED" }}>
        <Info size={22} color="#7C3AED" style={{ flex: "0 0 auto" }} />
        <div><strong style={{ display: "block" }}>Struktur mapel TKA 2026</strong><span style={{ color: "var(--text-muted)", fontSize: ".84rem", lineHeight: 1.55 }}>SD/MI: 2 mapel. SMP/MTs: 2 mapel. SMA/MA/SMK: 5 mapel (3 wajib + 2 pilihan). Semua paket di AZ Academy adalah latihan, bukan ujian resmi dan bukan UTBK-SNBT. </span><a href="https://pusmendik.kemendikdasmen.go.id/tka/" target="_blank" rel="noreferrer" style={{ color: "#6D28D9", fontWeight: 800, fontSize: ".82rem", display: "inline-flex", alignItems: "center", gap: 4 }}>Acuan resmi Pusmendik <ExternalLink size={13} /></a></div>
      </section>

      {announcements.length > 0 && (
        <section className="card" style={{ padding: "1.2rem 1.5rem", borderLeft: "5px solid var(--accent)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <BellRing size={22} color="var(--accent)" />
            <div>
              <strong style={{ display: "block" }}>{announcements[0].title}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>{announcements[0].message}</span>
            </div>
          </div>
        </section>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {exams.map((exam) => (
          <article className="card" key={exam.id} style={{ padding: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "1.5rem", background: exam.category === "SNBT" ? "linear-gradient(135deg,#0EA5E9,#2563EB)" : "linear-gradient(135deg,#7C3AED,#A855F7)", color: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.7rem" }}>
                <span className="status-pill" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>{examLabels[exam.category]}</span>
                {exam.access === "EXCLUSIVE" && <span className="status-pill" style={{ background: "#F59E0B", color: "white" }}><Crown size={13} /> Eksklusif</span>}
              </div>
              <h2 style={{ color: "white", fontSize: "1.35rem", marginTop: "1rem", lineHeight: 1.35 }}>{exam.title}</h2>
              <p style={{ opacity: 0.86, marginTop: "0.45rem", fontSize: "0.88rem", lineHeight: 1.55 }}>{exam.description}</p>
            </div>
            <div style={{ padding: "1.4rem", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.7rem", marginBottom: "1rem" }}>
                <div style={{ background: "#F8FAFC", padding: "0.75rem", borderRadius: "0.75rem", textAlign: "center" }}><Clock3 size={18} color="var(--primary)" style={{ margin: "0 auto" }} /><strong style={{ display: "block", fontSize: "0.86rem", marginTop: "4px" }}>{exam.durationMinutes} mnt</strong></div>
                <div style={{ background: "#F8FAFC", padding: "0.75rem", borderRadius: "0.75rem", textAlign: "center" }}><FileCheck2 size={18} color="var(--primary)" style={{ margin: "0 auto" }} /><strong style={{ display: "block", fontSize: "0.86rem", marginTop: "4px" }}>{exam.questionCount} soal</strong></div>
                <div style={{ background: "#F8FAFC", padding: "0.75rem", borderRadius: "0.75rem", textAlign: "center" }}><Sparkles size={18} color="var(--accent)" style={{ margin: "0 auto" }} /><strong style={{ display: "block", fontSize: "0.86rem", marginTop: "4px" }}>{exam.sectionCount} subtes</strong></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1.1rem" }}>
                <CalendarDays size={17} /> {new Date(exam.scheduledAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} WIB
              </div>
              <Link href={`/cbt/${exam.id}`} className="btn btn-primary" style={{ marginTop: "auto", gap: "8px" }}>
                Masuk Ruang Ujian <ArrowRight size={18} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {exams.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada paket terbit untuk kategori ini.</div>
      )}
    </div>
  );
}
