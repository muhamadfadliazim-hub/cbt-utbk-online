from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 1. Ambil URL Database. Jika tidak ada (di laptop), pakai SQLite lokal.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local_cbt.db")

# 2. Fix untuk Railway: Ubah 'postgres://' menjadi 'postgresql://' agar terbaca SQLAlchemy
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 3. Konfigurasi Engine
if "sqlite" in DATABASE_URL:
    # Konfigurasi khusus SQLite (Laptop)
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    # Konfigurasi khusus Postgres (Railway) - "Pool Pre-Ping" mencegah error koneksi putus
    engine = create_engine(
        DATABASE_URL, 
        pool_pre_ping=True, 
        pool_recycle=300,
        pool_size=5,
        max_overflow=10
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()