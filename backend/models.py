from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Major(Base):
    __tablename__ = "majors"
    id = Column(Integer, primary_key=True, index=True)
    university = Column(String) # Kolom: Universitas
    program = Column(String)    # Kolom: Prodi
    passing_grade = Column(Float) # Kolom: Passing_Grade

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True) # Kolom: username
    password = Column(String) # Kolom: password
    full_name = Column(String) # Kolom: full_name
    role = Column(String, default="student") # Kolom: role
    
    # Pilihan Jurusan Siswa
    choice1_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    choice2_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    
    results = relationship("ExamResult", back_populates="user", cascade="all, delete-orphan")

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) # Nama Paket (misal: TO Akbar 1)
    exam_type = Column(String) # UTBK / CPNS / TKA
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True) # ID Unik: P1_PU
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    title = Column(String) # Judul Subtes (Penalaran Umum)
    duration = Column(Integer)
    order_index = Column(Integer) # Urutan Pengerjaan (Blocking Time)
    
    period = relationship("ExamPeriod", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(String, ForeignKey("exams.id"))
    
    # SESUAI HEADER EXCEL BAPAK
    question_type = Column(String, default="PG") # Kolom: Tipe
    text = Column(Text) # Kolom: Soal
    passage_text = Column(Text, nullable=True) # Kolom: Bacaan
    media_url = Column(String, nullable=True) # Kolom: Gambar / Audio
    explanation = Column(Text, nullable=True) # Kolom: Pembahasan
    difficulty = Column(Float, default=1.0) # Kolom: Kesulitan
    
    correct_answer_isian = Column(String, nullable=True) # Kolom: Kunci (untuk Isian)

    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")
    exam = relationship("Exam", back_populates="questions")

class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    label = Column(Text) # Isi Opsi
    option_index = Column(String) # A, B, C, D, E
    is_correct = Column(Boolean, default=False)
    question = relationship("Question", back_populates="options")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exam_id = Column(String)
    irt_score = Column(Float)
    correct_count = Column(Integer)
    wrong_count = Column(Integer)
    answers_json = Column(JSON, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="results")

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String); type = Column(String); category = Column(String); content_url = Column(String)