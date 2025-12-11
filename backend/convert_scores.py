from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
import os

# --- PENTING: GANTI INI DENGAN URL DATABASE RAILWAY ANDA ---
# Cara dapat URL: Buka Dashboard Railway -> Klik PostgreSQL -> Tab Variables -> Copy value DATABASE_URL
# Contoh: "postgresql://postgres:passwordpanjang@roundhouse.proxy.rlwy.net:12345/railway"
DATABASE_URL = "postgresql://postgres:GhjmdUrvVZJeEuzWKokkQrnGBXUsoxiM@switchyard.proxy.rlwy.net:12762/railway"

# Setup Koneksi ke Database
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def convert_scores():
    print("🔄 Memulai Konversi Nilai Lama ke Skala 200-1000...")
    
    # Ambil semua data hasil ujian
    results = db.query(models.ExamResult).all()
    count = 0
    
    for r in results:
        # Hitung total soal yang dikerjakan
        total_soal = r.correct_count + r.wrong_count
        
        if total_soal > 0:
            # RUMUS BARU:
            # Nilai Minimal = 200
            # Nilai Maksimal = 1000
            # Range = 800
            ratio = r.correct_count / total_soal
            new_score = 200 + (ratio * 800)
            
            # Update nilai di database
            r.irt_score = round(new_score, 2)
            count += 1
            print(f"✅ User {r.user_id} | Exam {r.exam_id} | Benar {r.correct_count}/{total_soal} -> Skor Baru: {r.irt_score}")
            
    db.commit()
    print(f"\n🎉 SELESAI! {count} data nilai berhasil diperbarui.")

if __name__ == "__main__":
    try:
        convert_scores()
    except Exception as e:
        print(f"\n❌ TERJADI ERROR: {e}")
        print("Pastikan URL Database Railway sudah benar dan koneksi internet stabil.")
    finally:
        db.close()