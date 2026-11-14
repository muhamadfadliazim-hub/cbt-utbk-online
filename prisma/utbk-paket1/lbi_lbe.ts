import { SeedQuestion } from "./pu";

const SVG_LBI_BINGHAM = `<svg viewBox="0 0 340 190" width="340" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="lbia-lbi" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
      <polygon points="0 0, 7 3, 0 6" fill="#0f172a"/>
    </marker>
  </defs>
  <line x1="60" y1="154" x2="296" y2="154" stroke="#0f172a" stroke-width="1.3" marker-end="url(#lbia-lbi)"/>
  <line x1="60" y1="154" x2="60" y2="28" stroke="#0f172a" stroke-width="1.3" marker-end="url(#lbia-lbi)"/>
  <foreignObject x="64" y="5" width="96" height="20" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:96px;height:20px;color:#0f172a;font-size:11px;font-weight:600"><span>tegangan $\\tau$</span></div></foreignObject>
  <foreignObject x="166" y="159" width="136" height="20" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:136px;height:20px;justify-content:flex-end;color:#0f172a;font-size:11px;font-weight:600"><span>laju regangan ($\\dot{\\gamma}$)</span></div></foreignObject>
  <line x1="60" y1="154" x2="236" y2="80" stroke="#0f172a" stroke-width="2"/>
  <text x="242" y="84" font-size="11" font-weight="600" fill="#0f172a">Newtonian</text>
  <line x1="60" y1="112" x2="236" y2="38" stroke="#2563eb" stroke-width="2"/>
  <circle cx="60" cy="112" r="3" fill="#2563eb"/>
  <foreignObject x="32" y="102" width="22" height="20" overflow="visible"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-math-box" style="width:22px;height:20px;justify-content:flex-end;color:#1d4ed8;font-size:11px;font-weight:700"><span>$\\tau_0$</span></div></foreignObject>
  <text x="242" y="42" font-size="11" font-weight="700" fill="#1d4ed8">Bingham</text>
</svg>`;

const SVG_LBI_ENZIM = `<svg viewBox="0 0 380 124" width="380" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="eza-lbi" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
      <polygon points="0 0, 7 3, 0 6" fill="#0f172a"/>
    </marker>
  </defs>
  <rect x="22" y="20" width="64" height="28" rx="6" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2"/>
  <text x="54" y="38" text-anchor="middle" font-size="11" font-weight="600" fill="#0f172a">Enzim</text>
  <line x1="86" y1="34" x2="140" y2="34" stroke="#0f172a" stroke-width="1.3" marker-end="url(#eza-lbi)"/>
  <text x="113" y="26" text-anchor="middle" font-size="10" font-weight="600" fill="#334155">+ substrat</text>
  <rect x="142" y="20" width="104" height="28" rx="6" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2"/>
  <text x="194" y="38" text-anchor="middle" font-size="11" font-weight="600" fill="#0f172a">Kompleks E&#8211;S</text>
  <line x1="246" y1="34" x2="294" y2="34" stroke="#0f172a" stroke-width="1.3" marker-end="url(#eza-lbi)"/>
  <rect x="296" y="20" width="64" height="28" rx="6" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.2"/>
  <text x="328" y="38" text-anchor="middle" font-size="11" font-weight="700" fill="#1e3a8a">Produk</text>
  <rect x="18" y="80" width="72" height="28" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1.2"/>
  <text x="54" y="98" text-anchor="middle" font-size="11" font-weight="600" fill="#991b1b">Inhibitor</text>
  <line x1="54" y1="80" x2="54" y2="50" stroke="#dc2626" stroke-width="1.3" stroke-dasharray="3 3" marker-end="url(#eza-lbi)"/>
  <text x="64" y="69" font-size="10" font-weight="600" fill="#b91c1c">bersaing</text>
</svg>`;

const LBI_TEKS_1 = `Sebuah bahan dapat dimodelkan sebagai fluida Bingham apabila bahan itu belum mengalir sebelum tegangan geser $\\tau$ melampaui tegangan ambang $\\tau_0$. Setelah ambang terlampaui, hubungan sederhananya ditulis

$$\\tau = \\tau_0 + \\eta_p \\dot{\\gamma},$$

dengan $\\dot{\\gamma}$ laju regangan geser dan $\\eta_p$ viskositas plastis. Fluida Newtonian tidak memiliki tegangan ambang sehingga memenuhi $\\tau = \\eta \\dot{\\gamma}$. Model tersebut idealisasi: perubahan suhu dapat mengubah parameter viskositas dan campuran nyata dapat menyimpang dari garis lurus.

Dalam praktik, perilaku seperti ini dapat ditemukan pada pasta, suspensi pekat, lumpur, atau bahan pangan tertentu yang tampak diam ketika gaya yang diberikan masih kecil. Pengujian biasanya dilakukan dengan menaikkan tegangan secara bertahap lalu mencatat perubahan laju deformasi. Titik ketika bahan mulai menunjukkan aliran memberi perkiraan terhadap nilai ambang, sedangkan kemiringan kurva setelah bahan mengalir berkaitan dengan hambatan internal bahan terhadap perubahan bentuk. Karena pengukuran berasal dari data eksperimen, nilai parameter sebaiknya dibaca sebagai karakteristik pada kondisi pengujian tertentu.

Perbandingan dengan fluida Newtonian membantu menjelaskan mengapa dua bahan dapat merespons gaya yang sama secara berbeda. Air, misalnya, tidak memerlukan tegangan awal tertentu untuk mulai mengalami deformasi geser, sedangkan bahan Bingham dapat mempertahankan bentuk sampai ambangnya terlampaui. Model tersebut berguna untuk membaca kecenderungan, tetapi tidak berarti setiap bahan nyata mengikuti garis lurus sempurna pada seluruh rentang pengukuran.

Misalnya, pada proses pemompaan bahan kental, gaya awal yang terlalu kecil dapat membuat pompa bekerja tetapi bahan belum bergerak sebagaimana diharapkan. Setelah ambang terlampaui, kenaikan gaya berikutnya baru berkaitan dengan perubahan laju aliran. Contoh ini menunjukkan bahwa intersep pada grafik bukan sekadar angka tambahan, melainkan membedakan keadaan sebelum dan sesudah bahan mulai mengalir.

${SVG_LBI_BINGHAM}`;

const LBI_TEKS_2 = `Laju awal reaksi enzim dapat didekati oleh persamaan Michaelis–Menten

$$v = \\frac{V_{\\max} [S]}{K_m + [S]}.$$

$[S]$ menyatakan konsentrasi substrat. Ketika $[S] = K_m$, laju reaksi sama dengan setengah $V_{\\max}$. Pada inhibisi kompetitif, inhibitor bersaing dengan substrat pada sisi aktif. Dalam model sederhana, $V_{\\max}$ tetap, tetapi nilai $K_m$ tampak meningkat. Artinya, diperlukan konsentrasi substrat lebih tinggi untuk mencapai fraksi laju yang sama.

Persamaan tersebut sering dipakai untuk membaca bagaimana perubahan konsentrasi substrat memengaruhi kecepatan reaksi ketika jumlah enzim dipertahankan. Pada konsentrasi rendah, penambahan substrat biasanya memberi peningkatan laju yang cukup besar karena masih banyak sisi aktif yang tersedia. Ketika sebagian besar sisi aktif telah sering terisi, penambahan substrat berikutnya memberi kenaikan yang semakin kecil dan laju mendekati nilai maksimum. Karena itu, hubungan antara konsentrasi dan laju tidak berbentuk garis lurus pada seluruh rentang.

Inhibitor kompetitif mengubah keadaan itu karena substrat dan inhibitor memperebutkan lokasi pengikatan yang sama. Konsentrasi substrat yang lebih tinggi dapat meningkatkan peluang substrat menempati sisi aktif, sehingga efek inhibitor dapat dikurangi dalam batas model. Namun, model tidak mengatakan bahwa inhibitor hilang atau bahwa enzim menjadi lebih banyak. Ia hanya menggambarkan perubahan peluang interaksi molekul melalui parameter yang dapat diamati dari kurva laju reaksi.

Dalam eksperimen, peneliti dapat membandingkan dua kurva dengan dan tanpa inhibitor pada rentang konsentrasi substrat yang sama. Jika nilai maksimum akhirnya tetap dapat didekati tetapi kurva membutuhkan konsentrasi lebih tinggi untuk mencapai laju tertentu, pola itu konsisten dengan gambaran kompetitif. Pembacaan kurva perlu melihat keseluruhan hubungan, bukan hanya satu titik pengukuran.

${SVG_LBI_ENZIM}`;

const LBI_TEKS_3 = `Dalam ekonomi, elastisitas harga permintaan mengukur kepekaan jumlah yang diminta terhadap perubahan harga. Secara sederhana,

$$E_d = \\frac{\\%\\Delta Q}{\\%\\Delta P}.$$

Nilai biasanya dibaca berdasarkan besar absolutnya. Jika $|E_d| > 1$, permintaan disebut elastis; jika $|E_d| < 1$, inelastis. Ketika permintaan elastis, kenaikan harga cenderung menurunkan penerimaan total karena penurunan jumlah lebih besar secara proporsional. Sebaliknya, pada permintaan inelastis, kenaikan harga dapat meningkatkan penerimaan total. Kesimpulan ini mengandaikan faktor lain yang memengaruhi permintaan tidak berubah secara besar.

Konsep elastisitas berguna karena persentase memungkinkan perubahan pada barang dengan tingkat harga berbeda dibandingkan dalam ukuran yang sama. Respons konsumen dapat dipengaruhi oleh banyak hal, seperti tersedianya barang pengganti, besar porsi pengeluaran untuk barang tersebut, dan waktu yang tersedia untuk menyesuaikan kebiasaan. Barang yang mudah diganti cenderung menunjukkan respons jumlah lebih besar ketika harga berubah, sedangkan kebutuhan yang sulit diganti sering memiliki respons lebih kecil dalam jangka pendek.

Hubungan elastisitas dengan penerimaan total berasal dari perkalian harga dan jumlah yang terjual. Jika kenaikan harga diikuti penurunan jumlah yang secara proporsional lebih besar, hasil perkalian keduanya dapat turun. Sebaliknya, jika jumlah hanya turun sedikit, kenaikan harga dapat lebih dominan. Analisis ini bukan ramalan mutlak karena perubahan pendapatan, promosi, musim, atau harga barang terkait dapat mengubah permintaan pada saat yang sama.

Elastisitas juga dapat berbeda antara jangka pendek dan jangka panjang. Konsumen mungkin sulit segera mengganti kebiasaan ketika harga berubah hari ini, tetapi beberapa bulan kemudian mereka dapat menemukan substitusi atau mengubah pola konsumsi. Karena itu, angka elastisitas sebaiknya selalu dibaca bersama periode pengamatan dan jenis barang yang sedang dianalisis.`;

const LBI_TEKS_4 = `Politik pecah-belah bekerja ketika penguasa eksternal memanfaatkan persaingan antarkelompok lokal. Dalam kasus kolonial, dukungan dapat diberikan kepada satu faksi untuk melemahkan faksi lain, lalu perjanjian politik dan ekonomi dipakai untuk memperluas pengaruh. Strategi seperti ini tidak berdiri sendiri: keberhasilannya bergantung pada konflik internal yang sudah ada, kemampuan membangun aliansi, dan ketimpangan sumber daya. Karena itu, menyatakan bahwa semua perpecahan lokal semata-mata diciptakan pihak kolonial akan mengabaikan dinamika internal masyarakat.

Dalam sejarah, strategi pecah-belah tidak selalu muncul sebagai perintah terbuka untuk membuat kelompok saling bermusuhan. Pengaruh dapat dibangun melalui dukungan militer, pengakuan politik, perjanjian dagang, atau pemberian hak kepada salah satu pihak dalam perselisihan yang telah ada. Ketika satu faksi memperoleh keuntungan sementara pihak lain merasa dirugikan, kemampuan membentuk posisi bersama dapat melemah. Pihak luar kemudian memperoleh ruang lebih besar untuk menegosiasikan kepentingannya.

Karena itu, analisis sejarah perlu membedakan antara penyebab awal konflik dan cara konflik tersebut dimanfaatkan. Dokumen perjanjian, surat antarpejabat, catatan perdagangan, serta perubahan aliansi dapat membantu melihat urutan peristiwa. Menjelaskan seluruh konflik hanya melalui campur tangan eksternal sama problematisnya dengan mengabaikan pengaruh eksternal sama sekali. Hubungan sebab-akibat perlu dibaca dari bukti yang menunjukkan bagaimana kondisi internal dan tindakan pihak luar saling berinteraksi.

Perubahan aliansi dari waktu ke waktu menjadi petunjuk penting. Jika dukungan eksternal muncul setelah persaingan lokal terbentuk dan kemudian mengubah keseimbangan kekuatan, urutan itu berbeda dari kasus ketika konflik baru muncul setelah intervensi. Sejarawan karena itu memerlukan kronologi yang cukup rinci agar tidak mencampur kondisi awal, pemicu, dan akibat.`;

const LBI_TEKS_5 = `Dira tinggal di kampung padat dekat terminal. Ia diminta membantu menentukan lokasi prioritas penanaman pohon karena warga dari dua gang sama-sama merasa wilayahnya paling membutuhkan naungan. Dira tidak langsung mengikuti tuntutan yang paling keras. Selama beberapa hari, ia mengamati kedua gang pada waktu yang berbeda dan mencatat kepadatan aktivitas, bagian jalan yang minim teduh, serta kondisi ruang yang memungkinkan untuk ditanami.

Setelah membandingkan catatan tersebut, Dira mengusulkan penanaman bertahap dengan prioritas pada titik yang paling panas dan ramai. Ia menjelaskan dasar usulannya kepada warga agar keputusan dapat diperiksa bersama. Dalam catatannya ia menulis, “suara yang paling keras tidak selalu menunjukkan panas yang paling berat.”

Sebelum membawa usulan ke rapat warga, Dira juga memeriksa apakah lokasi yang paling panas memiliki saluran, kabel, atau ruang sempit yang membuat penanaman tidak mungkin dilakukan. Ia meminta pengurus gang menunjukkan titik yang sering dipakai anak-anak dan pejalan kaki pada siang hari. Dengan cara itu, daftar prioritas tidak hanya berisi lokasi dengan suhu tinggi, tetapi juga tempat yang benar-benar dapat ditanami dan memberi manfaat bagi banyak orang. Warga akhirnya menyetujui tahap pertama sambil menyepakati bahwa hasilnya akan dievaluasi setelah beberapa bulan.

Dira juga menyadari bahwa keputusan tahap pertama tidak harus menjadi keputusan permanen. Ia menyimpan catatan suhu dan penggunaan ruang untuk dibandingkan setelah pohon tumbuh atau ketika musim berubah. Jika titik yang semula diprioritaskan ternyata tidak memberi manfaat seperti perkiraan, daftar berikutnya dapat disesuaikan. Bagi warga, proses itu membuat keputusan terlihat sebagai rangkaian evaluasi, bukan kemenangan salah satu gang.`;

export const LBI_QUESTIONS: SeedQuestion[] = [
  {
    orderIndex: 1,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1 untuk nomor 1–6",
    stimulus: LBI_TEKS_1,
    prompt: "Berdasarkan model Bingham, bahan mulai mempunyai $\\dot{\\gamma} > 0$ ketika ....",
    options: ["$\\tau > \\tau_0$", "$\\tau = 0$", "$\\tau < \\tau_0$", "$\\eta_p = 0$", "$\\tau < 0$"],
    answerKey: "A",
    explanation:
      "Kalimat pertama menyatakan bahwa fluida Bingham belum mengalir sebelum tegangan geser $\\tau$ melampaui tegangan ambang $\\tau_0$. Artinya $\\dot{\\gamma} > 0$ ketika $\\tau > \\tau_0$.",
  },
  {
    orderIndex: 2,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1 untuk nomor 1–6",
    stimulus: LBI_TEKS_1,
    prompt: "Jika $\\tau_0 = 20\\text{ Pa}$, $\\eta_p = 4\\text{ Pa}\\cdot\\text{s}$, dan $\\dot{\\gamma} = 5\\text{ s}^{-1}$, tegangan geser menurut model adalah ....",
    options: ["25 Pa", "80 Pa", "100 Pa", "40 Pa", "24 Pa"],
    answerKey: "D",
    explanation:
      "$\\tau = \\tau_0 + \\eta_p \\dot{\\gamma} = 20 + (4 \\times 5) = 20 + 20 = 40\\text{ Pa}$.",
  },
  {
    orderIndex: 3,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1 untuk nomor 1–6",
    stimulus: LBI_TEKS_1,
    prompt: "Dua sampel Bingham memiliki $\\tau_0$ sama. Sampel A mempunyai $\\eta_p$ lebih besar daripada B. Pada $\\dot{\\gamma}$ yang sama, ....",
    options: [
      "A pasti belum mengalir",
      "tegangan geser A lebih besar daripada B",
      "tegangan geser A lebih kecil",
      "keduanya pasti nol",
      "keduanya selalu sama",
    ],
    answerKey: "B",
    explanation:
      "Dari $\\tau = \\tau_0 + \\eta_p \\dot{\\gamma}$, jika $\\tau_0$ dan $\\dot{\\gamma} > 0$ sama serta $\\eta_{p,A} > \\eta_{p,B}$, maka $\\tau_A > \\tau_B$.",
  },
  {
    orderIndex: 4,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1 untuk nomor 1–6",
    stimulus: LBI_TEKS_1,
    prompt: "Pernyataan yang membedakan model Newtonian dari Bingham secara tepat adalah ....",
    options: [
      "Bingham selalu memiliki kemiringan nol",
      "Newtonian memiliki tegangan ambang lebih besar",
      "keduanya tidak dipengaruhi viskositas",
      "Newtonian tidak memiliki hubungan antara tegangan dan laju regangan",
      "garis Newtonian melalui titik asal, sedangkan Bingham memiliki intersep $\\tau_0$",
    ],
    answerKey: "E",
    explanation:
      "Grafik menunjukkan garis Newtonian dimulai dari $(0,0)$, sedangkan garis Bingham memotong sumbu vertikal di $\\tau_0$.",
  },
  {
    orderIndex: 5,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1 untuk nomor 1–6",
    stimulus: LBI_TEKS_1,
    prompt: "Jika percobaan dilakukan pada suhu jauh lebih tinggi dan nilai viskositas berubah, penggunaan parameter lama akan ....",
    options: [
      "membuktikan semua fluida Newtonian",
      "tidak memengaruhi hasil apa pun",
      "dapat menghasilkan prediksi yang tidak akurat",
      "selalu lebih tepat",
      "membuat $\\tau_0$ otomatis nol",
    ],
    answerKey: "C",
    explanation:
      "Teks menjelaskan bahwa perubahan suhu mengubah parameter viskositas dan parameter berlaku pada kondisi pengujian tertentu, sehingga memakai parameter lama bisa membuat prediksi meleset.",
  },
  {
    orderIndex: 6,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 1 untuk nomor 1–6",
    stimulus: LBI_TEKS_1,
    prompt: "Bahan menunjukkan $\\dot{\\gamma} = 0$ pada $15\\text{ Pa}$ dan mulai mengalir pada $22\\text{ Pa}$. Inferensi paling hati-hati adalah ....",
    options: [
      "tegangan ambangnya berada di antara 15 dan 22 Pa",
      "tegangan ambangnya pasti 15 Pa",
      "viskositasnya pasti nol",
      "bahan pasti Newtonian",
      "tegangan ambangnya lebih dari 100 Pa",
    ],
    answerKey: "A",
    explanation:
      "Pada $15\\text{ Pa}$ belum mengalir dan pada $22\\text{ Pa}$ sudah mengalir, sehingga tegangan ambang berada di selang antara 15 dan 22 Pa.",
  },
  {
    orderIndex: 7,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2 untuk nomor 7–12",
    stimulus: LBI_TEKS_2,
    prompt: "Jika $[S] = K_m$, nilai $v$ adalah ....",
    options: ["$2V_{\\max}$", "$K_m$", "$0$", "$\\frac{1}{2}V_{\\max}$", "$V_{\\max}$"],
    answerKey: "D",
    explanation:
      "$v = \\frac{V_{\\max} K_m}{K_m + K_m} = \\frac{1}{2}V_{\\max}$ (juga dinyatakan langsung pada paragraf pertama).",
  },
  {
    orderIndex: 8,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2 untuk nomor 7–12",
    stimulus: LBI_TEKS_2,
    prompt: "Untuk $V_{\\max} = 120$ dan $K_m = 3$, ketika $[S] = 9$ laju awal adalah ....",
    options: ["120", "90", "30", "40", "60"],
    answerKey: "B",
    explanation: "$v = \\frac{120 \\times 9}{3 + 9} = \\frac{1080}{12} = 90$.",
  },
  {
    orderIndex: 9,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2 untuk nomor 7–12",
    stimulus: LBI_TEKS_2,
    prompt: "Dalam inhibisi kompetitif menurut teks, perubahan parameter yang diharapkan adalah ....",
    options: [
      "$V_{\\max}$ menjadi nol",
      "keduanya selalu menurun",
      "$K_m$ menjadi nol dan $V_{\\max}$ naik",
      "keduanya tidak mempunyai arti",
      "$K_m$ tampak meningkat sedangkan $V_{\\max}$ tetap",
    ],
    answerKey: "E",
    explanation:
      "Teks menyebutkan bahwa pada inhibisi kompetitif sederhana, $V_{\\max}$ tetap, tetapi nilai $K_m$ tampak meningkat.",
  },
  {
    orderIndex: 10,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2 untuk nomor 7–12",
    stimulus: LBI_TEKS_2,
    prompt: "Jika konsentrasi substrat dibuat sangat besar, pengaruh inhibitor kompetitif terhadap fraksi kejenuhan cenderung ....",
    options: [
      "membuat $V_{\\max}$ negatif",
      "tidak terkait dengan kompetisi",
      "berkurang karena substrat semakin mampu bersaing pada sisi aktif",
      "meningkat tanpa batas",
      "membuat enzim hilang",
    ],
    answerKey: "C",
    explanation:
      "Konsentrasi substrat lebih tinggi meningkatkan peluang substrat menempati sisi aktif sehingga efek inhibitor kompetitif berkurang.",
  },
  {
    orderIndex: 11,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2 untuk nomor 7–12",
    stimulus: LBI_TEKS_2,
    prompt: "Pernyataan *“$K_m$ besar berarti enzim selalu lebih cepat”* tidak sesuai dengan model karena ....",
    options: [
      "$K_m$ berkaitan dengan konsentrasi substrat yang dibutuhkan untuk mencapai setengah $V_{\\max}$",
      "$K_m$ adalah suhu mutlak",
      "$K_m$ sama dengan jumlah produk",
      "$K_m$ selalu identik dengan $V_{\\max}$",
      "$K_m$ tidak muncul dalam persamaan",
    ],
    answerKey: "A",
    explanation:
      "Nilai $K_m$ menunjukkan konsentrasi substrat untuk mencapai setengah $V_{\\max}$; $K_m$ yang lebih besar justru menandakan butuh substrat lebih banyak untuk laju yang sama.",
  },
  {
    orderIndex: 12,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 2 untuk nomor 7–12",
    stimulus: LBI_TEKS_2,
    prompt: "Dua enzim memiliki $V_{\\max}$ sama. Enzim X memiliki $K_m$ lebih kecil. Pada konsentrasi substrat rendah yang sama, model memprediksi ....",
    options: [
      "laju Y selalu sama dengan $V_{\\max}$",
      "keduanya pasti identik",
      "laju X negatif",
      "laju X cenderung lebih besar",
      "laju X selalu nol",
    ],
    answerKey: "D",
    explanation:
      "Karena penyebut $K_m + [S]$ lebih kecil pada enzim X dengan pembilang $V_{\\max}[S]$ sama, nilai $v_X > v_Y$.",
  },
  {
    orderIndex: 13,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3 untuk nomor 13–18",
    stimulus: LBI_TEKS_3,
    prompt: "Harga naik $10\\%$ dan jumlah yang diminta turun $20\\%$. Besar $|E_d|$ adalah ....",
    options: ["30", "2", "0,5", "1", "10"],
    answerKey: "B",
    explanation: "$|E_d| = \\left|\\frac{-20\\%}{+10\\%}\\right| = 2$.",
  },
  {
    orderIndex: 14,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3 untuk nomor 13–18",
    stimulus: LBI_TEKS_3,
    prompt: "Kasus pada soal sebelumnya termasuk permintaan ....",
    options: ["inelastis", "unit elastis pasti nol", "tidak memiliki harga", "sempurna tetap", "elastis"],
    answerKey: "E",
    explanation: "Karena $|E_d| = 2 > 1$, permintaan disebut **elastis**.",
  },
  {
    orderIndex: 15,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3 untuk nomor 13–18",
    stimulus: LBI_TEKS_3,
    prompt: "Jika permintaan suatu barang elastis, kenaikan harga kecil cenderung ....",
    options: [
      "membuat elastisitas nol",
      "menghapus permintaan",
      "menurunkan penerimaan total",
      "menaikkan penerimaan total secara pasti",
      "tidak mengubah jumlah",
    ],
    answerKey: "C",
    explanation:
      "Pada permintaan elastis, kenaikan harga menurunkan penerimaan total karena persentase penurunan jumlah lebih besar daripada kenaikan harga.",
  },
  {
    orderIndex: 16,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3 untuk nomor 13–18",
    stimulus: LBI_TEKS_3,
    prompt: "Sebuah kebutuhan pokok mempunyai $|E_d| = 0{,}4$. Kenaikan harga $5\\%$ secara kasar dikaitkan dengan penurunan jumlah sekitar ....",
    options: ["2%", "0,4%", "5%", "12,5%", "20%"],
    answerKey: "A",
    explanation: "$\\%\\Delta Q \\approx |E_d| \\times \\%\\Delta P = 0{,}4 \\times 5\\% = 2\\%$.",
  },
  {
    orderIndex: 17,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3 untuk nomor 13–18",
    stimulus: LBI_TEKS_3,
    prompt: "Kesimpulan tentang penerimaan total dapat gagal jika pada saat yang sama ....",
    options: [
      "data jumlah dicatat",
      "harga dinyatakan sebagai angka",
      "barang memiliki nama",
      "pendapatan konsumen atau harga barang terkait berubah besar",
      "satuan harga ditulis dalam rupiah",
    ],
    answerKey: "D",
    explanation:
      "Teks menyebut analisis ini mengandaikan faktor lain tetap (*ceteris paribus*) dan bisa meleset bila pendapatan, promosi, musim, atau harga barang terkait berubah bersamaan.",
  },
  {
    orderIndex: 18,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 3 untuk nomor 13–18",
    stimulus: LBI_TEKS_3,
    prompt: "Dua barang memiliki elastisitas $0{,}3$ dan $1{,}8$. Kebijakan menaikkan harga dengan tujuan menaikkan penerimaan lebih masuk akal diterapkan pada barang dengan elastisitas ....",
    options: [
      "yang elastisitasnya negatif tak terbatas",
      "0,3",
      "1,8",
      "keduanya pasti sama",
      "yang tidak memiliki permintaan",
    ],
    answerKey: "B",
    explanation:
      "Barang dengan $|E_d| = 0{,}3 < 1$ bersifat inelastis sehingga kenaikan harga cenderung meningkatkan penerimaan total.",
  },
  {
    orderIndex: 19,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4 untuk nomor 19–24",
    stimulus: LBI_TEKS_4,
    prompt: "Mekanisme inti politik pecah-belah menurut teks adalah ....",
    options: [
      "menghapus semua konflik internal",
      "memberi sumber daya sama kepada semua pihak",
      "menarik diri dari perjanjian politik",
      "menolak campur tangan ekonomi",
      "memanfaatkan rivalitas internal untuk mengurangi kemampuan kelompok lokal membangun kekuatan bersama",
    ],
    answerKey: "E",
    explanation:
      "Paragraf 1 dan 2 menjelaskan bahwa penguasa eksternal memanfaatkan persaingan lokal yang sudah ada sehingga kemampuan membentuk posisi bersama melemah.",
  },
  {
    orderIndex: 20,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4 untuk nomor 19–24",
    stimulus: LBI_TEKS_4,
    prompt: "Jika kelompok-kelompok lokal berhasil membentuk koalisi stabil, kondisi itu paling mungkin ....",
    options: [
      "menghapus seluruh kepentingan ekonomi",
      "menjamin kemenangan kolonial",
      "mengurangi efektivitas strategi pecah-belah",
      "meningkatkan fragmentasi",
      "membuat konflik internal otomatis bertambah",
    ],
    answerKey: "C",
    explanation:
      "Karena keberhasilan pecah-belah bergantung pada konflik internal dan lemahnya posisi bersama, koalisi yang stabil mengurangi efektivitasnya.",
  },
  {
    orderIndex: 21,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4 untuk nomor 19–24",
    stimulus: LBI_TEKS_4,
    prompt: "Pernyataan *“semua konflik lokal diciptakan pihak kolonial”* dinilai lemah karena ....",
    options: [
      "teks mengakui adanya dinamika dan rivalitas internal sebelum dimanfaatkan pihak luar",
      "teks menyatakan tidak ada kolonialisme",
      "semua perjanjian bersifat ekonomi",
      "konflik tidak pernah terjadi",
      "aliansi selalu gagal",
    ],
    answerKey: "A",
    explanation:
      "Paragraf 1 menyatakan bahwa klaim semacam itu mengabaikan dinamika dan konflik internal yang sudah ada sebelumnya.",
  },
  {
    orderIndex: 22,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4 untuk nomor 19–24",
    stimulus: LBI_TEKS_4,
    prompt: "Bukti yang paling mendukung analisis teks adalah ....",
    options: [
      "daftar hasil panen tanpa hubungan politik",
      "daftar nama penduduk tanpa konteks",
      "peta topografi tanpa perjanjian",
      "dokumen yang menunjukkan pihak kolonial memberi dukungan berbeda kepada faksi yang sedang bersaing",
      "catatan cuaca tahunan",
    ],
    answerKey: "D",
    explanation:
      "Dokumen dukungan berbeda kepada faksi yang bersaing secara langsung memperlihatkan interaksi faktor internal dan eksternal yang dibahas teks.",
  },
  {
    orderIndex: 23,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4 untuk nomor 19–24",
    stimulus: LBI_TEKS_4,
    prompt: "Dari sudut sebab-akibat, konflik internal dalam teks berfungsi sebagai ....",
    options: [
      "pengganti semua kebijakan kolonial",
      "kondisi yang dapat dieksploitasi untuk memperluas pengaruh eksternal",
      "hasil yang selalu muncul setelah penjajahan",
      "faktor yang sama sekali tidak relevan",
      "bukti bahwa ekonomi tidak berperan",
    ],
    answerKey: "B",
    explanation:
      "Persaingan internal merupakan kondisi awal yang dimanfaatkan/dieksploitasi penguasa eksternal untuk memperluas pengaruh.",
  },
  {
    orderIndex: 24,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 4 untuk nomor 19–24",
    stimulus: LBI_TEKS_4,
    prompt: "Analisis yang paling seimbang terhadap suatu kasus lokal adalah ....",
    options: [
      "hanya mencari satu tokoh yang disalahkan",
      "mengabaikan sumber lokal",
      "menganggap pola semua daerah identik",
      "menolak penggunaan bukti perjanjian",
      "memeriksa sekaligus rivalitas internal, intervensi eksternal, dan distribusi sumber daya",
    ],
    answerKey: "E",
    explanation:
      "Paragraf 3 dan 4 menekankan keseimbangan membaca kondisi internal maupun tindakan pihak luar melalui bukti kronologis yang lengkap.",
  },
  {
    orderIndex: 25,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 5 untuk nomor 25–30 (Lorong yang Lebih Teduh)",
    stimulus: LBI_TEKS_5,
    prompt: "Dalam cerita *“Lorong yang Lebih Teduh”*, konflik utama Dira adalah ....",
    options: [
      "memilih jenis pohon berdasarkan harga yang paling mahal",
      "menentukan gang yang memiliki jumlah rumah paling sedikit tanpa melihat kondisi teduh",
      "menentukan lokasi prioritas penanaman pohon ketika dua gang sama-sama merasa paling membutuhkan",
      "membatalkan seluruh rencana penanaman karena warga berbeda pendapat",
      "memilih lokasi hanya berdasarkan siapa yang lebih dahulu mengajukan usul",
    ],
    answerKey: "C",
    explanation:
      "Paragraf 1 langsung memaparkan masalah: warga dua gang sama-sama merasa paling membutuhkan naungan sehingga Dira harus menentukan prioritasnya.",
  },
  {
    orderIndex: 26,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 5 untuk nomor 25–30 (Lorong yang Lebih Teduh)",
    stimulus: LBI_TEKS_5,
    prompt: "Tindakan Dira dalam *“Lorong yang Lebih Teduh”* menunjukkan bahwa ia cenderung ....",
    options: [
      "membandingkan kondisi lapangan sebelum menentukan prioritas",
      "langsung mengikuti pendapat yang paling dominan tanpa memeriksa informasi",
      "mempertahankan pilihan awal meskipun muncul bukti yang bertentangan",
      "menghindari keputusan dengan menyerahkan seluruh tanggung jawab kepada orang lain",
      "menilai pilihan hanya dari satu faktor dan mengabaikan akibat lainnya",
    ],
    answerKey: "A",
    explanation:
      "Dira mengamati kedua gang pada waktu berbeda, mencatat suhu, aktivitas, ruang tanam, saluran, dan kabel sebelum mengusulkan prioritas.",
  },
  {
    orderIndex: 27,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 5 untuk nomor 25–30 (Lorong yang Lebih Teduh)",
    stimulus: LBI_TEKS_5,
    prompt: "Makna ungkapan *“suara yang paling keras tidak selalu menunjukkan panas yang paling berat”* paling tepat adalah ....",
    options: [
      "semua perbedaan kepentingan akan hilang apabila tersedia data",
      "keputusan yang baik harus selalu mengikuti suara terbanyak",
      "kuatnya tuntutan warga tidak selalu sejalan dengan tingkat kebutuhan yang dapat diamati",
      "hasil yang cepat selalu menunjukkan proses yang paling baik",
      "pendapat mayoritas selalu lebih akurat daripada pengamatan langsung",
    ],
    answerKey: "C",
    explanation:
      "\"Suara paling keras\" melambangkan desakan/tuntutan warga, sedangkan \"panas paling berat\" melambangkan kebutuhan nyata di lapangan.",
  },
  {
    orderIndex: 28,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 5 untuk nomor 25–30 (Lorong yang Lebih Teduh)",
    stimulus: LBI_TEKS_5,
    prompt: "Fungsi bagian akhir cerita *“Lorong yang Lebih Teduh”* adalah ....",
    options: [
      "menunjukkan keputusan Dira setelah ia membandingkan hasil pengamatan dan kebutuhan kedua gang serta keterbukaan terhadap evaluasi",
      "memperkenalkan persoalan baru yang tidak berkaitan dengan konflik utama",
      "mengulang latar awal tanpa memperlihatkan perkembangan keputusan",
      "mengalihkan cerita menjadi uraian teknis yang tidak berkaitan dengan tokoh",
      "menyatakan masalah selesai tanpa menunjukkan akibat dari tindakan tokoh",
    ],
    answerKey: "A",
    explanation:
      "Bagian akhir memperlihatkan bagaimana keputusan bertahap disepakati dengan pencatatan lanjutan untuk evaluasi sehingga konflik antargang terselesaikan secara adil.",
  },
  {
    orderIndex: 29,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 5 untuk nomor 25–30 (Lorong yang Lebih Teduh)",
    stimulus: LBI_TEKS_5,
    prompt: "Sifat Dira yang paling kuat didukung oleh cerita *“Lorong yang Lebih Teduh”* adalah ....",
    options: [
      "impulsif dan mudah terpengaruh",
      "pasif dan menghindari tanggung jawab",
      "keras kepala dan menolak bukti",
      "ceroboh dan tidak konsisten",
      "teliti dan berorientasi pada bukti",
    ],
    answerKey: "E",
    explanation:
      "Sikap Dira yang mengamati berhari-hari, mengecek kendala teknis (kabel/saluran), mencatat suhu, dan terbuka pada evaluasi ulang membuktikan ketelitian dan orientasi bukti.",
  },
  {
    orderIndex: 30,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Teks 5 untuk nomor 25–30 (Lorong yang Lebih Teduh)",
    stimulus: LBI_TEKS_5,
    prompt: "Tema yang paling sesuai untuk cerita *“Lorong yang Lebih Teduh”* adalah ....",
    options: [
      "pelestarian kadang memerlukan pembatasan penggunaan demi manfaat jangka panjang",
      "keputusan publik sebaiknya didasarkan pada kondisi nyata, bukan hanya pada tekanan yang paling keras",
      "keputusan transportasi perlu menimbang biaya, waktu, dan kepastian perjalanan",
      "transparansi informasi dapat membantu membangun kepercayaan ketika harga berubah",
      "kebijakan berbasis jarak perlu mempertimbangkan kondisi geografis dan akses perjalanan nyata",
    ],
    answerKey: "B",
    explanation:
      "Inti amanat cerita tergambar pada catatan Dira dan tindakannya dalam mengutamakan pengamatan objektif di atas desakan suara paling keras.",
  },
];

const LBE_THREAD = `**Mara:** I started using an AI note-taking tool in lectures because it catches details I miss while listening. The summaries are convenient, but I am worried that I am becoming passive. Last week I realized I could recognize a topic in the summary without being able to explain it on my own. How can I use the tool without letting it replace actual learning?

**Jonas:** I treat the summary as a rough transcript, not as my final notes. After class I close it, write what I remember from memory, and only then compare the two. The gaps show me what I did not understand.

**Priya:** I do something similar, but I also check technical terms against the lecturer’s slides. Automatic summaries sometimes flatten distinctions that matter. The tool saves time, yet verification is still part of the work.

**Eli:** Try turning the summary into questions instead of rereading it. If you cannot answer the questions without looking back, that is a sign you have not learned the material yet.

**Noah:** My laptop sleeve has a pocket for three pens, which is honestly the best feature I bought this semester.

**Sofia:** You may not need to choose between using the tool and learning actively. Use it for capture, then make your own retrieval practice. The important boundary is that the machine can record information, but it cannot do the remembering for you.

**Mika:** One more safeguard is to keep a small set of your own notes that the tool never writes for you. If you can explain the lecture from those prompts alone, the summary is supporting memory instead of substituting for it.`;

const LBE_PAIRED = `**Text 1 — Community observations**

Citizen-science bird projects can extend observation across places that professional research teams could never visit every week. Volunteers may notice seasonal arrivals, nesting behavior, or sudden absences in ordinary neighborhoods. The value of such projects does not come from assuming every observation is perfect. It comes from combining many records, clear identification guidance, and procedures for flagging uncertain reports.

Human observers also provide context that sensors may not capture. A volunteer can note that construction began beside a wetland, that a tree was removed, or that a flock was disturbed by a festival. These details can help explain why a count changed. The weakness is uneven effort: one location may have many enthusiastic observers while another receives little attention. Training and transparent reporting therefore matter as much as enthusiasm. Because participation varies, project designers can also compare records from the same sites over time and provide photographs or audio examples for difficult identifications. Quality control becomes part of participation rather than a reason to exclude nonprofessionals.

---

**Text 2 — Automated acoustic sensors**

Acoustic sensors offer a different way to monitor birds. Once installed, a recorder can collect sound at the same site on a regular schedule, including hours when no volunteer is present. Software can then screen large recordings for possible calls. This consistency is useful for detecting patterns over time, especially in remote or difficult locations.

Yet automation does not remove interpretation. Wind, insects, machinery, and overlapping calls can confuse recognition systems. Sensors also record sound rather than the whole setting, so a detected call does not automatically reveal how many birds were present or what they were doing. The strongest monitoring programs often treat automated recording as one source of evidence and use field observations to check uncertain cases and supply ecological context. Calibration and maintenance matter over long deployments too. A recorder with a failing microphone can produce consistent-looking files that are consistently misleading, so automated consistency still requires checks on the instrument itself.`;

const LBE_PASSAGE = `A dark roof can absorb a large share of incoming sunlight and become much warmer than the surrounding air. A cool roof uses a lighter or specially coated surface that reflects more solar energy and releases absorbed heat efficiently. Lower roof temperatures can reduce heat entering the rooms below, especially in buildings with weak insulation or large exposed roof areas.

The effect is not identical in every building. A well-insulated structure may gain less indoor benefit because little roof heat reaches the occupied space anyway. Climate also matters: reflecting summer heat can be useful in hot regions, while in colder seasons the same surface may slightly reduce solar warming that would otherwise help heat the building. Dirt and aging can also change reflectivity over time.

For city planners, this means that cool roofs are best understood as one heat-management tool rather than a universal answer. They can reduce surface temperatures and cooling demand in suitable buildings, but decisions should consider climate, roof condition, insulation, maintenance, and how the building is actually used. The same logic applies at neighborhood scale: planners need to distinguish a measurable surface-temperature effect from the actual exposure experienced by people inside buildings and on nearby streets.`;

export const LBE_QUESTIONS: SeedQuestion[] = [
  {
    orderIndex: 1,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Thread: AI notes and active learning (Questions 1–7)",
    stimulus: LBE_THREAD,
    prompt: "Which concern is the original poster trying to resolve?",
    options: [
      "how to buy better stationery",
      "how to choose a new note-taking application",
      "how to use AI-generated lecture notes without becoming a passive learner",
      "whether laptops should be allowed in lectures",
      "why students should stop taking notes completely",
    ],
    answerKey: "C",
    explanation:
      "Mara explicitly asks: *\"How can I use the tool without letting it replace actual learning?\"* after expressing worry about becoming passive.",
  },
  {
    orderIndex: 2,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Thread: AI notes and active learning (Questions 1–7)",
    stimulus: LBE_THREAD,
    prompt: "In Thread: AI notes and active learning, who is the first respondent to turn the discussion into a concrete action?",
    options: ["Priya", "Eli", "Noah", "Jonas", "Mara"],
    answerKey: "D",
    explanation:
      "Jonas is the first person to reply to Mara and immediately gives a concrete step-by-step routine (closing the summary, writing from memory, then comparing).",
  },
  {
    orderIndex: 3,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Thread: AI notes and active learning (Questions 1–7)",
    stimulus: LBE_THREAD,
    prompt: "Whose reply in Thread: AI notes and active learning is most clearly supported by a stated reason or practical consideration?",
    options: ["Mara", "Priya", "Jonas", "Eli", "Noah"],
    answerKey: "B",
    explanation:
      "Priya supports her habit with a clear stated rationale: *\"Automatic summaries sometimes flatten distinctions that matter. The tool saves time, yet verification is still part of the work.\"*",
  },
  {
    orderIndex: 4,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Thread: AI notes and active learning (Questions 1–7)",
    stimulus: LBE_THREAD,
    prompt: "The main purpose of Sofia’s reply is ....",
    options: [
      "to recommend replacing lectures with summaries",
      "to argue that all AI tools should be banned",
      "to show that automated capture and active learning can be combined if their roles are kept separate",
      "to advertise a new laptop",
      "to claim that memory no longer matters",
    ],
    answerKey: "C",
    explanation:
      "Sofia explains that one need not choose between the tool and active learning: use the tool for capture and do retrieval practice yourself.",
  },
  {
    orderIndex: 5,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Thread: AI notes and active learning (Questions 1–7)",
    stimulus: LBE_THREAD,
    prompt: "Which participant’s response is least relevant to the issue discussed in Thread: AI notes and active learning?",
    options: ["Eli", "Jonas", "Priya", "Noah", "Mara"],
    answerKey: "D",
    explanation:
      "Noah only comments on his laptop sleeve having a pocket for three pens, which has nothing to do with AI notes or active learning.",
  },
  {
    orderIndex: 6,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Thread: AI notes and active learning (Questions 1–7)",
    stimulus: LBE_THREAD,
    prompt: "In Sofia’s reply, the word *“may”* mainly expresses ....",
    options: ["certainty", "permission", "possibility", "prohibition", "obligation"],
    answerKey: "C",
    explanation:
      "In *\"You may not need to choose...\"*, *may* expresses epistemic possibility (it is possible that you do not need to choose).",
  },
  {
    orderIndex: 7,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Thread: AI notes and active learning (Questions 1–7)",
    stimulus: LBE_THREAD,
    prompt: "What best describes the overall tone of the useful replies in Thread: AI notes and active learning?",
    options: [
      "supportive and reflective",
      "legalistic and formal",
      "indifferent and detached",
      "celebratory and promotional",
      "hostile and mocking",
    ],
    answerKey: "A",
    explanation:
      "The on-topic respondents (Jonas, Priya, Eli, Sofia, Mika) constructively share thoughtful strategies to help Mara learn effectively.",
  },
  {
    orderIndex: 8,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Paired Texts: Bird monitoring (Questions 8–14)",
    stimulus: LBE_PAIRED,
    prompt: "Which statement best captures the central point of Text 1?",
    options: [
      "Citizen science expands spatial coverage and contextual observation, but its value depends on training and transparent reporting.",
      "Text 1 treats Bird monitoring as a universally effective approach with no meaningful limits.",
      "Text 1 claims that evidence about Bird monitoring is unnecessary once a policy has been chosen.",
      "Text 1 reduces Bird monitoring to a single technical detail and ignores the larger issue.",
      "Text 1 describes Bird monitoring only to show that older methods are always superior.",
    ],
    answerKey: "A",
    explanation:
      "Text 1 highlights how citizen science extends geographic coverage and supplies environmental context, while emphasizing uneven effort and the need for training and quality control.",
  },
  {
    orderIndex: 9,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Paired Texts: Bird monitoring (Questions 8–14)",
    stimulus: LBE_PAIRED,
    prompt: "In Text 1, the phrase *“uneven effort”* is closest in meaning to ....",
    options: [
      "a claim intended to apply without exception",
      "a guaranteed prediction about the future",
      "an accusation directed at the reader",
      "differences in how much observation is done across locations",
      "a label for a reverse procedure that is not being described here",
    ],
    answerKey: "D",
    explanation:
      "Text 1 explains *\"The weakness is uneven effort: one location may have many enthusiastic observers while another receives little attention.\"*",
  },
  {
    orderIndex: 10,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Paired Texts: Bird monitoring (Questions 8–14)",
    stimulus: LBE_PAIRED,
    prompt: "In Paired texts: Bird monitoring, what is the primary purpose of Text 2?",
    options: [
      "to narrate a fictional event that is unrelated to the debate over Bird monitoring",
      "to dismiss practical concerns about Bird monitoring as irrelevant",
      "to entertain the reader with an anecdote rather than examine Bird monitoring",
      "to argue that further evidence about Bird monitoring would never be useful",
      "to explain both the strengths and limitations of automated acoustic monitoring",
    ],
    answerKey: "E",
    explanation:
      "Paragraph 1 of Text 2 covers consistency and remote coverage (strengths), and paragraph 2 covers noise confusion, missing context, and calibration needs (limitations).",
  },
  {
    orderIndex: 11,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Paired Texts: Bird monitoring (Questions 8–14)",
    stimulus: LBE_PAIRED,
    prompt: "In Paired texts: Bird monitoring, how are Text 1 and Text 2 related?",
    options: [
      "The texts describe complementary monitoring approaches whose weaknesses can be reduced by combining them.",
      "Text 1 is a fictional account, whereas Text 2 is a list of language rules unrelated to Bird monitoring.",
      "The texts share vocabulary about Bird monitoring but do not engage with the same broader question.",
      "Text 2 rejects every factual statement in Text 1 about Bird monitoring.",
      "The two texts address unrelated subjects, so their claims about Bird monitoring cannot be compared.",
    ],
    answerKey: "A",
    explanation:
      "Text 2 explicitly notes that the strongest programs pair automated recording with field observations to verify uncertain cases and supply ecological context.",
  },
  {
    orderIndex: 12,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Paired Texts: Bird monitoring (Questions 8–14)",
    stimulus: LBE_PAIRED,
    prompt: "Which option gives the best synthesis of the two texts in Paired texts: Bird monitoring?",
    options: [
      "Both texts prove that the newest approach to Bird monitoring must replace every older one.",
      "The issue of Bird monitoring can be reduced to a single benefit with no meaningful trade-off.",
      "Any limitation mentioned in either text makes all approaches to Bird monitoring ineffective.",
      "Human observers add context and broad participation, while sensors add consistent recording; neither source should automatically be treated as complete on its own.",
      "The texts imply that a single example is enough to determine policy for Bird monitoring everywhere.",
    ],
    answerKey: "D",
    explanation:
      "Option (D) accurately balances the unique contribution and limitation of each method.",
  },
  {
    orderIndex: 13,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Paired Texts: Bird monitoring (Questions 8–14)",
    stimulus: LBE_PAIRED,
    prompt: "Which inference is most strongly supported when the two texts in Paired texts: Bird monitoring are read together?",
    options: [
      "Only the newest approach to Bird monitoring can be reasonable in practice.",
      "The combined evidence rules out every alternative not explicitly mentioned in the texts.",
      "The discussion shows that personal preference is stronger evidence than observed outcomes about Bird monitoring.",
      "The authors imply that uncertainty about Bird monitoring disappears once a general principle is identified.",
      "A program using both methods could cross-check uncertain detections while covering more places and times.",
    ],
    answerKey: "E",
    explanation:
      "Combining volunteers (wider sites + context) with scheduled acoustic sensors (consistent timing + cross-checking uncertain calls) follows directly from both texts.",
  },
  {
    orderIndex: 14,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Paired Texts: Bird monitoring (Questions 8–14)",
    stimulus: LBE_PAIRED,
    prompt: "The writers’ overall treatment of Bird monitoring is best described as ....",
    options: [
      "playful rather than analytical",
      "purely nostalgic",
      "indifferent to practical evidence",
      "balanced rather than promotional",
      "dogmatic and absolute",
    ],
    answerKey: "D",
    explanation:
      "Both writers carefully weigh benefits alongside limitations and quality-control requirements.",
  },
  {
    orderIndex: 15,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Passage: Cool roofs in hot cities (Questions 15–20)",
    stimulus: LBE_PASSAGE,
    prompt: "Which statement best expresses the main idea of Passage: Cool roofs in hot cities?",
    options: [
      "The passage claims that decisions about Cool roofs in hot cities can be made without examining local conditions.",
      "The central claim is that Cool roofs in hot cities produces the same benefits for every population.",
      "The writer argues that Cool roofs in hot cities should be abandoned because any limitation makes it ineffective.",
      "Cool roofs can reduce heat gain, but their real benefit depends on building and climate conditions.",
      "The passage is mainly a chronological history of Cool roofs in hot cities with no present-day implication.",
    ],
    answerKey: "D",
    explanation:
      "Across all three paragraphs, the author explains how cool roofs reduce heat gain and emphasizes that real benefits depend on insulation, climate, and maintenance.",
  },
  {
    orderIndex: 16,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Passage: Cool roofs in hot cities (Questions 15–20)",
    stimulus: LBE_PASSAGE,
    prompt: "As used in the passage, *“universal”* is closest in meaning to ....",
    options: [
      "an unrelated historical reference",
      "a measurement error in the evidence",
      "a precise numerical cutoff unrelated to the phrase as used here",
      "a binding legal requirement",
      "effective or applicable in every situation",
    ],
    answerKey: "E",
    explanation:
      "\"Rather than a universal answer\" contrasts one heat-management tool with a solution that works identically in every building or climate.",
  },
  {
    orderIndex: 17,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Passage: Cool roofs in hot cities (Questions 15–20)",
    stimulus: LBE_PASSAGE,
    prompt: "Which inference is best supported by the information in Passage: Cool roofs in hot cities?",
    options: [
      "The text establishes that cost is the only factor worth considering in decisions about Cool roofs in hot cities.",
      "A poorly insulated building in a hot climate may benefit more than a well-insulated building in a cool climate.",
      "Factors not mentioned in the passage can never influence outcomes related to Cool roofs in hot cities.",
      "The passage proves the same result for every possible case involving Cool roofs in hot cities.",
      "The passage implies that a benefit of Cool roofs in hot cities must occur immediately in every setting.",
    ],
    answerKey: "B",
    explanation:
      "Paragraphs 1 and 2 state that buildings with weak insulation in hot climates gain greater indoor cooling benefit, whereas well-insulated buildings or colder climates gain less.",
  },
  {
    orderIndex: 18,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Passage: Cool roofs in hot cities (Questions 15–20)",
    stimulus: LBE_PASSAGE,
    prompt: "What is the author’s primary purpose in Passage: Cool roofs in hot cities?",
    options: [
      "to persuade readers to purchase a specific product associated with Cool roofs in hot cities",
      "to entertain readers with anecdotes while avoiding the evidence about Cool roofs in hot cities",
      "to present a legal rule about Cool roofs in hot cities as if it were a scientific finding",
      "to advertise Cool roofs in hot cities without considering evidence or limitations",
      "to explain how cool roofs work and why their usefulness should be evaluated in context",
    ],
    answerKey: "E",
    explanation:
      "The author informs readers of the physical mechanism of cool roofs and guides planners to evaluate them in context.",
  },
  {
    orderIndex: 19,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Passage: Cool roofs in hot cities (Questions 15–20)",
    stimulus: LBE_PASSAGE,
    prompt: "What role does the later part of Passage: Cool roofs in hot cities play in the overall organization?",
    options: [
      "It repeats the opening claims about Cool roofs in hot cities without adding any qualification or implication.",
      "It changes the passage into a personal narrative that no longer addresses Cool roofs in hot cities.",
      "It introduces a subject unrelated to Cool roofs in hot cities and abandons the earlier discussion.",
      "The second paragraph qualifies the mechanism by identifying conditions that change the size or direction of the benefit.",
      "It merely restates the title and contributes no new information about Cool roofs in hot cities.",
    ],
    answerKey: "D",
    explanation:
      "Paragraph 2 adds key caveats—insulation level, seasonal climate, and dirt/aging—that qualify the general mechanism introduced in paragraph 1.",
  },
  {
    orderIndex: 20,
    type: "PILIHAN_GANDA",
    stimulusTitle: "Passage: Cool roofs in hot cities (Questions 15–20)",
    stimulus: LBE_PASSAGE,
    prompt: "Which title best fits Passage: Cool roofs in hot cities?",
    options: [
      "Cool roofs in hot cities: A Guaranteed Result in Every Setting",
      "The Only Possible Approach to Cool roofs in hot cities",
      "Why Context Never Matters for Cool roofs in hot cities",
      "One Simple Rule for Every Case of Cool roofs in hot cities",
      "Cool Roofs: Useful, but Context Matters",
    ],
    answerKey: "E",
    explanation:
      "Only option (E) captures both the benefit of cool roofs and the central theme that local context matters.",
  },
];

