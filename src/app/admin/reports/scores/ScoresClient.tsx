"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Info,
  Trash2,
  ArrowLeft,
  Download,
  BarChart3,
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Clock,
  FileSpreadsheet,
} from "lucide-react";
import { resetStudentAttempts, resetSingleAttempt } from "@/actions/exam";
import { SantriAttemptRecap } from "@/lib/baznasSeed";
import { computeAttemptAnalytics, downloadCsvFile } from "@/lib/tryoutAnalytics";

export interface ReportStudentUser {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  pesantrenId: string | null;
  snbpTargetUniv: string;
  snbpTargetMajor: string;
  isApproved: boolean;
  attempts: SantriAttemptRecap[];
}

export interface ReportExamOption {
  id: string;
  title: string;
  type: string;
  status: string;
}

export default function ScoresClient({
  users,
  exams = [],
  activeScopeName = null,
}: {
  users: ReportStudentUser[];
  exams?: ReportExamOption[];
  activeScopeName?: string | null;
}) {
  const router = useRouter();
  const [userList, setUserList] = useState<ReportStudentUser[]>(users);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "TESTED" | "UNTESTED">("ALL");
  const [examFilter, setExamFilter] = useState<string>("ALL");
  const [schoolFilter, setSchoolFilter] = useState<string>("ALL");
  const [scoreFilter, setScoreFilter] = useState<"ALL" | "HIGH" | "MID" | "LOW">("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "SCORE_DESC" | "SCORE_ASC" | "LATEST" | "ATTEMPTS_DESC" | "NAME_ASC"
  >("SCORE_DESC");
  const [viewMode, setViewMode] = useState<"STUDENTS" | "SESSIONS">("STUDENTS");

  useEffect(() => {
    setUserList(users);
  }, [users]);

  const schoolOptions = useMemo(() => {
    return Array.from(
      new Set(userList.map((u) => u.schoolName).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [userList]);

  const examOptionsWithCount = useMemo(() => {
    const countMap = new Map<string, number>();
    const titleMap = new Map<string, string>();
    for (const ex of exams) {
      titleMap.set(ex.id, ex.title);
    }
    for (const u of userList) {
      const seenForUser = new Set<string>();
      for (const a of u.attempts) {
        if (!titleMap.has(a.examId)) titleMap.set(a.examId, a.examTitle);
        if (!seenForUser.has(a.examId)) {
          seenForUser.add(a.examId);
          countMap.set(a.examId, (countMap.get(a.examId) || 0) + 1);
        }
      }
    }
    return Array.from(titleMap.entries()).map(([id, title]) => ({
      id,
      title,
      participantCount: countMap.get(id) || 0,
    }));
  }, [userList, exams]);

  const hasActiveFilter =
    Boolean(search.trim()) ||
    statusFilter !== "ALL" ||
    examFilter !== "ALL" ||
    schoolFilter !== "ALL" ||
    scoreFilter !== "ALL" ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  const resetAllFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setExamFilter("ALL");
    setSchoolFilter("ALL");
    setScoreFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setSortBy("SCORE_DESC");
  };

  // Compute scoped records matching non-status filters first so status pill counts stay informative
  const baseRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return userList
      .filter((u) => {
        if (schoolFilter !== "ALL" && u.schoolName !== schoolFilter) return false;
        if (!q) return true;
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.schoolName.toLowerCase().includes(q) ||
          u.snbpTargetUniv.toLowerCase().includes(q) ||
          u.snbpTargetMajor.toLowerCase().includes(q)
        );
      })
      .map((u) => {
        const scopedAttempts = u.attempts.filter((a) => {
          if (examFilter !== "ALL" && a.examId !== examFilter) return false;
          if (dateFrom && a.date < dateFrom) return false;
          if (dateTo && a.date > dateTo) return false;
          return true;
        });

        const avgScore =
          scopedAttempts.length > 0
            ? Math.round(
                (scopedAttempts.reduce((acc, a) => acc + a.score, 0) / scopedAttempts.length) *
                  (scopedAttempts.every((a) => !a.isIRT) ? 10 : 1)
              ) / (scopedAttempts.every((a) => !a.isIRT) ? 10 : 1)
            : 0;

        const maxScore =
          scopedAttempts.length > 0
            ? Math.max(...scopedAttempts.map((a) => a.score))
            : 0;
        const latestAttempt = scopedAttempts[0] || null;

        return {
          user: u,
          scopedAttempts,
          avgScore,
          maxScore,
          latestAttempt,
          isClassicOnly:
            scopedAttempts.length > 0 && scopedAttempts.every((a) => !a.isIRT),
        };
      });
  }, [userList, search, schoolFilter, examFilter, dateFrom, dateTo]);

  const matchesScoreCategory = (row: (typeof baseRows)[number]) => {
    if (scoreFilter === "ALL") return true;
    if (row.scopedAttempts.length === 0) return false;
    const highThreshold = row.isClassicOnly ? 75 : 600;
    const midThreshold = row.isClassicOnly ? 55 : 450;
    if (scoreFilter === "HIGH") return row.avgScore >= highThreshold;
    if (scoreFilter === "MID") return row.avgScore >= midThreshold && row.avgScore < highThreshold;
    return row.avgScore < midThreshold;
  };

  const testedCountInScope = useMemo(
    () => baseRows.filter((r) => r.scopedAttempts.length > 0 && matchesScoreCategory(r)).length,
    [baseRows, scoreFilter]
  );
  const untestedCountInScope = useMemo(
    () => baseRows.filter((r) => r.scopedAttempts.length === 0).length,
    [baseRows]
  );

  const filteredRows = useMemo(() => {
    const requireAttempts =
      examFilter !== "ALL" || Boolean(dateFrom) || Boolean(dateTo) || scoreFilter !== "ALL";

    return baseRows
      .filter((r) => {
        if (statusFilter === "TESTED") {
          return r.scopedAttempts.length > 0 && matchesScoreCategory(r);
        }
        if (statusFilter === "UNTESTED") {
          return r.scopedAttempts.length === 0;
        }
        if (requireAttempts) {
          return r.scopedAttempts.length > 0 && matchesScoreCategory(r);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "NAME_ASC") return a.user.name.localeCompare(b.user.name);
        if (sortBy === "ATTEMPTS_DESC") {
          const diff = b.scopedAttempts.length - a.scopedAttempts.length;
          return diff !== 0 ? diff : b.avgScore - a.avgScore;
        }
        const hasA = a.scopedAttempts.length > 0 ? 1 : 0;
        const hasB = b.scopedAttempts.length > 0 ? 1 : 0;
        if (hasB !== hasA) return hasB - hasA;

        if (sortBy === "SCORE_ASC") {
          return a.avgScore - b.avgScore || a.user.name.localeCompare(b.user.name);
        }
        if (sortBy === "LATEST") {
          const ta = a.latestAttempt ? new Date(a.latestAttempt.completedAt).getTime() : 0;
          const tb = b.latestAttempt ? new Date(b.latestAttempt.completedAt).getTime() : 0;
          return tb - ta || b.avgScore - a.avgScore;
        }
        return b.avgScore - a.avgScore || a.user.name.localeCompare(b.user.name);
      });
  }, [baseRows, statusFilter, examFilter, dateFrom, dateTo, scoreFilter, sortBy]);

  const filteredSessions = useMemo(() => {
    const list: { user: ReportStudentUser; attempt: SantriAttemptRecap }[] = [];
    for (const row of filteredRows) {
      for (const att of row.scopedAttempts) {
        list.push({ user: row.user, attempt: att });
      }
    }
    return list.sort((a, b) => {
      if (sortBy === "SCORE_DESC") return b.attempt.score - a.attempt.score;
      if (sortBy === "SCORE_ASC") return a.attempt.score - b.attempt.score;
      if (sortBy === "NAME_ASC") return a.user.name.localeCompare(b.user.name);
      return (
        new Date(b.attempt.completedAt).getTime() -
        new Date(a.attempt.completedAt).getTime()
      );
    });
  }, [filteredRows, sortBy]);

  const analytics = useMemo(() => {
    const allAttempts = filteredRows.flatMap((r) => r.scopedAttempts);
    return computeAttemptAnalytics(allAttempts);
  }, [filteredRows]);

  const participatingStudents = useMemo(
    () => filteredRows.filter((r) => r.scopedAttempts.length > 0),
    [filteredRows]
  );

  const topPerformer = useMemo(() => {
    let best: { name: string; score: number } | null = null;
    for (const s of filteredSessions) {
      if (!best || s.attempt.score > best.score) {
        best = { name: s.user.name, score: s.attempt.score };
      }
    }
    return best;
  }, [filteredSessions]);

  const selectedUser = useMemo(
    () => userList.find((u) => u.id === selectedUserId) || null,
    [userList, selectedUserId]
  );

  const handleResetAll = async (userId: string) => {
    if (
      !confirm(
        "Peringatan: Seluruh riwayat ujian siswa ini akan dihapus secara permanen. Lanjutkan?"
      )
    )
      return;
    setIsResetting(true);
    try {
      const res = await resetStudentAttempts(userId);
      if (res.success) {
        setUserList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, attempts: [] } : u))
        );
        router.refresh();
        setSelectedUserId(null);
      } else {
        alert(res.error);
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetSingle = async (attemptId: string, userId: string) => {
    if (!confirm("Hapus sesi ujian ini secara permanen?")) return;
    setIsResetting(true);
    try {
      const res = await resetSingleAttempt(attemptId);
      if (res.success) {
        setUserList((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, attempts: u.attempts.filter((a) => a.attemptId !== attemptId) }
              : u
          )
        );
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportCsv = () => {
    const subtestCols = analytics.subtestStats.map((s) => s.subject);
    if (viewMode === "SESSIONS") {
      const headers = [
        "No",
        "Nama Peserta",
        "Email",
        "Asal Sekolah/Pesantren",
        "Target PTN",
        "Target Prodi",
        "Paket Ujian",
        "Kategori",
        "Tanggal Selesai",
        "Durasi (Menit)",
        "Skor",
        "Skala Maks",
        "Benar",
        "Total Soal",
        ...subtestCols,
      ];
      const rows = filteredSessions.map((item, idx) => {
        const subMap = new Map(item.attempt.subscores.map((s) => [s.subject, s.score]));
        return [
          idx + 1,
          item.user.name,
          item.user.email,
          item.user.schoolName || "-",
          item.user.snbpTargetUniv || "-",
          item.user.snbpTargetMajor || "-",
          item.attempt.examTitle,
          item.attempt.examType,
          item.attempt.date,
          item.attempt.durationMinutes,
          item.attempt.score,
          item.attempt.scaleMax,
          item.attempt.correctCount,
          item.attempt.totalQuestions,
          ...subtestCols.map((sub) => subMap.get(sub) ?? "-"),
        ];
      });
      downloadCsvFile(
        `rekap-sesi-ujian-${new Date().toISOString().split("T")[0]}.csv`,
        headers,
        rows
      );
      return;
    }

    const headers = [
      "Peringkat",
      "Nama Peserta",
      "Email",
      "Asal Sekolah/Pesantren",
      "Target PTN",
      "Target Prodi",
      "Jumlah Ujian",
      "Paket Terakhir",
      "Tanggal Terakhir",
      "Skor Terakhir",
      "Rata-rata Skor",
      "Benar Terakhir",
      "Total Soal",
      ...subtestCols,
    ];
    const rows = filteredRows.map((row, idx) => {
      const latest = row.latestAttempt;
      const subMap = new Map((latest?.subscores || []).map((s) => [s.subject, s.score]));
      return [
        idx + 1,
        row.user.name,
        row.user.email,
        row.user.schoolName || "-",
        row.user.snbpTargetUniv || "-",
        row.user.snbpTargetMajor || "-",
        row.scopedAttempts.length,
        latest?.examTitle || "Belum Ujian",
        latest?.date || "-",
        latest?.score ?? "-",
        row.scopedAttempts.length > 0 ? row.avgScore : "-",
        latest?.correctCount ?? "-",
        latest?.totalQuestions ?? "-",
        ...subtestCols.map((sub) => subMap.get(sub) ?? "-"),
      ];
    });
    downloadCsvFile(
      `rekap-nilai-peserta-${new Date().toISOString().split("T")[0]}.csv`,
      headers,
      rows
    );
  };

  if (selectedUser) {
    return (
      <div style={{ maxWidth: "1240px", margin: "0 auto", paddingBottom: "3rem" }}>
        <button
          onClick={() => setSelectedUserId(null)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "white",
            border: "1px solid #CBD5E1",
            borderRadius: "10px",
            padding: "8px 14px",
            color: "#0F172A",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          <ArrowLeft size={18} /> Kembali ke Laporan & Analitik
        </button>

        <div
          style={{
            background: "white",
            padding: "1.8rem",
            borderRadius: "1rem",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "1.65rem",
                  color: "var(--primary)",
                  fontWeight: "800",
                  margin: "0 0 4px 0",
                }}
              >
                {selectedUser.name}
              </h1>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.92rem" }}>
                {selectedUser.email} • {selectedUser.schoolName || "Sekolah/Pesantren belum diatur"}
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "0.9rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "#F1F5F9",
                    padding: "5px 12px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                  }}
                >
                  🎯 {selectedUser.snbpTargetUniv || "Target PTN belum diatur"}
                </span>
                <span
                  style={{
                    background: "#F1F5F9",
                    padding: "5px 12px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                  }}
                >
                  📚 {selectedUser.snbpTargetMajor || "Jurusan belum diatur"}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleResetAll(selectedUser.id)}
              disabled={isResetting || selectedUser.attempts.length === 0}
              style={{
                background: "var(--danger)",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: selectedUser.attempts.length === 0 ? "not-allowed" : "pointer",
                opacity: selectedUser.attempts.length === 0 ? 0.5 : 1,
              }}
            >
              Reset Seluruh Riwayat ({selectedUser.attempts.length})
            </button>
          </div>
        </div>

        <h2
          style={{
            fontSize: "1.2rem",
            color: "var(--text)",
            fontWeight: "800",
            marginBottom: "1rem",
          }}
        >
          Riwayat Pengerjaan & Analisis Subtes ({selectedUser.attempts.length} Sesi)
        </h2>

        {selectedUser.attempts.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "3rem",
              textAlign: "center",
              borderRadius: "1rem",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            Peserta ini belum memiliki riwayat pengerjaan ujian.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {selectedUser.attempts.map((attempt) => (
              <div
                key={attempt.attemptId}
                style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "1rem",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: attempt.subscores.length > 0 ? "1rem" : 0,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          background: "#EFF6FF",
                          color: "#1D4ED8",
                          padding: "3px 9px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "800",
                        }}
                      >
                        {attempt.examType}
                      </span>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800" }}>
                        {attempt.examTitle}
                      </h3>
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        marginTop: "6px",
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        📅 {new Date(attempt.completedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB
                      </span>
                      <span>⏱️ {attempt.durationMinutes} menit</span>
                      {attempt.totalQuestions > 0 && (
                        <span>
                          ✅ Benar: <strong>{attempt.correctCount} / {attempt.totalQuestions}</strong> ({attempt.answeredCount} terjawab)
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        background: "#F8FAFC",
                        border: "1px solid #CBD5E1",
                        borderRadius: "10px",
                        padding: "6px 14px",
                        textAlign: "right",
                      }}
                    >
                      <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)" }}>
                        Skor {attempt.isIRT ? "IRT" : "Klasik"}
                      </div>
                      <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--primary)" }}>
                        {attempt.score}{" "}
                        <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)" }}>
                          / {attempt.scaleMax}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleResetSingle(attempt.attemptId, selectedUser.id)}
                      disabled={isResetting}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--danger)",
                        color: "var(--danger)",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={16} /> Hapus
                    </button>
                  </div>
                </div>

                {attempt.subscores.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                      gap: "10px",
                      borderTop: "1px solid #F1F5F9",
                      paddingTop: "14px",
                    }}
                  >
                    {attempt.subscores.map((sub) => {
                      const pct = Math.min(100, Math.round((sub.score / Math.max(1, sub.fullMark)) * 100));
                      return (
                        <div
                          key={sub.sectionId}
                          style={{
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: "10px",
                            padding: "10px 12px",
                          }}
                        >
                          <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#0F172A", marginBottom: "6px" }}>
                            {sub.subject}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                            <span style={{ fontSize: "1.08rem", fontWeight: "800", color: "#0284C7" }}>
                              {sub.score}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                              Benar {sub.correct}/{sub.total}
                            </span>
                          </div>
                          <div style={{ height: "5px", background: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#059669" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #0369A1 100%)",
          borderRadius: "20px",
          padding: "26px 28px",
          color: "white",
          marginBottom: "22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 16px 35px -12px rgba(15, 23, 42, 0.45)",
        }}
      >
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: "800", letterSpacing: "0.06em", color: "#93C5FD", marginBottom: "6px" }}>
            PUSAT REKAP & ANALITIK CBT {activeScopeName ? `• ${activeScopeName.toUpperCase()}` : ""}
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 6px 0", fontFamily: "'Outfit', sans-serif" }}>
            Laporan Hasil Ujian, Filter & Statistik
          </h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.86)", fontSize: "0.92rem" }}>
            Filter peserta yang sudah atau belum ujian, tinjau distribusi skor, statistik per subtes, hingga ekspor CSV.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link
            href="/admin/reports/schools"
            style={{
              background: "rgba(255,255,255,0.14)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.28)",
              padding: "10px 14px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.86rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Rekap Per Pesantren
          </Link>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              background: "#10B981",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              fontWeight: "800",
              fontSize: "0.86rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              boxShadow: "0 8px 18px -6px rgba(16, 185, 129, 0.6)",
            }}
          >
            <Download size={16} /> Export CSV ({viewMode === "STUDENTS" ? filteredRows.length : filteredSessions.length})
          </button>
        </div>
      </div>

      {/* 5 Dynamic KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div style={{ background: "white", borderRadius: "14px", padding: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={15} color="#059669" /> Sudah Ikut Ujian
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#059669", marginTop: "6px" }}>
            {participatingStudents.length}{" "}
            <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "var(--text-muted)" }}>
              / {filteredRows.length} siswa
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Partisipasi{" "}
            {filteredRows.length > 0
              ? Math.round((participatingStudents.length / filteredRows.length) * 100)
              : 0}
            %
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <FileSpreadsheet size={15} color="#2563EB" /> Total Sesi Selesai
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#1E3A8A", marginTop: "6px" }}>
            {analytics.totalAttempts}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Sesuai filter aktif
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <TrendingUp size={15} color="#0284C7" /> Rata-rata Skor
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0284C7", marginTop: "6px" }}>
            {analytics.totalAttempts > 0 ? analytics.averageScore : "-"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Median: <strong>{analytics.totalAttempts > 0 ? analytics.medianScore : "-"}</strong>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <BarChart3 size={15} color="#D97706" /> Rentang Min – Max
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#B45309", marginTop: "6px" }}>
            {analytics.totalAttempts > 0 ? `${analytics.minScore} – ${analytics.maxScore}` : "-"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Sebaran skor peserta
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Award size={15} color="#7C3AED" /> Skor Tertinggi
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#6D28D9", marginTop: "6px" }}>
            {topPerformer ? topPerformer.score : "-"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {topPerformer ? topPerformer.name : "Belum ada ujian"}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "18px 20px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {([
              { key: "ALL", label: `Semua Peserta (${userList.length})` },
              { key: "TESTED", label: `Sudah Ujian (${testedCountInScope})` },
              { key: "UNTESTED", label: `Belum Ujian (${untestedCountInScope})` },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "999px",
                  border: statusFilter === tab.key ? "1px solid #2563EB" : "1px solid #CBD5E1",
                  background: statusFilter === tab.key ? "#2563EB" : "white",
                  color: statusFilter === tab.key ? "white" : "#334155",
                  fontWeight: "700",
                  fontSize: "0.84rem",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", background: "#F1F5F9", padding: "3px", borderRadius: "10px" }}>
              <button
                type="button"
                onClick={() => setViewMode("STUDENTS")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: viewMode === "STUDENTS" ? "white" : "transparent",
                  color: viewMode === "STUDENTS" ? "#0F172A" : "#64748B",
                  fontWeight: "700",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  boxShadow: viewMode === "STUDENTS" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <Users size={13} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                Rekap Per Siswa
              </button>
              <button
                type="button"
                onClick={() => setViewMode("SESSIONS")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: viewMode === "SESSIONS" ? "white" : "transparent",
                  color: viewMode === "SESSIONS" ? "#0F172A" : "#64748B",
                  fontWeight: "700",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  boxShadow: viewMode === "SESSIONS" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <Clock size={13} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                Log Semua Sesi ({filteredSessions.length})
              </button>
            </div>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetAllFilters}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "7px 12px",
                  borderRadius: "8px",
                  border: "1px solid #FCA5A5",
                  background: "#FEF2F2",
                  color: "#DC2626",
                  fontWeight: "700",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={13} /> Reset Filter
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", background: "#F8FAFC", padding: "8px 12px", borderRadius: "10px", border: "1px solid #CBD5E1" }}>
            <Search size={15} color="var(--text-muted)" style={{ marginRight: "8px", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Cari nama, email, PTN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", width: "100%", fontSize: "0.86rem", background: "transparent" }}
            />
          </div>

          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "0.85rem", fontWeight: "600", background: "white" }}
          >
            <option value="ALL">Semua Paket Ujian</option>
            {examOptionsWithCount.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.participantCount} peserta)
              </option>
            ))}
          </select>

          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "0.85rem", fontWeight: "600", background: "white" }}
          >
            <option value="ALL">Semua Pesantren / Sekolah</option>
            {schoolOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value as any)}
            style={{ padding: "8px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "0.85rem", fontWeight: "600", background: "white" }}
          >
            <option value="ALL">Semua Kategori Skor</option>
            <option value="HIGH">Tinggi (&gt;= 600 IRT / &gt;= 75)</option>
            <option value="MID">Menengah (450–599 / 55–74)</option>
            <option value="LOW">Perlu Pembinaan (&lt; 450 / &lt; 55)</option>
          </select>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="Dari tanggal ujian"
              style={{ flex: 1, minWidth: 0, padding: "7px 8px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "0.8rem" }}
            />
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="Sampai tanggal ujian"
              style={{ flex: 1, minWidth: 0, padding: "7px 8px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "0.8rem" }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ padding: "8px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "0.85rem", fontWeight: "600", background: "white" }}
          >
            <option value="SCORE_DESC">Urutkan: Skor Tertinggi</option>
            <option value="SCORE_ASC">Urutkan: Skor Terendah</option>
            <option value="LATEST">Urutkan: Terbaru Ujian</option>
            <option value="ATTEMPTS_DESC">Urutkan: Terbanyak Ujian</option>
            <option value="NAME_ASC">Urutkan: Nama A–Z</option>
          </select>
        </div>
      </div>

      {/* Analytics Cards: Distribusi Skor & Statistik Subtes */}
      {analytics.totalAttempts > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          {/* Score Distribution */}
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: "800", color: "#0F172A" }}>
              Distribusi Rentang Skor
            </h3>
            <p style={{ margin: "0 0 14px 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Sebaran nilai dari {analytics.totalAttempts} sesi ujian yang cocok dengan filter
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {analytics.brackets.map((b) => (
                <div key={b.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: "700", marginBottom: "4px" }}>
                    <span style={{ color: "#334155" }}>{b.label}</span>
                    <span style={{ color: b.color }}>
                      {b.count} sesi ({b.pct}%)
                    </span>
                  </div>
                  <div style={{ height: "8px", background: "#F1F5F9", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: "999px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-Subtest Statistics */}
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: "800", color: "#0F172A" }}>
                  Statistik Rata-rata per Subtes
                </h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Skor rata-rata dan akurasi jawaban tiap subtes
                </p>
              </div>
              {analytics.strongestSubtest && analytics.weakestSubtest && (
                <div style={{ fontSize: "0.74rem", textAlign: "right" }}>
                  <div style={{ color: "#059669", fontWeight: "700" }}>
                    Terkuat: {analytics.strongestSubtest.subject} ({analytics.strongestSubtest.avgScore})
                  </div>
                  <div style={{ color: "#D97706", fontWeight: "700" }}>
                    Perlu Penguatan: {analytics.weakestSubtest.subject} ({analytics.weakestSubtest.avgScore})
                  </div>
                </div>
              )}
            </div>

            {analytics.subtestStats.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "20px 0" }}>
                Belum ada rincian subtes untuk filter ini.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                {analytics.subtestStats.map((sub) => {
                  const pct = Math.min(100, Math.round((sub.avgScore / Math.max(1, sub.fullMark)) * 100));
                  return (
                    <div key={sub.subject}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "700", marginBottom: "3px", gap: "8px" }}>
                        <span style={{ color: "#0F172A" }}>{sub.subject}</span>
                        <span style={{ color: "#0284C7", whiteSpace: "nowrap" }}>
                          Rata-rata {sub.avgScore} • Akurasi {sub.accuracyPct}%
                        </span>
                      </div>
                      <div style={{ height: "7px", background: "#F1F5F9", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "#0284C7", borderRadius: "999px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div
        style={{
          background: "white",
          borderRadius: "1rem",
          border: "1px solid var(--border)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            padding: "1.15rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#F8FAFC",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", color: "var(--text)", fontWeight: "800", margin: 0 }}>
            {viewMode === "STUDENTS"
              ? `Daftar Rekap Peserta (${filteredRows.length})`
              : `Log Pengerjaan Ujian (${filteredSessions.length} Sesi)`}
          </h2>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>
            Klik &ldquo;Detail &amp; Subtes&rdquo; untuk melihat analisis lengkap tiap peserta
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          {viewMode === "STUDENTS" ? (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.92rem" }}>
              <thead style={{ background: "#F8FAFC" }}>
                <tr>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>No</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>Peserta</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>Asal Pesantren / Sekolah</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>Paket &amp; Tanggal Terakhir</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", textAlign: "center" }}>Sesi</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", textAlign: "center" }}>Rata-rata Skor</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                      Tidak ada peserta yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, idx) => {
                    const u = row.user;
                    const numExams = row.scopedAttempts.length;
                    const latest = row.latestAttempt;

                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "13px 15px", fontWeight: "700", color: "var(--text-muted)" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "13px 15px" }}>
                          <div style={{ fontWeight: "700", color: "var(--primary)" }}>{u.name}</div>
                          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{u.email}</div>
                          {u.snbpTargetUniv && (
                            <div style={{ fontSize: "0.76rem", color: "#475569", marginTop: "2px" }}>
                              🎯 {u.snbpTargetMajor ? `${u.snbpTargetMajor} • ` : ""}{u.snbpTargetUniv}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "13px 15px", color: "var(--text)" }}>
                          {u.schoolName || "-"}
                        </td>
                        <td style={{ padding: "13px 15px" }}>
                          {latest ? (
                            <div>
                              <div style={{ fontWeight: "600", color: "#0F172A", fontSize: "0.86rem" }}>
                                {latest.examTitle}
                              </div>
                              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                {latest.date}
                                {latest.totalQuestions > 0
                                  ? ` • Benar ${latest.correctCount}/${latest.totalQuestions}`
                                  : ""}
                              </div>
                            </div>
                          ) : (
                            <span
                              style={{
                                display: "inline-block",
                                fontSize: "0.78rem",
                                padding: "3px 10px",
                                borderRadius: "999px",
                                background: "#F1F5F9",
                                color: "#64748B",
                                fontWeight: "600",
                              }}
                            >
                              Belum Ujian
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "13px 15px", textAlign: "center", fontWeight: "700" }}>
                          {numExams}
                        </td>
                        <td style={{ padding: "13px 15px", textAlign: "center" }}>
                          {numExams > 0 ? (
                            <div>
                              <strong
                                style={{
                                  fontSize: "1.08rem",
                                  color: row.avgScore >= 600 ? "#059669" : row.avgScore >= 450 ? "#0284C7" : "#D97706",
                                }}
                              >
                                {row.avgScore}
                              </strong>
                              {numExams > 1 && (
                                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                  Max: {row.maxScore}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "#94A3B8" }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: "13px 15px", textAlign: "center" }}>
                          <button
                            onClick={() => setSelectedUserId(u.id)}
                            style={{
                              background: "white",
                              border: "1px solid #CBD5E1",
                              padding: "7px 12px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              fontSize: "0.82rem",
                              fontWeight: "700",
                              color: "#0F172A",
                            }}
                          >
                            <Info size={14} /> Detail &amp; Subtes
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.92rem" }}>
              <thead style={{ background: "#F8FAFC" }}>
                <tr>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>No</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>Peserta</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>Paket Ujian</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>Waktu Selesai</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", textAlign: "center" }}>Benar</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", textAlign: "center" }}>Skor</th>
                  <th style={{ padding: "13px 15px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                      Tidak ada sesi ujian yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((item, idx) => (
                    <tr key={item.attempt.attemptId} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "13px 15px", fontWeight: "700", color: "var(--text-muted)" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "13px 15px" }}>
                        <div style={{ fontWeight: "700", color: "var(--primary)" }}>{item.user.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          {item.user.schoolName || item.user.email}
                        </div>
                      </td>
                      <td style={{ padding: "13px 15px" }}>
                        <div style={{ fontWeight: "600" }}>{item.attempt.examTitle}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {item.attempt.examType} • {item.attempt.durationMinutes} menit
                        </div>
                      </td>
                      <td style={{ padding: "13px 15px", fontSize: "0.84rem", color: "#334155" }}>
                        {new Date(item.attempt.completedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB
                      </td>
                      <td style={{ padding: "13px 15px", textAlign: "center", fontWeight: "600" }}>
                        {item.attempt.totalQuestions > 0
                          ? `${item.attempt.correctCount}/${item.attempt.totalQuestions}`
                          : "-"}
                      </td>
                      <td style={{ padding: "13px 15px", textAlign: "center" }}>
                        <strong style={{ fontSize: "1.08rem", color: "#059669" }}>
                          {item.attempt.score}
                        </strong>{" "}
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          /{item.attempt.scaleMax}
                        </span>
                      </td>
                      <td style={{ padding: "13px 15px", textAlign: "center" }}>
                        <button
                          onClick={() => setSelectedUserId(item.user.id)}
                          style={{
                            background: "white",
                            border: "1px solid #CBD5E1",
                            padding: "6px 11px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: "700",
                            color: "#0F172A",
                          }}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
