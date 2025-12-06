import pandas as pd

def create_template():
    data = [
        {
            "Tipe": "PG",
            "Soal": "Berdasarkan teks di samping, apa dampak utama dari fenomena Urban Heat Island bagi penduduk kota?",
            "Bacaan": "Fenomena Pulau Bahang Perkotaan atau Urban Heat Island (UHI) adalah kondisi di mana wilayah metropolitan memiliki suhu yang jauh lebih hangat dibandingkan wilayah pedesaan di sekitarnya. Perbedaan suhu ini paling terasa pada malam hari dan saat angin lemah. Penyebab utama UHI adalah modifikasi permukaan tanah akibat pembangunan kota yang menggunakan material penahan panas seperti aspal dan beton. Selain itu, panas buangan dari penggunaan energi, seperti AC dan kendaraan bermotor, turut berkontribusi. Dampak UHI sangat luas, mulai dari peningkatan konsumsi energi untuk pendingin ruangan, peningkatan emisi gas rumah kaca, hingga gangguan kesehatan. Bagi penduduk, suhu yang lebih tinggi dapat memperburuk kualitas udara karena mempercepat pembentukan ozon di permukaan tanah (smog), yang berbahaya bagi penderita asma dan gangguan pernapasan lainnya.",
            "Gambar": "",
            "OpsiA": "Meningkatnya konsumsi energi listrik secara drastis di malam hari.",
            "OpsiB": "Penurunan kualitas udara dan peningkatan risiko gangguan kesehatan pernapasan.",
            "OpsiC": "Berkurangnya curah hujan di wilayah perkotaan dibandingkan pedesaan.",
            "OpsiD": "Meningkatnya keanekaragaman hayati di taman-taman kota.",
            "OpsiE": "Penurunan suhu rata-rata tahunan di pusat kota.",
            "Kunci": "B",
            "Kesulitan": 2.0
        },
        {
            "Tipe": "TABEL",
            "Soal": "Sebuah toko kue menjual dua jenis paket. Paket A berisi 3 donat dan 2 susu seharga Rp25.000. Paket B berisi 4 donat dan 3 susu seharga Rp36.000. Tentukan nilai kebenaran pernyataan berikut!",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "Harga satu buah donat adalah Rp3.000.",
            "OpsiB": "Harga satu susu adalah Rp8.000.",
            "OpsiC": "Harga 1 donat dan 1 susu adalah Rp11.000.",
            "OpsiD": "Paket B lebih murah per itemnya dibandingkan Paket A.",
            "OpsiE": "",
            "Kunci": "B,B,B,S",
            "Kesulitan": 2.5
        },
        {
            "Tipe": "ISIAN",
            "Soal": "Perhatikan gambar segitiga di atas. Jika panjang alas adalah 12 cm dan tinggi adalah 5 cm, berapakah keliling segitiga tersebut jika segitiga tersebut siku-siku? (Tulis angkanya saja)",
            "Bacaan": "",
            "Gambar": "https://upload.wikimedia.org/wikipedia/commons/4/49/Triangle-right.svg", # Contoh Link Gambar
            "OpsiA": "",
            "OpsiB": "",
            "OpsiC": "",
            "OpsiD": "",
            "OpsiE": "",
            "Kunci": "30",
            "Kesulitan": 1.5
        },
        {
            "Tipe": "PG KOMPLEKS",
            "Soal": "Manakah di antara pilihan berikut yang merupakan negara pendiri ASEAN? (Jawaban bisa lebih dari satu)",
            "Bacaan": "",
            "Gambar": "",
            "OpsiA": "Indonesia",
            "OpsiB": "Vietnam",
            "OpsiC": "Filipina",
            "OpsiD": "Brunei Darussalam",
            "OpsiE": "Singapura",
            "Kunci": "A,C,E",
            "Kesulitan": 1.0
        }
    ]

    df = pd.DataFrame(data)
    filename = "template_soal_utbk_real.xlsx"
    df.to_excel(filename, index=False)
    print(f"✅ Berhasil! File '{filename}' telah dibuat. Silakan gunakan untuk upload.")

if __name__ == "__main__":
    create_template()