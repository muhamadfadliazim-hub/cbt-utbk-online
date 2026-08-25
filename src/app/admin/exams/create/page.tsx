"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, Crown, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { ExamCategory, examLabels, useAcademyHub, EXAM_TEMPLATES, SectionDraft } from "@/lib/academyHub";

export default function ExamBuilder() {
  const { saveExam } = useAcademyHub();
  const router = useRouter();
  const [title, setTitle] = useState("Tryout SNBT Eksklusif #02");
  const [description, setDescription] = useState("Simulasi penuh dengan timer per subtes, soal matriks, dan laporan IRT.");
  const [category, setCategory] = useState<ExamCategory>("SNBT");
  const [access, setAccess] = useState<"EXCLUSIVE" | "OPEN">("EXCLUSIVE");
  const [scheduledAt, setScheduledAt] = useState("2026-08-30T08:00");
  const [sections, setSections] = useState<SectionDraft[]>(EXAM_TEMPLATES.SNBT);
  const [saved, setSaved] = useState("");

  const totals = useMemo(() => ({ duration: sections.reduce((sum, section) => sum + section.duration, 0), questions: sections.reduce((sum, section) => sum + section.questionTarget, 0) }), [sections]);

  const selectTemplate = (value: ExamCategory) => {
    setCategory(value);
    const baseSections = EXAM_TEMPLATES[value].map((section) => ({ ...section }));
    setSections(baseSections);
    if (!title.trim() || Object.values(examLabels).some((label) => title.includes(label.split(" /")[0]))) setTitle(`${examLabels[value]} Eksklusif #01`);
  };

  const persist = (status: "DRAFT" | "PUBLISHED", continueToQuestions = false) => {
    if (!title.trim() || sections.length === 0) return;
    const record = saveExam({
      title: title.trim(), category, description: description.trim(), durationMinutes: totals.duration,
      sectionCount: sections.length, questionCount: totals.questions, access, status,
      scheduledAt: new Date(scheduledAt).toISOString(),
    });
    setSaved(status === "PUBLISHED" ? "Paket diterbitkan dan sudah muncul di akun siswa." : "Draf paket tersimpan.");
    if (continueToQuestions) router.push(`/admin/exams/questions?package=${record.id}`);
    else window.setTimeout(() => setSaved(""), 2800);
  };

  return (
    <div className="flex-col gap-8">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
        <div><h1 style={{ fontSize: "2rem", color: "white" }}>Buat Paket Tryout</h1><p style={{ color: "rgba(255,255,255,0.8)" }}>Pilih template SNBT atau simulasi TKA 2026, atur subtes, lalu terbitkan.</p></div>
        <div style={{ display: "flex", gap: 10 }}><button className="btn" onClick={() => persist("DRAFT")} style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.3)", gap: 7 }}><Save size={17} /> Simpan Draf</button><button className="btn" onClick={() => persist("PUBLISHED")} style={{ background: "white", color: "var(--primary)", gap: 7 }}><Sparkles size={17} /> Terbitkan</button></div>
      </div>

      <div className="workspace-grid">
        <section className="card" style={{ display: "grid", gap: "1.1rem" }}>
          <h2 className="card-title">Identitas Paket</h2>
          <label><span className="field-label">Nama paket ujian</span><input className="field" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label><span className="field-label">Deskripsi untuk siswa</span><textarea className="field" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          <div style={{ display: "grid", gridTemplateColumns: category === "TKA_SMA" ? "1fr 1fr 1fr" : "1fr 1fr", gap: "1rem" }}>
            <label>
              <span className="field-label">Template ujian</span>
              <select className="field" value={category} onChange={(event) => selectTemplate(event.target.value as ExamCategory)}>
                {Object.entries(examLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <label>
              <span className="field-label">Jadwal mulai</span>
              <input className="field" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
            </label>
          </div>
          <div><span className="field-label">Akses paket</span><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>{(["EXCLUSIVE", "OPEN"] as const).map((item) => <button key={item} onClick={() => setAccess(item)} style={{ padding: "0.9rem", borderRadius: "0.8rem", cursor: "pointer", border: `2px solid ${access === item ? "var(--primary)" : "var(--border)"}`, background: access === item ? "var(--surface-hover)" : "white", color: access === item ? "var(--primary)" : "var(--text-muted)", fontWeight: 800 }}>{item === "EXCLUSIVE" ? "Eksklusif / Premium" : "Terbuka"}</button>)}</div></div>
        </section>

        <aside className="card" style={{ background: "linear-gradient(135deg,#0369A1,#2563EB)", color: "white" }}>
          <span className="status-pill" style={{ background: "rgba(255,255,255,0.18)", color: "white" }}>{access === "EXCLUSIVE" && <Crown size={13} />} {examLabels[category]}</span>
          <h2 style={{ color: "white", fontSize: "1.35rem", margin: "1rem 0" }}>{title || "Paket tanpa nama"}</h2>
          <div style={{ display: "grid", gap: "0.8rem" }}><div style={{ display: "flex", justifyContent: "space-between" }}><span>Total subtes</span><strong>{sections.length}</strong></div><div style={{ display: "flex", justifyContent: "space-between" }}><span>Durasi</span><strong>{totals.duration} menit</strong></div><div style={{ display: "flex", justifyContent: "space-between" }}><span>Target soal</span><strong>{totals.questions}</strong></div></div>
          <button className="btn" onClick={() => persist("DRAFT", true)} style={{ width: "100%", marginTop: "1.4rem", background: "var(--accent)", color: "white", gap: 8 }}>Lanjut Input Soal <ArrowRight size={18} /></button>
        </aside>
      </div>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}><div><h2 className="card-title" style={{ margin: 0 }}>Struktur Subtes</h2><p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Template otomatis dapat diedit sesuai kebutuhan paket.</p></div><button className="btn" onClick={() => setSections((current) => [...current, { id: `section-${Date.now()}`, title: "Subtes Baru", duration: 20, questionTarget: 20 }])} style={{ background: "var(--surface-hover)", color: "var(--primary)", gap: 7 }}><Plus size={17} /> Tambah Subtes</button></div>
        {category === "TKA_SMA" && <div style={{ marginBottom: "1rem", padding: ".85rem 1rem", borderRadius: ".75rem", background: "#FEF2F2", color: "#991B1B", fontSize: ".82rem", border: "1px solid #FCA5A5" }}><strong>TKA SMA otomatis memuat 16 subtes.</strong> Anda dapat meng-input soal untuk seluruh mapel pilihan (Biologi, Fisika, Ekonomi, Geografi, dll). Saat siswa mengerjakan, sistem akan otomatis memilihkan 5 mapel relevan berdasarkan Target Jurusan SNBP siswa.</div>}
        {category !== "SNBT" && category !== "TKA_SMA" && <div style={{ marginBottom: "1rem", padding: ".85rem 1rem", borderRadius: ".75rem", background: "#F5F3FF", color: "#5B21B6", fontSize: ".8rem" }}><strong>Template TKA 2026.</strong> Paket yang diterbitkan adalah latihan/simulasi AZ Academy, bukan ujian resmi dan bukan UTBK-SNBT.</div>}
        <div style={{ display: "grid", gap: "0.8rem" }}>{sections.map((section, index) => <div key={section.id} style={{ display: "grid", gridTemplateColumns: "42px minmax(0,1fr) 150px 150px 42px", gap: "0.8rem", alignItems: "center", background: "#F8FAFC", border: "1px solid var(--border)", borderRadius: "0.9rem", padding: "0.8rem" }}><div style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: "50%", background: "white", color: "var(--primary)", fontWeight: 800 }}>{index + 1}</div><input className="field" value={section.title} onChange={(event) => setSections((current) => current.map((item) => item.id === section.id ? { ...item, title: event.target.value } : item))} /><label style={{ position: "relative" }}><Clock size={16} style={{ position: "absolute", left: 10, top: 13, color: "var(--text-muted)" }} /><input className="field" type="number" min={1} value={section.duration} onChange={(event) => setSections((current) => current.map((item) => item.id === section.id ? { ...item, duration: Number(event.target.value) } : item))} style={{ paddingLeft: 32 }} /></label><input className="field" type="number" min={1} value={section.questionTarget} onChange={(event) => setSections((current) => current.map((item) => item.id === section.id ? { ...item, questionTarget: Number(event.target.value) } : item))} aria-label={`Target soal ${section.title}`} /><button onClick={() => setSections((current) => current.filter((item) => item.id !== section.id))} disabled={sections.length === 1} style={{ border: 0, background: "transparent", color: "var(--danger)", cursor: "pointer" }}><Trash2 size={20} /></button></div>)}</div>
      </section>
      {saved && <div className="toast-message"><CheckCircle2 size={17} style={{ marginRight: 8, verticalAlign: "middle" }} />{saved}</div>}
    </div>
  );
}
