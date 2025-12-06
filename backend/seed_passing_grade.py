import pandas as pd
from database import SessionLocal, engine
import models
import os

# Pastikan tabel sudah ada
models.Base.metadata.create_all(bind=engine)

def seed_majors():
    db = SessionLocal()
    # Sesuaikan dengan nama file Excel yang ada di folder backend Anda
    file_path = "passing_grade.xlsx"

    if not os.path.exists(file_path):
        print(f"❌ Error: File '{file_path}' tidak ditemukan!")
        return

    try:
        print(f"Membaca file {file_path}...")
        df = pd.read_excel(file_path)
        
        # 1. Normalisasi Header (Huruf kecil & spasi jadi underscore)
        df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')
        print(f"Kolom ditemukan: {list(df.columns)}")

        # 2. Cari kolom secara fleksibel
        col_univ = next((c for c in df.columns if 'univ' in c), None)
        col_prodi = next((c for c in df.columns if 'prodi' in c or 'jurusan' in c), None)
        col_pg = next((c for c in df.columns if 'pass' in c or 'grade' in c), None)
        
        if not (col_univ and col_prodi and col_pg):
            print(f"❌ ERROR: Kolom tidak lengkap! Wajib ada: Universitas, Prodi, Passing Grade.")
            return

        count_new = 0
        count_update = 0

        for _, row in df.iterrows():
            univ_name = str(row[col_univ]).strip()
            jurusan_name = str(row[col_prodi]).strip()
            
            try:
                pg_val = float(row[col_pg])
            except:
                pg_val = 0.0

            # 3. Cek apakah Jurusan sudah ada di DB
            existing = db.query(models.Major).filter_by(
                university=univ_name, 
                name=jurusan_name
            ).first()

            if not existing:
                # BUAT BARU
                major = models.Major()
                major.university = univ_name
                major.name = jurusan_name
                major.passing_grade = pg_val
                
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