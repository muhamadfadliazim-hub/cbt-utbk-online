from database import engine, SessionLocal
from sqlalchemy import text
import models

def fix_config_table():
    print("Memperbarui Database dengan Tabel Config...")
    
    # 1. Buat Tabel Baru
    models.Base.metadata.create_all(bind=engine)
    
    # 2. Isi Default Value (Pengumuman Tertutup)
    db = SessionLocal()
    try:
        config = db.query(models.SystemConfig).filter_by(key="release_announcement").first()
        if not config:
            db.add(models.SystemConfig(key="release_announcement", value="false"))
            db.commit()
            print("✅ Tabel Config dibuat. Pengumuman default: TERTUTUP.")
        else:
            print("ℹ️ Tabel Config sudah ada.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_config_table()