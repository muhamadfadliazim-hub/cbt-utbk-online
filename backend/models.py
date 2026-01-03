from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)
    role = Column(String, default="student")
    # Fitur Premium/Jurusan
    target_major = Column(String, nullable=True) 
    results = relationship("ExamResult", back_populates="user")

class Material(Base): # <--- KEMBALIKAN FITUR LMS
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    category = Column(String) # UTBK / CPNS / MATERI UMUM
    content_type = Column(String) # VIDEO / PDF
    content_url = Column(String)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) 
    exam_type = Column(String) # UTBK, CPNS, TKA, TOEFL
    is_active = Column(Boolean, default=True)
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True, index=True) # ID Unik: P1_PU
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    code = Column(String) # PU, PK, TWK, LISTENING
    title = Column(String)
    duration = Column(Integer) # Menit
    passing_grade = Column(Float, default=0) # <--- Passing Grade
    period = relationship("ExamPeriod", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(String, ForeignKey("exams.id"))
    
    # KONTEN SOAL EXCEL
    q_type = Column(String, default="PG") # PG, KOMPLEKS, ISIAN, BS
    text = Column(Text) 
    wacana = Column(Text, nullable=True) # Bacaan Panjang
    image_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True) # Support TOEFL
    
    # OPSI JAWABAN (JSON agar support Tabel Benar/Salah)
    options_json = Column(JSON) 
    correct_answer = Column(String) 
    difficulty = Column(Integer, default=1) # Untuk IRT
    explanation = Column(Text, nullable=True) # Pembahasan
    
    exam = relationship("Exam", back_populates="questions")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    
    scores_detail = Column(JSON) # Disimpan per subtes
    total_score = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="results")