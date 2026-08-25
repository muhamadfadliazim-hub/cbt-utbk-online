"use client";

import { useState } from "react";
import { BookOpenCheck, CheckCircle2, ExternalLink, FileText, Link2, Save, Video } from "lucide-react";
import { ExamCategory, examLabels, useAcademyHub } from "@/lib/academyHub";

export default function MaterialBuilderPage() {
  const { state, addMaterial } = useAcademyHub();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Penalaran Umum");
  const [category, setCategory] = useState<ExamCategory>("SNBT");
  const [type, setType] = useState<"VIDEO" | "PDF" | "ARTICLE">("VIDEO");
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState(15);
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState("");

  const save = (status: "DRAFT" | "PUBLISHED") => {
    if (!title.trim() || !subject.trim() || !url.trim()) return;
    addMaterial({ title: title.trim(), subject: subject.trim(), category, type, url: url.trim(), durationMinutes: duration, description: description.trim(), status });
    setTitle(""); setUrl(""); setDescription("");
    setToast(status === "PUBLISHED" ? "Materi diterbitkan ke ruang belajar siswa." : "Materi disimpan sebagai draf.");
    window.setTimeout(() => setToast(""), 2800);
  };

  return (
    <div className="flex-col gap-8">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}><div><h1 style={{ fontSize: "2rem", color: "white" }}>Tambah Materi Belajar</h1><p style={{ color: "rgba(255,255,255,0.8)" }}>Satu formulir untuk video, PDF, dan artikel SNBT maupun TKA 2026.</p></div><span className="status-pill" style={{ background: "rgba(255,255,255,.18)", color: "white" }}><BookOpenCheck size={14} /> {state.materials.length} materi</span></div>

      <div className="workspace-grid">
        <section className="card" style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}><label><span className="field-label">Kategori ujian</span><select className="field" value={category} onChange={(event) => setCategory(event.target.value as ExamCategory)}>{Object.entries(examLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span className="field-label">Mapel / subtes</span><input className="field" value={subject} onChange={(event) => setSubject(event.target.value)} /></label></div>
          <label><span className="field-label">Judul materi</span><input className="field" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Strategi Penalaran Induktif" /></label>
          <div><span className="field-label">Format</span><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.7rem" }}>{(["VIDEO", "PDF", "ARTICLE"] as const).map((item) => <button key={item} onClick={() => setType(item)} style={{ padding: "0.9rem", borderRadius: "0.8rem", cursor: "pointer", border: `2px solid ${type === item ? "var(--primary)" : "var(--border)"}`, background: type === item ? "var(--surface-hover)" : "white", color: type === item ? "var(--primary)" : "var(--text-muted)", fontWeight: 800 }}>{item}</button>)}</div></div>
          <label>
            <span className="field-label">Tautan konten</span>
            <span style={{ position: "relative", display: "block" }}>
              <Link2 size={17} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }} />
              <input className="field" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" style={{ paddingLeft: 38 }} />
            </span>
            {type === "PDF" && (
              <span style={{ display: "block", marginTop: "5px", fontSize: "0.8rem", color: "var(--text-muted)", background: "var(--surface)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                💡 <strong>Tips PDF:</strong> Upload file PDF Anda ke Google Drive, ubah akses menjadi "Anyone with link" (Siapa saja yang memiliki tautan), lalu tempel tautan (URL) Google Drive tersebut di kolom ini.
              </span>
            )}
          </label>
          <label><span className="field-label">Deskripsi singkat</span><textarea className="field" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Apa yang akan dikuasai siswa setelah mempelajari materi ini?" /></label>
          <label><span className="field-label">Estimasi durasi (menit)</span><input className="field" type="number" min={1} value={duration} onChange={(event) => setDuration(Number(event.target.value))} /></label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.7rem" }}><button className="btn" onClick={() => save("DRAFT")} disabled={!title || !url} style={{ background: "#F1F5F9", color: "var(--text-muted)", gap: 7 }}><Save size={17} /> Simpan Draf</button><button className="btn btn-primary" onClick={() => save("PUBLISHED")} disabled={!title || !url} style={{ gap: 7 }}><CheckCircle2 size={17} /> Terbitkan Materi</button></div>
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}><div className="card"><span className="status-pill" style={{ background: "var(--surface-hover)", color: "var(--primary)" }}>{examLabels[category]}</span><div style={{ width: 64, height: 64, borderRadius: 18, background: "#F8FAFC", color: "var(--primary)", display: "grid", placeItems: "center", margin: "1rem 0" }}>{type === "VIDEO" ? <Video size={30} /> : <FileText size={30} />}</div><h2 style={{ color: "var(--text)", fontSize: "1.2rem" }}>{title || "Pratinjau judul materi"}</h2><p style={{ color: "var(--text-muted)", fontSize: "0.84rem", marginTop: "0.45rem" }}>{description || "Deskripsi akan tampil di katalog belajar siswa."}</p><div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem" }}><span>{subject}</span><strong>{duration} menit</strong></div></div><div className="card"><h3 className="card-title">Materi Terbaru</h3><div style={{ display: "grid", gap: "0.7rem" }}>{state.materials.slice(0, 4).map((material) => <div key={material.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: "0.6rem" }}><div><strong style={{ display: "block", fontSize: "0.82rem" }}>{material.title}</strong><span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{material.subject}</span></div><a href={material.url} target="_blank" rel="noreferrer" aria-label={`Buka ${material.title}`}><ExternalLink size={16} color="var(--primary)" /></a></div>)}</div></div></aside>
      </div>
      {toast && <div className="toast-message"><CheckCircle2 size={17} style={{ marginRight: 8, verticalAlign: "middle" }} />{toast}</div>}
    </div>
  );
}
