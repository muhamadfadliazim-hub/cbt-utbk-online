from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)
    role = Column(String, default="peserta") 
    group_code = Column(String, default="GENERAL") 
    # Akses: Menyimpan ID Paket Ujian yang boleh diakses, misal "1,2,5" atau "ALL"
    allowed_exam_ids = Column(String, default="ALL") 
    
    choice1_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    choice2_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    results = relationship("ExamResult", back_populates="user")

class Major(Base):
    __tablename__ = "majors"
    id = Column(Integer, primary_key=True, index=True)
    university = Column(String); program = Column(String); passing_grade = Column(Float)

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    exam_type = Column(String) # UTBK, CPNS, TKA, MANDIRI
    show_result = Column(Boolean, default=True) # Tampilkan pembahasan setelah ujian?
    can_finish_early = Column(Boolean, default=True) # Boleh selesai sebelum waktu habis?
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True) # Misal: "UTBK_PU"
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    title = Column(String) # Misal: "Penalaran Umum"
    duration = Column(Integer) # Menit
    order_index = Column(Integer) # Urutan Subtes
    period = relationship("ExamPeriod", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(String, ForeignKey("exams.id"))
    question_type = Column(String, default="PG") # PG, PG_KOMPLEKS, ISIAN, BOOLEAN, TKP
    text = Column(Text) # Soal
    passage_text = Column(Text, nullable=True) # Wacana (Bacaan)
    media_url = Column(String, nullable=True) # Gambar
    explanation = Column(Text, nullable=True) # Pembahasan
    difficulty = Column(Float, default=1.0)
    correct_answer_isian = Column(String, nullable=True) # Kunci untuk Isian Singkat
    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")
    exam = relationship("Exam", back_populates="questions")

class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    label = Column(Text) # Teks Opsi
    option_index = Column(String) # A, B, C / Baris 1, Baris 2 (untuk Tabel)
    is_correct = Column(Boolean, default=False)
    score_weight = Column(Integer, default=0) # Poin (TKP 1-5, PG 5/0)
    boolean_val = Column(Boolean, nullable=True) # True=Benar, False=Salah (Untuk Tabel B/S)
    question = relationship("Question", back_populates="options")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exam_id = Column(String); final_score = Column(Float); correct_count = Column(Integer)
    answers_json = Column(JSON, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="results")

class LMSFolder(Base):
    __tablename__ = "lms_folders"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) # Nama Folder Materi
    category = Column(String) # UTBK, CPNS
    subcategory = Column(String) # PU, PK, TIU, dll
    materials = relationship("Material", back_populates="folder", cascade="all, delete-orphan")

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    folder_id = Column(Integer, ForeignKey("lms_folders.id"))
    title = Column(String); type = Column(String); content_url = Column(String)
    folder = relationship("LMSFolder", back_populates="materials")