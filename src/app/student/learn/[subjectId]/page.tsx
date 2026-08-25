"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, PlayCircle, FileText, CheckCircle, Clock } from "lucide-react";

export default function SubjectLearnPage() {
  // Mock data for UI
  const chapters = [
    {
      id: "ch1",
      title: "Bab 1: Silogisme & Logika Dasar",
      materials: [
        { id: "m1", title: "Konsep Dasar Silogisme", type: "VIDEO", duration: 15, completed: true, url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        { id: "m2", title: "Latihan Soal Silogisme", type: "VIDEO", duration: 25, completed: false, url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        { id: "m3", title: "Rangkuman Logika Dasar", type: "PDF", duration: 5, completed: false, url: "#" }
      ]
    },
    {
      id: "ch2",
      title: "Bab 2: Penalaran Analitik",
      materials: [
        { id: "m4", title: "Trik Cepat Posisi Duduk", type: "VIDEO", duration: 18, completed: false, url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        { id: "m5", title: "Analisis Pola Berurutan", type: "VIDEO", duration: 22, completed: false, url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
      ]
    }
  ];

  const [activeMaterial, setActiveMaterial] = useState(chapters[0].materials[0]);

  return (
    <div className="flex-col gap-6" style={{ animation: "fadeIn 0.6s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Link href="/student/learn">
          <button className="btn" style={{ background: "white", padding: "10px", borderRadius: "50%", color: "var(--primary)", border: "none" }}>
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 style={{ fontSize: "1.8rem", color: "white", margin: 0 }}>Penalaran Umum</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: 0 }}>Lanjutkan progres belajar Anda untuk menguasai mapel ini.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
        
        {/* Left: Player Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card" style={{ padding: 0, overflow: "hidden", background: "black", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {activeMaterial.type === "VIDEO" ? (
              <iframe 
                width="100%" 
                height="100%" 
                src={activeMaterial.url} 
                title="Video Player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <div style={{ color: "white", textAlign: "center", padding: "3rem" }}>
                <FileText size={64} style={{ margin: "0 auto 20px auto", color: "var(--accent)" }} />
                <h2>Materi PDF Siap Dibaca</h2>
                <button className="btn btn-primary" style={{ marginTop: "20px" }}>Unduh & Baca Dokumen</button>
              </div>
            )}
          </div>
          
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ display: "inline-block", background: "var(--surface-hover)", color: "var(--primary)", padding: "5px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "10px" }}>
                  {activeMaterial.type === "VIDEO" ? "Video Pembelajaran" : "Dokumen Materi"}
                </span>
                <h2 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "10px" }}>{activeMaterial.title}</h2>
                <div style={{ display: "flex", gap: "15px", color: "var(--text-muted)", fontSize: "0.9rem", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Clock size={16}/> {activeMaterial.duration} Menit</span>
                </div>
              </div>
              <button className="btn btn-primary" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                Tandai Selesai <CheckCircle size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Playlist Area */}
        <div className="card" style={{ padding: "1.5rem", height: "fit-content", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", color: "var(--primary)", margin: 0, paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>Daftar Materi</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {chapters.map((chapter) => (
              <div key={chapter.id}>
                <h4 style={{ fontSize: "1rem", color: "var(--text)", marginBottom: "10px", fontWeight: "600" }}>{chapter.title}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {chapter.materials.map((mat) => (
                    <div 
                      key={mat.id}
                      onClick={() => setActiveMaterial(mat)}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "12px", 
                        padding: "12px", 
                        borderRadius: "var(--radius-sm)", 
                        cursor: "pointer",
                        background: activeMaterial.id === mat.id ? "var(--surface-hover)" : "transparent",
                        border: activeMaterial.id === mat.id ? "1px solid var(--border)" : "1px solid transparent",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ color: mat.completed ? "var(--success)" : "var(--text-muted)" }}>
                        {mat.completed ? <CheckCircle size={18} /> : (mat.type === "VIDEO" ? <PlayCircle size={18} /> : <FileText size={18} />)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: activeMaterial.id === mat.id ? "bold" : "normal", color: activeMaterial.id === mat.id ? "var(--primary)" : "var(--text)" }}>{mat.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{mat.duration} mnt</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
