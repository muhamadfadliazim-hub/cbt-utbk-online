from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# NAMA DB BARU: V54
SQLALCHEMY_DATABASE_URL = "sqlite:///./eduprime_v54_final.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()