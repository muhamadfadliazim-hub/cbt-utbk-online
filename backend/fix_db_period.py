from database import engine, SessionLocal
import models # Pastikan ini diimport agar Base.metadata mengenali tabel
from sqlalchemy import text

def reset_exam_tables():
    print("🔄 MEMULAI RESET DATABASE...")
    
    # 1. HAPUS SEMUA TABEL
    # Kita gunakan metadata.drop_all yang aman
    print("   - Menghapus tabel lama...")
    models.Base.metadata.drop_all(bind=engine)
    print("✅ Tabel lama dihapus.")

    # 2. BUAT ULANG TABEL
    print("   - Membuat tabel baru...")
    models.Base.metadata.create_all(bind=engine)
    print("✅ Struktur tabel berhasil dibuat.")

    # 3. ISI DATA AWAL (SEEDING)
    print("   - Mengisi data Admin...")
    db = SessionLocal()
    try:
        # Cara paling aman membuat object (menghindari error TypeError keyword)
        # Kita buat object kosong dulu, baru isi atributnya
        admin = models.User()
        admin.username = "admin"
        admin.password = "123"
        admin.full_name = "Super Admin"
        admin.role = "admin"
        
        db.add(admin)

        # Config Pengumuman
        config = models.SystemConfig()
        config.key = "release_announcement"
        config.value = "false"
        
        db.add(config)
        
        db.commit()
        print("✅ SUKSES! Data Admin (admin/123) dan Config berhasil dibuat.")
        
    except Exception as e:
        print(f"❌ Error saat seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_exam_tables()