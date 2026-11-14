import { svgFigure, svgTex } from "./svgHelper";

// ==================== TKA SMA SOSHUM — 10 DIAGRAM ====================

export const DIAG_EKO_PASAR = svgFigure(
  "eko-pas",
  "Kurva Keseimbangan Pasar (Demand vs Supply) & Pajak/Subsidi",
  "Pajak menggeser kurva penawaran ke kiri-atas (harga naik); subsidi menggeser ke kanan-bawah",
  560,
  218,
  `
<line x1="60" y1="176" x2="264" y2="176" stroke="#334155" stroke-width="1.6"/>
<line x1="60" y1="60" x2="60" y2="176" stroke="#334155" stroke-width="1.6"/>
${svgTex(36, 56, 20, 18, "$P$", { color: "#334155", size: 10.5, align: "right", bold: true })}
${svgTex(267, 166, 20, 18, "$Q$", { color: "#334155", size: 10.5, bold: true })}
<line x1="82" y1="78" x2="236" y2="160" stroke="#2563eb" stroke-width="2.4"/>
<line x1="82" y1="160" x2="236" y2="78" stroke="#059669" stroke-width="2.4"/>
<line x1="72" y1="144" x2="210" y2="70" stroke="#be123c" stroke-width="1.8" stroke-dasharray="4 3"/>
<circle cx="159" cy="119" r="4.5" fill="#0f172a"/>
<circle cx="144" cy="111" r="4" fill="#be123c"/>
<line x1="60" y1="119" x2="159" y2="119" stroke="#94a3b8" stroke-dasharray="3 2"/>
<line x1="159" y1="119" x2="159" y2="176" stroke="#94a3b8" stroke-dasharray="3 2"/>
${svgTex(239, 152, 20, 18, "$D$", { color: "#2563eb", size: 10.5, bold: true })}
${svgTex(239, 70, 20, 18, "$S$", { color: "#059669", size: 10.5, bold: true })}
${svgTex(214, 58, 66, 18, "$S'$ (+pajak)", { color: "#be123c", size: 10, bold: true })}
${svgTex(32, 110, 24, 18, "$P_e$", { color: "#0f172a", size: 10, align: "right", bold: true })}
${svgTex(145, 178, 28, 18, "$Q_e$", { color: "#0f172a", size: 10, align: "center", bold: true })}
<rect x="292" y="58" width="248" height="142" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
${svgTex(296, 65, 240, 26, "Elastisitas Harga ($|E| = \\frac{dQ}{dP} \\cdot \\frac{P}{Q}$)", { color: "#0f172a", size: 10.5, align: "center", bold: true })}
${svgTex(304, 96, 228, 20, "$|E| > 1$ : Elastis (barang mewah)", { color: "#be123c", size: 10.5, bold: true })}
${svgTex(304, 117, 228, 20, "$|E| < 1$ : Inelastis (beras, BBM, obat)", { color: "#1d4ed8", size: 10.5, bold: true })}
${svgTex(304, 138, 228, 20, "$|E| = 1$ : Uniter", { color: "#047857", size: 10.5, bold: true })}
${svgTex(304, 160, 228, 20, "Syarat pajak: $P_s' = f(Q) + t$", { color: "#334155", size: 10 })}
${svgTex(304, 178, 232, 18, "Surplus Konsumen di bawah $D$, di atas $P_e$", { color: "#334155", size: 10 })}
`
);

export const DIAG_EKO_MAKRO = svgFigure(
  "eko-mak",
  "Instrumen Kebijakan Moneter–Fiskal & Siklus Akuntansi Jasa/Dagang",
  "Mengendalikan inflasi (kontraktif) vs menstimulasi pertumbuhan ekonomi (ekspansif)",
  560,
  205,
  `
<rect x="20" y="60" width="256" height="128" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="148" y="81" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Atasi Inflasi (Kontraktif / Tight Money)</text>
<text x="32" y="103" fill="#0f172a" font-size="10.5" font-weight="700">Bank Indonesia (Moneter):</text>
<text x="32" y="119" fill="#1d4ed8" font-size="10">- Naikkan Suku Bunga &amp; GWM</text>
<text x="32" y="134" fill="#1d4ed8" font-size="10">- Jual SBI (Operasi Pasar Terbuka)</text>
<text x="32" y="156" fill="#0f172a" font-size="10.5" font-weight="700">Pemerintah (Fiskal):</text>
<text x="32" y="172" fill="#be123c" font-size="10">- Naikkan Pajak + Kurangi Belanja (APBN)</text>
<rect x="290" y="60" width="250" height="128" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="415" y="81" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Persamaan Dasar &amp; Saldo Normal Akuntansi</text>
<text x="415" y="102" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">HARTA = UTANG + MODAL</text>
<text x="302" y="124" fill="#047857" font-size="10.5" font-weight="700">Bertambah di DEBIT: Harta, Beban, Prive</text>
<text x="302" y="142" fill="#be123c" font-size="10.5" font-weight="700">Bertambah di KREDIT: Utang, Modal, Pendpt.</text>
<text x="302" y="164" fill="#334155" font-size="10">HPP = Pers. Awal + Pemb. Bersih - Pers. Akhir</text>
<text x="302" y="180" fill="#334155" font-size="10">Modal Akhir = Modal Awal + Laba - Prive</text>
`
);

export const DIAG_GEO_KONSEP = svgFigure(
  "geo-kon",
  "Tiga Pendekatan Geografi & Garis Kontur Peta Topografi",
  "Garis kontur rapat menandakan lereng curam; garis kontur renggang berarti landai",
  560,
  210,
  `
<ellipse cx="132" cy="126" rx="92" ry="54" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
<ellipse cx="122" cy="126" rx="64" ry="38" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
<ellipse cx="110" cy="126" rx="34" ry="20" fill="#6ee7b7" stroke="#047857" stroke-width="1.8"/>
<text x="110" y="130" text-anchor="middle" fill="#065f46" font-size="10" font-weight="700">300m</text>
<text x="166" y="130" text-anchor="middle" fill="#065f46" font-size="9.5" font-weight="700">200m</text>
<text x="206" y="130" text-anchor="middle" fill="#065f46" font-size="9.5" font-weight="700">100m</text>
${svgTex(6, 178, 252, 26, "Kiri rapat = curam | $CI = \\frac{1}{2000} \\times \\text{Skala}$", { color: "#334155", size: 9.8, align: "center" })}
<rect x="258" y="60" width="282" height="130" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="399" y="81" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">3 Pendekatan Analisis Geografi</text>
<text x="270" y="103" fill="#1d4ed8" font-size="10.5" font-weight="700">1. Keruangan (Spasial):</text>
<text x="270" y="118" fill="#334155" font-size="9.5">Fokus sebaran lokasi &amp; jarak fenomena alam</text>
<text x="270" y="138" fill="#047857" font-size="10.5" font-weight="700">2. Kelingkungan (Ekologi):</text>
<text x="270" y="153" fill="#334155" font-size="9.5">Interaksi aktivitas manusia dengan lingkungannya</text>
<text x="270" y="173" fill="#854d0e" font-size="10.5" font-weight="700">3. Kompleks Wilayah (Regional):</text>
<text x="270" y="186" fill="#334155" font-size="9.5">Gabungan antarwilayah + kekuatan interaksi (Gravitasi)</text>
`
);

export const DIAG_GEO_DINAMIKA = svgFigure(
  "geo-din",
  "Tiga Tipe Batas Lempeng Litosfer & Siklus Hidrologi",
  "Konvergen membentuk palung/gunung api; divergen pemekaran samudra; transform sesar",
  560,
  210,
  `
<rect x="20" y="60" width="256" height="130" rx="10" fill="#fff7ed" stroke="#f97316"/>
<text x="148" y="80" text-anchor="middle" fill="#9a3412" font-size="11.5" font-weight="700">Dinamika Pergerakan Lempeng</text>
<rect x="34" y="94" width="60" height="20" fill="#cbd5e1"/><rect x="116" y="94" width="60" height="20" fill="#94a3b8"/>
<line x1="60" y1="104" x2="98" y2="104" stroke="#be123c" stroke-width="2" marker-end="url(#arr-rose-geo-din)"/>
<line x1="150" y1="104" x2="112" y2="104" stroke="#be123c" stroke-width="2" marker-end="url(#arr-rose-geo-din)"/>
<text x="186" y="108" fill="#be123c" font-size="10" font-weight="700">Konvergen (Tabrak)</text>
<rect x="34" y="126" width="54" height="20" fill="#cbd5e1"/><rect x="122" y="126" width="54" height="20" fill="#94a3b8"/>
<line x1="88" y1="136" x2="52" y2="136" stroke="#1d4ed8" stroke-width="2" marker-end="url(#arr-geo-din)"/>
<line x1="122" y1="136" x2="158" y2="136" stroke="#1d4ed8" stroke-width="2" marker-end="url(#arr-geo-din)"/>
<text x="186" y="140" fill="#1d4ed8" font-size="10" font-weight="700">Divergen (Pisah)</text>
<rect x="34" y="158" width="142" height="20" fill="#e2e8f0" stroke="#64748b"/>
<line x1="105" y1="158" x2="105" y2="178" stroke="#0f172a" stroke-width="1.5"/>
<text x="186" y="172" fill="#475569" font-size="10" font-weight="700">Transform (Geser)</text>
<rect x="290" y="60" width="250" height="130" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="415" y="80" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Siklus Hidrologi &amp; Lapisan Atmosfer</text>
<circle cx="350" cy="112" r="14" fill="#e0f2fe" stroke="#0284c7"/>
<text x="350" y="115" text-anchor="middle" fill="#0369a1" font-size="9" font-weight="700">Kondensasi</text>
<path d="M320,162 Q335,134 342,126" fill="none" stroke="#1d4ed8" stroke-width="1.6" marker-end="url(#arr-geo-din)"/>
<path d="M366,112 L426,112" fill="none" stroke="#047857" stroke-width="1.6" marker-end="url(#arr-emerald-geo-din)"/>
<path d="M442,124 L442,158" fill="none" stroke="#2563eb" stroke-width="1.6" marker-end="url(#arr-geo-din)"/>
<text x="315" y="176" fill="#1d4ed8" font-size="9">Evaporasi</text>
<text x="396" y="106" fill="#047857" font-size="9">Adveksi</text>
<text x="450" y="145" fill="#2563eb" font-size="9">Presipitasi</text>
<text x="450" y="166" fill="#475569" font-size="9">Infiltrasi / Run-off</text>
${svgTex(295, 169, 240, 20, "Atmosfer: Troposfer (Cuaca) – Stratosfer ($\\text{O}_3$)", { color: "#1e3a8a", size: 9.5, align: "center", bold: true })}
`
);

export const DIAG_SOS_STRUKTUR = svgFigure(
  "sos-str",
  "Piramida Stratifikasi Sosial & Arah Mobilitas Sosial",
  "Stratifikasi membedakan posisi vertikal; diferensiasi sosial mengelompokkan sejajar",
  560,
  205,
  `
<polygon points="140,62 46,174 234,174" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/>
<line x1="108" y1="100" x2="172" y2="100" stroke="#1e3a8a" stroke-width="1.4"/>
<line x1="78" y1="136" x2="202" y2="136" stroke="#1e3a8a" stroke-width="1.4"/>
<text x="140" y="90" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="700">Upper Class</text>
<text x="140" y="122" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="700">Middle Class</text>
<text x="140" y="160" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="700">Lower Class</text>
<line x1="252" y1="158" x2="252" y2="74" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-emerald-sos-str)"/>
<text x="260" y="114" fill="#047857" font-size="9.5" font-weight="700">Climbing</text>
<rect x="316" y="60" width="222" height="128" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<text x="427" y="80" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">Syarat Interaksi &amp; Konflik</text>
<text x="328" y="102" fill="#1d4ed8" font-size="10.5" font-weight="700">1. Interaksi = Kontak + Komunikasi</text>
<text x="328" y="120" fill="#047857" font-size="10">2. Asosiatif: Kerja sama, Asimilasi</text>
<text x="328" y="137" fill="#be123c" font-size="10">3. Disosiatif: Persaingan, Konflik</text>
<text x="328" y="158" fill="#854d0e" font-size="10" font-weight="700">Diferensiasi (Horizontal):</text>
<text x="328" y="173" fill="#475569" font-size="9.5">Suku, agama, ras, jenis kelamin (setara)</text>
`
);

export const DIAG_SOS_PERUBAHAN = svgFigure(
  "sos-per",
  "Arah Perubahan Sosial & Penelitian Sosial (Kualitatif vs Kuantitatif)",
  "Memilih metode penelitian & dampak perubahan sosial berdasarkan fokus masalah",
  560,
  205,
  `
<rect x="20" y="60" width="256" height="128" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="148" y="80" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Bentuk Perubahan Sosial</text>
<text x="32" y="103" fill="#0f172a" font-size="10.5">- Evolusi (lambat) vs Revolusi (cepat)</text>
<text x="32" y="122" fill="#0f172a" font-size="10.5">- Direncanakan vs Tidak Direncanakan</text>
<text x="32" y="142" fill="#be123c" font-size="10.5" font-weight="700">Cultural Lag:</text>
<text x="32" y="157" fill="#334155" font-size="10">Teknologi melesat, mental/aturan tertinggal</text>
<text x="32" y="175" fill="#047857" font-size="10">Anomie: memudarnya norma masyarakat</text>
<rect x="290" y="60" width="250" height="128" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="415" y="80" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Penelitian Kuantitatif vs Kualitatif</text>
<text x="302" y="103" fill="#1d4ed8" font-size="10.5" font-weight="700">Kuantitatif:</text>
<text x="302" y="118" fill="#334155" font-size="10">Angka statistik, angket, uji hipotesis</text>
<text x="302" y="141" fill="#5b21b6" font-size="10.5" font-weight="700">Kualitatif:</text>
<text x="302" y="156" fill="#334155" font-size="10">Makna mendalam, wawancara, observasi</text>
<text x="302" y="177" fill="#854d0e" font-size="9.5" font-weight="700">Sampling acak berstrata vs purposif (tujuan)</text>
`
);

export const DIAG_SEJ_METODE = svgFigure(
  "sej-met",
  "Sumbu Berpikir Diakronis vs Sinkronis & Tahapan Penelitian Sejarah",
  "Diakronis memanjang dalam waktu; sinkronis melebar dalam ruang pada satu masa tertentu",
  560,
  205,
  `
<line x1="40" y1="92" x2="256" y2="92" stroke="#2563eb" stroke-width="2.5" marker-end="url(#arr-sej-met)"/>
<circle cx="148" cy="92" r="5" fill="#be123c"/>
<line x1="148" y1="62" x2="148" y2="170" stroke="#059669" stroke-width="2.5" marker-end="url(#arr-emerald-sej-met)"/>
<text x="148" y="185" text-anchor="middle" fill="#065f46" font-size="10.5" font-weight="700">SINKRONIS (Melebar di satu waktu)</text>
<text x="148" y="82" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="700">DIAKRONIS / KRONOLOGIS (Waktu t1 -&gt; t3)</text>
<rect x="282" y="60" width="256" height="130" rx="10" fill="#fefce8" stroke="#eab308"/>
<text x="410" y="80" text-anchor="middle" fill="#854d0e" font-size="11.5" font-weight="700">4 Langkah Penelitian Sejarah</text>
<text x="294" y="102" fill="#0f172a" font-size="10.5" font-weight="700">1. Heuristik: Kumpulkan sumber (primer/sek.)</text>
<text x="294" y="122" fill="#0f172a" font-size="10.5" font-weight="700">2. Verifikasi / Kritik Ekstern &amp; Intern</text>
<text x="304" y="137" fill="#475569" font-size="9.5">Ekstern = keaslian fisik; Intern = kredibilitas isi</text>
<text x="294" y="156" fill="#0f172a" font-size="10.5" font-weight="700">3. Interpretasi: Analisis &amp; sintesis fakta</text>
<text x="294" y="175" fill="#0f172a" font-size="10.5" font-weight="700">4. Historiografi: Penulisan kisah sejarah</text>
`
);

export const DIAG_SEJ_LINIMASA = svgFigure(
  "sej-lin",
  "Linimasa Pergerakan Nasional hingga Reformasi Indonesia",
  "Urutan kronologis tonggak kebangkitan, proklamasi, hingga dinamika ketatanegaraan",
  560,
  205,
  `
<line x1="34" y1="118" x2="526" y2="118" stroke="#1e3a8a" stroke-width="3"/>
<circle cx="64" cy="118" r="7" fill="#2563eb"/>
<circle cx="152" cy="118" r="7" fill="#2563eb"/>
<circle cx="246" cy="118" r="8" fill="#be123c"/>
<circle cx="338" cy="118" r="7" fill="#059669"/>
<circle cx="426" cy="118" r="7" fill="#d97706"/>
<circle cx="504" cy="118" r="7" fill="#7c3aed"/>
<text x="64" y="96" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">1908</text>
<text x="64" y="144" text-anchor="middle" fill="#334155" font-size="9.5">Budi Utomo</text>
<text x="64" y="157" text-anchor="middle" fill="#475569" font-size="9">Bangkit Nasional</text>
<text x="152" y="96" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">1928</text>
<text x="152" y="144" text-anchor="middle" fill="#334155" font-size="9.5">Sumpah</text>
<text x="152" y="157" text-anchor="middle" fill="#475569" font-size="9">Pemuda</text>
<text x="246" y="92" text-anchor="middle" fill="#be123c" font-size="12" font-weight="700">17/8/1945</text>
<text x="246" y="144" text-anchor="middle" fill="#be123c" font-size="10" font-weight="700">PROKLAMASI</text>
<text x="246" y="157" text-anchor="middle" fill="#475569" font-size="9">&amp; PPKI</text>
<text x="338" y="96" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">1950–59</text>
<text x="338" y="144" text-anchor="middle" fill="#334155" font-size="9.5">Demokrasi</text>
<text x="338" y="157" text-anchor="middle" fill="#475569" font-size="9">Liberal -&gt; Dekrit</text>
<text x="426" y="96" text-anchor="middle" fill="#b45309" font-size="11" font-weight="700">1966–98</text>
<text x="426" y="144" text-anchor="middle" fill="#334155" font-size="9.5">Orde Baru</text>
<text x="426" y="157" text-anchor="middle" fill="#475569" font-size="9">(Trilogi Pemb.)</text>
<text x="504" y="96" text-anchor="middle" fill="#5b21b6" font-size="11" font-weight="700">1998+</text>
<text x="504" y="144" text-anchor="middle" fill="#334155" font-size="9.5">Reformasi</text>
<text x="504" y="157" text-anchor="middle" fill="#475569" font-size="9">&amp; Otonomi</text>
`
);

export const DIAG_PKN_HIRARKI = svgFigure(
  "pkn-hir",
  "Hierarki Peraturan Perundang-undangan (UU No. 12 Tahun 2011)",
  "Aturan yang lebih rendah TIDAK boleh bertentangan dengan peraturan di atasnya (Lex Superior)",
  560,
  215,
  `
<rect x="176" y="56" width="208" height="22" rx="4" fill="#1e3a8a"/><text x="280" y="71" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">1. UUD NRI Tahun 1945</text>
<rect x="150" y="80" width="260" height="22" rx="4" fill="#2563eb"/><text x="280" y="95" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">2. Ketetapan MPR</text>
<rect x="124" y="104" width="312" height="22" rx="4" fill="#3b82f6"/><text x="280" y="119" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">3. Undang-Undang (UU) / Perppu</text>
<rect x="98" y="128" width="364" height="22" rx="4" fill="#059669"/><text x="280" y="143" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">4. Peraturan Pemerintah (PP)</text>
<rect x="72" y="152" width="416" height="22" rx="4" fill="#10b981"/><text x="280" y="167" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">5. Peraturan Presiden (Perpres)</text>
<rect x="46" y="176" width="468" height="22" rx="4" fill="#d97706"/><text x="280" y="191" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">6. Perda Provinsi  --&gt;  7. Perda Kabupaten/Kota</text>
`
);

export const DIAG_PKN_LEMBAGA = svgFigure(
  "pkn-lem",
  "Struktur Lembaga Negara Pasca Amandemen UUD NRI 1945",
  "Kedudukan sejajar dengan mekanisme saling mengawasi dan mengimbangi (Checks and Balances)",
  560,
  210,
  `
<rect x="200" y="58" width="160" height="28" rx="8" fill="#0f172a"/>
<text x="280" y="76" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">UUD NRI TAHUN 1945</text>
<rect x="24" y="102" width="114" height="44" rx="8" fill="#eff6ff" stroke="#2563eb"/>
<text x="81" y="121" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="700">MPR</text>
<text x="81" y="136" text-anchor="middle" fill="#334155" font-size="9">DPR + DPD (Sejajar)</text>
<rect x="150" y="102" width="120" height="44" rx="8" fill="#eff6ff" stroke="#2563eb"/>
<text x="210" y="121" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="700">DPR &amp; DPD</text>
<text x="210" y="136" text-anchor="middle" fill="#334155" font-size="9">Legislasi &amp; Anggaran</text>
<rect x="282" y="102" width="124" height="44" rx="8" fill="#ecfdf5" stroke="#059669"/>
<text x="344" y="121" text-anchor="middle" fill="#065f46" font-size="10.5" font-weight="700">PRESIDEN</text>
<text x="344" y="136" text-anchor="middle" fill="#334155" font-size="9">Eksekutif (5 tahun)</text>
<rect x="418" y="102" width="120" height="44" rx="8" fill="#fefce8" stroke="#d97706"/>
<text x="478" y="121" text-anchor="middle" fill="#854d0e" font-size="10.5" font-weight="700">MA, MK &amp; KY</text>
<text x="478" y="136" text-anchor="middle" fill="#334155" font-size="9">Kekuasaan Kehakiman</text>
<rect x="24" y="156" width="514" height="36" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
<text x="281" y="172" text-anchor="middle" fill="#0f172a" font-size="10.5" font-weight="700">MK: Uji UU terhadap UUD 1945 | MA: Uji aturan di bawah UU terhadap UU | BPK: Audit Keuangan</text>
<text x="281" y="186" text-anchor="middle" fill="#475569" font-size="9.5">Amandemen UUD 1945 (4x) mengakhiri supremasi MPR dan meniadakan DPA</text>
`
);

