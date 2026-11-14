import { CurriculumSubjectSeed } from "./types";
import {
  DIAG_EKO_PASAR,
  DIAG_EKO_MAKRO,
  DIAG_GEO_KONSEP,
  DIAG_GEO_DINAMIKA,
  DIAG_SOS_STRUKTUR,
  DIAG_SOS_PERUBAHAN,
  DIAG_SEJ_METODE,
  DIAG_SEJ_LINIMASA,
  DIAG_PKN_HIRARKI,
  DIAG_PKN_LEMBAGA,
} from "./diagrams/tkaSmaSoshumDiagrams";

export const TKA_SMA_SOSHUM: CurriculumSubjectSeed[] = [
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Ekonomi",
    description: "Mapel Pilihan TKA SMA: Mikroekonomi (Permintaan, Penawaran, Elastisitas, Pasar), Makroekonomi (Pendapatan Nasional, Inflasi, Kebijakan Fiskal–Moneter) & Akuntansi.",
    chapters: [
      {
        title: "1. Ekonomi Mikro & Makro",
        materials: [
          {
            title: "Permintaan, Penawaran, Keseimbangan Pasar & Elastisitas",
            duration: 25,
            content: `${DIAG_EKO_PASAR}

### Keseimbangan Pasar Sebelum & Sesudah Pajak/Subsidi
- Fungsi permintaan: $Q_d = a - bP$ (gradien negatif); penawaran: $Q_s = -c + dP$ (gradien positif).
- **Keseimbangan Pasar:** $Q_d = Q_s \\iff P_d = P_s$.
- **Pengaruh Pajak ($t$ per unit):** menggeser kurva penawaran ke kiri atas: $P_s' = P_s + t$ atau $Q_s' = f(P - t)$.
- **Pengaruh Subsidi ($s$ per unit):** menggeser kurva penawaran ke kanan bawah: $P_s' = P_s - s$ atau $Q_s' = f(P + s)$.

### Elastisitas Harga ($E_d, E_s$)
$$E = \\left|\\frac{\\Delta Q}{\\Delta P} \\cdot \\frac{P}{Q}\\right| = \\left|Q'(P) \\cdot \\frac{P}{Q}\\right|$$
- $E > 1$: **Elastis** (barang mewah, banyak substitusi);
- $E < 1$: **Inelastis** (kebutuhan pokok seperti beras/garam);
- $E = 1$: Elastis uniter; $E = 0$: Inelastis sempurna; $E = \\infty$: Elastis sempurna.`,
          },
          {
            title: "Pendapatan Nasional, Kebijakan Moneter–Fiskal & Akuntansi Dasar",
            duration: 30,
            content: `${DIAG_EKO_MAKRO}

### Pendapatan Nasional (GDP, GNP, NNP, NNI, PI, DI)
- $\\text{GNP (PNB)} = \\text{GDP (PDB)} + \\text{Pendapatan Neto Luar Negeri}$.
- $\\text{NNP} = \\text{GNP} - \\text{Penyusutan}$.
- $\\text{NNI} = \\text{NNP} - \\text{Pajak Tidak Langsung} + \\text{Subsidi}$.
- **Tiga Pendekatan PDB:**
  1. **Pengeluaran:** $Y = C + I + G + (X - M)$.
  2. **Pendapatan:** $Y = w (\\text{upah}) + r (\\text{sewa}) + i (\\text{bunga}) + \\pi (\\text{laba})$.
  3. **Produksi (Nilai Tambah):** $\\sum (\\text{Nilai Output} - \\text{Input Antara})$.

### Kebijakan Mengatasi Inflasi (Kontraktif) vs Resesi (Ekspansif)
| Kebijakan | Alat Kebijakan | Mengatasi Inflasi (Uang Beredar Dikurangi) | Mengatasi Resesi / Deflasi |
|---|---|---|---|
| **Moneter (Bank Indonesia)** | Suku bunga acuan (*BI Rate*), Giro Wajib Minimum (GWM), Operasi Pasar Terbuka (OPT) | Naikkan BI Rate, naikkan GWM, **jual SBI/SUN** | Turunkan BI Rate, turunkan GWM, **beli SBI/SUN** |
| **Fiskal (Pemerintah/Kemenkeu)** | Pajak ($T$) & Belanja Negara ($G$) | Naikkan tarif pajak, kurangi belanja negara (*surplus*) | Turunkan tarif pajak, tambah belanja & subsidi (*defisit*) |

### Persamaan Dasar Akuntansi & Saldo Normal
$$\\text{Aset (Harta)} = \\text{Liabilitas (Utang)} + \\text{Ekuitas (Modal)}$$
**Saldo Normal:** Aset & Beban bertambah di **Debit**, berkurang di **Kredit**; Utang, Modal, dan Pendapatan bertambah di **Kredit**, berkurang di **Debit**.`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Geografi",
    description: "Mapel Pilihan TKA SMA: Konsep–Prinsip–Pendekatan Geografi, Litosfer–Atmosfer–Hidrosfer, Peta/PJ/SIG, serta Wilayah & Interaksi Desa–Kota.",
    chapters: [
      {
        title: "1. Geografi Fisik, Pemetaan & Wilayah",
        materials: [
          {
            title: "10 Konsep Esensial, 4 Prinsip & 3 Pendekatan Geografi",
            duration: 25,
            content: `${DIAG_GEO_KONSEP}

### Tiga Pendekatan Geografi (Cara Analisis Utama)
1. **Pendekatan Keruangan (Spasial):** menganalisis gejala alam/fisik di satu tempat tanpa campur tangan perilaku manusia (*pergerakan lempeng menyebabkan gempa*).
2. **Pendekatan Kelingkungan (Ekologi):** menganalisis interaksi timbal balik antara **aktivitas manusia dengan lingkungan alam** (*penebangan hutan oleh warga memicu longsor*).
3. **Pendekatan Kompleks Wilayah (Regional):** menganalisis keterkaitan lintas wilayah yang saling memengaruhi (*alur mudik kota–desa atau aliran banjir dari hulu ke hilir melintasi beberapa kabupaten*).

### Empat Prinsip Geografi
- **Persebaran (Distribusi):** tidak meratanya fenomena di permukaan bumi.
- **Interelasi:** hubungan sebab–akibat antarfenomena dalam satu ruang.
- **Deskripsi:** penggambaran fenomena lewat peta, tabel, grafik, dan kata-kata.
- **Korologi:** gabungan ketiganya (persebaran + interelasi + deskripsi dalam suatu wilayah).

### Peta, Penginderaan Jauh (PJ) & Skala
- Jika peta diperbesar $k$ kali $\\implies \\text{Penyebut skala baru} = \\frac{\\text{Penyebut lama}}{k}$.
- **Kontur Topografi ($CI$):** $CI = \\frac{1}{2.000} \\times \\text{Penyebut Skala}$ (meter). Kontur rapat = lereng terjal; kontur renggang = lereng landai.`,
          },
          {
            title: "Dinamika Litosfer, Atmosfer, Hidrosfer & Interaksi Wilayah",
            duration: 25,
            content: `${DIAG_GEO_DINAMIKA}

### Litosfer (Lempeng Tektonik) & Hidrosfer
- **Gerakan Lempeng:** *Konvergen* (tumbukan $\\rightarrow$ palung & pegunungan lipatan/gunung api); *Divergen* (menjauh $\\rightarrow$ punggung tengah samudra); *Transform* (berpapasan $\\rightarrow$ sesar mendatar seperti Sesar Semangko).
- **Klasifikasi Iklim Koppen & Junghuhn:** Junghuhn membagi zona vegetasi berdasarkan **ketinggian tempat**: Panas ($0\\text{–}600\\text{ m}$: padi/tebu), Sedang ($600\\text{–}1.500\\text{ m}$: kopi/teh), Sejuk ($1.500\\text{–}2.500\\text{ m}$: sayuran/cemara), Dingin ($>2.500\\text{ m}$: lumut).

### Teori Interaksi Wilayah & Titik Henti (Breaking Point)
1. **Teori Gravitasi (Reilly):** kekuatan interaksi $I_{AB} = k \\frac{P_A \\cdot P_B}{d_{AB}^2}$.
2. **Teori Titik Henti (lokasi ideal fasilitas seperti RS/pasar antara kota $A$ & $B$ berpenduduk $P_B > P_A$):**
   $$D_{AB} = \\frac{d_{AB}}{1 + \\sqrt{\\frac{P_{\\text{besar}}}{P_{\\text{kecil}}}}}$$
   *(Diukur dari kota dengan penduduk **lebih kecil**!)*`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Sosiologi",
    description: "Mapel Pilihan TKA SMA: Interaksi & Sosialisasi, Nilai–Norma, Stratifikasi & Diferensiasi Sosial, Konflik, Perubahan Sosial & Penelitian Sosial.",
    chapters: [
      {
        title: "1. Struktur Sosial, Konflik & Perubahan Sosial",
        materials: [
          {
            title: "Interaksi Sosial, Lembaga Sosial, Stratifikasi & Konflik",
            duration: 25,
            content: `${DIAG_SOS_STRUKTUR}

### Interaksi Sosial & Proses Asosiatif vs Disosiatif
Syarat interaksi sosial ada dua: **kontak sosial** dan **komunikasi**.
- **Asosiatif (menyatukan):** kerja sama (*kooperasi*), akomodasi (mediasi, arbitrasi, ajudikasi, kompromi, konsiliasi, toleransi), asimilasi ($A+B\\to C$), akulturasi ($A+B\\to AB$).
- **Disosiatif (memecah/persaingan):** persaingan sehat (*kompetisi*), kontravensi (sikap penolakan tersembunyi), dan konflik terbuka.

### Diferensiasi Sosial vs Stratifikasi Sosial
- **Diferensiasi Sosial (Horizontal/Sederajat):** perbedaan ras, etnis, agama, profesi, jenis kelamin tanpa tingkatan tinggi–rendah.
- **Stratifikasi Sosial (Vertikal/Bertingkat):** pelapisan atas–menengah–bawah berdasarkan kekayaan, kekuasaan, kehormatan, atau ilmu pengetahuan (sifatnya *tertutup* seperti kasta, *terbuka* lewat prestasi pendidikan/ekonomi, dan *campuran*).`,
          },
          {
            title: "Perubahan Sosial, Globalisasi & Metodologi Penelitian Sosial",
            duration: 25,
            content: `${DIAG_SOS_PERUBAHAN}

### Teori & Bentuk Perubahan Sosial
- **Evolusi vs Revolusi** (lambat vs cepat); **Direncanakan (*planned*) vs Tidak Direncanakan**; **Struktural (mendasar di sistem lembaga)** vs **Proses (penyempurnaan aturan)**.
- **Dampak Modernisasi/Globalisasi:** *cultural lag* (ketertinggalan budaya nonmaterial dibanding teknologi), *culture shock* (gegar budaya), konsumerisme, namun juga efisiensi & keterbukaan informasi.

### Teknik Pengambilan Sampel Penelitian Sosial
| Teknik Sampling | Ciri Utama |
|---|---|
| **Random / Acak Sederhana** | Setiap anggota populasi homogen memiliki peluang terpilih sama |
| **Stratified Sampling** | Populasi bertingkat/berlapis (mis. kelas X, XI, XII), diambil acak tiap strata |
| **Cluster Sampling** | Mengambil acak kelompok wilayah (kecamatan/RT) ketika populasi sangat luas |
| **Purposive Sampling** | Informan dipilih sengaja berdasarkan kriteria keahlian/pengalaman tertentu |
| **Snowball Sampling** | Dari 1 informan kunci lalu menunjuk informan berikutnya (*berantai*) |`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Sejarah",
    description: "Mapel Pilihan TKA SMA: Historiografi & Konsep Sejarah, Kerajaan Hindu-Buddha–Islam Nusantara, Pergerakan Nasional, Proklamasi hingga Reformasi.",
    chapters: [
      {
        title: "1. Historiografi, Pergerakan Nasional & Indonesia Merdeka",
        materials: [
          {
            title: "Berpikir Diakronis–Sinkronis, Sumber Sejarah & Historiografi",
            duration: 20,
            content: `${DIAG_SEJ_METODE}

### Konsep Berpikir Sejarah
- **Diakronis (Memanjang dalam Waktu):** melacak kronologi sebab–akibat peristiwa dari waktu ke waktu (*contoh: kronologi Perang Diponegoro 1825–1830*).
- **Sinkronis (Melebar dalam Ruang):** mengkaji struktur sosial, ekonomi, dan politik secara mendalam pada satu kurun waktu tertentu (*suasana sosiopolitik Jakarta Agustus 1945*).
- **Empat Langkah Penelitian Sejarah:** **Heuristik** (pengumpulan sumber) $\\rightarrow$ **Verifikasi / Kritik** (ekstern keaslian fisik & intern kredibilitas isi) $\\rightarrow$ **Interpretasi** (penafsiran fakta) $\\rightarrow$ **Historiografi** (penulisan kisah sejarah).`,
          },
          {
            title: "Organisasi Pergerakan Nasional, Proklamasi & Dinamika Orde",
            duration: 25,
            content: `${DIAG_SEJ_LINIMASA}

### Tonggak Pergerakan Nasional Indonesia
- **Budi Utomo (20 Mei 1908):** pelopor organisasi modern (fokus pendidikan/kebudayaan Jawa).
- **Sarekat Islam (1911/1912):** organisasi massa berbasis ekonomi pedagang pribumi & solidaritas Islam.
- **Indische Partij (1912):** Tiga Serangkai (*Douwes Dekker, Tjipto Mangoenkoesoemo, Ki Hajar Dewantara*) — organisasi pertama berhaluan politik tegas menuntut kemerdekaan Hindia (*nonkooperatif*).
- **Sumpah Pemuda (28 Oktober 1928):** Kongres Pemuda II menegaskan satu tumpah darah, satu bangsa, dan bahasa persatuan bahasa Indonesia.

### Peristiwa Kritis Pasca-Proklamasi 1945 – Reformasi 1998
- **Demokrasi Liberal / Parlementer (1950–1959):** kabinet jatuh-bangun akibat mosi tidak percaya parlemen; prestasi gemilang **Konferensi Asia–Afrika (Bandung 1955)** & **Deklarasi Djuanda (1957)** yang menyatukan perairan nusantara.
- **Dekrit Presiden 5 Juli 1959:** pembubaran Konstituante & kembali ke UUD 1945 mengawali Demokrasi Terpimpin.
- **Orde Baru (1966–1998) & Reformasi (1998):** diawali Supersemar, fokus pembangunan Repelita & swasembada beras (1984), berakhir akibat krisis moneter 1997–1998, KKN, serta tuntutan mahasiswa (6 Agenda Reformasi termasuk amandemen UUD 1945 dan penghapusan Dwifungsi ABRI).`,
          },
        ],
      },
    ],
  },
  {
    examType: "TKA_SMA",
    title: "TKA SMA · Pendidikan Pancasila",
    description: "Mapel Pilihan TKA SMA: Ideologi Pancasila, Konstitusi UUD NRI 1945 & Amandemen, Lembaga Negara, Otonomi Daerah, HAM & Hubungan Internasional.",
    chapters: [
      {
        title: "1. Pancasila, Konstitusi & Sistem Ketatanegaraan",
        materials: [
          {
            title: "Nilai Dasar–Instrumental–Praksis Pancasila & Kedudukan UUD 1945",
            duration: 20,
            content: `${DIAG_PKN_HIRARKI}

### Hierarki Peraturan Perundang-Undangan (UU No. 12 Tahun 2011)
1. **UUD NRI Tahun 1945** (hukum dasar tertinggi),
2. **Ketetapan MPR (TAP MPR)**,
3. **Undang-Undang (UU) / Peraturan Pemerintah Pengganti UU (Perppu)**,
4. **Peraturan Pemerintah (PP)**,
5. **Peraturan Presiden (Perpres)**,
6. **Peraturan Daerah (Perda Provinsi dan Perda Kabupaten/Kota)**.
*(Prinsip Lex Superior Derogat Legi Inferiori: aturan lebih rendah tidak boleh bertentangan dengan aturan lebih tinggi!)*

### Tiga Dimensi Nilai & Ideologi Terbuka Pancasila
- **Nilai Dasar:** kelima sila Pancasila yang bersifat tetap & universal.
- **Nilai Instrumental:** penjabaran ke dalam UUD 1945, UU, dan peraturan pelaksana yang dapat menyesuaikan perkembangan zaman.
- **Nilai Praksis:** wujud nyata perilaku warga dalam kehidupan bermasyarakat sehari-hari.`,
          },
          {
            title: "Lembaga Negara Pasca-Amandemen & Otonomi Daerah",
            duration: 20,
            content: `${DIAG_PKN_LEMBAGA}

### Pembagian Kekuasaan Lembaga Tinggi Negara Pasca-Amandemen UUD 1945
- **MPR:** berwenang mengubah/menetapkan UUD serta melantik Presiden/Wapres (tidak lagi menjadi lembaga tertinggi negara!).
- **DPR:** fungsi **legislasi** (membentuk UU bersama Presiden), **anggaran**, dan **pengawasan**; memiliki hak interpelasi, hak angket, dan hak menyatakan pendapat.
- **Mahkamah Konstitusi (MK):** menguji UU terhadap UUD (*judicial review*), memutus sengketa kewenangan lembaga negara, pembubaran parpol, serta perselisihan hasil pemilu (PHPU).
- **Mahkamah Agung (MA):** mengadili tingkat kasasi serta menguji peraturan perundang-undangan di bawah UU terhadap UU.

### Desentralisasi & 6 Urusan Pemerintahan Absolut Pusat
Dalam otonomi daerah, seluruh urusan diserahkan ke daerah **kecuali 6 urusan absolut Pemerintah Pusat**:
1. Politik luar negeri,
2. Pertahanan,
3. Keamanan,
4. Yustisi (peradilan),
5. Moneter dan fiskal nasional,
6. Agama.`,
          },
        ],
      },
    ],
  },
];

