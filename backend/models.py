from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)
    role = Column(String, default="student") 
    
    # --- FITUR KOMERSIL ---
    is_premium = Column(Boolean, default=False)
    premium_until = Column(DateTime, nullable=True)
    phone_number = Column(String, nullable=True)
    
    # Relasi Pilihan Kampus
    choice1_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    choice2_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    
    choice1 = relationship("Major", foreign_keys=[choice1_id])
    choice2 = relationship("Major", foreign_keys=[choice2_id])
    results = relationship("ExamResult", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")

class Major(Base):
    __tablename__ = "majors"
    id = Column(Integer, primary_key=True, index=True)
    university = Column(String)
    name = Column(String)
    passing_grade = Column(Float)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True, index=True) # Order ID (misal: TRX-001)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    status = Column(String, default="pending") # pending, success, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    payment_method = Column(String, nullable=True)
    
    user = relationship("User", back_populates="transactions")

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    is_active = Column(Boolean, default=True)
    allow_submit = Column(Boolean, default=True)
    
    # Fitur Premium: Apakah paket ini berbayar?
    is_vip_only = Column(Boolean, default=False) 
    price = Column(Integer, default=0)
    
    banner_img = Column(String, nullable=True) # URL Gambar Banner
    exam_type = Column(String) 
    
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True, index=True)
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
    image_url = Column(String, nullable=True)
    
    # Pembahasan (LMS Feature)
    explanation = Column(Text, nullable=True)
    explanation_video_url = Column(String, nullable=True) 
    
    exam = relationship("Exam", back_populates="questions")
    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")

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
    exam_id = Column(String, ForeignKey("exams.id"))
    
    correct_count = Column(Integer)
    wrong_count = Column(Integer)
    irt_score = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="results")