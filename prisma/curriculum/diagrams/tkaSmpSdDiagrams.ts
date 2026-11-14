import { svgFigure, svgTex } from "./svgHelper";

// ==================== TKA SMP & TKA SD — 13 DIAGRAM ====================

export const DIAG_SMP_INDO_BERITA = svgFigure(
  "smp-id-1",
  "Piramida Terbalik Berita (ADIKSIMBA) & Struktur Prosedur/LHO",
  "Kepala berita memuat informasi terpenting (Apa, Di mana, Kapan, Siapa) di paragraf awal",
  560,
  205,
  `
<polygon points="48,64 252,64 198,128 102,128" fill="#2563eb"/>
<polygon points="102,130 198,130 172,164 128,164" fill="#60a5fa"/>
<polygon points="128,166 172,166 150,188" fill="#bfdbfe"/>
<text x="150" y="92" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">KEPALA BERITA</text>
<text x="150" y="108" text-anchor="middle" fill="#dbeafe" font-size="9.5">ADIKSIMBA (5W+1H)</text>
<text x="150" y="151" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="700">Tubuh Berita</text>
<text x="150" y="180" text-anchor="middle" fill="#1e3a8a" font-size="9" font-weight="700">Ekor</text>
<rect x="278" y="60" width="260" height="128" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="408" y="80" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Struktur Teks Wajib SMP</text>
<text x="290" y="102" fill="#0f172a" font-size="10" font-weight="700">Teks Prosedur:</text>
<text x="290" y="116" fill="#334155" font-size="9.5">Tujuan -&gt; Alat/Bahan -&gt; Langkah (Imperatif) -&gt; Penutup</text>
<text x="290" y="138" fill="#1d4ed8" font-size="10" font-weight="700">Laporan Hasil Observasi (LHO):</text>
<text x="290" y="152" fill="#334155" font-size="9.5">Pernyataan Umum/Klasifikasi -&gt; Deskripsi Bagian -&gt; Manfaat</text>
<text x="290" y="174" fill="#854d0e" font-size="9.5" font-weight="700">Ide Pokok = Inti kalimat utama (Deduktif/Induktif)</text>
`
);

export const DIAG_SMP_INDO_EJAAN = svgFigure(
  "smp-id-2",
  "Papan Kata Baku KBBI & Kalimat Efektif Tingkat SMP",
  "Hindari kata berlebih (pleonasme) dan gunakan kata baku sesuai EYD V",
  560,
  205,
  `
<rect x="20" y="60" width="256" height="128" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="148" y="80" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Daftar Kata Baku Sering Muncul</text>
<text x="34" y="102" fill="#047857" font-size="10.5" font-weight="700">BAKU:</text>
<text x="160" y="102" fill="#be123c" font-size="10.5" font-weight="700">TIDAK BAKU:</text>
<text x="34" y="122" fill="#0f172a" font-size="10">apotek, praktik, sistem</text><text x="160" y="122" fill="#64748b" font-size="10">apotik, praktek, sistim</text>
<text x="34" y="140" fill="#0f172a" font-size="10">nasihat, ijazah, jadwal</text><text x="160" y="140" fill="#64748b" font-size="10">nasehat, ijasah, jadual</text>
<text x="34" y="158" fill="#0f172a" font-size="10">analisis, risiko, objek</text><text x="160" y="158" fill="#64748b" font-size="10">analisa, resiko, obyek</text>
<text x="34" y="176" fill="#0f172a" font-size="10">karier, teladan, konkret</text><text x="160" y="176" fill="#64748b" font-size="10">karir, tauladan, konkrit</text>
<rect x="290" y="60" width="250" height="128" rx="10" fill="#fefce8" stroke="#eab308"/>
<text x="415" y="80" text-anchor="middle" fill="#854d0e" font-size="11.5" font-weight="700">Perbaikan Kalimat Tidak Efektif</text>
<text x="302" y="104" fill="#be123c" font-size="10">X: "Para bapak-bapak sekalian"</text>
<text x="302" y="120" fill="#047857" font-size="10" font-weight="700">V: "Bapak-bapak" / "Para bapak"</text>
<text x="302" y="144" fill="#be123c" font-size="10">X: "sangat indah sekali"</text>
<text x="302" y="160" fill="#047857" font-size="10" font-weight="700">V: "sangat indah" atau "indah sekali"</text>
<text x="302" y="178" fill="#1d4ed8" font-size="9.5">Di mana/yang mana bukan kata hubung!</text>
`
);

export const DIAG_SMP_INDO_SASTRA = svgFigure(
  "smp-id-3",
  "Puisi Rakyat (Pantun, Syair, Gurindam) & Anatomi Surat Resmi",
  "Pantun memiliki sampiran + isi berima a-b-a-b; semua baris Syair merupakan isi berima a-a-a-a",
  560,
  205,
  `
<rect x="20" y="60" width="268" height="128" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="154" y="80" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Perbandingan 3 Puisi Rakyat</text>
<text x="32" y="102" fill="#1d4ed8" font-size="10.5" font-weight="700">Pantun (4 baris, rima a-b-a-b):</text>
<text x="32" y="117" fill="#334155" font-size="9.5">Baris 1-2 = Sampiran | Baris 3-4 = Isi</text>
<text x="32" y="138" fill="#047857" font-size="10.5" font-weight="700">Syair (4 baris, rima a-a-a-a):</text>
<text x="32" y="153" fill="#334155" font-size="9.5">Semua baris 1-4 adalah ISI (cerita/nasihat)</text>
<text x="32" y="174" fill="#854d0e" font-size="10.5" font-weight="700">Gurindam (2 baris, a-a): Syarat -&gt; Akibat</text>
<rect x="302" y="60" width="238" height="128" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<text x="421" y="80" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">Struktur Wajib Surat Resmi</text>
<text x="316" y="101" fill="#1e3a8a" font-size="10" font-weight="700">1. Kop Surat  |  2. Tanggal (tanpa kota)</text>
<text x="316" y="118" fill="#334155" font-size="10">3. Nomor, Lampiran, Hal</text>
<text x="316" y="135" fill="#334155" font-size="10">4. Alamat Tujuan (Yth. tanpa Kepada)</text>
<text x="316" y="152" fill="#334155" font-size="10">5. Salam Pembuka ("Dengan hormat,")</text>
<text x="316" y="169" fill="#334155" font-size="10">6. Isi Surat  -&gt;  7. Penutup &amp; TTD</text>
`
);

export const DIAG_SMP_MAT_ARIT = svgFigure(
  "smp-mt-1",
  "Skala Peta ($JP = S \\times JS$) & Segitiga Aritmetika Sosial SMP",
  "Persentase untung/rugi selalu dibandingkan terhadap Harga Beli; pajak/diskon memengaruhi harga bayar",
  560,
  218,
  `
<polygon points="122,64 44,174 200,174" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
<line x1="83" y1="119" x2="161" y2="119" stroke="#1e3a8a" stroke-width="1.5"/>
<line x1="122" y1="119" x2="122" y2="174" stroke="#1e3a8a" stroke-width="1.5"/>
<text x="122" y="105" text-anchor="middle" fill="#1e3a8a" font-size="13" font-weight="700">JP</text>
<text x="92" y="154" text-anchor="middle" fill="#1e3a8a" font-size="12" font-weight="700">Skala</text>
<text x="152" y="154" text-anchor="middle" fill="#1e3a8a" font-size="12" font-weight="700">JS</text>
<text x="122" y="196" text-anchor="middle" fill="#334155" font-size="10">Ingat: 1 km = 100.000 cm</text>
<rect x="234" y="58" width="306" height="142" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="387" y="78" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Rumus Cepat Aritmetika Sosial</text>
${svgTex(244, 86, 286, 20, "Untung $p\\%$: $\\text{HJ} = (100 + p)\\% \\times \\text{HB}$", { color: "#047857", size: 10, bold: true })}
${svgTex(244, 107, 286, 20, "Rugi $r\\%$: $\\text{HJ} = (100 - r)\\% \\times \\text{HB}$", { color: "#be123c", size: 10, bold: true })}
${svgTex(244, 128, 286, 28, "Bunga Tunggal: $B = \\frac{n}{12} \\times \\%b \\times \\text{Modal}$", { color: "#1d4ed8", size: 10, bold: true })}
${svgTex(244, 157, 286, 22, "Netto $= \\text{Bruto} - \\text{Tara}$ ($\\frac{\\text{Tara}}{\\text{Bruto}}\\times 100\\%$)", { color: "#0f172a", size: 9.5 })}
${svgTex(244, 178, 286, 20, "Berbalik Nilai: $p_1 \\cdot h_1 = p_2 \\cdot h_2$", { color: "#854d0e", size: 9.8, bold: true })}
`
);

export const DIAG_SMP_MAT_GARIS = svgFigure(
  "smp-mt-2",
  "Gradien Garis Lurus ($m = \\frac{\\Delta y}{\\Delta x}$) & Solusi Titik Potong SPLDV",
  "Dua persamaan linear membentuk dua garis; titik potongnya $(x, y)$ adalah himpunan penyelesaian",
  560,
  222,
  `
<line x1="48" y1="172" x2="256" y2="172" stroke="#475569" stroke-width="1.5"/>
<line x1="78" y1="62" x2="78" y2="190" stroke="#475569" stroke-width="1.5"/>
<line x1="54" y1="162" x2="224" y2="76" stroke="#2563eb" stroke-width="2.2"/>
<line x1="106" y1="70" x2="206" y2="180" stroke="#059669" stroke-width="2.2"/>
<circle cx="155" cy="110" r="4.5" fill="#be123c"/>
<polyline points="104,135 155,135 155,110" fill="none" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="3 2"/>
${svgTex(116, 137, 28, 18, "$\\Delta x$", { color: "#1d4ed8", size: 9.5, align: "center", bold: true })}
${svgTex(162, 114, 28, 18, "$\\Delta y$", { color: "#1d4ed8", size: 9.5, bold: true })}
${svgTex(164, 92, 62, 18, "HP $(x, y)$", { color: "#be123c", size: 10, bold: true })}
<text x="150" y="204" text-anchor="middle" fill="#334155" font-size="10">Gradien naik ke kanan (+), turun (-)</text>
<rect x="278" y="58" width="262" height="146" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
${svgTex(286, 65, 246, 22, "Menghitung Gradien $m$ (3 Kasus)", { color: "#1e3a8a", size: 11, align: "center", bold: true })}
${svgTex(290, 88, 240, 22, "1. $y = mx + c \\implies \\text{gradien} = m$", { color: "#0f172a", size: 10 })}
${svgTex(290, 110, 240, 26, "2. $ax + by + c = 0 \\implies m = -\\frac{a}{b}$", { color: "#0f172a", size: 10 })}
${svgTex(290, 136, 240, 28, "3. Lewat 2 titik: $m = \\frac{y_2 - y_1}{x_2 - x_1}$", { color: "#0f172a", size: 10 })}
${svgTex(290, 165, 240, 20, "Persamaan Baru: $y - y_1 = m(x - x_1)$", { color: "#be123c", size: 10, bold: true })}
<text x="290" y="196" fill="#047857" font-size="9.5">SPLDV: Eliminasi-Substitusi cepat!</text>
`
);

export const DIAG_SMP_MAT_SEBANGUN = svgFigure(
  "smp-mt-3",
  "Kesebangunan SMP: Foto–Karton, Segitiga Sejajar & Rumus Ikan",
  "Pada foto & karton sebangun, perbandingan lebar foto/karton = perbandingan tinggi foto/karton",
  560,
  232,
  `
<rect x="34" y="64" width="128" height="126" rx="4" fill="#fef3c7" stroke="#d97706" stroke-width="1.8"/>
<rect x="52" y="80" width="92" height="82" rx="3" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/>
${svgTex(54, 110, 88, 20, "FOTO $30\\times 40$", { color: "#1e3a8a", size: 10.5, align: "center", bold: true })}
<text x="98" y="75" text-anchor="middle" fill="#b45309" font-size="9.5" font-weight="700">atas 3cm</text>
${svgTex(52, 166, 92, 18, "bawah $b = 5\\text{ cm}$", { color: "#be123c", size: 9.8, align: "center", bold: true })}
<text x="43" y="124" text-anchor="middle" fill="#b45309" font-size="9">3</text>
<text x="153" y="124" text-anchor="middle" fill="#b45309" font-size="9">3</text>
${svgTex(24, 193, 148, 30, "$\\frac{30}{36} = \\frac{40}{43 + b}$", { color: "#334155", size: 10, align: "center", bold: true })}
<line x1="184" y1="56" x2="184" y2="218" stroke="#e2e8f0" stroke-dasharray="4 3"/>
<polygon points="266,72 210,168 322,168" fill="#d1fae5" fill-opacity="0.45" stroke="#059669" stroke-width="1.8"/>
<line x1="238" y1="120" x2="294" y2="120" stroke="#be123c" stroke-width="2"/>
<text x="266" y="67" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="700">A</text>
<text x="231" y="122" text-anchor="end" fill="#be123c" font-size="10" font-weight="700">D</text>
<text x="300" y="122" fill="#be123c" font-size="10" font-weight="700">E</text>
<text x="204" y="172" text-anchor="end" fill="#0f172a" font-size="10" font-weight="700">B</text>
<text x="328" y="172" fill="#0f172a" font-size="10" font-weight="700">C</text>
${svgTex(200, 182, 132, 30, "$\\frac{AD}{AB} = \\frac{DE}{BC}$", { color: "#047857", size: 10.5, align: "center", bold: true })}
<rect x="346" y="58" width="194" height="156" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="443" y="77" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">Rumus Cepat Lainnya</text>
${svgTex(356, 84, 174, 18, "Trapesium Tengah $EF$:", { color: "#0f172a", size: 9.8, bold: true })}
${svgTex(356, 102, 178, 30, "$EF = \\frac{DC\\cdot AE + AB\\cdot DE}{DE + AE}$", { color: "#1d4ed8", size: 9.8 })}
${svgTex(356, 135, 174, 18, "Siku-Siku Tinggi $CD$:", { color: "#0f172a", size: 9.8, bold: true })}
${svgTex(356, 152, 174, 18, "$CD^2 = AD \\cdot DB$", { color: "#be123c", size: 10 })}
${svgTex(356, 170, 174, 18, "$AC^2 = AD \\cdot AB$", { color: "#be123c", size: 10 })}
<text x="356" y="203" fill="#475569" font-size="9.5">Kongruen: S-S-S, S-Sd-S, Sd-S-Sd</text>
`
);

export const DIAG_SMP_MAT_PYTHAGORAS = svgFigure(
  "smp-mt-4",
  "Triple Pythagoras, Garis Singgung Lingkaran & Bangun Lengkung",
  "Jarak pusat $d$ membentuk segitiga siku-siku dengan selisih (GSPL) atau jumlah jari-jari (GSPD)",
  560,
  222,
  `
<polygon points="36,166 136,166 136,90" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
<rect x="128" y="158" width="8" height="8" fill="none" stroke="#2563eb"/>
<text x="86" y="182" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="700">4 (atau 12)</text>
<text x="144" y="130" fill="#1e3a8a" font-size="10.5" font-weight="700">3 (5)</text>
<text x="72" y="118" fill="#be123c" font-size="10.5" font-weight="700">5 (13)</text>
<text x="92" y="202" text-anchor="middle" fill="#475569" font-size="9.5">Triple: 3-4-5, 5-12-13, 7-24-25, 8-15-17</text>
<rect x="206" y="58" width="334" height="148" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="373" y="77" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Lingkaran &amp; Bangun Ruang Sisi Lengkung</text>
${svgTex(216, 84, 314, 22, "GSPL (Luar): $l = \\sqrt{d^2 - (R - r)^2}$", { color: "#0f172a", size: 10, bold: true })}
${svgTex(216, 106, 314, 22, "GSPD (Dalam): $l = \\sqrt{d^2 - (R + r)^2}$", { color: "#0f172a", size: 10, bold: true })}
${svgTex(216, 130, 314, 22, "Tabung: $V = \\pi r^2 t \\;\\mid\\; L_{\\text{selimut}} = 2\\pi rt$", { color: "#1d4ed8", size: 10 })}
${svgTex(216, 153, 314, 26, "Kerucut: $V = \\frac{1}{3}\\pi r^2 t \\;\\mid\\; s^2 = r^2 + t^2$", { color: "#be123c", size: 10 })}
${svgTex(216, 179, 314, 26, "Bola: $V = \\frac{4}{3}\\pi r^3 \\;\\mid\\; L_{\\text{kulit}} = 4\\pi r^2$", { color: "#047857", size: 10 })}
`
);

export const DIAG_SMP_MAT_STAT = svgFigure(
  "smp-mt-5",
  "Diagram Pemusatan Data (Mean–Median–Modus) & Ruang Sampel Peluang",
  "Untuk Median, wajib urutkan data dari terkecil sampai terbesar terlebih dahulu!",
  560,
  218,
  `
<rect x="20" y="58" width="256" height="142" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="148" y="77" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">3 Ukuran Pemusatan Data</text>
${svgTex(30, 84, 236, 26, "Mean: $\\bar{x} = \\frac{\\text{Jumlah Data}}{\\text{Banyak Data}}$", { color: "#0f172a", size: 10, bold: true })}
<text x="32" y="124" fill="#047857" font-size="10.5" font-weight="700">Median = Nilai Tengah (DATA TERURUT!)</text>
${svgTex(32, 129, 236, 22, "Ganjil: $x_{\\frac{n+1}{2}}$ | Genap: rata 2 suku tengah", { color: "#475569", size: 9.5 })}
<text x="32" y="164" fill="#be123c" font-size="10.5" font-weight="700">Modus = Data Paling Sering Muncul</text>
${svgTex(32, 169, 236, 28, "Diagram Lingkaran: $\\frac{\\text{sudut}}{360^\\circ} \\times \\text{Total}$", { color: "#334155", size: 9.5 })}
<rect x="290" y="58" width="250" height="142" rx="10" fill="#fefce8" stroke="#eab308"/>
<text x="415" y="77" text-anchor="middle" fill="#854d0e" font-size="11.5" font-weight="700">Ruang Sampel &amp; Frekuensi Harapan</text>
${svgTex(300, 84, 232, 28, "$P(A) = \\frac{n(A)}{n(S)} \\;\\mid\\; 0 \\le P(A) \\le 1$", { color: "#0f172a", size: 10, bold: true })}
${svgTex(300, 114, 232, 20, "1 Koin: $n(S)=2$ | 3 Koin: $n(S)=2^3=8$", { color: "#1d4ed8", size: 9.8 })}
${svgTex(300, 134, 232, 20, "1 Dadu: $n(S)=6$ | 2 Dadu: $n(S)=6^2=36$", { color: "#1d4ed8", size: 9.8 })}
${svgTex(300, 155, 232, 20, "Komplemen: $P(A^c) = 1 - P(A)$", { color: "#047857", size: 10, bold: true })}
${svgTex(300, 175, 232, 20, "Frekuensi Harapan: $F_h = P(A) \\times N$", { color: "#be123c", size: 9.8 })}
`
);

export const DIAG_SD_INDO_CERITA = svgFigure(
  "sd-id-1",
  "Peta Unsur Cerita Anak & Letak Kalimat Utama Paragraf",
  "Setiap paragraf hanya memiliki 1 ide pokok yang didukung beberapa kalimat penjelas",
  560,
  205,
  `
<rect x="20" y="60" width="256" height="128" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="148" y="80" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Tiga Jenis Paragraf (Kalimat Utama)</text>
<rect x="34" y="92" width="228" height="24" rx="6" fill="#2563eb"/>
<text x="148" y="108" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">DEDUKTIF -&gt; Kalimat Utama di AWAL</text>
<rect x="34" y="122" width="228" height="24" rx="6" fill="#059669"/>
<text x="148" y="138" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">INDUKTIF -&gt; Kalimat Utama di AKHIR</text>
<rect x="34" y="152" width="228" height="24" rx="6" fill="#d97706"/>
<text x="148" y="168" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">CAMPURAN -&gt; Awal + Ditegaskan Akhir</text>
<rect x="290" y="60" width="250" height="128" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="415" y="80" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">5 Unsur Wajib Cerita / Fabel SD</text>
<text x="302" y="103" fill="#0f172a" font-size="10.5">1. Tokoh &amp; Watak (Protagonis baik / Antagonis)</text>
<text x="302" y="122" fill="#0f172a" font-size="10.5">2. Latar Tempat, Waktu &amp; Suasana</text>
<text x="302" y="141" fill="#0f172a" font-size="10.5">3. Masalah (Konflik) &amp; Penyelesaian</text>
<text x="302" y="160" fill="#047857" font-size="10.5" font-weight="700">4. Amanat = Pesan moral cerita!</text>
<text x="302" y="178" fill="#1d4ed8" font-size="9.5">Sinonim (sama arti) vs Antonim (lawan kata)</text>
`
);

export const DIAG_SD_INDO_EJAAN = svgFigure(
  "sd-id-2",
  "Poster Aturan Huruf Kapital & 5 Tanda Baca Dasar SD",
  "Ingat: kata 'di' dipisah jika menunjuk tempat (di rumah) dan digabung jika kata kerja (dibaca)",
  560,
  205,
  `
<rect x="20" y="60" width="256" height="128" rx="10" fill="#fefce8" stroke="#eab308"/>
<text x="148" y="80" text-anchor="middle" fill="#854d0e" font-size="11.5" font-weight="700">Kapan Huruf Kapital Dipakai?</text>
<text x="32" y="102" fill="#0f172a" font-size="10">- Huruf pertama awal kalimat</text>
<text x="32" y="120" fill="#0f172a" font-size="10">- Nama orang, Tuhan, &amp; agama</text>
<text x="32" y="138" fill="#0f172a" font-size="10">- Nama hari, bulan &amp; hari raya</text>
<text x="32" y="156" fill="#0f172a" font-size="10">- Nama tempat/geografi (Gunung Merapi)</text>
<text x="32" y="176" fill="#be123c" font-size="9.5" font-weight="700">Bukan kata umum: "gunung yang tinggi"</text>
<rect x="290" y="60" width="250" height="128" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="415" y="80" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Tanda Baca Dasar &amp; Kata Baku</text>
<text x="302" y="102" fill="#1d4ed8" font-size="10" font-weight="700">. (Titik) : Akhiri kalimat berita</text>
<text x="302" y="120" fill="#047857" font-size="10" font-weight="700">, (Koma) : Perincian lebih dari 2 barang</text>
<text x="302" y="138" fill="#854d0e" font-size="10" font-weight="700">? (Tanya) : Kalimat bertanya | ! (Seru): Perintah</text>
<text x="302" y="158" fill="#be123c" font-size="10" font-weight="700">"..." : Mengapit ucapan langsung</text>
<text x="302" y="177" fill="#334155" font-size="9.5">Baku SD: antre, izin, apotek, jadwal, nasihat</text>
`
);

export const DIAG_SD_MAT_BIL = svgFigure(
  "sd-mt-1",
  "Pita Pecahan Senilai & Pohon Faktor FPB–KPK SD",
  "FPB mengambil faktor sama pangkat terkecil; KPK mengalikan seluruh faktor pangkat terbesar",
  560,
  212,
  `
<text x="146" y="68" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Pita Pecahan &amp; Persen Senilai</text>
<rect x="24" y="78" width="240" height="24" fill="#dbeafe" stroke="#2563eb"/>
${svgTex(24, 79, 240, 22, "1 Utuh ($100\\%$)", { color: "#1e3a8a", size: 10.5, align: "center", bold: true })}
<rect x="24" y="106" width="120" height="26" fill="#3b82f6" stroke="#1e3a8a"/>
<rect x="144" y="106" width="120" height="26" fill="#eff6ff" stroke="#1e3a8a"/>
${svgTex(24, 107, 120, 24, "$\\tfrac{1}{2} = 0{,}5 = 50\\%$", { color: "#ffffff", size: 9.5, align: "center", bold: true })}
${svgTex(144, 107, 120, 24, "$\\tfrac{1}{2}$", { color: "#1e3a8a", size: 10, align: "center", bold: true })}
<rect x="24" y="136" width="60" height="26" fill="#059669" stroke="#065f46"/>
<rect x="84" y="136" width="60" height="26" fill="#34d399" stroke="#065f46"/>
<rect x="144" y="136" width="120" height="26" fill="#ecfdf5" stroke="#065f46"/>
${svgTex(24, 137, 60, 24, "$\\tfrac{1}{4}\\,(25\\%)$", { color: "#ffffff", size: 8.5, align: "center", bold: true })}
${svgTex(84, 137, 60, 24, "$\\tfrac{1}{4}$", { color: "#065f46", size: 9.5, align: "center", bold: true })}
${svgTex(144, 137, 120, 24, "$\\tfrac{2}{4} = \\tfrac{1}{2}$", { color: "#065f46", size: 9.5, align: "center", bold: true })}
${svgTex(14, 174, 260, 22, "KABATAKU: $(\\,) \\to \\times\\,\\div \\to +\\,-$ (kiri ke kanan)", { color: "#334155", size: 9.5, align: "center" })}
<line x1="282" y1="56" x2="282" y2="200" stroke="#e2e8f0" stroke-dasharray="4 3"/>
<rect x="298" y="60" width="242" height="136" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="419" y="80" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Cara Membedakan Soal Cerita FPB vs KPK</text>
<text x="310" y="104" fill="#047857" font-size="10.5" font-weight="700">Pakai FPB jika ditanya:</text>
<text x="310" y="120" fill="#334155" font-size="10">"Dibagi sama rata terbanyak ke bingkisan"</text>
<text x="310" y="146" fill="#1d4ed8" font-size="10.5" font-weight="700">Pakai KPK jika ditanya:</text>
<text x="310" y="162" fill="#334155" font-size="10">"Bertemu / berbunyi BERSAMAAN lagi tanggal.."</text>
${svgTex(306, 170, 228, 20, "Ingat: $(+) \\times (-) = (-)$ | $(-) \\times (-) = (+)$", { color: "#be123c", size: 9, align: "left", bold: true })}
`
);

export const DIAG_SD_MAT_SATUAN = svgFigure(
  "sd-mt-2",
  "Tangga Konversi Satuan Panjang & Segitiga Jarak–Kecepatan–Waktu (JKW)",
  "Turun 1 tangga panjang $\\times 10$; Luas ($\\text{m}^2$) $\\times 100$; Volume ($\\text{m}^3$) $\\times 1.000$",
  560,
  222,
  `
<rect x="26" y="64" width="44" height="18" fill="#dbeafe" stroke="#2563eb"/><text x="48" y="77" text-anchor="middle" fill="#1e3a8a" font-size="9.5" font-weight="700">km</text>
<rect x="54" y="84" width="44" height="18" fill="#dbeafe" stroke="#2563eb"/><text x="76" y="97" text-anchor="middle" fill="#1e3a8a" font-size="9.5" font-weight="700">hm</text>
<rect x="82" y="104" width="44" height="18" fill="#dbeafe" stroke="#2563eb"/><text x="104" y="117" text-anchor="middle" fill="#1e3a8a" font-size="9.5" font-weight="700">dam</text>
<rect x="110" y="124" width="44" height="18" fill="#93c5fd" stroke="#1d4ed8"/><text x="132" y="137" text-anchor="middle" fill="#0f172a" font-size="9.5" font-weight="700">m</text>
<rect x="138" y="144" width="44" height="18" fill="#dbeafe" stroke="#2563eb"/><text x="160" y="157" text-anchor="middle" fill="#1e3a8a" font-size="9.5" font-weight="700">dm</text>
<rect x="166" y="164" width="44" height="18" fill="#dbeafe" stroke="#2563eb"/><text x="188" y="177" text-anchor="middle" fill="#1e3a8a" font-size="9.5" font-weight="700">cm</text>
<rect x="194" y="184" width="44" height="18" fill="#dbeafe" stroke="#2563eb"/><text x="216" y="197" text-anchor="middle" fill="#1e3a8a" font-size="9.5" font-weight="700">mm</text>
${svgTex(178, 72, 108, 18, "Turun $1\\times = \\times 10$", { color: "#047857", size: 9.5, align: "left", bold: true })}
${svgTex(178, 90, 108, 18, "Naik $1\\times = \\div 10$", { color: "#be123c", size: 9.5, align: "left", bold: true })}
${svgTex(178, 110, 116, 18, "$1\\text{ dm}^3 = 1\\text{ liter}$!", { color: "#1d4ed8", size: 9.5, align: "left" })}
${svgTex(178, 128, 122, 18, "$1\\text{ ha} = 10.000\\text{ m}^2$", { color: "#1d4ed8", size: 9.5, align: "left" })}
<polygon points="338,66 276,158 400,158" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
<line x1="307" y1="112" x2="369" y2="112" stroke="#065f46" stroke-width="1.5"/>
<line x1="338" y1="112" x2="338" y2="158" stroke="#065f46" stroke-width="1.5"/>
${svgTex(324, 84, 28, 22, "$J$", { color: "#065f46", size: 13, align: "center", bold: true })}
${svgTex(301, 124, 28, 22, "$K$", { color: "#065f46", size: 13, align: "center", bold: true })}
${svgTex(347, 124, 28, 22, "$W$", { color: "#065f46", size: 13, align: "center", bold: true })}
${svgTex(268, 170, 140, 34, "$J = K \\times W \\mid K = \\frac{J}{W}$", { color: "#334155", size: 10, align: "center" })}
<polygon points="478,66 416,158 540,158" fill="#fefce8" stroke="#d97706" stroke-width="2"/>
<line x1="447" y1="112" x2="509" y2="112" stroke="#854d0e" stroke-width="1.5"/>
<line x1="478" y1="112" x2="478" y2="158" stroke="#854d0e" stroke-width="1.5"/>
${svgTex(464, 84, 28, 22, "$V$", { color: "#854d0e", size: 13, align: "center", bold: true })}
${svgTex(441, 124, 28, 22, "$D$", { color: "#854d0e", size: 13, align: "center", bold: true })}
${svgTex(487, 124, 28, 22, "$W$", { color: "#854d0e", size: 13, align: "center", bold: true })}
${svgTex(408, 170, 140, 34, "$\\text{Debit} = \\frac{\\text{Volume}}{\\text{Waktu}}$", { color: "#334155", size: 10, align: "center" })}
`
);

export const DIAG_SD_MAT_BANGUN = svgFigure(
  "sd-mt-3",
  "Galeri Rumus Luas Bangun Datar, Volume Ruang & Rata-Rata SD",
  "Kenali tinggi tegak lurus ($t$) pada segitiga/trapesium serta jari-jari ($r = \\tfrac{d}{2}$) lingkaran",
  560,
  248,
  `
<rect x="20" y="60" width="166" height="172" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<text x="103" y="80" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">Bangun Datar SD</text>
${svgTex(28, 88, 152, 24, "Segitiga: $L = \\tfrac{1}{2} \\times a \\times t$", { color: "#0f172a", size: 9.5, align: "left" })}
${svgTex(28, 114, 152, 24, "Trapesium: $\\tfrac{1}{2}(a+b)\\times t$", { color: "#0f172a", size: 9.5, align: "left" })}
${svgTex(28, 140, 152, 24, "Belah Ketupat: $\\tfrac{1}{2} d_1 d_2$", { color: "#0f172a", size: 9.5, align: "left" })}
${svgTex(28, 168, 152, 22, "Lingkaran: $L = \\pi r^2$", { color: "#1d4ed8", size: 9.5, align: "left", bold: true })}
${svgTex(28, 194, 152, 22, "Keliling $= \\pi d = 2\\pi r$", { color: "#1d4ed8", size: 9.5, align: "left", bold: true })}
<rect x="197" y="60" width="166" height="172" rx="8" fill="#ecfdf5" stroke="#10b981"/>
<text x="280" y="80" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">Bangun Ruang SD</text>
${svgTex(205, 90, 150, 20, "Kubus (sisi $s$):", { color: "#0f172a", size: 10, align: "left", bold: true })}
${svgTex(205, 110, 150, 22, "$V = s^3 \\mid L_p = 6s^2$", { color: "#334155", size: 9.5, align: "left" })}
${svgTex(205, 140, 150, 20, "Balok ($p, l, t$):", { color: "#0f172a", size: 10, align: "left", bold: true })}
${svgTex(205, 160, 150, 22, "$V = p \\times l \\times t$", { color: "#334155", size: 9.5, align: "left" })}
${svgTex(205, 190, 150, 22, "Tabung: $V = \\pi r^2 t$", { color: "#047857", size: 9.5, align: "left", bold: true })}
<rect x="374" y="60" width="166" height="172" rx="8" fill="#fefce8" stroke="#eab308"/>
<text x="457" y="80" text-anchor="middle" fill="#854d0e" font-size="11" font-weight="700">Pengolahan Data</text>
<text x="384" y="103" fill="#0f172a" font-size="10" font-weight="700">Rata-rata:</text>
${svgTex(382, 108, 152, 32, "$\\bar{x} = \\frac{\\text{Jumlah semua}}{\\text{Banyak data}}$", { color: "#334155", size: 9.5, align: "left" })}
<text x="384" y="154" fill="#be123c" font-size="10" font-weight="700">Modus:</text>
<text x="384" y="170" fill="#334155" font-size="10">Nilai terbanyak muncul</text>
${svgTex(382, 184, 152, 34, "Persen: $\\frac{\\text{bagian}}{\\text{total}} \\times 100\\%$", { color: "#854d0e", size: 9, align: "left", bold: true })}
`
);

