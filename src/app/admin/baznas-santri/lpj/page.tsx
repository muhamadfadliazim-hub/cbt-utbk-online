"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  getPesantrenProfile, 
  getSantriList, 
  getLogbookList, 
  SantriBaznas, 
  PesantrenProfile, 
  LogbookBimbingan 
} from "@/lib/baznasStore";
import { Printer, ArrowLeft, Download, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LpjBaznasPage() {
  const [profile, setProfile] = useState<PesantrenProfile | null>(null);
  const [santriList, setSantriList] = useState<SantriBaznas[]>([]);
  const [logbookList, setLogbookList] = useState<LogbookBimbingan[]>([]);

  useEffect(() => {
    setProfile(getPesantrenProfile());
    setSantriList(getSantriList());
    setLogbookList(getLogbookList());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const totalSantri = santriList.length;
  const anggaranPerSantri = profile?.anggaranPerSantri || 4000000;
  const totalAnggaran = totalSantri * anggaranPerSantri;

  return (
    <div className="lpj-container" style={{ background: "#F1F5F9", minHeight: "100vh", padding: "30px 15px" }}>
      
      {/* Top Action Bar (Hidden during print) */}
      <div className="no-print" style={{
        maxWidth: "900px",
        margin: "0 auto 25px auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "white",
        padding: "16px 24px",
        borderRadius: "16px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        border: "1px solid #E2E8F0"
      }}>
        <Link 
          href="/admin/baznas-santri"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text)",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "0.95rem"
          }}
        >
          <ArrowLeft size={18} /> Kembali ke Portal BAZNAS
        </Link>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handlePrint}
            style={{
              background: "#059669",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 6px 15px -3px rgba(5, 150, 105, 0.4)"
            }}
          >
            <Printer size={18} /> Cetak Dokumen / Simpan PDF
          </button>
        </div>
      </div>

      {/* Dokumen LPJ Fisik (Standard A4 Simulation) */}
      <div className="lpj-paper" style={{
        maxWidth: "850px",
        margin: "0 auto",
        background: "white",
        padding: "60px 70px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        borderRadius: "8px",
        color: "#1E293B",
        fontFamily: "'Times New Roman', Times, serif",
        lineHeight: "1.7",
        fontSize: "12pt"
      }}>

        {/* COVER LAPORAN */}
        <div style={{ textAlign: "center", paddingBottom: "80px", borderBottom: "2px solid #0F172A", marginBottom: "50px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
            <div style={{ width: "70px", height: "70px", background: "#065F46", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.8rem" }}>
              🕌
            </div>
            <div style={{ width: "2px", height: "50px", background: "#CBD5E1" }}></div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#065F46", letterSpacing: "1px" }}>BAZNAS RI</div>
              <div style={{ fontSize: "0.85rem", color: "#64748B" }}>Badan Amil Zakat Nasional</div>
            </div>
          </div>

          <h2 style={{ fontSize: "16pt", fontWeight: "bold", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            LAPORAN PERTANGGUNGJAWABAN (LPJ)
          </h2>
          <h1 style={{ fontSize: "18pt", fontWeight: "bold", margin: "0 0 15px 0", color: "#065F46" }}>
            PROGRAM BEASISWA SANTRI BAZNAS (BSB)
          </h1>
          <h3 style={{ fontSize: "13pt", fontWeight: "normal", margin: "0 0 40px 0", fontStyle: "italic" }}>
            Persiapan dan Pendampingan Masuk Perguruan Tinggi Negeri (PTN) Tahun Ajaran {profile?.tahunProgram}
          </h3>

          <div style={{ margin: "50px 0" }}>
            <p style={{ margin: "5px 0", fontSize: "11pt", textTransform: "uppercase" }}>Disusun Oleh:</p>
            <h3 style={{ fontSize: "15pt", fontWeight: "bold", margin: "5px 0", color: "#0F172A" }}>
              {profile?.namaPesantren}
            </h3>
            <p style={{ margin: "5px 0", fontSize: "11pt" }}>
              Nomor Statistik Pesantren (NSP Kemenag): <strong>{profile?.nsp}</strong>
            </p>
            <p style={{ margin: "5px 0", fontSize: "10pt", color: "#475569" }}>
              {profile?.alamat}
            </p>
          </div>

          <div style={{ marginTop: "60px", fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase" }}>
            KABUPATEN BOGOR — JAWA BARAT
            <br />
            TAHUN 2026
          </div>
        </div>

        {/* LEMBAR PENGESAHAN */}
        <div style={{ pageBreakBefore: "always", paddingTop: "20px", marginBottom: "50px" }}>
          <h3 style={{ textAlign: "center", textDecoration: "underline", fontSize: "14pt", margin: "0 0 30px 0", textTransform: "uppercase" }}>
            LEMBAR PENGESAHAN LAPORAN
          </h3>

          <p style={{ textIndent: "40px", textAlign: "justify" }}>
            Laporan Pertanggungjawaban (LPJ) Pelaksanaan Program Bimbingan Belajar dan Persiapan Masuk Perguruan Tinggi Negeri (PTN) bagi Santri Penerima <strong>Beasiswa Santri BAZNAS (BSB)</strong> ini telah diperiksa dan disahkan oleh pimpinan lembaga pondok pesantren:
          </p>

          <table style={{ width: "100%", margin: "20px 0", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ width: "30%", padding: "6px 0", fontWeight: "bold" }}>Nama Lembaga</td>
                <td style={{ width: "5%" }}>:</td>
                <td>{profile?.namaPesantren}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", fontWeight: "bold" }}>NSP Kemenag</td>
                <td>:</td>
                <td>{profile?.nsp}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", fontWeight: "bold" }}>Jumlah Santri Binaan</td>
                <td>:</td>
                <td>{totalSantri} Santri</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", fontWeight: "bold" }}>Alokasi Bantuan</td>
                <td>:</td>
                <td>Rp{totalAnggaran.toLocaleString("id-ID")} (Sepenuhnya dialokasikan untuk Bimbel & CBT)</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "60px", textAlign: "center" }}>
            <div>
              <p style={{ margin: 0 }}>Mengetahui,</p>
              <p style={{ fontWeight: "bold", margin: "0 0 70px 0" }}>Pimpinan Pondok Pesantren</p>
              <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0 }}>{profile?.pimpinan}</p>
            </div>
            <div>
              <p style={{ margin: 0 }}>Dibuat Oleh,</p>
              <p style={{ fontWeight: "bold", margin: "0 0 70px 0" }}>Koordinator Program BAZNAS</p>
              <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0 }}>{profile?.koordinator}</p>
            </div>
          </div>
        </div>

        {/* BAB I: PENDAHULUAN */}
        <div style={{ pageBreakBefore: "always", paddingTop: "20px", marginBottom: "40px" }}>
          <h3 style={{ fontSize: "13pt", fontWeight: "bold", borderBottom: "1px solid #CBD5E1", paddingBottom: "6px" }}>
            BAB I: PENDAHULUAN
          </h3>

          <p style={{ textIndent: "40px", textAlign: "justify" }}>
            Pondok Pesantren memiliki komitmen besar untuk mengantarkan para santri menembus perguruan tinggi negeri unggulan. Melalui program <strong>Beasiswa Santri BAZNAS (BSB)</strong>, santri kelas XII dari latar belakang keluarga duafa dan santri berprestasi/tahfidz Al-Qur'an mendapatkan pembinaan intensif bimbingan belajar UTBK-SNBT serta pendampingan seleksi SNBP.
          </p>

          <p style={{ textIndent: "40px", textAlign: "justify" }}>
            Program ini menggunakan sistem Computer Based Test (CBT) terintegrasi dari <strong>AZ Academy CBT</strong>, yang menyediakan simulasi format UTBK terbaru, analisis Item Response Theory (IRT), serta data selektivitas prodi untuk memetakan peluang kelulusan santri secara akurat.
          </p>
        </div>

        {/* BAB II: JURNAL KEGIATAN BIMBINGAN (5W+1H) */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "13pt", fontWeight: "bold", borderBottom: "1px solid #CBD5E1", paddingBottom: "6px" }}>
            BAB II: JURNAL KEGIATAN & PELAKSANAAN BIMBINGAN (LOGBOOK)
          </h3>

          <p style={{ textAlign: "justify", marginBottom: "15px" }}>
            Rangkaian bimbingan belajar dan evaluasi tryout dilaksanakan secara tatap muka dan mandiri di laboratorium komputer pesantren sebagai berikut:
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
            <thead>
              <tr style={{ background: "#F1F5F9", textAlign: "center" }}>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>No</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Hari / Tanggal</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Materi / Subtes</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Tutor / Pemateri</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Hadir</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {logbookList.map((log, idx) => (
                <tr key={log.id}>
                  <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "center" }}>{idx + 1}</td>
                  <td style={{ border: "1px solid #64748B", padding: "6px" }}>{log.tanggal}<br /><small>{log.waktu}</small></td>
                  <td style={{ border: "1px solid #64748B", padding: "6px" }}><strong>{log.materi}</strong><br /><small>({log.subtes})</small></td>
                  <td style={{ border: "1px solid #64748B", padding: "6px" }}>{log.tutor}</td>
                  <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "center" }}>{log.jumlahHadir}</td>
                  <td style={{ border: "1px solid #64748B", padding: "6px" }}>{log.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BAB III: DATA SANTRI & EVALUASI NILAI TRYOUT */}
        <div style={{ pageBreakBefore: "always", paddingTop: "20px", marginBottom: "40px" }}>
          <h3 style={{ fontSize: "13pt", fontWeight: "bold", borderBottom: "1px solid #CBD5E1", paddingBottom: "6px" }}>
            BAB III: DATA SANTRI & REKAPITULASI PROGRES TRYOUT UTBK
          </h3>

          <p style={{ textAlign: "justify", marginBottom: "15px" }}>
            Berikut adalah rekapitulasi data santri penerima Beasiswa Santri BAZNAS beserta perkembangan skor nilai Tryout CBT dan target PTN yang dituju:
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
            <thead>
              <tr style={{ background: "#F1F5F9", textAlign: "center" }}>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>No</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Nama Santri & NISN</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Asnaf</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Tahfidz</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Target PTN 1 & 2</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Rata-rata Skor IRT</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {santriList.map((s, idx) => (
                <tr key={s.id}>
                  <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "center" }}>{idx + 1}</td>
                  <td style={{ border: "1px solid #64748B", padding: "6px" }}>
                    <strong>{s.name}</strong>
                    <br />
                    <small>NISN: {s.nisn} ({s.kelas})</small>
                  </td>
                  <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "center" }}>{s.asnaf}</td>
                  <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "center" }}>{s.hafalanJuz} Juz</td>
                  <td style={{ border: "1px solid #64748B", padding: "6px" }}>
                    1. {s.targetMajor1} - {s.targetUniv1}
                    <br />
                    2. {s.targetMajor2} - {s.targetUniv2}
                  </td>
                  <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "center", fontWeight: "bold" }}>
                    {s.averageScore}
                  </td>
                  <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "center" }}>
                    {s.statusKelulusan === "DITERIMA_SNBP" ? "Lolos SNBP (Tahfidz)" : "Proses SNBT"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BAB IV: LAPORAN PENGGUNAAN DANA */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "13pt", fontWeight: "bold", borderBottom: "1px solid #CBD5E1", paddingBottom: "6px" }}>
            BAB IV: ALOKASI PENGGUNAAN DANA BEASISWA
          </h3>

          <p style={{ textAlign: "justify", marginBottom: "15px" }}>
            Alokasi dana bantuan beasiswa sebesar <strong>Rp{anggaranPerSantri.toLocaleString("id-ID")}</strong> per santri digunakan secara akuntabel untuk mendukung kelancaran persiapan studi:
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
            <thead>
              <tr style={{ background: "#F1F5F9" }}>
                <th style={{ border: "1px solid #64748B", padding: "8px", textAlign: "center" }}>No</th>
                <th style={{ border: "1px solid #64748B", padding: "8px" }}>Komponen Pembiayaan</th>
                <th style={{ border: "1px solid #64748B", padding: "8px", textAlign: "right" }}>Alokasi / Santri</th>
                <th style={{ border: "1px solid #64748B", padding: "8px", textAlign: "right" }}>Total ({totalSantri} Santri)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "center" }}>1</td>
                <td style={{ border: "1px solid #64748B", padding: "6px" }}>Honor Pengajar & Bimbingan Intensif PTN</td>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "right" }}>Rp1.800.000</td>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "right" }}>Rp{(1800000 * totalSantri).toLocaleString("id-ID")}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "center" }}>2</td>
                <td style={{ border: "1px solid #64748B", padding: "6px" }}>Langganan Aplikasi Tryout CBT & Analisis IRT</td>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "right" }}>Rp800.000</td>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "right" }}>Rp{(800000 * totalSantri).toLocaleString("id-ID")}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "center" }}>3</td>
                <td style={{ border: "1px solid #64748B", padding: "6px" }}>Buku Modul Latihan Soal & ATK</td>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "right" }}>Rp600.000</td>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "right" }}>Rp{(600000 * totalSantri).toLocaleString("id-ID")}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "center" }}>4</td>
                <td style={{ border: "1px solid #64748B", padding: "6px" }}>Konsumsi & Suplemen Pembinaan Malam</td>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "right" }}>Rp800.000</td>
                <td style={{ border: "1px solid #64748B", padding: "6px", textAlign: "right" }}>Rp{(800000 * totalSantri).toLocaleString("id-ID")}</td>
              </tr>
              <tr style={{ background: "#F8FAFC", fontWeight: "bold" }}>
                <td colSpan={3} style={{ border: "1px solid #64748B", padding: "8px", textAlign: "right" }}>JUMLAH TOTAL</td>
                <td style={{ border: "1px solid #64748B", padding: "8px", textAlign: "right" }}>Rp{totalAnggaran.toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BAB V: PENUTUP */}
        <div style={{ marginBottom: "50px" }}>
          <h3 style={{ fontSize: "13pt", fontWeight: "bold", borderBottom: "1px solid #CBD5E1", paddingBottom: "6px" }}>
            BAB V: PENUTUP
          </h3>

          <p style={{ textIndent: "40px", textAlign: "justify" }}>
            Demikian Laporan Pertanggungjawaban (LPJ) Program Beasiswa Santri BAZNAS ini kami susun dengan sebenar-benarnya. Kami mengucapkan rasa syukur kepada Allah SWT dan terima kasih yang setinggi-tingginya kepada <strong>BAZNAS Republik Indonesia</strong> serta para muzaki yang telah memfasilitasi masa depan generasi santri untuk berpendidikan tinggi di kampus-kampus negeri terbaik.
          </p>
        </div>

      </div>

      {/* Global CSS for Print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
          }
          .no-print, header, aside, .dashboard-header, .sidebar {
            display: none !important;
          }
          .lpj-container {
            padding: 0 !important;
            background: white !important;
          }
          .lpj-paper {
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}} />

    </div>
  );
}
