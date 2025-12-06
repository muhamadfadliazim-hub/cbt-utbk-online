from database import engine
from sqlalchemy import text

def add_column():
    print("Sedang memperbaiki database...")
    with engine.connect() as connection:
        try:
            # Perintah SQL untuk menambahkan kolom irt_score secara manual
            # Menggunakan transaksi commit agar perubahan disimpan
            with connection.begin():
                connection.execute(text("ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS irt_score FLOAT DEFAULT 0"))
            print("BERHASIL! Kolom 'irt_score' telah ditambahkan.")
        except Exception as e:
            print(f"Gagal: {e}")

if __name__ == "__main__":
    add_column()