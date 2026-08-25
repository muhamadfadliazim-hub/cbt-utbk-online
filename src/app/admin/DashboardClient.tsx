"use client";

import { useState } from "react";
import { Activity, BellRing, BookOpenCheck, CheckCircle2, Radio, Send, UsersRound } from "lucide-react";
import { ExamCategory, examLabels, useAcademyHub } from "@/lib/academyHub";

export default function DashboardClient({ studentCount }: { studentCount: number }) {
  const { state, addAnnouncement, setExamStatus } = useAcademyHub();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"ALL" | ExamCategory>("ALL");
  const [sent, setSent] = useState(false);

  const publishAnnouncement = () => {
    if (!title.trim() || !message.trim()) return;
    addAnnouncement({ title: title.trim(), message: message.trim(), audience, priority: "IMPORTANT" });
    setTitle("");
    setMessage("");
    setSent(true);
    window.setTimeout(() => setSent(false), 2500);
  };

  const publishedExams = state.exams.filter((exam) => exam.status === "PUBLISHED").length;
  const publishedMaterials = state.materials.filter((material) => material.status === "PUBLISHED").length;

  return (
    <div className="flex-col gap-8">
      <section className="card" style={{ background: "linear-gradient(135deg,#FFFFFF,#F0F9FF)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <span className="status-pill" style={{ background: "#ECFDF5", color: "#047857", marginBottom: "0.7rem" }}><Radio size={13} /> Hub tersambung</span>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.35rem" }}>Pusat Kendali AZ Academy</h1>
          <p className="text-muted">Publikasi admin langsung muncul pada katalog dan notifikasi siswa melalui sinkronisasi lintas-tab.</p>
        </div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--success)" }}>{state.revision}</div><span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>versi sinkronisasi</span></div>
      </section>

      <div className="stat-grid">
        {[
          [<UsersRound key="users" size={24} />, studentCount.toLocaleString("id-ID"), "Siswa aktif"],
          [<Activity key="exam" size={24} />, String(publishedExams), "Paket ujian terbit"],
          [<BookOpenCheck key="question" size={24} />, state.questions.length.toLocaleString("id-ID"), "Soal tersimpan"],
          [<CheckCircle2 key="material" size={24} />, String(publishedMaterials), "Materi terbit"],
        ].map(([icon, value, label]) => (
          <div className="card" key={String(label)} style={{ padding: "1.35rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--surface-hover)", color: "var(--primary)", display: "grid", placeItems: "center" }}>{icon}</div>
            <div><strong style={{ display: "block", fontSize: "1.65rem", color: "var(--primary)" }}>{value}</strong><span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{label}</span></div>
          </div>
        ))}
      </div>

      <div className="workspace-grid">
        <section className="card">
          <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><BellRing size={21} /> Kirim Pengumuman ke Siswa</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.2rem" }}>Pilih kelompok sasaran, tulis pesan, lalu publikasi. Siswa yang membuka dasbor atau katalog ujian akan melihatnya.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 190px", gap: "0.8rem", marginBottom: "0.8rem" }}>
            <label><span className="field-label">Judul</span><input className="field" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Jadwal Tryout diperbarui" /></label>
            <label><span className="field-label">Sasaran</span><select className="field" value={audience} onChange={(event) => setAudience(event.target.value as "ALL" | ExamCategory)}><option value="ALL">Semua siswa</option>{Object.entries(examLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
          <label><span className="field-label">Pesan</span><textarea className="field" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tulis instruksi yang jelas dan singkat…" rows={4} /></label>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}><button className="btn btn-primary" onClick={publishAnnouncement} disabled={!title.trim() || !message.trim()} style={{ gap: 8 }}><Send size={17} /> Publikasikan Sekarang</button></div>
        </section>

        <aside className="card">
          <h2 className="card-title">Aktivitas Terbaru</h2>
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {state.announcements.slice(0, 4).map((announcement) => (
              <div key={announcement.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.8rem" }}>
                <strong style={{ display: "block", fontSize: "0.88rem" }}>{announcement.title}</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.74rem" }}>{announcement.audience === "ALL" ? "Semua siswa" : examLabels[announcement.audience]} • {new Date(announcement.publishedAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}><h2 className="card-title" style={{ margin: 0 }}>Kontrol Publikasi Paket</h2><span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{state.exams.length} paket tersimpan</span></div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>Paket</th><th>Kategori</th><th>Soal</th><th>Akses</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>{state.exams.map((exam) => <tr key={exam.id}><td><strong>{exam.title}</strong></td><td>{examLabels[exam.category]}</td><td>{exam.questionCount}</td><td>{exam.access === "EXCLUSIVE" ? "Eksklusif" : "Terbuka"}</td><td><span className="status-pill" style={{ background: exam.status === "PUBLISHED" ? "#ECFDF5" : "#F1F5F9", color: exam.status === "PUBLISHED" ? "#047857" : "#64748B" }}>{exam.status === "PUBLISHED" ? "Terbit" : "Draf"}</span></td><td><button className="btn" onClick={() => setExamStatus(exam.id, exam.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")} style={{ padding: "0.5rem 0.75rem", background: "var(--surface-hover)", color: "var(--primary)" }}>{exam.status === "PUBLISHED" ? "Tarik" : "Terbitkan"}</button></td></tr>)}</tbody>
          </table>
        </div>
      </section>
      {sent && <div className="toast-message"><CheckCircle2 size={17} style={{ marginRight: 8, verticalAlign: "middle" }} />Pengumuman tersinkron ke siswa.</div>}
    </div>
  );
}
