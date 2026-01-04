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
    # Group Code: Untuk membatasi akses (misal: "SMAN1", "UMUM")
    group_code = Column(String, default="GENERAL") 
    
    # Pilihan Jurusan
    choice1_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    choice2_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    
    results = relationship("ExamResult", back_populates="user")

class Major(Base):
    __tablename__ = "majors"
    id = Column(Integer, primary_key=True, index=True)
    university = Column(String)
    program = Column(String)
    passing_grade = Column(Float)

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    exam_type = Column(String) # UTBK, CPNS, TKA, MANDIRI
    # Access Code: Jika diisi, hanya user dengan group_code sama yang bisa lihat
    access_code = Column(String, nullable=True) 
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True) # ID Unik (misal: UTBK_PU)
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    title = Column(String)
    duration = Column(Integer) # Menit
    order_index = Column(Integer)
    period = relationship("ExamPeriod", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(String, ForeignKey("exams.id"))
    question_type = Column(String, default="PG") # PG, PG_KOMPLEKS, ISIAN, BOOLEAN
    text = Column(Text)
    passage_text = Column(Text, nullable=True)
    media_url = Column(String, nullable=True)
    explanation = Column(Text, nullable=True)
    difficulty = Column(Float, default=1.0) # Bobot Kesulitan untuk IRT
    correct_answer_isian = Column(String, nullable=True)
    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")
    exam = relationship("Exam", back_populates="questions")

class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    label = Column(Text)
    option_index = Column(String)
    is_correct = Column(Boolean, default=False)
    # Score Weight: Khusus CPNS TKP (1-5)
    score_weight = Column(Integer, default=0)
    boolean_val = Column(Boolean, nullable=True)
    question = relationship("Question", back_populates="options")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exam_id = Column(String)
    final_score = Column(Float) # Skor Akhir (IRT/Poin)
    correct_count = Column(Integer)
    answers_json = Column(JSON, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="results")

# LMS HIERARKI
class LMSFolder(Base):
    __tablename__ = "lms_folders"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) # Misal: "Pengetahuan Kuantitatif"
    category = Column(String) # UTBK, CPNS, TKA
    materials = relationship("Material", back_populates="folder", cascade="all, delete-orphan")

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    folder_id = Column(Integer, ForeignKey("lms_folders.id"))
    title = Column(String)
    type = Column(String) # video / pdf
    content_url = Column(String)
    folder = relationship("LMSFolder", back_populates="materials")