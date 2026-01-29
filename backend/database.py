from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# --- KONEKSI DATABASE CERDAS ---
# 1. Cek Variabel Railway. Jika kosong, gunakan SQLite lokal.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local_cbt.db")

# 2. Fix Format PostgreSQL Railway (postgres:// -> postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 3. Konfigurasi Mesin Database
if "sqlite" in DATABASE_URL:
    # Mode Lokal (Laptop)
    print("STATUS: Menggunakan Database Lokal (SQLite)")
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    # Mode Produksi (Railway) - Dengan Pengaman Koneksi Putus
    print("STATUS: Menggunakan Database Railway (PostgreSQL)")
    engine = create_engine(
        DATABASE_URL, 
        pool_pre_ping=True,    # Cek koneksi sebelum dipakai
        pool_recycle=300,      # Daur ulang koneksi tiap 5 menit
        pool_size=10,          # Maksimal 10 koneksi stanby
        max_overflow=20        # Maksimal 20 koneksi tambahan jika sibuk
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()