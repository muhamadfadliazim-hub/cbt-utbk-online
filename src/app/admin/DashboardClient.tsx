"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, BellRing, BookOpenCheck, CheckCircle2, Database, Send, Trash2, UsersRound } from "lucide-react";
import { publishAnnouncementAction, deleteAnnouncementAction } from "@/actions/admin";
import { updateExamStatus } from "@/actions/exam";
import { examLabels } from "@/lib/academyHub";

interface DashboardProps {
  studentCount: number;
  publishedExams: number;
  totalQuestions: number;
  publishedMaterials: number;
  attemptCount: number;
  initialExams: any[];
  initialAnnouncements: {
    id: string;
    title: string;
    message: string;
    audience: string;
    priority: string;
    publishedAt: string;
  }[];
}

export default function DashboardClient({
  studentCount,
  publishedExams,
  totalQuestions,
  publishedMaterials,
  attemptCount,
  initialExams,
  initialAnnouncements,
}: DashboardProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"ALL" | "SNBT" | "TKA_SD" | "TKA_SMP" | "TKA_SMA">("ALL");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const publishAnnouncement = async () => {
    if (!title.trim() || !message.trim()) return;
    setSaving(true);
    const res = await publishAnnouncementAction({
      title: title.trim(),
      message: message.trim(),
      audience,
      priority: "IMPORTANT",
    });
    setSaving(false);
    if (res.success) {
      setTitle("");
      setMessage("");
      setSent("Pengumuman diterbitkan ke database dan tampil di dasbor siswa.");
      router.refresh();
      window.setTimeout(() => setSent(""), 3000);
    } else {
      alert(res.error || "Gagal menerbitkan pengumuman.");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const res = await deleteAnnouncementAction(id);
    if (res.success) router.refresh();
  };

  const handleToggleExam = async (id: string, currentStatus: string) => {
    setTogglingId(id);
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await updateExamStatus(id, nextStatus);
    setTogglingId(null);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Gagal mengubah status paket.");
    }
  };

  return (
    <div className="flex-col gap-8">
      <section className="card" style={{ background: "linear-gradient(135deg,#FFFFFF,#F0F9FF)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <span className="status-pill" style={{ background: "#ECFDF5", color: "#047857", marginBottom: "0.7rem" }}>
            <Database size={13} /> Terhubung PostgreSQL Live
          </span>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.35rem" }}>Pusat Kendali AZ Academy</h1>
          <p className="text-muted">Seluruh statistik ujian, bank soal, pengumuman, dan materi tersimpan langsung di basis data PostgreSQL.</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>{attemptCount}</div>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>total percobaan ujian siswa</span>
        </div>
      </section>

      <div className="stat-grid">
        {[
          [<UsersRound key="users" size={24} />, studentCount.toLocaleString("id-ID"), "Siswa terdaftar"],
          [<Activity key="exam" size={24} />, String(publishedExams), "Paket ujian terbit"],
          [<BookOpenCheck key="question" size={24} />, totalQuestions.toLocaleString("id-ID"), "Butir soal terverifikasi"],
          [<CheckCircle2 key="material" size={24} />, String(publishedMaterials), "Materi belajar terbit"],
        ].map(([icon, value, label]) => (
          <div className="card" key={String(label)} style={{ padding: "1.35rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--surface-hover)", color: "var(--primary)", display: "grid", placeItems: "center" }}>{icon}</div>
            <div>
              <strong style={{ display: "block", fontSize: "1.65rem", color: "var(--primary)" }}>{value}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="workspace-grid">
        <section className="card">
          <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BellRing size={21} /> Kirim Pengumuman ke Siswa
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.2rem" }}>
            Pengumuman disimpan permanen di database dan muncul pada dasbor maupun halaman Pilihan Ujian seluruh siswa sasaran.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 190px", gap: "0.8rem", marginBottom: "0.8rem" }}>
            <label>
              <span className="field-label">Judul</span>
              <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Jadwal Tryout UTBK-SNBT 2026" />
            </label>
            <label>
              <span className="field-label">Sasaran</span>
              <select className="field" value={audience} onChange={(e) => setAudience(e.target.value as any)}>
                <option value="ALL">Semua siswa</option>
                {Object.entries(examLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span className="field-label">Pesan</span>
            <textarea className="field" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tulis instruksi resmi untuk santri/siswa…" rows={4} />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button className="btn btn-primary" onClick={publishAnnouncement} disabled={saving || !title.trim() || !message.trim()} style={{ gap: 8 }}>
              <Send size={17} /> {saving ? "Menyimpan..." : "Publikasikan Sekarang"}
            </button>
          </div>
        </section>

        <aside className="card">
          <h2 className="card-title">Pengumuman Aktif</h2>
          {initialAnnouncements.length === 0 ? (
            <p className="text-muted" style={{ fontSize: "0.88rem" }}>Belum ada pengumuman yang diterbitkan.</p>
          ) : (
            <div style={{ display: "grid", gap: "0.85rem" }}>
              {initialAnnouncements.slice(0, 5).map((announcement) => (
                <div key={announcement.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.8rem", display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                  <div>
                    <strong style={{ display: "block", fontSize: "0.88rem" }}>{announcement.title}</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.74rem" }}>
                      {announcement.audience === "ALL" ? "Semua siswa" : examLabels[announcement.audience as keyof typeof examLabels] || announcement.audience} • {new Date(announcement.publishedAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    aria-label={`Hapus pengumuman ${announcement.title}`}
                    style={{ border: 0, background: "transparent", color: "var(--danger)", cursor: "pointer", padding: 4 }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 className="card-title" style={{ margin: 0 }}>Kontrol Publikasi Paket (Database)</h2>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{initialExams.length} paket tersimpan</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Paket</th>
                <th>Kategori</th>
                <th>Soal</th>
                <th>Akses</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {initialExams.map((exam) => (
                <tr key={exam.id}>
                  <td><strong>{exam.title}</strong></td>
                  <td>{examLabels[exam.category as keyof typeof examLabels] || exam.category}</td>
                  <td>{exam.questionCount} soal</td>
                  <td>{exam.access === "EXCLUSIVE" ? "Eksklusif" : "Terbuka"}</td>
                  <td>
                    <span
                      className="status-pill"
                      style={{
                        background: exam.status === "PUBLISHED" ? "#ECFDF5" : exam.status === "ARCHIVED" ? "#FEF2F2" : "#F1F5F9",
                        color: exam.status === "PUBLISHED" ? "#047857" : exam.status === "ARCHIVED" ? "#B91C1C" : "#64748B",
                      }}
                    >
                      {exam.status === "PUBLISHED" ? "Terbit" : exam.status === "ARCHIVED" ? "Diarsipkan" : "Draf"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn"
                      disabled={!exam.canModify || togglingId === exam.id}
                      onClick={() => handleToggleExam(exam.id, exam.status)}
                      style={{ padding: "0.5rem 0.75rem", background: "var(--surface-hover)", color: "var(--primary)" }}
                    >
                      {exam.status === "PUBLISHED" ? "Tarik ke Draf" : "Terbitkan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {sent && (
        <div className="toast-message">
          <CheckCircle2 size={17} style={{ marginRight: 8, verticalAlign: "middle" }} />
          {sent}
        </div>
      )}
    </div>
  );
}
