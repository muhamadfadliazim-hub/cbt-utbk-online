from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

# --- PASTE URL DATABASE RAILWAY ANDA DI SINI ---
# Contoh: postgresql://postgres:password@roundhouse.proxy.rlwy.net:12345/railway
DATABASE_URL = "postgresql://postgres:GhjmdUrvVZJeEuzWKokkQrnGBXUsoxiM@switchyard.proxy.rlwy.net:12762/railway"

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def add_column():
    print("🛠️ Sedang menambahkan kolom 'wrong_list' ke tabel 'exam_results'...")
    try:
        # Perintah SQL untuk menambah kolom tanpa menghapus data
        sql = text("ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS wrong_list TEXT;")
        db.execute(sql)
        db.commit()
        print("✅ SUKSES! Kolom berhasil ditambahkan. Data lama AMAN.")
    except Exception as e:
        print(f"❌ Gagal: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_column()