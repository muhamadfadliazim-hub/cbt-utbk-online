from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String) # Disimpan teks biasa sesuai request Excel Anda
    full_name = Column(String)
    role = Column(String, default="student") 
    results = relationship("ExamResult", back_populates="user")

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) 
    exam_type = Column(String) # UTBK, CPNS, KEDINASAN, TKA
    is_active = Column(Boolean, default=True)
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True, index=True) # P1_PU
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    code = Column(String) # PU, PK, TWK
    title = Column(String)
    duration = Column(Integer) # Menit
    period = relationship("ExamPeriod", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(String, ForeignKey("exams.id"))
    
    # KONTEN (Sesuai Excel Anda)
    q_type = Column(String, default="PG") # PG, KOMPLEKS, ISIAN, BS
    text = Column(Text) 
    wacana = Column(Text, nullable=True) # Bacaan
    image_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    
    # OPSI & KUNCI (JSON untuk fleksibilitas tipe soal)
    options_json = Column(JSON) # [{"label":"A", "text":"..."}, ...]
    correct_answer = Column(String) # Kunci Jawaban
    difficulty = Column(Integer, default=1) # Kesulitan untuk IRT
    explanation = Column(Text, nullable=True) # Pembahasan
    
    exam = relationship("Exam", back_populates="questions")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    
    # Hasil Analisis
    scores_detail = Column(JSON) # {"PU": 500, "PK": 600}
    total_score = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="results")