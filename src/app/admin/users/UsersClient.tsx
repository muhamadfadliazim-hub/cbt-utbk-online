"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Search, ShieldAlert, ShieldCheck, Trash2, Settings } from "lucide-react";
import { toggleUserApproval, deleteUser, updateUserSchool, updateUserExamTypes } from "@/actions/admin";
import { ExamType } from "@prisma/client";

export default function UsersClient({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [editingSchoolValue, setEditingSchoolValue] = useState("");
  const [editingExamTypesId, setEditingExamTypesId] = useState<string | null>(null);
  const [editingExamTypes, setEditingExamTypes] = useState<ExamType[]>([]);

  const pendingUsers = users.filter(u => !u.isApproved && u.role === "STUDENT");
  const approvedUsers = users.filter(u => u.isApproved && u.role === "STUDENT");
  
  // Get unique schools
  const schools = Array.from(new Set(users.map(u => u.schoolName).filter(Boolean))) as string[];

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchSchool = selectedSchool ? u.schoolName === selectedSchool : true;
    return matchSearch && matchSchool;
  });

  const handleDelete = async (userId: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun ${name}? Tindakan ini tidak dapat dibatalkan.`)) {
      await deleteUser(userId);
    }
  };

  const handleSaveSchool = async (userId: string) => {
    await updateUserSchool(userId, editingSchoolValue);
    setEditingSchoolId(null);
  };

  const handleSaveExamTypes = async () => {
    if (editingExamTypesId) {
      await updateUserExamTypes(editingExamTypesId, editingExamTypes);
      setEditingExamTypesId(null);
    }
  };

  const toggleExamType = (type: ExamType) => {
    setEditingExamTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleDownloadCSV = () => {
    const headers = ["ID,Nama,Email,Peran,Sekolah,Target Univ,Target Jurusan,Status,Tanggal Daftar"];
    const rows = filteredUsers.map(u => 
      [
        u.id,
        `"${u.name || ""}"`,
        u.email,
        u.role,
        `"${u.schoolName || ""}"`,
        `"${u.snbpTargetUniv || ""}"`,
        `"${u.snbpTargetMajor || ""}"`,
        u.isApproved ? "Disetujui" : "Menunggu",
        new Date(u.createdAt).toLocaleDateString("id-ID")
      ].join(",")
    );
    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Daftar_Pengguna_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", color: "white", fontWeight: "800", marginBottom: "5px" }}>Manajemen Pengguna</h1>
          <p style={{ color: "rgba(255, 255, 255, 0.9)" }}>Kelola siswa, persetujuan akun, dan filter asal sekolah.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ background: "white", padding: "10px 20px", borderRadius: "10px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--warning)" }}>{pendingUsers.length}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Menunggu</div>
          </div>
          <div style={{ background: "white", padding: "10px 20px", borderRadius: "10px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--success)" }}>{approvedUsers.length}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Disetujui</div>
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "1rem", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-hover)", flexWrap: "wrap", gap: "15px" }}>
          <h2 style={{ fontSize: "1.2rem", color: "var(--text)", fontWeight: "700" }}>Daftar Pengguna</h2>
          
          <div style={{ display: "flex", gap: "15px", flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button 
              onClick={handleDownloadCSV}
              style={{ padding: "8px 15px", background: "var(--success)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}
            >
              Export ke CSV
            </button>
            <div style={{ display: "flex", alignItems: "center", background: "white", padding: "8px 15px", borderRadius: "8px", border: "1px solid var(--border)", width: "250px" }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: "10px" }} />
              <input 
                type="text" 
                placeholder="Cari nama atau email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: "none", outline: "none", width: "100%", fontSize: "0.9rem" }} 
              />
            </div>

            <select 
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              style={{ padding: "8px 15px", borderRadius: "8px", border: "1px solid var(--border)", outline: "none", background: "white", minWidth: "200px" }}
            >
              <option value="">Semua Sekolah</option>
              {schools.map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "15px", color: "var(--text-muted)", fontWeight: "600", fontSize: "0.9rem" }}>Pengguna</th>
                <th style={{ padding: "15px", color: "var(--text-muted)", fontWeight: "600", fontSize: "0.9rem" }}>Sekolah</th>
                <th style={{ padding: "15px", color: "var(--text-muted)", fontWeight: "600", fontSize: "0.9rem" }}>Peran</th>
                <th style={{ padding: "15px", color: "var(--text-muted)", fontWeight: "600", fontSize: "0.9rem" }}>Status</th>
                <th style={{ padding: "15px", color: "var(--text-muted)", fontWeight: "600", fontSize: "0.9rem" }}>Tgl Daftar</th>
                <th style={{ padding: "15px", color: "var(--text-muted)", fontWeight: "600", fontSize: "0.9rem", textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}>
                  <td style={{ padding: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: user.image ? `url(${user.image}) center/cover` : "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>
                        {!user.image && (user.name ? user.name[0].toUpperCase() : "U")}
                      </div>
                      <div>
                        <div style={{ fontWeight: "600", color: "var(--text)" }}>{user.name || "Tanpa Nama"}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "15px", color: "var(--text)", fontSize: "0.9rem" }}>
                    {editingSchoolId === user.id ? (
                      <div style={{ display: "flex", gap: "5px" }}>
                        <input 
                          type="text" 
                          value={editingSchoolValue} 
                          onChange={(e) => setEditingSchoolValue(e.target.value)} 
                          style={{ padding: "5px", border: "1px solid var(--border)", borderRadius: "4px", width: "120px" }} 
                        />
                        <button onClick={() => handleSaveSchool(user.id)} style={{ padding: "5px", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Simpan</button>
                        <button onClick={() => setEditingSchoolId(null)} style={{ padding: "5px", background: "var(--surface)", color: "var(--text-muted)", border: "none", borderRadius: "4px", cursor: "pointer" }}>Batal</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        {user.schoolName || "-"}
                        {user.role !== 'ADMIN' && (
                          <button 
                            onClick={() => { setEditingSchoolId(user.id); setEditingSchoolValue(user.schoolName || ""); }} 
                            style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "15px" }}>
                    <span style={{ 
                      padding: "5px 10px", 
                      borderRadius: "20px", 
                      fontSize: "0.8rem", 
                      fontWeight: "bold",
                      background: user.role === 'ADMIN' ? "#F3E8FF" : "#E0F2FE",
                      color: user.role === 'ADMIN' ? "#7E22CE" : "#0284C7"
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "15px" }}>
                    {user.role === 'ADMIN' ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "var(--primary)", fontWeight: "600", fontSize: "0.9rem" }}>
                        <ShieldCheck size={16} /> Admin
                      </span>
                    ) : user.isApproved ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "var(--success)", fontWeight: "600", fontSize: "0.9rem" }}>
                        <CheckCircle size={16} /> Disetujui
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "var(--warning)", fontWeight: "600", fontSize: "0.9rem" }}>
                        <ShieldAlert size={16} /> Menunggu
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "15px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: "15px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      {user.role !== 'ADMIN' && (
                        <>
                          <button 
                            onClick={() => { setEditingExamTypesId(user.id); setEditingExamTypes(user.allowedExamTypes || []); }}
                            style={{ 
                              background: "#F3E8FF", 
                              color: "#7E22CE", 
                              border: "none", 
                              padding: "8px 15px", 
                              borderRadius: "8px", 
                              fontWeight: "bold",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px"
                            }}
                          >
                            <Settings size={16} /> Akses Ujian
                          </button>
                          <button 
                            onClick={() => toggleUserApproval(user.id, !user.isApproved)}
                            style={{ 
                              background: user.isApproved ? "#FEE2E2" : "#DCFCE7", 
                              color: user.isApproved ? "#DC2626" : "#16A34A", 
                              border: "none", 
                              padding: "8px 15px", 
                              borderRadius: "8px", 
                              fontWeight: "bold",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              transition: "all 0.2s"
                            }}
                          >
                            {user.isApproved ? (
                              <><XCircle size={16} /> Cabut Akses</>
                            ) : (
                              <><CheckCircle size={16} /> Setujui</>
                            )}
                          </button>

                          <button 
                            onClick={() => handleDelete(user.id, user.name)}
                            style={{ 
                              background: "#FEF2F2", 
                              color: "#EF4444", 
                              border: "none", 
                              padding: "8px 15px", 
                              borderRadius: "8px", 
                              fontWeight: "bold",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px"
                            }}
                          >
                            <Trash2 size={16} /> Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                    {users.length === 0 ? "Belum ada pengguna terdaftar." : "Tidak ada pengguna yang cocok dengan pencarian/filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingExamTypesId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "1rem", width: "400px", maxWidth: "90%" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>Atur Akses Ujian Murid</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Jika kosong, murid bisa mengakses semua jenis ujian yang diterbitkan.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "2rem" }}>
              {(["SNBT", "TKA_SD", "TKA_SMP", "TKA_SMA"] as ExamType[]).map((type) => (
                <label key={type} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={editingExamTypes.includes(type)}
                    onChange={() => toggleExamType(type)}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span>{type.replace("_", " ")}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button 
                onClick={() => setEditingExamTypesId(null)}
                style={{ padding: "8px 15px", borderRadius: "8px", border: "1px solid var(--border)", background: "white", cursor: "pointer" }}
              >
                Batal
              </button>
              <button 
                onClick={handleSaveExamTypes}
                style={{ padding: "8px 15px", borderRadius: "8px", border: "none", background: "var(--primary)", color: "white", cursor: "pointer", fontWeight: "bold" }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
