export type AsnafCategory = "FAKIR" | "MISKIN" | "FISABILILLAH";
export type StatusKelulusan =
  | "BELUM_DIUMUMKAN"
  | "DITERIMA_SNBP"
  | "DITERIMA_SNBT"
  | "DITERIMA_SPAN_PTKIN"
  | "TIDAK_LOLOS";

export interface SantriTryoutScore {
  attemptId?: string;
  examId?: string;
  tryoutName: string;
  score: number;
  date: string;
  examType?: string;
  isIRT?: boolean;
  scaleMax?: number;
  correctCount?: number;
  totalQuestions?: number;
}

export interface SantriSubscoreDetail {
  sectionId: string;
  subject: string;
  score: number;
  fullMark: number;
  correct: number;
  total: number;
}

export interface SantriAttemptRecap {
  attemptId: string;
  examId: string;
  examTitle: string;
  examType: string;
  score: number;
  isIRT: boolean;
  scaleMax: number;
  correctCount: number;
  answeredCount: number;
  totalQuestions: number;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
  date: string;
  subscores: SantriSubscoreDetail[];
}

export interface SantriBaznas {
  id: string;
  pesantrenId?: string;
  name: string;
  nisn: string;
  gender: "L" | "P";
  kelas: string;
  asnaf: AsnafCategory;
  hafalanJuz: number;
  prestasi: string;
  targetUniv1: string;
  targetMajor1: string;
  targetUniv2: string;
  targetMajor2: string;
  tryoutScores: SantriTryoutScore[];
  attemptHistory?: SantriAttemptRecap[];
  attemptCount?: number;
  latestScore?: number | null;
  averageScore: number;
  statusKelulusan: StatusKelulusan;
  diterimaDi?: string;
  emailLogin: string;
  passwordLogin: string;
  sktmNomor?: string;
}

export interface PesantrenProfile {
  id?: string;
  slug?: string;
  namaPesantren: string;
  nsp: string;
  pimpinan: string;
  koordinator: string;
  kontak: string;
  alamat: string;
  tahunProgram: string;
  anggaranPerSantri: number;
  adminEmail?: string | null;
}

export interface LogbookBimbingan {
  id: string;
  pesantrenId?: string;
  tanggal: string;
  waktu: string;
  materi: string;
  subtes: string;
  tutor: string;
  jumlahHadir: number;
  keterangan: string;
}

export const DEFAULT_PESANTREN_SEED = [
  {
    id: "pesantren-1",
    slug: "pesantren-1",
    namaPesantren: "Pondok Pesantren Al Abqory",
    nsp: "510032010892",
    pimpinan: "Pimpinan Pondok Pesantren Al Abqory",
    koordinator: "Koordinator BAZNAS Al Abqory",
    kontak: "0812-0000-0001",
    alamat: "Alamat Pondok Pesantren Al Abqory (Lengkapi via menu Profil Pesantren)",
    tahunProgram: "2026/2027",
    anggaranPerSantri: 4000000,
    adminEmail: "admin.alabqory@az.cbt",
  },
  {
    id: "pesantren-2",
    slug: "pesantren-2",
    namaPesantren: "Pondok Pesantren Nurul Bantaniy",
    nsp: "510036040002",
    pimpinan: "Pimpinan Pondok Pesantren Nurul Bantaniy",
    koordinator: "Koordinator BAZNAS Nurul Bantaniy",
    kontak: "0812-0000-0002",
    alamat: "Alamat Pondok Pesantren Nurul Bantaniy (Lengkapi via menu Profil Pesantren)",
    tahunProgram: "2026/2027",
    anggaranPerSantri: 4000000,
    adminEmail: "admin.nurulbantaniy@az.cbt",
  },
];

export const DEFAULT_SANTRI_SEED: SantriBaznas[] = [
  {
    id: "bsb-01",
    pesantrenId: "pesantren-1",
    name: "Muhammad Rizky Pratama",
    nisn: "0068192301",
    gender: "L",
    kelas: "XII MIPA 1",
    asnaf: "MISKIN",
    hafalanJuz: 10,
    prestasi: "Juara 2 MQK Tingkat Provinsi",
    targetUniv1: "UNIVERSITAS INDONESIA",
    targetMajor1: "Ilmu Komputer",
    targetUniv2: "UNIVERSITAS PADJADJARAN",
    targetMajor2: "Teknik Informatika",
    tryoutScores: [
      { tryoutName: "TO 1 - Diagnostik", score: 540, date: "2026-08-10" },
      { tryoutName: "TO 2 - Progresif", score: 625, date: "2026-09-05" },
      { tryoutName: "TO 3 - Pemantapan", score: 680, date: "2026-10-01" },
    ],
    averageScore: 615,
    statusKelulusan: "BELUM_DIUMUMKAN",
    emailLogin: "rizky.santri@az.cbt",
    passwordLogin: "BSB2026A",
    sktmNomor: "401/SKTM/CSR/VII/2026",
  },
  {
    id: "bsb-02",
    pesantrenId: "pesantren-1",
    name: "Aisyah Nur Rahmah",
    nisn: "0068192302",
    gender: "P",
    kelas: "XII MIPA 1",
    asnaf: "FAKIR",
    hafalanJuz: 30,
    prestasi: "Hafidzah 30 Juz Mutqin & Juara 1 Tahfidz MTQ",
    targetUniv1: "UNIVERSITAS AIRLANGGA",
    targetMajor1: "Kedokteran",
    targetUniv2: "UNIVERSITAS BRAWIJAYA",
    targetMajor2: "Farmasi",
    tryoutScores: [
      { tryoutName: "TO 1 - Diagnostik", score: 590, date: "2026-08-10" },
      { tryoutName: "TO 2 - Progresif", score: 660, date: "2026-09-05" },
      { tryoutName: "TO 3 - Pemantapan", score: 715, date: "2026-10-01" },
    ],
    averageScore: 655,
    statusKelulusan: "DITERIMA_SNBP",
    diterimaDi: "Kedokteran - UNIVERSITAS AIRLANGGA (Jalur Tahfidz)",
    emailLogin: "aisyah.santri@az.cbt",
    passwordLogin: "BSB2026B",
    sktmNomor: "401/SKTM/CSR/VII/2026",
  },
  {
    id: "bsb-03",
    pesantrenId: "pesantren-1",
    name: "Fathurrahman Al-Farisi",
    nisn: "0068192303",
    gender: "L",
    kelas: "XII IPS 1",
    asnaf: "MISKIN",
    hafalanJuz: 5,
    prestasi: "Debat Bahasa Arab Tingkat Kabupaten",
    targetUniv1: "UNIVERSITAS GADJAH MADA",
    targetMajor1: "Ilmu Hubungan Internasional",
    targetUniv2: "UNIVERSITAS DIPONEGORO",
    targetMajor2: "Ilmu Hukum",
    tryoutScores: [
      { tryoutName: "TO 1 - Diagnostik", score: 510, date: "2026-08-10" },
      { tryoutName: "TO 2 - Progresif", score: 595, date: "2026-09-05" },
      { tryoutName: "TO 3 - Pemantapan", score: 645, date: "2026-10-01" },
    ],
    averageScore: 583,
    statusKelulusan: "BELUM_DIUMUMKAN",
    emailLogin: "fathur.santri@az.cbt",
    passwordLogin: "BSB2026C",
    sktmNomor: "402/SKTM/CSR/VII/2026",
  },
  {
    id: "bsb-04",
    pesantrenId: "pesantren-1",
    name: "Khadijah Zahra",
    nisn: "0068192304",
    gender: "P",
    kelas: "XII IPS 2",
    asnaf: "FISABILILLAH",
    hafalanJuz: 15,
    prestasi: "Juara 3 Esai Keislaman Nasional",
    targetUniv1: "UNIVERSITAS SEBELAS MARET",
    targetMajor1: "Manajemen",
    targetUniv2: "UIN SYARIF HIDAYATULLAH",
    targetMajor2: "Perbankan Syariah",
    tryoutScores: [
      { tryoutName: "TO 1 - Diagnostik", score: 530, date: "2026-08-10" },
      { tryoutName: "TO 2 - Progresif", score: 610, date: "2026-09-05" },
      { tryoutName: "TO 3 - Pemantapan", score: 650, date: "2026-10-01" },
    ],
    averageScore: 596,
    statusKelulusan: "BELUM_DIUMUMKAN",
    emailLogin: "khadijah.santri@az.cbt",
    passwordLogin: "BSB2026D",
    sktmNomor: "403/SKTM/CSR/VII/2026",
  },
  {
    id: "bsb-05",
    pesantrenId: "pesantren-1",
    name: "Zulfa Ihsan Kamil",
    nisn: "0068192305",
    gender: "L",
    kelas: "XII MIPA 2",
    asnaf: "MISKIN",
    hafalanJuz: 7,
    prestasi: "Finalis Olimpiade Matematika Sains Madrasah",
    targetUniv1: "INSTITUT TEKNOLOGI BANDUNG",
    targetMajor1: "Fakultas Teknik Pertambangan dan Perminyakan",
    targetUniv2: "UNIVERSITAS BRAWIJAYA",
    targetMajor2: "Teknik Mesin",
    tryoutScores: [
      { tryoutName: "TO 1 - Diagnostik", score: 560, date: "2026-08-10" },
      { tryoutName: "TO 2 - Progresif", score: 630, date: "2026-09-05" },
      { tryoutName: "TO 3 - Pemantapan", score: 690, date: "2026-10-01" },
    ],
    averageScore: 626,
    statusKelulusan: "BELUM_DIUMUMKAN",
    emailLogin: "zulfa.santri@az.cbt",
    passwordLogin: "BSB2026E",
    sktmNomor: "404/SKTM/CSR/VII/2026",
  },
  {
    id: "bsb-06",
    pesantrenId: "pesantren-1",
    name: "Maryam Shalihah",
    nisn: "0068192306",
    gender: "P",
    kelas: "XII Keagamaan",
    asnaf: "FAKIR",
    hafalanJuz: 20,
    prestasi: "Juara 1 Baca Kitab Fathul Qorib",
    targetUniv1: "UIN SUNAN KALIJAGA",
    targetMajor1: "Ilmu Al-Qur'an dan Tafsir",
    targetUniv2: "UNIVERSITAS INDONESIA",
    targetMajor2: "Sastra Arab",
    tryoutScores: [
      { tryoutName: "TO 1 - Diagnostik", score: 520, date: "2026-08-10" },
      { tryoutName: "TO 2 - Progresif", score: 580, date: "2026-09-05" },
      { tryoutName: "TO 3 - Pemantapan", score: 630, date: "2026-10-01" },
    ],
    averageScore: 576,
    statusKelulusan: "BELUM_DIUMUMKAN",
    emailLogin: "maryam.santri@az.cbt",
    passwordLogin: "BSB2026F",
    sktmNomor: "405/SKTM/CSR/VII/2026",
  },
];

export const DEFAULT_LOGBOOK_SEED: LogbookBimbingan[] = [
  {
    id: "log-01",
    pesantrenId: "pesantren-1",
    tanggal: "2026-08-08",
    waktu: "08:30 - 11:30 WIB",
    materi: "Orientasi Program & Strategi Sukses Tembus PTN via Beasiswa Santri",
    subtes: "Sosialisasi SNBP & SNBT",
    tutor: "Dr. H. Hendra Wijaya, M.Pd.",
    jumlahHadir: 6,
    keterangan: "Pemberian motivasi, pemetaan target prodi, dan pembagian modul tryout perdana.",
  },
  {
    id: "log-02",
    pesantrenId: "pesantren-1",
    tanggal: "2026-08-15",
    waktu: "13:30 - 15:30 WIB",
    materi: "Bedah Soal Penalaran Umum & Pola Logika Analitis",
    subtes: "TPS - Penalaran Umum",
    tutor: "Ustadz Zulfikar, S.Si.",
    jumlahHadir: 6,
    keterangan: "Santri membedah 30 variasi soal logika proposisi dan silogisme.",
  },
  {
    id: "log-03",
    pesantrenId: "pesantren-1",
    tanggal: "2026-08-22",
    waktu: "09:00 - 11:30 WIB",
    materi: "Teknik Cepat Literasi Bahasa Indonesia & Teks Analitis",
    subtes: "Literasi Bahasa Indonesia",
    tutor: "Ustadzah Fatimah, M.Hum.",
    jumlahHadir: 6,
    keterangan: "Latihan skimming teks panjang dan penentuan ide pokok paragraf tersirat.",
  },
  {
    id: "log-04",
    pesantrenId: "pesantren-1",
    tanggal: "2026-09-05",
    waktu: "08:00 - 11:45 WIB",
    materi: "Tryout Progresif 2 Serentak CBT AZ Academy",
    subtes: "Simulasi Penuh UTBK-SNBT",
    tutor: "Tim Akademik AZ Academy",
    jumlahHadir: 6,
    keterangan: "Tryout CBT menggunakan komputer lab pondok dengan sistem waktu riil subtes.",
  },
  {
    id: "log-05",
    pesantrenId: "pesantren-1",
    tanggal: "2026-09-12",
    waktu: "08:30 - 11:30 WIB",
    materi: "Strategi Soal Pengetahuan Kuantitatif (PK) & Logika Angka",
    subtes: "TPS - Pengetahuan Kuantitatif (PK)",
    tutor: "Ustadz Zulfikar, S.Si.",
    jumlahHadir: 6,
    keterangan: "Latihan pemecahan soal matriks, aritmatika modular, perbandingan kuantitas P vs Q, dan analisis kecukupan data (1) & (2).",
  },
  {
    id: "log-06",
    pesantrenId: "pesantren-1",
    tanggal: "2026-09-19",
    waktu: "13:30 - 15:30 WIB",
    materi: "Bedah Soal Pengetahuan & Pemahaman Umum (PPU) & Frasa Semantik",
    subtes: "TPS - Pengetahuan & Pemahaman Umum (PPU)",
    tutor: "Ustadzah Fatimah, M.Hum.",
    jumlahHadir: 6,
    keterangan: "Pemahaman struktur kalimat formal, analogi kosakata, ungkapan idiomatik, dan pembentukan kata serapan.",
  },
  {
    id: "log-07",
    pesantrenId: "pesantren-1",
    tanggal: "2026-09-26",
    waktu: "13:30 - 16:00 WIB",
    materi: "Pendalaman Penalaran Matematika & Aljabar Kontekstual",
    subtes: "Penalaran Matematika (PM)",
    tutor: "Ustadz Zulfikar, S.Si.",
    jumlahHadir: 6,
    keterangan: "Fokus pada soal cerita representasi grafik, peluang kejadian majemuk, dan aritmatika sosial.",
  },
  {
    id: "log-08",
    pesantrenId: "pesantren-1",
    tanggal: "2026-10-01",
    waktu: "08:00 - 12:00 WIB",
    materi: "Tryout Pemantapan 3 & Konsultasi Portofolio Tahfidz SNBP",
    subtes: "CBT Pemantapan & Konseling SNBP",
    tutor: "Ustadz Ahmad Fauzi, S.Pd.I",
    jumlahHadir: 6,
    keterangan: "Analisis rasionalisasi SNBP santri hafidzah dan pemantapan pilihan prodi serta evaluasi skor 7 subtes.",
  },
];

