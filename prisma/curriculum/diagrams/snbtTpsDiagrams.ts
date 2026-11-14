import { svgFigure, svgTex } from "./svgHelper";

// ==================== 1. PENALARAN UMUM (PU) — 7 DIAGRAM ====================

export const DIAG_PU_GENERALISASI = svgFigure(
  "pu-gen",
  "Alur Generalisasi Induktif & Validasi Fakta Teks",
  "Dari sampel data spesifik menuju simpulan sah yang tidak melebihi batas klaim",
  560,
  210,
  `
<rect x="20" y="64" width="128" height="72" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
<text x="84" y="88" text-anchor="middle" fill="#1e3a8a" font-size="12" font-weight="700">1. Sampel Data</text>
<text x="84" y="106" text-anchor="middle" fill="#334155" font-size="10.5">Kasus khusus, tabel,</text>
<text x="84" y="121" text-anchor="middle" fill="#334155" font-size="10.5">atau tren terukur</text>
<line x1="150" y1="100" x2="188" y2="100" stroke="#1d4ed8" stroke-width="2.2" marker-end="url(#arr-pu-gen)"/>
<rect x="192" y="64" width="140" height="72" rx="10" fill="#f0fdf4" stroke="#10b981" stroke-width="1.5"/>
<text x="262" y="88" text-anchor="middle" fill="#065f46" font-size="12" font-weight="700">2. Uji Representasi</text>
<text x="262" y="106" text-anchor="middle" fill="#334155" font-size="10.5">Cukup banyak, acak,</text>
<text x="262" y="121" text-anchor="middle" fill="#334155" font-size="10.5">&amp; tanpa bias lokasi</text>
<line x1="334" y1="100" x2="372" y2="100" stroke="#1d4ed8" stroke-width="2.2" marker-end="url(#arr-pu-gen)"/>
<rect x="376" y="64" width="164" height="72" rx="10" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
<text x="458" y="88" text-anchor="middle" fill="#854d0e" font-size="12" font-weight="700">3. Simpulan Proporsional</text>
<text x="458" y="106" text-anchor="middle" fill="#334155" font-size="10.5">Pakai "cenderung / sebagian"</text>
<text x="458" y="121" text-anchor="middle" fill="#b45309" font-size="10" font-weight="600">Hindari "pasti / semua" tanpa bukti</text>
<rect x="20" y="152" width="252" height="40" rx="8" fill="#ecfdf5" stroke="#6ee7b7"/>
<text x="146" y="170" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">SAH: Memuat fakta teks + sebab eksplisit</text>
<text x="146" y="185" text-anchor="middle" fill="#047857" font-size="10">Sesuai kualitas &amp; rentang tahun pada teks</text>
<rect x="288" y="152" width="252" height="40" rx="8" fill="#fff1f2" stroke="#fda4af"/>
<text x="414" y="170" text-anchor="middle" fill="#9f1239" font-size="11" font-weight="700">JEBAKAN: Overclaim / Melompat Asumsi</text>
<text x="414" y="185" text-anchor="middle" fill="#be123c" font-size="10">Korelasi langsung diklaim kausalitas mutlak</text>
`
);

export const DIAG_PU_ANALOGI = svgFigure(
  "pu-ana",
  "Struktur Analogi Induktif & Evaluasi Argumen",
  "Kesamaan relasi inti menentukan kuatnya analogi serta arah argumen (memperkuat/memperlemah)",
  560,
  215,
  `
<rect x="24" y="62" width="236" height="62" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
${svgTex(34, 68, 216, 22, "$A : B = C : D$", { color: "#1e3a8a", size: 12, align: "center", bold: true })}
<text x="142" y="101" text-anchor="middle" fill="#334155" font-size="10.5">Peta kesamaan relasi relevan</text>
<text x="142" y="115" text-anchor="middle" fill="#1d4ed8" font-size="10">Contoh: Jantung : Darah :: Pompa : Air</text>
<rect x="282" y="62" width="254" height="62" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
${svgTex(290, 68, 238, 22, "Klaim: $X$ menyebabkan $Y$", { color: "#0f172a", size: 11.5, align: "center", bold: true })}
${svgTex(290, 88, 238, 18, "Uji apakah ada faktor perancu $Z$", { color: "#475569", size: 10.2, align: "center" })}
${svgTex(290, 104, 238, 18, "atau bukti tandingan memutus $X \\to Y$", { color: "#475569", size: 10.2, align: "center" })}
<rect x="24" y="138" width="246" height="60" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
<text x="147" y="158" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">MEMPERKUAT ARGUMEN</text>
${svgTex(34, 162, 226, 18, "Tambah bukti mekanisme $X \\to Y$", { color: "#334155", size: 10, align: "center" })}
${svgTex(34, 178, 226, 18, "atau eliminasi penyebab alternatif $Z$", { color: "#047857", size: 10, align: "center" })}
<rect x="290" y="138" width="246" height="60" rx="8" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.5"/>
<text x="413" y="158" text-anchor="middle" fill="#9f1239" font-size="11.5" font-weight="700">MEMPERLEMAH ARGUMEN</text>
${svgTex(300, 162, 226, 18, "Tunjukkan $X$ ada tapi $Y$ gagal terjadi,", { color: "#334155", size: 10, align: "center" })}
${svgTex(300, 178, 226, 18, "atau $Y$ tetap terjadi akibat faktor $Z$", { color: "#be123c", size: 10, align: "center" })}
`
);

export const DIAG_PU_LOGIKA = svgFigure(
  "pu-log",
  "Ekuivalensi Implikasi, Kontraposisi & Hukum De Morgan",
  "Peta transformasi logika proposisi paling sering muncul di UTBK-SNBT",
  560,
  215,
  `
<rect x="30" y="64" width="142" height="58" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/>
${svgTex(38, 69, 126, 26, "$P \\Rightarrow Q$", { color: "#1e3a8a", size: 13.5, align: "center", bold: true })}
<text x="101" y="109" text-anchor="middle" fill="#1e40af" font-size="10.5">Jika P maka Q</text>
<path d="M174,93 L210,93" stroke="#1d4ed8" stroke-width="2" marker-end="url(#arr-pu-log)"/>
${svgTex(174, 70, 36, 20, "$\\equiv$", { color: "#1d4ed8", size: 12, align: "center", bold: true })}
<rect x="214" y="64" width="142" height="58" rx="10" fill="#ecfdf5" stroke="#059669" stroke-width="1.8"/>
${svgTex(222, 69, 126, 26, "$\\neg Q \\Rightarrow \\neg P$", { color: "#065f46", size: 13.5, align: "center", bold: true })}
<text x="285" y="109" text-anchor="middle" fill="#047857" font-size="10.5">Kontraposisi (Sah!)</text>
<path d="M358,93 L394,93" stroke="#1d4ed8" stroke-width="2" marker-end="url(#arr-pu-log)"/>
${svgTex(358, 70, 36, 20, "$\\equiv$", { color: "#1d4ed8", size: 12, align: "center", bold: true })}
<rect x="398" y="64" width="132" height="58" rx="10" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.8"/>
${svgTex(406, 69, 116, 26, "$\\neg P \\lor Q$", { color: "#4c1d95", size: 13.5, align: "center", bold: true })}
<text x="464" y="109" text-anchor="middle" fill="#5b21b6" font-size="10.5">Bentuk Disjungsi</text>
<rect x="30" y="138" width="245" height="62" rx="8" fill="#fff7ed" stroke="#f97316" stroke-width="1.5"/>
${svgTex(36, 143, 233, 20, "Negasi Implikasi: $\\neg(P \\Rightarrow Q)$", { color: "#9a3412", size: 11.5, align: "center", bold: true })}
${svgTex(36, 163, 233, 22, "$\\equiv\\; P \\land \\neg Q$", { color: "#c2410c", size: 12.5, align: "center", bold: true })}
<text x="152" y="194" text-anchor="middle" fill="#7c2d12" font-size="9.5">(Hati-hati: hasil negasi bukan implikasi!)</text>
<rect x="290" y="138" width="240" height="62" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
<text x="410" y="158" text-anchor="middle" fill="#991b1b" font-size="11.5" font-weight="700">De Morgan &amp; Kesesatan Umum</text>
${svgTex(296, 162, 228, 20, "$\\neg(P \\land Q) \\equiv \\neg P \\lor \\neg Q$", { color: "#7f1d1d", size: 11, align: "center", bold: true })}
${svgTex(296, 181, 228, 18, "Jebakan: $Q \\Rightarrow P$ (Konvers) TIDAK SAH", { color: "#b91c1c", size: 9.8, align: "center" })}
`
);

export const DIAG_PU_INFERENSI = svgFigure(
  "pu-inf",
  "Diagram Euler Kuantor & 3 Kaidah Inferensi Sah",
  "Visualisasi 'Semua A adalah B' mencegah kesalahan menyimpulkan himpunan balik",
  560,
  215,
  `
<ellipse cx="135" cy="128" rx="95" ry="62" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
<text x="135" y="84" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Himpunan B</text>
<ellipse cx="135" cy="140" rx="55" ry="34" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="1.8"/>
<text x="135" y="144" text-anchor="middle" fill="#0f172a" font-size="12" font-weight="700">Semua A</text>
<text x="135" y="203" text-anchor="middle" fill="#475569" font-size="10">Semua A berada dalam B, belum tentu semua B adalah A</text>
<rect x="262" y="60" width="276" height="40" rx="8" fill="#f0fdf4" stroke="#10b981"/>
${svgTex(272, 63, 260, 18, "Modus Ponens: $P \\implies Q,\\; P\\text{ terjadi} \\vdash Q$", { color: "#065f46", size: 10.5, align: "left", bold: true })}
<text x="276" y="92" fill="#047857" font-size="9.5">Anggota A pasti memiliki sifat B</text>
<rect x="262" y="108" width="276" height="40" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
${svgTex(272, 111, 260, 18, "Modus Tollens: $P \\implies Q,\\; \\neg Q \\vdash \\neg P$", { color: "#1e3a8a", size: 10.5, align: "left", bold: true })}
<text x="276" y="140" fill="#1d4ed8" font-size="9.5">Di luar lingkaran B pasti di luar lingkaran A</text>
<rect x="262" y="156" width="276" height="40" rx="8" fill="#fefce8" stroke="#eab308"/>
${svgTex(272, 159, 260, 18, "Silogisme: $P \\implies Q,\\; Q \\implies R \\vdash P \\implies R$", { color: "#854d0e", size: 10.2, align: "left", bold: true })}
${svgTex(272, 177, 260, 17, "Negasi \"Semua $P \\to Q$\" ialah \"Ada $P$ dan $\\neg Q$\"", { color: "#a16207", size: 9, align: "left" })}
`
);

export const DIAG_PU_ANALITIS = svgFigure(
  "pu-anl",
  "Model Papan Pemetaan Analitis: Linear & Meja Bundar",
  "Selalu pasang posisi absolut lebih dulu sebelum mengikat syarat relatif bersebelahan",
  560,
  215,
  `
<text x="135" y="70" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">Model 1: Urutan Slot Linear (1..5)</text>
<rect x="24" y="84" width="42" height="38" rx="6" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
<rect x="70" y="84" width="42" height="38" rx="6" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
<rect x="116" y="84" width="42" height="38" rx="6" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
<rect x="162" y="84" width="42" height="38" rx="6" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
<rect x="208" y="84" width="42" height="38" rx="6" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
<text x="45" y="107" text-anchor="middle" fill="#1e3a8a" font-size="12" font-weight="700">1</text>
<text x="91" y="107" text-anchor="middle" fill="#1e3a8a" font-size="12" font-weight="700">2</text>
<text x="137" y="107" text-anchor="middle" fill="#1e3a8a" font-size="12" font-weight="700">3*</text>
<text x="183" y="107" text-anchor="middle" fill="#1e3a8a" font-size="12" font-weight="700">4</text>
<text x="229" y="107" text-anchor="middle" fill="#1e3a8a" font-size="12" font-weight="700">5</text>
<path d="M91,132 L137,132" stroke="#059669" stroke-width="2.5"/>
<text x="114" y="148" text-anchor="middle" fill="#047857" font-size="10" font-weight="700">[Blok A-B]</text>
<text x="137" y="172" text-anchor="middle" fill="#475569" font-size="10">Kunci jangkar tengah (3*),</text>
<text x="137" y="187" text-anchor="middle" fill="#475569" font-size="10">lalu uji 2 cabang posisi blok</text>
<line x1="278" y1="58" x2="278" y2="198" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="418" y="70" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">Model 2: Meja Bundar (N = 6)</text>
<circle cx="418" cy="134" r="46" fill="#f8fafc" stroke="#334155" stroke-width="1.8"/>
<text x="418" y="138" text-anchor="middle" fill="#64748b" font-size="10" font-weight="600">Meja</text>
<circle cx="418" cy="82" r="13" fill="#2563eb"/><text x="418" y="86" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">A</text>
<circle cx="464" cy="108" r="13" fill="#0284c7"/><text x="464" y="112" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">B</text>
<circle cx="464" cy="160" r="13" fill="#0284c7"/><text x="464" y="164" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">C</text>
<circle cx="418" cy="186" r="13" fill="#059669"/><text x="418" y="190" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">D</text>
<circle cx="372" cy="160" r="13" fill="#0284c7"/><text x="372" y="164" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">E</text>
<circle cx="372" cy="108" r="13" fill="#0284c7"/><text x="372" y="112" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">F</text>
<line x1="418" y1="96" x2="418" y2="172" stroke="#059669" stroke-width="1.5" stroke-dasharray="3 2"/>
<text x="515" y="132" text-anchor="middle" fill="#065f46" font-size="9.5" font-weight="700">A berhadapan D</text>
<text x="515" y="145" text-anchor="middle" fill="#475569" font-size="9">Arah jarum jam = kiri A</text>
`
);

export const DIAG_PU_BARISAN = svgFigure(
  "pu-bar",
  "Strategi Membedah Barisan Larik Ganda & Bertingkat",
  "Jika selisih berurutan tidak beraturan, uji loncat-1 (suku ganjil vs suku genap)",
  560,
  210,
  `
<text x="280" y="67" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">Contoh Barisan Larik Ganda (Dua Pola Terjalin)</text>
<rect x="44" y="96" width="52" height="36" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
<rect x="114" y="96" width="52" height="36" rx="8" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
<rect x="184" y="96" width="52" height="36" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
<rect x="254" y="96" width="52" height="36" rx="8" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
<rect x="324" y="96" width="52" height="36" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
<rect x="394" y="96" width="52" height="36" rx="8" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
<rect x="464" y="96" width="52" height="36" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
<text x="70" y="119" text-anchor="middle" fill="#1e3a8a" font-size="13" font-weight="700">3</text>
<text x="140" y="119" text-anchor="middle" fill="#065f46" font-size="13" font-weight="700">10</text>
<text x="210" y="119" text-anchor="middle" fill="#1e3a8a" font-size="13" font-weight="700">6</text>
<text x="280" y="119" text-anchor="middle" fill="#065f46" font-size="13" font-weight="700">15</text>
<text x="350" y="119" text-anchor="middle" fill="#1e3a8a" font-size="13" font-weight="700">12</text>
<text x="420" y="119" text-anchor="middle" fill="#065f46" font-size="13" font-weight="700">20</text>
<text x="490" y="119" text-anchor="middle" fill="#b45309" font-size="13" font-weight="700">24</text>
<path d="M70,94 Q140,68 210,94" fill="none" stroke="#2563eb" stroke-width="1.8" marker-end="url(#arr-pu-bar)"/>
<path d="M210,94 Q280,68 350,94" fill="none" stroke="#2563eb" stroke-width="1.8" marker-end="url(#arr-pu-bar)"/>
<path d="M350,94 Q420,68 490,94" fill="none" stroke="#d97706" stroke-width="1.8" marker-end="url(#arr-pu-bar)"/>
${svgTex(124, 65, 32, 18, "$\\times 2$", { color: "#1d4ed8", size: 10.5, align: "center", bold: true })}
${svgTex(264, 65, 32, 18, "$\\times 2$", { color: "#1d4ed8", size: 10.5, align: "center", bold: true })}
${svgTex(404, 65, 32, 18, "$\\times 2$", { color: "#b45309", size: 10.5, align: "center", bold: true })}
<path d="M140,134 Q210,162 280,134" fill="none" stroke="#059669" stroke-width="1.8" marker-end="url(#arr-emerald-pu-bar)"/>
<path d="M280,134 Q350,162 420,134" fill="none" stroke="#059669" stroke-width="1.8" marker-end="url(#arr-emerald-pu-bar)"/>
${svgTex(194, 143, 32, 18, "$+5$", { color: "#047857", size: 10.5, align: "center", bold: true })}
${svgTex(334, 143, 32, 18, "$+5$", { color: "#047857", size: 10.5, align: "center", bold: true })}
<text x="280" y="190" text-anchor="middle" fill="#475569" font-size="10.5">Checklist Pola: (1) Selisih tetap, (2) Selisih tingkat-2, (3) Larik ganda, (4) Fibonacci</text>
`
);

export const DIAG_PU_PERSENTASE_HIMPUNAN = svgFigure(
  "pu-pct",
  "Alur Persentase Beruntun vs Diagram Venn Himpunan",
  "Persentase beruntun TIDAK boleh dijumlah langsung; himpunan pakai prinsip inklusi-eksklusi",
  560,
  218,
  `
<text x="145" y="68" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">Diskon Beruntun 20% + 10% (Bukan 30%!)</text>
<rect x="20" y="84" width="66" height="44" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<text x="53" y="104" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">Rp100rb</text>
<text x="53" y="119" text-anchor="middle" fill="#475569" font-size="9.5">Harga awal</text>
<line x1="88" y1="106" x2="112" y2="106" stroke="#1d4ed8" stroke-width="2" marker-end="url(#arr-pu-pct)"/>
<rect x="115" y="84" width="66" height="44" rx="8" fill="#f0fdf4" stroke="#10b981"/>
<text x="148" y="104" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">Rp80rb</text>
${svgTex(120, 108, 56, 16, "$\\times 0{,}80$", { color: "#047857", size: 9.5, align: "center" })}
<line x1="183" y1="106" x2="207" y2="106" stroke="#1d4ed8" stroke-width="2" marker-end="url(#arr-pu-pct)"/>
<rect x="210" y="84" width="68" height="44" rx="8" fill="#fefce8" stroke="#eab308"/>
<text x="244" y="104" text-anchor="middle" fill="#854d0e" font-size="11" font-weight="700">Rp72rb</text>
${svgTex(211, 108, 66, 16, "$\\times 0{,}90\\;(-28\\%)$", { color: "#b45309", size: 8.8, align: "center" })}
${svgTex(16, 144, 266, 32, "Naik $x\\%$ lalu turun $x\\%$ turun $\\left(\\frac{x}{10}\\right)^2\\%$", { color: "#334155", size: 10.2, align: "center", bold: true })}
<line x1="294" y1="56" x2="294" y2="204" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="424" y="68" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">Diagram Venn Dua Himpunan</text>
<rect x="322" y="78" width="204" height="94" rx="8" fill="#f8fafc" stroke="#94a3b8"/>
<circle cx="398" cy="124" r="34" fill="#3b82f6" fill-opacity="0.22" stroke="#2563eb" stroke-width="1.6"/>
<circle cx="448" cy="124" r="34" fill="#10b981" fill-opacity="0.22" stroke="#059669" stroke-width="1.6"/>
${svgTex(356, 114, 42, 20, "$A - B$", { color: "#1e3a8a", size: 10.5, align: "center", bold: true })}
${svgTex(400, 114, 46, 20, "$A \\cap B$", { color: "#0f172a", size: 10.5, align: "center", bold: true })}
${svgTex(448, 114, 42, 20, "$B - A$", { color: "#065f46", size: 10.5, align: "center", bold: true })}
${svgTex(496, 150, 20, 18, "$C$", { color: "#64748b", size: 10, align: "center", bold: true })}
${svgTex(300, 180, 250, 22, "$S = n(A) + n(B) - n(A \\cap B) + \\text{Luar}$", { color: "#334155", size: 10, align: "center", bold: true })}
`
);

// ==================== 2. PPU — 5 DIAGRAM ====================

export const DIAG_PPU_MAKNA = svgFigure(
  "ppu-mak",
  "Peta 6 Pola Pergeseran Makna Kata dalam Bahasa Indonesia",
  "Identifikasi arah perubahan arti kata dari makna asal menuju makna masa kini",
  560,
  215,
  `
<circle cx="280" cy="126" r="38" fill="#1e3a8a" stroke="#1d4ed8" stroke-width="2"/>
<text x="280" y="123" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">PERGESERAN</text>
<text x="280" y="138" text-anchor="middle" fill="#bfdbfe" font-size="10.5" font-weight="600">MAKNA</text>
<rect x="26" y="60" width="150" height="38" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<text x="101" y="76" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">1. Meluas (Generalisasi)</text>
<text x="101" y="90" text-anchor="middle" fill="#475569" font-size="9.5">bapak, ibu, berlayar</text>
<rect x="26" y="108" width="150" height="38" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<text x="101" y="124" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">2. Menyempit (Spesialisasi)</text>
<text x="101" y="138" text-anchor="middle" fill="#475569" font-size="9.5">sarjana, pendeta, madrasah</text>
<rect x="26" y="156" width="150" height="38" rx="8" fill="#ecfdf5" stroke="#10b981"/>
<text x="101" y="172" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">3. Ameliorasi (Membaik)</text>
<text x="101" y="186" text-anchor="middle" fill="#475569" font-size="9.5">tunawisma, pramusaji, wafat</text>
<rect x="384" y="60" width="150" height="38" rx="8" fill="#fff1f2" stroke="#f43f5e"/>
<text x="459" y="76" text-anchor="middle" fill="#9f1239" font-size="11" font-weight="700">4. Peyorasi (Memburuk)</text>
<text x="459" y="90" text-anchor="middle" fill="#475569" font-size="9.5">bini, gerombolan, oknum</text>
<rect x="384" y="108" width="150" height="38" rx="8" fill="#fefce8" stroke="#eab308"/>
<text x="459" y="124" text-anchor="middle" fill="#854d0e" font-size="11" font-weight="700">5. Sinestesia (Tukar Indra)</text>
<text x="459" y="138" text-anchor="middle" fill="#475569" font-size="9.5">suara manis, kata pedas</text>
<rect x="384" y="156" width="150" height="38" rx="8" fill="#f3e8ff" stroke="#8b5cf6"/>
<text x="459" y="172" text-anchor="middle" fill="#5b21b6" font-size="11" font-weight="700">6. Asosiasi (Kemiripan Sifat)</text>
<text x="459" y="186" text-anchor="middle" fill="#475569" font-size="9.5">amplop (suap), kursi (jabatan)</text>
<line x1="178" y1="79" x2="245" y2="112" stroke="#94a3b8" stroke-width="1.3"/>
<line x1="178" y1="127" x2="240" y2="127" stroke="#94a3b8" stroke-width="1.3"/>
<line x1="178" y1="175" x2="245" y2="140" stroke="#94a3b8" stroke-width="1.3"/>
<line x1="382" y1="79" x2="315" y2="112" stroke="#94a3b8" stroke-width="1.3"/>
<line x1="382" y1="127" x2="320" y2="127" stroke="#94a3b8" stroke-width="1.3"/>
<line x1="382" y1="175" x2="315" y2="140" stroke="#94a3b8" stroke-width="1.3"/>
`
);

export const DIAG_PPU_RELASI = svgFigure(
  "ppu-rel",
  "Taksonomi Hipernim–Hiponim & Peta Bentuk-Makna Homonim",
  "Bedakan hubungan cakupan makna (atas-bawah) dengan kemiripan ejaan/lafal",
  560,
  210,
  `
<rect x="88" y="60" width="136" height="32" rx="8" fill="#1d4ed8"/>
<text x="156" y="80" text-anchor="middle" fill="#fff" font-size="11.5" font-weight="700">Hipernim: KENDARAAN</text>
<line x1="115" y1="92" x2="62" y2="128" stroke="#1d4ed8" stroke-width="1.6"/>
<line x1="156" y1="92" x2="156" y2="128" stroke="#1d4ed8" stroke-width="1.6"/>
<line x1="197" y1="92" x2="246" y2="128" stroke="#1d4ed8" stroke-width="1.6"/>
<rect x="22" y="130" width="76" height="30" rx="6" fill="#dbeafe" stroke="#3b82f6"/>
<rect x="116" y="130" width="80" height="30" rx="6" fill="#dbeafe" stroke="#3b82f6"/>
<rect x="208" y="130" width="76" height="30" rx="6" fill="#dbeafe" stroke="#3b82f6"/>
<text x="60" y="149" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="700">Sepeda</text>
<text x="156" y="149" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="700">Mobil</text>
<text x="246" y="149" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="700">Kereta</text>
<text x="154" y="182" text-anchor="middle" fill="#475569" font-size="10">Ketiganya saling ber-Kohiponim</text>
<line x1="300" y1="56" x2="300" y2="196" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 3"/>
<rect x="316" y="62" width="224" height="40" rx="8" fill="#ecfdf5" stroke="#10b981"/>
<text x="328" y="79" fill="#065f46" font-size="11" font-weight="700">Homonim: Eja &amp; Lafal SAMA, Arti beda</text>
<text x="328" y="94" fill="#334155" font-size="10">bisa (racun) vs bisa (mampu) -&gt; tak terkait</text>
<rect x="316" y="110" width="224" height="40" rx="8" fill="#fefce8" stroke="#eab308"/>
<text x="328" y="127" fill="#854d0e" font-size="11" font-weight="700">Homograf: Eja SAMA, Lafal beda</text>
<text x="328" y="142" fill="#334155" font-size="10">t[e]ras (pejabat) vs t[e-pepet]ras (rumah)</text>
<rect x="316" y="158" width="224" height="40" rx="8" fill="#f3e8ff" stroke="#8b5cf6"/>
<text x="328" y="175" fill="#5b21b6" font-size="11" font-weight="700">Polisemi: Satu kata, banyak makna terkait</text>
<text x="328" y="190" fill="#334155" font-size="10">kepala (organ), kepala sekolah, kepala surat</text>
`
);

export const DIAG_PPU_MORFOLOGI = svgFigure(
  "ppu-mor",
  "Anatomi Pembentukan Kata: Afiksasi, Konfiks & Majemuk",
  "Membedakan imbuhan gabungan bertahap dengan konfiks yang melekat serentak",
  560,
  205,
  `
<rect x="24" y="64" width="250" height="62" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
<text x="149" y="84" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Konfiks (Simultan: peN-...-an)</text>
<text x="149" y="102" text-anchor="middle" fill="#0f172a" font-size="12" font-weight="700">[peN- + {didik} + -an] -&gt; pendidikan</text>
<text x="149" y="117" text-anchor="middle" fill="#475569" font-size="9.5">*pendidik atau *didikan tidak berdiri langsung menjadi dasar</text>
<rect x="290" y="64" width="246" height="62" rx="10" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
<text x="413" y="84" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Afiksasi Bertahap (meN- + {-kan})</text>
<text x="413" y="102" text-anchor="middle" fill="#0f172a" font-size="12" font-weight="700">ajar -&gt; ajari -&gt; mengajari</text>
<text x="413" y="117" text-anchor="middle" fill="#475569" font-size="9.5">Makna kausatif (-kan): membuat jadi sesuatu</text>
<rect x="24" y="138" width="250" height="52" rx="8" fill="#fefce8" stroke="#eab308"/>
<text x="149" y="158" text-anchor="middle" fill="#854d0e" font-size="11" font-weight="700">Reduplikasi: Dwipurwa / Berubah Bunyi</text>
<text x="149" y="175" text-anchor="middle" fill="#334155" font-size="10">tetangga (dwipurwa), sayur-mayur (salin suara)</text>
<rect x="290" y="138" width="246" height="52" rx="8" fill="#f8fafc" stroke="#64748b"/>
<text x="413" y="158" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="700">Kata Majemuk + Konfiks = SERANGKAI</text>
<text x="413" y="175" text-anchor="middle" fill="#334155" font-size="10">tanggung jawab -&gt; pertanggungjawaban</text>
`
);

export const DIAG_PPU_SINTAKSIS = svgFigure(
  "ppu-sin",
  "Struktur Frasa Hukum D–M & Pohon Kalimat Inti S–P–O",
  "Teknik mencoret pewatas ('yang', keterangan) untuk menemukan inti kalimat",
  560,
  210,
  `
<rect x="24" y="60" width="220" height="132" rx="10" fill="#f8fafc" stroke="#94a3b8"/>
<text x="134" y="80" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">Frasa Endosentrik Hukum D–M</text>
<rect x="44" y="94" width="84" height="34" rx="6" fill="#2563eb"/>
<text x="86" y="115" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">gedung (D)</text>
<rect x="140" y="94" width="84" height="34" rx="6" fill="#dbeafe" stroke="#2563eb"/>
<text x="182" y="115" text-anchor="middle" fill="#1e3a8a" font-size="12" font-weight="700">tua (M)</text>
<path d="M182,130 Q134,142 86,130" fill="none" stroke="#1d4ed8" stroke-width="1.8" marker-end="url(#arr-ppu-sin)"/>
<text x="134" y="156" text-anchor="middle" fill="#1d4ed8" font-size="10" font-weight="700">M menerangkan D (D-M)</text>
<text x="134" y="169" text-anchor="middle" fill="#475569" font-size="10">Setara struktur: "buku baru" = D-M</text>
<text x="134" y="182" text-anchor="middle" fill="#be123c" font-size="9.5">Beda dengan "dua orang" (M-D)</text>
<rect x="260" y="60" width="276" height="132" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="398" y="80" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Teknik Reduksi Kalimat Inti</text>
<rect x="276" y="92" width="110" height="30" rx="6" fill="#d1fae5" stroke="#059669"/>
<text x="331" y="111" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">S: Peneliti muda</text>
<rect x="394" y="92" width="128" height="30" rx="6" fill="#d1fae5" stroke="#059669"/>
<text x="458" y="111" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">P: menemukan</text>
<rect x="276" y="130" width="110" height="30" rx="6" fill="#d1fae5" stroke="#059669"/>
<text x="331" y="149" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">O: spesies baru</text>
<rect x="394" y="130" width="128" height="30" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-dasharray="3 2"/>
<text x="458" y="149" text-anchor="middle" fill="#64748b" font-size="10" text-decoration="line-through">K: di pulau (coret)</text>
<text x="398" y="179" text-anchor="middle" fill="#047857" font-size="10.5" font-weight="700">Inti: Peneliti menemukan spesies baru (S-P-O)</text>
`
);

export const DIAG_PPU_WACANA = svgFigure(
  "ppu-wac",
  "Kepaduan Wacana: Kohesi, Koherensi & Deteksi Kalimat Sumbang",
  "Kalimat penjelas wajib mengacu ke topik utama; kalimat sumbang menyimpang fokus",
  560,
  205,
  `
<rect x="160" y="58" width="240" height="36" rx="8" fill="#1e3a8a"/>
<text x="280" y="80" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">KALIMAT UTAMA (Gagasan Pokok)</text>
<line x1="210" y1="94" x2="105" y2="124" stroke="#10b981" stroke-width="1.8" marker-end="url(#arr-emerald-ppu-wac)"/>
<line x1="280" y1="94" x2="280" y2="124" stroke="#10b981" stroke-width="1.8" marker-end="url(#arr-emerald-ppu-wac)"/>
<line x1="350" y1="94" x2="455" y2="124" stroke="#be123c" stroke-width="1.8" stroke-dasharray="4 3"/>
<rect x="26" y="128" width="156" height="58" rx="8" fill="#ecfdf5" stroke="#10b981"/>
<text x="104" y="148" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">Penjelas 1 (Kohesif)</text>
<text x="104" y="164" text-anchor="middle" fill="#334155" font-size="10">Repetitio/kata ganti mengikat</text>
<text x="104" y="177" text-anchor="middle" fill="#047857" font-size="9.5">Mendukung topik inti</text>
<rect x="202" y="128" width="156" height="58" rx="8" fill="#ecfdf5" stroke="#10b981"/>
<text x="280" y="148" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">Penjelas 2 (Koheren)</text>
<text x="280" y="164" text-anchor="middle" fill="#334155" font-size="10">Hubungan sebab/rincian logis</text>
<text x="280" y="177" text-anchor="middle" fill="#047857" font-size="9.5">Menguatkan klaim paragraf</text>
<rect x="378" y="128" width="156" height="58" rx="8" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.8"/>
<text x="456" y="148" text-anchor="middle" fill="#9f1239" font-size="11" font-weight="700">KALIMAT SUMBANG (X)</text>
<text x="456" y="164" text-anchor="middle" fill="#be123c" font-size="10">Membahas isu/subjek baru</text>
<text x="456" y="177" text-anchor="middle" fill="#9f1239" font-size="9.5">Putus rantai rujukan kata</text>
`
);

// ==================== 3. PBM — 5 DIAGRAM ====================

export const DIAG_PBM_EYD = svgFigure(
  "pbm-eyd",
  "Rangkuman Visual EYD V: Kapital, Preposisi vs Imbuhan & Partikel",
  "Kesalahan ejaan paling sering diuji pada soal penyuntingan PBM UTBK-SNBT",
  560,
  205,
  `
<rect x="20" y="62" width="166" height="128" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="103" y="82" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">1. Huruf Kapital</text>
<text x="30" y="102" fill="#047857" font-size="10" font-weight="700">BENAR:</text>
<text x="30" y="117" fill="#334155" font-size="10">Selat Sunda, bahasa Jawa,</text>
<text x="30" y="131" fill="#334155" font-size="10">Gubernur Bali, bulan Mei</text>
<text x="30" y="153" fill="#be123c" font-size="10" font-weight="700">SALAH:</text>
<text x="30" y="168" fill="#475569" font-size="10">pisang Ambon, garam Inggris</text>
<text x="30" y="181" fill="#475569" font-size="9.5">(jenis non-asal tdk kapital)</text>
<rect x="197" y="62" width="166" height="128" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="280" y="82" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">2. di / ke (Spasi vs Gabung)</text>
<text x="207" y="104" fill="#047857" font-size="10.5" font-weight="700">Preposisi (PISAH):</text>
<text x="207" y="119" fill="#334155" font-size="10">di sekolah, ke pasar, di atas</text>
<text x="207" y="145" fill="#1d4ed8" font-size="10.5" font-weight="700">Imbuhan Pasif (GABUNG):</text>
<text x="207" y="160" fill="#334155" font-size="10">dibaca, ditulis, keluar</text>
<text x="207" y="176" fill="#64748b" font-size="9.5">(Uji: bisa diubah ke meN-?)</text>
<rect x="374" y="62" width="166" height="128" rx="10" fill="#fefce8" stroke="#eab308"/>
<text x="457" y="82" text-anchor="middle" fill="#854d0e" font-size="11.5" font-weight="700">3. Partikel pun &amp; per</text>
<text x="384" y="104" fill="#854d0e" font-size="10" font-weight="700">pun PISAH:</text>
<text x="384" y="119" fill="#334155" font-size="10">apa pun, satu pun, saya pun</text>
<text x="384" y="142" fill="#b45309" font-size="10" font-weight="700">pun GABUNG (Konjungsi):</text>
<text x="384" y="157" fill="#334155" font-size="10">meskipun, walaupun, adapun</text>
<text x="384" y="177" fill="#475569" font-size="9.5">per = demi/tiap/mulai (PISAH)</text>
`
);

export const DIAG_PBM_TANDA_BACA = svgFigure(
  "pbm-tb",
  "Peta Penggunaan Tanda Koma (,) & Tanda Baca Kritis EYD V",
  "Struktur Anak Kalimat vs Induk Kalimat menjadi kunci soal koma di PBM",
  560,
  205,
  `
<rect x="24" y="62" width="246" height="58" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
<text x="147" y="82" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Anak Kalimat MENDAHULUI Induk</text>
<text x="147" y="100" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="700">Karena hujan, acara ditunda.</text>
<text x="147" y="114" text-anchor="middle" fill="#047857" font-size="10">WAJIB memakai tanda koma (,)</text>
<rect x="290" y="62" width="246" height="58" rx="8" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.5"/>
<text x="413" y="82" text-anchor="middle" fill="#9f1239" font-size="11.5" font-weight="700">Induk Kalimat MENDAHULUI Anak</text>
<text x="413" y="100" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="700">Acara ditunda karena hujan.</text>
<text x="413" y="114" text-anchor="middle" fill="#be123c" font-size="10">TIDAK BOLEH pakai koma sebelum "karena"!</text>
<rect x="24" y="132" width="160" height="58" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<text x="104" y="151" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">Konjungsi Antarkalimat</text>
<text x="104" y="167" text-anchor="middle" fill="#334155" font-size="10">Oleh karena itu, ...</text>
<text x="104" y="181" text-anchor="middle" fill="#1d4ed8" font-size="9.5">Wajib koma sesudahnya</text>
<rect x="200" y="132" width="160" height="58" rx="8" fill="#fefce8" stroke="#eab308"/>
<text x="280" y="151" text-anchor="middle" fill="#854d0e" font-size="11" font-weight="700">Sebelum Pertentangan</text>
<text x="280" y="167" text-anchor="middle" fill="#334155" font-size="10">..., melainkan ... / ..., sedangkan</text>
<text x="280" y="181" text-anchor="middle" fill="#b45309" font-size="9.5">Wajib koma sebelumnya</text>
<rect x="376" y="132" width="160" height="58" rx="8" fill="#f8fafc" stroke="#64748b"/>
<text x="456" y="151" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="700">Hubung (-) vs Pisah (—)</text>
<text x="456" y="167" text-anchor="middle" fill="#334155" font-size="10">ulang/awalan (-) vs</text>
<text x="456" y="181" text-anchor="middle" fill="#475569" font-size="9.5">s.d. rentang tanggal/angka (–)</text>
`
);

export const DIAG_PBM_KTSP = svgFigure(
  "pbm-ktsp",
  "Hukum Peluluhan Fonem K–T–S–P & Pengecualian Konsonan Rangkap",
  "K, T, S, P luluh jika diikuti vokal, tetapi TETAP (tidak luluh) jika kluster dua konsonan",
  560,
  205,
  `
<rect x="24" y="62" width="246" height="128" rx="10" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
<text x="147" y="84" text-anchor="middle" fill="#065f46" font-size="12" font-weight="700">LULUH: meN- / peN- + [K,T,S,P] + Vokal</text>
<text x="38" y="108" fill="#0f172a" font-size="11">meN- + karang  --&gt;  mengarang (bukan mengkarang)</text>
<text x="38" y="128" fill="#0f172a" font-size="11">meN- + tulis   --&gt;  menulis (bukan mentulis)</text>
<text x="38" y="148" fill="#0f172a" font-size="11">meN- + sapu    --&gt;  menyapu (bukan mensapu)</text>
<text x="38" y="168" fill="#0f172a" font-size="11">peN- + pesona  --&gt;  pemesona (bukan pempesona)</text>
<rect x="290" y="62" width="246" height="128" rx="10" fill="#fff7ed" stroke="#f97316" stroke-width="1.5"/>
<text x="413" y="84" text-anchor="middle" fill="#9a3412" font-size="12" font-weight="700">TIDAK LULUH: Kluster Konsonan Rangkap</text>
<text x="304" y="108" fill="#0f172a" font-size="11">meN- + kritik   --&gt;  mengkritik (kr)</text>
<text x="304" y="128" fill="#0f172a" font-size="11">meN- + traktor  --&gt;  mentraktor (tr)</text>
<text x="304" y="148" fill="#0f172a" font-size="11">meN- + stabilkan--&gt;  menstabilkan (st)</text>
<text x="304" y="168" fill="#be123c" font-size="10.5" font-weight="700">Kecuali: meN- + punya --&gt; mempunyai (khusus)</text>
`
);

export const DIAG_PBM_EFEKTIF = svgFigure(
  "pbm-ef",
  "Empat Pilar Diagnosis Kalimat Efektif UTBK-SNBT",
  "Setiap kalimat efektif wajib lolos uji Subjek-Predikat, Hemat, Paralel, dan Logis",
  560,
  205,
  `
<rect x="22" y="62" width="122" height="128" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="83" y="84" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">1. Jelas S &amp; P</text>
<text x="83" y="106" text-anchor="middle" fill="#be123c" font-size="10">X: "Bagi siswa</text>
<text x="83" y="120" text-anchor="middle" fill="#be123c" font-size="10">harap kumpul."</text>
<text x="83" y="144" text-anchor="middle" fill="#047857" font-size="10" font-weight="700">V: Hapus preposisi</text>
<text x="83" y="159" text-anchor="middle" fill="#047857" font-size="10">di depan Subjek!</text>
<rect x="154" y="62" width="122" height="128" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="215" y="84" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">2. Kehematan</text>
<text x="215" y="106" text-anchor="middle" fill="#be123c" font-size="10">X: "para siswa-siswa"</text>
<text x="215" y="120" text-anchor="middle" fill="#be123c" font-size="10">X: "agar supaya"</text>
<text x="215" y="144" text-anchor="middle" fill="#047857" font-size="10" font-weight="700">V: "para siswa"</text>
<text x="215" y="159" text-anchor="middle" fill="#047857" font-size="10">V: pilih satu kata</text>
<rect x="286" y="62" width="122" height="128" rx="10" fill="#fefce8" stroke="#eab308"/>
<text x="347" y="84" text-anchor="middle" fill="#854d0e" font-size="11.5" font-weight="700">3. Kesejajaran</text>
<text x="347" y="106" text-anchor="middle" fill="#be123c" font-size="10">X: "mencatat dan</text>
<text x="347" y="120" text-anchor="middle" fill="#be123c" font-size="10">analisis data"</text>
<text x="347" y="144" text-anchor="middle" fill="#047857" font-size="10" font-weight="700">V: "mencatat dan</text>
<text x="347" y="159" text-anchor="middle" fill="#047857" font-size="10">menganalisis"</text>
<rect x="418" y="62" width="122" height="128" rx="10" fill="#f3e8ff" stroke="#8b5cf6"/>
<text x="479" y="84" text-anchor="middle" fill="#5b21b6" font-size="11.5" font-weight="700">4. Kelogisan</text>
<text x="479" y="106" text-anchor="middle" fill="#be123c" font-size="10">X: "Waktu &amp; tempat</text>
<text x="479" y="120" text-anchor="middle" fill="#be123c" font-size="10">kami persilakan."</text>
<text x="479" y="144" text-anchor="middle" fill="#047857" font-size="10" font-weight="700">V: "Bapak Rektor</text>
<text x="479" y="159" text-anchor="middle" fill="#047857" font-size="10">kami persilakan."</text>
`
);

export const DIAG_PBM_KONJUNGSI = svgFigure(
  "pbm-kon",
  "Matriks Tiga Jenis Konjungsi & Pasangan Korelatif Baku",
  "Posisi konjungsi dalam kalimat menentukan boleh tidaknya berada di awal kalimat",
  560,
  205,
  `
<rect x="20" y="62" width="166" height="126" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<text x="103" y="82" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">Intrakalimat (Tengah)</text>
<text x="30" y="102" fill="#334155" font-size="10">Menghubungkan klausa:</text>
<text x="30" y="119" fill="#1d4ed8" font-size="10" font-weight="700">sedangkan, melainkan,</text>
<text x="30" y="134" fill="#1d4ed8" font-size="10" font-weight="700">sehingga, lalu, atau</text>
<text x="30" y="156" fill="#be123c" font-size="9.5" font-weight="700">SALAH di awal kalimat!</text>
<text x="30" y="170" fill="#be123c" font-size="9.5">(Kec. karena, meskipun)</text>
<rect x="197" y="62" width="166" height="126" rx="8" fill="#ecfdf5" stroke="#10b981"/>
<text x="280" y="82" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">Antarkalimat (Awal + ,)</text>
<text x="207" y="102" fill="#334155" font-size="10">Menghubungkan kalimat:</text>
<text x="207" y="119" fill="#047857" font-size="10" font-weight="700">Oleh karena itu,</text>
<text x="207" y="134" fill="#047857" font-size="10" font-weight="700">Akan tetapi, / Selain itu,</text>
<text x="207" y="149" fill="#047857" font-size="10" font-weight="700">Dengan demikian,</text>
<text x="207" y="170" fill="#065f46" font-size="9.5">Wajib diikuti koma (,)</text>
<rect x="374" y="62" width="166" height="126" rx="8" fill="#fefce8" stroke="#eab308"/>
<text x="457" y="82" text-anchor="middle" fill="#854d0e" font-size="11" font-weight="700">Korelatif (Berpasangan)</text>
<text x="384" y="105" fill="#0f172a" font-size="10">baik ... maupun ...</text>
<text x="384" y="124" fill="#0f172a" font-size="10">tidak ... tetapi ...</text>
<text x="384" y="143" fill="#0f172a" font-size="10">bukan ... melainkan ...</text>
<text x="384" y="162" fill="#0f172a" font-size="10">entah ... entah ...</text>
<text x="384" y="178" fill="#be123c" font-size="9.5">Bukan "tidak ... melainkan"!</text>
`
);

// ==================== 4. PENGETAHUAN KUANTITATIF (PK) — 12 DIAGRAM ====================

export const DIAG_PK_BILANGAN = svgFigure(
  "pk-bil",
  "Faktorisasi Prima: Banyak Faktor & Relasi KPK–FPB",
  "Mengubah bilangan komposit menjadi perkalian faktor prima $p^a \\cdot q^b$",
  560,
  208,
  `
<rect x="34" y="62" width="190" height="32" rx="8" fill="#1e3a8a"/>
${svgTex(34, 65, 190, 26, "$N = 360 = 2^3 \\cdot 3^2 \\cdot 5^1$", { color: "#ffffff", size: 11.5, align: "center", bold: true })}
<line x1="90" y1="94" x2="54" y2="120" stroke="#2563eb" stroke-width="1.6"/>
<line x1="129" y1="94" x2="129" y2="120" stroke="#2563eb" stroke-width="1.6"/>
<line x1="168" y1="94" x2="204" y2="120" stroke="#2563eb" stroke-width="1.6"/>
<rect x="22" y="122" width="64" height="28" rx="6" fill="#dbeafe" stroke="#2563eb"/>
${svgTex(22, 124, 64, 24, "$a+1=4$", { color: "#1e3a8a", size: 10.5, align: "center", bold: true })}
<rect x="97" y="122" width="64" height="28" rx="6" fill="#dbeafe" stroke="#2563eb"/>
${svgTex(97, 124, 64, 24, "$b+1=3$", { color: "#1e3a8a", size: 10.5, align: "center", bold: true })}
<rect x="172" y="122" width="64" height="28" rx="6" fill="#dbeafe" stroke="#2563eb"/>
${svgTex(172, 124, 64, 24, "$c+1=2$", { color: "#1e3a8a", size: 10.5, align: "center", bold: true })}
${svgTex(12, 163, 234, 24, "Banyak Faktor $= 4 \\times 3 \\times 2 = 24$", { color: "#047857", size: 10.5, align: "center", bold: true })}
<line x1="258" y1="56" x2="258" y2="195" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 3"/>
<rect x="278" y="62" width="258" height="58" rx="8" fill="#ecfdf5" stroke="#10b981"/>
<text x="407" y="83" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Identitas Emas KPK &amp; FPB</text>
${svgTex(282, 91, 250, 24, "$\\text{KPK}(a, b) \\times \\text{FPB}(a, b) = a \\times b$", { color: "#0f172a", size: 11, align: "center", bold: true })}
<rect x="278" y="130" width="258" height="58" rx="8" fill="#fefce8" stroke="#eab308"/>
<text x="407" y="150" text-anchor="middle" fill="#854d0e" font-size="11" font-weight="700">Uji Keterbagian Cepat</text>
${svgTex(282, 155, 250, 16, "Habis $3$ / $9$ $\\to$ jumlah digit habis $3$ / $9$", { color: "#334155", size: 9.5, align: "center" })}
${svgTex(282, 170, 250, 16, "Habis $11$ $\\to$ selisih selang-seling digit $= 11k$", { color: "#334155", size: 9.5, align: "center" })}
`
);

export const DIAG_PK_EKSPONEN_LOG = svgFigure(
  "pk-exp",
  "Grafik Fungsi Eksponen $y = a^x$ vs Logaritma $y = {}^a\\!\\log x$",
  "Keduanya saling invers sehingga grafiknya simetris terhadap garis cermin $y = x$",
  560,
  218,
  `
<line x1="56" y1="176" x2="274" y2="176" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr-dark-pk-exp)"/>
<line x1="92" y1="196" x2="92" y2="56" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr-dark-pk-exp)"/>
<line x1="68" y1="196" x2="250" y2="62" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4 3"/>
${svgTex(235, 68, 44, 18, "$y = x$", { color: "#64748b", size: 10, align: "left" })}
<path d="M56,170 Q110,166 138,142 T182,64" fill="none" stroke="#2563eb" stroke-width="2.4"/>
<circle cx="92" cy="156" r="3.5" fill="#2563eb"/>
${svgTex(54, 134, 36, 18, "$(0,1)$", { color: "#1e3a8a", size: 9.5, align: "right", bold: true })}
${svgTex(162, 58, 108, 22, "$y = a^x\\,(a>1)$", { color: "#2563eb", size: 10.5, align: "left", bold: true })}
<path d="M102,196 Q106,158 134,142 T260,114" fill="none" stroke="#059669" stroke-width="2.4"/>
<circle cx="118" cy="152" r="3.5" fill="#059669"/>
${svgTex(124, 152, 36, 18, "$(1,0)$", { color: "#065f46", size: 9.5, align: "left", bold: true })}
${svgTex(204, 120, 86, 22, "$y = {}^a\\!\\log x$", { color: "#059669", size: 10.5, align: "left", bold: true })}
<rect x="296" y="60" width="242" height="142" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
${svgTex(302, 66, 230, 22, "Syarat Mutlak Logaritma ${}^a\\!\\log b$", { color: "#0f172a", size: 11, align: "center", bold: true })}
${svgTex(308, 90, 220, 20, "Basis: $a > 0$ dan $a \\ne 1$", { color: "#1d4ed8", size: 10.5, align: "left", bold: true })}
${svgTex(308, 110, 220, 20, "Numerus: $b > 0$ (wajib dicek!)", { color: "#047857", size: 10.5, align: "left", bold: true })}
${svgTex(308, 132, 220, 20, "$a^{{}^a\\!\\log b} = b$", { color: "#334155", size: 10.5, align: "left" })}
${svgTex(308, 152, 220, 20, "${}^a\\!\\log b \\cdot {}^b\\!\\log c = {}^a\\!\\log c$", { color: "#334155", size: 10.5, align: "left" })}
${svgTex(308, 174, 226, 20, "Jika $0 < a < 1$: TANDA BERBALIK!", { color: "#be123c", size: 9.5, align: "left", bold: true })}
`
);

export const DIAG_PK_MUTLAK_SPL = svgFigure(
  "pk-mut",
  "Grafik Nilai Mutlak $|x - a|$ & Uji Daerah Penyelesaian Pertidaksamaan",
  "Nilai mutlak mencerminkan bagian negatif ke atas sumbu-$X$ sehingga selalu $\\ge 0$",
  560,
  214,
  `
<line x1="28" y1="168" x2="256" y2="168" stroke="#64748b" stroke-width="1.5"/>
<line x1="142" y1="188" x2="142" y2="58" stroke="#64748b" stroke-width="1.5"/>
<polyline points="62,84 142,168 222,84" fill="none" stroke="#2563eb" stroke-width="2.5"/>
<line x1="48" y1="114" x2="236" y2="114" stroke="#be123c" stroke-width="1.5" stroke-dasharray="4 3"/>
<circle cx="91" cy="114" r="4" fill="#be123c"/>
<circle cx="193" cy="114" r="4" fill="#be123c"/>
${svgTex(22, 172, 240, 22, "$y = |x - a|$ (titik sudut di $x = a$)", { color: "#1e3a8a", size: 10, align: "center", bold: true })}
${svgTex(198, 92, 46, 18, "$y = k$", { color: "#be123c", size: 10, align: "left", bold: true })}
<rect x="278" y="60" width="260" height="62" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<text x="408" y="80" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Aturan Cepat Pertidaksamaan Mutlak</text>
${svgTex(282, 85, 252, 18, "$|f(x)| < k \\implies -k < f(x) < k$", { color: "#0f172a", size: 10, align: "center" })}
${svgTex(282, 102, 252, 18, "$|f(x)| > k \\implies f(x) < -k$ atau $f(x) > k$", { color: "#0f172a", size: 10, align: "center" })}
<rect x="278" y="130" width="260" height="72" rx="8" fill="#ecfdf5" stroke="#10b981"/>
${svgTex(282, 134, 252, 24, "Pertidaksamaan Pecahan $\\frac{f(x)}{g(x)} \\le 0$", { color: "#065f46", size: 10.5, align: "center", bold: true })}
<text x="408" y="170" text-anchor="middle" fill="#be123c" font-size="10.5" font-weight="700">JANGAN PERNAH KALI SILANG g(x)!</text>
${svgTex(282, 176, 252, 20, "Garis bilangan ($+$/$-$) &amp; syarat $g(x) \\ne 0$", { color: "#334155", size: 9.5, align: "center" })}
`
);

export const DIAG_PK_KUADRAT = svgFigure(
  "pk-kua",
  "Tiga Posisi Parabola Fungsi Kuadrat $f(x) = ax^2 + bx + c$ ($a > 0$)",
  "Nilai Diskriminan $D = b^2 - 4ac$ menentukan jumlah titik potong dengan sumbu-$X$",
  560,
  214,
  `
<line x1="20" y1="145" x2="176" y2="145" stroke="#475569" stroke-width="1.4"/>
<path d="M36,72 Q98,214 160,72" fill="none" stroke="#2563eb" stroke-width="2.4"/>
<circle cx="62" cy="145" r="3.8" fill="#be123c"/><circle cx="134" cy="145" r="3.8" fill="#be123c"/>
${svgTex(22, 166, 152, 20, "$D > 0$ (2 akar real)", { color: "#1e3a8a", size: 11, align: "center", bold: true })}
<text x="98" y="198" text-anchor="middle" fill="#475569" font-size="9.5">Memotong sumbu-X di 2 titik</text>
<line x1="202" y1="145" x2="358" y2="145" stroke="#475569" stroke-width="1.4"/>
<path d="M218,64 Q280,226 342,64" fill="none" stroke="#059669" stroke-width="2.4"/>
<circle cx="280" cy="145" r="4.2" fill="#059669"/>
${svgTex(204, 166, 152, 20, "$D = 0$ (1 akar kembar)", { color: "#065f46", size: 11, align: "center", bold: true })}
<text x="280" y="198" text-anchor="middle" fill="#475569" font-size="9.5">Menyinggung sumbu-X</text>
<line x1="384" y1="145" x2="540" y2="145" stroke="#475569" stroke-width="1.4"/>
<path d="M402,58 Q462,175 522,58" fill="none" stroke="#7c3aed" stroke-width="2.4"/>
<circle cx="462" cy="116" r="3.5" fill="#7c3aed"/>
<text x="462" y="132" text-anchor="middle" fill="#5b21b6" font-size="9.5" font-weight="700">Definit Positif</text>
${svgTex(386, 166, 152, 20, "$D < 0$ (Melayang)", { color: "#5b21b6", size: 11, align: "center", bold: true })}
${svgTex(384, 185, 156, 18, "Definit Positif: $a > 0$ &amp; $D < 0$", { color: "#475569", size: 9, align: "center" })}
`
);

export const DIAG_PK_FUNGSI = svgFigure(
  "pk-fun",
  "Diagram Pemetaan Fungsi Komposisi $(g \\circ f)(x)$ & Invers $f^{-1}$",
  "Hitung fungsi bagian DALAM lebih dulu ($f$), baru hasilnya dimasukkan ke fungsi LUAR ($g$)",
  560,
  210,
  `
<ellipse cx="96" cy="118" rx="46" ry="52" fill="#eff6ff" stroke="#2563eb" stroke-width="1.6"/>
<text x="96" y="88" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Domain A</text>
<circle cx="96" cy="118" r="14" fill="#2563eb"/>
${svgTex(82, 107, 28, 22, "$x$", { color: "#ffffff", size: 11.5, align: "center", bold: true })}
<ellipse cx="280" cy="118" rx="46" ry="52" fill="#ecfdf5" stroke="#059669" stroke-width="1.6"/>
<text x="280" y="88" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Antara B</text>
<rect x="255" y="104" width="50" height="28" rx="12" fill="#059669"/>
${svgTex(255, 107, 50, 22, "$f(x)$", { color: "#ffffff", size: 11, align: "center", bold: true })}
<ellipse cx="464" cy="118" rx="46" ry="52" fill="#fefce8" stroke="#d97706" stroke-width="1.6"/>
<text x="464" y="88" text-anchor="middle" fill="#854d0e" font-size="11.5" font-weight="700">Hasil C</text>
<rect x="433" y="104" width="62" height="28" rx="12" fill="#d97706"/>
${svgTex(433, 107, 62, 22, "$g(f(x))$", { color: "#ffffff", size: 10.5, align: "center", bold: true })}
<path d="M114,114 L250,114" stroke="#1d4ed8" stroke-width="2" marker-end="url(#arr-pk-fun)"/>
${svgTex(174, 90, 28, 20, "$f$", { color: "#1d4ed8", size: 11, align: "center", bold: true })}
<path d="M308,114 L428,114" stroke="#047857" stroke-width="2" marker-end="url(#arr-emerald-pk-fun)"/>
${svgTex(354, 90, 28, 20, "$g$", { color: "#047857", size: 11, align: "center", bold: true })}
<path d="M104,142 Q280,192 456,142" fill="none" stroke="#7c3aed" stroke-width="2" marker-end="url(#arr-dark-pk-fun)"/>
${svgTex(180, 165, 200, 20, "$(g \\circ f)(x) = g(f(x))$", { color: "#5b21b6", size: 11.5, align: "center", bold: true })}
${svgTex(110, 184, 340, 20, "Invers kebalikannya: $(g \\circ f)^{-1} = f^{-1} \\circ g^{-1}$", { color: "#475569", size: 10, align: "center" })}
`
);

export const DIAG_PK_GARIS_MATRIKS = svgFigure(
  "pk-gm",
  "Gradien Garis Sejajar vs Tegak Lurus & Determinan Matriks $2 \\times 2$",
  "Hubungan $m_1 = m_2$ (sejajar) serta $m_1 \\cdot m_2 = -1$ (tegak lurus) dan $ad - bc$",
  560,
  212,
  `
<line x1="36" y1="158" x2="236" y2="158" stroke="#64748b" stroke-width="1.4"/>
<line x1="76" y1="184" x2="76" y2="58" stroke="#64748b" stroke-width="1.4"/>
<line x1="48" y1="152" x2="184" y2="70" stroke="#2563eb" stroke-width="2.2"/>
<line x1="90" y1="168" x2="226" y2="86" stroke="#2563eb" stroke-width="2.2" stroke-dasharray="5 3"/>
<line x1="112" y1="68" x2="162" y2="152" stroke="#be123c" stroke-width="2.2"/>
${svgTex(188, 58, 66, 20, "$m_1 = m_2$", { color: "#1e3a8a", size: 10.5, align: "left", bold: true })}
${svgTex(164, 134, 88, 20, "$m_1 \\cdot m_3 = -1$", { color: "#be123c", size: 10, align: "left", bold: true })}
<line x1="258" y1="56" x2="258" y2="198" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="407" y="72" text-anchor="middle" fill="#0f172a" font-size="12" font-weight="700">Determinan &amp; Invers Matriks</text>
<rect x="304" y="86" width="76" height="62" rx="6" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
${svgTex(312, 92, 26, 22, "$a$", { color: "#1e3a8a", size: 13.5, align: "center", bold: true })}
${svgTex(346, 92, 26, 22, "$b$", { color: "#be123c", size: 13.5, align: "center", bold: true })}
${svgTex(312, 120, 26, 22, "$c$", { color: "#be123c", size: 13.5, align: "center", bold: true })}
${svgTex(346, 120, 26, 22, "$d$", { color: "#1e3a8a", size: 13.5, align: "center", bold: true })}
<line x1="331" y1="110" x2="355" y2="128" stroke="#2563eb" stroke-width="1.5" opacity="0.6"/>
<line x1="355" y1="110" x2="331" y2="128" stroke="#be123c" stroke-width="1.5" opacity="0.6"/>
${svgTex(388, 88, 158, 22, "$\\det(A) = ad - bc$", { color: "#065f46", size: 11, align: "center", bold: true })}
${svgTex(388, 110, 158, 20, "$\\det(A) = 0 \\to$ Singular", { color: "#475569", size: 10, align: "center" })}
${svgTex(388, 130, 158, 22, "$\\det(kA) = k^2 \\det(A)$", { color: "#1d4ed8", size: 10.5, align: "center" })}
${svgTex(268, 166, 280, 24, "$AX = B \\implies X = A^{-1}B \\mid XA = B \\implies X = BA^{-1}$", { color: "#854d0e", size: 9.5, align: "center", bold: true })}
`
);

export const DIAG_PK_KECUKUPAN = svgFigure(
  "pk-kec",
  "Diagram Alir Metode 1–2–Gabung (Soal Kecukupan Data UTBK)",
  "Jangan membawa informasi pernyataan (1) saat sedang menguji pernyataan (2) sendirian!",
  560,
  214,
  `
<rect x="20" y="62" width="146" height="48" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
<text x="93" y="83" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">Uji (1) Sendirian</text>
<text x="93" y="99" text-anchor="middle" fill="#334155" font-size="9.5">Hasil tepat 1 nilai tunggal?</text>
<line x1="168" y1="86" x2="206" y2="86" stroke="#059669" stroke-width="1.8" marker-end="url(#arr-emerald-pk-kec)"/>
<text x="187" y="79" text-anchor="middle" fill="#059669" font-size="9.5" font-weight="700">YA</text>
<rect x="210" y="62" width="136" height="48" rx="8" fill="#ecfdf5" stroke="#10b981"/>
<text x="278" y="82" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">Cek (2) Sendirian</text>
<text x="278" y="98" text-anchor="middle" fill="#047857" font-size="10">Ya =&gt; D  |  Tidak =&gt; A</text>
<line x1="93" y1="112" x2="93" y2="138" stroke="#be123c" stroke-width="1.8" marker-end="url(#arr-rose-pk-kec)"/>
<text x="115" y="128" fill="#be123c" font-size="9.5" font-weight="700">TIDAK</text>
<rect x="20" y="142" width="146" height="48" rx="8" fill="#fff7ed" stroke="#f97316" stroke-width="1.5"/>
<text x="93" y="163" text-anchor="middle" fill="#9a3412" font-size="11" font-weight="700">Lupakan (1), Uji (2)!</text>
<text x="93" y="179" text-anchor="middle" fill="#7c2d12" font-size="9.5">(2) tunggal =&gt; Kunci B</text>
<line x1="168" y1="166" x2="206" y2="166" stroke="#be123c" stroke-width="1.8" marker-end="url(#arr-rose-pk-kec)"/>
<rect x="210" y="142" width="136" height="48" rx="8" fill="#f3e8ff" stroke="#8b5cf6"/>
<text x="278" y="162" text-anchor="middle" fill="#5b21b6" font-size="11" font-weight="700">Gabung (1) + (2)</text>
<text x="278" y="178" text-anchor="middle" fill="#6d28d9" font-size="10">Tunggal =&gt; C | Gagal =&gt; E</text>
<rect x="364" y="62" width="176" height="134" rx="10" fill="#fefce8" stroke="#eab308"/>
${svgTex(368, 67, 168, 22, "Jebakan $P$ vs $Q$: $0 < x < 1$", { color: "#854d0e", size: 10.5, align: "center", bold: true })}
<line x1="382" y1="120" x2="522" y2="120" stroke="#475569" stroke-width="1.5"/>
<circle cx="392" cy="120" r="3.5" fill="#0f172a"/>${svgTex(382, 123, 20, 18, "$0$", { color: "#0f172a", size: 10, align: "center" })}
<circle cx="426" cy="120" r="4" fill="#be123c"/>${svgTex(411, 95, 30, 20, "$x^2$", { color: "#be123c", size: 10, align: "center", bold: true })}
<circle cx="460" cy="120" r="4" fill="#2563eb"/>${svgTex(450, 95, 20, 20, "$x$", { color: "#1d4ed8", size: 10, align: "center", bold: true })}
<circle cx="494" cy="120" r="4" fill="#059669"/>${svgTex(475, 94, 38, 22, "$\\sqrt{x}$", { color: "#047857", size: 10, align: "center", bold: true })}
<circle cx="516" cy="120" r="3.5" fill="#0f172a"/>${svgTex(506, 123, 20, 18, "$1$", { color: "#0f172a", size: 10, align: "center" })}
${svgTex(370, 144, 164, 20, "Selalu uji negatif ($-2$),", { color: "#334155", size: 9.5, align: "center" })}
${svgTex(370, 164, 164, 26, "nol ($0$), &amp; pecahan ($\\tfrac{1}{4}$)!", { color: "#334155", size: 9.5, align: "center" })}
`
);

export const DIAG_PK_BARISAN = svgFigure(
  "pk-brs",
  "Visualisasi Deret Aritmetika ($+b$) vs Geometri Tak Hingga ($S_{\\infty}$)",
  "Deret geometri $|r| < 1$ konvergen ke satu luas batas $S_{\\infty} = \\tfrac{a}{1 - r}$",
  560,
  222,
  `
${svgTex(16, 56, 248, 22, "Tangga Aritmetika (Beda $b$ Tetap)", { color: "#1e3a8a", size: 11, align: "center", bold: true })}
<rect x="34" y="152" width="38" height="24" fill="#bfdbfe" stroke="#2563eb"/>
<rect x="78" y="132" width="38" height="44" fill="#93c5fd" stroke="#2563eb"/>
<rect x="122" y="112" width="38" height="64" fill="#60a5fa" stroke="#2563eb"/>
<rect x="166" y="92" width="38" height="84" fill="#3b82f6" stroke="#1d4ed8"/>
<rect x="210" y="72" width="38" height="104" fill="#2563eb" stroke="#1e3a8a"/>
${svgTex(34, 155, 38, 20, "$U_1$", { color: "#0f172a", size: 10, align: "center", bold: true })}
${svgTex(78, 145, 38, 20, "$U_2$", { color: "#0f172a", size: 10, align: "center", bold: true })}
${svgTex(122, 135, 38, 20, "$U_3$", { color: "#0f172a", size: 10, align: "center", bold: true })}
${svgTex(166, 125, 38, 20, "$U_4$", { color: "#ffffff", size: 10, align: "center", bold: true })}
${svgTex(210, 115, 38, 20, "$U_5$", { color: "#ffffff", size: 10, align: "center", bold: true })}
${svgTex(18, 184, 244, 24, "$S_n = n \\cdot U_{\\text{tengah}}$ (utk $n$ ganjil)", { color: "#334155", size: 10, align: "center" })}
<line x1="274" y1="56" x2="274" y2="210" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 3"/>
${svgTex(286, 56, 260, 22, "Persegi Deret Konvergen ($r = \\tfrac{1}{2}$)", { color: "#065f46", size: 11, align: "center", bold: true })}
<rect x="330" y="78" width="168" height="96" fill="#f8fafc" stroke="#0f172a" stroke-width="1.5"/>
<rect x="330" y="78" width="84" height="96" fill="#d1fae5" stroke="#059669"/>
${svgTex(330, 108, 84, 36, "$\\frac{1}{2}$", { color: "#065f46", size: 12.5, align: "center", bold: true })}
<rect x="414" y="78" width="84" height="48" fill="#a7f3d0" stroke="#059669"/>
${svgTex(414, 86, 84, 32, "$\\frac{1}{4}$", { color: "#065f46", size: 11.5, align: "center", bold: true })}
<rect x="414" y="126" width="42" height="48" fill="#6ee7b7" stroke="#059669"/>
${svgTex(414, 136, 42, 28, "$\\frac{1}{8}$", { color: "#065f46", size: 10.5, align: "center", bold: true })}
<rect x="456" y="126" width="42" height="24" fill="#34d399" stroke="#059669"/>
${svgTex(456, 127, 42, 22, "$\\tfrac{1}{16}$", { color: "#065f46", size: 9, align: "center", bold: true })}
${svgTex(282, 178, 266, 36, "$S_{\\infty} = \\frac{a}{1 - r} = \\frac{1/2}{1 - 1/2} = 1$", { color: "#047857", size: 10.5, align: "center", bold: true })}
`
);

export const DIAG_PK_KESEBANGUNAN = svgFigure(
  "pk-sebangun",
  "Empat Pola Wajib Kesebangunan Geometri UTBK-SNBT",
  "Hafalkan pasangan sisi bersesuaian & awasi jebakan garis sejajar bertumpuk",
  600,
  354,
  `
<rect x="14" y="56" width="280" height="138" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
${svgTex(18, 60, 272, 22, "1. Segitiga Bertumpuk ($DE \\parallel BC$)", { color: "#1e3a8a", size: 11, align: "center", bold: true })}
<polygon points="88,90 34,168 144,168" fill="#dbeafe" fill-opacity="0.45" stroke="#1e3a8a" stroke-width="1.8"/>
<line x1="59" y1="132" x2="119" y2="132" stroke="#be123c" stroke-width="2.2"/>
${svgTex(78, 72, 20, 18, "$A$", { color: "#0f172a", size: 10.5, align: "center", bold: true })}
${svgTex(36, 122, 20, 18, "$D$", { color: "#be123c", size: 10, align: "right", bold: true })}
${svgTex(122, 122, 20, 18, "$E$", { color: "#be123c", size: 10, align: "left", bold: true })}
${svgTex(15, 165, 20, 18, "$B$", { color: "#0f172a", size: 10.5, align: "right", bold: true })}
${svgTex(145, 165, 20, 18, "$C$", { color: "#0f172a", size: 10.5, align: "left", bold: true })}
${svgTex(158, 92, 130, 34, "$\\frac{AD}{AB} = \\frac{DE}{BC}$", { color: "#1d4ed8", size: 11, align: "center", bold: true })}
${svgTex(158, 127, 130, 22, "Bukan $\\tfrac{AD}{DB}$!", { color: "#be123c", size: 9.5, align: "center", bold: true })}
${svgTex(158, 148, 130, 34, "$\\frac{AD}{DB} = \\frac{AE}{EC}$", { color: "#047857", size: 10.5, align: "center" })}

<rect x="306" y="56" width="280" height="138" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
${svgTex(310, 60, 272, 22, "2. Pola Kupu-Kupu ($AB \\parallel CD$)", { color: "#065f46", size: 11, align: "center", bold: true })}
<polygon points="330,96 424,96 388,133" fill="#d1fae5" fill-opacity="0.55" stroke="#065f46" stroke-width="1.8"/>
<polygon points="388,133 346,172 446,172" fill="#a7f3d0" fill-opacity="0.55" stroke="#065f46" stroke-width="1.8"/>
${svgTex(310, 88, 18, 18, "$A$", { color: "#0f172a", size: 10, align: "right", bold: true })}
${svgTex(426, 88, 18, 18, "$B$", { color: "#0f172a", size: 10, align: "left", bold: true })}
${svgTex(394, 124, 18, 18, "$O$", { color: "#065f46", size: 10, align: "left", bold: true })}
${svgTex(326, 168, 18, 18, "$D$", { color: "#0f172a", size: 10, align: "right", bold: true })}
${svgTex(448, 168, 18, 18, "$C$", { color: "#0f172a", size: 10, align: "left", bold: true })}
${svgTex(452, 98, 128, 36, "$\\frac{OA}{OD} = \\frac{OB}{OC}$", { color: "#047857", size: 11, align: "center", bold: true })}
${svgTex(452, 138, 128, 34, "$= \\frac{AB}{CD}$", { color: "#047857", size: 11, align: "center", bold: true })}

<rect x="14" y="204" width="280" height="138" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
<text x="154" y="223" text-anchor="middle" fill="#854d0e" font-size="11" font-weight="700">3. Trapesium ("Rumus Ikan")</text>
<polygon points="50,238 112,238 134,312 28,312" fill="#fef3c7" fill-opacity="0.6" stroke="#b45309" stroke-width="1.8"/>
<line x1="39" y1="275" x2="123" y2="275" stroke="#be123c" stroke-width="2.2"/>
${svgTex(34, 224, 18, 18, "$D$", { color: "#0f172a", size: 10, align: "center", bold: true })}
${svgTex(110, 224, 18, 18, "$C$", { color: "#0f172a", size: 10, align: "center", bold: true })}
${svgTex(18, 266, 18, 18, "$E$", { color: "#be123c", size: 10, align: "right", bold: true })}
${svgTex(125, 266, 18, 18, "$F$", { color: "#be123c", size: 10, align: "left", bold: true })}
${svgTex(10, 310, 18, 18, "$A$", { color: "#0f172a", size: 10, align: "right", bold: true })}
${svgTex(134, 310, 18, 18, "$B$", { color: "#0f172a", size: 10, align: "left", bold: true })}
${svgTex(146, 248, 144, 40, "$EF = \\frac{DC\\cdot AE + AB\\cdot DE}{DE + AE}$", { color: "#854d0e", size: 9.5, align: "center", bold: true })}
<text x="218" y="305" text-anchor="middle" fill="#475569" font-size="9.5">Silang atas-bawah!</text>

<rect x="306" y="204" width="280" height="138" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
<text x="446" y="223" text-anchor="middle" fill="#5b21b6" font-size="11" font-weight="700">4. Siku-Siku &amp; Garis Tinggi</text>
<polygon points="326,312 454,312 366,248" fill="#ede9fe" fill-opacity="0.6" stroke="#6d28d9" stroke-width="1.8"/>
<line x1="366" y1="248" x2="366" y2="312" stroke="#be123c" stroke-width="2" stroke-dasharray="4 2"/>
<polyline points="359,256 367,261 373,254" fill="none" stroke="#6d28d9" stroke-width="1.3"/>
<rect x="366" y="304" width="8" height="8" fill="none" stroke="#be123c" stroke-width="1.2"/>
${svgTex(308, 310, 18, 18, "$A$", { color: "#0f172a", size: 10, align: "right", bold: true })}
${svgTex(357, 230, 18, 18, "$C$", { color: "#0f172a", size: 10, align: "center", bold: true })}
${svgTex(357, 314, 18, 18, "$D$", { color: "#be123c", size: 10, align: "center", bold: true })}
${svgTex(454, 310, 18, 18, "$B$", { color: "#0f172a", size: 10, align: "left", bold: true })}
${svgTex(464, 242, 118, 22, "$CD^2 = AD \\cdot DB$", { color: "#5b21b6", size: 10, align: "center", bold: true })}
${svgTex(464, 266, 118, 22, "$AC^2 = AD \\cdot AB$", { color: "#5b21b6", size: 10, align: "center", bold: true })}
${svgTex(464, 290, 118, 22, "$BC^2 = BD \\cdot AB$", { color: "#5b21b6", size: 10, align: "center", bold: true })}
`
);

export const DIAG_PK_GEOMETRI = svgFigure(
  "pk-geo",
  "Teorema Lingkaran & Diagonal Bangun Ruang Kubus",
  "Sudut pusat $= 2\\times$ sudut keliling; sudut menghadap diameter selalu $90^\\circ$",
  560,
  218,
  `
<circle cx="135" cy="126" r="60" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
<circle cx="135" cy="126" r="3" fill="#0f172a"/>
<polygon points="135,126 88,163 182,163" fill="#dbeafe" fill-opacity="0.55" stroke="#1d4ed8" stroke-width="1.5"/>
<polyline points="88,163 135,66 182,163" fill="none" stroke="#be123c" stroke-width="1.8"/>
${svgTex(100, 102, 70, 18, "$O\\,(2\\alpha)$", { color: "#1e3a8a", size: 10.5, align: "center", bold: true })}
${svgTex(105, 46, 60, 18, "$C\\,(\\alpha)$", { color: "#be123c", size: 10.5, align: "center", bold: true })}
${svgTex(66, 158, 18, 18, "$A$", { color: "#0f172a", size: 10, align: "right", bold: true })}
${svgTex(186, 158, 18, 18, "$B$", { color: "#0f172a", size: 10, align: "left", bold: true })}
${svgTex(16, 190, 240, 20, "Sudut Pusat $= 2 \\times$ Sudut Keliling", { color: "#334155", size: 10, align: "center" })}
<line x1="270" y1="56" x2="270" y2="206" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 3"/>
<polygon points="312,102 382,102 382,172 312,172" fill="#ecfdf5" fill-opacity="0.4" stroke="#059669" stroke-width="1.6"/>
<polygon points="340,78 410,78 410,148 382,172 382,102 312,102" fill="none" stroke="#059669" stroke-width="1.6"/>
<line x1="340" y1="78" x2="340" y2="148" stroke="#94a3b8" stroke-dasharray="3 2"/>
<line x1="312" y1="172" x2="340" y2="148" stroke="#94a3b8" stroke-dasharray="3 2"/>
<line x1="340" y1="148" x2="410" y2="148" stroke="#94a3b8" stroke-dasharray="3 2"/>
<line x1="312" y1="172" x2="410" y2="78" stroke="#be123c" stroke-width="2.2"/>
${svgTex(418, 76, 134, 20, "Kubus Sisi $s$", { color: "#065f46", size: 11, align: "center", bold: true })}
${svgTex(418, 100, 134, 22, "Diag. Bidang $= s\\sqrt{2}$", { color: "#334155", size: 10, align: "center" })}
${svgTex(418, 124, 134, 22, "Diag. Ruang $= s\\sqrt{3}$", { color: "#be123c", size: 10, align: "center", bold: true })}
${svgTex(414, 150, 140, 32, "Jarak ke $AG = \\frac{s}{2}\\sqrt{2}$", { color: "#047857", size: 9.5, align: "center" })}
`
);

export const DIAG_PK_TRIGONOMETRI = svgFigure(
  "pk-trig",
  "Segitiga Istimewa & Tanda Kuadran I–IV Trigonometri",
  "Semua Sindikat Tangan Kosong: I (All$+$), II ($\\sin+$), III ($\\tan+$), IV ($\\cos+$)",
  560,
  214,
  `
<polygon points="36,166 156,166 156,96" fill="#dbeafe" fill-opacity="0.55" stroke="#2563eb" stroke-width="2"/>
<rect x="148" y="158" width="8" height="8" fill="none" stroke="#2563eb"/>
${svgTex(54, 145, 30, 18, "$30^\\circ$", { color: "#1e3a8a", size: 10, align: "left", bold: true })}
${svgTex(72, 169, 48, 22, "$\\sqrt{3}$", { color: "#0f172a", size: 11, align: "center", bold: true })}
${svgTex(160, 122, 18, 20, "$1$", { color: "#0f172a", size: 11, align: "left", bold: true })}
${svgTex(76, 108, 20, 20, "$2$", { color: "#be123c", size: 11, align: "center", bold: true })}
<polygon points="200,166 286,166 286,80" fill="#ecfdf5" fill-opacity="0.55" stroke="#059669" stroke-width="2"/>
<rect x="278" y="158" width="8" height="8" fill="none" stroke="#059669"/>
${svgTex(216, 145, 30, 18, "$45^\\circ$", { color: "#065f46", size: 10, align: "left", bold: true })}
${svgTex(233, 169, 20, 20, "$1$", { color: "#0f172a", size: 11, align: "center", bold: true })}
${svgTex(290, 114, 18, 20, "$1$", { color: "#0f172a", size: 11, align: "left", bold: true })}
${svgTex(218, 98, 42, 22, "$\\sqrt{2}$", { color: "#047857", size: 11, align: "center", bold: true })}
<line x1="336" y1="56" x2="336" y2="200" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 3"/>
<line x1="364" y1="126" x2="532" y2="126" stroke="#334155" stroke-width="1.6"/>
<line x1="448" y1="62" x2="448" y2="192" stroke="#334155" stroke-width="1.6"/>
<rect x="454" y="66" width="76" height="54" rx="6" fill="#ecfdf5"/><text x="492" y="88" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">Kuadran I</text>${svgTex(454, 93, 76, 20, "SEMUA ($+$)", { color: "#047857", size: 10, align: "center" })}
<rect x="366" y="66" width="76" height="54" rx="6" fill="#eff6ff"/><text x="404" y="88" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">Kuadran II</text>${svgTex(366, 93, 76, 20, "$\\sin\\,(+)$", { color: "#1d4ed8", size: 10.5, align: "center" })}
<rect x="366" y="132" width="76" height="54" rx="6" fill="#fefce8"/><text x="404" y="154" text-anchor="middle" fill="#854d0e" font-size="11" font-weight="700">Kuadran III</text>${svgTex(366, 159, 76, 20, "$\\tan\\,(+)$", { color: "#b45309", size: 10.5, align: "center" })}
<rect x="454" y="132" width="76" height="54" rx="6" fill="#f3e8ff"/><text x="492" y="154" text-anchor="middle" fill="#5b21b6" font-size="11" font-weight="700">Kuadran IV</text>${svgTex(454, 159, 76, 20, "$\\cos\\,(+)$", { color: "#6d28d9", size: 10.5, align: "center" })}
`
);

export const DIAG_PK_STAT_PELUANG = svgFigure(
  "pk-stpl",
  "Efek Transformasi Linear Data & Pemilihan Rumus Permutasi vs Kombinasi",
  "Penambahan konstanta ($+q$) menggeser rataan/median saja; perkalian ($p$) mengubah ukuran sebaran",
  560,
  210,
  `
<rect x="20" y="60" width="256" height="134" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
${svgTex(24, 65, 248, 22, "Transformasi Data: $y_i = p\\,x_i + q$", { color: "#1e3a8a", size: 11, align: "center", bold: true })}
<text x="32" y="103" fill="#0f172a" font-size="10.5" font-weight="700">Ukuran Pusat (Mean, Median, Modus):</text>
${svgTex(30, 108, 236, 20, "$\\to$ Terpengaruh $\\times p$ DAN $+ q$", { color: "#1d4ed8", size: 10.5, align: "left", bold: true })}
<text x="32" y="143" fill="#0f172a" font-size="10.5" font-weight="700">Ukuran Sebaran (Jangkauan, Simp. Baku):</text>
${svgTex(30, 148, 240, 20, "$\\to$ HANYA dikali $|p|$ ($+q$ tdk ngaruh!)", { color: "#be123c", size: 10, align: "left", bold: true })}
${svgTex(30, 169, 236, 18, "Variansi ($s^2$) dikalikan $p^2$", { color: "#64748b", size: 9.5, align: "left" })}
<rect x="290" y="60" width="250" height="134" rx="8" fill="#ecfdf5" stroke="#10b981"/>
<text x="415" y="80" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Kapan Permutasi vs Kombinasi?</text>
${svgTex(298, 90, 236, 20, "Urutan Penting ($AB \\ne BA$) $\\to P(n,r)$", { color: "#047857", size: 10, align: "left", bold: true })}
<text x="302" y="120" fill="#334155" font-size="10">Contoh: Ketua-Sekretaris, susunan angka</text>
${svgTex(298, 132, 236, 20, "Urutan Acak ($AB = BA$) $\\to C(n,r)$", { color: "#1d4ed8", size: 10, align: "left", bold: true })}
<text x="302" y="160" fill="#334155" font-size="10">Contoh: Jabat tangan, memilih tim 3 orang</text>
${svgTex(298, 168, 236, 20, "Saling Lepas: $+$ | Bebas: $\\times P(B)$", { color: "#854d0e", size: 9.5, align: "left", bold: true })}
`
);
