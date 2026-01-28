from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)
    role = Column(String, default="student") 
    school = Column(String, nullable=True) # Kolom Baru: Asal Sekolah/Cabang
    
    choice1_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    choice2_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    
    results = relationship("ExamResult", back_populates="user")
    choice1 = relationship("Major", foreign_keys=[choice1_id])
    choice2 = relationship("Major", foreign_keys=[choice2_id])

class Major(Base):
    __tablename__ = "majors"
    id = Column(Integer, primary_key=True, index=True)
    university = Column(String)
    name = Column(String)
    passing_grade = Column(Float)

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    exam_type = Column(String)
    is_active = Column(Boolean, default=False)
    allowed_usernames = Column(Text, nullable=True) 
    target_schools = Column(Text, nullable=True) # Kolom Baru: Filter Sekolah (misal: "Darul Iman,Fajrul Karim")
    
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True) 
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    code = Column(String) 
    title = Column(String)
    duration = Column(Integer) 
    
    period = relationship("ExamPeriod", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(String, ForeignKey("exams.id"))
    text = Column(Text) 
    type = Column(String, default="multiple_choice") 
    difficulty = Column(Float, default=1.0)
    
    image_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    reading_material = Column(Text, nullable=True) 
    explanation = Column(Text, nullable=True)     
    
    # Fitur Baru: Label Tabel (Benar/Salah atau Ya/Tidak)
    label1 = Column(String, default="Benar") 
    label2 = Column(String, default="Salah")

    # Fitur Baru: Analisis Butir Soal
    stats_correct = Column(Integer, default=0) # Jumlah siswa yang menjawab benar
    stats_total = Column(Integer, default=0)   # Total siswa yang menjawab soal ini
    
    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")
    exam = relationship("Exam", back_populates="questions")

class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    label = Column(Text) 
    option_index = Column(String) 
    is_correct = Column(Boolean, default=False)
    
    question = relationship("Question", back_populates="options")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exam_id = Column(String)
    correct_count = Column(Integer)
    wrong_count = Column(Integer)
    irt_score = Column(Float) 
    timestamp = Column(String, nullable=True)
    
    user = relationship("User", back_populates="results")

class SystemConfig(Base):
    __tablename__ = "system_configs"
    key = Column(String, primary_key=True)
    value = Column(String)