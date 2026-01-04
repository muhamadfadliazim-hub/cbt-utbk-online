from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SAYA GANTI NAMA DB JADI V50 AGAR STRUKTUR BARU (TKP, LMS FOLDER, DLL) TERBUAT OTOMATIS
SQLALCHEMY_DATABASE_URL = "sqlite:///./eduprime_v50_enterprise.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()