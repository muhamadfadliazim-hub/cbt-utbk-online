import { CurriculumSubjectSeed } from "./types";
import {
  DIAG_SMP_INDO_BERITA,
  DIAG_SMP_INDO_EJAAN,
  DIAG_SMP_INDO_SASTRA,
  DIAG_SMP_MAT_ARIT,
  DIAG_SMP_MAT_GARIS,
  DIAG_SMP_MAT_SEBANGUN,
  DIAG_SMP_MAT_PYTHAGORAS,
  DIAG_SMP_MAT_STAT,
  DIAG_SD_INDO_CERITA,
  DIAG_SD_INDO_EJAAN,
  DIAG_SD_MAT_BIL,
  DIAG_SD_MAT_SATUAN,
  DIAG_SD_MAT_BANGUN,
} from "./diagrams/tkaSmpSdDiagrams";

export const TKA_SMP_SD_CURRICULUM: CurriculumSubjectSeed[] = [
  {
    examType: "TKA_SMP",
    title: "TKA SMP · Bahasa Indonesia",
    description: "Mapel Wajib TKA SMP: Teks Berita, Teks Deskripsi–Prosedur–LHO, Unsur Kebahasaan Baku, EYD V Dasar & Apresiasi Cerpen/Fabel/Puisi.",
    chapters: [
      {
        title: "1. Teks Informasi, Kebahasaan & Ejaan SMP",
        materials: [
          {
            title: "Unsur Berita (ADIKSIMBA), Ide Pokok, Teks Prosedur & Laporan Observasi",
            duration: 25,
            content: `${DIAG_SMP_INDO_BERITA}

### Teks Berita & Pola ADIKSIMBA (5W + 1H)
Setiap berita memuat enam unsur utama: **Apa, Di mana, Kapan, Siapa, Mengapa, Bagaimana** (ADIKSIMBA).
- Bagian paling penting terletak di **Kepala Berita (Lead)** pada paragraf awal (*piramida terbalik*).

### Ide Pokok & Simpulan Paragraf
- **Kalimat Utama:** kalimat yang mengandung inti permasalahan (umumnya di awal paragraf atau di akhir dengan penanda *jadi, oleh karena itu, dengan demikian*).
- **Simpulan:** rangkuman singkat yang mewakili **kalimat utama dan gagasan penjelas penting** tanpa mengurangi kebenaran teks.

### Struktur Teks Laporan Hasil Observasi (LHO) & Teks Prosedur
- **LHO:** *Pernyataan Umum / Klasifikasi* $\\rightarrow$ *Deskripsi Bagian* $\\rightarrow$ *Deskripsi Manfaat* (bersifat objektif, berdasarkan fakta pengamatan).
- **Teks Prosedur:** *Tujuan* $\\rightarrow$ *Alat/Bahan (opsional)* $\\rightarrow$ *Langkah-langkah urut* $\\rightarrow$ *Penutup*; ciri bahasanya **kalimat perintah (imperatif)**, kata keterangan urutan (*kemudian, lalu, setelah itu*), serta takaran akurat.`,
          },
          {
            title: "Kalimat Efektif, Kata Baku & Ejaan Tanda Baca Tingkat SMP",
            duration: 20,
            content: `${DIAG_SMP_INDO_EJAAN}

### Kaidah Ejaan Penting di Soal TKA SMP
1. **Huruf Kapital:** awal kalimat, nama orang, nama bulan/hari, nama geografi dengan namanya (*Gunung Merapi, Sungai Bengawan Solo*), judul karangan kecuali kata tugas (*di, ke, dari, dan, yang*).
2. **Kata Depan *di-* vs Awalan *di-*:** dipisah jika menunjuk lokasi (*di sekolah, di rumah*), disambung jika menyatakan tindakan pasif (*ditulis, disapu*).
3. **Kalimat Tidak Efektif (Pemborosan Kata):** hindari *para siswa-siswa*, *agar supaya*, *banyak buku-buku*, *naik ke atas*, *hadirin sekalian yang berbahagia semua*.
4. **Tanda Baca Rincian:** tambahkan tanda koma sebelum kata *dan* atau *atau* pada perincian minimal 3 benda (*ibu membeli bayam, wortel, dan kentang*).`,
          },
        ],
      },
      {
        title: "2. Karya Sastra & Surat",
        materials: [
          {
            title: "Cerpen, Fabel, Puisi Rakyat (Pantun–Syair–Gurindam) & Surat Resmi",
            duration: 20,
            content: `${DIAG_SMP_INDO_SASTRA}

### Perbedaan Puisi Lama (Pantun, Syair, Gurindam)
| Bentuk | Jumlah Baris/Bait | Pola Rima | Fungsi Isi |
|---|---|---|---|
| **Pantun** | 4 baris | $a\\text{–}b\\text{–}a\\text{–}b$ | Baris 1–2 sampiran; baris 3–4 isi/nasihat |
| **Syair** | 4 baris | $a\\text{–}a\\text{–}a\\text{–}a$ | Semua baris berupa **isi cerita/nasihat** |
| **Gurindam** | 2 baris | $a\\text{–}a$ | Baris 1 syarat/sebab; baris 2 jawaban/akibat |

### Surat Pribadi vs Surat Dinas (Resmi)
Surat dinas wajib memiliki **kop surat, nomor surat, hal/perihal, alamat tujuan tanpa kata *"Kepada"* ganda sebelum *"Yth."*** (*Yth. Kepala SMP Negeri 1*, bukan *Kepada Yth. Bapak Kepala...*), ragam bahasa baku, serta stempel/tanda tangan pejabat.`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SMP",
    title: "TKA SMP · Matematika",
    description: "Mapel Wajib TKA SMP: Bilangan & Aritmetika Sosial, Aljabar–SPLDV–Fungsi Linear, Pythagoras, Lingkaran, Bangun Ruang Sisi Lengkung, Statistika & Peluang.",
    chapters: [
      {
        title: "1. Bilangan, Aritmetika Sosial & Aljabar SMP",
        materials: [
          {
            title: "Operasi Bilangan Bulat–Pecahan, Perbandingan, Skala & Aritmetika Sosial",
            duration: 25,
            content: `${DIAG_SMP_MAT_ARIT}

### Urutan Operasi & Pecahan
Kerjakan berurutan: **(1) Tanda kurung**, **(2) Pangkat/akar**, **(3) Kali & bagi dari kiri ke kanan**, **(4) Tambah & kurang dari kiri ke kanan**.

### Aritmetika Sosial Dasar SMP
- **Untung / Rugi:** $\\%U = \\frac{\\text{Harga Jual} - \\text{Harga Beli}}{\\text{Harga Beli}} \\times 100\\%$; selalu bagi terhadap **Harga Beli**!
- **Bruto, Neto, Tara:**
  $$\\text{Bruto (kotor)} = \\text{Neto (bersih)} + \\text{Tara (kemasan)}$$
- **Bunga Tunggal Bank** ($b\\%$ per tahun selama $m$ bulan):
  $$B = M_0 \\times \\frac{b}{100} \\times \\frac{m}{12}$$`,
          },
          {
            title: "Aljabar, PLSV, PtLSV, Gradien, Persamaan Garis & SPLDV",
            duration: 25,
            content: `${DIAG_SMP_MAT_GARIS}

### Pemfaktoran Aljabar & SPLDV
- $a^2 - b^2 = (a - b)(a + b)$ dan $(a \\pm b)^2 = a^2 \\pm 2ab + b^2$.
- **SPLDV:** selesaikan dengan **eliminasi** (samakan salah satu koefisien) dilanjutkan **substitusi** untuk mendapatkan pasangan $(x, y)$.

### Fungsi Linear $f(x) = ax + b$ & Persamaan Garis
- Gradien garis melalui $(x_1, y_1)$ dan $(x_2, y_2)$: $m = \\frac{y_2 - y_1}{x_2 - x_1}$.
- Persamaan garis bergradien $m$ melalui $(x_1, y_1)$: $y - y_1 = m(x - x_1)$.
- Sejajar: $m_1 = m_2$; Tegak lurus: $m_1 \\times m_2 = -1$.`,
          },
        ],
      },
      {
        title: "2. Geometri, Pythagoras, Statistika & Peluang SMP",
        materials: [
          {
            title: "Kesebangunan, Kekongruenan Segitiga, Trapesium & Foto-Karton SMP",
            duration: 30,
            content: `${DIAG_SMP_MAT_SEBANGUN}

### Syarat Kesebangunan & Kekongruenan Bangun Datar
1. **Kongruen ($\\cong$):** sudut bersesuaian sama besar **dan** sisi bersesuaian **sama panjang** ($k = 1$). Kriteria segitiga kongruen: **S-S-S**, **S-Sd-S**, **Sd-S-Sd**.
2. **Sebangun ($\\sim$):** sudut bersesuaian **sama besar**, dan perbandingan sisi bersesuaian **senilai** ($\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}$).

### Rumus Praktis Kesebangunan Tingkat SMP
- **Segitiga Bertumpuk Garis Sejajar ($DE \\parallel BC$):**
  $$\\frac{AD}{AB} = \\frac{AE}{AC} = \\frac{DE}{BC} \\qquad \\text{dan} \\qquad \\frac{AD}{DB} = \\frac{AE}{EC}$$
- **Trapesium Garis Sejajar Tengah ($EF$):**
  $$EF = \\frac{CD \\cdot AE + AB \\cdot DE}{DE + AE}$$
- **Segitiga Siku-Siku dengan Garis Tinggi $CD \\perp AB$:**
  $$CD^2 = AD \\cdot DB, \\qquad AC^2 = AD \\cdot AB, \\qquad BC^2 = BD \\cdot AB$$
- **Foto & Karton Sebangun:** Foto berukuran $30\\text{ cm} \\times 40\\text{ cm}$ ditempel pada karton dengan sisa kiri, kanan, dan atas masing-masing $3\\text{ cm}$. Agar foto dan karton sebangun, hitung sisa karton bagian bawah ($b$)!
  - Lebar karton $= 30 + 3 + 3 = 36\\text{ cm}$, tinggi karton $= 40 + 3 + b = 43 + b$.
  - Karena sebangun: $\\frac{30}{36} = \\frac{40}{43 + b} \\implies \\frac{5}{6} = \\frac{40}{43 + b} \\implies 43 + b = 48 \\implies b = \\mathbf{5\\text{ cm}}$.`,
          },
          {
            title: "Pythagoras, Lingkaran & Bangun Ruang Sisi Lengkung",
            duration: 30,
            content: `${DIAG_SMP_MAT_PYTHAGORAS}

### Teorema Pythagoras & Jenis Segitiga
Untuk sisi terpanjang $c$ dan dua sisi lain $a, b$:
- $c^2 = a^2 + b^2 \\implies$ **siku-siku**; $c^2 < a^2 + b^2 \\implies$ **lancip**; $c^2 > a^2 + b^2 \\implies$ **tumpul**.
- Sudut segitiga istimewa: $45^\\circ\\text{–}45^\\circ\\text{–}90^\\circ$ berbanding $1 : 1 : \\sqrt{2}$; sudut $30^\\circ\\text{–}60^\\circ\\text{–}90^\\circ$ berbanding $1 : \\sqrt{3} : 2$.

### Lingkaran & Bangun Ruang Sisi Lengkung
- Panjang busur $= \\frac{\\alpha}{360^\\circ} \\times 2\\pi r$; Luas juring $= \\frac{\\alpha}{360^\\circ} \\times \\pi r^2$.
- Garis singgung persekutuan luar ($d$) vs dalam ($D$) dua lingkaran berjari-jari $R, r$ dan jarak pusat $p$:
  $$d_{\\text{luar}} = \\sqrt{p^2 - (R - r)^2}, \\qquad D_{\\text{dalam}} = \\sqrt{p^2 - (R + r)^2}$$
- **Tabung:** $V = \\pi r^2 t$, $L_{\\text{selimut}} = 2\\pi r t$. **Kerucut:** $V = \\frac{1}{3}\\pi r^2 t$, $L_{\\text{selimut}} = \\pi r s$. **Bola:** $V = \\frac{4}{3}\\pi r^3$, $L = 4\\pi r^2$.`,
          },
          {
            title: "Statistika Tunggal (Mean, Median, Modus) & Peluang Empirik–Teoretik",
            duration: 20,
            content: `${DIAG_SMP_MAT_STAT}

### Ukuran Pemusatan Data Tunggal
- **Mean (Rata-rata):** $\\bar{x} = \\frac{\\text{Jumlah seluruh nilai}}{\\text{Banyak data}}$.
- **Median:** nilai **tengah** setelah data **diurutkan** dari kecil ke besar (jika $n$ genap, ambil rata-rata dua nilai tengah!).
- **Modus:** nilai yang **paling sering muncul** (frekuensi terbesar).

### Peluang Teoretik & Frekuensi Harapan
- $P(A) = \\frac{n(A)}{n(S)}$ dengan $0 \\le P(A) \\le 1$.
- Pada lemparan 2 dadu ($n(S) = 36$); 3 uang logam ($n(S) = 8$).
- **Frekuensi Harapan** dalam $N$ percobaan: $F_h(A) = P(A) \\times N$.`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SD",
    title: "TKA SD · Bahasa Indonesia",
    description: "Mapel Wajib TKA SD/MI: Membaca Pemahaman Teks Pendek, Kalimat Utama & Simpulan, Ejaan Huruf Kapital/Tanda Baca Dasar, Sinonim–Antonim & Puisi/Cerita Anak.",
    chapters: [
      {
        title: "1. Pemahaman Teks & Kebahasaan SD",
        materials: [
          {
            title: "Menemukan Gagasan Pokok, Informasi Tersurat, Tokoh & Amanat Cerita",
            duration: 20,
            content: `${DIAG_SD_INDO_CERITA}

### Cara Cepat Menemukan Kalimat Utama & Gagasan Pokok
1. Baca kalimat **pertama** dan kalimat **terakhir** paragraf secara teliti.
2. Kalimat penjelas hanya memberi contoh, angka rinci, atau alasan; sedangkan **kalimat utama** berisi pernyataan paling umum yang dijelaskan oleh kalimat lain.
3. **Makna Kata Sulit:** pahami arti kata baru (*misal: reboisasi, flora, fauna, habitat*) berdasarkan kalimat di sekitarnya.

### Unsur Cerita Anak & Amanat
- **Tokoh Utama:** tokoh yang paling banyak diceritakan dari awal sampai akhir.
- **Watak Tokoh:** sifat tokoh (*jujur, dermawan, sombong, penyabar*) terlihat dari percakapan dan perbuatannya dalam cerita.
- **Amanat:** pesan kebaikan yang ingin disampaikan pengarang agar pembaca melakukan hal baik atau menjauhi perilaku buruk.`,
          },
          {
            title: "Ejaan Dasar (Huruf Kapital, Titik, Koma, Tanya, Seru) & Kata Baku",
            duration: 20,
            content: `${DIAG_SD_INDO_EJAAN}

### Aturan Penggunaan Huruf Kapital SD
1. Huruf pertama **awal kalimat** (*Adik bermain di halaman.*).
2. Huruf pertama **nama orang**, **nama bulan & hari** (*Senin, Februari*), **hari raya** (*Idulfitri*), dan **nama kota/negara** (*Bandung, Indonesia*).
3. Kata ***"Saya"*** di awal kalimat atau nama Tuhan (*Allah Yang Maha Pengasih*).

### Fungsi Empat Tanda Baca Dasar
- **Tanda Titik (.):** mengakhiri kalimat berita/pernyataan dan singkatan nama orang.
- **Tanda Koma (,):** memisahkan perincian lebih dari dua benda (*apel, jeruk, dan mangga*) serta di belakang kata seru (*Wah, indah sekali!*).
- **Tanda Tanya (?):** mengakhiri kalimat tanya (*Di mana rumahmu?*).
- **Tanda Seru (!):** mengakhiri kalimat perintah atau ajakan (*Tutup pintunya!*).`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SD",
    title: "TKA SD · Matematika",
    description: "Mapel Wajib TKA SD/MI: Bilangan Cacah, FPB–KPK, Pecahan & Persen, Satuan Panjang–Berat–Waktu–Debit, Bangun Datar–Ruang & Pengolahan Data.",
    chapters: [
      {
        title: "1. Bilangan, Pecahan, FPB–KPK & Satuan Pengukuran",
        materials: [
          {
            title: "Operasi Bilangan Cacah–Bulat, FPB–KPK Soal Cerita & Pecahan–Persen",
            duration: 25,
            content: `${DIAG_SD_MAT_BIL}

### Membedakan Soal Cerita FPB vs KPK
| Kata Kunci di Soal Cerita | Pakai Rumus | Artinya |
|---|---|---|
| *"dibagi sama banyak"*, *"jumlah paket terbanyak"*, *"paling banyak tiap kelompok"* | **FPB** (ambil faktor prima sama pangkat **terkecil**) | Membagi benda menjadi bagian sama banyak |
| *"bersamaan lagi"*, *"setiap $x$ hari dan $y$ hari"*, *"lampu menyala bersama"* | **KPK** (ambil semua faktor prima pangkat **terbesar**) | Mencari pertemuan waktu berikutnya |

### Pecahan, Desimal & Persen
- Mengurutkan pecahan berbeda bentuk: **ubah semua ke desimal 2 angka di belakang koma atau ke persen** (mis. $\\frac{3}{4} = 75\\%$, $0{,}7 = 70\\%$, $\\frac{4}{5} = 80\\%$).
- Penjumlahan & pengurangan pecahan biasa: **samakan penyebutnya** menggunakan KPK penyebut.
- Pembagian pecahan: balik pecahan pembagi lalu kalikan: $\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$.`,
          },
          {
            title: "Konversi Satuan (Panjang, Berat, Luas, Volume, Waktu, Kecepatan & Debit)",
            duration: 25,
            content: `${DIAG_SD_MAT_SATUAN}

### Tangga Satuan Wajib Kuasai
1. **Panjang:** $\\text{km} - \\text{hm} - \\text{dam} - \\text{m} - \\text{dm} - \\text{cm} - \\text{mm}$ (turun 1 tangga $\\times 10$, naik 1 tangga $\\div 10$).
2. **Luas ($^2$):** setiap 1 tangga bernilai $\\times 100$ atau $\\div 100$; ingat **$1\\text{ hektare (ha)} = 1\\text{ hm}^2 = 10.000\\text{ m}^2$**.
3. **Volume ($^3$ & liter):** setiap 1 tangga kubik bernilai $\\times 1.000$; ingat **$1\\text{ liter} = 1\\text{ dm}^3$** dan **$1\\text{ mL} = 1\\text{ cm}^3$**.
4. **Berat:** $1\\text{ ton} = 1.000\\text{ kg}$, $\\; 1\\text{ kuintal} = 100\\text{ kg}$, $\\; 1\\text{ kg} = 10\\text{ ons} = 1.000\\text{ gram}$.

### Segitiga Rumus Jarak–Kecepatan–Waktu & Volume–Debit–Waktu
- $J = K \\times W \\implies K = \\frac{J}{W}, \\quad W = \\frac{J}{K}$.
- $V = D \\times W \\implies D = \\frac{V}{W}, \\quad W = \\frac{V}{D}$.`,
          },
        ],
      },
      {
        title: "2. Bangun Datar, Bangun Ruang & Pengolahan Data SD",
        materials: [
          {
            title: "Keliling & Luas Bangun Datar, Volume Kubus–Balok–Tabung & Rata-Rata",
            duration: 25,
            content: `${DIAG_SD_MAT_BANGUN}

### Rumus Luas & Keliling Bangun Datar
| Bangun | Keliling | Luas |
|---|---|---|
| **Persegi** (sisi $s$) | $4s$ | $s \\times s$ |
| **Persegi Panjang** ($p, l$) | $2(p + l)$ | $p \\times l$ |
| **Segitiga** (alas $a$, tinggi $t$) | jumlah 3 sisi | $\\frac{1}{2} \\times a \\times t$ |
| **Jajar Genjang** | $2(\\text{alas} + \\text{sisi miring})$ | $\\text{alas} \\times \\text{tinggi}$ |
| **Trapesium** | jumlah 4 sisi | $\\frac{1}{2} \\times (a + b) \\times t$ |
| **Belah Ketupat / Layang-layang** | jumlah 4 sisi | $\\frac{1}{2} \\times d_1 \\times d_2$ |
| **Lingkaran** (jari-jari $r$, diameter $d$) | $\\pi d = 2\\pi r$ | $\\pi r^2$ ($\\pi = \\frac{22}{7}$ atau $3{,}14$) |

### Bangun Ruang & Pengolahan Data SD
- **Kubus:** $V = s^3$, luas permukaan $= 6s^2$.
- **Balok:** $V = p \\times l \\times t$, luas permukaan $= 2(pl + pt + lt)$.
- **Prisma Segitiga:** $V = \\left(\\frac{1}{2} a t_{\\Delta}\\right) \\times t_{\\text{prisma}}$.
- **Tabung:** $V = \\pi r^2 t$.
- **Rata-Rata Hitung:** $\\text{Rata-rata} = \\frac{\\text{Jumlah seluruh data}}{\\text{Banyak data}}$; **Modus:** data dengan jumlah terbanyak pada tabel/diagram batang.`,
          },
        ],
      },
    ],
  },
];

