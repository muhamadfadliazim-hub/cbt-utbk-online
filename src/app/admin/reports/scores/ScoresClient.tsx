"use client";

import { useState } from "react";
import { Search, Info, Trash2, ArrowLeft } from "lucide-react";
import { resetStudentAttempts, resetSingleAttempt } from "@/actions/exam";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AttemptWithExam = any; // from prisma
type UserWithAttempts = any;

export default function ScoresClient({ users }: { users: UserWithAttempts[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithAttempts | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const filteredUsers = users.filter((u) => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.schoolName?.toLowerCase().includes(search.toLowerCase()) ||
    u.snbpTargetUniv?.toLowerCase().includes(search.toLowerCase())
  );

  const handleResetAll = async (userId: string) => {
    if (!confirm("Peringatan: Seluruh riwayat ujian siswa ini akan dihapus secara permanen. Lanjutkan?")) return;
    setIsResetting(true);
    try {
      const res = await resetStudentAttempts(userId);
      if (res.success) {
        alert("Riwayat ujian berhasil di-reset.");
        router.refresh();
        setSelectedUser(null);
      } else {
        alert(res.error);
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetSingle = async (attemptId: string) => {
    if (!confirm("Hapus ujian ini?")) return;
    setIsResetting(true);
    try {
      const res = await resetSingleAttempt(attemptId);
      if (res.success) {
        alert("Ujian berhasil dihapus.");
        router.refresh();
        if (selectedUser) {
          setSelectedUser({
            ...selectedUser,
            attempts: selectedUser.attempts.filter((a: any) => a.id !== attemptId)
          });
        }
      } else {
        alert(res.error);
      }
    } finally {
      setIsResetting(false);
    }
  };

  if (selectedUser) {
    return (
      <div style={{ paddingBottom: "2rem" }}>
        <button 
          onClick={() => setSelectedUser(null)}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "var(--primary)", fontWeight: "bold", cursor: "pointer", marginBottom: "1rem" }}
        >
          <ArrowLeft size={18} /> Kembali ke Rekap
        </button>
        
        <div style={{ background: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "var(--shadow-sm)", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "1.8rem", color: "var(--primary)", fontWeight: "800", marginBottom: "5px" }}>{selectedUser.name}</h1>
              <p style={{ color: "var(--text-muted)", marginBottom: "5px" }}>{selectedUser.schoolName || "Sekolah tidak diatur"}</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                <span style={{ background: "var(--surface-hover)", padding: "5px 12px", borderRadius: "6px", fontSize: "0.85rem" }}>
                  🎯 {selectedUser.snbpTargetUniv || "Target PTN belum diatur"}
                </span>
                <span style={{ background: "var(--surface-hover)", padding: "5px 12px", borderRadius: "6px", fontSize: "0.85rem" }}>
                  📚 {selectedUser.snbpTargetMajor || "Jurusan belum diatur"}
                </span>
              </div>
            </div>
            <button 
              onClick={() => handleResetAll(selectedUser.id)}
              disabled={isResetting || selectedUser.attempts.length === 0}
              style={{ background: "var(--danger)", color: "white", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: "bold", cursor: selectedUser.attempts.length === 0 ? "not-allowed" : "pointer", opacity: selectedUser.attempts.length === 0 ? 0.5 : 1 }}
            >
              Reset Seluruh Riwayat
            </button>
          </div>
        </div>

        <h2 style={{ fontSize: "1.3rem", color: "var(--text)", fontWeight: "700", marginBottom: "1rem" }}>Riwayat Pengerjaan</h2>
        
        {selectedUser.attempts.length === 0 ? (
          <div style={{ background: "white", padding: "3rem", textAlign: "center", borderRadius: "1rem", color: "var(--text-muted)" }}>
            Belum ada riwayat pengerjaan ujian.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {selectedUser.attempts.map((attempt: AttemptWithExam) => (
              <div key={attempt.id} style={{ background: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 5px 0", fontSize: "1.1rem" }}>{attempt.exam.title}</h3>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Tanggal: {new Date(attempt.startTime).toLocaleString("id-ID")}
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    Skor: <strong style={{ color: "var(--primary)", fontSize: "1.2rem" }}>{attempt.score?.toFixed(0) || 0}</strong>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleResetSingle(attempt.id)}
                    disabled={isResetting}
                    style={{ background: "transparent", border: "1px solid var(--danger)", color: "var(--danger)", padding: "8px 15px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", color: "white", fontWeight: "800", marginBottom: "5px" }}>Laporan Rekap Nilai</h1>
          <p style={{ color: "rgba(255, 255, 255, 0.9)" }}>Pantau perkembangan skor siswa dan kelola riwayat ujian.</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "1rem", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-hover)", flexWrap: "wrap", gap: "15px" }}>
          <h2 style={{ fontSize: "1.2rem", color: "var(--text)", fontWeight: "700" }}>Daftar Peserta</h2>
          
          <div style={{ display: "flex", gap: "15px", flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", background: "white", padding: "8px 15px", borderRadius: "8px", border: "1px solid var(--border)", width: "250px" }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: "10px" }} />
              <input 
                type="text" 
                placeholder="Cari nama, sekolah, PTN..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: "none", outline: "none", width: "100%", fontSize: "0.9rem" }} 
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "var(--surface-hover)" }}>
              <tr>
                <th style={{ padding: "15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>Siswa</th>
                <th style={{ padding: "15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>Asal Sekolah</th>
                <th style={{ padding: "15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>Target PTN & Jurusan</th>
                <th style={{ padding: "15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", textAlign: "center" }}>Jumlah Ujian</th>
                <th style={{ padding: "15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", textAlign: "center" }}>Rata-rata Skor</th>
                <th style={{ padding: "15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>Tidak ada siswa yang ditemukan.</td></tr>
              ) : (
                filteredUsers.map((u) => {
                  const numExams = u.attempts.length;
                  const avgScore = numExams > 0 ? (u.attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / numExams).toFixed(0) : "-";
                  
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "15px" }}>
                        <div style={{ fontWeight: "bold", color: "var(--primary)" }}>{u.name}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{u.email}</div>
                      </td>
                      <td style={{ padding: "15px", color: "var(--text)" }}>{u.schoolName || "-"}</td>
                      <td style={{ padding: "15px", color: "var(--text)" }}>
                        <div><strong>{u.snbpTargetUniv || "-"}</strong></div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{u.snbpTargetMajor || "-"}</div>
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>{numExams}</td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <strong style={{ color: avgScore !== "-" ? "var(--success)" : "var(--text-muted)" }}>{avgScore}</strong>
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <button 
                          onClick={() => setSelectedUser(u)}
                          style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.85rem", fontWeight: "bold" }}
                        >
                          <Info size={14} /> Detail
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
