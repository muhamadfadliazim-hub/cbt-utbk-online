from database import engine
from sqlalchemy import text

def fix_users_table():
    print("Sedang memperbaiki struktur tabel 'users'...")
    
    with engine.connect() as connection:
        try:
            with connection.begin():
                # 1. Tambah kolom choice1_id (Foreign Key ke majors.id)
                connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS choice1_id INTEGER REFERENCES majors(id)"))
                
                # 2. Tambah kolom choice2_id (Foreign Key ke majors.id)
                connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS choice2_id INTEGER REFERENCES majors(id)"))
                
            print("✅ BERHASIL! Kolom 'choice1_id' dan 'choice2_id' telah ditambahkan ke tabel users.")
            
        except Exception as e:
            print(f"❌ Gagal: {e}")

if __name__ == "__main__":
    fix_users_table()