"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, FileText, PlayCircle, Search, Sparkles } from "lucide-react";

type ProgramTab = "SNBT" | "TKA_SMA" | "TKA_SMP" | "TKA_SD";

const PROGRAM_META: { id: ProgramTab; label: string; subtitle: string }[] = [
  { id: "SNBT", label: "UTBK-SNBT", subtitle: "7 Subtes Resmi: PU, PPU, PBM, PK, LBI, LBE, dan PM." },
  { id: "TKA_SMA", label: "TKA SMA", subtitle: "Mapel Wajib (Indonesia, Matematika, Inggris) & Mapel Pilihan Saintek/Soshum." },
  { id: "TKA_SMP", label: "TKA SMP", subtitle: "Bahasa Indonesia dan Matematika SMP/MTs." },
  { id: "TKA_SD", label: "TKA SD", subtitle: "Bahasa Indonesia dan Matematika SD/MI." },
];

const SNBT_SUBJECT_ORDER = [
  "Penalaran Umum (PU)",
  "Pengetahuan & Pemahaman Umum (PPU)",
  "Pemahaman Bacaan & Menulis (PBM)",
  "Pengetahuan Kuantitatif (PK)",
  "Literasi dalam Bahasa Indonesia (LBI)",
  "Literasi dalam Bahasa Inggris (LBE)",
  "Penalaran Matematika (PM)",
];

const SHORT_LABELS: Record<string, string> = {
  "Penalaran Umum (PU)": "1. PU",
  "Pengetahuan & Pemahaman Umum (PPU)": "2. PPU",
  "Pemahaman Bacaan & Menulis (PBM)": "3. PBM",
  "Pengetahuan Kuantitatif (PK)": "4. PK",
  "Literasi dalam Bahasa Indonesia (LBI)": "5. LBI",
  "Literasi dalam Bahasa Inggris (LBE)": "6. LBE",
  "Penalaran Matematika (PM)": "7. PM",
};

function formatSubjectTabLabel(title: string) {
  if (SHORT_LABELS[title]) return SHORT_LABELS[title];
  return title.replace(/^TKA (?:SMA|SMP|SD) · /, "");
}

export default function LearnClient({
  materials,
  completedIds = [],
}: {
  materials: any[];
  completedIds?: string[];
}) {
  const [activeProgram, setActiveProgram] = useState<ProgramTab>("SNBT");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [query, setQuery] = useState("");
  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);

  const programCounts = useMemo(() => {
    const counts: Record<ProgramTab, number> = { SNBT: 0, TKA_SMA: 0, TKA_SMP: 0, TKA_SD: 0 };
    for (const m of materials) {
      const cat = (m.examType || "SNBT") as ProgramTab;
      if (cat in counts) counts[cat] += 1;
    }
    return counts;
  }, [materials]);

  const subjectGroups = useMemo(() => {
    const programMaterials = materials.filter((m) => (m.examType || "SNBT") === activeProgram);
    const map = new Map<
      string,
      {
        subjectId: string;
        subjectTitle: string;
        subjectDescription: string;
        chapters: { chapterId: string; chapterTitle: string; orderIndex: number; items: any[] }[];
        totalItems: number;
      }
    >();

    for (const m of programMaterials) {
      const subjectId = m.chapter?.subjectId || m.chapter?.subject?.id || "umum";
      const subjectTitle = m.chapter?.subject?.title || m.examType || "Materi";
      const subjectDescription = m.chapter?.subject?.description || "";
      const chapterId = m.chapter?.id || "umum";
      const chapterTitle = m.chapter?.title || "Daftar Topik";
      const orderIndex = m.chapter?.orderIndex ?? 99;

      if (!map.has(subjectId)) {
        map.set(subjectId, {
          subjectId,
          subjectTitle,
          subjectDescription,
          chapters: [],
          totalItems: 0,
        });
      }

      const group = map.get(subjectId)!;
      group.totalItems += 1;
      let chap = group.chapters.find((c) => c.chapterId === chapterId);
      if (!chap) {
        chap = { chapterId, chapterTitle, orderIndex, items: [] };
        group.chapters.push(chap);
      }
      chap.items.push(m);
    }

    const list = Array.from(map.values());
    if (activeProgram === "SNBT") {
      list.sort((a, b) => {
        const ia = SNBT_SUBJECT_ORDER.indexOf(a.subjectTitle);
        const ib = SNBT_SUBJECT_ORDER.indexOf(b.subjectTitle);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.subjectTitle.localeCompare(b.subjectTitle);
      });
    }
    for (const g of list) {
      g.chapters.sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return list;
  }, [materials, activeProgram]);

  useEffect(() => {
    if (subjectGroups.length === 0) {
      setSelectedSubjectId("");
      return;
    }
    if (!subjectGroups.some((g) => g.subjectId === selectedSubjectId)) {
      setSelectedSubjectId(subjectGroups[0].subjectId);
    }
  }, [subjectGroups, selectedSubjectId]);

  const activeGroup = useMemo(() => {
    return subjectGroups.find((g) => g.subjectId === selectedSubjectId) || subjectGroups[0] || null;
  }, [subjectGroups, selectedSubjectId]);

  const filteredChapters = useMemo(() => {
    if (!activeGroup) return [];
    const q = query.trim().toLowerCase();
    if (!q) return activeGroup.chapters;
    return activeGroup.chapters
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (m) =>
            m.title?.toLowerCase().includes(q) ||
            c.chapterTitle.toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [activeGroup, query]);

  const totalCompleted = useMemo(
    () => materials.filter((m) => completedSet.has(m.id)).length,
    [materials, completedSet]
  );

  const activeProgramMeta = PROGRAM_META.find((p) => p.id === activeProgram)!;

  return (
    <div className="flex-col gap-6" style={{ animation: "fadeIn 0.6s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2.1rem", color: "white", display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.4rem" }}>
            <BookOpen size={34} color="var(--accent)" /> Materi Inti Lengkap — SNBT &amp; TKA
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.85)", margin: 0 }}>
            Pilih program ujian (SNBT, TKA SMA, TKA SMP, TKA SD), lalu pilih subtes/mata pelajaran untuk fokus mempelajari materi intinya.
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.14)", color: "white", padding: "0.75rem 1.25rem", borderRadius: "0.9rem", border: "1px solid rgba(255,255,255,0.22)", fontWeight: 700, fontSize: "0.92rem" }}>
          Total Selesai: {totalCompleted} / {materials.length} Materi
        </div>
      </div>

      {/* Level 1: Pemisahan Program SNBT / TKA SMA / TKA SMP / TKA SD */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "0.85rem" }}>
        {PROGRAM_META.map((prog) => {
          const isActive = activeProgram === prog.id;
          return (
            <button
              key={prog.id}
              type="button"
              onClick={() => {
                setActiveProgram(prog.id);
                setQuery("");
              }}
              style={{
                textAlign: "left",
                padding: "1rem 1.15rem",
                borderRadius: "1rem",
                border: isActive ? "2px solid white" : "1px solid rgba(255,255,255,0.25)",
                background: isActive ? "white" : "rgba(255,255,255,0.12)",
                color: isActive ? "var(--primary)" : "white",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: "4px" }}>
                <strong style={{ fontSize: "1.05rem" }}>{prog.label}</strong>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: isActive ? "#EFF6FF" : "rgba(255,255,255,0.2)",
                    color: isActive ? "#1D4ED8" : "white",
                  }}
                >
                  {programCounts[prog.id]} Modul
                </span>
              </div>
              <span style={{ fontSize: "0.78rem", opacity: isActive ? 0.8 : 0.85, display: "block", lineHeight: 1.35 }}>
                {prog.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Level 2: Pemisahan Subtes / Mata Pelajaran dalam Program terpilih */}
      {subjectGroups.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div className="exam-tabs" style={{ marginBottom: 0, flexWrap: "wrap" }}>
            {subjectGroups.map((g) => {
              const isSelected = activeGroup?.subjectId === g.subjectId;
              return (
                <button
                  key={g.subjectId}
                  type="button"
                  className={`exam-tab ${isSelected ? "active" : ""}`}
                  onClick={() => {
                    setSelectedSubjectId(g.subjectId);
                    setQuery("");
                  }}
                >
                  {formatSubjectTabLabel(g.subjectTitle)} ({g.totalItems})
                </button>
              );
            })}
          </div>
          <div style={{ position: "relative", minWidth: "240px", flex: "0 1 300px" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Cari materi ${activeProgramMeta.label}…`}
              style={{ paddingLeft: 36, background: "white" }}
            />
          </div>
        </div>
      )}

      {!activeGroup ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", borderRadius: "1.5rem" }}>
          <Sparkles size={40} color="#3B82F6" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "0.6rem" }}>
            Belum Ada Materi {activeProgramMeta.label}
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto" }}>
            Admin dapat menambahkan materi {activeProgramMeta.label} melalui menu Admin &rarr; Materi Belajar.
          </p>
        </div>
      ) : (
        <section className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", paddingBottom: "1.15rem", borderBottom: "1px solid var(--border)", marginBottom: "1.35rem" }}>
            <div style={{ flex: 1, minWidth: "260px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                <span className="status-pill" style={{ background: "#0F172A", color: "white" }}>
                  {activeProgramMeta.label}
                </span>
                <h2 className="card-title" style={{ margin: 0, fontSize: "1.45rem" }}>{activeGroup.subjectTitle}</h2>
                <span className="status-pill" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                  {activeGroup.chapters.length} Bab • {activeGroup.totalItems} Materi Inti
                </span>
              </div>
              {activeGroup.subjectDescription && (
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                  {activeGroup.subjectDescription}
                </p>
              )}
            </div>
            <Link
              href={`/student/learn/${activeGroup.subjectId}`}
              className="btn btn-primary"
              style={{ gap: 6, padding: "0.65rem 1.2rem" }}
            >
              Mulai Belajar Subtes/Mapel Ini <ArrowRight size={16} />
            </Link>
          </div>

          {filteredChapters.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
              Tidak ada materi yang cocok dengan pencarian <strong>&ldquo;{query}&rdquo;</strong> pada {activeGroup.subjectTitle}.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}>
              {filteredChapters.map((chapter) => (
                <div key={chapter.chapterId}>
                  <h3 style={{ fontSize: "1.02rem", color: "var(--primary)", marginBottom: "0.75rem", fontWeight: 800 }}>
                    {chapter.chapterTitle}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "0.85rem" }}>
                    {chapter.items.map((material) => {
                      const isDone = completedSet.has(material.id);
                      return (
                        <Link
                          key={material.id}
                          href={`/student/learn/${activeGroup.subjectId}?material=${material.id}`}
                          style={{
                            border: `1px solid ${isDone ? "var(--success)" : "var(--border)"}`,
                            borderRadius: "0.9rem",
                            padding: "1.05rem 1.15rem",
                            background: isDone ? "#F0FDF4" : "#F8FAFC",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "0.6rem",
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                            <strong style={{ fontSize: "0.97rem", color: "var(--text)", lineHeight: 1.4 }}>
                              {material.title}
                            </strong>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                              {isDone && <CheckCircle2 size={17} color="var(--success)" />}
                              {material.type === "VIDEO" ? <PlayCircle size={17} color="var(--primary)" /> : <FileText size={17} color="var(--primary)" />}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                              <Clock size={13} /> {material.duration ? `${material.duration} menit` : "Materi fokus"}
                            </span>
                            {material.description?.includes("<svg") && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700 }}>
                                Visual Diagram
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
