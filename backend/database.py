import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Ambil URL Database dari Environment Variable (Railway)
# Jika tidak ada (Lokal), baru pakai localhost
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback untuk di laptop Anda (Lokal)
    DATABASE_URL = "postgresql://postgres:12345@localhost:5300/utbk_db"

# 2. Fix Khusus Railway: SQLAlchemy butuh "postgresql://", tapi Railway kadang kasih "postgres://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 3. Buat Engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()