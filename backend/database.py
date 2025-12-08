import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- KONEKSI SEMENTARA KE RAILWAY ---
# Kita hardcode URL ini AGAR script di laptop bisa "menembak" ke database online
# TEMPEL URL RAILWAY DI SINI (PAKE TANDA KUTIP)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:12345@localhost:5300/utbk_db")

# Fix format URL (jika perlu)
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Buat Engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()