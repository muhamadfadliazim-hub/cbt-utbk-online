export interface SeedQuestion {
  orderIndex: number;
  type: "PILIHAN_GANDA" | "PG_KOMPLEKS" | "BENAR_SALAH" | "ISIAN_SINGKAT";
  stimulusTitle?: string;
  stimulus?: string;
  prompt: string;
  options: string[] | { id: string; text: string }[];
  answerKey: any;
  explanation: string;
  difficultyParameter?: number;
}

const SVG_PU_Q21 = `<svg viewBox="0 0 420 245" width="420" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="210" y="20" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">Jumlah Seluruh Pengguna &amp; Kanal Digital (ribu pelanggan)</text>
  <line x1="120" y1="36" x2="148" y2="36" stroke="#0f172a" stroke-width="2.2"/>
  <circle cx="134" cy="36" r="3.5" fill="#0f172a"/>
  <text x="154" y="40" font-size="10.5" font-weight="600" fill="#0f172a">Total Pengguna</text>
  <line x1="238" y1="36" x2="266" y2="36" stroke="#2563eb" stroke-width="2.2" stroke-dasharray="5 3"/>
  <rect x="249" y="33" width="6" height="6" fill="#2563eb"/>
  <text x="272" y="40" font-size="10.5" font-weight="600" fill="#1d4ed8">Kanal Digital</text>
  <line x1="60" y1="205" x2="388" y2="205" stroke="#334155" stroke-width="1.3"/>
  <line x1="60" y1="54" x2="60" y2="205" stroke="#334155" stroke-width="1.3"/>
  <line x1="60" y1="163" x2="388" y2="163" stroke="#e2e8f0"/>
  <line x1="60" y1="121" x2="388" y2="121" stroke="#e2e8f0"/>
  <line x1="60" y1="79" x2="388" y2="79" stroke="#e2e8f0"/>
  <text x="52" y="209" text-anchor="end" font-size="10" fill="#475569">0</text>
  <text x="52" y="167" text-anchor="end" font-size="10" fill="#475569">100</text>
  <text x="52" y="125" text-anchor="end" font-size="10" fill="#475569">200</text>
  <text x="52" y="83" text-anchor="end" font-size="10" fill="#475569">300</text>
  <text x="20" y="132" text-anchor="middle" font-size="10" font-weight="600" fill="#475569" transform="rotate(-90 20 132)">Ribu Pelanggan</text>
  <text x="95" y="224" text-anchor="middle" font-size="10.5" font-weight="600" fill="#334155">2022</text>
  <text x="180" y="224" text-anchor="middle" font-size="10.5" font-weight="600" fill="#334155">2023</text>
  <text x="265" y="224" text-anchor="middle" font-size="10.5" font-weight="600" fill="#334155">2024</text>
  <text x="350" y="224" text-anchor="middle" font-size="10.5" font-weight="600" fill="#334155">2025</text>
  <polyline fill="none" stroke="#0f172a" stroke-width="2.2" points="95,129.4 180,116.8 265,100 350,79"/>
  <circle cx="95" cy="129.4" r="3.8" fill="#0f172a"/>
  <circle cx="180" cy="116.8" r="3.8" fill="#0f172a"/>
  <circle cx="265" cy="100" r="3.8" fill="#0f172a"/>
  <circle cx="350" cy="79" r="3.8" fill="#0f172a"/>
  <text x="95" y="119" text-anchor="middle" font-size="10" font-weight="600" fill="#0f172a">180</text>
  <text x="180" y="106" text-anchor="middle" font-size="10" font-weight="600" fill="#0f172a">210</text>
  <text x="265" y="90" text-anchor="middle" font-size="10" font-weight="600" fill="#0f172a">250</text>
  <text x="350" y="69" text-anchor="middle" font-size="10" font-weight="700" fill="#0f172a">300</text>
  <polyline fill="none" stroke="#2563eb" stroke-width="2.2" stroke-dasharray="5 3" points="95,182.3 180,169.7 265,152.5 350,129.4"/>
  <rect x="91.5" y="178.8" width="7" height="7" fill="#2563eb"/>
  <rect x="176.5" y="166.2" width="7" height="7" fill="#2563eb"/>
  <rect x="261.5" y="149" width="7" height="7" fill="#2563eb"/>
  <rect x="346.5" y="125.9" width="7" height="7" fill="#2563eb"/>
  <text x="95" y="173" text-anchor="middle" font-size="10" font-weight="600" fill="#1d4ed8">54</text>
  <text x="180" y="160" text-anchor="middle" font-size="10" font-weight="600" fill="#1d4ed8">84</text>
  <text x="265" y="143" text-anchor="middle" font-size="10" font-weight="600" fill="#1d4ed8">125</text>
  <text x="350" y="119" text-anchor="middle" font-size="10" font-weight="700" fill="#1d4ed8">180</text>
</svg>`;

const SVG_PU_Q22 = `<svg viewBox="0 0 420 245" width="420" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <pattern id="hatch-pu-q22" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="#eff6ff"/>
      <line x1="0" y1="0" x2="0" y2="6" stroke="#2563eb" stroke-width="2"/>
    </pattern>
  </defs>
  <text x="210" y="20" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">Konsumsi Energi Sebelum &amp; Sesudah Intervensi (MWh)</text>
  <rect x="128" y="30" width="12" height="10" fill="#cbd5e1" stroke="#334155"/>
  <text x="145" y="39" font-size="10.5" font-weight="600" fill="#0f172a">Sebelum</text>
  <rect x="218" y="30" width="12" height="10" fill="url(#hatch-pu-q22)" stroke="#1d4ed8"/>
  <text x="235" y="39" font-size="10.5" font-weight="600" fill="#1d4ed8">Sesudah</text>
  <line x1="58" y1="205" x2="390" y2="205" stroke="#334155" stroke-width="1.3"/>
  <line x1="58" y1="56" x2="58" y2="205" stroke="#334155" stroke-width="1.3"/>
  <line x1="58" y1="170" x2="390" y2="170" stroke="#e2e8f0"/>
  <line x1="58" y1="135" x2="390" y2="135" stroke="#e2e8f0"/>
  <line x1="58" y1="100" x2="390" y2="100" stroke="#e2e8f0"/>
  <line x1="58" y1="65" x2="390" y2="65" stroke="#e2e8f0"/>
  <text x="50" y="209" text-anchor="end" font-size="10" fill="#475569">0</text>
  <text x="50" y="174" text-anchor="end" font-size="10" fill="#475569">50</text>
  <text x="50" y="139" text-anchor="end" font-size="10" fill="#475569">100</text>
  <text x="50" y="104" text-anchor="end" font-size="10" fill="#475569">150</text>
  <text x="50" y="69" text-anchor="end" font-size="10" fill="#475569">200</text>
  <text x="19" y="130" text-anchor="middle" font-size="10" font-weight="600" fill="#475569" transform="rotate(-90 19 130)">MWh</text>
  <rect x="82" y="100" width="22" height="105" fill="#cbd5e1" stroke="#334155"/>
  <text x="93" y="95" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0f172a">150</text>
  <rect x="108" y="121" width="22" height="84" fill="url(#hatch-pu-q22)" stroke="#1d4ed8"/>
  <text x="119" y="116" text-anchor="middle" font-size="9.5" font-weight="700" fill="#1d4ed8">120</text>
  <text x="106" y="224" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">Kategori A</text>
  <rect x="162" y="121" width="22" height="84" fill="#cbd5e1" stroke="#334155"/>
  <text x="173" y="116" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0f172a">120</text>
  <rect x="188" y="142" width="22" height="63" fill="url(#hatch-pu-q22)" stroke="#1d4ed8"/>
  <text x="199" y="137" text-anchor="middle" font-size="9.5" font-weight="700" fill="#1d4ed8">90</text>
  <text x="186" y="224" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">Kategori B</text>
  <rect x="242" y="142" width="22" height="63" fill="#cbd5e1" stroke="#334155"/>
  <text x="253" y="137" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0f172a">90</text>
  <rect x="268" y="154.6" width="22" height="50.4" fill="url(#hatch-pu-q22)" stroke="#1d4ed8"/>
  <text x="279" y="149.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="#1d4ed8">72</text>
  <text x="266" y="224" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">Kategori C</text>
  <rect x="322" y="65" width="22" height="140" fill="#cbd5e1" stroke="#334155"/>
  <text x="333" y="60" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0f172a">200</text>
  <rect x="348" y="88.8" width="22" height="116.2" fill="url(#hatch-pu-q22)" stroke="#1d4ed8"/>
  <text x="359" y="83.8" text-anchor="middle" font-size="9.5" font-weight="700" fill="#1d4ed8">166</text>
  <text x="346" y="224" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">Kategori D</text>
</svg>`;

const SVG_PU_Q23 = `<svg viewBox="0 0 380 205" width="380" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-pu-q23" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
      <polygon points="0 0, 8 3.5, 0 7" fill="#0f172a"/>
    </marker>
  </defs>
  <text x="190" y="22" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">Jumlah Awal &amp; Arah Perpindahan Anggota</text>
  <rect x="38" y="42" width="96" height="46" rx="6" fill="#f8fafc" stroke="#334155" stroke-width="1.3"/>
  <text x="86" y="60" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">Kelompok A</text>
  <text x="86" y="79" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1e3a8a">130</text>
  <rect x="246" y="42" width="96" height="46" rx="6" fill="#f8fafc" stroke="#334155" stroke-width="1.3"/>
  <text x="294" y="60" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">Kelompok B</text>
  <text x="294" y="79" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1e3a8a">95</text>
  <rect x="38" y="142" width="96" height="46" rx="6" fill="#f8fafc" stroke="#334155" stroke-width="1.3"/>
  <text x="86" y="160" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">Kelompok C</text>
  <text x="86" y="179" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1e3a8a">74</text>
  <rect x="246" y="142" width="96" height="46" rx="6" fill="#f8fafc" stroke="#334155" stroke-width="1.3"/>
  <text x="294" y="160" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">Kelompok D</text>
  <text x="294" y="179" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1e3a8a">63</text>
  <line x1="134" y1="65" x2="242" y2="65" stroke="#0f172a" stroke-width="1.7" marker-end="url(#arr-pu-q23)"/>
  <rect x="176" y="54" width="24" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
  <text x="188" y="68" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">9</text>
  <line x1="86" y1="142" x2="86" y2="91" stroke="#0f172a" stroke-width="1.7" marker-end="url(#arr-pu-q23)"/>
  <rect x="74" y="106" width="24" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
  <text x="86" y="120" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">7</text>
  <line x1="294" y1="88" x2="294" y2="139" stroke="#0f172a" stroke-width="1.7" marker-end="url(#arr-pu-q23)"/>
  <rect x="282" y="106" width="24" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
  <text x="294" y="120" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">6</text>
</svg>`;

export const PU_INDUKTIF_QUESTIONS: SeedQuestion[] = [
  {
    orderIndex: 1,
    type: "PILIHAN_GANDA",
    prompt:
      "Setiap naskah yang lolos pemeriksaan metodologi akan diteruskan ke editor. Setiap naskah yang diteruskan ke editor akan dijadwalkan untuk pemeriksaan kemiripan. Naskah X ternyata tidak dijadwalkan untuk pemeriksaan kemiripan.\n\nSimpulan yang PALING TEPAT adalah ....",
    options: [
      "Naskah X pasti telah lolos pemeriksaan metodologi, tetapi belum diteruskan ke editor.",
      "Naskah X mungkin telah diteruskan ke editor karena jadwal pemeriksaan dapat berubah.",
      "Naskah X tidak diteruskan ke editor, tetapi status pemeriksaan metodologinya tidak dapat ditentukan.",
      "Naskah X tidak diteruskan ke editor dan tidak lolos pemeriksaan metodologi.",
      "Naskah X telah diperiksa kemiripannya tanpa melalui editor.",
    ],
    answerKey: "D",
    explanation:
      "Gunakan modus tollens secara berantai: Lolos metodologi ($P$) $\\rightarrow$ diteruskan ke editor ($Q$) $\\rightarrow$ dijadwalkan pemeriksaan kemiripan ($R$). Karena $\\neg R$ (tidak dijadwalkan), maka $\\neg Q$ (tidak diteruskan ke editor) dan $\\neg P$ (tidak lolos pemeriksaan metodologi).",
  },
  {
    orderIndex: 2,
    type: "PILIHAN_GANDA",
    prompt:
      "Program beasiswa X menetapkan peserta layak dipertimbangkan jika memenuhi salah satu jalur berikut.\n- **Jalur akademik:** memiliki prestasi riset dan rekomendasi dosen.\n- **Jalur prestasi:** memiliki medali kompetisi dan sertifikat kemampuan bahasa.\n\nPeserta yang pernah menerima sanksi akademik tidak dapat dipertimbangkan melalui jalur apa pun.\n\nLila memiliki rekomendasi dosen dan sertifikat kemampuan bahasa serta tidak pernah menerima sanksi akademik. Informasi mengenai prestasi riset dan medali kompetisinya belum tersedia. Panitia menyimpulkan bahwa Lila pasti layak dipertimbangkan.\n\nPenilaian yang PALING TEPAT terhadap simpulan panitia adalah ....",
    options: [
      "pasti benar karena Lila sudah memenuhi satu unsur pada masing-masing jalur",
      "belum dapat dipastikan karena masih ada unsur penentu pada kedua jalur yang belum diketahui",
      "pasti salah karena satu peserta hanya dapat mengikuti satu jalur",
      "tidak relevan karena sanksi akademik tidak termasuk syarat utama",
      "pasti benar karena tidak adanya sanksi sudah cukup untuk meloloskan peserta",
    ],
    answerKey: "B",
    explanation:
      "Masing-masing jalur menggunakan syarat konjungsi (**dan**). Jalur akademik membutuhkan riset DAN rekomendasi; jalur prestasi membutuhkan medali DAN sertifikat bahasa. Karena status prestasi riset maupun medali belum diketahui, kelayakan Lila belum dapat dipastikan.",
  },
  {
    orderIndex: 3,
    type: "PILIHAN_GANDA",
    prompt:
      "Dalam repositori riset berlaku aturan berikut.\n- Jika suatu dataset berstatus akses terbuka, berkas mentahnya dapat diunduh.\n- Jika berkas mentah dapat diunduh, halaman metadatanya dapat diakses.\n- Dataset dapat direplikasi secara independen jika metadatanya lengkap.\n- Seluruh dataset Proyek K berstatus akses terbuka.\n\nManakah DUA pernyataan yang HARUS BENAR?\n\nI. Berkas mentah setiap dataset Proyek K dapat diunduh.\nII. Halaman metadata setiap dataset Proyek K dapat diakses.\nIII. Setiap dataset Proyek K pasti dapat direplikasi secara independen.\nIV. Dataset yang tidak dapat direplikasi pasti tidak berstatus akses terbuka.\nV. Dataset di luar Proyek K tidak dapat diunduh.",
    options: ["I dan II", "I dan III", "II dan III", "II dan IV", "IV dan V"],
    answerKey: "A",
    explanation:
      "Semua dataset Proyek K berstatus akses terbuka $\\rightarrow$ berkas mentah dapat diunduh (I benar) $\\rightarrow$ halaman metadata dapat diakses (II benar). Dapat diaksesnya halaman metadata tidak menjamin metadatanya *lengkap*, sehingga III dan IV belum tentu benar.",
  },
  {
    orderIndex: 4,
    type: "PILIHAN_GANDA",
    prompt:
      "Pemerintah kota akan mengenakan biaya parkir progresif yang jauh lebih tinggi bagi kendaraan pribadi yang berada di pusat kota pada jam kerja. Pemerintah memperkirakan kebijakan tersebut akan mengurangi jumlah perjalanan mobil ke pusat kota karena sebagian komuter akan beralih ke kereta komuter.\n\nAsumsi yang PALING DIPERLUKAN agar alasan tersebut mendukung kesimpulan pemerintah adalah ....",
    options: [
      "seluruh kemacetan pusat kota disebabkan oleh kendaraan pribadi",
      "cukup banyak komuter yang terkena kebijakan memiliki alternatif kereta yang dapat mereka gunakan dan bersedia merespons kenaikan biaya parkir",
      "pendapatan dari parkir progresif lebih besar daripada biaya pengoperasian kereta komuter",
      "pengguna sepeda motor tidak akan berpindah ke kendaraan pribadi",
      "seluruh pengguna kereta sebelumnya adalah mantan pengguna mobil pribadi",
    ],
    answerKey: "B",
    explanation:
      "Kesimpulan pemerintah bergantung pada asumsi bahwa komuter pengguna mobil memang memiliki akses alternatif kereta komuter dan terdorong mengubah moda transportasinya akibat kenaikan tarif parkir.",
  },
  {
    orderIndex: 5,
    type: "PILIHAN_GANDA",
    prompt:
      "Sebuah sekolah menyimpulkan bahwa pemasangan penyaring udara berstandar HEPA di kelas mengurangi ketidakhadiran siswa akibat gangguan pernapasan.\n\nInformasi yang PALING MEMPERKUAT kesimpulan tersebut adalah ....",
    options: [
      "sekolah yang memasang penyaring udara juga baru saja mengecat ulang seluruh ruang kelas",
      "penyaring udara HEPA memiliki harga lebih tinggi daripada penyaring biasa",
      "orang tua siswa di sekolah tersebut semakin sering membawa anak ke dokter",
      "pada kelas-kelas yang dipilih secara acak, ketidakhadiran akibat gangguan pernapasan turun pada kelas yang memakai HEPA, sedangkan pada kelas pembanding yang memakai perangkat identik tanpa filter aktif tidak terjadi penurunan serupa",
      "sekolah lain di kota yang sama juga berencana membeli penyaring udara",
    ],
    answerKey: "D",
    explanation:
      "Uji terkontrol acak dengan kelompok pembanding (plasebo filter nonaktif) secara langsung mengisolasi efek penyaring HEPA dan menyingkirkan faktor pengganggu lain.",
  },
  {
    orderIndex: 6,
    type: "PILIHAN_GANDA",
    prompt:
      "Sebuah kedai kopi berencana menghapus seluruh minuman seduh manual karena waktu pembuatannya lebih lama daripada minuman mesin. Manajemen berpendapat bahwa menu yang lebih cepat akan mempercepat pergantian pelanggan dan pada akhirnya meningkatkan keuntungan harian.\n\nPernyataan yang PALING MEMPERLEMAH argumen manajemen adalah ....",
    options: [
      "minuman mesin menggunakan biji kopi yang sama dengan minuman seduh manual",
      "sebagian pelanggan lebih menyukai minuman yang disajikan panas",
      "pesaing di sekitar kedai masih menjual minuman seduh manual",
      "barista memerlukan pelatihan lebih lama untuk menguasai seduh manual",
      "pada jam sibuk, jumlah pelanggan yang dapat dilayani terutama dibatasi oleh lamanya meja ditempati, sedangkan minuman seduh manual paling banyak dibeli untuk dibawa pulang dan memberikan margin keuntungan tertinggi",
    ],
    answerKey: "E",
    explanation:
      "Jika hambatan utama kapasitas ada pada meja, sementara minuman seduh manual mayoritas dibawa pulang (tidak memakai meja) serta memiliki margin tertinggi, menghapusnya justru berpotensi menurunkan keuntungan harian.",
  },
  {
    orderIndex: 7,
    type: "PILIHAN_GANDA",
    prompt:
      "Sebuah gedung perkantoran memasang keran otomatis hemat air di seluruh toilet. Setelah enam bulan, pemakaian air total gedung ternyata tidak berkurang meskipun audit menunjukkan pemakaian air di toilet turun cukup besar.\n\nPernyataan yang PALING MUNGKIN menjelaskan keadaan tersebut adalah ....",
    options: [
      "keran otomatis memiliki sensor yang lebih sensitif daripada keran lama",
      "beberapa pegawai merasa keran otomatis lebih nyaman digunakan",
      "pada periode yang sama terjadi kebocoran pada jaringan penyiram taman yang menambah pemakaian air hampir sebesar penghematan dari toilet",
      "gedung menggunakan jenis sabun yang berbeda setelah keran dipasang",
      "audit pemakaian air dilakukan pada hari kerja",
    ],
    answerKey: "C",
    explanation:
      "Paradoks antara turunnya pemakaian air toilet dan stagnannya pemakaian air total dapat dijelaskan oleh peningkatan pemakaian di titik lain (kebocoran jaringan taman) yang mengimbangi penghematan tersebut.",
  },
  {
    orderIndex: 8,
    type: "PILIHAN_GANDA",
    prompt:
      "Pakar A berpendapat bahwa lonjakan kunjungan puskesmas terutama disebabkan oleh perpanjangan jam layanan hingga malam. Pakar B berpendapat bahwa lonjakan tersebut terutama disebabkan oleh penerapan sistem pendaftaran daring.\n\nData empat puskesmas menunjukkan pola berikut: puskesmas yang hanya memperpanjang jam layanan mengalami kenaikan kunjungan sekitar 30%; puskesmas yang hanya menerapkan pendaftaran daring tidak menunjukkan kenaikan berarti; dan puskesmas yang menerapkan keduanya mengalami kenaikan sekitar 32%.\n\nData tersebut PALING TEPAT ....",
    options: [
      "memperkuat pendapat Pakar A",
      "memperkuat pendapat Pakar B",
      "memperlemah pendapat Pakar A",
      "tidak berkaitan dengan pendapat keduanya",
      "membuktikan bahwa pendaftaran daring menurunkan kunjungan",
    ],
    answerKey: "A",
    explanation:
      "Kenaikan terjadi signifikan (~30%) ketika jam layanan diperpanjang dan hampir tidak berubah ketika hanya pendaftaran daring diterapkan. Ini menguatkan hipotesis Pakar A.",
  },
  {
    orderIndex: 9,
    type: "PILIHAN_GANDA",
    prompt:
      "Seorang peneliti menyatakan bahwa atap hijau dapat menurunkan suhu ruang lantai teratas pada siang hari.\n\nPerhatikan informasi berikut.\n1. Pada gedung yang sama, suhu lantai teratas setelah pemasangan atap hijau lebih rendah pada hari-hari dengan suhu luar yang sebanding dengan periode sebelum pemasangan.\n2. Gedung-gedung yang memiliki atap hijau pada umumnya lebih baru dan memiliki insulasi yang lebih baik.\n3. Pada dua modul atap identik yang menerima paparan matahari sama, permukaan di bawah modul bervegetasi lebih dingin daripada modul tanpa vegetasi.\n4. Penghuni gedung beratap hijau lebih banyak menyatakan bahwa gedung mereka terlihat menarik.\n\nPasangan informasi yang PALING MEMPERKUAT klaim peneliti adalah ....",
    options: ["(1) dan (2)", "(1) dan (3)", "(2) dan (3)", "(2) dan (4)", "(3) dan (4)"],
    answerKey: "B",
    explanation:
      "(1) membandingkan gedung yang sama pada suhu luar sebanding, sedangkan (3) merupakan eksperimen terkontrol pada modul identik. Informasi (2) justru menghadirkan variabel perancu (insulasi) dan (4) tidak relevan dengan suhu.",
  },
  {
    orderIndex: 10,
    type: "PILIHAN_GANDA",
    prompt:
      "Sebuah universitas mengirim 10.000 notifikasi promosi pendaftaran awal untuk sebuah program sertifikasi. Lebih dari 70% notifikasi dibuka, tetapi jumlah pendaftar baru hampir sama dengan bulan-bulan sebelumnya.\n\nInformasi yang PALING membantu menjelaskan keadaan tersebut adalah ....",
    options: [
      "notifikasi menggunakan desain visual baru",
      "sebagian calon peserta membaca notifikasi pada malam hari",
      "biaya program sertifikasi tidak berubah dibandingkan semester sebelumnya",
      "karena kesalahan segmentasi data, sebagian besar notifikasi justru dikirim kepada mahasiswa yang telah terdaftar pada program tersebut sebelum kampanye dimulai",
      "universitas juga memasang poster program di beberapa gedung",
    ],
    answerKey: "D",
    explanation:
      "Tingginya rasio buka tanpa pertambahan pendaftar baru masuk akal jika penerimanya sebagian besar memang sudah terdaftar sebelumnya sehingga tidak menghasilkan pendaftaran baru.",
  },
];

export const PU_DEDUKTIF_QUESTIONS: SeedQuestion[] = [
  {
    orderIndex: 1,
    type: "PILIHAN_GANDA",
    prompt:
      "Tujuh presentasi A, B, C, D, E, F, dan G dilakukan berurutan dengan ketentuan berikut.\n- A sebelum D.\n- B tepat sebelum F.\n- D sebelum G.\n- C bukan urutan pertama maupun terakhir.\n- E setelah G.\n- A tidak bersebelahan dengan B.\n\nUrutan yang MUNGKIN adalah ....",
    options: [
      "C – A – D – G – E – B – F",
      "A – D – G – C – E – B – F",
      "B – F – A – D – G – E – C",
      "A – B – F – D – G – C – E",
      "A – D – E – G – C – B – F",
    ],
    answerKey: "B",
    explanation:
      "Uji tiap opsi: (A) melanggar karena C di posisi 1; (C) melanggar karena C di posisi terakhir; (D) melanggar karena A bersebelahan dengan B; (E) melanggar karena E muncul sebelum G. Hanya opsi (B) `A – D – G – C – E – B – F` yang memenuhi seluruh syarat.",
  },
  {
    orderIndex: 2,
    type: "PILIHAN_GANDA",
    prompt:
      "Lima model sensor lapangan memiliki spesifikasi berikut.\n\n| Model | GPS | Panel Surya | Penyimpanan Offline | Seluler |\n|---|---|---|---|---|\n| A | Ya | Ya | Tidak | Ya |\n| B | Ya | Tidak | Ya | Tidak |\n| C | Ya | Ya | Ya | Tidak |\n| D | Tidak | Ya | Ya | Ya |\n| E | Ya | Ya | Ya | Ya |\n\nTim survei memerlukan sensor yang memiliki GPS, dapat diisi ulang dengan panel surya, tetap menyimpan data ketika tidak ada jaringan, dan tidak menggunakan koneksi seluler.\n\nModel yang memenuhi seluruh ketentuan adalah ....",
    options: ["A", "B", "C", "D", "E"],
    answerKey: "C",
    explanation:
      "Syarat: GPS = Ya, Panel Surya = Ya, Penyimpanan Offline = Ya, Seluler = Tidak. Model yang memenuhi keempat kriteria tersebut pada tabel adalah **Model C**.",
  },
  {
    orderIndex: 3,
    type: "PILIHAN_GANDA",
    prompt:
      "Enam stasiun P, Q, R, S, T, dan U terhubung oleh jalur satu arah berikut.\n- P menuju Q atau R.\n- Q menuju R atau S.\n- R menuju S atau T.\n- S menuju T atau U.\n- T menuju U.\n\nSeorang penumpang akan bepergian dari P ke U. Rutenya harus melalui Q dan harus memiliki tepat tiga stasiun antara P dan U.\n\nBanyak rute yang mungkin adalah ....",
    options: ["1", "2", "3", "4", "5"],
    answerKey: "C",
    explanation:
      "Dengan tepat 3 stasiun antara P dan U dan harus melalui Q, bentuk rutenya adalah $P \\rightarrow Q \\rightarrow X \\rightarrow Y \\rightarrow U$:\n1. $P \\rightarrow Q \\rightarrow R \\rightarrow S \\rightarrow U$\n2. $P \\rightarrow Q \\rightarrow R \\rightarrow T \\rightarrow U$\n3. $P \\rightarrow Q \\rightarrow S \\rightarrow T \\rightarrow U$\nTotal terdapat **3** rute yang mungkin.",
  },
  {
    orderIndex: 4,
    type: "PILIHAN_GANDA",
    prompt:
      "Sebuah keluarga terdiri atas A, B, C, D, E, F, G, dan H. A dan B adalah kakak beradik. C adalah suami A dan mereka memiliki dua anak, E dan F. D adalah istri B dan mereka memiliki dua anak, G dan H.\n\nHubungan B terhadap E adalah ....",
    options: [
      "paman dari pihak ibu",
      "paman dari pihak ayah",
      "kakek dari pihak ibu",
      "saudara laki-laki kandung",
      "sepupu laki-laki",
    ],
    answerKey: "A",
    explanation:
      "Karena C adalah suami A, maka A adalah ibu dari E dan F. Karena D adalah istri B, maka B adalah laki-laki dan merupakan saudara kandung dari A (ibu E). Dengan demikian, B adalah paman dari pihak ibu bagi E.",
  },
  {
    orderIndex: 5,
    type: "PILIHAN_GANDA",
    prompt: "`KAYU : PULP : KERTAS` mempunyai pola hubungan yang sama dengan ....",
    options: [
      "susu : keju : sapi",
      "gandum : tepung : roti",
      "kapas : kain : benang",
      "pasir : kaca : silika",
      "minyak bumi : bensin : sumur",
    ],
    answerKey: "B",
    explanation:
      "Polanya adalah tahapan pengolahan berurutan: bahan mentah (kayu) $\\rightarrow$ bahan setengah jadi (pulp) $\\rightarrow$ produk akhir (kertas). Hal ini sejajar dengan gandum $\\rightarrow$ tepung $\\rightarrow$ roti.",
  },
  {
    orderIndex: 6,
    type: "PILIHAN_GANDA",
    prompt: "`BUKU : HALAMAN` mempunyai hubungan yang paling setara dengan ....",
    options: [
      "kamera : foto",
      "rumah : alamat",
      "rantai : mata rantai",
      "sepatu : berjalan",
      "radio : suara",
    ],
    answerKey: "C",
    explanation:
      "Buku tersusun dari kumpulan halaman, sebagaimana rantai tersusun dari kumpulan mata rantai.",
  },
  {
    orderIndex: 7,
    type: "PILIHAN_GANDA",
    prompt:
      "Pernyataan berikut berlaku pada suatu seleksi:\n> *Setiap peserta yang menyerahkan proposal sebelum Jumat dan lolos verifikasi administrasi akan diundang mengikuti presentasi.*\n\nNegasi yang tepat adalah ....",
    options: [
      "Ada peserta yang menyerahkan proposal sebelum Jumat dan lolos verifikasi administrasi tetapi tidak diundang presentasi.",
      "Semua peserta yang tidak diundang presentasi menyerahkan proposal setelah Jumat.",
      "Tidak ada peserta yang menyerahkan proposal sebelum Jumat dan diundang presentasi.",
      "Ada peserta yang tidak lolos verifikasi administrasi tetapi diundang presentasi.",
      "Semua peserta yang diundang presentasi menyerahkan proposal sebelum Jumat.",
    ],
    answerKey: "A",
    explanation:
      "Negasi dari pernyataan berkuantor $\\forall x (P(x) \\rightarrow Q(x))$ adalah $\\exists x (P(x) \\land \\neg Q(x))$, yaitu *ada peserta* yang memenuhi kedua syarat tersebut tetapi tidak diundang presentasi.",
  },
  {
    orderIndex: 8,
    type: "PILIHAN_GANDA",
    prompt:
      "Didefinisikan:\n- $P$: server utama aktif.\n- $Q$: proses pencadangan selesai.\n- $S$: izin darurat diberikan.\n- $R$: laporan dapat dikirim.\n\nPernyataan *\"Laporan dapat dikirim hanya jika server utama aktif dan salah satu dari proses pencadangan selesai atau izin darurat diberikan\"* direpresentasikan oleh ....",
    options: [
      "$(P \\land (Q \\lor S)) \\rightarrow R$",
      "$R \\rightarrow (P \\lor Q \\lor S)$",
      "$R \\rightarrow (P \\land (Q \\lor S))$",
      "$(P \\land Q \\land S) \\rightarrow R$",
      "$R \\rightarrow ((P \\land Q) \\lor S)$",
    ],
    answerKey: "C",
    explanation:
      "Bentuk \"$A$ **hanya jika** $B$\" bermakna $A \\rightarrow B$. Di sini $A = R$ dan $B = P \\land (Q \\lor S)$, sehingga ekspresi logikanya adalah $R \\rightarrow (P \\land (Q \\lor S))$.",
  },
  {
    orderIndex: 9,
    type: "PILIHAN_GANDA",
    prompt:
      "Sebuah program pelatihan diikuti pegawai divisi Penjualan, Operasional, dan Administrasi. Rata-rata kenaikan skor kompetensi peserta divisi Penjualan lebih tinggi daripada Operasional, sedangkan rata-rata kenaikan skor Operasional lebih tinggi daripada Administrasi. Beberapa peserta Penjualan tidak mengalami kenaikan skor, dan beberapa peserta Administrasi justru mengalami kenaikan cukup besar.\n\nPernyataan yang PASTI SALAH adalah ....",
    options: [
      "Ada peserta Penjualan yang kenaikan skornya lebih rendah daripada sebagian peserta Administrasi.",
      "Tidak semua peserta Penjualan mengalami kenaikan skor.",
      "Sebagian peserta Administrasi mengalami kenaikan skor.",
      "Rata-rata kenaikan skor peserta Administrasi lebih tinggi daripada rata-rata peserta Operasional.",
      "Seorang peserta Administrasi mungkin memiliki kenaikan skor lebih tinggi daripada seorang peserta Penjualan.",
    ],
    answerKey: "D",
    explanation:
      "Teks secara eksplisit menyatakan bahwa rata-rata kenaikan skor Operasional lebih tinggi daripada Administrasi. Pernyataan bahwa rata-rata Administrasi lebih tinggi daripada Operasional pasti salah.",
  },
  {
    orderIndex: 10,
    type: "PILIHAN_GANDA",
    prompt:
      "Selama dua pagi berturut-turut, peneliti mengamati satu petak bunga di sisi timur sebuah cagar alam. Semua kupu-kupu yang tercatat di petak tersebut adalah spesies M. Peneliti lalu menyimpulkan bahwa spesies M merupakan kupu-kupu yang paling dominan di seluruh cagar alam sepanjang tahun.\n\nPenilaian yang PALING TEPAT terhadap simpulan tersebut adalah ....",
    options: [
      "pasti benar karena semua kupu-kupu yang diamati adalah spesies M",
      "mungkin benar dan sudah cukup didukung karena pengamatan dilakukan dua hari",
      "pasti salah karena cagar alam pasti memiliki lebih dari satu spesies",
      "belum dapat dipastikan karena sampel terbatas pada satu lokasi dan waktu pengamatan yang sempit",
      "tidak relevan karena jenis kupu-kupu tidak berkaitan dengan cagar alam",
    ],
    answerKey: "D",
    explanation:
      "Generalisasi untuk seluruh area cagar alam dan sepanjang tahun tidak valid jika hanya didasarkan pada sampel satu lokasi selama dua pagi (overgeneralization).",
  },
];

export const PU_KUANTITATIF_QUESTIONS: SeedQuestion[] = [
  {
    orderIndex: 1,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Grafik Pelanggan Kanal Digital",
    stimulus: SVG_PU_Q21,
    prompt:
      "Grafik menunjukkan jumlah seluruh pengguna dan pengguna kanal digital (dalam ribu pelanggan). Jika dari 2025 ke 2026 jumlah seluruh pengguna bertambah 50 ribu dan pengguna digital bertambah 55 ribu, pernyataan yang PALING TEPAT adalah ....",
    options: [
      "pangsa pengguna digital pada 2026 tepat 60%",
      "pangsa pengguna digital pada 2026 sedikit melebihi dua pertiga seluruh pengguna",
      "jumlah pengguna nondigital pada 2026 bertambah 5 ribu",
      "jumlah pengguna nondigital pada 2026 sama dengan pengguna digital",
      "pangsa pengguna digital pada 2026 kurang dari 50%",
    ],
    answerKey: "B",
    explanation:
      "Pada tahun 2025, Total = 300 ribu dan Digital = 180 ribu. Pada 2026: Total = $300 + 50 = 350$ ribu dan Digital = $180 + 55 = 235$ ribu. Pangsanya $= \\frac{235}{350} \\approx 67{,}14\\%$, sedikit melebihi $\\frac{2}{3} \\approx 66{,}67\\%$.",
  },
  {
    orderIndex: 2,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Diagram Batang Intervensi Energi (MWh)",
    stimulus: SVG_PU_Q22,
    prompt:
      "Diagram batang membandingkan nilai sebelum dan sesudah intervensi. Jika keberhasilan dinilai dari persentase kenaikan terhadap nilai awal, kategori dengan kenaikan terbesar adalah ....",
    options: ["Kategori A", "Kategori B", "Kategori D", "Kategori C", "semua sama"],
    answerKey: "C",
    explanation:
      "Nilai perubahan persentase terhadap nilai awal: A = $(120-150)/150 = -20\\%$, B = $(90-120)/120 = -25\\%$, C = $(72-90)/90 = -20\\%$, dan D = $(166-200)/200 = -17\\%$. Secara aljabar nilai persentase tertinggi (penurunan paling kecil) dimiliki **Kategori D**.",
  },
  {
    orderIndex: 3,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Diagram Perpindahan Anggota",
    stimulus: SVG_PU_Q23,
    prompt:
      "Diagram menunjukkan jumlah awal anggota empat kelompok. Angka pada panah adalah banyak anggota yang berpindah dan setiap perpindahan terjadi tepat satu kali. Setelah seluruh perpindahan, kelompok dengan anggota terbanyak adalah ....",
    options: ["Kelompok B", "Kelompok C", "Kelompok D", "Kelompok A", "dua kelompok sama besar"],
    answerKey: "D",
    explanation:
      "Setelah perpindahan: $A = 130 - 9 + 7 = 128$; $B = 95 + 9 - 6 = 98$; $C = 74 - 7 = 67$; $D = 63 + 6 = 69$. Kelompok dengan anggota terbanyak tetap **Kelompok A** (128).",
  },
  {
    orderIndex: 4,
    type: "PILIHAN_GANDA",
    prompt:
      "Nilai akhir seleksi $= 60\\%$ tes analitis $+ 40\\%$ wawancara. Kandidat X memperoleh nilai wawancara 79. Dua pesaing terkuat memiliki pasangan nilai (tes analitis, wawancara) masing-masing $(83, 84)$ dan $(87, 77)$. Nilai tes analitis X berupa bilangan bulat. Nilai minimum agar nilai akhir X lebih tinggi daripada KEDUA pesaing adalah ....",
    options: ["85", "86", "88", "89", "87"],
    answerKey: "E",
    explanation:
      "Pesaing 1: $0{,}6(83) + 0{,}4(84) = 49{,}8 + 33{,}6 = 83{,}4$.\nPesaing 2: $0{,}6(87) + 0{,}4(77) = 52{,}2 + 30{,}8 = 83{,}0$.\nAgar X mengalahkan keduanya: $0{,}6 T + 0{,}4(79) > 83{,}4 \\Rightarrow 0{,}6 T > 51{,}8 \\Rightarrow T > 86{,}33$. Bilangan bulat minimum adalah **87**.",
  },
  {
    orderIndex: 5,
    type: "PILIHAN_GANDA",
    prompt: "Perhatikan urutan $7,\\ 10,\\ 16,\\ 25,\\ 37,\\ 52,\\ \\dots$. Suku berikutnya adalah ....",
    options: ["70", "64", "67", "73", "76"],
    answerKey: "A",
    explanation:
      "Beda antar suku berturut-turut: $+3,\\ +6,\\ +9,\\ +12,\\ +15$, sehingga beda berikutnya adalah $+18$. Maka $52 + 18 = 70$.",
  },
  {
    orderIndex: 6,
    type: "PILIHAN_GANDA",
    prompt:
      "Sebuah proyek setara $140$ satuan-orang-hari pada produktivitas normal. Sebanyak 14 pekerja bekerja pada 4 hari pertama. Setelah itu 4 pekerja dipindahkan, tetapi alat baru meningkatkan produktivitas setiap pekerja yang tersisa menjadi $125\\%$ dari normal. Proyek harus selesai pada akhir hari ke-9. Banyak pekerja tambahan MINIMUM yang harus didatangkan segera setelah perpindahan adalah ....",
    options: ["2", "4", "3", "5", "6"],
    answerKey: "B",
    explanation:
      "Pekerjaan 4 hari awal $= 14 \\times 4 = 56$. Sisa beban $= 140 - 56 = 84$ satuan-orang-hari untuk 5 hari tersisa (hari 5–9). Produktivitas baru $= 1{,}25$ per orang per hari. Jika total pekerja menjadi $(10 + k)$, dibutuhkan $(10 + k) \\times 1{,}25 \\times 5 \\ge 84 \\Rightarrow 10 + k \\ge 13{,}44 \\Rightarrow k = 4$.",
  },
  {
    orderIndex: 7,
    type: "PILIHAN_GANDA",
    prompt:
      "Harga katalog suatu layanan dinaikkan $25\\%$. Dari harga baru diberikan diskon $12\\%$, lalu platform memotong biaya layanan $6\\%$ dari pembayaran setelah diskon. Dibanding harga awal, penerimaan bersih penyedia berubah sekitar ....",
    options: ["-4,6%", "-0,6%", "3,4%", "7,4%", "11,4%"],
    answerKey: "C",
    explanation:
      "Faktor pengali akhir $= 1{,}25 \\times (1 - 0{,}12) \\times (1 - 0{,}06) = 1{,}25 \\times 0{,}88 \\times 0{,}94 = 1{,}10 \\times 0{,}94 = 1{,}034$, yaitu naik **+3,4%**.",
  },
  {
    orderIndex: 8,
    type: "PILIHAN_GANDA",
    prompt:
      "Dari 130 responden, 73 menggunakan layanan A dan 67 menggunakan layanan B; 19 tidak menggunakan keduanya. Pengelola ingin sedikitnya $40\\%$ dari responden yang menggunakan minimal satu layanan menjadi pengguna KEDUA layanan. Hanya pengguna tepat satu layanan yang boleh menambah layanan dan tidak ada yang berhenti. Jumlah minimum responden yang harus menambah layanan adalah ....",
    options: ["13", "15", "17", "16", "19"],
    answerKey: "D",
    explanation:
      "Pengguna minimal satu layanan $= 130 - 19 = 111$ orang. Pengguna kedua layanan saat ini $= 73 + 67 - 111 = 29$ orang. Target $40\\% \\times 111 = 44{,}4 \\Rightarrow$ minimal **45** orang. Tambahan minimum $= 45 - 29 = 16$ orang.",
  },
  {
    orderIndex: 9,
    type: "PILIHAN_GANDA",
    prompt:
      "Rata-rata skor 9 analis adalah 77. Seorang analis dengan skor 61 keluar. Dua analis baru bergabung sehingga rata-rata 10 analis menjadi 80. Jumlah skor kedua analis baru adalah ....",
    options: ["160", "164", "172", "176", "168"],
    answerKey: "E",
    explanation:
      "Jumlah awal 9 analis $= 9 \\times 77 = 693$. Setelah 1 analis (skor 61) keluar, sisa $= 693 - 61 = 632$. Total akhir 10 analis $= 10 \\times 80 = 800$. Maka jumlah skor dua analis baru $= 800 - 632 = 168$.",
  },
  {
    orderIndex: 10,
    type: "PILIHAN_GANDA",
    prompt:
      "Kode akses terdiri atas dua digit diikuti dua huruf vokal berbeda. Digit pertama dipilih dari $3, 5, 7, 9$, digit kedua dari $2, 4, 6, 8$, dan jumlah kedua digit harus habis dibagi 3. Dua huruf dipilih berurutan dari $A, I, U, E, O$ tanpa pengulangan. Banyak kode yang mungkin adalah ....",
    options: ["100", "80", "90", "110", "120"],
    answerKey: "A",
    explanation:
      "Pasangan $(d_1, d_2)$ yang jumlahnya kelipatan 3: $(3,6), (9,6), (5,4), (7,2), (7,8)$ — ada $5$ pasang. Susunan 2 vokal berbeda dari 5 vokal $= 5 \\times 4 = 20$. Total kode $= 5 \\times 20 = 100$.",
  },
];

