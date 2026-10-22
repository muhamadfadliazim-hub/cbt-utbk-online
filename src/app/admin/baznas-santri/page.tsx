"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  getPesantrenProfile, 
  getSantriList, 
  getLogbookList, 
  savePesantrenProfile, 
  saveSantriList, 
  addSantri, 
  removeSantri, 
  addLogbook, 
  removeLogbook,
  SantriBaznas, 
  PesantrenProfile, 
  LogbookBimbingan, 
  AsnafCategory 
} from "@/lib/baznasStore";
import { 
  Building2, Users, FileText, Award, BookOpen, 
  Calendar, CheckCircle2, Plus, Download, Upload, 
  Trash2, Printer, Search, ArrowUpRight, GraduationCap,
  ShieldCheck, HelpCircle, AlertCircle
} from "lucide-react";

export default function BaznasSantriPage() {
  const [profile, setProfile] = useState<PesantrenProfile | null>(null);
  const [santriList, setSantriList] = useState<SantriBaznas[]>([]);
  const [logbookList, setLogbookList] = useState<LogbookBimbingan[]>([]);
  const [activeTab, setActiveTab] = useState<"dts" | "tryout" | "logbook" | "profil">("dts");
  const [searchQuery, setSearchQuery] = useState("");

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
  const [logSubtes, setLogSubtes] = useState("Penalaran Matematika");
  const [logTutor, setLogTutor] = useState("");
  const [logHadir, setLogHadir] = useState<number>(6);
  const [logKet, setLogKet] = useState("");

  // Load from store on mount
  useEffect(() => {
    setProfile(getPesantrenProfile());
    setSantriList(getSantriList());
    setLogbookList(getLogbookList());
  }, []);

  const handleCreateSantri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSantriName.trim() || !newSantriNisn.trim()) return;

    addSantri({
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

    setSantriList(getSantriList());
    setIsAddSantriOpen(false);
    resetSantriForm();
  };

  const resetSantriForm = () => {
    setNewSantriName("");
    setNewSantriNisn("");
    setNewSantriPrestasi("");
  };

  const handleDeleteSantri = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus santri ini dari daftar program?")) {
      removeSantri(id);
      setSantriList(getSantriList());
    }
  };

  const handleCreateLogbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logMateri.trim() || !logTutor.trim()) return;

    addLogbook({
      tanggal: logTanggal || new Date().toISOString().split("T")[0],
      waktu: logWaktu,
      materi: logMateri,
      subtes: logSubtes,
      tutor: logTutor,
      jumlahHadir: Number(logHadir),
      keterangan: logKet,
    });

    setLogbookList(getLogbookList());
    setIsAddLogOpen(false);
    setLogMateri("");
    setLogKet("");
  };

  const handleDeleteLogbook = (id: string) => {
    if (confirm("Hapus catatan sesi ini?")) {
      removeLogbook(id);
      setLogbookList(getLogbookList());
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      savePesantrenProfile(profile);
      setIsEditProfileOpen(false);
    }
  };

  const handleSampleImport = () => {
    const sampleBatch: SantriBaznas[] = [
      {
        id: `bsb-imp-1`,
        name: "Ahmad Bilal Al-Ghifari",
        nisn: "0068192311",
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
        emailLogin: "bilal.santri@az.cbt",
        passwordLogin: "BSB7721",
        sktmNomor: "410/SKTM/CSR/2026"
      },
      {
        id: `bsb-imp-2`,
        name: "Fathimah Az-Zahra",
        nisn: "0068192312",
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
        emailLogin: "fathimah.santri@az.cbt",
        passwordLogin: "BSB9941",
        sktmNomor: "411/SKTM/CSR/2026"
      }
    ];

    const updated = [...sampleBatch, ...santriList];
    saveSantriList(updated);
    setSantriList(updated);
    setIsImportOpen(false);
    alert("Berhasil mengimpor 2 data santri contoh ke sistem!");
  };

  const filteredSantri = santriList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nisn.includes(searchQuery) ||
    s.targetUniv1.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSantri = santriList.length;
  const totalDana = totalSantri * (profile?.anggaranPerSantri || 4000000);
  const avgTryout = totalSantri > 0 
    ? Math.round(santriList.reduce((acc, s) => acc + (s.averageScore || 0), 0) / totalSantri) 
    : 0;
  const totalTahfidz = santriList.filter(s => s.hafalanJuz >= 5).length;
  const totalDiterima = santriList.filter(s => s.statusKelulusan !== "BELUM_DIUMUMKAN" && s.statusKelulusan !== "TIDAK_LOLOS").length;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "60px" }}>
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
              href="/admin/baznas-santri/lpj" 
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

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "white", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284C7" }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Rata-rata Skor TO</div>
            <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "var(--text)", fontFamily: "'Outfit', sans-serif" }}>
              {avgTryout} <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "var(--text-muted)" }}>/ 1000 IRT</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#0284C7", fontWeight: "600" }}>Kesiapan SNBT Tinggi</div>
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
          <Award size={18} /> Nilai Tryout & Target PTN
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

      {/* TAB 2: NILAI TRYOUT & REKOMENDASI PTN */}
      {activeTab === "tryout" && (
        <div className="card" style={{ background: "white", borderRadius: "18px", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.2rem", fontWeight: "800" }}>Evaluasi Progres Tryout UTBK & Rekomendasi PTN Santri</h3>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>Data perkembangan skor IRT santri untuk evaluasi kelayakan prodi pada pelaporan BAZNAS.</p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left", color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "14px 16px" }}>Nama Santri</th>
                  <th style={{ padding: "14px 16px" }}>TO 1 (Diagnostik)</th>
                  <th style={{ padding: "14px 16px" }}>TO 2 (Progresif)</th>
                  <th style={{ padding: "14px 16px" }}>TO 3 (Pemantapan)</th>
                  <th style={{ padding: "14px 16px" }}>Rata-rata Skor</th>
                  <th style={{ padding: "14px 16px" }}>Status Rekomendasi</th>
                  <th style={{ padding: "14px 16px" }}>Status Kelulusan</th>
                </tr>
              </thead>
              <tbody>
                {santriList.map((s) => {
                  const to1 = s.tryoutScores[0]?.score || "-";
                  const to2 = s.tryoutScores[1]?.score || "-";
                  const to3 = s.tryoutScores[2]?.score || "-";
                  const isSafe = (s.averageScore || 0) >= 600;

                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "14px 16px", fontWeight: "700", color: "var(--text)" }}>
                        {s.name}
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "normal" }}>Hafalan: {s.hafalanJuz} Juz</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: "600" }}>{to1}</td>
                      <td style={{ padding: "14px 16px", fontWeight: "600" }}>{to2}</td>
                      <td style={{ padding: "14px 16px", fontWeight: "600" }}>{to3}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: "800", color: isSafe ? "#059669" : "#D97706" }}>
                          {s.averageScore}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {isSafe ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#059669", background: "#ECFDF5", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700" }}>
                            <CheckCircle2 size={14} /> Berpeluang Lolos PTN
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#D97706", background: "#FEF3C7", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700" }}>
                            <AlertCircle size={14} /> Perlu Pemantapan
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {s.statusKelulusan === "DITERIMA_SNBP" ? (
                          <span style={{ background: "#DCFCE7", color: "#15803D", padding: "4px 10px", borderRadius: "8px", fontWeight: "700", fontSize: "0.85rem" }}>
                            🎉 Lolos SNBP
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            Sedang Persiapan SNBT
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
                    <option value="Penalaran Matematika">Penalaran Matematika</option>
                    <option value="Penalaran Umum">Penalaran Umum</option>
                    <option value="Literasi Bahasa Indonesia">Literasi Bahasa Indonesia</option>
                    <option value="Literasi Bahasa Inggris">Literasi Bahasa Inggris</option>
                    <option value="Pemahaman Bacaan & Menulis">Pemahaman Bacaan & Menulis</option>
                    <option value="Simulasi Penuh CBT">Simulasi Penuh CBT</option>
                    <option value="Konsultasi SNBP & Tahfidz">Konsultasi SNBP & Tahfidz</option>
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsEditProfileOpen(false)} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #CBD5E1", background: "none", cursor: "pointer", fontWeight: "600" }}>
                  Batal
                </button>
                <button type="submit" style={{ padding: "10px 20px", borderRadius: "10px", background: "#059669", color: "white", border: "none", cursor: "pointer", fontWeight: "700" }}>
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
