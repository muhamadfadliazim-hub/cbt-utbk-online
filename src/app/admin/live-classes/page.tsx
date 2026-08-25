"use client";

import { useState, useEffect } from "react";
import { Video, Calendar, PlusCircle, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

type LiveClass = {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  roomName: string;
  isActive: boolean;
  targetSchool: string | null;
  targetUserEmail: string | null;
};

export default function AdminLiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [targetType, setTargetType] = useState<"PUBLIC" | "SCHOOL" | "EMAIL">("PUBLIC");
  const [targetValue, setTargetValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const res = await fetch("/api/admin/live-classes");
    if (res.ok) {
      const data = await res.json();
      setClasses(data);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        scheduledAt,
        targetSchool: targetType === "SCHOOL" ? targetValue.trim() : null,
        targetUserEmail: targetType === "EMAIL" ? targetValue.trim() : null,
      };

      const res = await fetch("/api/admin/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setScheduledAt("");
        setTargetValue("");
        setTargetType("PUBLIC");
        fetchClasses();
      }
    } catch (error) {
      console.error(error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kelas ini?")) return;
    try {
      const res = await fetch(`/api/admin/live-classes/${id}`, { method: "DELETE" });
      if (res.ok) fetchClasses();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "30px", background: "white", borderRadius: "20px", boxShadow: "var(--shadow-md)" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px", color: "var(--text)" }}>
        <Video color="var(--primary)" /> Manajemen Live Class (Jitsi)
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>
        Jadwalkan sesi tatap muka interaktif secara langsung. Kelas akan tertanam secara native di dashboard siswa.
      </p>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* Formulir */}
        <div style={{ flex: 1, background: "white", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle size={18} /> Buat Jadwal Baru
          </h3>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" }}>Judul Kelas</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} placeholder="Misal: Pembahasan Tryout SNBT 1" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" }}>Deskripsi / Agenda</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", minHeight: "80px" }} placeholder="Deskripsi singkat..." />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" }}>Waktu Mulai</label>
              <input type="datetime-local" required value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" }}>Tipe Target</label>
              <select value={targetType} onChange={e => { setTargetType(e.target.value as any); setTargetValue(""); }} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "10px" }}>
                <option value="PUBLIC">Publik (Semua Siswa)</option>
                <option value="SCHOOL">Spesifik Sekolah</option>
                <option value="EMAIL">Individu (Berdasarkan Email)</option>
              </select>
              
              {targetType === "SCHOOL" && (
                <input type="text" value={targetValue} onChange={e => setTargetValue(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} placeholder="Masukkan nama sekolah (misal: SMAN 1 Jakarta)" required />
              )}
              {targetType === "EMAIL" && (
                <input type="email" value={targetValue} onChange={e => setTargetValue(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} placeholder="Masukkan email siswa" required />
              )}
            </div>
            <button type="submit" disabled={isSubmitting} style={{ padding: "12px", background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: isSubmitting ? "not-allowed" : "pointer" }}>
              {isSubmitting ? "Menyimpan..." : "Jadwalkan Kelas"}
            </button>
          </form>
        </div>

        {/* Daftar Kelas */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "15px" }}>
          <h3 style={{ marginBottom: "5px" }}>Daftar Kelas</h3>
          {classes.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", background: "white", borderRadius: "12px", border: "1px solid var(--border)", color: "var(--text-muted)" }}>Belum ada kelas terjadwal.</div>
          ) : (
            classes.map(c => (
              <div key={c.id} style={{ background: "white", padding: "15px 20px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "5px" }}>{c.title}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Calendar size={14}/> {new Date(c.scheduledAt).toLocaleString("id-ID")}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><LinkIcon size={14}/> {c.roomName}</span>
                    {c.targetSchool && <span style={{ padding: "2px 8px", background: "#FEE2E2", color: "#B91C1C", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold" }}>Sekolah: {c.targetSchool}</span>}
                    {c.targetUserEmail && <span style={{ padding: "2px 8px", background: "#FEF9C3", color: "#854D0E", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold" }}>Email: {c.targetUserEmail}</span>}
                    {!c.targetSchool && !c.targetUserEmail && <span style={{ padding: "2px 8px", background: "#DCFCE7", color: "#166534", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold" }}>Publik</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <Link href={`/student/live-classes/${c.id}/join`} target="_blank" style={{ padding: "8px 15px", background: "var(--success)", color: "white", textDecoration: "none", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold" }}>
                    Join
                  </Link>
                  <button onClick={() => handleDelete(c.id)} style={{ padding: "8px 15px", background: "var(--danger)", color: "white", border: "none", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold", cursor: "pointer" }}>
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
