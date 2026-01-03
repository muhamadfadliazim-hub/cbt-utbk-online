from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class SystemConfig(Base):
    __tablename__ = "system_config"
    key = Column(String, primary_key=True, index=True)
    value = Column(String)

class Major(Base):
    __tablename__ = "majors"
    id = Column(Integer, primary_key=True, index=True)
    university = Column(String)
    name = Column(String)
    passing_grade = Column(Float)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)
    role = Column(String, default="student") # student / admin
    
    choice1_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    choice2_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    
    choice1 = relationship("Major", foreign_keys=[choice1_id])
    choice2 = relationship("Major", foreign_keys=[choice2_id])
    results = relationship("ExamResult", back_populates="user")

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    is_active = Column(Boolean, default=True)
    allow_submit = Column(Boolean, default=True)
    is_random = Column(Boolean, default=True)
    is_flexible = Column(Boolean, default=False)
    allowed_usernames = Column(Text, nullable=True)
    exam_type = Column(String, default="UTBK") # UTBK, CPNS, KEDINASAN, dll
    
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True, index=True) # Format: P1_PU (PeriodId_Code)
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    code = Column(String) # PU, PBM, TWK, dll
    title = Column(String)
    description = Column(String)
    duration = Column(Integer) # Menit
    
    period = relationship("ExamPeriod", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(String, ForeignKey("exams.id"))
    text = Column(Text)
    type = Column(String) # multiple_choice, complex, short_answer, table_boolean
    difficulty = Column(Float, default=1.0)
    
    reading_material = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    
    image_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)  # <--- KOLOM BARU YANG SEBELUMNYA HILANG
    
    label_true = Column(String, default="Benar")
    label_false = Column(String, default="Salah")
    
    # Statistik Soal (Untuk Analisis)
    total_correct = Column(Integer, default=0)
    total_attempts = Column(Integer, default=0)

    exam = relationship("Exam", back_populates="questions")
    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")

class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    label = Column(Text)
    option_index = Column(String) # A, B, C, D, E atau 1, 2, 3 (untuk tabel)
    is_correct = Column(Boolean, default=False)
    
    question = relationship("Question", back_populates="options")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exam_id = Column(String, ForeignKey("exams.id"))
    
    correct_count = Column(Integer)
    wrong_count = Column(Integer)
    irt_score = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="results")

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    type = Column(String) # pdf, video, link
    content_url = Column(String)
    category = Column(String) # UTBK, CPNS, etc
    description = Column(Text, nullable=True)