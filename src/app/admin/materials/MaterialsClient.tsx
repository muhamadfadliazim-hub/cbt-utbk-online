"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, CheckCircle2, ExternalLink, FileText, Link2, Save, Trash2, Video } from "lucide-react";
import { createMaterialAction, deleteMaterialAction, toggleMaterialPublishAction } from "@/actions/admin";
import { ExamCategory, examLabels } from "@/lib/academyHub";

type MaterialRow = {
  id: string;
  title: string;
  subject: string;
  category: ExamCategory;
  type: "VIDEO" | "PDF" | "ARTICLE";
  url: string;
  duration: number;
  description: string;
  isPublished: boolean;
};

export default function MaterialsClient({ initialMaterials }: { initialMaterials: MaterialRow[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Penalaran Umum");
  const [category, setCategory] = useState<ExamCategory>("SNBT");
  const [type, setType] = useState<"VIDEO" | "PDF" | "ARTICLE">("VIDEO");
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState(15);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const save = async (status: "DRAFT" | "PUBLISHED") => {
    if (!title.trim() || !subject.trim() || !url.trim()) return;
    setSaving(true);
    const res = await createMaterialAction({
      title: title.trim(),
      subjectTitle: subject.trim(),
      category,
      type,
      url: url.trim(),
      duration,
      description: description.trim(),
      isPublished: status === "PUBLISHED",
    });
    setSaving(false);
    if (res.success) {
      setTitle("");
      setUrl("");
      setDescription("");
      setToast(status === "PUBLISHED" ? "Materi diterbitkan ke ruang belajar siswa." : "Materi disimpan sebagai draf.");
      router.refresh();
      window.setTimeout(() => setToast(""), 2800);
    } else {
      alert(res.error || "Gagal menyimpan materi.");
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    const res = await toggleMaterialPublishAction(id, !current);
    if (res.success) router.refresh();
  };

  const handleDelete = async (id: string) => {
    const res = await deleteMaterialAction(id);
    if (res.success) router.refresh();
  };

  return (
    <div className="flex-col gap-8">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", color: "white" }}>Manajemen Materi Belajar</h1>
          <p style={{ color: "rgba(255,255,255,0.8)" }}>Simpan video pembahasan, modul PDF, dan ringkasan subtes UTBK-SNBT ke PostgreSQL.</p>
        </div>
        <span className="status-pill" style={{ background: "rgba(255,255,255,.18)", color: "white" }}>
          <BookOpenCheck size={14} /> {initialMaterials.length} materi tersimpan
        </span>
      </div>

      <div className="workspace-grid">
        <section className="card" style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label>
              <span className="field-label">Kategori ujian</span>
              <select className="field" value={category} onChange={(e) => setCategory(e.target.value as ExamCategory)}>
                {Object.entries(examLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Mapel / subtes</span>
              <input className="field" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>
          </div>
          <label>
            <span className="field-label">Judul materi</span>
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Strategi Penalaran Induktif & Deduktif" />
          </label>
          <div>
            <span className="field-label">Format</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.7rem" }}>
              {(["VIDEO", "PDF", "ARTICLE"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setType(item)}
                  style={{
                    padding: "0.9rem",
                    borderRadius: "0.8rem",
                    cursor: "pointer",
                    border: `2px solid ${type === item ? "var(--primary)" : "var(--border)"}`,
                    background: type === item ? "var(--surface-hover)" : "white",
                    color: type === item ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: 800,
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <label>
            <span className="field-label">Tautan konten</span>
            <span style={{ position: "relative", display: "block" }}>
              <Link2 size={17} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }} />
              <input className="field" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" style={{ paddingLeft: 38 }} />
            </span>
          </label>
          <label>
            <span className="field-label">Deskripsi singkat</span>
            <textarea className="field" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ringkasan kompetensi yang dibahas pada materi ini…" />
          </label>
          <label>
            <span className="field-label">Estimasi durasi (menit)</span>
            <input className="field" type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.7rem" }}>
            <button className="btn" onClick={() => save("DRAFT")} disabled={saving || !title || !url} style={{ background: "#F1F5F9", color: "var(--text-muted)", gap: 7 }}>
              <Save size={17} /> Simpan Draf
            </button>
            <button className="btn btn-primary" onClick={() => save("PUBLISHED")} disabled={saving || !title || !url} style={{ gap: 7 }}>
              <CheckCircle2 size={17} /> {saving ? "Menyimpan..." : "Terbitkan Materi"}
            </button>
          </div>
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <span className="status-pill" style={{ background: "var(--surface-hover)", color: "var(--primary)" }}>{examLabels[category]}</span>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "#F8FAFC", color: "var(--primary)", display: "grid", placeItems: "center", margin: "1rem 0" }}>
              {type === "VIDEO" ? <Video size={30} /> : <FileText size={30} />}
            </div>
            <h2 style={{ color: "var(--text)", fontSize: "1.2rem" }}>{title || "Pratinjau judul materi"}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", marginTop: "0.45rem" }}>{description || "Deskripsi akan tampil di katalog belajar siswa."}</p>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              <span>{subject}</span>
              <strong>{duration} menit</strong>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Materi Tersimpan di Database</h3>
            {initialMaterials.length === 0 ? (
              <p className="text-muted" style={{ fontSize: "0.86rem" }}>Belum ada materi tersimpan.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.7rem" }}>
                {initialMaterials.slice(0, 8).map((material) => (
                  <div key={material.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: "0.6rem" }}>
                    <div>
                      <strong style={{ display: "block", fontSize: "0.82rem" }}>{material.title}</strong>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                        {material.subject} • {material.isPublished ? "Terbit" : "Draf"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        onClick={() => handleToggle(material.id, material.isPublished)}
                        style={{ border: 0, background: "#F1F5F9", padding: "3px 8px", borderRadius: 6, fontSize: "0.72rem", cursor: "pointer" }}
                      >
                        {material.isPublished ? "Draf" : "Terbit"}
                      </button>
                      <a href={material.url} target="_blank" rel="noreferrer" aria-label={`Buka ${material.title}`}>
                        <ExternalLink size={15} color="var(--primary)" />
                      </a>
                      <button onClick={() => handleDelete(material.id)} aria-label={`Hapus ${material.title}`} style={{ border: 0, background: "transparent", color: "var(--danger)", cursor: "pointer" }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {toast && (
        <div className="toast-message">
          <CheckCircle2 size={17} style={{ marginRight: 8, verticalAlign: "middle" }} />
          {toast}
        </div>
      )}
    </div>
  );
}

