import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Cek apakah ada environment variable DATABASE_URL (Otomatis ada di Railway)
# Jika tidak ada, fallback ke SQLite (untuk lokal)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cbt_system.db")

# Fix untuk URL Postgres di SQLAlchemy (Railway kadang pakai postgres://, harus postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Konfigurasi Engine
if "sqlite" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Konfigurasi untuk PostgreSQL
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()