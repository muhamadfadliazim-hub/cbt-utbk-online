import pandas as pd
from database import SessionLocal, engine
import models

# Inisialisasi Database
models.Base.metadata.create_all(bind=engine)

def seed_majors():
    db = SessionLocal()
    try:
        print("Membaca file passing_grade.xlsx...")
        df = pd.read_excel("passing_grade.xlsx")
        
        # 1. Normalisasi Header (Huruf kecil & spasi jadi underscore)
        df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')
        
        print(f"Kolom ditemukan: {list(df.columns)}")

        # 2. Validasi Kolom (Sekarang mencari 'prodi', bukan 'jurusan')
        required = ['universitas', 'prodi', 'passing_grade']
        missing = [col for col in required if col not in df.columns]
        
        if missing:
            print(f"❌ ERROR: Kolom tidak lengkap! Hilang: {missing}")
            return

        count_new = 0
        count_update = 0

        for _, row in df.iterrows():
            univ_name = str(row['universitas']).strip()
            # PERBAIKAN: Membaca kolom 'prodi'
            jurusan_name = str(row['prodi']).strip() 
            pg_val = float(row['passing_grade'])

            # 3. Cek apakah Jurusan sudah ada di DB
            existing = db.query(models.Major).filter_by(
                university=univ_name, 
                name=jurusan_name
            ).first()

            if not existing:
                # BUAT BARU
                major = models.Major(
                    university=univ_name,
                    name=jurusan_name, # Simpan ke database sebagai 'name'
                    passing_grade=pg_val
                )
                db.add(major)
                count_new += 1
            else:
                # UPDATE PASSING GRADE
                existing.passing_grade = pg_val
                count_update += 1
        
        db.commit()
        print(f"✅ SELESAI! {count_new} jurusan baru, {count_update} diupdate.")
        
    except Exception as e:
        print(f"❌ Error System: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_majors()