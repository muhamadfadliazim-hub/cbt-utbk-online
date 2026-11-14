import { CurriculumSubjectSeed } from "./types";
import {
  DIAG_LBI_FAKTA_OPINI,
  DIAG_LBI_GRAFIK_SIKAP,
  DIAG_LBI_SASTRA,
  DIAG_LBI_DUA_TEKS,
  DIAG_LBE_TOPIC,
  DIAG_LBE_INFERENCE,
  DIAG_LBE_FORUM,
  DIAG_LBE_PAIRED,
  DIAG_PM_TARIF,
  DIAG_PM_KECEPATAN,
  DIAG_PM_WADAH,
  DIAG_PM_ELEVASI,
  DIAG_PM_PERTUMBUHAN,
} from "./diagrams/snbtLiterasiDiagrams";

export const SNBT_LITERASI_CURRICULUM: CurriculumSubjectSeed[] = [
  {
    examType: "SNBT",
    title: "Literasi dalam Bahasa Indonesia (LBI)",
    description: "Materi inti pemahaman teks nonsastra (sains, kebijakan, grafik data) dan teks sastra serta perbandingan teks.",
    chapters: [
      {
        title: "1. Teks Informasi, Sains & Grafik Data",
        materials: [
          {
            title: "Gagasan Utama, Fakta vs Opini & Penarikan Inferensi Teks",
            duration: 25,
            content: `${DIAG_LBI_FAKTA_OPINI}

### Gagasan Pokok & Struktur Informasi Teks
- **Gagasan Pokok Paragraf:** pernyataan paling inklusif yang merangkum seluruh kalimat penjelas; dapat muncul secara deduktif (awal), induktif (akhir), variatif (awal–akhir), atau tersebar (*tersirat*).
- **Fakta Tersurat:** kebenaran objektif yang tertulis eksplisit (data statistik, lokasi, waktu, definisi teknis, kutipan hasil pengamatan).
- **Opini Penulis:** sikap subjektif berupa evaluasi, saran, prediksi, atau penilaian nilai (*harus, sebaiknya, memprihatinkan, cenderung menjanjikan*).

### Aturan Penarikan Inferensi (Makna Tersirat)
Inferensi adalah kesimpulan baru yang **sah secara logis** dari penggabungan minimal dua fakta dalam bacaan:
1. Tidak boleh menambahkan asumsi dunia nyata yang tidak disinggung bacaan.
2. Tidak boleh menggeser makna kata modalitas: pernyataan teks *"dapat mengurangi risiko"* tidak sah diinferensikan menjadi *"pasti menyembuhkan"*.
3. Pada soal evaluasi klaim (*"Pernyataan manakah yang memperlemah/tidak relevan dengan argumen teks?"*), cari premis inti paragraf yang memuat klaim sebab–akibat sebelum membandingkan opsi.

### Teknik Analisis Cepat Paragraf Padat UTBK LBI
- **Kalimat Pertama & Terakhir Tiap Paragraf:** petakan peran paragraf (definisi $\\rightarrow$ mekanisme $\\rightarrow$ studi kasus $\\rightarrow$ implikasi/kritik).
- **Penanda Kontras (*namun, sebaliknya, sayangnya*):** hampir selalu mengawali **inti kritik penulis** atau perbedaan utama yang menjadi pertanyaan inferensi.

### Contoh Stimulus & Pembahasan Lengkap
> **Cuplikan Teks:** *Penggunaan pupuk nitrogen berlebih pada lahan sawah intensif memicu limpasan nitrat ke sungai saat musim hujan. Di hilir, ledakan pertumbuhan alga akibat kelebihan nutrien menutup permukaan air sehingga oksigen terlarut anjlok drastis dan memicu kematian ikan massal. Meski demikian, petani enggan memangkas dosis pupuk karena khawatir produktivitas panen jangka pendek turun.*
> **Pertanyaan:** Inferensi manakah yang paling tepat berdasarkan bacaan?
- **Analisis:** Teks menghubungkan *pupuk berlebih $\\rightarrow$ limpasan nitrat $\\rightarrow$ ledakan alga $\\rightarrow$ turunnya oksigen $\\rightarrow$ kematian ikan*, sekaligus menjelaskan motif petani mempertahankan dosis.
- **Kesimpulan Sah:** *Pengurangan limbah nutrien di hulu berpotensi mencegah penurunan oksigen di ekosistem sungai hilir, tetapi penerapannya terhambat kekhawatiran ekonomi jangka pendek petani.*`,
          },
          {
            title: "Interpretasi Grafik/Tabel Eksperimen, Sikap & Tujuan Penulis",
            duration: 25,
            content: `${DIAG_LBI_GRAFIK_SIKAP}

### Analisis Data Grafik, Tabel & Diagram Ilmiah
| Komponen yang Wajib Diperiksa | Pertanyaan Kritis |
|---|---|
| **Judul & Satuan Sumbu** | Apakah nilai berupa angka mutlak (ribu ton), persentase (%), atau indeks pertumbuhan? |
| **Periode & Interval** | Apakah interval sumbu horizontal seragam ($1$ tahun vs $5$ tahun)? |
| **Puncak Absolut vs Laju Tercuram** | Titik grafik tertinggi belum tentu periode dengan *kenaikan tertinggi* (selisih antar-titik)! |

### Identifikasi Sikap (*Attitude*), Nada & Tujuan Penulisan
- **Eksplanatif / Informatif:** menjelaskan mekanisme fenomena secara netral tanpa keberpihakan emosional.
- **Persuasif / Advokatif:** mendorong pembaca menerima gagasan atau mengubah kebijakan (*perlu segera diterapkan*).
- **Kritis / Skeptis:** mempertanyakan klaim dominan atau menyoroti kelemahan kebijakan melalui kontradiksi data.
- **Pola Pengaitan Diksi:** diksi bermuatan nilai (*ironis, ketimpangan tajam, terobosan historis*) menjadi petunjuk langsung sikap penulis.

### Contoh Kasus Pembacaan Grafik Ilmiah
> Grafik menunjukkan kurva fluida Bingham memotong sumbu vertikal tegangan geser di $\\tau_0 > 0$, sedangkan fluida Newtonian melewati titik asal $(0,0)$.
- **Makna Fisik Intersep $\\tau_0$:** fluida Bingham **tidak akan mengalir sama sekali** apabila gaya/tegangan geser yang diberikan masih berada di bawah ambang $\\tau_0$, berbeda dengan air (Newtonian) yang langsung mengalir begitu ada gaya sekecil apa pun.`,
          },
        ],
      },
      {
        title: "2. Teks Sastra & Perbandingan Dua Teks",
        materials: [
          {
            title: "Unsur Intrinsik Sastra: Tokoh, Latar, Konflik, Sudut Pandang & Majas",
            duration: 25,
            content: `${DIAG_LBI_SASTRA}

### Analisis Teks Prosa (Cerpen/Novel) & Puisi
1. **Penokohan & Watak Tokoh:**
   - **Teknik Analitik (Langsung):** narator menyebut langsung sifat tokoh (*"Pak Darmo seorang yang keras kepala."*).
   - **Teknik Dramatik (Tidak Langsung):** watak disimpulkan dari **dialog**, **tindakan/keputusan saat krisis**, **pikiran batin**, **lingkungan tokoh**, serta **reaksi tokoh lain**.
2. **Latar (Setting):**
   - **Latar Tempat, Waktu, dan Sosial–Budaya** (*nilai adat, strata ekonomi, norma desa/kota*) sering kali menjadi pemicu konflik tokoh.
3. **Konflik Batin vs Konflik Sosial:**
   - **Konflik Batin (Internal):** pergulatan emosi, rasa bersalah, atau dilema di dalam diri tokoh.
   - **Konflik Eksternal:** pertentangan tokoh dengan tokoh lain, aturan adat, atau kondisi alam.
4. **Sudut Pandang (*Point of View*):**
   - Orang pertama pelaku utama (*aku*), orang pertama pengamat, atau orang ketiga serba tahu (*ia/dia/nama*).
5. **Majas Penting:** *Metafora* (perbandingan langsung), *Personifikasi* (benda mati berperilaku manusiawi), *Ironi* (sindiran berlawanan arti harfiah), *Simbolisme* (objek mewakili gagasan abstrak, mis. *"lampu teplok yang meredup"* melambangkan pudarnya harapan).`,
          },
          {
            title: "Amanat, Nilai Sastra & Perbandingan Dua Teks",
            duration: 25,
            content: `${DIAG_LBI_DUA_TEKS}

### Menggali Nilai & Amanat Kutipan Sastra
- **Amanat** tidak pernah bertentangan dengan konsekuensi peristiwa cerita: perhatikan perubahan sikap tokoh di akhir kutipan (*epifani/kesadaran*) atau akibat yang menimpa tokoh.
- **Nilai dalam Karya Sastra:** nilai moral, sosial, budaya, religius, dan edukatif selalu terikat dengan konteks dialog dan aksi cerita.

### Perbandingan Dua Teks (Teks 1 vs Teks 2)
| Jenis Hubungan Dua Teks | Ciri Utama |
|---|---|
| **Komplementer (Saling Melengkapi)** | Teks 1 membahas penyebab/teori; Teks 2 membahas dampak lapangan atau solusi teknis |
| **Kontradiktif (Berlawanan)** | Teks 1 mendukung kesimpulan $X$; Teks 2 menyajikan bukti tandingan yang menolak $X$ |
| **Umum – Khusus** | Teks 1 menjelaskan tren global/nasional; Teks 2 mengangkat studi kasus lokal/individu |
| **Fiksi – Nonfiksi Bertema Sama** | Teks 1 berupa laporan ilmiah fenomena; Teks 2 mengangkat fenomena tersebut dalam kisah manusia |`,
          },
        ],
      },
    ],
  },
  {
    examType: "SNBT",
    title: "Literasi dalam Bahasa Inggris (LBE)",
    description: "Materi inti academic reading: Main Idea & Organization, Inference & Tone, Vocabulary in Context, Multi-Author Threads & Paired Passages.",
    chapters: [
      {
        title: "1. Passage Comprehension, Inference & Vocabulary",
        materials: [
          {
            title: "Topic, Main Idea, Purpose & Passage Organization",
            duration: 25,
            content: `${DIAG_LBE_TOPIC}

### Distinguishing Topic, Main Idea, and Supporting Details
1. **Topic:** The broad subject word/phrase (*e.g., coral reef bleaching*).
2. **Main Idea / Thesis:** The complete assertion about the topic that spans **every paragraph** of the passage (*e.g., ocean warming and acidification accelerate reef bleaching, requiring localized reef restoration alongside emission cuts*).
   - Reject distractors that are **too narrow** (cover only one example or one paragraph) or **too broad** (go beyond the text scope).
3. **Organizational Patterns & Signal Words:**
   - *Cause–Effect:* *therefore, consequently, stems from, triggers, results in*.
   - *Contrast / Shift:* *however, conversely, notwithstanding, rather than, nevertheless*.
   - *Chronological / Process:* *initially, subsequently, prior to, eventually*.
   - *Problem–Solution:* *poses a threat, mitigates, alleviates, one viable remedy*.
4. **Rhetorical Function Questions (*"Why does the author mention X?"*):** Look at the **previous general claim**—specific names, dates, or studies nearly always function as *empirical support*, *a counterexample*, or *an illustration* of that preceding sentence.`,
          },
          {
            title: "Inference, Author's Tone, Pronoun Reference & Vocabulary in Context",
            duration: 25,
            content: `${DIAG_LBE_INFERENCE}

### Logical Inference & Qualification Signals
- An inference is a conclusion that **must be true** or is **strongly warranted** solely by evidence inside the text.
- Pay strict attention to **qualifiers & modals**: *rarely, frequently, may, appears to, suggests, predominantly*. Options turning *"often leads to"* into *"always causes"* are false inferences.

### Author's Tone & Attitude Palette
- **Objective / Analytical:** neutral scientific language, balanced data presentation.
- **Skeptical / Critical:** highlights methodological flaws, unintended consequences (*undermines, overlooks, questionable*).
- **Cautiously Optimistic:** acknowledges hurdles while endorsing potential (*promising yet contingent upon*).
- **Urgent / Concerned:** emphasizes severe risk or delayed policy action (*alarming, pressing, imperative*).

### Pronoun Reference & Polysemous Vocabulary in Context
- **Reference (*it, they, these, such shifts, the former/the latter*):** match **number (singular vs plural)** and test whether substituting the antecedent preserves logical and grammatical sense.
- **Vocabulary in Context:** academic passages test secondary meanings of common English words:
  - *harbor* (v. = *hold/entertain a belief or pathogen*), *address* (*tackle/resolve*), *ground* (*base/justify*), *check* (*restrain/curtail*), *sound* (*valid/reliable*), *compromise* (*weaken/endanger*), *yield* (*produce/give way*).

### Worked Passage Analysis
> **Excerpt:** *While urban tree canopies undeniably lower ambient street temperatures by up to $2.5^\\circ\\text{C}$, city planners caution that indiscriminate planting of water-intensive species in arid municipalities may **tax** aging irrigation networks.*
1. **What does "tax" most nearly mean?** $\\rightarrow$ **strain / overburden** *(bukan "memungut pajak"!)*.
2. **What is the author's tone?** $\\rightarrow$ **Cautiously pragmatic** (mengakui manfaat pendinginan kanopi pohon sekaligus memberi peringatan syarat jenis pohon terhadap infrastruktur irigasi).`,
          },
        ],
      },
      {
        title: "2. Discussion Threads & Paired Academic Passages",
        materials: [
          {
            title: "Multi-Author Forum / Discussion Thread Analysis",
            duration: 20,
            content: `${DIAG_LBE_FORUM}

### Core Mechanics of Multi-Author Thread Passages
In UTBK LBE, a question or article prompt is followed by responses from 4–6 distinct commenters.

### Key Analytic Tasks
1. **Prompt Relevance:** Determine who directly addresses the **specific question or criterion** asked in the prompt (*relevant*), versus who goes off-topic (*irrelevant* — e.g., praising aesthetics when asked about cost-effectiveness).
2. **Stance Mapping:** Group speakers by position (*Pro / Contra / Conditional*) and identify **which specific premise** aligns or separates two commenters.
3. **Speaker Attitude & Assumption:** Never confuse *what Commenter B accuses Commenter A of thinking* with what Commenter A actually wrote.`,
          },
          {
            title: "Paired Passages Synthesis & Paragraph Transition Prediction",
            duration: 20,
            content: `${DIAG_LBE_PAIRED}

### Synthesizing Text 1 and Text 2
1. **Shared Premise (*Agreement*):** Both passages generally acknowledge the same baseline phenomenon even when proposing competing causes or policy responses.
2. **Divergence (*Contrast / Refutation*):** Pinpoint how Text 2 qualifies, narrows, expands, or contradicts Text 1's main claim (look for differing timeframes, sample populations, or causal mechanisms).
3. **Cross-Text Perspective (*"How would Author 2 respond to line X in Text 1?"*):** Answer strictly using Author 2's stated thesis and evidence.

### Preceding & Following Paragraph Questions
- **Preceding paragraph:** inspect the **very first sentence of Paragraph 1** for backward transitions (*"Beyond those initial challenges..."* $\\rightarrow$ preceding paragraph covered those initial challenges!).
- **Following paragraph:** inspect the **final sentence of the last paragraph** for forward cues (*"...requiring closer scrutiny of regulatory enforcement."* $\\rightarrow$ following paragraph examines regulatory enforcement!).`,
          },
        ],
      },
    ],
  },
  {
    examType: "SNBT",
    title: "Penalaran Matematika (PM)",
    description: "Materi inti Pemodelan Matematika Kontekstual Nyata (terpisah dari matematika murni PK): Tarif & Ekonomi, Laju & Kerja, Geometri Terapan, Data & Peluang Kontekstual.",
    chapters: [
      {
        title: "1. Pemodelan Ekonomi Nyata & Laju Kontekstual",
        materials: [
          {
            title: "Pemodelan Tarif Progresif, Diskon Bertingkat, Pajak & Bunga Nyata",
            duration: 30,
            content: `${DIAG_PM_TARIF}

### Pemodelan Tarif Progresif (Tarif Parkir, Listrik PLN, Air PDAM, Ongkir)
Tarif progresif menghitung biaya secara **berjenjang per interval pemakaian**, bukan mengalikan pemakaian total dengan tarif tier tertinggi:
$$\\text{Total} = \\text{Tarif}_1 \\cdot q_1 + \\text{Tarif}_2 \\cdot q_2 + \\dots + \\text{Biaya Tetap/Admin}$$
Perhatikan dua detail penting di stimulus soal cerita:
- **Aturan Pembulatan:** durasi parkir $3$ jam $10$ menit dibulatkan ke atas menjadi $4$ jam; berat paket $2{,}2\\text{ kg}$ dibulatkan ke atas menjadi $3\\text{ kg}$ (atau per $0{,}5\\text{ kg}$ tergantung tabel).
- **Batas Maksimum / Minimum:** tarif maksimal harian atau syarat minimal transaksi promo (*cashback/diskon maksimal RpX*).

### Diskon Bertingkat, Pajak (PPN) & Bunga Tunggal vs Majemuk
- **Diskon $a\\%$ lalu $b\\%$** pada harga label $H$: $H_{\\text{bayar}} = H(1 - 0{,}01a)(1 - 0{,}01b)$.
- **Harga sebelum diskon/PPN** (operasi balik!): jika harga sesudah PPN $11\\%$ adalah $B$, maka harga dasar $= \\frac{B}{1{,}11}$ (**bukan** $B - 11\\%B$!).
- **Bunga Tunggal** (laju $r$ per periode selama $n$ periode): $M_n = M_0(1 + nr)$.
- **Bunga Majemuk / Cicilan:** $M_n = M_0(1 + r)^n$.

### Contoh & Pembahasan
> Tarif listrik rumah tangga: pemakaian $0\\text{–}100\\text{ kWh}$ tarif $\\text{Rp}1.350/\\text{kWh}$; kelebihan di atas $100\\text{ kWh}$ tarif $\\text{Rp}1.700/\\text{kWh}$, ditambah biaya beban tetap $\\text{Rp}25.000$. Jika tagihan bulan ini $\\text{Rp}330.000$, berapa kWh pemakaian listrik?
- Biaya setelah dikurangi beban tetap: $330.000 - 25.000 = 305.000$.
- Biaya $100\\text{ kWh}$ pertama: $100 \\times 1.350 = 135.000$.
- Sisa biaya untuk lapisan kedua: $305.000 - 135.000 = 170.000$.
- Pemakaian di atas $100\\text{ kWh}$: $\\frac{170.000}{1.700} = 100\\text{ kWh}$.
- **Total pemakaian:** $100 + 100 = \\mathbf{200\\text{ kWh}}$.`,
          },
          {
            title: "Pemodelan Kecepatan, Berpapasan/Menyusul, Debit & Kerja Bersama",
            duration: 30,
            content: `${DIAG_PM_KECEPATAN}

### Kecepatan Rata-Rata & Pertemuan Dua Kendaraan
1. **Kecepatan Rata-Rata Sejati:** $\\bar{v} = \\frac{\\sum s_i}{\\sum t_i}$.
   Bila jarak pergi = pulang ($s$) ditempuh dengan $v_1$ dan $v_2$:
   $$\\bar{v} = \\frac{2s}{\\frac{s}{v_1}+\\frac{s}{v_2}} = \\frac{2v_1 v_2}{v_1 + v_2}$$
2. **Saling Mendekat (Berpapasan):**
   Jika $A$ berangkat lebih dulu $\\Delta t$ jam dari jarak total $D$:
   $$s_{\\text{sisa}} = D - v_A \\Delta t, \\qquad t_{\\text{papas sejak } B \\text{ jalan}} = \\frac{s_{\\text{sisa}}}{v_A + v_B}$$
3. **Menyusul (Arah Sama):**
   $$t_{\\text{susul sejak pengejar jalan}} = \\frac{\\Delta s_{\\text{awal}}}{v_{\\text{belakang}} - v_{\\text{depan}}}$$

### Debit Air, Campuran Larutan & Kerja Bersama
- **Konversi Debit:** $Q = \\frac{V}{t}$; $1\\text{ liter} = 1\\text{ dm}^3 = 1.000\\text{ cm}^3$; $1\\text{ m}^3 = 1.000\\text{ liter}$.
- **Pekerjaan/Pompa Bersama + Kebocoran:**
  $$\\frac{1}{t_{\\text{total}}} = \\frac{1}{t_1} + \\frac{1}{t_2} - \\frac{1}{t_{\\text{bocor}}}$$
- **Campuran Zat / Konsentrasi Larutan:**
  $$C_{\\text{campuran}} = \\frac{V_1 C_1 + V_2 C_2}{V_1 + V_2}$$`,
          },
        ],
      },
      {
        title: "2. Pemodelan Geometri Terapan Kontekstual",
        materials: [
          {
            title: "Optimasi Wadah, Kenaikan Muka Air, Lintasan Terpendek & Skala",
            duration: 30,
            content: `${DIAG_PM_WADAH}

### Model Permukaan, Wadah & Pencelupan Benda
1. **Kenaikan Tinggi Air dalam Tangki** saat $k$ benda pejal bervolume $V_b$ tenggelam penuh (dan tidak meluap):
   $$\\Delta h = \\frac{k \\cdot V_b}{L_{\\text{alas tangki}}}$$
2. **Kotak Tanpa Tutup dari Lembaran Karton:** jika dari karton $p \\times l$ dipotong bujur sangkar sisi $x$ di keempat sudut lalu dilipat, volumenya adalah:
   $$V(x) = x(p - 2x)(l - 2x), \\quad 0 < x < \\frac{\\min(p,l)}{2}$$

### Lintasan Terpendek pada Permukaan Bangun Ruang
Untuk mencari jarak terpendek antara dua titik pada permukaan balok/kubus/ruangan (*mis. semut merayap dari sudut alas ke sudut atap berseberangan*):
1. Buka jaring-jaring dua sisi yang bersebelahan menjadi bidang datar 2D.
2. Pada balok berukuran $p \\times l \\times t$, ada **3 kemungkinan jalur bentangan** sudut ke sudut berseberangan ruang:
   $$d_1 = \\sqrt{(p+l)^2 + t^2}, \\quad d_2 = \\sqrt{(p+t)^2 + l^2}, \\quad d_3 = \\sqrt{(l+t)^2 + p^2}$$
3. Pilih nilai $d$ **paling kecil** (secara aljabar, jumlahkan dua rusuk yang paling kecil agar sisi terpanjang berdiri sendiri!).

### Skala Denah, Peta & Maket Arsitektur
- Skala panjang $= 1 : k$ $\\Rightarrow$ **Skala luas $= 1 : k^2$** $\\Rightarrow$ **Skala volume $= 1 : k^3$**.`,
          },
          {
            title: "Aplikasi Sudut Elevasi/Depresi, Radar/Lampu & Gerak Roda",
            duration: 25,
            content: `${DIAG_PM_ELEVASI}

### Pemodelan Pengamatan Tinggi Bangunan / Menara
Jika pengamat dengan tinggi mata $h_{\\text{mata}}$ berdiri sejauh $d$ dari dasar gedung dan melihat puncak dengan sudut elevasi $\\theta$:
$$H_{\\text{gedung}} = h_{\\text{mata}} + d \\cdot \\tan\\theta$$
Bila pengamat bergerak mendekat/menjauh sebesar $\\Delta d$ dari sudut $\\alpha$ ke $\\beta$:
$$\\Delta d = (H - h_{\\text{mata}})\\left|\\frac{1}{\\tan\\alpha} - \\frac{1}{\\tan\\beta}\\right|$$

### Pemodelan Jarak Pandang, Bayangan & Roda/Gir
- **Kesebangunan Bayangan, Cermin & Tiang (Penerapan Nyata Kesebangunan):**
  $$\\frac{\\text{Tinggi Pengamat/Benda}}{\\text{Panjang Bayangan Benda}} = \\frac{\\text{Tinggi Tiang/Gedung}}{\\text{Panjang Bayangan Total}}$$
  - **Kasus Lampu Jalan:** Jika seseorang bertinggi $h$ berjalan menjauhi dasar lampu jalan setinggi $H$ ($H > h$) sejauh $x$ dan panjang bayangannya saat itu $s$, maka dari kesebangunan segitiga siku-siku diperoleh:
    $$\\frac{s}{x + s} = \\frac{h}{H} \\implies s = \\frac{h \\cdot x}{H - h}$$
  - **Kasus Cermin Datar di Tanah:** Seorang pengamat bertinggi mata $h_m$ berdiri $d_1$ meter dari cermin datar mendatar yang berjarak $d_2$ meter dari kaki gedung. Karena sudut datang $=$ sudut pantul, kedua segitiga sebangun $\\implies H_{\\text{gedung}} = h_m \\cdot \\frac{d_2}{d_1}$.
- **Putaran Roda & Transmisi Rantai:**
  - Jarak tempuh roda berjari-jari $r$ setelah berputar $N$ kali $= N \\cdot 2\\pi r$.
  - Dua gir terhubung rantai: jarak tepi sama $\\Rightarrow n_1 r_1 = n_2 r_2$ (gir kecil berputar lebih banyak daripada gir besar!).
  - Dua roda seporos (menyatu pada sumbu sama): **jumlah putaran sama** ($n_1 = n_2$).

### Contoh Soal PM UTBK & Pembahasan
> Seorang siswa dengan tinggi mata $1{,}6\\text{ m}$ berjalan menjauhi tiang lampu taman setinggi $4{,}8\\text{ m}$ dengan kecepatan konstan $1{,}2\\text{ m/s}$. Berapa panjang bayangan siswa $5$ detik setelah mulai berjalan dari dasar tiang?
- Jarak siswa dari dasar tiang: $x = 1{,}2 \\times 5 = 6\\text{ m}$.
- Dengan kesebangunan $\\frac{s}{6 + s} = \\frac{1{,}6}{4{,}8} = \\frac{1}{3} \\implies 3s = 6 + s \\implies 2s = 6 \\implies s = \\mathbf{3\\text{ m}}$.`,
          },
        ],
      },
      {
        title: "3. Pemodelan Data, Pertumbuhan & Peluang Nyata",
        materials: [
          {
            title: "Rata-Rata Gabungan, Pertumbuhan Eksponensial & Peluang Kontekstual",
            duration: 25,
            content: `${DIAG_PM_PERTUMBUHAN}

### Pemodelan Rata-Rata Perubahan & Kelompok Nyata
- **Rata-Rata Gabungan:** $\\bar{x}_{\\text{gab}} = \\frac{n_1 \\bar{x}_1 + n_2 \\bar{x}_2}{n_1 + n_2}$.
- **Metode Penyelesaian Soal Susulan/Perpindahan:** hitung selalu **Total Nilai** ($\\sum x = n \\cdot \\bar{x}$), kurangi/tambahkan data yang berpindah, lalu bagi dengan banyak anggota baru.

### Pemodelan Pertumbuhan & Deret Kontekstual
1. **Pertumbuhan Tetap (Aritmetika):** pertambahan penduduk konstan, kapasitas baris kursi stadion, pengisian tabungan naik tetap per bulan:
   $$U_n = a + (n-1)b, \\qquad S_n = \\frac{n}{2}(2a + (n-1)b)$$
2. **Pertumbuhan / Peluruhan Eksponensial:** pembelahan sel setiap $t_0$ menit, penyusutan nilai jual kendaraan $r\\%$ per tahun, peluruhan radioaktif tiap waktu paruh $T_{1/2}$:
   $$P(t) = P_0 \\cdot k^{t / T}$$

### Peluang Kontekstual dalam Stimulus Masalah
- Cek selalu apakah pengambilan sampel dilakukan **sekaligus / tanpa pengembalian** (mengubah penyebut ruang sampel tahap kedua!) atau **dengan pengembalian**.
- Pada peluang kegagalan beruntun atau kondisi *"minimal satu berhasil"*, gunakan **aturan komplemen**:
  $$P(\\text{minimal 1 berhasil}) = 1 - P(\\text{semua gagal})$$`,
          },
        ],
      },
    ],
  },
];

