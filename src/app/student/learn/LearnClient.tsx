"use client";

import { useState } from "react";
import { BookOpen, Sparkles, ExternalLink, PlayCircle } from "lucide-react";

type MaterialCategory = "ALL" | "TKA_SD" | "TKA_SMP" | "TKA_SMA" | "SNBT";

export default function LearnClient({ materials }: { materials: any[] }) {
  const [activeTab, setActiveTab] = useState<MaterialCategory>("ALL");

  const filteredMaterials = materials.filter(m => activeTab === "ALL" || m.examType === activeTab);

  if (materials.length === 0) {
    return (
      <div className="flex-col gap-8" style={{ animation: "fadeIn 0.6s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2.2rem", color: "white", display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
              <BookOpen size={36} color="var(--accent)" /> Materi Belajar
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)" }}>Pelajari materi UTBK-SNBT dan TKA 2026 yang belum Anda kuasai dengan video interaktif.</p>
          </div>
        </div>

        <div className="card" style={{ textAlign: "center", padding: "5rem 2rem", borderRadius: "1.5rem" }}>
          <div style={{ 
            background: "#EFF6FF", 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 1.5rem" 
          }}>
            <Sparkles size={40} color="#3B82F6" />
          </div>
          <h2 style={{ fontSize: "1.8rem", color: "var(--primary)", marginBottom: "1rem" }}>Segera Hadir!</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "500px", margin: "0 auto" }}>
            Materi belajar interaktif sedang dipersiapkan oleh tim akademik. Terus pantau halaman ini untuk pembaruan selanjutnya!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col gap-8" style={{ animation: "fadeIn 0.6s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", color: "white", display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
            <BookOpen size={36} color="var(--accent)" /> Materi Belajar
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)" }}>Pelajari materi UTBK-SNBT dan TKA 2026 yang belum Anda kuasai dengan video interaktif.</p>
        </div>
      </div>

      <div className="exam-tabs" style={{ marginBottom: "20px" }}>
        <button className={`exam-tab ${activeTab === "ALL" ? "active" : ""}`} onClick={() => setActiveTab("ALL")}>Semua</button>
        <button className={`exam-tab ${activeTab === "TKA_SD" ? "active" : ""}`} onClick={() => setActiveTab("TKA_SD")}>TKA SD</button>
        <button className={`exam-tab ${activeTab === "TKA_SMP" ? "active" : ""}`} onClick={() => setActiveTab("TKA_SMP")}>TKA SMP</button>
        <button className={`exam-tab ${activeTab === "TKA_SMA" ? "active" : ""}`} onClick={() => setActiveTab("TKA_SMA")}>TKA SMA</button>
        <button className={`exam-tab ${activeTab === "SNBT" ? "active" : ""}`} onClick={() => setActiveTab("SNBT")}>SNBT</button>
      </div>

      <section className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={20} color="var(--accent)" /> Daftar Materi</h2>
        {filteredMaterials.length === 0 ? (
          <div style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>Belum ada materi untuk kategori ini.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1rem", marginTop: "1.5rem" }}>
            {filteredMaterials.map((material) => (
              <a key={material.id} href={material.url} target="_blank" rel="noreferrer" style={{ 
              border: "1px solid var(--border)", 
              borderRadius: "1rem", 
              padding: "1.5rem", 
              background: "white", 
              display: "flex", 
              flexDirection: "column",
              gap: "1rem",
              textDecoration: "none",
              color: "inherit",
              boxShadow: "var(--shadow-sm)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="status-pill" style={{ background: "#EFF6FF", color: "#2563EB", marginBottom: "0.5rem" }}>
                  {material.examType || "UMUM"}
                </span>
                {material.type === "VIDEO" ? <PlayCircle size={20} color="var(--primary)" /> : <ExternalLink size={20} color="var(--primary)" />}
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "1.1rem", color: "var(--text)", marginBottom: "5px" }}>{material.title}</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{material.chapter?.title} • {material.duration ? `${material.duration} menit` : ''}</span>
              </div>
            </a>
          ))}
        </div>
        )}
      </section>
    </div>
  );
}
