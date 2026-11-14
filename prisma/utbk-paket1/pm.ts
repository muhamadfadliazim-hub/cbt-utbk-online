import { SeedQuestion } from "./pu";

const SVG_PM_VIP = `<svg viewBox="0 0 260 115" width="260" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="130" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="#0f172a">baris 4</text>
  <line x1="55" y1="30" x2="205" y2="30" stroke="#0f172a" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
  <line x1="72" y1="46" x2="188" y2="46" stroke="#0f172a" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
  <line x1="88" y1="62" x2="172" y2="62" stroke="#0f172a" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
  <line x1="102" y1="78" x2="158" y2="78" stroke="#1d4ed8" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
  <text x="130" y="99" text-anchor="middle" font-size="11" font-weight="600" fill="#1d4ed8">baris 1</text>
</svg>`;

const SVG_PM_BIANGLALA = `<svg viewBox="0 0 340 232" width="340" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <line x1="50" y1="204" x2="280" y2="204" stroke="#0f172a" stroke-width="1.3"/>
  <text x="155" y="221" text-anchor="middle" font-size="11" font-weight="600" fill="#0f172a">tanah</text>
  <line x1="155" y1="98" x2="106" y2="204" stroke="#0f172a" stroke-width="2.2"/>
  <line x1="155" y1="98" x2="204" y2="204" stroke="#0f172a" stroke-width="2.2"/>
  <circle cx="155" cy="98" r="76" fill="none" stroke="#0f172a" stroke-width="2"/>
  <line x1="155" y1="22" x2="155" y2="174" stroke="#334155" stroke-width="1"/>
  <line x1="79" y1="98" x2="231" y2="98" stroke="#334155" stroke-width="1"/>
  <line x1="117" y1="32.2" x2="193" y2="163.8" stroke="#334155" stroke-width="1"/>
  <line x1="193" y1="32.2" x2="117" y2="163.8" stroke="#334155" stroke-width="1"/>
  <line x1="89.2" y1="60" x2="220.8" y2="136" stroke="#334155" stroke-width="1"/>
  <line x1="220.8" y1="60" x2="89.2" y2="136" stroke="#334155" stroke-width="1"/>
  <rect x="151" y="21" width="8" height="7" fill="#fff" stroke="#0f172a"/>
  <rect x="151" y="175" width="8" height="7" fill="#fff" stroke="#0f172a"/>
  <rect x="75" y="95" width="7" height="7" fill="#fff" stroke="#0f172a"/>
  <rect x="229" y="95" width="7" height="7" fill="#fff" stroke="#0f172a"/>
  <rect x="189" y="30" width="7" height="7" fill="#fff" stroke="#0f172a"/>
  <rect x="113" y="30" width="7" height="7" fill="#fff" stroke="#0f172a"/>
  <rect x="218" y="57" width="7" height="7" fill="#fff" stroke="#0f172a"/>
  <rect x="85" y="57" width="7" height="7" fill="#fff" stroke="#0f172a"/>
  <rect x="218" y="133" width="7" height="7" fill="#fff" stroke="#0f172a"/>
  <rect x="85" y="133" width="7" height="7" fill="#fff" stroke="#0f172a"/>
  <rect x="189" y="161" width="7" height="7" fill="#fff" stroke="#0f172a"/>
  <rect x="113" y="161" width="7" height="7" fill="#fff" stroke="#0f172a"/>
  <circle cx="155" cy="98" r="3" fill="#0f172a"/>
  <text x="161" y="93" font-size="11" font-weight="700" font-style="italic" fill="#0f172a">O</text>
  <text x="155" y="196" text-anchor="middle" font-size="11" font-weight="700" font-style="italic" fill="#1d4ed8">A</text>
  <line x1="56" y1="98" x2="56" y2="174" stroke="#475569" stroke-width="1"/>
  <line x1="52" y1="98" x2="60" y2="98" stroke="#475569" stroke-width="1"/>
  <line x1="52" y1="174" x2="60" y2="174" stroke="#475569" stroke-width="1"/>
  <text x="48" y="140" text-anchor="end" font-size="11" font-weight="600" fill="#0f172a">10 m</text>
  <line x1="254" y1="98" x2="254" y2="204" stroke="#475569" stroke-width="1"/>
  <line x1="250" y1="98" x2="258" y2="98" stroke="#475569" stroke-width="1"/>
  <line x1="250" y1="204" x2="258" y2="204" stroke="#475569" stroke-width="1"/>
  <text x="262" y="155" font-size="11" font-weight="600" fill="#0f172a">12 m</text>
</svg>`;

const SVG_PM_KEDAI_MIE = `<svg viewBox="0 0 400 242" width="400" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <pattern id="miehatch-pm" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
      <rect width="5" height="5" fill="#eff6ff"/>
      <line x1="0" y1="0" x2="0" y2="5" stroke="#2563eb" stroke-width="1.6"/>
    </pattern>
  </defs>
  <text x="205" y="20" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">Penjualan dan Sisa Porsi Kedai Mie</text>
  <rect x="54" y="34" width="318" height="148" fill="none" stroke="#334155" stroke-width="1"/>
  <line x1="54" y1="176" x2="372" y2="176" stroke="#cbd5e1"/>
  <line x1="54" y1="121" x2="372" y2="121" stroke="#cbd5e1"/>
  <line x1="54" y1="66" x2="372" y2="66" stroke="#cbd5e1"/>
  <text x="46" y="179" text-anchor="end" font-size="10" fill="#475569">0</text>
  <text x="46" y="124" text-anchor="end" font-size="10" fill="#475569">50</text>
  <text x="46" y="69" text-anchor="end" font-size="10" fill="#475569">100</text>
  <rect x="74" y="88" width="16" height="88" fill="#cbd5e1" stroke="#334155"/>
  <rect x="92" y="167.2" width="16" height="8.8" fill="url(#miehatch-pm)" stroke="#1d4ed8"/>
  <text x="82" y="83" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0f172a">80</text>
  <text x="100" y="162" text-anchor="middle" font-size="9" font-weight="700" fill="#1d4ed8">8</text>
  <text x="91" y="198" text-anchor="middle" font-size="10.5" font-weight="600" fill="#0f172a">Sen</text>
  <rect x="136" y="71.5" width="16" height="104.5" fill="#cbd5e1" stroke="#334155"/>
  <rect x="154" y="169.4" width="16" height="6.6" fill="url(#miehatch-pm)" stroke="#1d4ed8"/>
  <text x="144" y="66.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0f172a">95</text>
  <text x="162" y="164" text-anchor="middle" font-size="9" font-weight="700" fill="#1d4ed8">6</text>
  <text x="153" y="198" text-anchor="middle" font-size="10.5" font-weight="600" fill="#0f172a">Sel</text>
  <rect x="198" y="77" width="16" height="99" fill="#cbd5e1" stroke="#334155"/>
  <rect x="216" y="165" width="16" height="11" fill="url(#miehatch-pm)" stroke="#1d4ed8"/>
  <text x="206" y="72" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0f172a">90</text>
  <text x="224" y="160" text-anchor="middle" font-size="9" font-weight="700" fill="#1d4ed8">10</text>
  <text x="215" y="198" text-anchor="middle" font-size="10.5" font-weight="600" fill="#0f172a">Rab</text>
  <rect x="260" y="55" width="16" height="121" fill="#cbd5e1" stroke="#334155"/>
  <rect x="278" y="168.3" width="16" height="7.7" fill="url(#miehatch-pm)" stroke="#1d4ed8"/>
  <text x="268" y="50" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0f172a">110</text>
  <text x="286" y="163" text-anchor="middle" font-size="9" font-weight="700" fill="#1d4ed8">7</text>
  <text x="277" y="198" text-anchor="middle" font-size="10.5" font-weight="600" fill="#0f172a">Kam</text>
  <rect x="322" y="60.5" width="16" height="115.5" fill="#cbd5e1" stroke="#334155"/>
  <rect x="340" y="170.5" width="16" height="5.5" fill="url(#miehatch-pm)" stroke="#1d4ed8"/>
  <text x="330" y="55.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0f172a">105</text>
  <text x="348" y="165" text-anchor="middle" font-size="9" font-weight="700" fill="#1d4ed8">5</text>
  <text x="339" y="198" text-anchor="middle" font-size="10.5" font-weight="600" fill="#0f172a">Jum</text>
  <rect x="138" y="212" width="124" height="20" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>
  <rect x="146" y="217" width="10" height="10" fill="#cbd5e1" stroke="#334155"/>
  <text x="160" y="226" font-size="10" font-weight="600" fill="#0f172a">Terjual</text>
  <rect x="206" y="217" width="10" height="10" fill="url(#miehatch-pm)" stroke="#1d4ed8"/>
  <text x="220" y="226" font-size="10" font-weight="600" fill="#1d4ed8">Sisa</text>
</svg>`;

const SVG_PM_TATAKAN = `<svg viewBox="0 0 280 172" width="280" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="118" y="22" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">Tatakan 48 cm &#215; 48 cm</text>
  <g stroke="#0f172a" stroke-width="1" fill="none">
    <rect x="46" y="34" width="144" height="100" stroke-width="1.5"/>
    <line x1="70" y1="34" x2="70" y2="134"/>
    <line x1="94" y1="34" x2="94" y2="134"/>
    <line x1="118" y1="34" x2="118" y2="134"/>
    <line x1="142" y1="34" x2="142" y2="134"/>
    <line x1="166" y1="34" x2="166" y2="134"/>
    <line x1="46" y1="54" x2="190" y2="54"/>
    <line x1="46" y1="74" x2="190" y2="74"/>
    <line x1="46" y1="94" x2="190" y2="94"/>
    <line x1="46" y1="114" x2="190" y2="114"/>
  </g>
  <line x1="46" y1="146" x2="190" y2="146" stroke="#475569" stroke-width="1.1"/>
  <text x="118" y="161" text-anchor="middle" font-size="10.5" font-weight="600" fill="#0f172a">6 kolom</text>
  <line x1="204" y1="34" x2="204" y2="134" stroke="#475569" stroke-width="1.1"/>
  <text x="212" y="88" font-size="10.5" font-weight="600" fill="#0f172a">5 baris</text>
</svg>`;

const PM_STIM_1 = `Panitia Festival Warga akan dibentuk dari wakil dua blok permukiman yang berdekatan. Blok Utara mengirim 10 calon dan Blok Selatan mengirim 14 calon, sehingga tersedia 24 orang yang semuanya berbeda. Dari kelompok calon yang sama, panitia akan memilih beberapa orang untuk mengisi tiga jabatan inti dan, pada kegiatan lain, membentuk tim kerja tanpa membedakan jabatan. Seseorang yang sudah terpilih dalam satu proses pemilihan tidak dapat dipilih kembali pada proses yang sama.`;

const PM_STIM_2 = `Panitia Festival Warga menyiapkan deretan kursi VIP di depan panggung utama. Banyak kursi pada lima baris pertama berturut-turut adalah $6, 9, 13, 18,$ dan $24$. Susunan setiap baris dibuat lebih lebar daripada baris sebelumnya agar pandangan penonton tetap terbuka. Untuk baris berikutnya, panitia meneruskan pola pertambahan yang sama seperti pada lima baris pertama.\n\n${SVG_PM_VIP}`;

const PM_STIM_3 = `Sebuah bianglala mempunyai jari-jari $10\\text{ m}$. Pusat roda $O$ berada $12\\text{ m}$ di atas tanah. Terdapat $12$ kabin yang tersebar merata. Posisi kabin $A$ berada di titik terendah dan kabin berikutnya berjarak sudut pusat $30^\\circ$.\n\n${SVG_PM_BIANGLALA}`;

const PM_STIM_4 = `Sebuah kedai mie mencatat jumlah porsi yang terjual dan porsi yang tersisa setiap hari. Data lima hari digunakan untuk mengevaluasi produksi agar sisa makanan tidak terlalu besar.\n\n${SVG_PM_KEDAI_MIE}`;

const PM_STIM_5 = `Kedai mie menggunakan $30$ tatakan meja berbentuk persegi, masing-masing bersisi $48\\text{ cm}$, disusun $6$ kolom dan $5$ baris. Untuk paket premium, setiap tatakan diberi bingkai $2\\text{ cm}$ pada setiap sisi.\n\n${SVG_PM_TATAKAN}`;

export const PM_QUESTIONS: SeedQuestion[] = [
  {
    orderIndex: 1,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 1 untuk nomor 1–4",
    stimulus: PM_STIM_1,
    prompt:
      "Tiga jabatan berbeda akan diisi. Jabatan pertama harus diisi warga Blok Utara, jabatan kedua warga Blok Selatan, sedangkan jabatan ketiga dapat diisi siapa saja yang belum terpilih. Banyak susunan yang mungkin adalah ....",
    options: ["3080", "2940", "2860", "140", "552"],
    answerKey: "A",
    explanation:
      "Jabatan 1 (Blok Utara) $= 10$ pilihan, Jabatan 2 (Blok Selatan) $= 14$ pilihan, Jabatan 3 (sisa dari 24 orang setelah 2 terpilih) $= 22$ pilihan. Total susunan $= 10 \\times 14 \\times 22 = 3080$.",
  },
  {
    orderIndex: 2,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 1 untuk nomor 1–4",
    stimulus: PM_STIM_1,
    prompt: "Jika tiga orang dipilih sebagai satu tim tanpa membedakan peran, peluang ketiganya berasal dari Blok Utara adalah ....",
    options: ["$\\frac{1}{8}$", "$\\frac{15}{253}$", "$\\frac{5}{12}$", "$\\frac{91}{506}$", "$\\frac{4}{11}$"],
    answerKey: "B",
    explanation:
      "Peluang $= \\frac{\\binom{10}{3}}{\\binom{24}{3}} = \\frac{120}{2024} = \\frac{15}{253}$.",
  },
  {
    orderIndex: 3,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 1 untuk nomor 1–4",
    stimulus: PM_STIM_1,
    prompt: "Tiga orang dipilih sekaligus. Peluang terpilih tepat dua warga Blok Utara dan satu warga Blok Selatan adalah ....",
    options: ["$\\frac{5}{12}$", "$\\frac{7}{12}$", "$\\frac{315}{1012}$", "$\\frac{35}{69}$", "$\\frac{455}{1012}$"],
    answerKey: "C",
    explanation:
      "Peluang $= \\frac{\\binom{10}{2} \\times \\binom{14}{1}}{\\binom{24}{3}} = \\frac{45 \\times 14}{2024} = \\frac{630}{2024} = \\frac{315}{1012}$.",
  },
  {
    orderIndex: 4,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 1 untuk nomor 1–4",
    stimulus: PM_STIM_1,
    prompt: "Diketahui orang pertama yang terpilih berasal dari Blok Utara. Peluang orang kedua berasal dari Blok Selatan adalah ....",
    options: ["$\\frac{10}{23}$", "$\\frac{5}{12}$", "$\\frac{13}{23}$", "$\\frac{14}{23}$", "$\\frac{7}{12}$"],
    answerKey: "D",
    explanation:
      "Setelah 1 warga Blok Utara terpilih, tersisa $23$ orang dengan $14$ di antaranya dari Blok Selatan. Peluang bersyaratnya $= \\frac{14}{23}$.",
  },
  {
    orderIndex: 5,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 2 untuk nomor 5–8",
    stimulus: PM_STIM_2,
    prompt: "Banyak kursi pada baris ke-6 adalah ....",
    options: ["32", "33", "29", "30", "31"],
    answerKey: "E",
    explanation:
      "Barisan: $6, 9, 13, 18, 24$ memiliki beda $+3, +4, +5, +6$. Beda ke baris ke-6 adalah $+7$, jadi $24 + 7 = 31$.",
  },
  {
    orderIndex: 6,
    type: "BENAR_SALAH",
    stimulusTitle: "Stimulus 2 untuk nomor 5–8",
    stimulus: PM_STIM_2,
    prompt: "Tentukan **Benar** atau **Salah** untuk setiap pernyataan berikut.",
    options: [
      { id: "st1", text: "Baris ke-6 memiliki 31 kursi." },
      { id: "st2", text: "Baris ke-4 memiliki 18 kursi." },
      { id: "st3", text: "Selisih baris ke-7 dan ke-6 adalah 7 kursi." },
    ],
    answerKey: ["BENAR", "BENAR", "SALAH"],
    explanation:
      "Baris 1..7 berturut-turut: $6, 9, 13, 18, 24, 31, 39$. Baris ke-6 $= 31$ (Benar), baris ke-4 $= 18$ (Benar), selisih baris ke-7 dan ke-6 adalah $39 - 31 = 8 \\ne 7$ (Salah).",
  },
  {
    orderIndex: 7,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 2 untuk nomor 5–8",
    stimulus: PM_STIM_2,
    prompt: "Selisih banyak kursi baris ke-10 dan ke-9 adalah ....",
    options: ["11", "12", "13", "9", "10"],
    answerKey: "A",
    explanation:
      "Beda antara baris ke-$n$ dan ke-$(n-1)$ adalah $n + 1$. Untuk $n = 10$, selisihnya $= 10 + 1 = 11$.",
  },
  {
    orderIndex: 8,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 2 untuk nomor 5–8",
    stimulus: PM_STIM_2,
    prompt: "Jika hanya baris 1 sampai 4 yang dipakai, jumlah kursi VIP adalah ....",
    options: ["44", "46", "48", "40", "42"],
    answerKey: "B",
    explanation: "$6 + 9 + 13 + 18 = 46$ kursi.",
  },
  {
    orderIndex: 9,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 3 untuk nomor 9–12",
    stimulus: PM_STIM_3,
    prompt: "Ketinggian kabin A dari tanah adalah .... m",
    options: ["5", "1", "2", "3", "4"],
    answerKey: "C",
    explanation: "Kabin A di titik terendah berjarak $12 - 10 = 2\\text{ m}$ dari tanah.",
  },
  {
    orderIndex: 10,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 3 untuk nomor 9–12",
    stimulus: PM_STIM_3,
    prompt: "Ketinggian kabin tertinggi adalah .... m",
    options: ["24", "20", "21", "22", "23"],
    answerKey: "D",
    explanation: "Titik tertinggi $= 12 + 10 = 22\\text{ m}$ dari tanah.",
  },
  {
    orderIndex: 11,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 3 untuk nomor 9–12",
    stimulus: PM_STIM_3,
    prompt: "Ketinggian kabin yang membentuk sudut $60^\\circ$ terhadap arah horizontal dari pusat adalah ....",
    options: ["$17$", "$12 + 10\\sqrt{3}$", "$22$", "$12 + 5\\sqrt{2}$", "$12 + 5\\sqrt{3}$"],
    answerKey: "E",
    explanation:
      "Komponen vertikal relatif terhadap pusat roda $O$ di atas garis horizontal adalah $r \\sin 60^\\circ = 10 \\cdot \\frac{\\sqrt{3}}{2} = 5\\sqrt{3}\\text{ m}$, sehingga ketinggiannya dari tanah $= 12 + 5\\sqrt{3}\\text{ m}$.",
  },
  {
    orderIndex: 12,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 3 untuk nomor 9–12",
    stimulus: PM_STIM_3,
    prompt: "Panjang busur antara dua kabin yang bersebelahan adalah .... m",
    options: ["$\\frac{5\\pi}{3}$", "$\\frac{10\\pi}{3}$", "$5\\pi$", "$10\\pi$", "$\\frac{5\\pi}{6}$"],
    answerKey: "A",
    explanation:
      "Sudut pusat antara dua kabin bersebelahan $= 30^\\circ = \\frac{1}{12}$ lingkaran. Panjang busur $= \\frac{1}{12} \\times 2\\pi(10) = \\frac{20\\pi}{12} = \\frac{5\\pi}{3}\\text{ m}$.",
  },
  {
    orderIndex: 13,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 4 untuk nomor 13–16",
    stimulus: PM_STIM_4,
    prompt: "Jumlah seluruh porsi yang terjual selama lima hari adalah ....",
    options: ["465", "480", "495", "510", "450"],
    answerKey: "B",
    explanation:
      "Total terjual $= 80\\text{ (Sen)} + 95\\text{ (Sel)} + 90\\text{ (Rab)} + 110\\text{ (Kam)} + 105\\text{ (Jum)} = 480$ porsi.",
  },
  {
    orderIndex: 14,
    type: "BENAR_SALAH",
    stimulusTitle: "Stimulus 4 untuk nomor 13–16",
    stimulus: PM_STIM_4,
    prompt: "Tentukan **Benar** atau **Salah** berdasarkan grafik.",
    options: [
      { id: "st1", text: "Total porsi sisa selama lima hari adalah 36." },
      { id: "st2", text: "Pada Jumat, persentase porsi sisa tepat 5% dari porsi terjual." },
      { id: "st3", text: "Penjualan tertinggi terjadi pada Kamis." },
    ],
    answerKey: ["BENAR", "SALAH", "BENAR"],
    explanation:
      "1. Total sisa $= 8 + 6 + 10 + 7 + 5 = 36$ (Benar).\n2. Pada Jumat: sisa $= 5$, terjual $= 105$, persentasenya $\\frac{5}{105} \\approx 4{,}76\\% \\ne 5\\%$ (Salah).\n3. Penjualan Kamis $= 110$ adalah yang tertinggi (Benar).",
  },
  {
    orderIndex: 15,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 4 untuk nomor 13–16",
    stimulus: PM_STIM_4,
    prompt: "Hari dengan rasio porsi sisa terhadap porsi terjual paling kecil adalah ....",
    options: ["Rab", "Kam", "Jum", "Sen", "Sel"],
    answerKey: "C",
    explanation:
      "Rasio tiap hari: Sen $= 8/80 = 0{,}100$, Sel $= 6/95 \\approx 0{,}063$, Rab $= 10/90 \\approx 0{,}111$, Kam $= 7/110 \\approx 0{,}064$, dan Jum $= 5/105 \\approx 0{,}048$ (terkecil).",
  },
  {
    orderIndex: 16,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 4 untuk nomor 13–16",
    stimulus: PM_STIM_4,
    prompt: "Jika pendapatan tiap porsi terjual Rp20.000 dan kerugian tiap porsi sisa Rp10.000, hasil bersih lima hari adalah ....",
    options: ["Rp9.600.000", "Rp8.880.000", "Rp9.120.000", "Rp9.240.000", "Rp9.360.000"],
    answerKey: "D",
    explanation:
      "Hasil bersih $= (480 \\times 20.000) - (36 \\times 10.000) = 9.600.000 - 360.000 = \\text{Rp}9.240.000$.",
  },
  {
    orderIndex: 17,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 5 untuk nomor 17–20",
    stimulus: PM_STIM_5,
    prompt: "Luas seluruh tatakan tanpa bingkai adalah .... $\\text{m}^2$",
    options: ["7,1424", "7,3728", "6,4512", "6,6816", "6,9120"],
    answerKey: "E",
    explanation:
      "Luas 1 tatakan $= 0{,}48 \\times 0{,}48 = 0{,}2304\\text{ m}^2$. Untuk 30 tatakan $= 30 \\times 0{,}2304 = 6{,}9120\\text{ m}^2$.",
  },
  {
    orderIndex: 18,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 5 untuk nomor 17–20",
    stimulus: PM_STIM_5,
    prompt: "Ukuran susunan seluruh tatakan tanpa celah adalah ....",
    options: ["2,88 m x 2,40 m", "2,88 m x 2,88 m", "3,00 m x 2,40 m", "3,12 m x 2,60 m", "2,40 m x 2,40 m"],
    answerKey: "A",
    explanation:
      "Lebar $= 6 \\times 0{,}48\\text{ m} = 2{,}88\\text{ m}$, dan panjang/tinggi $= 5 \\times 0{,}48\\text{ m} = 2{,}40\\text{ m}$.",
  },
  {
    orderIndex: 19,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 5 untuk nomor 17–20",
    stimulus: PM_STIM_5,
    prompt: "Jika setiap tatakan premium memiliki sisi luar $52\\text{ cm}$ karena bingkai, total luas sisi luar 30 tatakan adalah .... $\\text{m}^2$",
    options: ["7,812", "8,112", "8,312", "8,512", "7,612"],
    answerKey: "B",
    explanation:
      "Total luas $= 30 \\times (0{,}52)^2 = 30 \\times 0{,}2704 = 8{,}112\\text{ m}^2$.",
  },
  {
    orderIndex: 20,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Stimulus 5 untuk nomor 17–20",
    stimulus: PM_STIM_5,
    prompt: "Biaya pemasangan Rp120.000 per tatakan dan ada diskon $10\\%$ untuk 30 tatakan. Total tagihan adalah ....",
    options: ["Rp3.000.000", "Rp3.120.000", "Rp3.240.000", "Rp3.360.000", "Rp3.600.000"],
    answerKey: "C",
    explanation:
      "Biaya kotor $= 30 \\times 120.000 = \\text{Rp}3.600.000$. Setelah diskon $10\\%$: $0{,}9 \\times 3.600.000 = \\text{Rp}3.240.000$.",
  },
];

