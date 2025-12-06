import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- KONEKSI SEMENTARA KE RAILWAY ---
# Kita hardcode URL ini AGAR script di laptop bisa "menembak" ke database online
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:GhjmdUrvVZJeEuzWKokkQrnGBXUsoxiM@switchyard.proxy.rlwy.net:12762/railway"

# Fix format URL (jika perlu)
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Buat Engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()