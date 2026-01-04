from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ganti 'muhamadfadliazim' dan '12345' sesuai settingan PostgreSQL Anda tadi
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:12345@localhost:5300/utbk_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()