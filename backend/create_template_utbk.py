import pandas as pd

def create_utbk_template():
    # 1. Definisikan Wacana Panjang (Literasi Bahasa Indonesia/Inggris)
    #    Sumber wacana disimulasikan mirip teks saintifik UTBK.
    wacana_literasi = """Fenomena 'Urban Heat Island' (UHI) atau Pulau Bahang Perkotaan adalah kondisi di mana wilayah metropolitan memiliki suhu yang jauh lebih hangat dibandingkan wilayah pedesaan di sekitarnya. Perbedaan suhu ini paling terasa pada malam hari dan saat angin lemah. Penyebab utama UHI adalah modifikasi permukaan tanah akibat pembangunan kota yang menggunakan material penahan panas seperti aspal dan beton.

Selain itu, panas buangan dari penggunaan energi, seperti AC dan kendaraan bermotor, turut berkontribusi. Dampak UHI sangat luas, mulai dari peningkatan konsumsi energi untuk pendingin ruangan, peningkatan emisi gas rumah kaca, hingga gangguan kesehatan. Bagi penduduk, suhu yang lebih tinggi dapat memperburuk kualitas udara karena mempercepat pembentukan ozon di permukaan tanah (smog), yang berbahaya bagi penderita asma dan gangguan pernapasan lainnya."""

    # 2. Definisikan Data Soal
    data = [
        # --- SOAL 1: LITERASI BAHASA INDONESIA (Pilihan Ganda Biasa + Wacana) ---
        {
            "Tipe": "PG",
            "Soal": "Berdasarkan teks di samping, manakah pernyataan yang PALING TEPAT mengenai penyebab utama terjadinya Urban Heat Island?",
            "Bacaan": wacana_literasi,  # Wacana dimasukkan ke sini
            "Gambar": "",
            "OpsiA": "Peningkatkan curah hujan yang ekstrem di wilayah pedesaan.",
            "OpsiB": "Penggunaan material bangunan seperti aspal dan beton yang menahan panas.",
            "OpsiC": "Kurangnya penggunaan pendingin ruangan (AC) di gedung-gedung tinggi.",
            "OpsiD": "Adanya angin kencang yang membawa hawa panas dari laut ke darat.",
            "OpsiE": "Penurunan emisi gas rumah kaca di pusat kota metropolitan.",
            "Kunci": "B",
            "Kesulitan": 2.0
        },

        # --- SOAL 2: PENALARAN MATEMATIKA (Tabel Benar/Salah) ---
        #    Format: Opsi A, B, C, D berisi pernyataan. Kunci berisi urutan jawaban B (Benar) atau S (Salah).
        {
            "Tipe": "TABEL",
            "Soal": "Sebuah toko sembako menjual paket sembako murah. Paket A berisi 2 kg beras dan 1 liter minyak seharga Rp45.000. Paket B berisi 3 kg beras dan 2 liter minyak seharga Rp75.000. Tentukan nilai kebenaran dari pernyataan berikut berdasarkan informasi tersebut!",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "Harga 1 kg beras adalah Rp10.000.",
            "OpsiB": "Harga 1 liter minyak adalah Rp20.000.",
            "OpsiC": "Harga paket jika membeli 1 kg beras dan 1 liter minyak adalah Rp35.000.",
            "OpsiD": "Paket A lebih mahal per unit barangnya dibandingkan Paket B.",
            "OpsiE": "", # Kosong jika hanya 4 pernyataan
            "Kunci": "S,S,S,B", # Kunci jawaban berurutan untuk Opsi A, B, C, D
            "Kesulitan": 3.0
        },

        # --- SOAL 3: PENGETAHUAN KUANTITATIF (Isian Singkat + Gambar) ---
        #    Kunci jawaban hanya angka.
        {
            "Tipe": "ISIAN",
            "Soal": "Perhatikan gambar segitiga siku-siku di atas. Jika panjang sisi alas (a) adalah 5 cm dan sisi miring (c) adalah 13 cm, berapakah luas segitiga tersebut dalam cm²? (Tulis angkanya saja)",
            "Bacaan": "",
            "Gambar": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Triangle.Right.svg/220px-Triangle.Right.svg.png", # Contoh URL Gambar
            "OpsiA": "",
            "OpsiB": "",
            "OpsiC": "",
            "OpsiD": "",
            "OpsiE": "",
            "Kunci": "30", # Luas = 0.5 * 5 * 12 = 30
            "Kesulitan": 2.0
        },

        # --- SOAL 4: PENGETAHUAN UMUM (Pilihan Ganda Kompleks) ---
        #    Jawaban lebih dari satu, dipisah koma.
        {
            "Tipe": "PG KOMPLEKS",
            "Soal": "Manakah di antara pilihan berikut yang merupakan dampak negatif langsung dari pemanasan global? (Jawaban bisa lebih dari satu)",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "Mencairnya es di kutub.",
            "OpsiB": "Menurunnya permukaan air laut.",
            "OpsiC": "Perubahan pola cuaca yang ekstrem.",
            "OpsiD": "Meningkatnya populasi beruang kutub.",
            "OpsiE": "Hilangnya beberapa pulau kecil.",
            "Kunci": "A,C,E", # Kunci jawaban majemuk
            "Kesulitan": 1.5
        }
    ]

    # 3. Membuat DataFrame dan Export ke Excel
    df = pd.DataFrame(data)
    
    # Mengatur urutan kolom agar rapi saat dibuka admin
    column_order = [
        "Tipe", "Soal", "Bacaan", "Gambar", 
        "OpsiA", "OpsiB", "OpsiC", "OpsiD", "OpsiE", 
        "Kunci", "Kesulitan"
    ]
    df = df[column_order]

    filename = "template_soal_utbk_real.xlsx"
    
    # Menggunakan engine 'openpyxl' untuk format .xlsx
    try:
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Bank Soal')
        print(f"✅ BERHASIL! File '{filename}' telah dibuat.")
        print("   Silakan upload file ini melalui Dashboard Admin -> Manajemen Soal.")
    except Exception as e:
        print(f"❌ Gagal membuat file: {e}")

if __name__ == "__main__":
    create_utbk_template()