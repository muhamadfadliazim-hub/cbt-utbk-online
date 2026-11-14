import { CurriculumSubjectSeed } from "./types";
import {
  DIAG_SMA_INDO_EKSPO,
  DIAG_SMA_INDO_KTI,
  DIAG_SMA_INDO_SASTRA,
  DIAG_SMA_MAT_PROGLIN,
  DIAG_SMA_MAT_TRIG,
  DIAG_SMA_MAT_D3,
  DIAG_SMA_ING_GENRE,
  DIAG_SMA_ING_GRAMMAR,
  DIAG_SMA_MTL_POLI,
  DIAG_SMA_MTL_VEKTOR,
  DIAG_SMA_MTL_TURUNAN,
  DIAG_SMA_MTL_INTEGRAL,
  DIAG_SMA_FIS_KINEMATIKA,
  DIAG_SMA_FIS_ENERGI,
  DIAG_SMA_FIS_FLUIDA,
  DIAG_SMA_FIS_LISTRIK,
  DIAG_SMA_KIM_STOIK,
  DIAG_SMA_KIM_TERMO,
  DIAG_SMA_KIM_LARUTAN,
  DIAG_SMA_KIM_ELEKTRO,
  DIAG_SMA_BIO_SEL,
  DIAG_SMA_BIO_FISIOLOGI,
  DIAG_SMA_BIO_GEN,
} from "./diagrams/tkaSmaWajibSaintekDiagrams";

export const TKA_SMA_WAJIB_SAINTEK: CurriculumSubjectSeed[] = [
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Bahasa Indonesia",
    description: "Mapel Wajib TKA SMA: Teks Argumentasi & Eksposisi, Struktur Kebahasaan Ilmiah, Karya Ilmiah & Resensi, serta Apresiasi Sastra Indonesia.",
    chapters: [
      {
        title: "1. Teks Eksposisi, Argumentasi & Struktur Kebahasaan",
        materials: [
          {
            title: "Struktur & Kebahasaan Teks Eksposisi, Eksplanasi & Argumentasi",
            duration: 25,
            content: `${DIAG_SMA_INDO_EKSPO}

### Perbandingan Struktur Tiga Jenis Teks Utama SMA
| Jenis Teks | Tujuan Komunikatif | Struktur Baku | Ciri Kebahasaan |
|---|---|---|---|
| **Eksposisi** | Memaparkan pendapat disertai fakta pendukung secara objektif | Tesis $\\rightarrow$ Rangkaian Argumen $\\rightarrow$ Penegasan Ulang | Verba mental, nomina abstrak, konjungsi kausalitas |
| **Eksplanasi** | Menjelaskan proses *mengapa* dan *bagaimana* fenomena alam/sosial terjadi | Pernyataan Umum $\\rightarrow$ Deretan Penjelas (sebab–akibat) $\\rightarrow$ Interpretasi | Konjungsi kronologis (*kemudian, selanjutnya*) & kausal (*akibatnya*) |
| **Argumentasi** | Meyakinkan pembaca dengan bukti empiris & penalaran deduktif/induktif | Pendahuluan/Klaim $\\rightarrow$ Badan Bukti $\\rightarrow$ Sanggahan/Simpulan | Modalitas (*harus, perlu*), data kuantitatif |

### Penalaran Silogisme & Kesalahan Logika Paragraf Ilmiah
- **Induktif (Generalisasi, Analogi, Kausal):** kesesuaian bukti terhadap klaim paragraf.
- **Kepaduan Makna (Koherensi):** kalimat penjelas wajib selaras dengan kalimat utama; kalimat yang memuat kontradiksi fakta atau mengalihkan topik harus dieliminasi.`,
          },
          {
            title: "Karya Tulis Ilmiah, Daftar Pustaka, Kutipan & Tajuk Rencana",
            duration: 25,
            content: `${DIAG_SMA_INDO_KTI}

### Sistematika Karya Tulis Ilmiah & Pengutipan
- **Latar Belakang Masalah:** disusun piramida terbalik dari kesenjangan ideal (*das sollen*) menuju fakta empiris (*das sein*).
- **Rumusan Masalah:** berupa kalimat tanya spesifik yang menjawab variabel penelitian.
- **Kutipan Langsung $\\le 4$ baris:** diintegrasikan dalam paragraf memakai tanda petik \`"..."\`; **$> 4$ baris:** paragraf terpisah menjorok tanpa tanda petik, spasi tunggal.
- **Penulisan Daftar Pustaka (PUEBI / EYD V):**
  *Nama Belakang, Nama Depan. Tahun Terbit. Judul Buku (Miring). Kota Terbit: Penerbit.*

### Tajuk Rencana (Editorial) & Resensi Buku
- **Tajuk Rencana:** mencerminkan **sikap resmi redaksi** terhadap isu aktual; membedakan **fakta latar belakang**, **opini redaksi**, dan **pihak yang dituju** oleh saran redaksi.
- **Resensi:** mencakup identitas buku, ikhtisar isi, analisis **keunggulan & kelemahan** bahasa/isi secara berimbang, serta rekomendasi sasaran pembaca.`,
          },
        ],
      },
      {
        title: "2. Sastra Indonesia & Kritik Teks",
        materials: [
          {
            title: "Prosa Modern, Hikayat Klasik, Puisi & Drama",
            duration: 25,
            content: `${DIAG_SMA_INDO_SASTRA}

### Karakteristik Hikayat (Sastra Melayu Klasik) vs Cerpen Modern
- **Hikayat:** bersifat istanasentris, kemustahilan/kesaktian tokoh, anonim, pralogis, memakai kata arkais (*syahdan, hatta, alkisah*).
- **Nilai Sastra:** nilai moral, sosial, budaya, estetis, dan religius yang tersirat dari perilaku tokoh menghadapi konflik.

### Analisis Unsur Fisik & Batin Puisi
- **Unsur Fisik:** diksi bermakna konotatif, pengimajian (visual, auditif, taktil), kata konkret, majas (metafora, personifikasi, hiperbola, ironi), serta rima/irama.
- **Unsur Batin:** tema (pokok pikiran), rasa (sikap penyair), nada (penyampaian kepada pembaca), dan amanat.

### Naskah Drama
Memuat **kramagung** (petunjuk laku/ekspresi dalam tanda kurung) dan **wawancang** (dialog tokoh); konflik memuncak pada fase **klimaks** sebelum **resolusi**.`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Matematika",
    description: "Mapel Wajib TKA SMA (Matematika Umum): Eksponen–Logaritma, Sistem Linear–Kuadrat, Trigonometri, Dimensi Tiga, Statistika & Peluang.",
    chapters: [
      {
        title: "1. Aljabar, Fungsi & Trigonometri SMA",
        materials: [
          {
            title: "Eksponen, Logaritma, Sistem Pertidaksamaan & Program Linear",
            duration: 30,
            content: `${DIAG_SMA_MAT_PROGLIN}

### Eksponen, Logaritma & Persamaannya
- Persamaan eksponen $a^{f(x)} = a^{g(x)} \\implies f(x) = g(x)$ ($a > 0, a \\ne 1$).
- Persamaan logaritma $^a\\log f(x) = {}^a\\log g(x) \\implies f(x) = g(x)$ disertai syarat wajib **$f(x) > 0$ dan $g(x) > 0$**.

### Program Linear Dua Variabel (Nilai Optimum)
1. Ubah kendala cerita menjadi sistem pertidaksamaan linear ($ax + by \\le c$, $x \\ge 0, y \\ge 0$).
2. Tentukan Daerah Himpunan Penyelesaian (DHP) pada bidang Kartesius beserta **seluruh titik pojok (ekstrem)** perpotongan garis pembatas.
3. Substitusikan semua titik pojok ke fungsi objektif $Z(x,y) = px + qy$ untuk menentukan nilai **maksimum** atau **minimum** sesuai kendala.`,
          },
          {
            title: "Trigonometri Lanjut, Persamaan & Grafik Fungsi Trigonometri",
            duration: 25,
            content: `${DIAG_SMA_MAT_TRIG}

### Persamaan Trigonometri Dasar
- $\\sin x = \\sin\\alpha \\implies x = \\alpha + k\\cdot 360^\\circ$ atau $x = (180^\\circ - \\alpha) + k\\cdot 360^\\circ$.
- $\\cos x = \\cos\\alpha \\implies x = \\pm\\alpha + k\\cdot 360^\\circ$.
- $\\tan x = \\tan\\alpha \\implies x = \\alpha + k\\cdot 180^\\circ$.

### Grafik $y = A \\sin(k(x \\pm \\alpha)) + c$
- **Amplitudo:** $|A|$ (nilai maks $= |A| + c$, nilai min $= -|A| + c$).
- **Periode:** $T = \\frac{360^\\circ}{|k|}$ untuk $\\sin/\\cos$, dan $T = \\frac{180^\\circ}{|k|}$ untuk $\\tan$.`,
          },
        ],
      },
      {
        title: "2. Dimensi Tiga, Statistika & Peluang Kejadian Majemuk",
        materials: [
          {
            title: "Dimensi Tiga (Jarak Titik–Garis–Bidang) & Statistika Berkelompok",
            duration: 30,
            content: `${DIAG_SMA_MAT_D3}

### Geometri Dimensi Tiga
1. **Jarak titik $P$ ke garis $g$:** proyeksikan $P$ secara **tegak lurus** ke garis $g$; gunakan luas segitiga ($\\frac{1}{2} a t = \\frac{1}{2} c h$) pada segitiga siku-siku atau Aturan Cosinus pada segitiga sembarang.
2. **Jarak titik $P$ ke bidang $\\alpha$:** tarik garis dari $P$ tegak lurus terhadap bidang $\\alpha$. Pada kubus rusuk $a$:
   - Jarak titik sudut ke bidang diagonal ruang seperti $\\triangle BDG$: **$\\frac{1}{3}a\\sqrt{3}$** (ke sisi dekat) atau **$\\frac{2}{3}a\\sqrt{3}$** (ke sisi seberang)!

### Statistika Data Berkelompok
- **Rata-rata:** $\\bar{x} = \\frac{\\sum f_i x_i}{\\sum f_i}$.
- **Median ($Q_2$) / Kuartil ($Q_k$):**
  $$Q_k = L_b + p \\left(\\frac{\\frac{k}{4}N - F_k}{f_{Q_k}}\\right)$$
- **Modus:**
  $$Mo = L_b + p \\left(\\frac{d_1}{d_1 + d_2}\\right)$$`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Bahasa Inggris",
    description: "Mapel Wajib TKA SMA: Functional & Genre Texts (Analytical/Hortatory Exposition, Discussion, Explanation), Grammar in Context, and Critical Reading.",
    chapters: [
      {
        title: "1. Text Genres & Academic Reading",
        materials: [
          {
            title: "Exposition (Analytical vs Hortatory), Explanation & Discussion Texts",
            duration: 25,
            content: `${DIAG_SMA_ING_GENRE}

### Generic Structure of High School Exam Genres
| Genre | Social Function | Generic Structure | Concluding Element |
|---|---|---|---|
| **Analytical Exposition** | Persuade reader that a thesis is valid | Thesis $\\rightarrow$ Arguments $\\rightarrow$ **Reiteration** | Restates the writer's stance without urging action |
| **Hortatory Exposition** | Persuade reader what **should/should not** be done | Thesis $\\rightarrow$ Arguments $\\rightarrow$ **Recommendation** | Uses *should, ought to, must, it is advisable* |
| **Discussion** | Present **two opposing sides** before judging | Issue $\\rightarrow$ Arguments For & Against $\\rightarrow$ Conclusion | Balances both pros and cons objectively |
| **Explanation** | Explain *how/why* natural or social processes occur | General Statement $\\rightarrow$ Sequenced Explanation $\\rightarrow$ Closing | Passive voice (*is heated, are formed*), causal links |`,
          },
          {
            title: "Core Grammar: Passive Voice, Conditionals, Relative Clauses & Subjunctive",
            duration: 25,
            content: `${DIAG_SMA_ING_GRAMMAR}

### Essential High School Grammar Rules
1. **Passive Voice ($\\text{be} + V_3$):** maintains original tense (*has conducted $\\rightarrow$ has been conducted*; *will release $\\rightarrow$ will be released*).
2. **Conditional Sentences:**
   - **Type 1 (Real Future):** *If + Present Simple, will + $V_1$*.
   - **Type 2 (Unreal Present):** *If + Past Simple (were), would + $V_1$* (*Inversion: Were I you, I would...*).
   - **Type 3 (Unreal Past):** *If + Past Perfect (had $V_3$), would have + $V_3$* (*Inversion: Had she known, she would have...*).
3. **Causative (*have/get/make*):** *have someone $V_1$* vs *have something $V_3$*; *get someone to $V_1$* vs *get something $V_3$*.
4. **Relative Pronouns & Participle Clauses:** *who* (subject person), *whom* (object person), *whose* (possession), *which/that* (things), *where* (= in/at which). Reduced active clause uses **$V_{\\text{-ing}}$**; reduced passive uses **$V_3$**.`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Matematika Tingkat Lanjut",
    description: "Mapel Pilihan TKA SMA: Polinomial (Suku Banyak), Lingkaran Analitik, Irisan Kerucut, Limit, Turunan (Kalkulus Diferensial), Integral & Vektor.",
    chapters: [
      {
        title: "1. Polinomial, Vektor & Geometri Analitik",
        materials: [
          {
            title: "Polinomial (Teorema Sisa, Teorema Faktor & Akar Vieta)",
            duration: 30,
            content: `${DIAG_SMA_MTL_POLI}

### Pembagian Polinomial, Teorema Sisa & Faktor
Polinomial $P(x)$ berderajat $n$: $P(x) = Q(x)\\cdot H(x) + S(x)$ dengan derajat sisa $< \\text{derajat pembagi}$.
- **Teorema Sisa 1:** sisa pembagian $P(x)$ oleh $(x - a)$ adalah **$S = P(a)$**.
- **Teorema Sisa 2:** sisa oleh $(ax + b)$ adalah **$S = P\\left(-\\frac{b}{a}\\right)$**.
- **Teorema Sisa 3:** jika dibagi $(x - a)(x - b)$, sisa berbentuk linier $S(x) = px + q$ yang memenuhi $S(a) = P(a)$ dan $S(b) = P(b)$.
- **Teorema Faktor:** $(x - a)$ adalah faktor $P(x)$ **jika dan hanya jika** $P(a) = 0$.

### Akar Polinomial Berderajat Tiga $ax^3 + bx^2 + cx + d = 0$
Jika akar-akarnya $x_1, x_2, x_3$:
$$x_1 + x_2 + x_3 = -\\frac{b}{a}, \\qquad x_1 x_2 + x_1 x_3 + x_2 x_3 = \\frac{c}{a}, \\qquad x_1 x_2 x_3 = -\\frac{d}{a}$$`,
          },
          {
            title: "Lingkaran Analitik, Garis Singgung & Vektor Ruang",
            duration: 30,
            content: `${DIAG_SMA_MTL_VEKTOR}

### Persamaan Lingkaran & Garis Singgungnya
- Pusat $(a, b)$, jari-jari $r$: $(x - a)^2 + (y - b)^2 = r^2$.
- Bentuk umum $x^2 + y^2 + Ax + By + C = 0$ memiliki pusat $\\left(-\\frac{A}{2}, -\\frac{B}{2}\\right)$ dan jari-jari $r = \\sqrt{\\frac{A^2}{4} + \\frac{B^2}{4} - C}$.
- **Garis Singgung melalui titik $(x_1, y_1)$ pada lingkaran** (*aturan bagi adil*):
  $$x_1 x + y_1 y + \\frac{A}{2}(x + x_1) + \\frac{B}{2}(y + y_1) + C = 0$$
- **Garis Singgung bergradien $m$:** $y - b = m(x - a) \\pm r\\sqrt{m^2 + 1}$.

### Vektor & Proyeksi Ortogonal
Untuk vektor $\\vec{u}$ dan $\\vec{v}$:
- **Dot Product:** $\\vec{u} \\cdot \\vec{v} = |\\vec{u}||\\vec{v}|\\cos\\theta$. (Tegak lurus $\\iff \\vec{u} \\cdot \\vec{v} = 0$).
- **Panjang proyeksi skalar $\\vec{u}$ pada $\\vec{v}$:** $p = \\frac{|\\vec{u}\\cdot\\vec{v}|}{|\\vec{v}|}$.
- **Vektor proyeksi ortogonal $\\vec{u}$ pada $\\vec{v}$:** $\\vec{p} = \\left(\\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{v}|^2}\\right)\\vec{v}$.`,
          },
        ],
      },
      {
        title: "2. Kalkulus: Limit, Turunan & Integral",
        materials: [
          {
            title: "Limit Aljabar, Limit Trigonometri, Turunan & Aplikasinya",
            duration: 30,
            content: `${DIAG_SMA_MTL_TURUNAN}

### Limit Aljabar, Tak Hingga & Trigonometri
- Bentuk tak tentu $\\frac{0}{0}$: selesaikan dengan pemfaktoran, perkalian akar sekawan, atau aturan L'Hôpital ($\\lim \\frac{f'(x)}{g'(x)}$).
- **Limit Tak Hingga Akar Kuadrat:**
  $$\\lim_{x \\to \\infty} \\left(\\sqrt{ax^2 + bx + c} - \\sqrt{ax^2 + px + q}\\right) = \\frac{b - p}{2\\sqrt{a}}$$
- **Identitas Limit Trigonometri ($x \\to 0$):**
  $$\\lim_{x\\to 0}\\frac{\\sin ax}{bx} = \\lim_{x\\to 0}\\frac{\\tan ax}{bx} = \\frac{a}{b}, \\qquad 1 - \\cos ax = 2\\sin^2\\left(\\frac{ax}{2}\\right)$$

### Turunan Fungsi & Nilai Stasioner
- Aturan rantai: $[f(g(x))]' = f'(g(x)) \\cdot g'(x)$; hasil kali: $(uv)' = u'v + uv'$; pembagian: $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$.
- Turunan trigonometri: $(\\sin x)' = \\cos x$, $(\\cos x)' = -\\sin x$, $(\\tan x)' = \\sec^2 x$.
- **Syarat Fungsi Naik/Turun & Stasioner:** naik jika $f'(x) > 0$; turun jika $f'(x) < 0$; stasioner (ekstrem) saat $f'(x) = 0$ (uji turunan kedua: $f''(x) < 0 \\Rightarrow$ **maksimum lokal**, $f''(x) > 0 \\Rightarrow$ **minimum lokal**).`,
          },
          {
            title: "Integral Tak Tentu, Tentu, Substitusi, Luas & Volume Benda Putar",
            duration: 25,
            content: `${DIAG_SMA_MTL_INTEGRAL}

### Rumus Integral Dasar & Substitusi
$$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\; (n \\ne -1), \\qquad \\int (ax+b)^n\\,dx = \\frac{(ax+b)^{n+1}}{a(n+1)} + C$$
$$\\int \\sin(ax+b)\\,dx = -\\frac{1}{a}\\cos(ax+b)+C, \\qquad \\int \\cos(ax+b)\\,dx = \\frac{1}{a}\\sin(ax+b)+C$$
**Teorema Dasar Kalkulus:** $\\int_a^b f(x)\\,dx = F(b) - F(a)$.

### Luas Daerah & Volume Benda Putar
- **Luas antara kurva $y_1 = f(x)$ di atas $y_2 = g(x)$ pada $[a,b]$:**
  $$L = \\int_a^b (f(x) - g(x))\\,dx$$
  Khusus luas daerah dibatasi garis dan kurva kuadrat $ax^2+bx+c=0$: $L = \\frac{D\\sqrt{D}}{6a^2}$.
- **Volume putar mengelilingi sumbu-$X$ sejauh $360^\\circ$:**
  $$V = \\pi \\int_a^b \\left([f(x)]^2 - [g(x)]^2\\right)\\,dx$$`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Fisika",
    description: "Mapel Pilihan TKA SMA: Mekanika (Kinematika, Dinamika, Usaha-Energi, Momentum), Fluida, Termodinamika, Gelombang-Optik, Listrik-Magnet & Fisika Modern.",
    chapters: [
      {
        title: "1. Mekanika, Usaha–Energi & Momentum",
        materials: [
          {
            title: "Kinematika GLBB, Gerak Parabola, Gerak Melingkar & Hukum Newton",
            duration: 30,
            content: `${DIAG_SMA_FIS_KINEMATIKA}

### Kinematika Lurus & Parabola
- **GLBB:** $v_t = v_0 + at$, $\\; s = v_0 t + \\frac{1}{2}at^2$, $\\; v_t^2 = v_0^2 + 2as$.
- **Gerak Parabola** ($v_0$ sudut elevasi $\\alpha$):
  - Komponen mendatar (GLB): $v_x = v_0\\cos\\alpha$ (konstan), $x = (v_0\\cos\\alpha)t$.
  - Komponen vertikal (GVA): $v_y = v_0\\sin\\alpha - gt$, $\\; y = (v_0\\sin\\alpha)t - \\frac{1}{2}gt^2$.
  - **Tinggi maksimum:** $h_{\\max} = \\frac{v_0^2 \\sin^2\\alpha}{2g}$; **Jangkauan mendatar maks:** $X_{\\max} = \\frac{v_0^2 \\sin 2\\alpha}{g}$.

### Dinamika Hukum Newton & Gaya Gesek
$$\\sum \\vec{F} = m\\vec{a}, \\qquad f_s \\le \\mu_s N, \\qquad f_k = \\mu_k N$$
Pada bidang miring sudut $\\theta$: komponen sejajar bidang $= mg\\sin\\theta$ dan gaya normal $N = mg\\cos\\theta$.`,
          },
          {
            title: "Usaha–Energi, Hukum Kekekalan Energi & Momentum–Tumbukan",
            duration: 25,
            content: `${DIAG_SMA_FIS_ENERGI}

### Usaha, Energi Kinetik, Potensial & Daya
- $W = F \\cdot s \\cos\\theta = \\Delta E_k = \\frac{1}{2}m(v_2^2 - v_1^2)$.
- **Energi Mekanik Kekal** (bila tidak ada gaya gesek): $E_{k1} + E_{p1} = E_{k2} + E_{p2}$.
- Bila ada gaya gesek $f_k$ sepanjang lintasan $s$: $W_{\\text{gesek}} = -f_k \\cdot s = \\Delta E_m$.

### Momentum, Impuls & Koefisien Restitusi ($e$)
- **Impuls = Perubahan Momentum:** $I = F\\Delta t = m(v_2 - v_1)$.
- **Kekekalan Momentum:** $m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'$.
- **Koefisien Restitusi:** $e = -\\frac{v_2' - v_1'}{v_2 - v_1}$ ($e=1$ lenting sempurna; $0 < e < 1$ lenting sebagian; $e=0$ tidak lenting sama sekali: $v_1' = v_2'$).`,
          },
        ],
      },
      {
        title: "2. Fluida, Termodinamika, Gelombang, Listrik–Magnet & Modern",
        materials: [
          {
            title: "Fluida Statis–Dinamis, Termodinamika & Gelombang–Optik",
            duration: 30,
            content: `${DIAG_SMA_FIS_FLUIDA}

### Fluida Statis & Asas Bernoulli
- Tekanan hidrostatis: $P_h = \\rho g h$; Gaya Archimedes: $F_A = \\rho_{\\text{fluida}} \\cdot g \\cdot V_{\\text{tercelup}}$.
- **Kontinuitas & Bernoulli:** $A_1 v_1 = A_2 v_2$ dan $P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho g h_1 = P_2 + \\frac{1}{2}\\rho v_2^2 + \\rho g h_2$.
- **Tangki bocor (Torricelli):** $v = \\sqrt{2gh}$ dan jangkauan air mendatar $x = 2\\sqrt{h(H - h)}$.

### Termodinamika & Mesin Carnot
- Gas ideal: $PV = nRT$; Hukum I Termodinamika: $\\Delta U = Q - W$.
- Proses: Isobarik ($W = P\\Delta V$), Isokhorik ($W = 0$), Isotermal ($\\Delta U = 0$), Adiabatik ($Q = 0$).
- **Efisiensi Carnot:** $\\eta = \\left(1 - \\frac{T_{\\text{rendah}}}{T_{\\text{tinggi}}}\\right) \\times 100\\%$ ($T$ wajib dalam Kelvin!).

### Gelombang, Efek Doppler & Alat Optik
- **Efek Doppler:** $f_p = \\frac{v \\pm v_p}{v \\mp v_s} f_s$ (*mendekat pembilang $+$, penyebut $-$*).
- **Lensa & Cermin:** $\\frac{1}{f} = \\frac{1}{s} + \\frac{1}{s'}$ dan perbesaran $M = \\left|\\frac{s'}{s}\\right|$.`,
          },
          {
            title: "Listrik Statis–Dinamis, Induksi Elektromagnetik & Fisika Kuantum",
            duration: 30,
            content: `${DIAG_SMA_FIS_LISTRIK}

### Listrik Statis, Rangkaian DC & Kemagnetan
- **Gaya Coulomb & Medan Listrik:** $F = k\\frac{q_1 q_2}{r^2}$, $\\; E = k\\frac{q}{r^2}$, $\\; V = k\\frac{q}{r}$.
- **Hukum Ohm & Kirchhoff:** $V = IR$; Daya $P = VI = I^2R = \\frac{V^2}{R}$.
- **Gaya Lorentz:** muatan bergerak $F = qvB\\sin\\theta$; kawat berarus $F = BIL\\sin\\theta$.
- **Hukum Faraday (GGL Induksi):** $\\varepsilon = -N\\frac{\\Delta\\Phi}{\\Delta t}$; Transformator ideal $\\frac{V_p}{V_s} = \\frac{N_p}{N_s} = \\frac{I_s}{I_p}$.

### Fisika Modern & Efek Fotolistrik
- Energi foton: $E = hf = \\frac{hc}{\\lambda}$.
- **Efek Fotolistrik:** $E_{k\\max} = hf - W_0 = h(f - f_0)$ (hanya terjadi bila $f > f_0$ atau $\\lambda < \\lambda_0$; intensitas hanya memperbanyak jumlah elektron, tidak menambah $E_{k\\max}$!).
- **Peluruhan Radioaktif:** $N_t = N_0 \\left(\\frac{1}{2}\\right)^{t / T_{1/2}}$.`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Kimia",
    description: "Mapel Pilihan TKA SMA: Stoikiometri, Struktur Atom & Ikatan, Termokimia–Laju–Kesetimbangan, Asam–Basa–Ksp, Redoks–Elektrokimia & Kimia Organik.",
    chapters: [
      {
        title: "1. Kimia Dasar, Termokimia, Laju & Kesetimbangan",
        materials: [
          {
            title: "Stoikiometri, Mol, Pereaksi Pembatas, Struktur Atom & Ikatan Kimia",
            duration: 30,
            content: `${DIAG_SMA_KIM_STOIK}

### Hubungan Mol Lengkap (Pusat Stoikiometri)
$$n = \\frac{m}{M_r} = \\frac{V_{\\text{STP}}}{22{,}4} = \\frac{N_{\\text{partikel}}}{6{,}02 \\times 10^{23}} = M \\cdot V_{\\text{larutan}} = \\frac{PV}{RT}$$
- **Pereaksi Pembatas:** bagi masing-masing mol awal zat reaktan dengan koefisien reaksinya; nilai hasil bagi **paling kecil** menentukan zat yang habis duluan dan menjadi dasar seluruh perbandingan mol hasil reaksi!

### Konfigurasi Elektron, Bilangan Kuantum & Bentuk Molekul
- Urutan energi subkulit (Aufbau): $1s\\; 2s\\; 2p\\; 3s\\; 3p\\; 4s\\; 3d\\; 4p\\; 5s\\dots$ (**Golongan** = elektron valensi; **Periode** = kulit $n$ tertinggi).
- **Empat Bilangan Kuantum:** $n$ (kulit $1,2,\\dots$), $l$ ($s=0, p=1, d=2, f=3$), $m$ ($-l$ s.d. $+l$), $s$ ($+\\frac{1}{2}$ atau $-\\frac{1}{2}$).
- **Teori VSEPR ($AX_m E_n$):** jumlah domain elektron menentukan bentuk molekul (*tetrahedral $AX_4$, piramida trigonal $AX_3E$, bentuk-V $AX_2E_2$, linear $AX_2$*).`,
          },
          {
            title: "Termokimia, Laju Reaksi & Kesetimbangan Kimia",
            duration: 30,
            content: `${DIAG_SMA_KIM_TERMO}

### Empat Cara Menghitung Entalpi Reaksi ($\\Delta H$)
1. **Kalorimeter:** $Q_{\\text{larutan}} = m c \\Delta T$, maka $\\Delta H = -\\frac{Q}{n}$ *(reaksi eksoterm $\\Delta H < 0$, suhu naik)*.
2. **Hukum Hess:** jika reaksi dibalik, $\\Delta H$ berganti tanda; jika reaksi dikali $k$, $\\Delta H$ dikali $k$.
3. **Data $\\Delta H_f^\\circ$:** $\\Delta H_{\\text{reaksi}} = \\sum \\Delta H_f^\\circ(\\text{produk}) - \\sum \\Delta H_f^\\circ(\\text{reaktan})$.
4. **Energi Ikatan Rata-Rata:** $\\Delta H = \\sum E_{\\text{pemutusan (reaktan)}} - \\sum E_{\\text{pembentukan (produk)}}$.

### Laju Reaksi & Kesetimbangan ($K_c, K_p$)
- Hukum Laju $v = k[A]^x[B]^y$: tentukan orde $x, y$ dari membandingkan dua percobaan dengan konsentrasi zat lain tetap.
- **Kesetimbangan ($K_c$ vs $K_p$):** hanya masukkan fasa **(g)** dan **(aq)** ke $K_c$; hanya fasa **(g)** ke $K_p$. Hubungan: $K_p = K_c(RT)^{\\Delta n}$.
- **Asas Le Chatelier (Pergeseran Kesetimbangan):**
  - Tambah konsentrasi reaktan $\\rightarrow$ geser ke kanan;
  - Tekanan diperbesar (volume diperkecil) $\\rightarrow$ geser ke jumlah **koefisien gas lebih kecil**;
  - Suhu dinaikkan $\\rightarrow$ geser ke arah reaksi **endoterm ($\\Delta H > 0$)**.`,
          },
        ],
      },
      {
        title: "2. Larutan Asam–Basa, Sifat Koligatif, Elektrokimia & Organik",
        materials: [
          {
            title: "Asam–Basa, Larutan Penyangga, Hidrolisis, Ksp & Koligatif",
            duration: 30,
            content: `${DIAG_SMA_KIM_LARUTAN}

### Perhitungan pH Larutan
- **Asam/Basa Kuat:** $[H^+] = a \\cdot M_a$, $\\; [OH^-] = b \\cdot M_b$.
- **Asam/Basa Lemah:** $[H^+] = \\sqrt{K_a \\cdot M_a}$, $\\; [OH^-] = \\sqrt{K_b \\cdot M_b}$.
- **Larutan Penyangga (Buffer — ada sisa lemah + konjugasinya):**
  $$[H^+] = K_a \\cdot \\frac{n_{\\text{asam lemah}}}{n_{\\text{basa konjugasi}}}$$
- **Hidrolisis Garam (asam & basa tepat habis bereaksi membentuk garam terhidrolisis):**
  - Garam asam kuat + basa lemah (bersifat asam): $[H^+] = \\sqrt{\\frac{K_w}{K_b} [\\text{Kation}]}$.
  - Garam basa kuat + asam lemah (bersifat basa): $[OH^-] = \\sqrt{\\frac{K_w}{K_a} [\\text{Anion}]}$.
- **Sifat Koligatif Larutan (faktor van't Hoff $i = 1 + (n-1)\\alpha$):** $\\Delta T_b = K_b m i$, $\\Delta T_f = K_f m i$, $\\pi = M R T i$.`,
          },
          {
            title: "Redoks, Sel Volta, Elektrolisis & Gugus Fungsi Senyawa Karbon",
            duration: 25,
            content: `${DIAG_SMA_KIM_ELEKTRO}

### Sel Volta vs Sel Elektrolisis (K–An)
- **Aturan abjad elektrode selalu berlaku:** **K**atode = **Reduksi**; **An**ode = **Oksidasi**.
- **Sel Volta (Spontan, $E_{\\text{sel}}^\\circ > 0$):** Katode kutub positif ($+$), Anode kutub negatif ($-$).
  $$E_{\\text{sel}}^\\circ = E_{\\text{katode (reduksi)}}^\\circ - E_{\\text{anode (oksidasi)}}^\\circ$$
- **Hukum Faraday (Elektrolisis):** massa endapan $w = \\frac{e \\cdot i \\cdot t}{96.500}$ dengan $e = \\frac{A_r}{\\text{valensi elektron}}$.

### Isomer Gugus Fungsi Senyawa Organik
- **Alkohol ($-OH$)** berisomer fungsi dengan **Eter ($-O-$)** ($C_n H_{2n+2} O$).
- **Aldehid ($-CHO$)** berisomer fungsi dengan **Keton ($-CO-$)** ($C_n H_{2n} O$). *(Aldehid memerah-batakan Fehling & menghasilkan cermin perak Tollens; Keton tidak!).*
- **Asam Karboksilat ($-COOH$)** berisomer fungsi dengan **Ester ($-COO-$)** ($C_n H_{2n} O_2$).`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Biologi",
    description: "Mapel Pilihan TKA SMA: Sel & Transpor Membran, Metabolisme (Enzim, Respirasi, Fotosintesis), Genetika & Sintesis Protein, Evolusi & Bioteknologi.",
    chapters: [
      {
        title: "1. Biologi Sel, Metabolisme & Fisiologi",
        materials: [
          {
            title: "Organel Sel, Transpor Membran & Enzim–Metabolisme Sel",
            duration: 30,
            content: `${DIAG_SMA_BIO_SEL}

### Organel Sel & Transpor Membran
- **Prokariotik vs Eukariotik:** prokariotik tidak punya membran inti dan tidak punya organel bermembran rangkap (mitokondria/kloroplas).
- **Transpor Pasif (tanpa ATP, mengikuti gradien konsentrasi):** difusi sederhana, difusi terfasilitasi (kanal/pembawa), dan osmosis (perpindahan pelarut dari **hipotonik** ke **hipertonik**; sel tumbuhan dalam hipertonik mengalami **plasmolisis**).
- **Transpor Aktif (butuh ATP, melawan gradien):** pompa $Na^+/K^+$, endositosis, eksositosis.

### Enzim, Respirasi Aerob & Fotosintesis
- **Sifat Enzim:** biokatalisator protein, bekerja spesifik (*lock-and-key / induced fit*), menurunkan energi aktivasi ($E_a$), rusak/terdenaturasi oleh suhu tinggi & pH ekstrem.
- **Respirasi Aerob ($C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + 36\\text{–}38\\text{ ATP}$):**
  1. **Glikolisis** (sitoplasma): glukosa $\\rightarrow$ 2 asam piruvat + 2 ATP + 2 NADH.
  2. **Dekarboksilasi Oksidatif** (matriks mitokondria): $\\rightarrow$ 2 asetil-KoA + 2 NADH + 2 $CO_2$.
  3. **Siklus Krebs** (matriks): $\\rightarrow$ 2 ATP + 6 NADH + 2 $\\text{FADH}_2$ + 4 $CO_2$.
  4. **Transpor Elektron** (krista mitokondria): $O_2$ sebagai akseptor elektron terakhir membentuk $H_2O$.
- **Fotosintesis:** Reaksi terang di **tilakoid/grana** (menghasilkan ATP, NADPH, dan $O_2$ dari fotolisis $H_2O$); Siklus Calvin (reaksi gelap) di **stroma** (fiksasi $CO_2$ oleh RuBisCO menjadi glukosa).`,
          },
          {
            title: "Sistem Tubuh Manusia & Homeostasis",
            duration: 25,
            content: `${DIAG_SMA_BIO_FISIOLOGI}

### Ringkasan Sistem Organ Penting
- **Sistem Pencernaan:** Amilase (mulut/pankreas: amilum $\\rightarrow$ maltosa), Pepsin (lambung + HCl: protein $\\rightarrow$ pepton), Tripsin/Lipase (duodenum), penyerapan utama di ileum (vili).
- **Sistem Peredaran Darah:** Jantung 4 ruang; peredaran kecil (bilik kanan $\\rightarrow$ paru-paru $\\rightarrow$ serambi kiri); peredaran besar (bilik kiri $\\rightarrow$ aorta $\\rightarrow$ seluruh tubuh $\\rightarrow$ serambi kanan).
- **Sistem Ekskresi (Nefron Ginjal):**
  1. **Filtrasi** (glomerulus $\\rightarrow$ urine primer, tidak mengandung protein/eritrosit);
  2. **Reabsorpsi** (TKP $\\rightarrow$ penyerapan ulang glukosa & asam amino 100%, menghasilkan urine sekunder);
  3. **Augmentasi** (TKD $\\rightarrow$ sekresi ion $H^+, K^+$, urea membentuk urine sesungguhnya).
- **Hormon Pengatur Gula Darah:** *Insulin* (sel beta pankreas) menurunkan glukosa darah (glukosa $\\rightarrow$ glikogen); *Glukagon* menaikkannya.`,
          },
        ],
      },
      {
        title: "2. Genetika, Pembelahan Sel, Evolusi & Bioteknologi",
        materials: [
          {
            title: "Mitosis–Meiosis, Sintesis Protein, Hukum Mendel & Hardy–Weinberg",
            duration: 30,
            content: `${DIAG_SMA_BIO_GEN}

### Pembelahan Sel & Sintesis Protein
- **Mitosis:** 1 kali pembelahan, sel somatik, menghasilkan 2 sel anak **identik ($2n$)**. Urutan: *Profase – Metafase (ekuator) – Anafase (menuju kutub) – Telofase*.
- **Meiosis:** 2 kali pembelahan, sel gamet, menghasilkan 4 sel anak **haploid ($n$)** disertai *crossing over* pada Profase I.
- **Sintesis Protein (Dogma Sentral):**
  1. **Transkripsi (inti sel):** DNA template ($3'\\to 5'$) disalin menjadi mRNA ($5'\\to 3'$) dengan basa U menggantikan T.
  2. **Translasi (ribosom di sitoplasma):** kodon mRNA berpasangan dengan antikodon tRNA membawa asam amino spesifik sesuai kode genetik (start kodon *AUG*; stop *UAA, UAG, UGA*).

### Pewarisan Sifat & Genetika Populasi (Hardy–Weinberg)
- Dihibrid Mendel ($AaBb \\times AaBb$) normal $= 9:3:3:1$; penyimpangan semu: Kriptomeri ($9:3:4$), Epistasis–Hipostasis ($12:3:1$), Polimeri ($15:1$), Komplementer ($9:7$).
- **Hukum Hardy–Weinberg:** pada populasi seimbang:
  $$p + q = 1, \\qquad p^2 + 2pq + q^2 = 1$$
  dengan $q^2 =$ frekuensi fenotipe resesif, dan $2pq =$ frekuensi pembawa (*carrier*) heterozigot!`,
          },
        ],
      },
    ],
  },
];

