"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileClient({ user, universities = [] }: { user: any, universities?: any[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name || "",
    schoolName: user.schoolName || "",
    snbpTargetUniv: user.snbpTargetUniv || "",
    snbpTargetMajor: user.snbpTargetMajor || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Profil berhasil diperbarui!");
        router.refresh(); // Refresh the page to update the layout (name initials, etc)
      } else {
        const data = await res.json();
        setMessage(data.error || "Gagal memperbarui profil.");
      }
    } catch (error) {
      setMessage("Terjadi kesalahan sistem.");
    }

    setIsLoading(false);
  };

  return (
    <div style={{ padding: "30px", maxWidth: "800px", background: "white", borderRadius: "20px", boxShadow: "var(--shadow-md)" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px", color: "var(--text)" }}>
        <User color="var(--primary)" /> Pengaturan Profil
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>
        Perbarui data diri, asal sekolah, dan target jurusan Anda di sini.
      </p>

      {message && (
        <div style={{ padding: "15px", marginBottom: "20px", borderRadius: "10px", background: message.includes("berhasil") ? "var(--success-light)" : "var(--danger-light)", color: message.includes("berhasil") ? "var(--success)" : "var(--danger)" }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "var(--text)" }}>Nama Lengkap</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", outline: "none" }}
          />
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "var(--text)" }}>Asal Sekolah</label>
          <input
            type="text"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleChange}
            placeholder="Misal: SMA Negeri 1 Jakarta"
            style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", outline: "none" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "var(--text)" }}>Target Universitas (SNBP)</label>
            <input
              type="text"
              name="snbpTargetUniv"
              list="universities-list"
              value={formData.snbpTargetUniv}
              onChange={(e) => {
                setFormData({ ...formData, snbpTargetUniv: e.target.value, snbpTargetMajor: "" });
              }}
              placeholder="Ketik atau pilih Universitas..."
              style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", outline: "none" }}
            />
            <datalist id="universities-list">
              {universities.map((u) => (
                <option key={u.id} value={u.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontWeight: "600", color: "var(--text)" }}>
              <span>Target Jurusan (SNBP)</span>
              {(formData.snbpTargetUniv || formData.snbpTargetMajor) && (
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, snbpTargetUniv: "", snbpTargetMajor: "" })}
                  style={{ background: "none", border: "none", color: "var(--danger)", fontSize: "0.8rem", cursor: "pointer", padding: "0" }}
                >
                  Reset Pilihan
                </button>
              )}
            </label>
            <input
              type="text"
              name="snbpTargetMajor"
              list="majors-list"
              value={formData.snbpTargetMajor}
              onChange={handleChange}
              placeholder="Ketik atau pilih Jurusan..."
              style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", outline: "none" }}
            />
            <datalist id="majors-list">
              {universities.find((u) => u.name === formData.snbpTargetUniv)?.majors.map((m: any) => (
                <option key={m.id} value={m.name} />
              ))}
            </datalist>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: "12px 20px", background: "var(--primary)", color: "white", borderRadius: "10px", border: "none", fontWeight: "bold", cursor: isLoading ? "not-allowed" : "pointer", marginTop: "10px" }}
        >
          {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
