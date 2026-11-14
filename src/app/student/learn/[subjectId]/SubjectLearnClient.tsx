"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, Clock, ExternalLink, FileText, PlayCircle } from "lucide-react";
import { renderMarkdownWithMath } from "@/lib/renderMath";
import { toggleMaterialProgressAction } from "@/actions/learn";

interface MaterialItem {
  id: string;
  title: string;
  type: "VIDEO" | "PDF" | "ARTICLE" | string;
  url: string;
  description: string;
  duration: number;
}

interface ChapterItem {
  id: string;
  title: string;
  materials: MaterialItem[];
}

export default function SubjectLearnClient({
  subjectTitle,
  subjectDescription,
  chapters,
  initialCompletedIds,
  initialMaterialId,
}: {
  subjectTitle: string;
  subjectDescription: string;
  chapters: ChapterItem[];
  initialCompletedIds: string[];
  initialMaterialId: string | null;
}) {
  const allMaterials = useMemo(() => chapters.flatMap((c) => c.materials), [chapters]);
  const defaultMat =
    allMaterials.find((m) => m.id === initialMaterialId) || allMaterials[0] || null;

  const [activeMaterial, setActiveMaterial] = useState<MaterialItem | null>(defaultMat);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
  const [toggling, setToggling] = useState(false);

  const handleToggleComplete = async () => {
    if (!activeMaterial) return;
    setToggling(true);
    const res = await toggleMaterialProgressAction(activeMaterial.id);
    setToggling(false);
    if (res.success) {
      setCompletedIds((prev) =>
        res.completed
          ? [...new Set([...prev, activeMaterial.id])]
          : prev.filter((id) => id !== activeMaterial.id)
      );
    }
  };

  if (!activeMaterial) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <h2>Belum ada materi terbit pada mata pelajaran ini.</h2>
        <Link href="/student/learn" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
          Kembali ke Materi Belajar
        </Link>
      </div>
    );
  }

  const isCompleted = completedIds.includes(activeMaterial.id);
  const activeIndex = allMaterials.findIndex((m) => m.id === activeMaterial.id);
  const prevMaterial = activeIndex > 0 ? allMaterials[activeIndex - 1] : null;
  const nextMaterial = activeIndex >= 0 && activeIndex < allMaterials.length - 1 ? allMaterials[activeIndex + 1] : null;
  const subjectDoneCount = allMaterials.filter((m) => completedIds.includes(m.id)).length;

  return (
    <div className="flex-col gap-6" style={{ animation: "fadeIn 0.6s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Link href="/student/learn">
          <button className="btn" style={{ background: "white", padding: "10px", borderRadius: "50%", color: "var(--primary)", border: "none" }}>
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 style={{ fontSize: "1.8rem", color: "white", margin: 0 }}>{subjectTitle}</h1>
          <p style={{ color: "rgba(255,255,255,0.82)", margin: 0 }}>{subjectDescription || "Pelajari modul subtes secara terstruktur."}</p>
        </div>
      </div>

      <div className="learn-reader-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {activeMaterial.type === "VIDEO" ? (
            <div className="card" style={{ padding: 0, overflow: "hidden", background: "black", aspectRatio: "16/9" }}>
              <iframe
                width="100%"
                height="100%"
                src={activeMaterial.url}
                title={activeMaterial.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : activeMaterial.type === "PDF" ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <FileText size={56} color="var(--primary)" style={{ margin: "0 auto 1rem" }} />
              <h2 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>{activeMaterial.title}</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>{activeMaterial.description}</p>
              <a href={activeMaterial.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ gap: 8 }}>
                Buka Dokumen PDF <ExternalLink size={17} />
              </a>
            </div>
          ) : (
            <div className="card" style={{ padding: "2rem", lineHeight: 1.75 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: "0.9rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary)", fontWeight: 700 }}>
                  <BookOpen size={18} /> Materi Fokus &amp; Pembahasan Konsep
                </div>
                {activeMaterial.description?.includes("<svg") && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "3px 10px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 700 }}>
                    Dilengkapi Diagram Konsep
                  </span>
                )}
              </div>
              <div
                className="utbk-prompt-pane learn-markdown-pane"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownWithMath(activeMaterial.description || activeMaterial.title),
                }}
              />
            </div>
          )}

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <span style={{ display: "inline-block", background: "var(--surface-hover)", color: "var(--primary)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "8px" }}>
                  {activeMaterial.type}
                </span>
                <h2 style={{ fontSize: "1.35rem", color: "var(--primary)", marginBottom: "6px" }}>{activeMaterial.title}</h2>
                <div style={{ display: "flex", gap: "15px", color: "var(--text-muted)", fontSize: "0.88rem", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={15} /> {activeMaterial.duration} Menit
                  </span>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleToggleComplete}
                disabled={toggling}
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  background: isCompleted ? "var(--success)" : "var(--primary)",
                }}
              >
                <CheckCircle size={18} />
                {isCompleted ? "Sudah Dipelajari" : "Tandai Selesai"}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", marginTop: "1.1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn"
                disabled={!prevMaterial}
                onClick={() => prevMaterial && setActiveMaterial(prevMaterial)}
                style={{ background: "var(--surface)", border: "1px solid var(--border)", gap: 6, opacity: prevMaterial ? 1 : 0.45 }}
              >
                <ArrowLeft size={16} /> {prevMaterial ? `Sebelumnya: ${prevMaterial.title.slice(0, 28)}…` : "Awal Modul"}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!nextMaterial}
                onClick={() => nextMaterial && setActiveMaterial(nextMaterial)}
                style={{ gap: 6, opacity: nextMaterial ? 1 : 0.45 }}
              >
                {nextMaterial ? `Berikutnya: ${nextMaterial.title.slice(0, 28)}…` : "Akhir Subtes"} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem", height: "fit-content", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.85rem", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1.15rem", color: "var(--primary)", margin: 0 }}>
              Daftar Materi
            </h3>
            <span className="status-pill" style={{ background: "#ECFDF5", color: "#047857" }}>
              {subjectDoneCount}/{allMaterials.length}
            </span>
          </div>
          {chapters.map((chapter) => (
            <div key={chapter.id}>
              <h4 style={{ fontSize: "0.95rem", color: "var(--text)", marginBottom: "8px", fontWeight: 700 }}>{chapter.title}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {chapter.materials.map((mat) => {
                  const active = mat.id === activeMaterial.id;
                  const done = completedIds.includes(mat.id);
                  return (
                    <button
                      key={mat.id}
                      onClick={() => setActiveMaterial(mat)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: "0.7rem 0.85rem",
                        borderRadius: "0.65rem",
                        border: active ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: active ? "var(--surface-hover)" : "white",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: "0.86rem", fontWeight: active ? 700 : 500, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                        {mat.type === "VIDEO" ? <PlayCircle size={15} /> : <FileText size={15} />}
                        {mat.title}
                      </span>
                      {done && <CheckCircle size={15} color="var(--success)" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

