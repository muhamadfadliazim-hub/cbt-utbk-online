from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL")

# Mengatasi prefix 'postgres://' otomatis dari Railway
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# pool_pre_ping memastikan koneksi tidak mati saat booting
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True, 
    pool_recycle=300,
    connect_args={"sslmode": "require"} if "internal" not in str(DATABASE_URL) else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()