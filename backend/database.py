from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# GANTI NAMA DB AGAR TABLE DIBUAT ULANG DENGAN STRUKTUR V31
SQLALCHEMY_DATABASE_URL = "sqlite:///./eduprime_v33_final.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()