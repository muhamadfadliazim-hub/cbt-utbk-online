"use client";

import { useAcademyHub, examLabels } from "@/lib/academyHub";
import { PlusCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function AdminExamsPage() {
  const { state, setExamStatus, deleteExam } = useAcademyHub();

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "1.8rem", color: "white", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px" }}>
          <FileText color="white" /> Manajemen Ujian
        </h1>
        <Link 
          href="/admin/exams/create" 
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "var(--primary)", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "bold" }}
        >
          <PlusCircle size={18} /> Buat Paket Ujian Baru
        </Link>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: "15px", fontSize: "1.2rem" }}>Daftar Paket Ujian</h2>
        {state.exams.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
            Belum ada paket ujian.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Judul Paket</th>
                  <th style={{ textAlign: "left" }}>Kategori</th>
                  <th style={{ textAlign: "center" }}>Jumlah Soal</th>
                  <th style={{ textAlign: "center" }}>Akses</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {state.exams.map((exam) => (
                  <tr key={exam.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td><strong>{exam.title}</strong></td>
                    <td>{examLabels[exam.category]}</td>
                    <td style={{ textAlign: "center" }}>{exam.questionCount}</td>
                    <td style={{ textAlign: "center" }}>{exam.access === "EXCLUSIVE" ? "Eksklusif" : "Terbuka"}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className="status-pill" style={{ background: exam.status === "PUBLISHED" ? "#ECFDF5" : "#F1F5F9", color: exam.status === "PUBLISHED" ? "#047857" : "#64748B", padding: "4px 8px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "bold" }}>
                        {exam.status === "PUBLISHED" ? "Terbit" : "Draf"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                        <button 
                          className="btn" 
                          onClick={() => setExamStatus(exam.id, exam.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")} 
                          style={{ padding: "6px 12px", background: "var(--surface-hover)", color: "var(--primary)", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          {exam.status === "PUBLISHED" ? "Tarik (Draft)" : "Terbitkan"}
                        </button>
                        <button 
                          className="btn" 
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus paket "${exam.title}"?`)) {
                              deleteExam(exam.id);
                            }
                          }} 
                          style={{ padding: "6px 12px", background: "#FEF2F2", color: "#EF4444", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
