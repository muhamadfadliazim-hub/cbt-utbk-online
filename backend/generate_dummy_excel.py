import pandas as pd

def create_full_utbk_dummy():
    # --- WACANA DUMMY ---
    wacana_indo = """Kecerdasan Buatan (AI) telah menjadi topik pembicaraan utama dalam beberapa tahun terakhir. Teknologi ini menjanjikan revolusi di berbagai sektor, mulai dari kesehatan hingga transportasi. Dalam bidang kesehatan, AI digunakan untuk menganalisis citra medis dengan akurasi yang sering kali melampaui dokter manusia. Misalnya, algoritma deep learning dapat mendeteksi tanda-tanda awal kanker paru-paru dari hasil CT scan jauh lebih cepat daripada metode konvensional.

Namun, kemajuan ini bukan tanpa risiko. Salah satu kekhawatiran terbesar adalah potensi hilangnya pekerjaan akibat otomatisasi. Laporan dari World Economic Forum memperkirakan bahwa jutaan pekerjaan mungkin akan digantikan oleh mesin pada tahun 2025. Di sisi lain, AI juga diperkirakan akan menciptakan jenis pekerjaan baru yang belum pernah ada sebelumnya, menuntut keterampilan baru dari tenaga kerja global.

Selain itu, ada isu etika yang mendesak. Bias dalam algoritma AI dapat memperburuk ketidaksetaraan sosial jika data yang digunakan untuk melatih sistem tersebut tidak representatif. Oleh karena itu, pengembangan AI yang bertanggung jawab dan inklusif menjadi prioritas bagi para pembuat kebijakan dan teknolog di seluruh dunia."""

    wacana_inggris = """The James Webb Space Telescope (JWST) is the most powerful space telescope ever built. Launched in December 2021, it is designed to peer into the deepest recesses of the universe, observing the first galaxies that formed after the Big Bang. Unlike its predecessor, the Hubble Space Telescope, which primarily observes in visible light, JWST operates in the infrared spectrum. This allows it to see through dust clouds that obscure the visible light from forming stars and planets.

One of JWST's primary missions is to study exoplanets—planets orbiting stars other than our Sun. By analyzing the light passing through an exoplanet's atmosphere, scientists can determine its chemical composition and search for biosignatures, such as water vapor, methane, and carbon dioxide, which could indicate the potential for life.

The telescope's deployment was a feat of engineering, involving a complex sequence of unfolding its massive sunshield and mirrors while traveling to its destination, a point in space known as Lagrange Point 2 (L2), approximately 1.5 million kilometers from Earth."""

    # --- 20 SOAL DUMMY ---
    data = [
        # --- 1-4: Literasi Bahasa Indonesia (Wacana AI) ---
        {
            "Tipe": "PG",
            "Soal": "Berdasarkan teks, apa manfaat utama AI dalam bidang kesehatan?",
            "Bacaan": wacana_indo,
            "Gambar": "",
            "OpsiA": "Menggantikan peran dokter sepenuhnya.",
            "OpsiB": "Mendeteksi penyakit lebih cepat dan akurat.",
            "OpsiC": "Mengurangi biaya operasional rumah sakit.",
            "OpsiD": "Membuat obat baru tanpa uji klinis.",
            "OpsiE": "Menghilangkan kebutuhan akan CT scan.",
            "Kunci": "B",
            "Kesulitan": 1.0
        },
        {
            "Tipe": "PG KOMPLEKS",
            "Soal": "Manakah tantangan pengembangan AI yang disebutkan dalam teks? (Pilih lebih dari satu)",
            "Bacaan": wacana_indo,
            "Gambar": "",
            "OpsiA": "Biaya pembuatan yang sangat mahal.",
            "OpsiB": "Potensi hilangnya lapangan pekerjaan.",
            "OpsiC": "Bias data yang memperburuk ketimpangan sosial.",
            "OpsiD": "Keterbatasan daya komputasi.",
            "OpsiE": "Kurangnya minat dari pemerintah.",
            "Kunci": "B,C",
            "Kesulitan": 2.0
        },
        {
            "Tipe": "TABEL",
            "Soal": "Tentukan Benar/Salah pernyataan berikut berdasarkan wacana AI:",
            "Bacaan": wacana_indo,
            "Gambar": "",
            "OpsiA": "AI diprediksi hanya akan menghilangkan pekerjaan tanpa menciptakan yang baru.",
            "OpsiB": "Bias algoritma terjadi karena data latih yang tidak representatif.",
            "OpsiC": "World Economic Forum memprediksi otomatisasi massal pada tahun 2030.",
            "OpsiD": "AI dapat melihat tanda kanker paru-paru lebih baik dari metode lama.",
            "OpsiE": "",
            "Kunci": "S,B,S,B",
            "Kesulitan": 2.0
        },
        {
            "Tipe": "PG",
            "Soal": "Makna kata 'inklusi' dalam konteks paragraf terakhir adalah...",
            "Bacaan": wacana_indo,
            "Gambar": "",
            "OpsiA": "Eksklusif untuk kalangan tertentu.",
            "OpsiB": "Terbuka dan melibatkan semua kalangan.",
            "OpsiC": "Canggih dan modern.",
            "OpsiD": "Tersembunyi dan rahasia.",
            "OpsiE": "Mahal dan bernilai tinggi.",
            "Kunci": "B",
            "Kesulitan": 1.5
        },

        # --- 5-8: Literasi Bahasa Inggris (Wacana JWST) ---
        {
            "Tipe": "PG",
            "Soal": "Why does the James Webb Space Telescope operate in the infrared spectrum?",
            "Bacaan": wacana_inggris,
            "Gambar": "",
            "OpsiA": "To save energy during its operation.",
            "OpsiB": "To communicate faster with Earth.",
            "OpsiC": "To see through dust clouds obscuring stars.",
            "OpsiD": "Because visible light cannot travel in space.",
            "OpsiE": "To avoid damaging its sensitive mirrors.",
            "Kunci": "C",
            "Kesulitan": 1.5
        },
        {
            "Tipe": "ISIAN",
            "Soal": "Where is the JWST located in space? (Write the abbreviation only)",
            "Bacaan": wacana_inggris,
            "Gambar": "",
            "OpsiA": "", "OpsiB": "", "OpsiC": "", "OpsiD": "", "OpsiE": "",
            "Kunci": "L2",
            "Kesulitan": 2.0
        },
        {
            "Tipe": "PG KOMPLEKS",
            "Soal": "What are the goals of JWST mentioned in the text?",
            "Bacaan": wacana_inggris,
            "Gambar": "",
            "OpsiA": "Observing the first galaxies after the Big Bang.",
            "OpsiB": "Searching for biosignatures on exoplanets.",
            "OpsiC": "Traveling to Mars to find water.",
            "OpsiD": "Replacing the Hubble Telescope entirely.",
            "OpsiE": "Mapping the surface of the Moon.",
            "Kunci": "A,B",
            "Kesulitan": 2.0
        },
        {
            "Tipe": "TABEL",
            "Soal": "Determine if the statement is TRUE or FALSE based on the text:",
            "Bacaan": wacana_inggris,
            "Gambar": "",
            "OpsiA": "JWST is smaller than the Hubble Space Telescope.",
            "OpsiB": "JWST analyzes light passing through exoplanet atmospheres.",
            "OpsiC": "JWST orbits the Earth at a distance of 1.5 million km.",
            "OpsiD": "Methane and carbon dioxide are examples of biosignatures.",
            "OpsiE": "",
            "Kunci": "S,B,S,B",
            "Kesulitan": 2.5
        },

        # --- 9-14: Pengetahuan Kuantitatif & Penalaran Matematika ---
        {
            "Tipe": "ISIAN",
            "Soal": "Jika $f(x) = 2x^2 - 4x + 1$, tentukan nilai minimum dari fungsi tersebut. (Tulis angkanya saja)",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "", "OpsiB": "", "OpsiC": "", "OpsiD": "", "OpsiE": "",
            "Kunci": "-1",
            "Kesulitan": 2.0
        },
        {
            "Tipe": "PG",
            "Soal": "Perhatikan gambar lingkaran di samping. Jika jari-jari lingkaran adalah 7 cm, berapakah luas juring AOB jika sudut pusatnya 90 derajat?",
            "Bacaan": "",
            "Gambar": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Circle_sector_pi_over_2.svg/220px-Circle_sector_pi_over_2.svg.png",
            "OpsiA": "38.5 cm2",
            "OpsiB": "77 cm2",
            "OpsiC": "154 cm2",
            "OpsiD": "12.5 cm2",
            "OpsiE": "49 cm2",
            "Kunci": "A",
            "Kesulitan": 2.0
        },
        {
            "Tipe": "TABEL",
            "Soal": "Diberikan matriks A = [[2, 1], [0, 3]]. Tentukan kebenaran pernyataan berikut:",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "Determinan matriks A adalah 6.",
            "OpsiB": "Matriks A adalah matriks singular.",
            "OpsiC": "Trace dari matriks A adalah 5.",
            "OpsiD": "Invers matriks A tidak ada.",
            "OpsiE": "",
            "Kunci": "B,S,B,S",
            "Kesulitan": 2.5
        },
        {
            "Tipe": "PG",
            "Soal": "Himpunan penyelesaian dari pertidaksamaan $|2x - 1| < 5$ adalah...",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "-2 < x < 3",
            "OpsiB": "x < -2 atau x > 3",
            "OpsiC": "-3 < x < 2",
            "OpsiD": "x < 3",
            "OpsiE": "x > -2",
            "Kunci": "A",
            "Kesulitan": 2.0
        },
        {
            "Tipe": "ISIAN",
            "Soal": "Sebuah barisan aritmatika memiliki suku ke-3 = 11 dan suku ke-7 = 23. Berapakah suku ke-10?",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "", "OpsiB": "", "OpsiC": "", "OpsiD": "", "OpsiE": "",
            "Kunci": "32",
            "Kesulitan": 1.5
        },
        {
            "Tipe": "PG KOMPLEKS",
            "Soal": "Manakah dari fungsi berikut yang merupakan fungsi kuadrat yang terbuka ke bawah? (Pilih lebih dari satu)",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "$y = -x^2 + 2x$",
            "OpsiB": "$y = 2x^2 + 5$",
            "OpsiC": "$y = 5 - 3x^2$",
            "OpsiD": "$y = (x-1)^2$",
            "OpsiE": "$y = -2(x+1)^2 + 3$",
            "Kunci": "A,C,E",
            "Kesulitan": 2.0
        },

        # --- 15-17: Penalaran Umum (Logika) ---
        {
            "Tipe": "PG",
            "Soal": "Semua mamalia bernapas dengan paru-paru. Ikan paus adalah mamalia. Kesimpulan yang sah adalah...",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "Ikan paus bernapas dengan insang.",
            "OpsiB": "Ikan paus bernapas dengan paru-paru.",
            "OpsiC": "Semua yang bernapas dengan paru-paru adalah ikan paus.",
            "OpsiD": "Ikan paus bukan mamalia.",
            "OpsiE": "Tidak dapat ditarik kesimpulan.",
            "Kunci": "B",
            "Kesulitan": 1.0
        },
        {
            "Tipe": "TABEL",
            "Soal": "Analisis pola bilangan: 2, 5, 10, 17, ... Tentukan kebenaran pernyataan berikut:",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "Suku berikutnya adalah 26.",
            "OpsiB": "Rumus suku ke-n adalah $n^2 + 1$.",
            "OpsiC": "Suku ke-10 adalah 100.",
            "OpsiD": "Semua suku dalam barisan ini adalah bilangan ganjil.",
            "OpsiE": "",
            "Kunci": "B,B,S,S",
            "Kesulitan": 2.5
        },
        {
            "Tipe": "PG KOMPLEKS",
            "Soal": "Jika P = 'Hari ini hujan' dan Q = 'Saya membawa payung'. Manakah pernyataan yang senilai dengan 'Jika hari ini hujan, maka saya membawa payung'? (Pilih lebih dari satu)",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "Jika saya tidak membawa payung, maka hari ini tidak hujan.",
            "OpsiB": "Hari ini tidak hujan atau saya membawa payung.",
            "OpsiC": "Hari ini hujan dan saya tidak membawa payung.",
            "OpsiD": "Saya membawa payung maka hari ini hujan.",
            "OpsiE": "Tidak benar bahwa hari ini hujan dan saya tidak membawa payung.",
            "Kunci": "A,B,E",
            "Kesulitan": 3.0
        },

        # --- 18-20: Pengetahuan Umum / Lainnya ---
        {
            "Tipe": "ISIAN",
            "Soal": "Siapakah nama proklamator kemerdekaan Indonesia yang juga menjadi presiden pertama? (Tulis nama panggilan/umum)",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "", "OpsiB": "", "OpsiC": "", "OpsiD": "", "OpsiE": "",
            "Kunci": "Soekarno",
            "Kesulitan": 1.0
        },
        {
            "Tipe": "PG",
            "Soal": "Ibu kota baru Indonesia yang terletak di Kalimantan Timur bernama...",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "Nusantara",
            "OpsiB": "Kartanegara",
            "OpsiC": "Balikpapan",
            "OpsiD": "Samarinda",
            "OpsiE": "Penajam",
            "Kunci": "A",
            "Kesulitan": 1.0
        },
        {
            "Tipe": "TABEL",
            "Soal": "Tentukan kebenaran fakta geografi berikut:",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "Gunung Everest adalah gunung tertinggi di dunia.",
            "OpsiB": "Sungai Nil terletak di Benua Amerika.",
            "OpsiC": "Indonesia adalah negara kepulauan terbesar di dunia.",
            "OpsiD": "Tokyo adalah ibu kota Jepang.",
            "OpsiE": "",
            "Kunci": "B,S,B,B",
            "Kesulitan": 1.5
        }
    ]

    df = pd.DataFrame(data)
    filename = "template_soal_utbk_20_soal.xlsx"
    df.to_excel(filename, index=False)
    print(f"File '{filename}' berhasil dibuat!")

if __name__ == "__main__":
    create_full_utbk_dummy()