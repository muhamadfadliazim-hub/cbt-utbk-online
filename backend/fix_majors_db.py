from database import engine
from sqlalchemy import text

def fix_majors_table():
    print("Sedang memperbaiki struktur tabel 'majors'...")
    
    with engine.connect() as connection:
        try:
            with connection.begin():
                # 1. Tambah Kolom UNIVERSITY
                connection.execute(text("ALTER TABLE majors ADD COLUMN IF NOT EXISTS university VARCHAR"))
                
                # 2. Tambah Kolom NAME (Jurusan)
                connection.execute(text("ALTER TABLE majors ADD COLUMN IF NOT EXISTS name VARCHAR"))
                
                # 3. Tambah Kolom PASSING_GRADE
                connection.execute(text("ALTER TABLE majors ADD COLUMN IF NOT EXISTS passing_grade FLOAT"))
                
            print("✅ BERHASIL! Tabel 'majors' sudah diperbaiki.")
            
        except Exception as e:
            print(f"❌ Gagal: {e}")

if __name__ == "__main__":
    fix_majors_table()