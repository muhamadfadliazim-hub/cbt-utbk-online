from database import engine, SessionLocal
import models
from sqlalchemy import text
import sys

def reset_exam_tables():
    print("🔄 MEMULAI RESET DATABASE TOTAL...")
    
    # 1. Paksa Drop Semua Tabel (Metode Kasar tapi Ampuh untuk Reset)
    # Urutan penting untuk menghindari FK constraint error
    tables = ["exam_results", "options", "questions", "exams", "exam_periods", "users", "majors", "system_config"]
    
    with engine.connect() as conn:
        with conn.begin():
            for t in tables:
                conn.execute(text(f"DROP TABLE IF EXISTS {t} CASCADE"))
    
    print("✅ Semua tabel lama berhasil dimusnahkan.")

    # 2. Buat Ulang Tabel dari Models
    models.Base.metadata.create_all(bind=engine)
    print("✅ Struktur tabel baru berhasil dibuat.")

    # 3. Seed Data Awal (Admin & Config)
    db = SessionLocal()
    try:
        print("🌱 Seeding Data Awal...")
        
        # Buat Admin (Cara Explicit)
        admin = models.User()
        admin.username = "admin"
        admin.password = "123"
        admin.full_name = "Super Admin"
        admin.role = "admin"
        db.add(admin)

        # Buat Config
        config = models.SystemConfig()
        config.key = "release_announcement"
        config.value = "false"
        db.add(config)
        
        db.commit()
        print("✅ SUKSES! Admin (admin/123) berhasil dibuat.")
        
    except Exception as e:
        print(f"❌ Error saat seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_exam_tables()