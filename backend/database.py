import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Ambil URL Database
DATABASE_URL = os.getenv("DATABASE_URL")

# 2. Fallback ke Localhost (Hanya jika tidak ada env variable)
if not DATABASE_URL:
    print("⚠️ WARNING: Menggunakan Database Lokal (Development Mode)")
    DATABASE_URL = "postgresql://postgres:12345@localhost:5300/utbk_db"
else:
    print("✅ SUCCESS: Menggunakan Database Cloud (Railway)")

# 3. Fix Khusus Railway (postgres:// -> postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
except Exception as e:
    print(f"❌ CRITICAL ERROR: Gagal koneksi ke database. {e}")
    sys.exit(1)