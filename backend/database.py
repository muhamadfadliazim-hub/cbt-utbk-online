from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 1. Ambil URL dari Railway
DATABASE_URL = os.getenv("DATABASE_URL")

# --- DEBUGGER: Menampilkan URL di log agar kita tahu isinya ---
if not DATABASE_URL:
    print("CRITICAL ERROR: DATABASE_URL tidak terbaca! Pastikan sudah setting di Variables.")
    # Fallback ke SQLite agar aplikasi tidak langsung crash
    DATABASE_URL = "sqlite:///./test.db"
else:
    print(f"DATABASE_URL Terdeteksi: {DATABASE_URL[:15]}...") # Hanya tampilkan depannya saja demi keamanan

# 2. Fix untuk format PostgreSQL di Railway
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 3. Konfigurasi Engine
if "sqlite" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()