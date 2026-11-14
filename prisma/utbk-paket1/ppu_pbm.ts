import { SeedQuestion } from "./pu";

const PPU_TEKS_1 = `^1Perpustakaan kota membangun arsip digital untuk menyimpan salinan naskah lama dan rekaman sejarah lisan. ^2Setiap berkas diberi metadata agar penelusuran dapat dilakukan tanpa membuka dokumen satu per satu. ^3Petugas menyebut metadata sebagai “jembatan ingatan” karena keterangan ringkas itu menghubungkan pengguna dengan dokumen yang dicari. ^4Selain mempercepat pencarian, sistem tersebut membantu menemukan berkas yang belum memiliki keterangan lengkap. ^5Arsip digital akhirnya berfungsi bukan hanya sebagai gudang berkas, melainkan juga sebagai sarana temu kembali informasi. ^6Sebelum dipublikasikan, salinan diperiksa kembali untuk memastikan halaman terbaca dan keterangan dasar tidak tertukar. ^7Jika ditemukan dua versi keterangan yang berbeda, petugas menandainya untuk ditelusuri sebelum pengguna mengandalkan informasi tersebut. ^8Prosedur itu membuat ketepatan keterangan menjadi sama pentingnya dengan kecepatan pencarian.`;

const PPU_TEKS_2 = `^1Pemerintah kota menambah layanan bus pengumpan di tiga kawasan permukiman. ^2Layanan itu dirancang untuk menghubungkan warga dengan stasiun kereta yang sebelumnya sulit dijangkau. ^3Pada bulan pertama, jumlah penumpang meningkat, tetapi sebagian warga masih mengeluhkan waktu tunggu pada jam sibuk. ^4Pengelola kemudian menambah satu armada pada rute terpadat sehingga jarak kedatangan antarbus menjadi lebih singkat. ^5Perubahan itu belum menyelesaikan seluruh keluhan karena kepadatan lalu lintas tetap memengaruhi ketepatan waktu. ^6Pada jam non-sibuk, perubahan waktu tunggu relatif kecil karena jumlah kendaraan dan kepadatan jalan sama-sama rendah. ^7Pengelola karena itu membandingkan data per jam, bukan hanya rata-rata harian, sebelum menilai keberhasilan penambahan armada. ^8Perbandingan tersebut membantu memisahkan masalah kapasitas layanan dari gangguan lalu lintas.`;

const PPU_TEKS_3 = `^1Kebun sekolah yang semula hanya berupa petak percobaan kini berkembang menjadi ruang belajar bersama. ^2Guru IPA memakainya untuk mengamati pertumbuhan tanaman, sedangkan guru ekonomi menggunakannya untuk mengenalkan pencatatan biaya sederhana. ^3Para siswa menyebut kebun tersebut laboratorium hidup karena kegiatan belajar berlangsung langsung di tengah objek yang diamati. ^4Agar kegiatan tidak berhenti setelah panen pertama, sekolah membentuk kelompok perawatan bergilir. ^5Kelompok itu mencatat jadwal penyiraman, kebutuhan kompos, dan hasil setiap petak. ^6Catatan tersebut kemudian dipakai untuk membandingkan cara perawatan yang berbeda. ^7Setiap kelompok juga mencatat perubahan kondisi tanaman agar hasil panen tidak dibaca tanpa informasi tentang cara perawatannya. ^8Jika dua petak menghasilkan jumlah panen berbeda, siswa diminta memeriksa catatan sebelum menyimpulkan metode mana yang lebih baik. ^9Dengan demikian, kebun juga melatih kebiasaan menggunakan bukti sebelum menarik simpulan.`;

const PPU_TEKS_4 = `^1Tim museum menyiapkan pameran benda sejarah dari beberapa wilayah. ^2Setiap benda disertai label yang menerangkan asal, perkiraan usia, dan fungsi sosialnya. ^3Kurator memeriksa sumber keterangan sebelum label dicetak agar informasi tidak sekadar menarik, tetapi juga dapat dipertanggungjawabkan. ^4Dalam rapat akhir, tim menyepakati untuk memeriksa ejaan, memastikan ukuran huruf terbaca, dan kesesuaian istilah teknis. ^5Setelah seluruh label selesai, pengunjung uji coba diminta membaca beberapa bagian untuk menilai kejelasan bahasa. ^6Masukan pengunjung kemudian digunakan tim untuk memperbaiki label yang masih membingungkan. ^7Uji coba dilakukan pada pengunjung dengan latar pengetahuan berbeda agar istilah yang dianggap jelas oleh kurator tidak otomatis diasumsikan jelas bagi semua orang. ^8Label yang terlalu padat dipersingkat tanpa menghilangkan informasi asal dan fungsi benda. ^9Proses ini menempatkan ketepatan dan keterbacaan sebagai dua sasaran yang harus dijaga bersama.`;

const PPU_TEKS_5 = `^1Sebuah perpustakaan kecamatan membuka layanan peminjaman alat rumah tangga sederhana seperti bor, tangga lipat, dan alat ukur. ^2Program itu muncul setelah pengelola menemukan bahwa banyak warga hanya membutuhkan alat tertentu beberapa kali dalam setahun. ^3Setiap alat diperiksa sebelum dan sesudah dipinjam agar kerusakan dapat diketahui tanpa menunggu keluhan pengguna berikutnya. ^4Peminjam juga menerima petunjuk keselamatan singkat yang disesuaikan dengan jenis alat yang dibawa. ^5Pada tiga bulan pertama, sebagian warga mengusulkan agar jumlah alat populer ditambah, sedangkan pengelola masih menilai pola permintaan. ^6Penambahan koleksi perlu dilakukan berdasarkan frekuensi peminjaman dan biaya perawatan, bukan hanya banyaknya usulan. ^7Dengan pendekatan itu, program dipandang bermanfaat, tetapi pengembangannya tetap memerlukan data penggunaan yang cukup.`;

function formatSuperscriptNumbers(t: string): string {
  return t.replace(/\^(\d)/g, "<sup>$1</sup>");
}

export const PPU_QUESTIONS: SeedQuestion[] = [
  {
    orderIndex: 1,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_1),
    prompt: "Pola pembentukan frasa *“arsip digital”* pada kalimat (1) sama dengan pola frasa ....",
    options: ["telah disimpan", "mencari data", "di perpustakaan", "sangat cepat", "peta tematik"],
    answerKey: "E",
    explanation:
      "Frasa *arsip digital* berpola DM (Nomina + Adjektiva/penjelas jenis), yang sejajar dengan *peta tematik* (Nomina + Adjektiva).",
  },
  {
    orderIndex: 2,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_1),
    prompt: "Dalam konteks bacaan, kata *“penelusuran”* pada kalimat (2) paling dekat maknanya dengan ....",
    options: ["penyalinan", "penerbitan", "pencarian", "penghapusan", "penyimpanan"],
    answerKey: "C",
    explanation:
      "Kata *penelusuran* dalam konteks metadata arsip bermakna **pencarian** dokumen.",
  },
  {
    orderIndex: 3,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_1),
    prompt: "Maksud ungkapan *“jembatan ingatan”* dalam bacaan paling dekat dengan ....",
    options: [
      "penghubung antara pengguna dan informasi yang tersimpan",
      "catatan yang menggantikan dokumen asli",
      "nama resmi sistem penyimpanan kota",
      "alat untuk menghafal seluruh dokumen",
      "bangunan yang menyatukan dua ruang arsip",
    ],
    answerKey: "A",
    explanation:
      "Kalimat (3) menjelaskan langsung bahwa keterangan ringkas (metadata) disebut \"jembatan ingatan\" karena menghubungkan pengguna dengan dokumen yang dicari.",
  },
  {
    orderIndex: 4,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_1),
    prompt: "Dalam hierarki makna, kata yang menaungi *“metadata”* adalah ....",
    options: ["perpustakaan", "dokumen", "pemindai", "rak", "informasi"],
    answerKey: "E",
    explanation:
      "Metadata adalah keterangan atau informasi tentang data/berkas, sehingga hipernimnya adalah **informasi**.",
  },
  {
    orderIndex: 5,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_2),
    prompt: "Prefiks *peN-* pada kata *“pengelola”* dalam kalimat (4) menyatakan makna ....",
    options: [
      "hasil pengelolaan",
      "proses mengelola",
      "pelaku yang melakukan kegiatan mengelola",
      "alat untuk mengelola",
      "tempat mengelola",
    ],
    answerKey: "C",
    explanation:
      "Imbuhan *peN-* pada kata *pengelola* (orang/pihak yang mengelola) menyatakan **pelaku** kegiatan.",
  },
  {
    orderIndex: 6,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_2),
    prompt: "Pada uraian mengenai bus pengumpan, kolokasi yang paling mapan ialah ....",
    options: ["kereta sulit", "jam sibuk", "armada padat", "warga singkat", "jalan waktu"],
    answerKey: "B",
    explanation:
      "Kolokasi (sanding kata yang lazim/mapan) dalam teks adalah **jam sibuk** (*peak hour*).",
  },
  {
    orderIndex: 7,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_2),
    prompt: "Jika makna kata *“padat”* dibalik dalam konteks tersebut, kata yang paling tepat adalah ....",
    options: ["pendek", "lambat", "lengang", "sempit", "jauh"],
    answerKey: "C",
    explanation:
      "Dalam konteks lalu lintas dan rute transportasi, lawan kata *padat* adalah **lengang**.",
  },
  {
    orderIndex: 8,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_2),
    prompt: "Dalam bacaan tentang bus pengumpan, kata yang digunakan dengan makna paling denotatif adalah ....",
    options: ["rute terpadat", "jam sibuk", "menghubungkan", "stasiun", "jarak kedatangan"],
    answerKey: "D",
    explanation:
      "**Stasiun** merujuk langsung pada makna kamus sebenarnya (tempat perhentian kereta) secara denotatif.",
  },
  {
    orderIndex: 9,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_3),
    prompt: "Dalam konteks kebun sekolah, kata penghubung *“sedangkan”* pada kalimat (2) menandai hubungan ....",
    options: [
      "urutan waktu",
      "perbandingan dua pemanfaatan yang berbeda tetapi setara",
      "sebab-akibat langsung",
      "syarat terjadinya kegiatan",
      "penegasan kesimpulan",
    ],
    answerKey: "B",
    explanation:
      "Konjungsi koordinatif *sedangkan* mempertentangkan/membandingkan dua klausa setara: pemanfaatan oleh guru IPA dan guru ekonomi.",
  },
  {
    orderIndex: 10,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_3),
    prompt: "Referen paling tepat dari *“tersebut”* pada kalimat (3) ialah ....",
    options: ["kebun sekolah", "pertumbuhan tanaman", "guru IPA", "pencatatan biaya", "guru ekonomi"],
    answerKey: "A",
    explanation:
      "Frasa *kebun tersebut* pada kalimat (3) merujuk kembali pada subjek kalimat (1), yaitu **kebun sekolah**.",
  },
  {
    orderIndex: 11,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_3),
    prompt: "Dalam bacaan tentang kebun sekolah, hubungan gagasan antara kalimat (4) dan (5) adalah ....",
    options: [
      "kalimat (5) menyangkal kalimat (4)",
      "kalimat (5) memerinci pelaksanaan kelompok perawatan yang dibentuk pada kalimat (4)",
      "kalimat (5) menyimpulkan seluruh bacaan",
      "kalimat (5) menyatakan sebab kalimat (4)",
      "kedua kalimat membahas topik yang tidak berkaitan",
    ],
    answerKey: "B",
    explanation:
      "Kalimat (4) menyatakan pembentukan kelompok perawatan bergilir, lalu kalimat (5) memerinci apa saja yang dicatat kelompok tersebut.",
  },
  {
    orderIndex: 12,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_3),
    prompt: "Pada uraian mengenai kebun sekolah, batas paragraf paling logis terletak setelah ....",
    options: ["kalimat (4)", "kalimat (5)", "kalimat (1)", "kalimat (3)", "kalimat (2)"],
    answerKey: "D",
    explanation:
      "Kalimat (1)–(3) memperkenalkan fungsi kebun sekolah sebagai ruang belajar bersama, sedangkan kalimat (4)–(9) membahas pengelolaan perawatan dan pencatatan pascapanen pertama.",
  },
  {
    orderIndex: 13,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_4),
    prompt: "Dalam konteks label museum, subjek-predikat utama pada kalimat (3) membentuk inti ....",
    options: [
      "kurator memeriksa sumber keterangan",
      "sumber dapat dipertanggungjawabkan",
      "label dicetak",
      "tim museum menyiapkan pameran",
      "informasi menarik",
    ],
    answerKey: "A",
    explanation:
      "Klausa induk kalimat (3) adalah *Kurator (S) memeriksa (P) sumber keterangan (O)*, sedangkan klausa *sebelum label dicetak* dan *agar informasi...* merupakan klausa subordinatif.",
  },
  {
    orderIndex: 14,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_4),
    prompt: "Untuk perincian pada teks tentang label museum, perbaikan yang menghasilkan kesejajaran terbaik adalah ....",
    options: [
      "memeriksa ejaan, ukuran huruf dipastikan, dan penyesuaian istilah teknis",
      "ejaan diperiksa, memastikan ukuran huruf, dan menyesuaikan istilah teknis",
      "memeriksa ejaan, memastikan ukuran huruf terbaca, dan menyesuaikan istilah teknis",
      "pemeriksaan ejaan, memastikan ukuran huruf, dan istilah teknis disesuaikan",
      "memeriksa ejaan, kepastian ukuran huruf, dan istilah teknis",
    ],
    answerKey: "C",
    explanation:
      "Ketiga rincian harus paralel menggunakan verba aktif transitif berimbuhan *meN-*: **memeriksa** ejaan, **memastikan** ukuran huruf terbaca, dan **menyesuaikan** istilah teknis.",
  },
  {
    orderIndex: 15,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_4),
    prompt: "Pada uraian mengenai label museum, kalimat (6) paling tepat disempurnakan menjadi ....",
    options: [
      "Masukan pengunjung kemudian digunakan tim untuk memperbaiki label yang masih membingungkan.",
      "Label yang membingungkan kemudian masukan pengunjung digunakan oleh tim memperbaiki.",
      "Kemudian masukan pengunjung untuk memperbaiki label digunakan yang membingungkan.",
      "Masukan pengunjung kemudian digunakan agar tim label membingungkan diperbaiki.",
      "Masukan pengunjung kemudian tim digunakan memperbaiki label yang masih membingungkan.",
    ],
    answerKey: "A",
    explanation:
      "Opsi (A) sudah memiliki struktur pasif yang gramatikal, jelas, dan efektif, sedangkan opsi B–E tidak gramatikal.",
  },
  {
    orderIndex: 16,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_4),
    prompt: "Dalam teks tentang label museum, bagian yang paling perlu diperbaiki karena tidak logis/tidak sejajar terdapat pada ....",
    options: ["kalimat (1)", "kalimat (2)", "kalimat (5)", "kalimat (4)", "kalimat (3)"],
    answerKey: "D",
    explanation:
      "Kalimat (4) memiliki rincian tidak sejajar: *memeriksa ejaan* (frasa verbal), *memastikan ukuran huruf terbaca* (frasa verbal), dan *kesesuaian istilah teknis* (frasa nominal).",
  },
  {
    orderIndex: 17,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 5",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_5),
    prompt: "Dalam bacaan tentang perpustakaan alat, kalimat yang memiliki pola sintaksis paling sepadan dengan kalimat (3) adalah ....",
    options: [
      "Di ruang belakang tersedia lemari penyimpanan.",
      "Petugas mencatat kondisi alat setelah pemeriksaan.",
      "Setelah selesai, alat dikembalikan.",
      "Perawatan rutin diperlukan setiap bulan.",
      "Alat itu sangat berguna bagi warga.",
    ],
    answerKey: "D",
    explanation:
      "Klausa induk kalimat (3) berpola *Subjek + Predikat pasif (di-) + Keterangan* (*Setiap alat diperiksa sebelum dan sesudah dipinjam...*), sepadan dengan *Perawatan rutin (S) diperlukan (P pasif) setiap bulan (K)*.",
  },
  {
    orderIndex: 18,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 5",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_5),
    prompt: "Dalam bacaan tentang perpustakaan alat, tujuan penggunaan kata *“perlu”* pada kalimat (6) adalah ....",
    options: [
      "menyatakan kemampuan fisik",
      "menyatakan kebiasaan masa lalu",
      "menyatakan izin kepada peminjam",
      "menyatakan kemungkinan yang tidak pasti",
      "menyatakan keharusan yang dianggap penting berdasarkan pertimbangan",
    ],
    answerKey: "E",
    explanation:
      "Modalitas *perlu* menyatakan keharusan atau rekomendasi yang dipandang penting berdasarkan pertimbangan objektif (frekuensi & biaya).",
  },
  {
    orderIndex: 19,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 5",
    stimulus: formatSuperscriptNumbers(PPU_TEKS_5),
    prompt: "Pandangan penulis terhadap perpustakaan alat paling tepat digambarkan sebagai ....",
    options: [
      "menolak program karena biaya perawatan",
      "menganggap program pasti berhasil di semua tempat",
      "bersikap acuh terhadap keberlanjutan layanan",
      "mendukung program dengan tetap menekankan evaluasi berbasis data",
      "menerima semua usulan warga tanpa evaluasi",
    ],
    answerKey: "D",
    explanation:
      "Kalimat (7) menegaskan bahwa program dipandang bermanfaat, tetapi pengembangannya tetap memerlukan data penggunaan yang cukup.",
  },
  {
    orderIndex: 20,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Sistem Bahasa untuk Nomor 20",
    stimulus:
      "- Ibu membaca surat = `Lema riku tasi`\n- Ayah membaca buku = `Taro riku nola`\n- Surat dibaca ayah = `Tasi miriku Taro`\n- Buku ditulis ibu = `Nola misena Lema`",
    prompt: "Bagaimana mengatakan *“Buku dibaca ibu”*?",
    options: [
      "Nola riku Lema",
      "Tasi miriku Lema",
      "Nola misena Lema",
      "Lema riku nola",
      "Nola miriku Lema",
    ],
    answerKey: "E",
    explanation:
      "Dari pola: `Lema` = ibu, `Taro` = ayah, `tasi` = surat, `nola` = buku, `riku` = membaca, `miriku` = dibaca. Kalimat pasif memiliki pola `Objek-pasien + mi-verba + Pelaku`, sehingga *Buku dibaca ibu* = **`Nola miriku Lema`**.",
  },
];

const PBM_TEKS_1 = `^1Perpustakaan daerah membuka layanan peminjaman buku antarcabang untuk memperluas pilihan bacaan warga. ^2Pada tahap awal, permintaan hanya dicatat oleh petugas cabang asal, sehingga beberapa buku terlambat dikirim. ^3Pengelola kemudian membuat formulir bersama yang dapat diakses seluruh cabang. ^4Dengan formulir itu petugas dapat melihat lokasi buku, status peminjaman dan jadwal pengiriman. ^5Setelah tiga bulan, waktu tunggu rata-rata menurun dan keluhan tentang buku yang tidak terlacak juga berkurang. ^6Perubahan tersebut menunjukkan bahwa pencatatan bersama membantu aliran informasi antarcabang. ^7Layanan akan dievaluasi lagi sebelum jumlah cabang yang terhubung ditambah.`;

const PBM_SUNTING_5 = `^1Pemerintah Kota Serang mengadakan pekan literasi di pusat kebudayaan. ^2Kegiatan itu dilaksanakan di Museum Negeri Banten. ^3Peserta mendiskusikan naskah lama dari berbagai daerah. ^4Salah satu sesi membahas sejarah Kesultanan Banten. ^5Pada sesi penutup, panitia mengundang dosen dari universitas Sultan Ageng Tirtayasa.`;

const PBM_TEKS_2 = `^1Sebuah sekolah mencoba mengurangi sisa makanan dari kantin dengan mencatat menu yang paling sering tersisa. ^2Selama dua minggu, petugas menimbang sisa makanan setiap hari dan mewawancarai sebagian siswa. ^3Data menunjukkan porsi beberapa menu terlalu besar bagi siswa kelas awal. ^4Pengelola kantin lalu menawarkan dua ukuran porsi, tetapi harga tidak dibuat sama. ^5Pilihan porsi yang lebih kecil ternyata diminati dan jumlah makanan terbuang menurun. ^6Namun hasil itu belum cukup untuk menyimpulkan bahwa semua jenis makanan memerlukan dua ukuran porsi. ^7Sekolah berencana meneruskan pencatatan agar keputusan berikutnya didasarkan pada pola yang lebih stabil.`;

const PBM_SUNTING_10 = `^1Tim audit menilai risiko kebocoran data pada sistem baru. ^2Setiap temuan dicatat dalam formulir yang sama. ^3Petugas lalu melakukan analisa terhadap pola gangguan yang berulang. ^4Hasilnya dibandingkan dengan catatan bulan sebelumnya. ^5Rekomendasi disampaikan kepada pengelola sistem.`;

const PBM_TEKS_3 = `^1Kelompok warga di pesisir menanam mangrove pada bagian pantai yang abrasi. ^2Sebelum penanaman, mereka memetakan bagian pantai yang masih memiliki lumpur cukup tebal. ^3Bibit ditanam pada jarak tertentu supaya akar tidak saling berhimpitan ketika tumbuh. ^4Selain menanam bibit, kelompok itu juga membuat catatan kematian tanaman setiap bulan. ^5Catatan tersebut dianalisa untuk mengetahui lokasi yang membutuhkan penanaman ulang. ^6Hasil pemantauan menunjukkan sebagian lokasi gagal karena arus terlalu kuat. ^7Berdasarkan temuan itu, penanaman berikutnya dipindahkan ke bagian pantai yang lebih terlindung.`;

const PBM_TEKS_4 = `^1Pada jam sibuk, penumpang kereta sering menumpuk di dekat satu pintu karena mengikuti posisi tangga keluar. ^2Pengelola stasiun mencoba memasang penanda lantai yang menunjukkan area berdiri di sepanjang peron. ^3Penanda itu tidak memaksa penumpang berpindah namun memberi isyarat visual tentang ruang yang masih kosong. ^4Dalam pengamatan awal, sebaran penumpang tampak lebih merata ketika petugas juga memberikan arahan lisan. ^5Akan tetapi, pada hari tanpa petugas, sebagian penumpang kembali berkumpul di titik lama. ^6Temuan itu menunjukkan penanda lantai belum bekerja secara mandiri. ^7Pengelola kemudian merencanakan percobaan dengan desain penanda yang lebih mudah terlihat.`;

const PBM_SUSUN = `^1Setelah sensor terpasang, petugas mencatat kelembapan tanah setiap pagi. ^2Sebelum itu, penyiraman kebun hanya mengikuti perkiraan visual petugas. ^3Data selama dua minggu menunjukkan beberapa petak tetap lembap lebih lama daripada petak lain. ^4Berdasarkan temuan tersebut, jadwal penyiraman dibedakan menurut kondisi tiap petak. ^5Perubahan jadwal itu mengurangi penggunaan air tanpa membuat tanaman kekurangan air.`;

export const PBM_QUESTIONS: SeedQuestion[] = [
  {
    orderIndex: 1,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_1),
    prompt: "Pada kalimat (4), tanda koma seharusnya ditambahkan setelah kata ....",
    options: ["pengiriman", "peminjaman", "buku", "status", "lokasi"],
    answerKey: "B",
    explanation:
      "Dalam perincian lebih dari dua unsur (*lokasi buku, status peminjaman, dan jadwal pengiriman*), tanda koma wajib dipakai sebelum konjungsi *dan*, yakni setelah kata **peminjaman**.",
  },
  {
    orderIndex: 2,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_1),
    prompt: "Kalimat yang paling tepat ditempatkan setelah kalimat (2) untuk memperjelas masalah awal adalah ....",
    options: [
      "Jumlah pengunjung perpustakaan meningkat pada akhir pekan.",
      "Akibatnya, petugas cabang tujuan sering baru mengetahui permintaan setelah pengguna menanyakan kembali.",
      "Setiap cabang memiliki warna rak yang berbeda.",
      "Karena itu, seluruh buku harus dipindahkan ke satu gedung pusat.",
      "Buku anak biasanya dipinjam lebih lama daripada majalah.",
    ],
    answerKey: "B",
    explanation:
      "Opsi (B) secara logis menjelaskan dampak pencatatan sepihak pada kalimat (2) yang berujung pada keterlambatan pengiriman buku.",
  },
  {
    orderIndex: 3,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_1),
    prompt: "Hubungan kalimat (5) dengan kalimat (6) paling tepat adalah ....",
    options: [
      "kalimat (6) menafsirkan hasil yang dilaporkan pada kalimat (5)",
      "kalimat (6) menyangkal data pada kalimat (5)",
      "kalimat (5) menjadi sebab tunggal munculnya cabang baru",
      "kedua kalimat membahas topik yang tidak berkaitan",
      "kalimat (6) memberi contoh jenis buku",
    ],
    answerKey: "A",
    explanation:
      "Kalimat (5) melaporkan data penurunan waktu tunggu dan keluhan; kalimat (6) memberikan interpretasi terhadap perubahan hasil tersebut.",
  },
  {
    orderIndex: 4,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_1),
    prompt: "Inti informasi kalimat (7) adalah ....",
    options: [
      "layanan akan dievaluasi lagi",
      "jumlah cabang ditambah",
      "pengelola membuka layanan",
      "evaluasi menambah cabang",
      "cabang terhubung",
    ],
    answerKey: "A",
    explanation:
      "Klausa induk kalimat (7) adalah *Layanan akan dievaluasi lagi*, sedangkan *sebelum jumlah cabang yang terhubung ditambah* adalah anak kalimat keterangan waktu.",
  },
  {
    orderIndex: 5,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Suntingan Singkat",
    stimulus: formatSuperscriptNumbers(PBM_SUNTING_5),
    prompt: "Penulisan huruf kapital yang tidak tepat terdapat pada kalimat nomor ....",
    options: ["(3)", "(1)", "(5)", "(2)", "(4)"],
    answerKey: "C",
    explanation:
      "Pada kalimat (5), kata *universitas* merupakan bagian dari nama lembaga resmi sehingga harus ditulis kapital menjadi **Universitas Sultan Ageng Tirtayasa**.",
  },
  {
    orderIndex: 6,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_2),
    prompt: "Kata yang paling tepat menggantikan kata *“dibuat”* pada kalimat (4) agar maknanya lebih cermat adalah ....",
    options: ["diciptakan", "dilukiskan", "disusun ulang", "ditetapkan", "dirakit"],
    answerKey: "D",
    explanation:
      "Untuk kebijakan harga, kata yang paling tepat dan cermat secara kolokasi adalah **ditetapkan** (*harga tidak ditetapkan sama*).",
  },
  {
    orderIndex: 7,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_2),
    prompt: "Kalimat (3) dan (4) paling efektif digabung menjadi ....",
    options: [
      "Porsi beberapa menu terlalu besar, sedangkan pengelola kantin dan harga berbeda.",
      "Karena data menunjukkan porsi beberapa menu terlalu besar bagi siswa kelas awal, pengelola kantin menawarkan dua ukuran porsi dengan harga berbeda.",
      "Data menunjukkan porsi terlalu besar sehingga harga dua ukuran porsi sama.",
      "Pengelola kantin menawarkan dua ukuran porsi dan data menunjukkan porsi terlalu besar sebab siswa kelas awal.",
      "Data menunjukkan porsi beberapa menu terlalu besar, tetapi pengelola kantin menawarkan dua ukuran porsi karena harga tidak sama.",
    ],
    answerKey: "B",
    explanation:
      "Kalimat (3) merupakan sebab diambilnya tindakan pada kalimat (4), sehingga penggabungan dengan konjungsi kausal *Karena ..., ... dengan harga berbeda* paling efektif.",
  },
  {
    orderIndex: 8,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_2),
    prompt: "Tujuan kalimat (6) dalam teks adalah ....",
    options: [
      "membuktikan seluruh menu memiliki porsi berlebihan",
      "menyatakan bahwa program pasti gagal",
      "mengenalkan topik baru tentang harga",
      "mengulang seluruh data penimbangan",
      "membatasi keluasan simpulan dari hasil percobaan",
    ],
    answerKey: "E",
    explanation:
      "Kalimat (6) memberi kehati-hatian agar keberhasilan pada beberapa menu tidak digeneralisasi ke semua jenis makanan.",
  },
  {
    orderIndex: 9,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_2),
    prompt: "Kata *“itu”* pada kalimat (6) merujuk pada ....",
    options: [
      "harga yang berbeda",
      "dua minggu pencatatan",
      "semua jenis makanan",
      "wawancara siswa",
      "menurunnya makanan terbuang setelah pilihan porsi kecil diminati",
    ],
    answerKey: "E",
    explanation:
      "Frasa *hasil itu* pada kalimat (6) merujuk pada hasil yang baru dilaporkan di kalimat (5).",
  },
  {
    orderIndex: 10,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Suntingan Singkat",
    stimulus: formatSuperscriptNumbers(PBM_SUNTING_10),
    prompt: "Penulisan kata yang tidak sesuai bentuk baku terdapat pada kalimat nomor ....",
    options: ["(4)", "(5)", "(3)", "(2)", "(1)"],
    answerKey: "C",
    explanation:
      "Pada kalimat (3) terdapat kata tidak baku *analisa* yang bentuk bakunya menurut KBBI adalah **analisis**.",
  },
  {
    orderIndex: 11,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_3),
    prompt: "Bentuk baku kata pada kalimat (5) adalah ....",
    options: ["menganalisa", "dianalisa", "dianalisis", "analisa", "di analisis"],
    answerKey: "C",
    explanation:
      "Dalam kalimat pasif (5), bentuk baku dari *dianalisa* adalah **dianalisis** (prefiks *di-* ditulis serangkai).",
  },
  {
    orderIndex: 12,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_3),
    prompt: "Kalimat (1) akan lebih efektif jika diperbaiki menjadi ....",
    options: [
      "Pada bagian pantai yang abrasi ditanam oleh kelompok warga mangrove.",
      "Kelompok warga di pesisir menanam mangrove pada bagian pantai abrasi yang.",
      "Kelompok warga di pesisir menanam pada mangrove bagian pantai yang abrasi.",
      "Kelompok warga yang di pesisir menanam mangrove bagian pantai abrasi.",
      "Kelompok warga di pesisir menanam mangrove pada bagian pantai yang mengalami abrasi.",
    ],
    answerKey: "E",
    explanation:
      "Kata *abrasi* adalah nomina, sehingga frasa *pantai yang abrasi* perlu dilengkapi verba menjadi **pantai yang mengalami abrasi**.",
  },
  {
    orderIndex: 13,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_3),
    prompt: "Jika teks dibagi menjadi dua paragraf, pembagian yang paling padu adalah ....",
    options: [
      "kalimat (1)-(4) dan kalimat (5)-(7)",
      "kalimat (1)-(6) dan kalimat (7)",
      "kalimat (1)-(2) dan kalimat (3)-(7)",
      "kalimat (1)-(3) dan kalimat (4)-(7)",
      "kalimat (1)-(5) dan kalimat (6)-(7)",
    ],
    answerKey: "D",
    explanation:
      "Kalimat (1)–(3) fokus pada proses penanaman mangrove di pantai, sedangkan kalimat (4)–(7) fokus pada pencatatan pemantauan kematian tanaman dan penyesuaian lokasi.",
  },
  {
    orderIndex: 14,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_3),
    prompt: "Hubungan gagasan kalimat (6) dan (7) adalah ....",
    options: [
      "kalimat (7) mengulang kalimat (6) dengan kata lain",
      "kalimat (7) menolak temuan pada kalimat (6)",
      "kedua kalimat hanya membandingkan dua lokasi tanpa hubungan",
      "temuan pada kalimat (6) menjadi dasar tindakan pada kalimat (7)",
      "kalimat (6) menjelaskan akibat tindakan pada kalimat (7)",
    ],
    answerKey: "D",
    explanation:
      "Kegagalan akibat arus kuat di kalimat (6) mendasari pemindahan lokasi tanam pada kalimat (7).",
  },
  {
    orderIndex: 15,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_3),
    prompt: "Kata penghubung yang paling tepat untuk mengawali kalimat (7) jika frasa *“Berdasarkan temuan itu”* dihilangkan adalah ....",
    options: ["Oleh karena itu,", "Sementara itu,", "Misalnya,", "Meskipun demikian,", "Sebaliknya,"],
    answerKey: "A",
    explanation:
      "Hubungan kalimat (6) $\\rightarrow$ (7) adalah sebab-akibat/simpulan tindakan, sehingga konjungsi antarkalimat yang tepat adalah **Oleh karena itu,**.",
  },
  {
    orderIndex: 16,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_4),
    prompt: "Pada kalimat (3), tanda koma paling tepat ditempatkan ....",
    options: [
      "sebelum kata “namun”",
      "setelah kata “visual”",
      "setelah kata “itu”",
      "setelah kata “berpindah”",
      "setelah kata “memaksa”",
    ],
    answerKey: "A",
    explanation:
      "Dalam kalimat majemuk pertentangan intrakalimat menggunakan kata penghubung *melainkan* atau *tetapi/namun*, tanda koma diletakkan sebelum kata penghubung pertentangan (atau memakai *tetapi* didahului koma; pada opsi yang tepat adalah sebelum *namun*).",
  },
  {
    orderIndex: 17,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_4),
    prompt: "Dalam eksperimen penanda lantai, kalimat (5) berfungsi untuk ....",
    options: [
      "menyimpulkan percobaan telah berhasil sepenuhnya",
      "memberikan contoh penanda lantai",
      "menjelaskan lokasi tangga keluar",
      "menunjukkan kondisi yang membatasi keberhasilan pada kalimat (4)",
      "memperkenalkan desain baru sebelum evaluasi",
    ],
    answerKey: "D",
    explanation:
      "Kalimat (5) menjelaskan bahwa ketika petugas tidak hadir, penumpang kembali menumpuk di titik lama — membatasi keberhasilan di kalimat (4).",
  },
  {
    orderIndex: 18,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_4),
    prompt: "Gagasan utama bacaan tentang penanda lantai peron adalah ....",
    options: [
      "pembangunan tangga baru di stasiun",
      "penghapusan arahan petugas di seluruh stasiun",
      "kenaikan harga tiket kereta",
      "uji penanda lantai untuk memperbaiki sebaran penumpang di peron",
      "larangan berdiri di dekat pintu kereta",
    ],
    answerKey: "D",
    explanation:
      "Keseluruhan teks membahas uji coba pemasangan penanda lantai di peron stasiun dan evaluasinya.",
  },
  {
    orderIndex: 19,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4",
    stimulus: formatSuperscriptNumbers(PBM_TEKS_4),
    prompt: "Kalimat (6) dapat diungkapkan kembali dengan kalimat ....",
    options: [
      "Hasil pengamatan memperlihatkan bahwa penanda lantai masih memerlukan dukungan agar efektif.",
      "Petugas merupakan satu-satunya penyebab kerumunan.",
      "Penanda lantai harus segera dihapus karena selalu gagal.",
      "Tidak ada perbedaan sebaran penumpang pada semua kondisi.",
      "Penanda lantai sudah efektif tanpa bantuan apa pun.",
    ],
    answerKey: "A",
    explanation:
      "\"Belum bekerja secara mandiri\" bermakna penanda lantai masih membutuhkan dukungan (seperti arahan petugas atau desain lebih terlihat) agar efektif.",
  },
  {
    orderIndex: 20,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Susunan Paragraf",
    stimulus: formatSuperscriptNumbers(PBM_SUSUN),
    prompt: "Jika kalimat-kalimat tersebut disusun menjadi paragraf yang padu, urutan kalimat yang paling tepat adalah ....",
    options: [
      "2 - 1 - 3 - 5 - 4",
      "2 - 1 - 4 - 3 - 5",
      "2 - 1 - 3 - 4 - 5",
      "2 - 3 - 1 - 4 - 5",
      "1 - 2 - 3 - 4 - 5",
    ],
    answerKey: "C",
    explanation:
      "Urutan kronologis yang padu: kondisi awal sebelum ada sensor (**2**) $\\rightarrow$ setelah sensor terpasang (**1**) $\\rightarrow$ data selama dua minggu (**3**) $\\rightarrow$ tindakan berdasarkan temuan tersebut (**4**) $\\rightarrow$ dampak perubahan jadwal (**5**).",
  },
];

