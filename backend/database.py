from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ganti nama file .db menjadi v24_ultimate agar Railway membuat database baru yang fresh
SQLALCHEMY_DATABASE_URL = "sqlite:///./eduprime_v24_ultimate.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()