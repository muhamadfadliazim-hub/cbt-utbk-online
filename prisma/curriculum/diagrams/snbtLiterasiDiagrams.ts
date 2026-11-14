import { svgFigure, svgTex } from "./svgHelper";

// ==================== 1. LITERASI BAHASA INDONESIA (LBI) — 4 DIAGRAM ====================

export const DIAG_LBI_FAKTA_OPINI = svgFigure(
  "lbi-fo",
  "Membedakan Fakta Terverifikasi, Opini & Inferensi Teks LBI",
  "Gagasan utama merangkum seluruh paragraf; inferensi harus berakar pada bukti teks",
  560,
  205,
  `
<rect x="22" y="60" width="166" height="128" rx="10" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
<text x="105" y="81" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">FAKTA (Objektif)</text>
<text x="32" y="102" fill="#334155" font-size="10">- Terjadi nyata, terukur</text>
<text x="32" y="118" fill="#334155" font-size="10">- Tanggal, tempat, angka,</text>
<text x="32" y="133" fill="#334155" font-size="10">  data BPS/riset</text>
<text x="32" y="156" fill="#047857" font-size="10" font-weight="700">Cth: "Suhu naik 1,1°C</text>
<text x="32" y="170" fill="#047857" font-size="10">sejak 1880 (BMKG)."</text>
<rect x="197" y="60" width="166" height="128" rx="10" fill="#fff7ed" stroke="#f97316" stroke-width="1.5"/>
<text x="280" y="81" text-anchor="middle" fill="#9a3412" font-size="11.5" font-weight="700">OPINI (Subjektif)</text>
<text x="207" y="102" fill="#334155" font-size="10">- Penilaian/saran penulis</text>
<text x="207" y="118" fill="#334155" font-size="10">- Penanda: harus, perlu,</text>
<text x="207" y="133" fill="#334155" font-size="10">  sangat, terbaik, diduga</text>
<text x="207" y="156" fill="#c2410c" font-size="10" font-weight="700">Cth: "Kebijakan ini</text>
<text x="207" y="170" fill="#c2410c" font-size="10">seharusnya segera direvisi."</text>
<rect x="372" y="60" width="166" height="128" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
<text x="455" y="81" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">INFERENSI SAH</text>
<text x="382" y="102" fill="#334155" font-size="10">- Tidak tertulis harfiah,</text>
<text x="382" y="118" fill="#334155" font-size="10">  tapi ditarik lurus dari</text>
<text x="382" y="133" fill="#334155" font-size="10">  premis dalam bacaan</text>
<text x="382" y="156" fill="#be123c" font-size="10" font-weight="700">Tolak opsi ekstrem:</text>
<text x="382" y="170" fill="#be123c" font-size="10">"selalu / mustahil / pasti"</text>
`
);

export const DIAG_LBI_GRAFIK_SIKAP = svgFigure(
  "lbi-graf",
  "Strategi Membaca Grafik Eksperimen Sains & Sikap Penulis",
  "Periksa label sumbu Y, satuan, titik potong/anomali kurva sebelum membaca pilihan jawaban",
  560,
  210,
  `
<line x1="62" y1="170" x2="270" y2="170" stroke="#475569" stroke-width="1.5"/>
<line x1="62" y1="62" x2="62" y2="170" stroke="#475569" stroke-width="1.5"/>
<text x="44" y="72" text-anchor="middle" fill="#64748b" font-size="9.5">Laju</text>
<text x="166" y="186" text-anchor="middle" fill="#64748b" font-size="9.5">Konsentrasi Substrat [S]</text>
<path d="M62,168 Q96,96 144,86 L254,84" fill="none" stroke="#2563eb" stroke-width="2.4"/>
<path d="M62,168 Q120,138 178,120 L254,116" fill="none" stroke="#be123c" stroke-width="2.2" stroke-dasharray="5 3"/>
<circle cx="144" cy="86" r="4" fill="#2563eb"/>
<text x="152" y="77" fill="#1e3a8a" font-size="9.5" font-weight="700">Titik Jenuh (Vmax)</text>
<text x="180" y="134" fill="#be123c" font-size="9.5" font-weight="700">+ Inhibitor</text>
<rect x="292" y="60" width="248" height="130" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<text x="416" y="80" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">4 Langkah Cepat Baca Grafik LBI</text>
<text x="304" y="102" fill="#1d4ed8" font-size="10.5" font-weight="700">1. Cek Satuan: %, ton, mg/L, ribuan?</text>
<text x="304" y="122" fill="#047857" font-size="10.5" font-weight="700">2. Baca Tren: naik tajam, landai, datar?</text>
<text x="304" y="142" fill="#b45309" font-size="10.5" font-weight="700">3. Kelompokkan Diksi Sikap Penulis:</text>
<text x="314" y="157" fill="#334155" font-size="9.5">Kritis (ironis), Optimis (mendukung), Netral</text>
<text x="304" y="177" fill="#be123c" font-size="10">4. Hindari kesimpulan di luar rentang grafik</text>
`
);

export const DIAG_LBI_SASTRA = svgFigure(
  "lbi-sas",
  "Kurva Alur Freytag & Unsur Intrinsik Teks Sastra",
  "Ketegangan konflik bergerak dari pengenalan menuju klimaks sebelum penyelesaian",
  560,
  205,
  `
<polyline points="42,164 134,158 264,74 364,132 454,156" fill="none" stroke="#1d4ed8" stroke-width="2.5"/>
<circle cx="42" cy="164" r="5" fill="#1e3a8a"/>
<circle cx="134" cy="158" r="5" fill="#2563eb"/>
<circle cx="264" cy="74" r="6" fill="#be123c"/>
<circle cx="364" cy="132" r="5" fill="#059669"/>
<circle cx="454" cy="156" r="5" fill="#047857"/>
<text x="58" y="182" text-anchor="middle" fill="#1e3a8a" font-size="10" font-weight="700">1. Eksposisi</text>
<text x="148" y="178" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="700">2. Konflik Naik</text>
<text x="264" y="63" text-anchor="middle" fill="#be123c" font-size="11" font-weight="700">3. KLIMAKS (Puncak)</text>
<text x="374" y="118" text-anchor="middle" fill="#059669" font-size="10" font-weight="700">4. Antiklimaks</text>
<text x="462" y="178" text-anchor="middle" fill="#047857" font-size="10" font-weight="700">5. Resolusi</text>
<rect x="336" y="60" width="204" height="54" rx="8" fill="#fefce8" stroke="#eab308"/>
<text x="438" y="78" text-anchor="middle" fill="#854d0e" font-size="10.5" font-weight="700">Sudut Pandang &amp; Majas</text>
<text x="438" y="94" text-anchor="middle" fill="#334155" font-size="9.5">Aku (I) vs Dia Serbatahu (III)</text>
<text x="438" y="107" text-anchor="middle" fill="#334155" font-size="9.5">Metafora, Personifikasi, Ironi</text>
`
);

export const DIAG_LBI_DUA_TEKS = svgFigure(
  "lbi-2t",
  "Matriks Sintesis Perbandingan Dua Teks & Amanat",
  "Cari irisan topik yang disepakati bersama serta letak pertentangan sudut pandang",
  560,
  205,
  `
<circle cx="152" cy="126" r="58" fill="#3b82f6" fill-opacity="0.18" stroke="#2563eb" stroke-width="1.8"/>
<circle cx="242" cy="126" r="58" fill="#10b981" fill-opacity="0.18" stroke="#059669" stroke-width="1.8"/>
<text x="115" y="122" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">TEKS 1</text>
<text x="115" y="138" text-anchor="middle" fill="#334155" font-size="9.5">Sebab / Teori</text>
<text x="279" y="122" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">TEKS 2</text>
<text x="279" y="138" text-anchor="middle" fill="#334155" font-size="9.5">Dampak / Kasus</text>
<text x="197" y="123" text-anchor="middle" fill="#0f172a" font-size="10.5" font-weight="700">Irisan</text>
<text x="197" y="137" text-anchor="middle" fill="#0f172a" font-size="9.5">Isu Inti</text>
<rect x="330" y="62" width="210" height="126" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<text x="435" y="82" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">Pola Hubungan Dua Teks</text>
<text x="342" y="104" fill="#047857" font-size="10.5" font-weight="700">1. Menguatkan:</text>
<text x="342" y="118" fill="#334155" font-size="9.5">Teks 2 beri bukti empiris Teks 1</text>
<text x="342" y="138" fill="#1d4ed8" font-size="10.5" font-weight="700">2. Melengkapi:</text>
<text x="342" y="152" fill="#334155" font-size="9.5">Aspek baru (sosial vs ekonomi)</text>
<text x="342" y="172" fill="#be123c" font-size="10.5" font-weight="700">3. Bertentangan (Kontras):</text>
<text x="342" y="185" fill="#334155" font-size="9.5">Beda kesimpulan / kritik solusi</text>
`
);

// ==================== 2. LITERASI BAHASA INGGRIS (LBE) — 4 DIAGRAM ====================

export const DIAG_LBE_TOPIC = svgFigure(
  "lbe-top",
  "Paragraph Architecture: Topic, Main Idea & Organization",
  "Generalization test: Too Broad vs Just Right (Main Idea) vs Too Narrow (Detail)",
  560,
  205,
  `
<rect x="24" y="60" width="248" height="128" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="148" y="81" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">3-Level Hierarchy of Meaning</text>
<rect x="44" y="92" width="208" height="24" rx="6" fill="#1d4ed8"/>
<text x="148" y="108" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">TOPIC (1-3 words: Noun Phrase)</text>
<rect x="44" y="122" width="208" height="24" rx="6" fill="#3b82f6"/>
<text x="148" y="138" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">MAIN IDEA (Topic + Author's Claim)</text>
<rect x="44" y="152" width="208" height="24" rx="6" fill="#bfdbfe"/>
<text x="148" y="168" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="700">DETAILS (Dates, Examples, Stats)</text>
<rect x="290" y="60" width="248" height="128" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<text x="414" y="81" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">Common Passage Organizations</text>
<text x="302" y="103" fill="#047857" font-size="10.5" font-weight="700">- Problem -&gt; Solution</text>
<text x="302" y="122" fill="#1d4ed8" font-size="10.5" font-weight="700">- Cause -&gt; Effect / Mechanism</text>
<text x="302" y="141" fill="#854d0e" font-size="10.5" font-weight="700">- General Claim -&gt; Specific Studies</text>
<text x="302" y="160" fill="#be123c" font-size="10.5" font-weight="700">- Compare &amp; Contrast (Whereas...)</text>
<text x="302" y="179" fill="#475569" font-size="9.5">Eliminate options that cover only 1 paragraph!</text>
`
);

export const DIAG_LBE_INFERENCE = svgFigure(
  "lbe-inf",
  "The Iceberg Model: Literal Text vs Logical Inference & Tone",
  "Never import outside assumptions; a valid inference must stay 1 step below the text",
  560,
  205,
  `
<rect x="24" y="60" width="236" height="62" rx="8" fill="#dbeafe" stroke="#2563eb"/>
<text x="142" y="80" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">EXPLICIT TEXT (Above Surface)</text>
<text x="142" y="98" text-anchor="middle" fill="#334155" font-size="10">Literally stated facts &amp; dates</text>
<text x="142" y="112" text-anchor="middle" fill="#1d4ed8" font-size="9.5">"Only 12% of clinics had cold storage."</text>
<line x1="20" y1="127" x2="264" y2="127" stroke="#0284c7" stroke-width="2" stroke-dasharray="5 3"/>
<rect x="24" y="132" width="236" height="58" rx="8" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.5"/>
<text x="142" y="151" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">VALID INFERENCE (Implied)</text>
<text x="142" y="168" text-anchor="middle" fill="#047857" font-size="10">"Most clinics (88%) lacked adequate</text>
<text x="142" y="182" text-anchor="middle" fill="#047857" font-size="10">vaccine refrigeration infrastructure."</text>
<rect x="280" y="60" width="258" height="130" rx="10" fill="#fefce8" stroke="#eab308"/>
<text x="409" y="81" text-anchor="middle" fill="#854d0e" font-size="11.5" font-weight="700">Author's Attitude / Tone Spectrum</text>
<rect x="296" y="96" width="226" height="22" rx="6" fill="#ffffff" stroke="#e2e8f0"/>
<text x="330" y="111" text-anchor="middle" fill="#be123c" font-size="10" font-weight="700">Critical</text>
<text x="409" y="111" text-anchor="middle" fill="#475569" font-size="10" font-weight="700">Objective</text>
<text x="488" y="111" text-anchor="middle" fill="#047857" font-size="10" font-weight="700">Advocating</text>
<text x="294" y="138" fill="#334155" font-size="10">Check adjectives &amp; modals:</text>
<text x="294" y="154" fill="#1d4ed8" font-size="10">- "Cautious / Skeptical" (however, may)</text>
<text x="294" y="170" fill="#be123c" font-size="10">- "Concerned / Urgent" (alarming, must)</text>
<text x="294" y="184" fill="#475569" font-size="9.5">- Pronoun ref: plug candidate back in!</text>
`
);

export const DIAG_LBE_FORUM = svgFigure(
  "lbe-for",
  "Multi-Author Discussion Thread Mapping Matrix",
  "Tag each commenter's stance immediately (Support / Cautious / Oppose) before reading questions",
  560,
  205,
  `
<rect x="24" y="60" width="512" height="32" rx="8" fill="#f1f5f9" stroke="#94a3b8"/>
<text x="280" y="80" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">THREAD PROMPT: "Should Cities Ban Private Cars Downtown?"</text>
<rect x="24" y="102" width="162" height="86" rx="8" fill="#ecfdf5" stroke="#10b981"/>
<text x="105" y="121" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">User A (Pro-Ban)</text>
<text x="34" y="139" fill="#334155" font-size="9.5">Tone: Enthusiastic</text>
<text x="34" y="154" fill="#334155" font-size="9.5">Point: Cuts emissions &amp;</text>
<text x="34" y="168" fill="#334155" font-size="9.5">boosts foot traffic</text>
<text x="34" y="182" fill="#047857" font-size="9.5" font-weight="700">+ Evidence: Oslo data</text>
<rect x="199" y="102" width="162" height="86" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<text x="280" y="121" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">User B (Conditional)</text>
<text x="209" y="139" fill="#334155" font-size="9.5">Tone: Pragmatic</text>
<text x="209" y="154" fill="#334155" font-size="9.5">Point: Only works if</text>
<text x="209" y="168" fill="#334155" font-size="9.5">transit is reliable first</text>
<text x="209" y="182" fill="#1d4ed8" font-size="9.5" font-weight="700">Key: "Provided that..."</text>
<rect x="374" y="102" width="162" height="86" rx="8" fill="#fff1f2" stroke="#f43f5e"/>
<text x="455" y="121" text-anchor="middle" fill="#9f1239" font-size="11" font-weight="700">User C (Skeptical)</text>
<text x="384" y="139" fill="#334155" font-size="9.5">Tone: Critical</text>
<text x="384" y="154" fill="#334155" font-size="9.5">Point: Hurts disabled &amp;</text>
<text x="384" y="168" fill="#334155" font-size="9.5">small cargo deliveries</text>
<text x="384" y="182" fill="#be123c" font-size="9.5" font-weight="700">Counter to User A</text>
`
);

export const DIAG_LBE_PAIRED = svgFigure(
  "lbe-pair",
  "Paired Passages Synthesis & Paragraph Transition Bridge",
  "Focus on how Text 2 responds to Text 1 (Supports, Qualifies, or Refutes)",
  560,
  205,
  `
<rect x="24" y="62" width="186" height="80" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
<text x="117" y="83" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">PASSAGE 1 (Hypothesis)</text>
<text x="117" y="102" text-anchor="middle" fill="#334155" font-size="10">Broad trend / classical model</text>
<text x="117" y="122" text-anchor="middle" fill="#1d4ed8" font-size="9.5" font-weight="700">End sentence = Transition Cue</text>
<line x1="212" y1="102" x2="254" y2="102" stroke="#1d4ed8" stroke-width="2" marker-end="url(#arr-lbe-pair)"/>
<rect x="258" y="62" width="120" height="80" rx="10" fill="#fefce8" stroke="#eab308"/>
<text x="318" y="84" text-anchor="middle" fill="#854d0e" font-size="11" font-weight="700">LINK TYPE</text>
<text x="318" y="103" text-anchor="middle" fill="#047857" font-size="10">Corroborates</text>
<text x="318" y="118" text-anchor="middle" fill="#b45309" font-size="10">Qualifies</text>
<text x="318" y="133" text-anchor="middle" fill="#be123c" font-size="10">Challenges</text>
<line x1="380" y1="102" x2="420" y2="102" stroke="#047857" stroke-width="2" marker-end="url(#arr-emerald-lbe-pair)"/>
<rect x="424" y="62" width="114" height="80" rx="10" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
<text x="481" y="83" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">PASSAGE 2</text>
<text x="481" y="102" text-anchor="middle" fill="#334155" font-size="10">New data /</text>
<text x="481" y="117" text-anchor="middle" fill="#334155" font-size="10">case study</text>
<text x="481" y="132" text-anchor="middle" fill="#047857" font-size="9.5" font-weight="700">or exception</text>
<rect x="24" y="152" width="514" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
<text x="281" y="170" text-anchor="middle" fill="#0f172a" font-size="10.5" font-weight="700">Paragraph Preceding/Following Question Rule:</text>
<text x="281" y="185" text-anchor="middle" fill="#475569" font-size="10">Preceding -&gt; match 1st sentence of Passage | Following -&gt; match last sentence of Passage</text>
`
);

// ==================== 3. PENALARAN MATEMATIKA (PM) — 5 DIAGRAM ====================

export const DIAG_PM_TARIF = svgFigure(
  "pm-tar",
  "Model Tarif Progresif Bertingkat & Diskon Beruntun Nyata",
  "Hitung biaya per lapisan blok (jangan kalikan seluruh pemakaian dengan tarif tertinggi!)",
  560,
  218,
  `
<line x1="56" y1="170" x2="296" y2="170" stroke="#475569" stroke-width="1.5"/>
<line x1="56" y1="62" x2="56" y2="170" stroke="#475569" stroke-width="1.5"/>
<rect x="66" y="140" width="68" height="30" fill="#bfdbfe" stroke="#2563eb"/>
<rect x="134" y="110" width="68" height="60" fill="#60a5fa" stroke="#2563eb"/>
<rect x="202" y="76" width="84" height="94" fill="#2563eb" stroke="#1e3a8a"/>
${svgTex(66, 146, 68, 20, "$0\\text{–}10\\text{ m}^3$", { color: "#1e3a8a", size: 9.5, align: "center", bold: true })}
<text x="100" y="134" text-anchor="middle" fill="#1e3a8a" font-size="9.5" font-weight="700">Rp3rb</text>
${svgTex(134, 130, 68, 20, "$11\\text{–}20\\text{ m}^3$", { color: "#ffffff", size: 9.5, align: "center", bold: true })}
<text x="168" y="104" text-anchor="middle" fill="#1e3a8a" font-size="9.5" font-weight="700">Rp5rb</text>
${svgTex(202, 114, 84, 20, "$\\gt 20\\text{ m}^3$", { color: "#ffffff", size: 9.5, align: "center", bold: true })}
<text x="244" y="70" text-anchor="middle" fill="#1e3a8a" font-size="9.5" font-weight="700">Rp8rb</text>
${svgTex(16, 178, 304, 24, "Pakai $25\\text{ m}^3 = 10(3\\text{rb}) + 10(5\\text{rb}) + 5(8\\text{rb}) = \\text{Rp}120\\text{rb}$", { color: "#334155", size: 9.2, align: "center" })}
<rect x="318" y="60" width="222" height="136" rx="10" fill="#ecfdf5" stroke="#10b981"/>
<text x="429" y="81" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Bunga &amp; Diskon Bertingkat</text>
${svgTex(330, 92, 198, 20, "Diskon $d_1$ lalu $d_2$:", { color: "#0f172a", size: 10.5 })}
${svgTex(330, 112, 202, 22, "$\\text{Bayar} = P(1 - d_1)(1 - d_2)$", { color: "#047857", size: 10.5, bold: true })}
<text x="330" y="148" fill="#0f172a" font-size="10.5">Untung/Rugi selalu berbasis</text>
<text x="330" y="164" fill="#be123c" font-size="10.5" font-weight="700">HARGA BELI (Modal),</text>
<text x="330" y="180" fill="#475569" font-size="10">bukan dari harga jual berlabel!</text>
`
);

export const DIAG_PM_KECEPATAN = svgFigure(
  "pm-kec",
  "Model Vektor Gerak: Berpapasan vs Menyusul & Laju Debit Pipa",
  "Berpapasan menjumlahkan kecepatan ($v_1 + v_2$); menyusul menggunakan selisih ($v_2 - v_1$)",
  560,
  232,
  `
<rect x="20" y="56" width="256" height="74" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<text x="148" y="73" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="700">1. Berpapasan (Arah Berlawanan)</text>
<line x1="42" y1="92" x2="122" y2="92" stroke="#2563eb" stroke-width="2.5" marker-end="url(#arr-pm-kec)"/>
<line x1="254" y1="92" x2="174" y2="92" stroke="#be123c" stroke-width="2.5" marker-end="url(#arr-rose-pm-kec)"/>
${svgTex(66, 74, 28, 16, "$v_1$", { color: "#1d4ed8", size: 10, align: "center", bold: true })}
${svgTex(202, 74, 28, 16, "$v_2$", { color: "#be123c", size: 10, align: "center", bold: true })}
${svgTex(28, 98, 240, 28, "$t_{\\text{papas}} = \\frac{S_{\\text{sisa}}}{v_1 + v_2}$", { color: "#0f172a", size: 10.2, align: "center", bold: true })}
<rect x="20" y="138" width="256" height="76" rx="8" fill="#ecfdf5" stroke="#10b981"/>
<text x="148" y="155" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700">2. Menyusul (Arah Sama)</text>
<line x1="42" y1="175" x2="146" y2="175" stroke="#059669" stroke-width="2.5" marker-end="url(#arr-emerald-pm-kec)"/>
<line x1="158" y1="175" x2="236" y2="175" stroke="#475569" stroke-width="2.5" marker-end="url(#arr-dark-pm-kec)"/>
${svgTex(60, 157, 60, 16, "$v_{\\text{susul}}$", { color: "#047857", size: 9.8, align: "center", bold: true })}
${svgTex(165, 157, 60, 16, "$v_{\\text{depan}}$", { color: "#475569", size: 9.8, align: "center", bold: true })}
${svgTex(28, 181, 240, 28, "$t_{\\text{susul}} = \\frac{\\text{Jarak Awal}}{v_{\\text{susul}} - v_{\\text{depan}}}$", { color: "#0f172a", size: 10, align: "center", bold: true })}
<rect x="292" y="56" width="248" height="158" rx="10" fill="#fefce8" stroke="#eab308"/>
<text x="416" y="76" text-anchor="middle" fill="#854d0e" font-size="11.5" font-weight="700">Kerja Bersama &amp; Debit Pipa</text>
${svgTex(302, 83, 228, 30, "$\\frac{1}{t_{\\text{total}}} = \\frac{1}{t_A} + \\frac{1}{t_B} - \\frac{1}{t_{\\text{bocor}}}$", { color: "#0f172a", size: 10.5, align: "center", bold: true })}
<text x="306" y="128" fill="#334155" font-size="10">- Pipa isi bertanda POSITIF (+)</text>
<text x="306" y="143" fill="#be123c" font-size="10">- Pipa bocor/kuras bertanda NEGATIF (-)</text>
${svgTex(304, 151, 226, 28, "$v_{\\text{rata}} = \\frac{\\text{Total Jarak}}{\\text{Total Waktu}}$", { color: "#1d4ed8", size: 10.2, bold: true })}
${svgTex(304, 181, 226, 28, "(Bukan $\\frac{v_1 + v_2}{2}$ untuk jarak sama!)", { color: "#be123c", size: 9.5 })}
`
);

export const DIAG_PM_WADAH = svgFigure(
  "pm-wad",
  "Kenaikan Muka Air Benda Tenggelam & Lintasan Terpendek Tabung",
  "Volume benda tercelup = Volume kenaikan air; selimut tabung dibuka menjadi persegi panjang",
  560,
  218,
  `
<rect x="46" y="82" width="110" height="98" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
<rect x="48" y="124" width="106" height="54" fill="#93c5fd" fill-opacity="0.45"/>
<rect x="48" y="102" width="106" height="22" fill="#3b82f6" fill-opacity="0.35" stroke="#2563eb" stroke-dasharray="3 2"/>
<circle cx="101" cy="154" r="14" fill="#475569"/>
<line x1="164" y1="102" x2="164" y2="124" stroke="#be123c" stroke-width="2"/>
${svgTex(170, 104, 34, 18, "$\\Delta h$", { color: "#be123c", size: 10.5, bold: true })}
${svgTex(20, 184, 186, 22, "$\\text{Luas Alas} \\times \\Delta h = V_{\\text{bola}}$", { color: "#1e3a8a", size: 10.2, align: "center", bold: true })}
<line x1="252" y1="56" x2="252" y2="202" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="400" y="70" text-anchor="middle" fill="#065f46" font-size="11.5" font-weight="700">Buka Selimut Tabung &#8594; Pythagoras!</text>
<rect x="292" y="86" width="196" height="84" fill="#ecfdf5" stroke="#059669" stroke-width="1.8"/>
<line x1="292" y1="170" x2="488" y2="86" stroke="#be123c" stroke-width="2.4"/>
<circle cx="292" cy="170" r="4" fill="#065f46"/>
<circle cx="488" cy="86" r="4" fill="#be123c"/>
${svgTex(268, 178, 250, 22, "Keliling Alas $= 2\\pi r$ (atau $\\pi r$ setengah)", { color: "#065f46", size: 10, align: "center", bold: true })}
${svgTex(496, 120, 20, 18, "$t$", { color: "#065f46", size: 11, bold: true })}
${svgTex(296, 102, 188, 26, "$S_{\\min} = \\sqrt{(2\\pi r)^2 + t^2}$", { color: "#be123c", size: 10.5, align: "center", bold: true })}
`
);

export const DIAG_PM_ELEVASI = svgFigure(
  "pm-elv",
  "Model Kesebangunan Bayangan Lampu & Sudut Elevasi/Depresi",
  "Tinggi benda & bayangan membentuk dua segitiga sebangun; elevasi diukur dari garis horizontal",
  560,
  222,
  `
<line x1="34" y1="164" x2="256" y2="164" stroke="#334155" stroke-width="1.8"/>
<line x1="56" y1="164" x2="56" y2="68" stroke="#1e3a8a" stroke-width="3"/>
<circle cx="56" cy="66" r="6" fill="#facc15" stroke="#ca8a04"/>
<line x1="148" y1="164" x2="148" y2="118" stroke="#059669" stroke-width="3"/>
<line x1="56" y1="66" x2="232" y2="164" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="4 3"/>
${svgTex(28, 104, 22, 18, "$H$", { color: "#1e3a8a", size: 10.5, align: "right", bold: true })}
${svgTex(124, 134, 20, 18, "$h$", { color: "#059669", size: 10.5, align: "right", bold: true })}
${svgTex(92, 166, 20, 18, "$d$", { color: "#334155", size: 10, align: "center" })}
${svgTex(150, 166, 86, 18, "$s$ (bayangan)", { color: "#be123c", size: 9.8, align: "center", bold: true })}
${svgTex(56, 184, 178, 30, "$\\frac{h}{H} = \\frac{s}{s + d}$", { color: "#1d4ed8", size: 10.5, align: "center", bold: true })}
<line x1="278" y1="56" x2="278" y2="206" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="415" y="70" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">Elevasi vs Depresi &amp; Gerak Roda</text>
<line x1="300" y1="146" x2="424" y2="146" stroke="#64748b" stroke-width="1.4" stroke-dasharray="3 2"/>
<line x1="300" y1="146" x2="412" y2="90" stroke="#2563eb" stroke-width="2"/>
<line x1="412" y1="90" x2="412" y2="146" stroke="#059669" stroke-width="1.6"/>
${svgTex(334, 128, 72, 18, "Elevasi $\\alpha$", { color: "#1d4ed8", size: 9.8, bold: true })}
${svgTex(415, 104, 62, 30, "$\\tan\\alpha = \\frac{y}{x}$", { color: "#059669", size: 9.8, bold: true })}
<circle cx="504" cy="114" r="24" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
<circle cx="504" cy="114" r="4" fill="#b45309"/>
${svgTex(434, 145, 120, 20, "$\\text{Jarak} = N \\cdot 2\\pi r$", { color: "#854d0e", size: 9.8, align: "center", bold: true })}
<text x="496" y="176" text-anchor="middle" fill="#475569" font-size="9.5">2 Gir menyatu:</text>
${svgTex(436, 181, 120, 20, "$N_1 r_1 = N_2 r_2$", { color: "#475569", size: 10, align: "center", bold: true })}
`
);

export const DIAG_PM_PERTUMBUHAN = svgFigure(
  "pm-pert",
  "Kurva Pertumbuhan Eksponensial vs Linear & Rata-Rata Gabungan",
  "Eksponensial berlipat tetap per selang waktu $T$ (bakteri/bunga majemuk)",
  560,
  216,
  `
<line x1="48" y1="170" x2="258" y2="170" stroke="#475569" stroke-width="1.5"/>
<line x1="48" y1="62" x2="48" y2="170" stroke="#475569" stroke-width="1.5"/>
<line x1="48" y1="156" x2="246" y2="110" stroke="#64748b" stroke-width="1.8" stroke-dasharray="4 3"/>
<path d="M48,156 Q146,150 186,122 T238,64" fill="none" stroke="#be123c" stroke-width="2.5"/>
${svgTex(164, 62, 86, 26, "$N_0 \\cdot r^{t/T}$", { color: "#be123c", size: 10.5, bold: true })}
${svgTex(180, 118, 86, 18, "Linear ($a + nb$)", { color: "#64748b", size: 9.5 })}
${svgTex(20, 178, 256, 26, "Cek periode $T$ sebelum hitung pangkat $\\frac{t}{T}$!", { color: "#334155", size: 9.5, align: "center" })}
<rect x="282" y="58" width="256" height="142" rx="10" fill="#eff6ff" stroke="#3b82f6"/>
<text x="410" y="79" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="700">Trik Kilat Rata-Rata Gabungan</text>
${svgTex(290, 88, 240, 22, "$n_1 : n_2 = |\\bar{x}_{\\text{gab}} - \\bar{x}_2| : |\\bar{x}_1 - \\bar{x}_{\\text{gab}}|$", { color: "#0f172a", size: 10.2, align: "center", bold: true })}
<rect x="304" y="118" width="212" height="26" rx="6" fill="#dbeafe"/>
${svgTex(306, 121, 56, 20, "$\\bar{x}_1=70$", { color: "#1e3a8a", size: 10, align: "center", bold: true })}
${svgTex(374, 121, 72, 20, "$\\bar{x}_{\\text{gab}}=78$", { color: "#be123c", size: 10, align: "center", bold: true })}
${svgTex(458, 121, 56, 20, "$\\bar{x}_2=90$", { color: "#065f46", size: 10, align: "center", bold: true })}
${svgTex(290, 150, 240, 22, "$n_1 : n_2 = (90-78) : (78-70) = 12 : 8 = 3 : 2$", { color: "#047857", size: 9.8, align: "center", bold: true })}
<text x="410" y="186" text-anchor="middle" fill="#475569" font-size="9.5">Jungkat-jungkit jarak berbanding terbalik jumlah!</text>
`
);

