import { CurriculumSubjectSeed } from "./types";
import {
  DIAG_PU_GENERALISASI,
  DIAG_PU_ANALOGI,
  DIAG_PU_LOGIKA,
  DIAG_PU_INFERENSI,
  DIAG_PU_ANALITIS,
  DIAG_PU_BARISAN,
  DIAG_PU_PERSENTASE_HIMPUNAN,
  DIAG_PPU_MAKNA,
  DIAG_PPU_RELASI,
  DIAG_PPU_MORFOLOGI,
  DIAG_PPU_SINTAKSIS,
  DIAG_PPU_WACANA,
  DIAG_PBM_EYD,
  DIAG_PBM_TANDA_BACA,
  DIAG_PBM_KTSP,
  DIAG_PBM_EFEKTIF,
  DIAG_PBM_KONJUNGSI,
  DIAG_PK_BILANGAN,
  DIAG_PK_EKSPONEN_LOG,
  DIAG_PK_MUTLAK_SPL,
  DIAG_PK_KUADRAT,
  DIAG_PK_FUNGSI,
  DIAG_PK_GARIS_MATRIKS,
  DIAG_PK_KECUKUPAN,
  DIAG_PK_BARISAN,
  DIAG_PK_KESEBANGUNAN,
  DIAG_PK_GEOMETRI,
  DIAG_PK_TRIGONOMETRI,
  DIAG_PK_STAT_PELUANG,
} from "./diagrams/snbtTpsDiagrams";

export const SNBT_TPS_CURRICULUM: CurriculumSubjectSeed[] = [
  {
    examType: "SNBT",
    title: "Penalaran Umum (PU)",
    description: "Materi inti Penalaran Induktif, Penalaran Deduktif (Logika Proposisi, Kuantor, Analitis), dan Penalaran Kuantitatif Dasar.",
    chapters: [
      {
        title: "1. Penalaran Induktif",
        materials: [
          {
            title: "Generalisasi, Kesesuaian Fakta & Simpulan Teks",
            duration: 25,
            content: `${DIAG_PU_GENERALISASI}

### Definisi & Prinsip Penalaran Induktif
Penalaran induktif adalah proses penarikan simpulan bersifat **umum atau probabilistik** dari sejumlah premis khusus berupa pengamatan, data statistik, tabel, atau berita faktual. Simpulan induktif **tidak mengklaim kepastian mutlak (100%)**, melainkan tingkat **kemungkinan paling tinggi** yang langsung didukung premis.

### Klasifikasi Kebenaran Pernyataan terhadap Teks/Data
| Status Pernyataan | Syarat Penentuan |
|---|---|
| **Pasti Benar** | Tertulis eksplisit atau merupakan akibat langsung tak terbantahkan dari teks/data |
| **Mungkin Benar** | Selaras dengan arah tren dan syarat teks, memakai pemoderat (*cenderung, berpotensi*) |
| **Tidak Dapat Dinilai** | Fakta berada di luar cakupan data atau memuat kondisi baru yang tidak disebut teks |
| **Pasti Salah** | Bertentangan langsung dengan angka, arah tren, atau pernyataan eksplisit teks |

### Aturan Penarikan Simpulan Sah
1. **Jangan menyisipkan pengetahuan luar:** bila teks hanya mencatat kenaikan curah hujan dan kenaikan kasus flu di Kota X, jangan menyimpulkan penyebabnya pasti virus tertentu jika virus tidak disebut.
2. **Waspadai lompatan kuantor:** premis *"sebagian besar petani di Desa Y beralih ke pupuk organik"* tidak mendukung simpulan *"seluruh petani di Indonesia menggunakan pupuk organik"*.
3. **Verifikasi grafik/tabel:** periksa satuan sumbu ($\\text{ribu}, \\%$, indeks), garis dasar tahun pembanding, dan bedakan **jumlah absolut tertinggi** vs **laju pertumbuhan tertinggi**.

### Contoh & Pembahasan
> **Stimulus:** Data Dinas Kesehatan mencatat bahwa sejak tahun 2022–2025, kabupaten yang mengalokasikan minimal 10% dana desa untuk sanitasi air bersih mengalami penurunan rata-rata angka stunting sebesar 4,8% per tahun, sedangkan kabupaten lain rata-rata turun 1,2% per tahun.
> **Pertanyaan:** Simpulan manakah yang paling didukung oleh data tersebut?

**Pembahasan:**
- Kelompok perlakuan (alokasi $\\ge 10\\%$) turun $4{,}8\\%$ per tahun; kelompok pembanding turun $1{,}2\\%$ per tahun.
- Simpulan paling tepat: *Pengalokasian minimal 10% dana desa untuk sanitasi air bersih berkorelasi dengan percepatan penurunan angka stunting dibandingkan daerah tanpa alokasi tersebut.*
- Pernyataan *"Dana desa merupakan satu-satunya faktor penentu penurunan stunting"* **salah** karena tidak ada data yang menyingkirkan faktor gizi, imunisasi, dan ekonomi.

### Latihan Pemahaman
1. **Premis:** Dalam 6 kali uji coba, baterai litium tipe-A bertahan rata-rata 11 jam, sedangkan tipe-B bertahan 8 jam pada suhu $25^\\circ\\text{C}$. Apakah simpulan *"Pada suhu $-5^\\circ\\text{C}$ tipe-A tetap lebih awet daripada tipe-B"* pasti benar?
   - **Pembahasan:** Tidak dapat dinilai — seluruh data hanya menguji suhu $25^\\circ\\text{C}$.
2. **Premis:** Semua responden survei menyatakan harga tiket menjadi pertimbangan utama naik kereta cepat. Sebagian besar responden adalah pelajar. Apakah *"pelajar tidak mampu membeli tiket"* pasti benar?
   - **Pembahasan:** Salah/tidak didukung — *"pertimbangan utama"* bukan berarti *"tidak mampu membeli"*.`,
          },
          {
            title: "Analogi Induktif & Evaluasi Argumen (Memperkuat / Memperlemah)",
            duration: 25,
            content: `${DIAG_PU_ANALOGI}

### Analogi Induktif
Analogi membandingkan dua objek atau fenomena ($X$ dan $Y$) yang berbeda kategori berdasarkan **kesamaan struktur hubungan sebab–akibat atau fungsi**, bukan sekadar kemiripan lahiriah.
- **Analogi kuat:** sifat pembanding relevan secara mekanisme terhadap sifat yang disimpulkan (mis. *irigasi tersumbat $\\rightarrow$ sawah kering* sejalan dengan *pembuluh koroner tersumbat $\\rightarrow$ jaringan jantung kekurangan oksigen*).
- **Analogi lemah (cacat logika):** kemiripan permukaan tanpa hubungan sebab–akibat (*"Jam tangan punya perancang, alam semesta rumit, ... "* bila dibandingkan dengan benda biologis tanpa mekanisme sama).

### Kerangka Evaluasi Argumen Kausalitas
Setiap argumen di teks umumnya memiliki bentuk:
$$\\text{Bukti/Data} + (\\text{Asumsi Tersirat}) \\Longrightarrow \\text{Klaim Penyebab } (A \\rightarrow B)$$

| Kategori Informasi | Ciri Logisnya | Contoh Konkret |
|---|---|---|
| **Memperkuat Argumen** | Menutup faktor perancu alternatif; menambah kelompok kontrol sepadan; mengonfirmasi mekanisme antara $A$ ke $B$ | Uji pembanding terkontrol menunjukkan kelompok tanpa $A$ tidak mengalami $B$ |
| **Memperlemah Argumen** | Memunculkan faktor ketiga $C$ (*confounder*); menyajikan contoh penyangkal ($A$ ada, $B$ tidak ada); membuktikan arah terbalik ($B \\rightarrow A$) | Kelompok yang menerima $A$ ternyata sudah berbeda sejak awal (bias seleksi) |
| **Tidak Relevan** | Membahas topik atau angka lain yang tidak menyentuh hubungan antara $A$ dan $B$ | Membahas biaya produksi $A$ padahal argumen membahas efektivitas medis $A$ |

### Contoh & Pembahasan
> **Argumen Peneliti:** Membaca buku cetak menjelang tidur membuat durasi tidur nyenyak bertambah 25 menit dibandingkan menonton gawai karena ketiadaan paparan cahaya biru layar (*blue light*).
- **Memperkuat:** *Peserta yang memakai gawai dengan filter pemblokir 100% cahaya biru dan kecerahan identik buku cetak memperoleh durasi tidur nyenyak mendekati kelompok buku cetak.* (Membuktikan mekanisme cahaya biru!)
- **Memperlemah:** *Kelompok pembaca buku cetak dalam eksperimen diminta tidur pukul 21.30, sedangkan kelompok gawai baru mulai uji pukul 23.00.* (Faktor perancu jam tidur!)
- **Tidak Relevan:** *Harga rata-rata buku cetak naik 8% pada tahun 2025.*

### Latihan Pemahaman
Sebuah kota mengklaim *"Pelebaran jalan raya berhasil menurunkan tingkat kecelakaan 20% dalam setahun."* Manakah fakta yang paling **memperlemah** klaim?
- **Kunci:** *Pada tahun yang sama, kota tersebut baru saja mewajibkan kamera tilang elektronik di seluruh persimpangan dan memperketat batas kecepatan maksimal.* (Ada intervensi lain pada waktu yang sama).`,
          },
        ],
      },
      {
        title: "2. Penalaran Deduktif",
        materials: [
          {
            title: "Logika Proposisi: Operasi Kebenaran, Kontraposisi & Negasi",
            duration: 30,
            content: `${DIAG_PU_LOGIKA}

### Definisi Proposisi & Nilai Kebenaran
Proposisi adalah kalimat deklaratif yang bernilai **Benar ($B$)** atau **Salah ($S$)** secara tegas, bukan kalimat tanya atau perintah.

| Proposisi Majemuk | Simbol | Kapan Bernilai BENAR? | Kapan Bernilai SALAH? |
|---|---|---|---|
| **Negasi (Ingkaran)** | $\\sim p$ | Jika $p$ salah | Jika $p$ benar |
| **Konjungsi (dan)** | $p \\land q$ | **Hanya jika $p=B$ dan $q=B$** | Jika salah satu/keduanya $S$ |
| **Disjungsi (atau)** | $p \\lor q$ | Jika minimal satu bernilai $B$ | **Hanya jika $p=S$ dan $q=S$** |
| **Implikasi (Jika... maka...)** | $p \\Rightarrow q$ | Kecuali $p=B$ dan $q=S$ | **Hanya jika $p=B$ dan $q=S$** |
| **Biimplikasi (...jika & hanya jika...)** | $p \\Leftrightarrow q$ | Jika nilai $p$ dan $q$ **sama** ($BB$ / $SS$) | Jika nilai $p$ dan $q$ **berbeda** |

### Konvers, Invers, Kontraposisi & Ekuivalensi
Dari implikasi asal $p \\Rightarrow q$:
- **Konvers:** $q \\Rightarrow p$ *(belum tentu sama nilai kebenarannya!)*
- **Invers:** $\\sim p \\Rightarrow \\sim q$ *(belum tentu sama dengan implikasi asal!)*
- **Kontraposisi:** $\\sim q \\Rightarrow \\sim p$ (**SELALU ekuivalen** dengan $p \\Rightarrow q$)

$$p \\Rightarrow q \\equiv \\sim q \\Rightarrow \\sim p \\equiv \\sim p \\lor q$$

### Rumus Negasi (Ingkaran) Lengkap
1. $\\sim(\\sim p) \\equiv p$
2. **Hukum De Morgan:**
   $$\\sim(p \\land q) \\equiv \\sim p \\lor \\sim q \\qquad \\text{dan} \\qquad \\sim(p \\lor q) \\equiv \\sim p \\land \\sim q$$
3. **Negasi Implikasi:**
   $$\\sim(p \\Rightarrow q) \\equiv p \\land \\sim q$$
   *(Catatan penting: negasi dari "Jika $p$ maka $q$" bukanlah kalimat "Jika... maka..." lagi, melainkan "$p$ terjadi **dan** $q$ tidak terjadi"!)*

### Contoh & Pembahasan
1. **Soal:** Tentukan pernyataan yang setara dengan *"Jika nilai ekspor turun, maka cadangan devisa melemah atau impor dibatasi."*
   - Misalkan $p$: nilai ekspor turun, $q$: cadangan devisa melemah, $r$: impor dibatasi.
   - Pernyataan: $p \\Rightarrow (q \\lor r)$.
   - Kontraposisinya: $\\sim(q \\lor r) \\Rightarrow \\sim p \\equiv (\\sim q \\land \\sim r) \\Rightarrow \\sim p$.
   - Arti: *"Jika cadangan devisa tidak melemah **dan** impor tidak dibatasi, maka nilai ekspor tidak turun."*
2. **Soal:** Tentukan negasi dari kalimat sebelumnya!
   - $\\sim(p \\Rightarrow (q \\lor r)) \\equiv p \\land \\sim(q \\lor r) \\equiv p \\land \\sim q \\land \\sim r$.
   - Arti: *"Nilai ekspor turun, dan cadangan devisa tidak melemah, dan impor tidak dibatasi."*`,
          },
          {
            title: "Aturan Inferensi (Ponens, Tollens, Silogisme) & Kuantor",
            duration: 30,
            content: `${DIAG_PU_INFERENSI}

### Penarikan Kesimpulan Sah (Valid)
| Aturan | Premis 1 | Premis 2 | Kesimpulan Sah |
|---|---|---|---|
| **Modus Ponens** | $p \\Rightarrow q$ | $p$ | **$q$** |
| **Modus Tollens** | $p \\Rightarrow q$ | $\\sim q$ | **$\\sim p$** |
| **Silogisme Hipotetis** | $p \\Rightarrow q$ | $q \\Rightarrow r$ | **$p \\Rightarrow r$** |
| **Silogisme Disjungtif** | $p \\lor q$ | $\\sim p$ | **$q$** |
| **Dilema Konstruktif** | $(p \\Rightarrow q) \\land (r \\Rightarrow s)$ | $p \\lor r$ | **$q \\lor s$** |

### Kesesatan Logika Formal (*Formal Fallacies*)
1. **Affirming the Consequent:** $p \\Rightarrow q$, diketahui $q$, lalu menyimpulkan $p$ $\\rightarrow$ **TIDAK SAH**.
2. **Denying the Antecedent:** $p \\Rightarrow q$, diketahui $\\sim p$, lalu menyimpulkan $\\sim q$ $\\rightarrow$ **TIDAK SAH**.

### Logika Kuantor (Universal $\\forall$ & Eksistensial $\\exists$)
- **Kuantor Universal:** *semua, setiap, seluruh, tidak ada satu pun yang bukan* ($\\forall x, P(x)$).
- **Kuantor Eksistensial:** *ada, beberapa, sebagian, minimal satu* ($\\exists x, P(x)$). **Catatan:** dalam logika formal, *"sebagian"* bermakna **"minimal satu"** dan tidak menutup kemungkinan berlaku untuk semua!
- **Negasi Kuantor:**
  $$\\sim(\\forall x, P(x)) \\equiv \\exists x, \\sim P(x) \\qquad \\text{dan} \\qquad \\sim(\\exists x, P(x)) \\equiv \\forall x, \\sim P(x)$$
  - Negasi *"Semua santri membawa Al-Qur'an"* adalah **"Ada santri yang tidak membawa Al-Qur'an"** (bukan *"Semua santri tidak membawa..."*).

### Aturan Gabungan Silogisme Kuantor
1. *Semua $A$ adalah $B$* + *Semua $B$ adalah $C$* $\\Longrightarrow$ **Semua $A$ adalah $C$**.
2. *Semua $A$ adalah $B$* + *Sebagian $C$ adalah $A$* $\\Longrightarrow$ **Sebagian $C$ adalah $B$**.
3. *Semua $A$ adalah $B$* + *Tidak ada $B$ yang $C$* $\\Longrightarrow$ **Tidak ada $A$ yang $C$**.
4. Jika kedua premis sama-sama berkuantor **sebagian**, maka **tidak ada kesimpulan pasti**.

### Contoh & Pembahasan
> Premis 1: Setiap mahasiswa penerima beasiswa wajib menjaga IPK minimal 3,25.
> Premis 2: Sebagian mahasiswa jurusan Fisika adalah penerima beasiswa.
> Premis 3: Rendra adalah mahasiswa jurusan Fisika dengan IPK 3,10.
- Dari Premis 1 & 2: *Sebagian mahasiswa jurusan Fisika wajib menjaga IPK minimal 3,25.*
- Dari Premis 1 & 3 (Modus Tollens): *Rendra bukan penerima beasiswa.* (Karena seandainya penerima beasiswa, IPK-nya wajib $\\ge 3{,}25$, padahal IPK Rendra $3{,}10$).`,
          },
          {
            title: "Penalaran Analitis: Urutan, Posisi Melingkar & Kombinasi Jadwal",
            duration: 25,
            content: `${DIAG_PU_ANALITIS}

### Kategori Soal Penalaran Analitis
1. **Urutan Linier (Peringkat, Antrean, Gedung Bertingkat):**
   - Ubah pernyataan perbandingan ke pertidaksamaan: *"A lebih tinggi dari B tetapi lebih pendek dari C"* menjadi $C > A > B$.
   - *"X berada tepat dua posisi di sebelah kanan Y"* artinya posisi $(X) = \\text{posisi}(Y) + 2$ (ada **tepat 1 orang** di antara $Y$ dan $X$).
   - Kondisi *"bersebelahan"* mengikat dua elemen menjadi satu blok **[AB]** atau **[BA]**.
2. **Posisi Melingkar (*Circular Seating*):**
   - Pada $N$ kursi melingkar, letakkan elemen yang paling banyak syaratnya di posisi jam 12 sebagai jangkar (*anchor*) untuk menghilangkan simetri rotasi.
   - **Menghadap pusat meja:** *sebelah kiri* = searah jarum jam; *sebelah kanan* = berlawanan arah jarum jam.
   - **Berhadapan langsung (untuk $N$ genap):** berjarak $N/2$ langkah melingkar (pada 6 kursi: 1 berhadapan 4, 2 berhadapan 5, 3 berhadapan 6; pada 8 kursi: 1 dengan 5, dst.).
3. **Jadwal & Alokasi Kelompok Bersyarat:**
   - Buat tabel baris–kolom; isi syarat **mutlak tunggal** dulu, lalu uji syarat kondisional (*jika X dipilih maka Y tidak dipilih*).

### Contoh & Pembahasan Lengkap
> Enam peserta ($A, B, C, D, E, F$) duduk mengelilingi meja bundar menghadap ke dalam dengan 6 kursi bernomor 1–6 searah jarum jam.
> - $A$ duduk berhadapan langsung dengan $D$.
> - $B$ duduk tepat di sebelah kanan $A$.
> - $E$ tidak bersebelahan dengan $D$ maupun $B$.
> Siapakah yang duduk tepat di sebelah kiri $D$?

**Penyelesaian:**
1. Kunci jangkar $A$ di kursi **1**. Karena berhadapan pada 6 kursi, $D$ di kursi **4**.
2. Di kursi $A(1)$ menghadap pusat: *sebelah kanan* = berlawanan arah jarum jam = kursi **6**. Jadi $B$ di kursi **6**.
3. $E$ tidak bersebelahan dengan $D(4)$ (melarang kursi **3** dan **5**) dan tidak bersebelahan dengan $B(6)$ (melarang kursi **5** dan **1**). Kursi tersisa hanya **2, 3, 5** $\\Rightarrow$ satu-satunya kursi legal untuk $E$ adalah **2**!
4. Tersisa kursi **3** dan **5** untuk $C$ dan $F$. Di kursi $D(4)$ menghadap pusat, *sebelah kiri* = searah jarum jam = kursi **5**.
5. Jadi kursi di sebelah kiri $D$ adalah kursi **5**, yang ditempati **salah satu dari $C$ atau $F$**.`,
          },
        ],
      },
      {
        title: "3. Penalaran Kuantitatif Dasar",
        materials: [
          {
            title: "Pola Barisan Bilangan, Larik Ganda & Konfigurasi Angka",
            duration: 25,
            content: `${DIAG_PU_BARISAN}

### Metode Mengidentifikasi Pola Barisan dengan Cepat
Selalu periksa rasio dan selisih antar-suku dari jenis sederhana menuju majemuk:
1. **Selisih Konstan / Bertingkat ($\\Delta_1, \\Delta_2, \\Delta_3$):**
   Contoh: $3, 5, 9, 15, 23, \\dots$ $\\rightarrow$ selisih tingkat 1 adalah $+2, +4, +6, +8, (+10)$, sehingga suku berikutnya $23 + 10 = 33$.
2. **Operasi Bergantian (2 atau 3 aturan berulang):**
   Contoh: $2, 6, 4, 12, 10, 30, 28, \\dots$ $\\rightarrow$ pola $\\times 3, -2, \\times 3, -2, \\dots$ $\\rightarrow$ berikutnya $28 \\times 3 = 84$.
3. **Barisan Multi-Larik (2-Larik atau 3-Larik):**
   Jika angka terlihat naik turun tak beraturan, pisahkan indeks ganjil dan genap:
   Contoh: $10, 4, 15, 8, 20, 16, 25, \\dots$
   - Larik ganjil: $10, 15, 20, 25$ ($+5$)
   - Larik genap: $4, 8, 16, \\dots$ ($\\times 2 \\Rightarrow 32$).
4. **Barisan Fibonacci & Tribonacci:**
   $U_n = U_{n-1} + U_{n-2}$ (mis. $1, 3, 4, 7, 11, 18, 29$).
5. **Kuadrat/Kubik Dekat ($n^2 \\pm k$ atau $n^3 \\pm k$):**
   Contoh: $2, 9, 28, 65, 126, \\dots = 1^3+1,\\; 2^3+1,\\; 3^3+1,\\; 4^3+1,\\; 5^3+1 \\Rightarrow 6^3+1 = 217$.

### Pola Gambar Angka (Segitiga, Kotak, Lingkaran)
Uji kesamaan operasi dari 2 bangun contoh terhadap bilangan target:
- Jumlah/selisih sudut dikali sudut lain: $(a+b) \\times (c-d)$
- Pembagian antar sisi berhadapan ditambah konstanta: $\\frac{a}{b} + c$
- Jumlah seluruh baris/kolom sama (bujursangkar ajaib).`,
          },
          {
            title: "Persentase Beruntun, Proporsi & Logika Himpunan Kuantitatif",
            duration: 25,
            content: `${DIAG_PU_PERSENTASE_HIMPUNAN}

### Rumus Persentase & Perubahan Beruntun
1. **Perubahan Beruntun:** Nilai awal $V_0$ berubah $r_1\\%$ lalu $r_2\\%$:
   $$V_{\\text{akhir}} = V_0 \\left(1 + \\frac{r_1}{100}\\right)\\left(1 + \\frac{r_2}{100}\\right)$$
   *(Jika turun $20\\%$ lalu naik $25\\%$: $V_{\\text{akhir}} = V_0 (0{,}8)(1{,}25) = 1{,}00 V_0$ — kembali ke semula! Bukan naik $5\\%$!)*
2. **Persentase Relatif ($A$ terhadap $B$):**
   $$\\%\\text{ lebih besar } A \\text{ dari } B = \\frac{A - B}{B} \\times 100\\%, \\qquad \\%\text{ lebih kecil } B \\text{ dari } A = \\frac{A - B}{A} \\times 100\\%$$
   *(Basis pembaginya selalu kata setelah **"dari"** atau **"dibandingkan"**!)*

### Perbandingan Senilai & Berbalik Nilai
- **Senilai ($a_1/b_1 = a_2/b_2$):** jumlah porsi vs bahan baku, jarak vs bensin pada kecepatan tetap.
- **Berbalik Nilai ($n_1 t_1 = n_2 t_2$):** jumlah pekerja vs hari pengerjaan, kecepatan vs waktu tempuh jarak tetap.
- **Perubahan Tengah Jalan (Proyek Terhenti):**
  $$\\text{Sisa Beban Kerja} = n_1 (t_{\\text{rencana}} - t_{\\text{jalan}}) = n_{\\text{baru}} \\cdot t_{\\text{sisa}}$$

### Logika Himpunan (Diagram Venn 2 dan 3 Himpunan)
- **2 Himpunan:** $n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$ dan $n(S) = n(A \\cup B) + n(A \\cup B)^c$.
- **3 Himpunan (Prinsip Inklusi–Eksklusi):**
  $$n(A \\cup B \\cup C) = n(A)+n(B)+n(C) - n(A\\cap B) - n(A\\cap C) - n(B\\cap C) + n(A\\cap B\\cap C)$$

### Contoh & Pembahasan
> Proyek dikerjakan 24 pekerja selama 30 hari. Setelah bekerja 10 hari, pekerjaan terhenti 4 hari. Berapa pekerja tambahan yang dibutuhkan agar selesai tepat waktu?
- Sisa waktu normal: $30 - 10 = 20$ hari (dengan 24 pekerja).
- Sisa waktu efektif: $20 - 4 = 16$ hari.
- Beban sama: $24 \\times 20 = n_{\\text{baru}} \\times 16 \\Rightarrow n_{\\text{baru}} = \\frac{480}{16} = 30$ pekerja.
- **Tambahan pekerja:** $30 - 24 = \\mathbf{6}$ orang.`,
          },
        ],
      },
    ],
  },
  {
    examType: "SNBT",
    title: "Pengetahuan & Pemahaman Umum (PPU)",
    description: "Materi inti Semantik & Relasi Makna, Morfologi (Afiksasi & Reduplikasi), Sintaksis (Frasa, Klausa & Pola Kalimat), serta Kepaduan Wacana.",
    chapters: [
      {
        title: "1. Semantik & Relasi Makna",
        materials: [
          {
            title: "Jenis Makna Kata & Enam Pola Pergeseran Makna",
            duration: 25,
            content: `${DIAG_PPU_MAKNA}

### Klasifikasi Jenis Makna
1. **Makna Leksikal:** makna tetap sesuai entri kamus tanpa terikat kalimat (*kursi* = tempat duduk berkaki empat).
2. **Makna Gramatikal:** makna baru akibat proses morfologis (pengimbuhan, pengulangan, pemajemukan). Contoh: *berkursi*, *rumah makan*.
3. **Makna Denotatif:** makna lugas, objektif, bebas nilai rasa (*tangan kanan* = anggota tubuh sebelah kanan).
4. **Makna Konotatif:** makna kias bermuatan nilai rasa positif/negatif (*tangan kanan* = orang kepercayaan).
5. **Makna Referensial vs Nonreferensial:** kata bermakna acuan konkret (*meja, buku*) vs kata tugas yang tidak mengacu benda (*dan, karena, meskipun*).

### Enam Pola Pergeseran Makna Bahasa Indonesia
| Jenis Pergeseran | Mekanisme | Contoh Klasik |
|---|---|---|
| **Generalisasi (Meluas)** | Makna kini mencakup lebih luas daripada makna lama | *bapak, ibu, saudara, berlayar* |
| **Spesialisasi (Menyempit)** | Makna kini lebih sempit/khusus daripada makna lama | *sarjana, pendeta, madrasah, pembantu* |
| **Ameliorasi** | Nilai rasa berubah menjadi lebih halus/terhormat | *pramuniaga* (vs *pelayan*), *tuna rungu* (vs *tuli*) |
| **Peyorasi** | Nilai rasa turun menjadi kasar/berkonotasi buruk | *oknum, gerombolan, kroni, kabur* |
| **Sinestesia** | Pertukaran tanggapan dua alat indra berbeda | *suara manis* (dengar $\\leftrightarrow$ kecap), *wajah masam* (lihat $\\leftrightarrow$ kecap) |
| **Asosiasi** | Persamaan sifat yang melekat pada hal lain | *amplop* (= uang suap), *catut* (= calo/mengambil untung) |`,
          },
          {
            title: "Relasi Antarkata: Sinonim, Antonim, Hiponim, Homonim, Homograf & Polisemi",
            duration: 25,
            content: `${DIAG_PPU_RELASI}

### Tabel Pembeda Relasi Makna
| Relasi Makna | Definisi Persis | Contoh & Uji Konteks |
|---|---|---|
| **Sinonim** | Kata berbeda bentuk dengan makna hampir sama/sama | *absah = sahih*; *efektif = mangkus*; *akselerasi = percepatan* |
| **Antonim** | Berlawanan makna (mutlak, bergradasi, atau relasional) | *hidup $\\leftrightarrow$ mati*; *eksplisit $\\leftrightarrow$ implisit*; *konvergen $\\leftrightarrow$ divergen* |
| **Hiponim – Hipernim** | Kata khusus (bawahan) vs kata umum (atasan) | *salmon, kakap, lele* (hiponim) dari *ikan* (hipernim); *ikan & burung* saling ber**kohiponim** |
| **Polisemi** | Satu entri kata bermakna ganda namun masih satu akar konsep | *kepala* (bagian tubuh, pemimpin, bagian paling atas); *kaki* (tubuh, kaki gunung, kaki meja) |
| **Homonim** | Tulisan sama, lafal sama, asal & makna **sama sekali beda** | *bisa* (dapat/mampu) vs *bisa* (racun ular); *hak* (milik) vs *hak* (bagian sepatu) |
| **Homograf** | Tulisan sama, **lafal [e] / [é] berbeda**, makna berbeda | *teras* (/təras/ = inti kayu, pejabat) vs *teras* (/téras/ = beranda); *apel* (buah) vs *apel* (upacara) |
| **Homofon** | Lafal sama, **tulisan & makna berbeda** | *bank* vs *bang*; *massa* vs *masa*; *sangsi* (ragu) vs *sanksi* (hukuman) |

### Uji Asosiasi & Substitusi Kontekstual
- Untuk memilih padanan kata (*sinonim kontekstual*) di bacaan, **uji kata kandidat langsung ke kalimat asli** dengan memastikan **kelas kata sama** (nomina diganti nomina, verba transitif diganti verba transitif) dan register bahasanya (ilmiah/resmi vs populer) tetap selaras.`,
          },
        ],
      },
      {
        title: "2. Morfologi & Sintaksis",
        materials: [
          {
            title: "Afiksasi Produktif, Konfiks, Reduplikasi & Pemajemukan",
            duration: 25,
            content: `${DIAG_PPU_MORFOLOGI}

### Perbedaan Makna Imbuhan Kunci
1. **Awalan *ber-* vs *meN-*:**
   - *ber-*: mempunyai (*beratap*), mengenakan (*bersepatu*), melakukan tanpa objek langsung (*berlari*), dalam keadaan (*berduka*).
   - *meN-*: aktif transitif/intransitif (*membaca, menguning, menyebar*).
2. **Sufiks *-kan* vs *-i* (Paling Sering Diujikan!):**
   - **meN-...-kan:** menyatakan tindakan **kausatif** ("membuat menjadi ...") atau memindahkan objek menuju sasaran (*membersihkan kamar* = membuat kamar menjadi bersih; *mengirimkan paket kepada ibu*).
   - **meN-...-i:** objek diam sebagai lokasi/penerima, atau melakukan berkali-kali (*memukuli gong*, *mengirimi ibu paket*, *menanami kebun dengan jagung*).
3. **Konfiks *peN-...-an* vs *per-...-an*:**
   - **peN-...-an:** bermakna **proses** atau **hasil tindakan** (*penanaman, pembangunan, pemberdayaan*).
   - **per-...-an:** bermakna **tempat**, **hal**, atau **kumpulan** (*perkebunan, perindustrian, persatuan*).
4. **Konfiks *ke-...-an*:**
   - hal/abstraksi (*keadilan, kedaulatan*),
   - ketidaksengajaan (*ketiduran, kehujanan*),
   - bermakna "terlalu" pada adjektiva (*kekecilan, ketinggian*).

### Makna Reduplikasi (Pengulangan Kata)
- **Jamak/berbagai macam:** *pepohonan, buku-buku, sayur-mayur*.
- **Menyerupai:** *kuda-kudaan, siku-siku, langit-langit*.
- **Tindakan berbalasan (resiprokal):** *bersalam-salaman, berpandang-pandangan*.
- **Intensitas / Agak:** *setinggi-tingginya, kemerah-merahan*.

### Pembentukan Kata Majemuk & Imbuhan Asing
- **Idiom vs Kata Majemuk:** *buah tangan* (= oleh-oleh, makna baru idiomatis) berbeda dengan *meja makan* (kombinasi literal).
- **Sufiks Serapan Baku:** *-isasi* (proses: *urbanisasi*), *-isme* (paham: *rasionalisme*), *-wan/-wati* (pelaku: *olahragawan, pustakawan*).

### Contoh & Pembahasan UTBK PPU
> Dalam kalimat *"Pemerintah menyalurkan bantuan pangan untuk meringankan beban warga terdampak kemarau"*, imbuhan **meN-...-kan** pada *meringankan* menyatakan ....
- **Pembahasan:** Subjek membuat beban warga menjadi lebih ringan $\\implies$ bermakna **kausatif ("membuat jadi ringan")**, sama polanya dengan *meninggikan*, *memperluas*, atau *membersihkan*.`,
          },
          {
            title: "Frasa (D–M & Semantik), Klausa & Analisis Pola Kalimat Inti",
            duration: 30,
            content: `${DIAG_PPU_SINTAKSIS}

### Klasifikasi Frasa Bahasa Indonesia
Frasa adalah gabungan dua kata atau lebih yang bersifat **nonpredikatif** (tidak membentuk S–P lengkap) dan mengisi satu fungsi kalimat.
1. **Berdasarkan kategori intinya:**
   - Frasa nominal (*gedung bertingkat tinggi*)
   - Frasa verbal (*sedang giat berlatih*)
   - Frasa adjektival (*sangat ramah sekali* — catatan: contoh tidak hemat!)
   - Frasa preposisional (*di atas meja kayu*)
2. **Berdasarkan kesetaraan unsurnya:**
   - **Frasa Koordinatif (Setara):** unsur sederajat, dapat disisipi *dan* atau *atau* (*kakek nenek, pulang pergi, sandang pangan*).
   - **Frasa Subordinatif (Bertingkat — Hukum D–M):** unsur depan = **D**iterangkan (inti), unsur belakang = **M**enerangkan (atribut). Contoh: *kamar mandi* (inti = kamar), *air mineral* (inti = air).
   - **Frasa Apositif:** unsur kedua menjadi keterangan penjelas setara (*Soekarno, proklamator kemerdekaan*).

### Mengurai Pola Kalimat Inti (S – P – O – Pel – K)
| Unsur | Cara Mengidentifikasi | Contoh |
|---|---|---|
| **Subjek (S)** | Jawaban *"Apa/Siapa + Predikat?"*; **tidak boleh** diawali preposisi! | *Riset mikroplastik* ... |
| **Predikat (P)** | Berupa verba, adjektiva, nomina ber-kopula (*adalah, merupakan*), atau numeralia | ... *menunjukkan* / *sangat penting* ... |
| **Objek (O)** | Mengikuti verba transitif aktif tanpa preposisi; **dapat menjadi Subjek bila dipasifkan** | ... *dampak negatif bagi biota.* |
| **Pelengkap (Pel)** | Mengikuti verba intransitif (*ber-, menjadi, merupakan*) atau setelah Objek (berfungsi dwitransitif); **tidak bisa dipasifkan** | *Ia bertenak **kambing perah**.* |
| **Keterangan (K)** | Umumnya didahului preposisi (*di, pada, dalam, sejak, karena*) & posisinya fleksibel | ***Di laboratorium itu**, peneliti bekerja.* |

### Contoh Pemangkasan Kalimat Kompleks
> *"Meskipun anggaran terbatas pada tahun lalu, lembaga riset nasional yang bermarkas di Serpong tersebut berhasil mengembangkan vaksin baru secara mandiri."*
1. Buang klausa keterangan awal: *Meskipun anggaran terbatas pada tahun lalu,* [K-konsesif]
2. Ringkas perluasan subjek: *lembaga riset nasional [yang bermarkas di Serpong tersebut]* [S]
3. Ambil verba utama + objeknya: *berhasil mengembangkan* [P] + *vaksin baru* [O]
4. Buang keterangan cara: *secara mandiri* [K-cara]
- **Pola Kalimat Inti:** **S – P – O** (*Lembaga riset nasional mengembangkan vaksin baru*).`,
          },
        ],
      },
      {
        title: "3. Kepaduan Wacana & Paragraf",
        materials: [
          {
            title: "Ide Pokok, Kalimat Sumbang & Hubungan Logis Antarparagraf",
            duration: 20,
            content: `${DIAG_PPU_WACANA}

### Syarat Paragraf Baik: Kesatuan (Kohesi) & Kepaduan (Koherensi)
- **Kesatuan:** hanya terdapat **1 gagasan pokok** yang dikembangkan oleh kalimat-kalimat penjelas relevan.
- **Kalimat Sumbang:** kalimat yang keluar dari gagasan pokok, menyisipkan topik lain tanpa jembatan logis, atau bertolak belakang dengan pernyataan utama paragraf.
- **Alat Kohesi Gramatikal & Leksikal:**
  1. **Kata Rujukan (Anafora/Katafora):** *ia, mereka, hal tersebut, kondisi ini, di sana*.
  2. **Substitusi & Elipsis:** penggantian atau pelesapan unsur berulang.
  3. **Pengulangan Kata Kunci (Repetisi):** kata inti diulang untuk menjaga fokus topik.

### Pemetaan Hubungan Antarparagraf
| Transisi Awal Paragraf Berikutnya | Fungsi / Hubungan Logis |
|---|---|
| *Sebaliknya, Akan tetapi, Di lain pihak...* | Pertentangan / perbandingan kontras dengan Paragraf 1 |
| *Akibatnya, Kondisi ini memicu, Oleh karena itu...* | Kausalitas (akibat/dampak dari Paragraf 1) |
| *Salah satu contohnya, Secara spesifik, Misalnya...* | Pemerincian / ilustrasi konkret atas pernyataan umum Paragraf 1 |
| *Untuk mengatasi masalah tersebut, Pemerintah kemudian...* | Solusi / tindak lanjut atas problematika Paragraf 1 |

### Strategi Mendeteksi Kalimat Sumbang & Kepaduan dalam 30 Detik
1. Identifikasi **subjek topik utama** kalimat (1) dan (2) terlebih dahulu.
2. Cek apakah setiap kalimat berikutnya masih membahas **aspek/variabel yang sama** atau memperkenalkan kata rujukan (*hal itu, dampaknya, fenomena tersebut*) yang sah.
3. Jika sebuah kalimat membelok ke **saran normatif tiba-tiba, topik sejarah lain, atau definisi kamus yang memutus alur kronologi**, kalimat tersebut adalah kalimat sumbang (*tidak padu*).

### Contoh & Pembahasan Lengkap
> (1) Pengelolaan sampah plastik berbasis bank sampah mulai diterapkan di 14 kelurahan pesisir. (2) Warga menukarkan botol dan kemasan bersih dengan saldo tabungan pendidikan. (3) Harga bijih plastik dunia mengalami fluktuasi tajam sepanjang kuartal ketiga akibat gangguan rantai pasok minyak mentah. (4) Dalam enam bulan, volume sampah plastik yang masuk ke muara sungai berkurang hingga 28 persen.
- **Kalimat Sumbang:** **Kalimat (3)**, karena melompat membahas harga komoditas plastik dunia dan minyak mentah yang memutus kesinambungan program bank sampah di kelurahan pesisir pada kalimat (1), (2), dan (4).`,
          },
        ],
      },
    ],
  },
  {
    examType: "SNBT",
    title: "Pemahaman Bacaan & Menulis (PBM)",
    description: "Materi inti EYD Edisi V lengkap (Huruf, Kata, Tanda Baca), Kata Baku KBBI, Peluluhan Fonem K-T-S-P, serta Kalimat Efektif & Konjungsi.",
    chapters: [
      {
        title: "1. Kaidah EYD Edisi V & Tata Kata",
        materials: [
          {
            title: "Huruf Kapital, Huruf Miring, Kata Depan, Partikel & Gabungan Kata",
            duration: 30,
            content: `${DIAG_PBM_EYD}

### Huruf Kapital (EYD Edisi V — Kepmendikbudristek 2022)
1. **Nama diri geografi + jenisnya ditulis KAPITAL:** *Sungai Musi, Selat Sunda, Bukit Barisan, Dataran Tinggi Dieng, Teluk Bone*.
   - **TIDAK kapital** jika tidak diikuti nama diri (*berperahu menyusuri sungai*), atau jika merupakan **nama jenis/produk daerah** (*gula jawa, kunci inggris, pisang ambon, jeruk bali, kacang bogor, soto betawi*).
2. **Nama bangsa, suku, dan bahasa:** kata *bangsa/suku/bahasa* ditulis **huruf kecil**, sedangkan nama dirinya **KAPITAL** (*bahasa Indonesia, suku Minangkabau, bangsa Arab*). **Catatan:** dalam ungkapan *"mengindonesiakan"* huruf awal tetap kecil.
3. **Jabatan / Pangkat / Gelar:** kapital **hanya jika** diikuti nama orang atau nama instansi/daerah (*Presiden Prabowo, Gubernur Daerah Istimewa Yogyakarta, Profesor Rahmat*); kecil jika berdiri sendiri (*seorang gubernur mengunjungi lokasi*).

### Huruf Miring (Kursif)
- Menulis **judul** buku, majalah, surat kabar, atau film (*majalah Tempo, buku Laskar Pelangi*). **(Judul artikel, puisi, bab, atau lagu menggunakan tanda petik "...", bukan miring!)**
- Menuliskan **kata/ungkapan bahasa daerah atau bahasa asing** yang belum diserap baku ke KBBI (*status quo, upload, ngabuburit*).

### Kata Depan, Partikel & Bentuk Terikat
1. **Kata Depan *di, ke, dari*:** dipisah jika menyatakan tempat/arah (*di antara, ke luar, di samping, ke atas*). Disambung hanya jika merupakan imbuhan verba pasif atau kata benda/keterangan tetap (*dikerjakan, keluar [lawan masuk], kemari, kepada*).
2. **Partikel *-lah, -kah*:** serangkai (*bacalah, apakah*). **Partikel *pun*:** dipisah (*apa pun, satu kali pun, siapa pun*), **KECUALI 12 kata penghubung baku**: *adapun, andaipun, ataupun, bagaimanapun, biarpun, kalaupun, kendatipun, maupun, meskipun, sekalipun [bermakna walau], sungguhpun, walaupun*.
3. **Partikel *per*:** dipisah jika berarti *"mulai", "demi",* atau *"tiap"* (*per 1 Januari, satu per satu, Rp10.000,00 per helai*).
4. **Gabungan Kata & Bentuk Terikat:**
   - Imbuhan hanya 1 sisi (awal saja atau akhir saja) $\\rightarrow$ **tetap terpisah** (*tanda tangan $\\rightarrow$ bertanda tangan / tanda tangani*).
   - Awalan + akhiran serempak $\\rightarrow$ **serangkai** (*menandatangani, menyebarluaskan, ketidakhadiran*).
   - Bentuk terikat (*antar-, non-, sub-, pasca-, pra-, multi-, tuna-, semi-, adi-, catur-*) selalu **serangkai** (*antarkota, pascasarjana, prasejarah*), kecuali bertemu huruf kapital atau singkatan $\\rightarrow$ pakai tanda hubung (*non-Muslim, pasca-UTBK, pro-Indonesia*).`,
          },
          {
            title: "Tanda Baca EYD V: Koma, Titik Koma, Titik Dua, Petik & Hubung",
            duration: 25,
            content: `${DIAG_PBM_TANDA_BACA}

### Aturan Tanda Koma (,) yang Paling Sering Menguji Ketelitian
1. **Wajib sebelum konjungsi pertentangan intrakalimat:** **tetapi, melainkan, sedangkan** (*Ia ingin hadir, **tetapi** kakinya terkilir*).
2. **Wajib setelah konjungsi antarkalimat:** *Oleh karena itu, ...; Akan tetapi, ...; Selain itu, ...; Namun, ...; Meskipun demikian, ...*
3. **Wajib memisahkan anak kalimat di depan induk kalimat:** (*Karena hujan lebat, **koma** kegiatan dipindah ke aula*). **TIDAK pakai koma** apabila induk kalimat berada di depan (*Kegiatan dipindah ke aula **tanpa koma** karena hujan lebat*).
4. **TIDAK BOLEH ada koma sebelum** kata *bahwa, agar, supaya, sehingga*.
5. **Pemerincian 3 unsur atau lebih:** wajib memakai koma sebelum *dan/atau* (*buku, pena, **dan** penggaris*).

### Tanda Titik Koma (;), Titik Dua (:), Hubung (-) & Pisah (—)
- **Titik Koma (;):** memisahkan dua klausa setara tanpa kata penghubung, atau memisahkan rincian panjang yang di dalamnya sudah terdapat tanda koma (*Peserta berasal dari Bandung, Jawa Barat; Surabaya, Jawa Timur; dan Medan, Sumatera Utara*).
- **Titik Dua (:):** dipakai **hanya sesudah pernyataan lengkap** yang diikuti rincian (*Peralatan yang wajib dibawa: penggaris, pensil 2B, dan penghapus*). **SALAH** jika didahului kata kerja transitif langsung atau preposisi (*Saya membeli: buku, pena.* $\\rightarrow$ harus tanpa titik dua!).
- **Tanda Hubung (-) vs Pisah (—):** tanda hubung pendek merangkai unsur ulang/angka (*ber-KTP, tahun 1990-an, abad ke-21*); tanda pisah panjang mengapit keterangan aposisi penjelas atau rentang bermakna *"sampai dengan"* (*2020—2026*).`,
          },
          {
            title: "Kata Baku KBBI V & Hukum Peluluhan Fonem K–T–S–P",
            duration: 25,
            content: `${DIAG_PBM_KTSP}

### Kaidah Peluluhan Konsonan Awal K–T–S–P
Ketika kata dasar diawali huruf **k, t, s, p** bertemu awalan **meN-** atau **peN-**:
- **LULUH** apabila huruf kedua kata dasar adalah **vokal ($a, i, u, e, o$)**:
  - $k$ luluh: *meN- + konsumsi* $\\rightarrow$ **mengonsumsi**, *meN- + koordinasi* $\\rightarrow$ **mengoordinasikan**
  - $t$ luluh: *meN- + taati* $\\rightarrow$ **menaati**, *peN- + terjemah* $\\rightarrow$ **penerjemah**
  - $s$ luluh: *meN- + sukseskan* $\\rightarrow$ **menyukseskan**, *meN- + survei* $\\rightarrow$ **menyurvei**
  - $p$ luluh: *meN- + pengaruhi* $\\rightarrow$ **memengaruhi**, *peN- + pesona* $\\rightarrow$ **pemesona**
- **TIDAK LULUH** jika huruf kedua berupa **konsonan (kluster)**: *mengkritik, memproses, mentransfer, menyekrup [skrup]* atau kata dasar **1 suku kata** (*mengecat, mengepos, mengelas*).
- **Tidak luluh pada prefiks bertingkat *memper-*:** *memperhatikan* (dari *per- + hati*), *mempertahankan*, *memperkenalkan*.
- **Pengecualian khusus KBBI:** **mengkaji** (mempelajari/menelaah secara ilmiah) dibedakan dari **mengaji** (membaca Al-Qur'an); **mempunyai** tetap tidak luluh.

### Daftar Kosakata Baku vs Tidak Baku Favorit PBM
| Baku (KBBI V) | Tidak Baku | Baku (KBBI V) | Tidak Baku |
|---|---|---|---|
| **aktivitas** | aktifitas | **kreativitas** | kreatifitas |
| **analisis** | analisa | **kualitas** | kwalitas |
| **apotek** | apotik | **kuitansi** | kwitansi |
| **atmosfer** | atmosfir | **nasihat** | nasehat |
| **cenderamata** | cinderamata | **objektif** | obyektif |
| **diagnosis** | diagnosa | **praktik** | praktek |
| **ekstrem** | ekstrim | **risiko** | resiko |
| **hakikat** | hakekat | **sistem** | sistim |
| **hierarki** | hirarki | **standar** | standart |
| **indera / indra** | panca indera (baku: *pancaindra*) | **teknik** | tehnik |
| **izin** | ijin | **terampil** | trampil |`,
          },
        ],
      },
      {
        title: "2. Kalimat Efektif & Penyuntingan Wacana",
        materials: [
          {
            title: "Kalimat Efektif: Struktur S–P, Kehematan, Paralelisme & Kelogisan",
            duration: 25,
            content: `${DIAG_PBM_EFEKTIF}

### Lima Kaidah Emas Kalimat Efektif
1. **Kesepadanan Struktur (Subjek & Predikat Harus Jelas):**
   - **Kesalahan Preposisi di Depan Subjek:** *Bagi mahasiswa penerima beasiswa wajib melapor.* (**Salah**, karena kata *Bagi* menjadikan *mahasiswa...* berkedudukan Keterangan sehingga kalimat kehilangan Subjek!) $\\rightarrow$ Perbaikan: *Mahasiswa penerima beasiswa wajib melapor.*
   - **Subjek Ganda Tak Perlu:** *Penyusunan laporan itu saya sudah selesaikan.* $\\rightarrow$ *Laporan itu sudah saya selesaikan.*
2. **Kehematan Kata (Eliminasi Pleonasme):**
   - Hilangkan penjamakan ganda (*para hadirin sekalian*, *banyak kota-kota* $\\rightarrow$ *para hadirin* / *banyak kota*), kata berlebih (*agar supaya*, *demi untuk*, *sejak dari*, *naik ke atas*, *mulai dari sekarang ini*).
3. **Kesejajaran Bentuk (Paralelisme):**
   - Unsur rincian harus satu kelas/imbuhan setara: *Tahapan riset mencakup **pengumpulan** data, **pengolahan** angka, dan **penarikan** simpulan.* (Jangan mencampur *mengumpulkan*, *pengolahan*, dan *ditarik*).
4. **Kelogisan Makna:**
   - *Yang membawa HP harap dimatikan* (**tidak logis**, seakan pembawanya dimatikan) $\\rightarrow$ *Peserta yang membawa HP harap mematikannya*.
5. **Kecermatan & Antikonjungsi Ganda:**
   - *Meskipun ..., tetapi ...* (**Salah**) $\\rightarrow$ hapus salah satu (*Meskipun ...* atau *... tetapi ...*).

### Contoh Penyuntingan Kalimat Khas UTBK PBM
1. *"Dalam laporan tahunan tersebut membahas penurunan emisi karbon sebesar 12 persen."*
   - **Cacat:** Preposisi *Dalam* membuat frasa awal menjadi **Keterangan**, sehingga kalimat tidak bersubjek!
   - **Perbaikan Baku:** Hapus *Dalam* (*"Laporan tahunan tersebut membahas..."*) **atau** ubah predikat menjadi pasif (*"Dalam laporan tahunan tersebut dibahas penurunan emisi..."*).
2. *"Para peserta ujian diharapkan agar supaya segera memasuki ruangan tanpa membawa gawai."*
   - **Cacat:** Pleonasme ganda (*agar supaya* dan *diharapkan + agar*).
   - **Perbaikan Baku:** *"Peserta ujian diharapkan segera memasuki ruangan tanpa membawa gawai."*`,
          },
          {
            title: "Konjungsi Intrakalimat, Antarkalimat & Korelatif",
            duration: 20,
            content: `${DIAG_PBM_KONJUNGSI}

### Tiga Kelompok Konjungsi Wajib Tepat Posisi
| Kelompok | Fungsi & Aturan Penulisan | Contoh Wajib Hafal |
|---|---|---|
| **Antarkalimat** | Menghubungkan kalimat berbeda; **di awal kalimat baru & selalu diikuti koma (,)** | *Oleh karena itu, Dengan demikian, Akan tetapi, Namun, Selain itu, Meskipun demikian, Sebaliknya, Selanjutnya* |
| **Intrakalimat** | Menghubungkan klausa dalam 1 kalimat; **terlarang diletakkan di awal kalimat tunggal** | *dan, atau, serta, tetapi, melainkan, sedangkan, karena, sebab, sehingga, bahwa, agar, meskipun, walaupun* |
| **Korelatif** | Berpasangan tetap dan mengapit unsur sejajar (*kata/frasa setara*) | *baik ... maupun ...*; *tidak hanya ... tetapi juga ...*; *bukan ... melainkan ...*; *demikian ... sehingga ...*; *entah ... entah ...* |

### Kesalahan Konjungsi Paling Sering Keluar di UTBK PBM
- Menulis *"Namun demikian, ..."* $\\rightarrow$ tidak baku; bentuk baku adalah **"Meskipun demikian, ..."** atau **"Namun, ..."**.
- Menaruh ***"Sedangkan ..."** atau ***"Sehingga ..."*** di awal kalimat berdiri sendiri sesudah tanda titik.
- Menukar pasangan korelatif menjadi *"baik siswa **ataupun** guru"* (seharusnya *baik siswa **maupun** guru*) atau *"bukan mahal **tetapi** langka"* (seharusnya *bukan ... **melainkan** ...*).`,
          },
        ],
      },
    ],
  },
  {
    examType: "SNBT",
    title: "Pengetahuan Kuantitatif (PK)",
    description: "Materi inti Matematika Analitik PK (murni konsep & aljabar/geometri, terpisah dari PM): Bilangan, Aljabar, Fungsi, Garis, Matriks, Geometri, Trigonometri, Statistika & Peluang.",
    chapters: [
      {
        title: "1. Bilangan, Keterbagian, Eksponen & Aljabar",
        materials: [
          {
            title: "Teori Bilangan, Uji Keterbagian, KPK–FPB & Banyak Faktor",
            duration: 30,
            content: `${DIAG_PK_BILANGAN}

### Sifat Bilangan Bulat & Paritas
- Genap $\\pm$ Genap = Genap; Ganjil $\\pm$ Ganjil = Genap; Genap $\\pm$ Ganjil = Ganjil.
- Perkalian menghasilkan ganjil **hanya jika seluruh faktornya ganjil**.

### Aturan Keterbagian ($2$ sampai $11$)
| Pembagi | Syarat Bilangan Bulat $N$ Habis Dibagi |
|---|---|
| **$2$ / $5$ / $10$** | Digit satuan habis dibagi $2$ / bernilai $0,5$ / bernilai $0$ |
| **$3$ / $9$** | **Jumlah seluruh digit** $N$ habis dibagi $3$ / habis dibagi $9$ |
| **$4$ / $8$** | **2 digit terakhir** habis dibagi $4$ / **3 digit terakhir** habis dibagi $8$ |
| **$6$** | Genap **dan** jumlah seluruh digit habis dibagi $3$ |
| **$11$** | Selisih $(\\text{jumlah digit posisi ganjil} - \\text{posisi genap})$ habis dibagi $11$ |

### Faktorisasi Prima, Banyak Faktor, FPB & KPK
Jika $N = p_1^{e_1} \\cdot p_2^{e_2} \\cdots p_k^{e_k}$ dengan $p_i$ bilangan prima berbeda:
- **Banyak faktor positif $N$:** $\\tau(N) = (e_1 + 1)(e_2 + 1)\\cdots(e_k + 1)$.
- **Jumlah semua faktor positif $N$:** $\\sigma(N) = \\prod_{i=1}^k \\frac{p_i^{e_i+1}-1}{p_i-1}$.
- **Identitas KPK–FPB:** $\\text{FPB}(a,b) \\times \\text{KPK}(a,b) = a \\times b$.
- **Pembagian Bersisa (Algoritma Euclides):** $N = q \\cdot d + r$ dengan $0 \\le r < d$.

### Contoh & Pembahasan
> Diketahui bilangan 5-angka $4A72B$ habis dibagi $45$. Tentukan semua kemungkinan nilai $A + B$.
- Karena habis dibagi $45 = 5 \\times 9$ (koprima):
  - Syarat habis dibagi $5$: $B = 0$ atau $B = 5$.
  - Syarat habis dibagi $9$: jumlah digit $4 + A + 7 + 2 + B = 13 + A + B$ kelipatan $9$ ($18$ atau $27$).
- Jika $B = 0$: $13 + A = 18 \\Rightarrow A = 5$ (maka $A+B = 5$).
- Jika $B = 5$: $18 + A = 18 \\Rightarrow A = 0$ (maka $A+B = 5$), atau $18 + A = 27 \\Rightarrow A = 9$ (maka $A+B = 14$).
- Jadi nilai $A+B$ yang mungkin adalah **$5$ atau $14$**.`,
          },
          {
            title: "Eksponen, Bentuk Akar, Logaritma & Identitas Aljabar",
            duration: 30,
            content: `${DIAG_PK_EKSPONEN_LOG}

### Sifat Eksponen & Persamaan Eksponensial
$$a^m \\cdot a^n = a^{m+n}, \\quad \\frac{a^m}{a^n} = a^{m-n}, \\quad (a^m)^n = a^{mn}, \\quad a^0 = 1 \\;(a\\ne 0), \\quad a^{-n} = \\frac{1}{a^n}$$
Untuk $a^{f(x)} = 1$: perhatikan 3 kasus! (1) $f(x)=0$ ($a\\ne 0$), (2) $a=1$, (3) $a=-1$ dan $f(x)$ genap!

### Bentuk Akar & Merasionalkan Penyebut
$$\\sqrt{(a+b) \\pm 2\\sqrt{ab}} = \\sqrt{a} \\pm \\sqrt{b} \\quad (a > b > 0)$$
$$\\frac{k}{\\sqrt{a} \\pm \\sqrt{b}} = \\frac{k(\\sqrt{a} \\mp \\sqrt{b})}{a - b}$$

### Sifat Logaritma ($a>0, a\\ne 1, b>0, c>0$)
$$^a\\log b = c \\Longleftrightarrow a^c = b$$
$$^a\\log(bc) = {}^a\\log b + {}^a\\log c, \\qquad {}^a\\log\\left(\\frac{b}{c}\\right) = {}^a\\log b - {}^a\\log c$$
$$^{a^m}\\log(b^n) = \\frac{n}{m}\\,{}^a\\log b, \\qquad {}^a\\log b \\cdot {}^b\\log c = {}^a\\log c, \\qquad a^{^a\\log b} = b$$

### Identitas Aljabar Wajib Lancar
$$(a \\pm b)^2 = a^2 \\pm 2ab + b^2, \\qquad a^2 - b^2 = (a-b)(a+b)$$
$$a^3 + b^3 = (a+b)(a^2 - ab + b^2), \\qquad a^3 - b^3 = (a-b)(a^2 + ab + b^2)$$
$$(a+b+c)^2 = a^2 + b^2 + c^2 + 2(ab + bc + ca)$$

### Contoh
> Sederhanakan $\\sqrt{14 - 2\\sqrt{45}}$.
- Cari dua bilangan dengan jumlah $14$ dan hasil kali $45$: yaitu $9$ dan $5$.
- Maka $\\sqrt{14 - 2\\sqrt{45}} = \\sqrt{9} - \\sqrt{5} = \\mathbf{3 - \\sqrt{5}}$.`,
          },
          {
            title: "Persamaan, Pertidaksamaan, Nilai Mutlak & SPLDV/SPLTV",
            duration: 25,
            content: `${DIAG_PK_MUTLAK_SPL}

### Pertidaksamaan Aljabar & Rasional
1. Perkalian/pembagian kedua ruas dengan **bilangan negatif membalik arah tanda**.
2. **Jangan pernah mengali silang** pertidaksamaan pecahan yang penyebutnya mengandung variabel $x$! Pindahkan ke ruas kiri menjadi $\\frac{P(x)}{Q(x)} \\le 0$, cari akar pembilang & penyebut, lalu buat **garis bilangan uji tanda**.
3. **Syarat Penyebut:** titik pembuat nol penyebut ($Q(x)=0$) **selalu selang terbuka ($\\circ$)** meskipun tanda soal $\\le$ atau $\\ge$!

### Pertidaksamaan Nilai Mutlak
- $|x| = \\sqrt{x^2}$; $|f(x)| < a \\iff -a < f(x) < a$ ($a > 0$); $|f(x)| > a \\iff f(x) < -a \\text{ atau } f(x) > a$.
- $|f(x)| < |g(x)| \\iff (f(x) - g(x))(f(x) + g(x)) < 0$ (kuadratkan kedua ruas dan faktorkan selisih kuadrat).

### Sistem Persamaan Linear & Keterkaitan Garis
Sistem $a_1 x + b_1 y = c_1$ dan $a_2 x + b_2 y = c_2$:
- **Tepat 1 solusi (berpotongan):** $\\frac{a_1}{a_2} \\ne \\frac{b_1}{b_2}$.
- **Tak hingga banyak solusi (berimpit):** $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}$.
- **Tidak punya solusi (sejajar):** $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\ne \\frac{c_1}{c_2}$.`,
          },
        ],
      },
      {
        title: "2. Fungsi, Persamaan Kuadrat, Garis Lurus & Matriks",
        materials: [
          {
            title: "Persamaan Kuadrat & Fungsi Kuadrat Lengkap",
            duration: 30,
            content: `${DIAG_PK_KUADRAT}

### Persamaan Kuadrat $ax^2 + bx + c = 0$ ($a \\ne 0$)
- **Diskriminan:** $D = b^2 - 4ac$
  - $D > 0 \\Rightarrow$ 2 akar real berbeda; $D = 0 \\Rightarrow$ 1 akar real kembar; $D < 0 \\Rightarrow$ tidak memiliki akar real.
- **Rumus Vieta & Turunannya:**
  $$x_1 + x_2 = -\\frac{b}{a}, \\qquad x_1 \\cdot x_2 = \\frac{c}{a}, \\qquad |x_1 - x_2| = \\frac{\\sqrt{D}}{|a|}$$
  $$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2, \\qquad x_1^3 + x_2^3 = (x_1+x_2)^3 - 3x_1x_2(x_1+x_2)$$

### Fungsi Kuadrat $f(x) = ax^2 + bx + c$
1. **Arah parabola:** $a > 0$ terbuka ke atas (nilai minimum); $a < 0$ terbuka ke bawah (nilai maksimum).
2. **Titik puncak $(x_p, y_p)$:**
   $$x_p = -\\frac{b}{2a}, \\qquad y_p = f(x_p) = -\\frac{D}{4a}$$
3. **Menyusun fungsi kuadrat:**
   - Diketahui puncak $(x_p, y_p)$: $f(x) = a(x - x_p)^2 + y_p$.
   - Diketahui dua titik potong sumbu-$X$, $(x_1,0)$ dan $(x_2,0)$: $f(x) = a(x - x_1)(x - x_2)$.
4. **Definit:**
   - **Definit Positif** ($f(x) > 0, \\forall x \\in \\mathbb{R}$): $a > 0 \\land D < 0$.
   - **Definit Negatif** ($f(x) < 0, \\forall x \\in \\mathbb{R}$): $a < 0 \\land D < 0$.`,
          },
          {
            title: "Relasi, Fungsi, Fungsi Komposisi, Fungsi Invers & Domain",
            duration: 25,
            content: `${DIAG_PK_FUNGSI}

### Domain & Range Fungsi Alami
- Pecahan $\\frac{P(x)}{Q(x)}$: syarat **$Q(x) \\ne 0$**.
- Akar pangkat genap $\\sqrt{f(x)}$: syarat **$f(x) \\ge 0$**.
- Logaritma $^a\\log f(x)$: syarat **$f(x) > 0$**, basis $a > 0$ dan $a \\ne 1$.

### Fungsi Komposisi & Invers
- $(f \\circ g)(x) = f(g(x))$; perhatikan bahwa $f \\circ g \\ne g \\circ f$ pada umumnya.
- **Prinsip utama invers (hemat waktu saat mencari nilai titik tertentu!):**
  $$f(a) = b \\Longleftrightarrow f^{-1}(b) = a$$
  Jadi untuk menghitung $f^{-1}(7)$, **tidak perlu mencari rumus $f^{-1}(x)$**; cukup selesaikan $f(x) = 7$!
- **Invers fungsi rasional linear:**
  $$f(x) = \\frac{ax + b}{cx + d} \\Longrightarrow f^{-1}(x) = \\frac{-dx + b}{cx - a}$$
- **Invers komposisi:** $(f \\circ g)^{-1}(x) = (g^{-1} \\circ f^{-1})(x)$.`,
          },
          {
            title: "Persamaan Garis Lurus & Matriks 2×2 Lengkap",
            duration: 25,
            content: `${DIAG_PK_GARIS_MATRIKS}

### Geometri Analitik Garis Lurus
- Gradien melalui $(x_1,y_1)$ dan $(x_2,y_2)$: $m = \\frac{y_2 - y_1}{x_2 - x_1}$.
- Garis $y = mx + c$ bergradien $m$; garis $ax + by + c = 0$ bergradien $m = -\\frac{a}{b}$.
- **Dua garis sejajar:** $m_1 = m_2$; **tegak lurus:** $m_1 \\cdot m_2 = -1$.
- **Jarak titik $(x_0, y_0)$ ke garis $ax + by + c = 0$:**
  $$d = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^2 + b^2}}$$

### Matriks Ordo $2 \\times 2$
Misalkan $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$:
- **Transpos:** $A^T = \\begin{pmatrix} a & c \\\\ b & d \\end{pmatrix}$, berlaku $(AB)^T = B^T A^T$.
- **Determinan:** $\\det(A) = ad - bc$. Jika $\\det(A) = 0$, $A$ disebut **matriks singular** (tidak punya invers).
- **Invers:** $A^{-1} = \\frac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$.
- **Sifat Determinan:** $\\det(AB) = \\det(A)\\det(B)$, $\\det(A^T) = \\det(A)$, $\\det(kA) = k^2\\det(A)$ (khusus $2 \\times 2$), dan $\\det(A^{-1}) = \\frac{1}{\\det(A)}$.
- **Menyelesaikan Persamaan Matriks (hati-hati urutan perkalian!):**
  $$AX = B \\Rightarrow X = A^{-1}B \\qquad \\text{sedangkan} \\qquad XA = B \\Rightarrow X = BA^{-1}$$`,
          },
          {
            title: "Strategi Soal Kecukupan Data (1)(2) & Perbandingan Kuantitas P vs Q",
            duration: 30,
            content: `${DIAG_PK_KECUKUPAN}

### Algoritma 5 Langkah Soal Kecukupan Data **(1)** & **(2)**
Dalam PK UTBK-SNBT, soal kecukupan data menyajikan pertanyaan diikuti pernyataan **(1)** dan **(2)** dengan 5 opsi standar:
- **A:** Pernyataan **(1) SAJA** cukup, tetapi **(2) SAJA** tidak cukup.
- **B:** Pernyataan **(2) SAJA** cukup, tetapi **(1) SAJA** tidak cukup.
- **C:** **DUA pernyataan BERSAMA-SAMA** cukup, tetapi **SATU** pernyataan saja tidak cukup.
- **D:** Pernyataan **(1) SAJA** cukup **ATAU** pernyataan **(2) SAJA** cukup *(masing-masing berdiri sendiri cukup)*.
- **E:** Pernyataan (1) dan (2) **TIDAK CUKUP**.

### Prosedur Anti-Terkecoh (Metode 1–2–Gabung)
1. **Jangan berasumsi!** Cek syarat pada badan soal (*bilangan bulat? positif? segitiga siku-siku?*).
2. **Uji (1) terpisah** dari (2). Tulis semua nilai yang masih mungkin:
   - Jika (1) menghasilkan **tepat 1 nilai tunggal** (atau jawaban **Ya/Tidak** konsisten) $\\rightarrow$ tinggal pilih **A** atau **D**.
   - Jika (1) menghasilkan **$\\ge 2$ kemungkinan** (mis. $x^2 = 9 \\Rightarrow x = 3$ atau $-3$) $\\rightarrow$ **(1) belum cukup** $\\rightarrow$ eliminasi **A** dan **D**, sisa **B, C, E**.
3. **Uji (2) sendirian (LUPAKAN (1)!):** jangan terbawa informasi dari (1) saat menguji (2)!
4. **Gabungkan (1) + (2)** hanya jika masing-masing belum cukup (uji apakah **C** atau **E**).

### Jebakan Perbandingan Kuantitas $P$ dan $Q$
- **A ($P > Q$), B ($Q > P$), C ($P = Q$), D (Informasi tidak cukup untuk memutuskan hubungan)**.
- Pilih **D** apabila ditemukan minimal 1 substitusi sah yang membuat $P > Q$ **dan** 1 substitusi sah lain yang membuat $P \\le Q$ (atau sebaliknya).
- **Waspadai substitusi bilangan negatif, nol, dan pecahan ($0 < x < 1$)**! Pada rentang $0 < x < 1$, berlaku $x^2 < x$ dan $\\sqrt{x} > x$.

### Contoh & Pembahasan Lengkap
> **Soal Kecukupan Data:** Berapakah nilai bilangan real $x + y$?
> $(1)\\; x^2 - y^2 = 15$
> $(2)\\; x - y = 3$
- Uji **(1) saja:** $(x - y)(x + y) = 15$ memiliki tak hingga pasang solusi real (bisa $x-y=3, x+y=5$ atau $x-y=1, x+y=15$). **Tidak cukup.**
- Uji **(2) saja:** hanya tahu selisih $x - y = 3$; pasangan $(4,1)$ memberi $x+y=5$, sedangkan $(10,7)$ memberi $x+y=17$. **Tidak cukup.**
- Gabung **(1) + (2):** substitusi $x - y = 3$ ke $(x-y)(x+y)=15 \\implies 3(x+y)=15 \\implies x+y=\\mathbf{5}$ (tunggal!).
- **Kesimpulan:** Kunci **C** *(dua pernyataan bersama-sama cukup)*!`,
          },
        ],
      },
      {
        title: "3. Barisan, Geometri, Kesebangunan & Trigonometri",
        materials: [
          {
            title: "Barisan & Deret Aritmetika, Geometri & Konvergen Tak Hingga",
            duration: 25,
            content: `${DIAG_PK_BARISAN}

### Barisan & Deret Aritmetika
- Suku ke-$n$: $U_n = a + (n-1)b$ dan $U_n - U_k = (n - k)b$.
- Jumlah $n$ suku pertama:
  $$S_n = \\frac{n}{2}(a + U_n) = \\frac{n}{2}(2a + (n-1)b)$$
- Suku tengah ($n$ ganjil): $U_t = \\frac{a + U_n}{2}$ dan $S_n = n \\cdot U_t$.
- Hubungan umum semua deret: $U_n = S_n - S_{n-1}$ (untuk $n \\ge 2$) dan $U_1 = S_1$.

### Barisan & Deret Geometri
- Suku ke-$n$: $U_n = a \\cdot r^{n-1}$ dengan $\\frac{U_n}{U_k} = r^{n-k}$.
- Jumlah $n$ suku pertama: $S_n = \\frac{a(r^n - 1)}{r - 1}$ untuk $r \\ne 1$.
- **Deret Geometri Tak Hingga Konvergen** ($-1 < r < 1$):
  $$S_\\infty = \\frac{a}{1 - r}$$
  Jika dipisah suku ganjil & genap: $S_{\\text{ganjil}} = \\frac{a}{1 - r^2}$ dan $S_{\\text{genap}} = \\frac{ar}{1 - r^2}$, sehingga $\\frac{S_{\\text{genap}}}{S_{\\text{ganjil}}} = r$.`,
          },
          {
            title: "Kesebangunan & Kekongruenan Lengkap (Segitiga, Trapesium & Aplikasi)",
            duration: 35,
            content: `${DIAG_PK_KESEBANGUNAN}

### Perbedaan Mendasar: Kongruen ($\\cong$) vs Sebangun ($\\sim$)
| Aspek | **Kekongruenan ($\\cong$)** | **Kesebangunan ($\\sim$)** |
|---|---|---|
| **Makna** | Bentuk **sama persis** dan ukuran **sama besar** | Bentuk **sama**, ukuran boleh diperbesar/diperkecil dengan faktor skala $k$ |
| **Sudut bersesuaian** | Sama besar ($\\angle A = \\angle P$, dst.) | Sama besar ($\\angle A = \\angle P$, dst.) |
| **Sisi bersesuaian** | **Sama panjang** ($k = 1$) | **Sebanding** ($\\frac{AB}{PQ} = \\frac{BC}{QR} = \\frac{AC}{PR} = k$) |
| **Syarat Cukup Segitiga** | **S-S-S**, **S-Sd-S**, **Sd-S-Sd**, **Sd-Sd-S**, **Miring-Siku (RHS)** | **Sd-Sd (AA)** *(cukup 2 sudut sama!)*, **S-Sd-S (SAS proporsional)**, **S-S-S** |

---

### Lima Pola Wajib Kuasai dalam Soal PK UTBK-SNBT

#### 1. Pola Segitiga Bertumpuk (Garis Sejajar $DE \\parallel BC$)
Jika $D$ pada $AB$ dan $E$ pada $AC$ dengan $DE \\parallel BC$, maka $\\triangle ADE \\sim \\triangle ABC$:
$$\\frac{AD}{AB} = \\frac{AE}{AC} = \\frac{DE}{BC}$$
- **JEBAKAN UTAMA UTBK:** $\\frac{AD}{DB} \\ne \\frac{DE}{BC}$! Perbandingan alas sejajar $DE : BC$ selalu memakai panjang sisi penuh **$AD : (AD + DB)$**, bukan terhadap penggal bawah $DB$!
- Sedangkan perbandingan penggal samping tetap berlaku: $\\frac{AD}{DB} = \\frac{AE}{EC}$.

#### 2. Pola Kupu-Kupu / Jam Pasir ($AB \\parallel CD$)
Jika segmen $AD$ dan $BC$ berpotongan di $O$ dengan $AB \\parallel CD$, maka $\\angle OAB = \\angle ODC$ (dalam berseberangan) dan $\\angle AOB = \\angle DOC$ (bertolak belakang), sehingga $\\triangle AOB \\sim \\triangle DOC$:
$$\\frac{OA}{OD} = \\frac{OB}{OC} = \\frac{AB}{CD}$$

#### 3. Pola Trapesium dengan Garis Sejajar Tengah ("Rumus Ikan")
Diketahui trapesium $ABCD$ dengan $DC \\parallel EF \\parallel AB$ ($E$ pada $AD$, $F$ pada $BC$):
$$EF = \\frac{DC \\cdot AE + AB \\cdot DE}{DE + AE}$$
*(Cara ingat "perkalian silang kepala–ekor": sisi atas $\\times$ ruas bawah $+$ sisi bawah $\\times$ ruas atas, dibagi jumlah ruas!)*
- Jika garis sejajar melalui titik potong diagonal $O$, panjang segmen $PQ$ di dalamnya sama kiri–kanan dan memenuhi:
  $$PO = OQ = \\frac{AB \\cdot CD}{AB + CD}, \\qquad PQ = \\frac{2 \\cdot AB \\cdot CD}{AB + CD}$$

#### 4. Pola Segitiga Siku-Siku dengan Garis Tinggi ke Sisi Miring
Jika $\\triangle ABC$ siku-siku di $C$ dan $CD \\perp AB$ ($D$ pada hipotenusa $AB$):
- Terdapat **3 segitiga yang saling sebangun**: $\\triangle ABC \\sim \\triangle ACD \\sim \\triangle CBD$.
- Menghasilkan 4 rumus super cepat:
  $$CD^2 = AD \\cdot DB, \\qquad AC^2 = AD \\cdot AB, \\qquad BC^2 = BD \\cdot AB, \\qquad CD = \\frac{AC \\cdot BC}{AB}$$

#### 5. Skala Luas, Skala Volume & Masalah Foto–Bingkai
- Jika dua bangun sebangun memiliki faktor skala panjang $k = \\frac{s_2}{s_1}$:
  - Perbandingan **keliling** $= k$
  - Perbandingan **luas permukaan / luas bidang** $= k^2$
  - Perbandingan **volume bangun ruang** $= k^3$
- **Foto & Karton Sebangun:** bila foto $w \\times h$ ditempel pada karton dengan sisa kiri, kanan, atas masing-masing $t$, maka:
  $$\\frac{w}{w + 2t} = \\frac{h}{h + t + s_{\\text{bawah}}}$$

---

### Contoh Soal & Pembahasan Lengkap

1. **Contoh 1 (Trapesium & Perbandingan Kuantitas):**
   Pada trapesium $ABCD$ dengan $AB \\parallel CD$, panjang $CD = 10\\text{ cm}$ dan $AB = 22\\text{ cm}$. Titik $E$ pada $AD$ dan $F$ pada $BC$ sehingga $EF \\parallel AB$ dengan perbandingan $DE : EA = 1 : 3$.
   Manakah hubungan antara $P = EF$ dan $Q = 14$?
   - **Pembahasan:** Gunakan Rumus Ikan:
     $$EF = \\frac{CD \\cdot EA + AB \\cdot DE}{DE + EA} = \\frac{10(3) + 22(1)}{1 + 3} = \\frac{30 + 22}{4} = \\frac{52}{4} = 13\\text{ cm}$$
     Karena $P = 13 < Q = 14$, hubungan yang benar adalah **$Q > P$ (B)**.

2. **Contoh 2 (Segitiga Siku-Siku + Garis Tinggi):**
   Pada $\\triangle ABC$ siku-siku di $C$, ditarik garis tinggi $CD \\perp AB$. Diketahui $AD = 9\\text{ cm}$ dan $DB = 16\\text{ cm}$. Hitung luas $\\triangle ABC$ dan panjang $AC + BC$!
   - **Pembahasan:**
     - $CD^2 = AD \\cdot DB = 9 \\times 16 = 144 \\implies CD = 12\\text{ cm}$.
     - Alas $AB = 9 + 16 = 25\\text{ cm}$, maka $\\text{Luas } \\triangle ABC = \\frac{1}{2} \\times 25 \\times 12 = 150\\text{ cm}^2$.
     - $AC = \\sqrt{AD \\cdot AB} = \\sqrt{9 \\cdot 25} = 15\\text{ cm}$ dan $BC = \\sqrt{16 \\cdot 25} = 20\\text{ cm}$, sehingga $AC + BC = 35\\text{ cm}$.

3. **Contoh 3 (Rasio Luas pada Segitiga Bertumpuk):**
   Pada $\\triangle ABC$, titik $P$ pada $AB$ dan $Q$ pada $AC$ sehingga $PQ \\parallel BC$. Jika $AP : PB = 2 : 3$ dan luas $\\triangle APQ = 16\\text{ cm}^2$, tentukan luas trapesium $PBCQ$!
   - **Pembahasan:**
     - Rasio panjang sisi sebangun: $k = \\frac{AP}{AB} = \\frac{2}{2 + 3} = \\frac{2}{5}$.
     - Rasio luas: $\\frac{L_{\\triangle APQ}}{L_{\\triangle ABC}} = k^2 = \\left(\\frac{2}{5}\\right)^2 = \\frac{4}{25}$.
     - $L_{\\triangle ABC} = \\frac{25}{4} \\times 16 = 100\\text{ cm}^2$.
     - **Luas trapesium $PBCQ$** $= L_{\\triangle ABC} - L_{\\triangle APQ} = 100 - 16 = \\mathbf{84\\text{ cm}^2}$.

### Latihan Mandiri
1. Sebuah tiang vertikal setinggi $3\\text{ m}$ menghasilkan bayangan $1{,}8\\text{ m}$. Pada saat bersamaan, bayangan sebuah menara adalah $15\\text{ m}$. Tinggi menara adalah .... *(Kunci: $25\\text{ m}$)*
2. Pada $\\triangle KLM$, $AB \\parallel LM$ dengan $KA = 4$, $AL = 6$, dan $AB = 6$. Panjang $LM$ adalah .... *(Kunci: $15$)*`,
          },
          {
            title: "Geometri Bidang: Sudut, Segitiga, Lingkaran & Bangun Ruang",
            duration: 30,
            content: `${DIAG_PK_GEOMETRI}

### Sudut, Garis Sejajar & Segitiga
- Sudut sehadap dan sudut dalam berseberangan **sama besar**; sudut dalam sepihak **berjumlah $180^\\circ$**.
- Pada segitiga sisi $a, b, c$: $|a - b| < c < a + b$.
- **Sifat Kesebangunan pada Segitiga Siku-Siku** ($\\angle C = 90^\\circ$, tinggi $CD \\perp AB$):
  $$CD^2 = AD \\cdot DB, \\qquad AC^2 = AD \\cdot AB, \\qquad BC^2 = BD \\cdot BA$$
- **Triple Pythagoras:** $(3,4,5), (5,12,13), (7,24,25), (8,15,17), (9,40,41)$.

### Lingkaran & Bangun Ruang
- Sudut pusat $= 2 \\times$ sudut keliling pada busur sama; sudut keliling menghadap diameter $= 90^\\circ$.
- **Segi empat tali busur** (keempat sudut pada keliling lingkaran): dua sudut berhadapan berjumlah **$180^\\circ$**.
- **Power of a Point:** tali busur $AB$ & $CD$ berpotongan di $P$ $\\Rightarrow PA \\cdot PB = PC \\cdot PD$. Garis singgung $PT$ & tali busur perpanjangan $PAB$ $\\Rightarrow PT^2 = PA \\cdot PB$.
- **Volume & Luas Bangun Ruang:**
  - Kubus sisi $s$: $V = s^3$, $LP = 6s^2$, diagonal bidang $s\\sqrt{2}$, diagonal ruang $s\\sqrt{3}$.
  - Tabung: $V = \\pi r^2 t$, $LP = 2\\pi r(r + t)$.
  - Kerucut: $V = \\frac{1}{3}\\pi r^2 t$, luas selimut $\\pi r s$ dengan $s = \\sqrt{r^2 + t^2}$.
  - Bola: $V = \\frac{4}{3}\\pi r^3$, $LP = 4\\pi r^2$.

### Contoh & Pembahasan Lingkaran & Ruang
> Tali busur $AB$ dan $CD$ berpotongan di $P$ di dalam lingkaran dengan $PA = 4$, $PB = 9$, dan $PC = 6$. Hitung panjang $PD$!
- Dengan Power of a Point: $PA \\cdot PB = PC \\cdot PD \\implies 4 \\times 9 = 6 \\times PD \\implies PD = \\mathbf{6}$.`,
          },
          {
            title: "Trigonometri Dasar, Sudut Relasi, Aturan Sinus & Cosinus",
            duration: 25,
            content: `${DIAG_PK_TRIGONOMETRI}

### Nilai Sudut Istimewa & Tanda Kuadran
| $\\theta$ | $0^\\circ$ | $30^\\circ$ | $45^\\circ$ | $60^\\circ$ | $90^\\circ$ |
|---|---|---|---|---|---|
| $\\sin\\theta$ | $0$ | $\\frac{1}{2}$ | $\\frac{1}{2}\\sqrt{2}$ | $\\frac{1}{2}\\sqrt{3}$ | $1$ |
| $\\cos\\theta$ | $1$ | $\\frac{1}{2}\\sqrt{3}$ | $\\frac{1}{2}\\sqrt{2}$ | $\\frac{1}{2}$ | $0$ |
| $\\tan\\theta$ | $0$ | $\\frac{1}{3}\\sqrt{3}$ | $1$ | $\\sqrt{3}$ | tak terdef. |

*(Kuadran I: semua $+$ ; Kuadran II: $\\sin +$ ; Kuadran III: $\\tan +$ ; Kuadran IV: $\\cos +$)*.

### Identitas & Hukum Segitiga Sembarang
$$\\sin^2\\theta + \\cos^2\\theta = 1, \\qquad \\sin 2\\theta = 2\\sin\\theta\\cos\\theta, \\qquad \\cos 2\\theta = 1 - 2\\sin^2\\theta = 2\\cos^2\\theta - 1$$
- **Aturan Sinus:** $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$ ($R =$ jari-jari lingkaran luar $\\triangle ABC$).
- **Aturan Cosinus:** $c^2 = a^2 + b^2 - 2ab\\cos C \\iff \\cos C = \\frac{a^2 + b^2 - c^2}{2ab}$.
- **Luas Segitiga:** $L = \\frac{1}{2}ab\\sin C = \\sqrt{s(s-a)(s-b)(s-c)}$ dengan $s = \\frac{a+b+c}{2}$.

### Contoh & Pembahasan Trigonometri PK
> Diketahui $\\triangle ABC$ memiliki $AB = 10$, $AC = 6$, dan luas $15\\sqrt{3}$ dengan $BC > 12$. Hitung $\\cos A$ dan jari-jari lingkaran luar $R$!
- $L = \\frac{1}{2}(10)(6)\\sin A = 30\\sin A = 15\\sqrt{3} \\implies \\sin A = \\frac{1}{2}\\sqrt{3}$, sehingga $\\angle A = 60^\\circ$ atau $120^\\circ$.
- Jika $\\angle A = 60^\\circ$: $BC^2 = 10^2 + 6^2 - 2(10)(6)\\cos 60^\\circ = 76 < 144$ *(ditolak karena syarat $BC > 12$)*.
- Jika $\\angle A = 120^\\circ$: $\\cos A = -\\frac{1}{2}$ dan $BC^2 = 100 + 36 + 60 = 196 \\implies BC = 14$.
- Aturan Sinus: $2R = \\frac{BC}{\\sin A} = \\frac{14}{\\frac{1}{2}\\sqrt{3}} \\implies R = \\frac{14}{\\sqrt{3}} = \\frac{14\\sqrt{3}}{3}$.`,
          },
        ],
      },
      {
        title: "4. Statistika & Peluang",
        materials: [
          {
            title: "Statistika Deskriptif, Transformasi Linear, Pencacahan & Peluang",
            duration: 30,
            content: `${DIAG_PK_STAT_PELUANG}

### Statistika & Transformasi Data Linear ($x_{\\text{baru}} = c \\cdot x_{\\text{lama}} + k$)
1. **Ukuran Pemusatan & Letak** (*Rata-rata $\\bar{x}$, Median, Modus, Kuartil $Q_1, Q_2, Q_3$*):
   berubah mengikuti perkalian **dan** penjumlahan: $\\text{baru} = c \\cdot \\text{lama} + k$.
2. **Ukuran Penyebaran** (*Jangkauan $R = x_{\\max}-x_{\\min}$, Jangkauan Interkuartil $Q_3 - Q_1$, Simpangan Rata-Rata, Simpangan Baku $s$*):
   **TIDAK terpengaruh oleh penambahan/pengurangan konstanta $+k$**, hanya berubah sebesar $|c| \\cdot \\text{lama}$!
3. **Varians (Ragam) $s^2$:** berubah sebesar $c^2 \\cdot \\text{lama}$.
4. **Rumus Rata-Rata & Varians Populasi:**
   $$\\bar{x} = \\frac{\\sum x_i}{n}, \\qquad s^2 = \\frac{\\sum (x_i - \\bar{x})^2}{n} = \\frac{\\sum x_i^2}{n} - \\bar{x}^2$$

### Kaidah Pencacahan & Peluang
- **Aturan Perkalian ($n_1 \\times n_2 \\times \\dots$):** mengisi posisi/digit dengan memperhatikan syarat *boleh berulang vs angka berbeda* dan posisi angka $0$ tidak boleh di depan.
- **Permutasi:** $P(n,r) = \\frac{n!}{(n-r)!}$; **siklis:** $P_{\\text{siklis}} = (n-1)!$; **elemen identik:** $\\frac{n!}{k_1! k_2! \\cdots}$.
- **Kombinasi:** $C(n,r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$.
- **Peluang & Kejadian Majemuk:**
  $$P(A) = \\frac{n(A)}{n(S)}, \\qquad P(A \\cup B) = P(A) + P(B) - P(A \\cap B), \\qquad P(A^c) = 1 - P(A)$$
  - Saling lepas: $P(A \\cap B) = 0$; Saling bebas: $P(A \\cap B) = P(A)\\cdot P(B)$; Peluang bersyarat: $P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}$.

### Contoh & Pembahasan Transformasi Data Linear
> Sekumpulan data memiliki jangkauan $14$, rata-rata $20$, median $19$, dan simpangan baku $4$. Setiap nilai dikalikan $2$ lalu dikurangi $5$. Tentukan jangkauan, rata-rata, median, dan varians data baru!
- **Jangkauan baru** (abaikan $-5$!): $2 \\times 14 = \\mathbf{28}$.
- **Rata-rata baru:** $2(20) - 5 = \\mathbf{35}$.
- **Median baru:** $2(19) - 5 = \\mathbf{33}$.
- **Simpangan baku baru:** $2 \\times 4 = 8 \\implies$ **Varians baru:** $8^2 = \\mathbf{64}$.`,
          },
        ],
      },
    ],
  },
];
