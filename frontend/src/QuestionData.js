// Data Dummy untuk 7 Sub-tes UTBK
export const UTBK_DATA = {
  // --- TES POTENSI SKOLASTIK (TPS) ---
  PU: {
    title: "Penalaran Umum",
    duration: 30, // menit
    description: "Menguji kemampuan memecahkan masalah baru menggunakan nalar.",
    questions: [
      {
        id: 'PU-1',
        type: 'multiple_choice',
        text: "Semua mahasiswa S3 rajin meneliti. Sebagian dosen adalah mahasiswa S3. Simpulan yang paling tepat adalah...",
        options: [
          { id: 'A', label: "Semua dosen rajin meneliti", is_math: false },
          { id: 'B', label: "Sebagian dosen rajin meneliti", is_math: false },
          { id: 'C', label: "Tidak ada dosen yang rajin meneliti", is_math: false },
        ]
      },
      // Tambahkan soal lainnya...
    ]
  },
  PPU: {
    title: "Pengetahuan & Pemahaman Umum",
    duration: 15,
    description: "Menguji kemampuan memahami wacana dan pengetahuan umum.",
    questions: [
      {
        id: 'PPU-1',
        type: 'multiple_choice',
        text: "Sinonim dari kata 'Eklektik' dalam konteks arsitektur adalah...",
        options: [
          { id: 'A', label: "Campuran", is_math: false },
          { id: 'B', label: "Murni", is_math: false },
          { id: 'C', label: "Kuno", is_math: false },
        ]
      }
    ]
  },
  PBM: {
    title: "Pemahaman Bacaan & Menulis",
    duration: 20,
    description: "Menguji kemampuan memahami isi bacaan dan aturan penulisan.",
    questions: [
      {
        id: 'PBM-1',
        type: 'multiple_choice',
        text: "Penulisan judul karangan yang tepat sesuai PUEBI adalah...",
        options: [
          { id: 'A', label: "Dari Ave Maria Ke Jalan Lain Ke Roma", is_math: false },
          { id: 'B', label: "Dari Ave Maria ke Jalan Lain ke Roma", is_math: false },
        ]
      }
    ]
  },
  PK: {
    title: "Pengetahuan Kuantitatif",
    duration: 20,
    description: "Menguji kedalaman pengetahuan matematika dasar.",
    questions: [
      {
        id: 'PK-1',
        type: 'multiple_choice',
        text: "Manakah hubungan yang benar antara kuantitas P dan Q berikut?",
        math_content: "P = 2^{30}, \\quad Q = 8^{10}",
        options: [
          { id: 'A', label: "P > Q", is_math: false },
          { id: 'B', label: "Q > P", is_math: false },
          { id: 'C', label: "P = Q", is_math: false },
        ]
      }
    ]
  },

  // --- LITERASI ---
  LBI: {
    title: "Literasi Bahasa Indonesia",
    duration: 45,
    description: "Menguji kemampuan memahami esensi bacaan teks Bahasa Indonesia.",
    questions: [
      {
        id: 'LBI-1',
        type: 'multiple_choice',
        text: "Gagasan utama paragraf pertama pada teks di samping adalah...",
        options: [{ id: 'A', label: "Dampak pemanasan global", is_math: false }]
      }
    ]
  },
  LBE: {
    title: "Literasi Bahasa Inggris",
    duration: 30,
    description: "Test reading comprehension in English.",
    questions: [
      {
        id: 'LBE-1',
        type: 'multiple_choice',
        text: "What is the main topic of the passage?",
        options: [{ id: 'A', label: "Artificial Intelligence", is_math: false }]
      }
    ]
  },
  PM: {
    title: "Penalaran Matematika",
    duration: 30,
    description: "Menguji kemampuan menyelesaikan masalah matematika dalam konteks nyata.",
    questions: [
      {
        id: 'PM-1',
        type: 'short_answer',
        text: "Seorang pedagang membeli 20 kg beras. Jika ia ingin untung 10%...",
        math_content: null,
        options: []
      }
    ]
  }
};