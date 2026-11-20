"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  SantriBaznas, 
  PesantrenProfile, 
  LogbookBimbingan, 
  AsnafCategory 
} from "@/lib/baznasSeed";
import { computeAttemptAnalytics, downloadCsvFile } from "@/lib/tryoutAnalytics";

interface TryoutSummaryStat {
  totalSantri: number;
  santriSudahTo: number;
  totalAttempts: number;
  averageScoreParticipating: number;
  highestSantri: { name: string; score: number } | null;
  examPackages: {
    examId: string;
    title: string;
    type: string;
    participantCount: number;
    averageScore: number;
  }[];
}

interface OverviewStat {
  id: string;
  namaPesantren: string;
  nsp: string;
  adminEmail: string | null;
  santriCount: number;
  logbookCount: number;
  totalAnggaran: number;
}
import { 
  Building2, Users, FileText, Award, BookOpen, 
  Calendar, CheckCircle2, Plus, Download, Upload, 
  Trash2, Printer, Search, ArrowUpRight, GraduationCap,
  ShieldCheck, HelpCircle, AlertCircle, BarChart3, Clock, Eye, X
} from "lucide-react";

export default function BaznasSantriPage() {
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activePesantrenId, setActivePesantrenId] = useState("");
  const [overviewStats, setOverviewStats] = useState<OverviewStat[]>([]);
  const [profile, setProfile] = useState<PesantrenProfile | null>(null);
  const [santriList, setSantriList] = useState<SantriBaznas[]>([]);
  const [tryoutSummary, setTryoutSummary] = useState<TryoutSummaryStat | null>(null);
  const [logbookList, setLogbookList] = useState<LogbookBimbingan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"dts" | "tryout" | "logbook" | "profil">("dts");
  const [searchQuery, setSearchQuery] = useState("");
  const [toFilterStatus, setToFilterStatus] = useState<"ALL" | "DONE" | "PENDING">("ALL");
  const [toPaketFilter, setToPaketFilter] = useState<string>("ALL");
  const [toKelasFilter, setToKelasFilter] = useState<string>("ALL");
  const [toScoreFilter, setToScoreFilter] = useState<"ALL" | "HIGH" | "MID" | "LOW">("ALL");
  const [toSortMode, setToSortMode] = useState<"SCORE_DESC" | "SCORE_ASC" | "LATEST" | "NAME_ASC">("SCORE_DESC");
  const [selectedSantriForTo, setSelectedSantriForTo] = useState<SantriBaznas | null>(null);

  // Modals
  const [isAddSantriOpen, setIsAddSantriOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Form New Santri
  const [newSantriName, setNewSantriName] = useState("");
  const [newSantriNisn, setNewSantriNisn] = useState("");
  const [newSantriGender, setNewSantriGender] = useState<"L" | "P">("L");
  const [newSantriKelas, setNewSantriKelas] = useState("XII MIPA");
  const [newSantriAsnaf, setNewSantriAsnaf] = useState<AsnafCategory>("MISKIN");
  const [newSantriHafalan, setNewSantriHafalan] = useState<number>(5);
  const [newSantriPrestasi, setNewSantriPrestasi] = useState("");
  const [newSantriUniv1, setNewSantriUniv1] = useState("UNIVERSITAS INDONESIA");
  const [newSantriProdi1, setNewSantriProdi1] = useState("Ilmu Komputer");
  const [newSantriUniv2, setNewSantriUniv2] = useState("UNIVERSITAS GADJAH MADA");
  const [newSantriProdi2, setNewSantriProdi2] = useState("Teknik Industri");
  const [newSantriSktm, setNewSantriSktm] = useState("405/SKTM/CSR/2026");

  // Form Logbook
  const [logTanggal, setLogTanggal] = useState("");
  const [logWaktu, setLogWaktu] = useState("08:30 - 11:30 WIB");
  const [logMateri, setLogMateri] = useState("");
  const [logSubtes, setLogSubtes] = useState("TPS - Pengetahuan Kuantitatif (PK)");
  const [logTutor, setLogTutor] = useState("");
  const [logHadir, setLogHadir] = useState<number>(6);
  const [logKet, setLogKet] = useState("");

  const fetchBaznasData = useCallback(async (targetPesantrenId?: string) => {
    setLoading(true);
    try {
      const qs = targetPesantrenId ? `?pesantrenId=${encodeURIComponent(targetPesantrenId)}` : "";
      const res = await fetch(`/api/admin/baznas${qs}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat data BAZNAS");
      const data = await res.json();
      setIsSuperAdmin(Boolean(data.isSuperAdmin));
      setActivePesantrenId(data.activePesantrenId || "");
      setOverviewStats(data.overviewStats || []);
      setProfile(data.profile || null);
      setSantriList(data.santriList || []);
      setTryoutSummary(data.tryoutSummary || null);
      setLogbookList(data.logbookList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBaznasData();
  }, [fetchBaznasData]);

  const handleSwitchPesantren = async (targetId: string) => {
    setSaving(true);
    try {
      await fetch("/api/admin/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesantrenId: targetId }),
      });
      await fetchBaznasData(targetId);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const postBaznasAction = async (action: string, payload: unknown, pesantrenIdOverride?: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/baznas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          pesantrenId: pesantrenIdOverride || activePesantrenId,
          payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Terjadi kesalahan saat menyimpan data");
        return null;
      }
      return data;
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSantri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSantriName.trim() || !newSantriNisn.trim()) return;

    const res = await postBaznasAction("add_santri", {
      name: newSantriName,
      nisn: newSantriNisn,
      gender: newSantriGender,
      kelas: newSantriKelas,
      asnaf: newSantriAsnaf,
      hafalanJuz: Number(newSantriHafalan),
      prestasi: newSantriPrestasi || "Santri Berprestasi Pesantren",
      targetUniv1: newSantriUniv1,
      targetMajor1: newSantriProdi1,
      targetUniv2: newSantriUniv2,
      targetMajor2: newSantriProdi2,
      tryoutScores: [
        { tryoutName: "TO 1 - Diagnostik", score: 550, date: new Date().toISOString().split("T")[0] }
      ],
      statusKelulusan: "BELUM_DIUMUMKAN",
      sktmNomor: newSantriSktm,
    });

    if (res) {
      await fetchBaznasData(activePesantrenId);
      setIsAddSantriOpen(false);
      resetSantriForm();
    }
  };

  const resetSantriForm = () => {
    setNewSantriName("");
    setNewSantriNisn("");
    setNewSantriPrestasi("");
  };

  const handleDeleteSantri = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus santri ini dari daftar program?")) {
      const res = await postBaznasAction("delete_santri", { id });
      if (res) {
        await fetchBaznasData(activePesantrenId);
      }
    }
  };

  const handleCreateLogbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logMateri.trim() || !logTutor.trim()) return;

    const res = await postBaznasAction("add_logbook", {
      tanggal: logTanggal || new Date().toISOString().split("T")[0],
      waktu: logWaktu,
      materi: logMateri,
      subtes: logSubtes,
      tutor: logTutor,
      jumlahHadir: Number(logHadir),
      keterangan: logKet,
    });

    if (res) {
      await fetchBaznasData(activePesantrenId);
      setIsAddLogOpen(false);
      setLogMateri("");
      setLogKet("");
    }
  };

  const handleDeleteLogbook = async (id: string) => {
    if (confirm("Hapus catatan sesi ini?")) {
      const res = await postBaznasAction("delete_logbook", { id });
      if (res) {
        await fetchBaznasData(activePesantrenId);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const res = await postBaznasAction("update_profile", profile);
    if (res) {
      await fetchBaznasData(activePesantrenId);
      setIsEditProfileOpen(false);
    }
  };

  const handleSampleImport = async () => {
    const sampleBatch = [
      {
        name: "Ahmad Bilal Al-Ghifari",
        nisn: `00681${Math.floor(10000 + Math.random() * 89999)}`,
        gender: "L",
        kelas: "XII MIPA 1",
        asnaf: "FAKIR",
        hafalanJuz: 12,
        prestasi: "Juara 1 Tilawah Tingkat Kota",
        targetUniv1: "UNIVERSITAS INDONESIA",
        targetMajor1: "Teknik Elektro",
        targetUniv2: "INSTITUT TEKNOLOGI BANDUNG",
        targetMajor2: "Fakultas Teknik Industri",
        tryoutScores: [{ tryoutName: "TO 1 - Diagnostik", score: 580, date: "2026-08-10" }],
        averageScore: 580,
        statusKelulusan: "BELUM_DIUMUMKAN",
        sktmNomor: "410/SKTM/CSR/2026"
      },
      {
        name: "Fathimah Az-Zahra",
        nisn: `00682${Math.floor(10000 + Math.random() * 89999)}`,
        gender: "P",
        kelas: "XII Keagamaan",
        asnaf: "MISKIN",
        hafalanJuz: 30,
        prestasi: "Juara Umum Hafidz 30 Juz Nasional",
        targetUniv1: "UNIVERSITAS PADJADJARAN",
        targetMajor1: "Farmasi",
        targetUniv2: "UIN SYARIF HIDAYATULLAH",
        targetMajor2: "Kedokteran",
        tryoutScores: [{ tryoutName: "TO 1 - Diagnostik", score: 640, date: "2026-08-10" }],
        averageScore: 640,
        statusKelulusan: "BELUM_DIUMUMKAN",
        sktmNomor: "411/SKTM/CSR/2026"
      }
    ];

    const res = await postBaznasAction("import_santri_bulk", { items: sampleBatch });
    if (res) {
      await fetchBaznasData(activePesantrenId);
      setIsImportOpen(false);
      alert("Berhasil mengimpor 2 data santri contoh ke database pesantren ini!");
    }
  };

  const filteredSantri = santriList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nisn.includes(searchQuery) ||
    s.targetUniv1.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSantri = santriList.length;
  const totalDana = totalSantri * (profile?.anggaranPerSantri || 4000000);
  const participatingSantri = santriList.filter((s) => (s.tryoutScores?.length || 0) > 0);
  const sudahToCount = tryoutSummary?.santriSudahTo ?? participatingSantri.length;
  const avgTryout =
    tryoutSummary?.averageScoreParticipating ??
    (participatingSantri.length > 0
      ? Math.round(
          participatingSantri.reduce((acc, s) => acc + (s.averageScore || 0), 0) /
            participatingSantri.length
        )
      : 0);
  const totalTahfidz = santriList.filter(s => s.hafalanJuz >= 5).length;
  const totalDiterima = santriList.filter(s => s.statusKelulusan !== "BELUM_DIUMUMKAN" && s.statusKelulusan !== "TIDAK_LOLOS").length;

  const kelasOptions = Array.from(new Set(santriList.map((s) => s.kelas).filter(Boolean))).sort();

  const tryoutScopedSantri = santriList.map((s) => {
    const scopedScores =
      toPaketFilter === "ALL"
        ? s.tryoutScores || []
        : (s.tryoutScores || []).filter((t) => t.examId === toPaketFilter);
    const scopedHistory =
      toPaketFilter === "ALL"
        ? s.attemptHistory || []
        : (s.attemptHistory || []).filter((a) => a.examId === toPaketFilter);
    const scopedAvg =
      scopedScores.length > 0
        ? Math.round(
            scopedScores.reduce((acc, t) => acc + Number(t.score || 0), 0) / scopedScores.length
          )
        : 0;
    const scopedLatest =
      scopedScores.length > 0 ? scopedScores[scopedScores.length - 1].score : null;
    return {
      ...s,
      tryoutScores: scopedScores,
      attemptHistory: scopedHistory,
      averageScore: scopedAvg,
      latestScore: scopedLatest,
    };
  });

  const filteredTryoutSantri = tryoutScopedSantri
    .filter((s) => {
      const matchesSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        s.targetUniv1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.targetMajor1.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (toKelasFilter !== "ALL" && s.kelas !== toKelasFilter) return false;

      const hasTo = (s.tryoutScores?.length || 0) > 0;
      if (toFilterStatus === "DONE" && !hasTo) return false;
      if (toFilterStatus === "PENDING" && hasTo) return false;

      if (toScoreFilter !== "ALL") {
        if (!hasTo) return false;
        if (toScoreFilter === "HIGH" && s.averageScore < 600) return false;
        if (toScoreFilter === "MID" && (s.averageScore < 450 || s.averageScore >= 600)) return false;
        if (toScoreFilter === "LOW" && s.averageScore >= 450) return false;
      } else if (toPaketFilter !== "ALL" && toFilterStatus === "ALL" && !hasTo) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (toSortMode === "NAME_ASC") {
        return a.name.localeCompare(b.name);
      }
      const hasA = (a.tryoutScores?.length || 0) > 0 ? 1 : 0;
      const hasB = (b.tryoutScores?.length || 0) > 0 ? 1 : 0;
      if (hasB !== hasA) return hasB - hasA;
      if (toSortMode === "SCORE_ASC") {
        return (a.averageScore || 0) - (b.averageScore || 0) || a.name.localeCompare(b.name);
      }
      if (toSortMode === "LATEST") {
        const ta = a.attemptHistory?.[0] ? new Date(a.attemptHistory[0].completedAt).getTime() : 0;
        const tb = b.attemptHistory?.[0] ? new Date(b.attemptHistory[0].completedAt).getTime() : 0;
        if (tb !== ta) return tb - ta;
      }
      const scoreDiff = (b.averageScore || 0) - (a.averageScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return a.name.localeCompare(b.name);
    });

  const filteredPesantrenAnalytics = computeAttemptAnalytics(
    filteredTryoutSantri.flatMap((s) => s.attemptHistory || [])
  );

  const handleExportBaznasCsv = () => {
    const subCols = filteredPesantrenAnalytics.subtestStats.map((sub) => sub.subject);
    const headers = [
      "No",
      "Nama Santri",
      "NISN",
      "Kelas",
      "Asnaf",
      "Hafalan (Juz)",
      "Target PTN 1",
      "Prodi 1",
      "Jumlah TO",
      "Paket Terakhir",
      "Tanggal Terakhir",
      "Skor Terakhir",
      "Rata-rata IRT",
      "Benar / Total",
      ...subCols,
    ];
    const rows = filteredTryoutSantri.map((s, idx) => {
      const latestAtt = s.attemptHistory?.[0];
      const latestTo = s.tryoutScores?.[s.tryoutScores.length - 1];
      const subMap = new Map((latestAtt?.subscores || []).map((sub) => [sub.subject, sub.score]));
      return [
        idx + 1,
        s.name,
        s.nisn,
        s.kelas,
        s.asnaf,
        s.hafalanJuz,
        s.targetUniv1,
        s.targetMajor1,
        s.tryoutScores.length,
        latestTo?.tryoutName || "Belum TO",
        latestTo?.date || "-",
        s.latestScore ?? "-",
        s.tryoutScores.length > 0 ? s.averageScore : "-",
        latestAtt && latestAtt.totalQuestions > 0
          ? `${latestAtt.correctCount}/${latestAtt.totalQuestions}`
          : "-",
        ...subCols.map((sub) => subMap.get(sub) ?? "-"),
      ];
    });
    downloadCsvFile(
      `rekap-to-santri-${activePesantrenId || "pesantren"}-${new Date().toISOString().split("T")[0]}.csv`,
      headers,
      rows
    );
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Panel Switcher & Ringkasan Multi-Pesantren (Super Admin) */}
      {isSuperAdmin && overviewStats.length > 0 && (
        <div style={{ marginBottom: "20px", background: "white", borderRadius: "18px", padding: "18px 22px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#059669", letterSpacing: "0.04em" }}>KONTROL SUPER ADMIN</div>
            <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text)" }}>Pilih Pesantren (Al Abqory / Nurul Bantaniy)</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
            {overviewStats.map((st) => {
              const isSelected = st.id === activePesantrenId;
              return (
                <button
                  key={st.id}
                  onClick={() => handleSwitchPesantren(st.id)}
                  disabled={saving}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: isSelected ? "2px solid #059669" : "1px solid #E2E8F0",
                    background: isSelected ? "#ECFDF5" : "#F8FAFC",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "800", fontSize: "0.98rem", color: isSelected ? "#065F46" : "var(--text)" }}>
                      {st.namaPesantren}
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: "0.72rem", fontWeight: "800", background: "#059669", color: "white", padding: "2px 8px", borderRadius: "999px" }}>
                        Aktif
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span>👥 {st.santriCount} Santri</span>
                    <span>📘 {st.logbookCount} Logbook</span>
                    {st.adminEmail && <span>🔐 {st.adminEmail}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading && !profile && (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontWeight: "600" }}>
          Memuat data BAZNAS dari database...
        </div>
      )}

      {/* Top Banner & Header */}
      <div style={{
        background: "linear-gradient(135deg, #065F46 0%, #047857 50%, #0D9488 100%)",
        borderRadius: "24px",
        padding: "32px",
        color: "white",
        boxShadow: "0 20px 40px -15px rgba(6, 95, 70, 0.4)",
        marginBottom: "30px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-50px", right: "-30px", opacity: 0.15, pointerEvents: "none" }}>
          <Building2 size={240} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.2)", padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700", marginBottom: "14px", backdropFilter: "blur(5px)" }}>
              <ShieldCheck size={16} /> PROGRAM BEASISWA SANTRI BAZNAS (BSB) RI
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0", fontFamily: "'Outfit', sans-serif" }}>
              {profile?.namaPesantren || "Pondok Pesantren"}
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: "1rem", display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
              <span>🕌 NSP Kemenag: <strong>{profile?.nsp}</strong></span>
              <span>•</span>
              <span>👤 Koordinator: <strong>{profile?.koordinator}</strong></span>
              <span>•</span>
              <span>📅 Periode: <strong>{profile?.tahunProgram}</strong></span>
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button 
              onClick={() => setIsEditProfileOpen(true)}
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "10px 16px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              Profil Pesantren
            </button>
            <Link 
              href={activePesantrenId ? `/admin/baznas-santri/lpj?pesantrenId=${encodeURIComponent(activePesantrenId)}` : "/admin/baznas-santri/lpj"} 
              style={{
                background: "#F59E0B",
                color: "white",
                padding: "10px 20px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "0.9rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 20px -5px rgba(245, 158, 11, 0.5)"
              }}
            >
              <Printer size={18} /> Cetak LPJ BAZNAS (Resmi)
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        
        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "white", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Santri Penerima</div>
            <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "var(--text)", fontFamily: "'Outfit', sans-serif" }}>
              {totalSantri} <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "var(--text-muted)" }}>Santri</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#059669", fontWeight: "600" }}>Mustahik Terverifikasi</div>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "white", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
            <Award size={26} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Alokasi Dana BAZNAS</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text)", fontFamily: "'Outfit', sans-serif" }}>
              Rp{(totalDana / 1000000).toFixed(0)} <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "var(--text-muted)" }}>Juta</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#D97706", fontWeight: "600" }}>Rp4 Jt / Santri (Bimbel + TO)</div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("tryout")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setActiveTab("tryout")}
          className="card"
          style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "white", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", cursor: "pointer" }}
          title="Klik untuk membuka Rekap Hasil Tryout Santri"
        >
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284C7" }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Rata-rata Skor TO</div>
            <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "var(--text)", fontFamily: "'Outfit', sans-serif" }}>
              {avgTryout > 0 ? avgTryout : "-"} <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "var(--text-muted)" }}>/ 1000 IRT</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#0284C7", fontWeight: "600" }}>
              {sudahToCount} / {totalSantri} santri sudah TO →
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "white", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#9333EA" }}>
            <BookOpen size={26} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Portofolio Tahfidz</div>
            <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "var(--text)", fontFamily: "'Outfit', sans-serif" }}>
              {totalTahfidz} <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "var(--text-muted)" }}>Santri</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9333EA", fontWeight: "600" }}>Peluang Afirmasi SNBP</div>
          </div>
        </div>

      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid #E2E8F0", marginBottom: "25px", paddingBottom: "2px" }}>
        <button
          onClick={() => setActiveTab("dts")}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "dts" ? "3px solid #059669" : "3px solid transparent",
            color: activeTab === "dts" ? "#059669" : "var(--text-muted)",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Users size={18} /> Data Terpadu Santri (DTS)
        </button>

        <button
          onClick={() => setActiveTab("tryout")}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "tryout" ? "3px solid #059669" : "3px solid transparent",
            color: activeTab === "tryout" ? "#059669" : "var(--text-muted)",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Award size={18} /> Rekap Nilai Tryout & Target PTN
          <span style={{
            fontSize: "0.75rem",
            fontWeight: "800",
            padding: "2px 8px",
            borderRadius: "999px",
            background: sudahToCount > 0 ? "#DCFCE7" : "#F1F5F9",
            color: sudahToCount > 0 ? "#166534" : "#64748B",
          }}>
            {sudahToCount}/{totalSantri} Sudah TO
          </span>
        </button>

        <button
          onClick={() => setActiveTab("logbook")}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "logbook" ? "3px solid #059669" : "3px solid transparent",
            color: activeTab === "logbook" ? "#059669" : "var(--text-muted)",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Calendar size={18} /> Logbook Bimbingan (5W+1H)
        </button>
      </div>

      {/* TAB 1: DATA TERPADU SANTRI (DTS) */}
      {activeTab === "dts" && (
        <div className="card" style={{ background: "white", borderRadius: "18px", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--background)", padding: "10px 16px", borderRadius: "12px", border: "1px solid var(--border)", width: "320px" }}>
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Cari nama santri, NISN, atau target PTN..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "0.9rem" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => setIsImportOpen(true)}
                style={{
                  background: "#F1F5F9",
                  color: "var(--text)",
                  border: "1px solid #CBD5E1",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <Upload size={16} /> Import Excel / CSV
              </button>

              <button 
                onClick={() => setIsAddSantriOpen(true)}
                style={{
                  background: "#059669",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 6px 15px -3px rgba(5, 150, 105, 0.4)"
                }}
              >
                <Plus size={18} /> Tambah Santri
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left", color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "14px 16px" }}>No</th>
                  <th style={{ padding: "14px 16px" }}>Nama Santri & NISN</th>
                  <th style={{ padding: "14px 16px" }}>Asnaf & SKTM</th>
                  <th style={{ padding: "14px 16px" }}>Hafalan & Prestasi</th>
                  <th style={{ padding: "14px 16px" }}>Target PTN 1 & 2</th>
                  <th style={{ padding: "14px 16px" }}>Hasil TO CBT</th>
                  <th style={{ padding: "14px 16px" }}>Akun CBT Santri</th>
                  <th style={{ padding: "14px 16px", textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSantri.map((s, idx) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 16px", fontWeight: "700", color: "var(--text-muted)" }}>{idx + 1}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: "700", color: "var(--text)", fontSize: "1rem" }}>{s.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>NISN: {s.nisn} • {s.kelas} ({s.gender === "L" ? "Santriwan" : "Santriwati"})</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        background: s.asnaf === "FAKIR" ? "#FEE2E2" : s.asnaf === "MISKIN" ? "#FEF3C7" : "#E0F2FE",
                        color: s.asnaf === "FAKIR" ? "#DC2626" : s.asnaf === "MISKIN" ? "#D97706" : "#0284C7"
                      }}>
                        {s.asnaf}
                      </span>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        {s.sktmNomor || "Ada SKTM Kelurahan"}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: "600", color: "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
                        <BookOpen size={15} /> {s.hafalanJuz} Juz Al-Qur'an
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {s.prestasi}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text)" }}>1. {s.targetMajor1} ({s.targetUniv1})</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>2. {s.targetMajor2} ({s.targetUniv2})</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {(s.tryoutScores?.length || 0) > 0 ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedSantriForTo(s)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "#ECFDF5",
                              color: "#065F46",
                              border: "1px solid #A7F3D0",
                              borderRadius: "999px",
                              padding: "4px 10px",
                              fontSize: "0.8rem",
                              fontWeight: "800",
                              cursor: "pointer",
                            }}
                          >
                            <CheckCircle2 size={14} /> Skor {s.latestScore ?? s.averageScore}
                          </button>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                            {s.tryoutScores.length}x TO • Klik lihat subtes
                          </div>
                        </div>
                      ) : (
                        <span style={{
                          display: "inline-block",
                          fontSize: "0.78rem",
                          color: "#64748B",
                          background: "#F1F5F9",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontWeight: "600",
                        }}>
                          Belum TO
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: "0.85rem", fontFamily: "monospace", background: "#F8FAFC", padding: "4px 8px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                        👤 {s.emailLogin}
                        <br />
                        🔑 {s.passwordLogin}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <button 
                        onClick={() => handleDeleteSantri(s.id)}
                        style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "6px 10px", borderRadius: "8px", cursor: "pointer" }}
                        title="Hapus Santri"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REKAP NILAI TRYOUT & REKOMENDASI PTN */}
      {activeTab === "tryout" && (
        <div className="card" style={{ background: "white", borderRadius: "18px", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", marginBottom: "20px" }}>
            <div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "1.2rem", fontWeight: "800" }}>Rekap Hasil Tryout CBT & Rekomendasi PTN Santri</h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Terhubung langsung dengan hasil ujian CBT santri secara real-time (skor IRT total, benar/salah, dan rincian 7 subtes).
              </p>
            </div>
            <Link
              href="/admin/reports/scores"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "10px",
                background: "#F1F5F9",
                color: "#0F172A",
                fontWeight: "700",
                fontSize: "0.85rem",
                textDecoration: "none",
                border: "1px solid #CBD5E1",
              }}
            >
              <BarChart3 size={16} /> Laporan Nilai Global <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Ringkasan Eksekutif TO */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px", marginBottom: "18px" }}>
            <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "12px", padding: "14px" }}>
              <div style={{ fontSize: "0.78rem", color: "#047857", fontWeight: "700" }}>Partisipasi Tryout</div>
              <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#065F46", marginTop: "4px" }}>
                {sudahToCount} / {totalSantri} Santri
              </div>
              <div style={{ fontSize: "0.75rem", color: "#059669" }}>
                {totalSantri > 0 ? Math.round((sudahToCount / totalSantri) * 100) : 0}% sudah mengerjakan
              </div>
            </div>

            <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "14px" }}>
              <div style={{ fontSize: "0.78rem", color: "#1D4ED8", fontWeight: "700" }}>Total Pengerjaan CBT</div>
              <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#1E3A8A", marginTop: "4px" }}>
                {tryoutSummary?.totalAttempts ?? participatingSantri.length} Sesi
              </div>
              <div style={{ fontSize: "0.75rem", color: "#2563EB" }}>Tersinkron otomatis</div>
            </div>

            <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "12px", padding: "14px" }}>
              <div style={{ fontSize: "0.78rem", color: "#B45309", fontWeight: "700" }}>Rata-rata Peserta TO</div>
              <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#92400E", marginTop: "4px" }}>
                {avgTryout > 0 ? avgTryout : "-"} <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>IRT</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#D97706" }}>Khusus santri yang sudah TO</div>
            </div>

            <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: "12px", padding: "14px" }}>
              <div style={{ fontSize: "0.78rem", color: "#6D28D9", fontWeight: "700" }}>Skor Tertinggi</div>
              <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#4C1D95", marginTop: "4px" }}>
                {tryoutSummary?.highestSantri ? tryoutSummary.highestSantri.score : "-"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#7C3AED", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {tryoutSummary?.highestSantri?.name || "Belum ada peserta"}
              </div>
            </div>
          </div>

          {/* Ringkasan Paket Ujian CBT */}
          {(tryoutSummary?.examPackages?.length || 0) > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
              {tryoutSummary!.examPackages.map((pkg) => (
                <div key={pkg.examId} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "8px 14px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: "800", color: "#0F172A" }}>{pkg.title}</span>
                  <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "2px 8px", borderRadius: "999px", fontWeight: "700", fontSize: "0.74rem" }}>
                    {pkg.participantCount} Santri
                  </span>
                  <span style={{ background: "#ECFDF5", color: "#047857", padding: "2px 8px", borderRadius: "999px", fontWeight: "700", fontSize: "0.74rem" }}>
                    Rata-rata: {pkg.averageScore}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Statistik Distribusi & Rata-rata per Subtes Pesantren */}
          {filteredPesantrenAnalytics.totalAttempts > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px", marginBottom: "18px" }}>
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontWeight: "800", fontSize: "0.9rem", color: "#0F172A" }}>
                    Distribusi Skor IRT ({filteredPesantrenAnalytics.totalAttempts} Sesi)
                  </span>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: "700" }}>
                    Median {filteredPesantrenAnalytics.medianScore} • Min {filteredPesantrenAnalytics.minScore} – Max {filteredPesantrenAnalytics.maxScore}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {filteredPesantrenAnalytics.brackets.map((b) => (
                    <div key={b.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: "700", marginBottom: "3px" }}>
                        <span style={{ color: "#334155" }}>{b.label}</span>
                        <span style={{ color: b.color }}>{b.count} sesi ({b.pct}%)</span>
                      </div>
                      <div style={{ height: "6px", background: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ width: `${b.pct}%`, height: "100%", background: b.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {filteredPesantrenAnalytics.subtestStats.length > 0 && (
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: "800", fontSize: "0.9rem", color: "#0F172A" }}>
                      Statistik Rata-rata per Subtes
                    </span>
                    {filteredPesantrenAnalytics.weakestSubtest && (
                      <span style={{ fontSize: "0.73rem", color: "#B45309", background: "#FEF3C7", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>
                        Fokus Pembinaan: {filteredPesantrenAnalytics.weakestSubtest.subject}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                    {filteredPesantrenAnalytics.subtestStats.map((sub) => {
                      const pct = Math.min(100, Math.round((sub.avgScore / Math.max(1, sub.fullMark)) * 100));
                      return (
                        <div key={sub.subject}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", fontWeight: "700", marginBottom: "2px" }}>
                            <span style={{ color: "#0F172A" }}>{sub.subject}</span>
                            <span style={{ color: "#0284C7" }}>
                              Rata-rata {sub.avgScore} ({sub.accuracyPct}% benar)
                            </span>
                          </div>
                          <div style={{ height: "6px", background: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#059669" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filter & Sort Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {([
                { key: "ALL", label: `Semua Santri (${totalSantri})` },
                { key: "DONE", label: `Sudah Ikut TO (${sudahToCount})` },
                { key: "PENDING", label: `Belum Ikut TO (${Math.max(0, totalSantri - sudahToCount)})` },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setToFilterStatus(f.key)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "999px",
                    border: toFilterStatus === f.key ? "1px solid #059669" : "1px solid #CBD5E1",
                    background: toFilterStatus === f.key ? "#059669" : "white",
                    color: toFilterStatus === f.key ? "white" : "#334155",
                    fontWeight: "700",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--background)", padding: "8px 12px", borderRadius: "10px", border: "1px solid var(--border)", width: "210px" }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Cari nama santri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "0.85rem" }}
                />
              </div>

              {(tryoutSummary?.examPackages?.length || 0) > 0 && (
                <select
                  value={toPaketFilter}
                  onChange={(e) => setToPaketFilter(e.target.value)}
                  style={{ padding: "8px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "0.84rem", fontWeight: "600", background: "white" }}
                >
                  <option value="ALL">Semua Paket TO</option>
                  {tryoutSummary!.examPackages.map((pkg) => (
                    <option key={pkg.examId} value={pkg.examId}>
                      {pkg.title} ({pkg.participantCount})
                    </option>
                  ))}
                </select>
              )}

              {kelasOptions.length > 1 && (
                <select
                  value={toKelasFilter}
                  onChange={(e) => setToKelasFilter(e.target.value)}
                  style={{ padding: "8px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "0.84rem", fontWeight: "600", background: "white" }}
                >
                  <option value="ALL">Semua Kelas</option>
                  {kelasOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={toScoreFilter}
                onChange={(e) => setToScoreFilter(e.target.value as any)}
                style={{ padding: "8px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "0.84rem", fontWeight: "600", background: "white" }}
              >
                <option value="ALL">Semua Kategori Skor</option>
                <option value="HIGH">Peluang PTN (&gt;= 600)</option>
                <option value="MID">Kompetitif (450–599)</option>
                <option value="LOW">Pemantapan (&lt; 450)</option>
              </select>

              <select
                value={toSortMode}
                onChange={(e) => setToSortMode(e.target.value as any)}
                style={{ padding: "8px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "0.84rem", fontWeight: "600", background: "white" }}
              >
                <option value="SCORE_DESC">Urutkan: Skor Tertinggi</option>
                <option value="SCORE_ASC">Urutkan: Skor Terendah</option>
                <option value="LATEST">Urutkan: Terbaru TO</option>
                <option value="NAME_ASC">Urutkan: Nama A–Z</option>
              </select>

              <button
                type="button"
                onClick={handleExportBaznasCsv}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#0F172A",
                  color: "white",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 14px" }}>No</th>
                  <th style={{ padding: "12px 14px" }}>Nama Santri & Target PTN</th>
                  <th style={{ padding: "12px 14px" }}>Riwayat Tryout CBT</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Skor Terakhir</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Rata-rata</th>
                  <th style={{ padding: "12px 14px" }}>Evaluasi Kesiapan</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Rincian Subtes</th>
                </tr>
              </thead>
              <tbody>
                {filteredTryoutSantri.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                      Tidak ada data santri pada filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredTryoutSantri.map((s, idx) => {
                    const hasTo = (s.tryoutScores?.length || 0) > 0;
                    const attempts = s.attemptHistory || [];
                    const latestAttempt = attempts[0];
                    const latestScore = s.latestScore ?? (hasTo ? s.tryoutScores[s.tryoutScores.length - 1].score : null);
                    const avg = s.averageScore || 0;
                    const isHigh = avg >= 600;
                    const isMid = avg >= 450 && avg < 600;

                    return (
                      <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "12px 14px", fontWeight: "700", color: "var(--text-muted)" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: "700", color: "var(--text)" }}>{s.name}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            {s.kelas} • {s.hafalanJuz} Juz • {s.targetMajor1} ({s.targetUniv1})
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {hasTo ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              {s.tryoutScores.slice(-3).map((t, i) => (
                                <div key={`${t.attemptId || t.tryoutName}-${i}`} style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                  <span style={{ background: "#ECFDF5", color: "#065F46", fontWeight: "800", padding: "2px 8px", borderRadius: "6px" }}>
                                    {t.score}
                                  </span>
                                  <span style={{ fontWeight: "600", color: "#0F172A" }}>{t.tryoutName}</span>
                                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                    ({t.date}{t.totalQuestions ? ` • ${t.correctCount}/${t.totalQuestions} benar` : ""})
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: "#94A3B8", fontSize: "0.82rem", fontStyle: "italic" }}>
                              Belum mengerjakan TO di CBT
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: "800", fontSize: "1.05rem", color: hasTo ? "#0F172A" : "#94A3B8" }}>
                          {latestScore !== null ? latestScore : "-"}
                          {latestAttempt && (
                            <div style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)" }}>
                              {latestAttempt.date}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <span style={{ fontSize: "1.1rem", fontWeight: "800", color: !hasTo ? "#94A3B8" : isHigh ? "#059669" : isMid ? "#0284C7" : "#D97706" }}>
                            {hasTo ? avg : "-"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {!hasTo ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#64748B", background: "#F1F5F9", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "700" }}>
                              Belum Ujian
                            </span>
                          ) : isHigh ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#059669", background: "#ECFDF5", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "700" }}>
                              <CheckCircle2 size={14} /> Berpeluang Lolos PTN
                            </span>
                          ) : isMid ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#0369A1", background: "#E0F2FE", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "700" }}>
                              Progres Kompetitif
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#D97706", background: "#FEF3C7", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "700" }}>
                              <AlertCircle size={14} /> Perlu Pemantapan
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <button
                            type="button"
                            disabled={!hasTo}
                            onClick={() => setSelectedSantriForTo(s)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              border: "1px solid #CBD5E1",
                              background: hasTo ? "white" : "#F8FAFC",
                              color: hasTo ? "#059669" : "#94A3B8",
                              fontWeight: "700",
                              fontSize: "0.8rem",
                              cursor: hasTo ? "pointer" : "not-allowed",
                            }}
                          >
                            <Eye size={14} /> Detail Subtes
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOGBOOK BIMBINGAN (5W+1H) */}
      {activeTab === "logbook" && (
        <div className="card" style={{ background: "white", borderRadius: "18px", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginBottom: "20px" }}>
            <div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "1.2rem", fontWeight: "800" }}>Jurnal Harian Bimbingan Belajar Santri (BAB II LPJ)</h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>Rincian pertemuan bimbingan intensif persiapan PTN untuk diikutsertakan dalam LPJ BAZNAS.</p>
            </div>

            <button 
              onClick={() => setIsAddLogOpen(true)}
              style={{
                background: "#059669",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 6px 15px -3px rgba(5, 150, 105, 0.4)"
              }}
            >
              <Plus size={18} /> Tambah Sesi Pertemuan
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {logbookList.map((log, index) => (
              <div key={log.id} style={{ border: "1px solid #E2E8F0", borderRadius: "14px", padding: "18px", background: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px" }}>
                <div style={{ flex: "1 1 500px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ background: "#059669", color: "white", padding: "3px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700" }}>
                      Pertemuan #{logbookList.length - index}
                    </span>
                    <span style={{ fontWeight: "700", color: "var(--text)", fontSize: "0.95rem" }}>
                      📅 {log.tanggal} ({log.waktu})
                    </span>
                    <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "2px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "600" }}>
                      {log.subtes}
                    </span>
                  </div>

                  <h4 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "var(--text)", fontWeight: "800" }}>
                    {log.materi}
                  </h4>

                  <p style={{ margin: "0 0 10px 0", color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                    {log.keterangan}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "0.85rem", color: "var(--text)" }}>
                    <span>👨‍🏫 Pemateri: <strong>{log.tutor}</strong></span>
                    <span>👥 Kehadiran: <strong>{log.jumlahHadir} Santri</strong></span>
                  </div>
                </div>

                <div>
                  <button 
                    onClick={() => handleDeleteLogbook(log.id)}
                    style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer" }}
                    title="Hapus Sesi"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH SANTRI */}
      {isAddSantriOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "30px", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.4rem", fontWeight: "800", color: "var(--text)" }}>
              Tambah Santri Penerima BAZNAS
            </h3>
            
            <form onSubmit={handleCreateSantri} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "5px" }}>Nama Lengkap Santri</label>
                <input required type="text" value={newSantriName} onChange={e => setNewSantriName(e.target.value)} placeholder="Contoh: Muhammad Ihsan" className="field" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "5px" }}>NISN (10 Digit)</label>
                  <input required type="text" value={newSantriNisn} onChange={e => setNewSantriNisn(e.target.value)} placeholder="0068192301" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "5px" }}>Jenis Kelamin</label>
                  <select value={newSantriGender} onChange={e => setNewSantriGender(e.target.value as any)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                    <option value="L">Laki-laki (Santriwan)</option>
                    <option value="P">Perempuan (Santriwati)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "5px" }}>Kategori Asnaf BAZNAS</label>
                  <select value={newSantriAsnaf} onChange={e => setNewSantriAsnaf(e.target.value as any)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                    <option value="MISKIN">Miskin</option>
                    <option value="FAKIR">Fakir</option>
                    <option value="FISABILILLAH">Fisabilillah</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "5px" }}>Hafalan Al-Qur'an (Juz)</label>
                  <input type="number" min="0" max="30" value={newSantriHafalan} onChange={e => setNewSantriHafalan(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "5px" }}>Prestasi Santri / Sertifikat</label>
                <input type="text" value={newSantriPrestasi} onChange={e => setNewSantriPrestasi(e.target.value)} placeholder="Contoh: Juara 2 Lomba Kitab Kuning / Tahfidz 10 Juz" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "5px" }}>Target PTN Pilihan 1</label>
                  <input type="text" value={newSantriUniv1} onChange={e => setNewSantriUniv1(e.target.value)} placeholder="UNIVERSITAS INDONESIA" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "5px" }}>Jurusan Pilihan 1</label>
                  <input type="text" value={newSantriProdi1} onChange={e => setNewSantriProdi1(e.target.value)} placeholder="Ilmu Komputer" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                <button type="button" onClick={() => setIsAddSantriOpen(false)} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #CBD5E1", background: "none", cursor: "pointer", fontWeight: "600" }}>
                  Batal
                </button>
                <button type="submit" style={{ padding: "10px 20px", borderRadius: "10px", background: "#059669", color: "white", border: "none", cursor: "pointer", fontWeight: "700" }}>
                  Simpan Santri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT EXCEL/CSV */}
      {isImportOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "30px", maxWidth: "550px", width: "100%" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "1.3rem", fontWeight: "800" }}>Import Data Terpadu Santri (DTS)</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "20px" }}>
              Anda dapat mengunggah file spreadsheet dari templat resmi BAZNAS (<code>bazn.as/FormatBSB</code>). Sistem akan otomatis membuat akun ujian CBT untuk setiap santri.
            </p>

            <div style={{ border: "2px dashed #CBD5E1", borderRadius: "16px", padding: "30px", textAlign: "center", background: "#F8FAFC", marginBottom: "20px" }}>
              <Upload size={40} color="#059669" style={{ marginBottom: "10px" }} />
              <div style={{ fontWeight: "700", marginBottom: "5px" }}>Pilih File Excel / CSV</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "15px" }}>Mendukung file .xlsx, .xls, .csv</div>
              <button 
                onClick={handleSampleImport}
                style={{ background: "#059669", color: "white", border: "none", padding: "8px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}
              >
                Simulasikan Import 2 Santri Contoh
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setIsImportOpen(false)} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #CBD5E1", background: "none", cursor: "pointer", fontWeight: "600" }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH LOGBOOK */}
      {isAddLogOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "30px", maxWidth: "550px", width: "100%" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.3rem", fontWeight: "800" }}>Tambah Jurnal Bimbingan (Logbook)</h3>
            
            <form onSubmit={handleCreateLogbook} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Tanggal</label>
                  <input type="date" value={logTanggal} onChange={e => setLogTanggal(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Waktu</label>
                  <input type="text" value={logWaktu} onChange={e => setLogWaktu(e.target.value)} placeholder="08:30 - 11:30 WIB" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Materi Pembahasan</label>
                <input required type="text" value={logMateri} onChange={e => setLogMateri(e.target.value)} placeholder="Contoh: Trik Cepat Penalaran Matematika UTBK" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Subtes</label>
                  <select value={logSubtes} onChange={e => setLogSubtes(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                    <optgroup label="Tes Potensi Skolastik (TPS)">
                      <option value="TPS - Penalaran Umum (PU)">TPS - Penalaran Umum (PU)</option>
                      <option value="TPS - Pengetahuan & Pemahaman Umum (PPU)">TPS - Pengetahuan & Pemahaman Umum (PPU)</option>
                      <option value="TPS - Pemahaman Bacaan & Menulis (PBM)">TPS - Pemahaman Bacaan & Menulis (PBM)</option>
                      <option value="TPS - Pengetahuan Kuantitatif (PK)">TPS - Pengetahuan Kuantitatif (PK)</option>
                    </optgroup>
                    <optgroup label="Literasi & Penalaran">
                      <option value="Literasi dalam Bahasa Indonesia">Literasi dalam Bahasa Indonesia</option>
                      <option value="Literasi dalam Bahasa Inggris">Literasi dalam Bahasa Inggris</option>
                      <option value="Penalaran Matematika (PM)">Penalaran Matematika (PM)</option>
                    </optgroup>
                    <optgroup label="Simulasi & Konsultasi">
                      <option value="Simulasi Penuh UTBK-SNBT">Simulasi Penuh UTBK-SNBT</option>
                      <option value="Konsultasi SNBP & Portofolio Tahfidz">Konsultasi SNBP & Portofolio Tahfidz</option>
                      <option value="TKA (Tes Kemampuan Akademik)">TKA (Tes Kemampuan Akademik)</option>
                      <option value="Orientasi & Motivasi BAZNAS">Orientasi & Motivasi BAZNAS</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Tutor / Pemateri</label>
                  <input required type="text" value={logTutor} onChange={e => setLogTutor(e.target.value)} placeholder="Ustadz Zulfikar, S.Si." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Ringkasan & Catatan Hasil</label>
                <textarea rows={3} value={logKet} onChange={e => setLogKet(e.target.value)} placeholder="Catatan jalannya bimbingan dan respon santri..." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsAddLogOpen(false)} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #CBD5E1", background: "none", cursor: "pointer", fontWeight: "600" }}>
                  Batal
                </button>
                <button type="submit" style={{ padding: "10px 20px", borderRadius: "10px", background: "#059669", color: "white", border: "none", cursor: "pointer", fontWeight: "700" }}>
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PROFIL PESANTREN */}
      {isEditProfileOpen && profile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "30px", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.4rem", fontWeight: "800" }}>Profil Pondok Pesantren</h3>
            
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Nama Pondok Pesantren</label>
                <input type="text" value={profile.namaPesantren} onChange={e => setProfile({...profile, namaPesantren: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>NSP Kemenag</label>
                  <input type="text" value={profile.nsp} onChange={e => setProfile({...profile, nsp: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Tahun Program</label>
                  <input type="text" value={profile.tahunProgram} onChange={e => setProfile({...profile, tahunProgram: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Nama Pimpinan Pondok Pesantren</label>
                <input type="text" value={profile.pimpinan} onChange={e => setProfile({...profile, pimpinan: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Koordinator Program Beasiswa</label>
                <input type="text" value={profile.koordinator} onChange={e => setProfile({...profile, koordinator: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Alamat Lengkap Pesantren</label>
                <textarea rows={2} value={profile.alamat} onChange={e => setProfile({...profile, alamat: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Kontak / WhatsApp</label>
                  <input type="text" value={profile.kontak} onChange={e => setProfile({...profile, kontak: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Anggaran per Santri (Rp)</label>
                  <input type="number" value={profile.anggaranPerSantri} onChange={e => setProfile({...profile, anggaranPerSantri: Number(e.target.value) || 0})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsEditProfileOpen(false)} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #CBD5E1", background: "none", cursor: "pointer", fontWeight: "600" }}>
                  Batal
                </button>
                <button type="submit" disabled={saving} style={{ padding: "10px 20px", borderRadius: "10px", background: "#059669", color: "white", border: "none", cursor: "pointer", fontWeight: "700" }}>
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL REKAP TO & RINCIAN SUBTES SANTRI */}
      {selectedSantriForTo && (
        <div
          onClick={() => setSelectedSantriForTo(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", borderRadius: "20px", padding: "28px", maxWidth: "820px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px", borderBottom: "1px solid #E2E8F0", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#059669", letterSpacing: "0.04em" }}>
                  REKAP HASIL TRYOUT SANTRI
                </div>
                <h3 style={{ margin: "4px 0 4px 0", fontSize: "1.35rem", fontWeight: "800", color: "#0F172A" }}>
                  {selectedSantriForTo.name}
                </h3>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  NISN: {selectedSantriForTo.nisn} • {selectedSantriForTo.kelas} • Target 1: <strong>{selectedSantriForTo.targetMajor1} ({selectedSantriForTo.targetUniv1})</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSantriForTo(null)}
                style={{ background: "#F1F5F9", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer", color: "#475569" }}
                aria-label="Tutup detail TO"
              >
                <X size={18} />
              </button>
            </div>

            {selectedSantriForTo.attemptHistory && selectedSantriForTo.attemptHistory.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {selectedSantriForTo.attemptHistory.map((att) => (
                  <div key={att.attemptId} style={{ border: "1px solid #E2E8F0", borderRadius: "14px", padding: "18px", background: "#F8FAFC" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ background: "#059669", color: "white", fontSize: "0.74rem", fontWeight: "800", padding: "2px 8px", borderRadius: "6px" }}>
                            {att.examType}
                          </span>
                          <span style={{ fontWeight: "800", fontSize: "1.02rem", color: "#0F172A" }}>
                            {att.examTitle}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                          <span>📅 {new Date(att.completedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</span>
                          <span>⏱️ {att.durationMinutes} menit</span>
                          <span>✅ Benar: <strong>{att.correctCount} / {att.totalQuestions}</strong> ({att.answeredCount} terjawab)</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", background: "white", padding: "8px 14px", borderRadius: "12px", border: "1px solid #CBD5E1" }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)" }}>
                          Skor {att.isIRT ? "IRT" : "Klasik"}
                        </div>
                        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#059669", lineHeight: 1.1 }}>
                          {att.score} <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)" }}>/ {att.scaleMax}</span>
                        </div>
                      </div>
                    </div>

                    {att.subscores && att.subscores.length > 0 && (
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
                          Rincian Skor per Subtes:
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px" }}>
                          {att.subscores.map((sub) => {
                            const pct = Math.min(100, Math.round((sub.score / Math.max(1, sub.fullMark)) * 100));
                            return (
                              <div key={sub.sectionId} style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "10px 12px" }}>
                                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#0F172A", marginBottom: "6px" }}>
                                  {sub.subject}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                                  <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0284C7" }}>{sub.score}</span>
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "20px", background: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <div style={{ fontWeight: "700", marginBottom: "8px" }}>Riwayat Nilai Tersimpan:</div>
                {selectedSantriForTo.tryoutScores.map((t, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E2E8F0" }}>
                    <span>{t.tryoutName} ({t.date})</span>
                    <strong>{t.score}</strong>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setSelectedSantriForTo(null)}
                style={{ padding: "10px 20px", borderRadius: "10px", background: "#059669", color: "white", border: "none", cursor: "pointer", fontWeight: "700" }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
