from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
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
    full_name = Column(String)
    password = Column(String)
    role = Column(String, default="student")
    choice1_id = Column(Integer, ForeignKey("majors.id", ondelete="SET NULL"), nullable=True)
    choice2_id = Column(Integer, ForeignKey("majors.id", ondelete="SET NULL"), nullable=True)
    results = relationship("ExamResult", back_populates="user", cascade="all, delete")
    choice1 = relationship("Major", foreign_keys=[choice1_id])
    choice2 = relationship("Major", foreign_keys=[choice2_id])

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    type = Column(String) # pdf, video, link
    content_url = Column(String)
    category = Column(String) # UTBK, CPNS, MANDIRI
    description = Column(Text, nullable=True)

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) 
    is_active = Column(Boolean, default=False)
    allow_submit = Column(Boolean, default=True)
    is_random = Column(Boolean, default=True)
    is_flexible = Column(Boolean, default=False)
    exam_type = Column(String, default="UTBK") # UTBK, CPNS, MANDIRI
    allowed_usernames = Column(Text, nullable=True)
    exams = relationship("Exam", back_populates="period", cascade="all, delete")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True, index=True) 
    period_id = Column(Integer, ForeignKey("exam_periods.id", ondelete="CASCADE"))
    code = Column(String) 
    title = Column(String)
    description = Column(String)
    duration = Column(Float) 
    period = relationship("ExamPeriod", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(String, ForeignKey("exams.id", ondelete="CASCADE")) 
    text = Column(Text)
    type = Column(String) 
    reading_material = Column(Text, nullable=True)
    image_url = Column(String, nullable=True) # SUPPORT GAMBAR
    explanation = Column(Text, nullable=True) 
    label_true = Column(String, default="Benar") 
    label_false = Column(String, default="Salah") 
    reading_label = Column(String, nullable=True) 
    citation = Column(String, nullable=True)
    difficulty = Column(Float, default=1.0)
    total_attempts = Column(Integer, default=0)
    total_correct = Column(Integer, default=0)
    
    exam = relationship("Exam", back_populates="questions")
    options = relationship("Option", back_populates="question", cascade="all, delete")

class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"))
    label = Column(String)
    option_index = Column(String)
    is_math = Column(Boolean, default=False)
    is_correct = Column(Boolean, default=False)
    question = relationship("Question", back_populates="options")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    exam_id = Column(String, ForeignKey("exams.id", ondelete="CASCADE"))
    correct_count = Column(Integer, default=0)
    wrong_count = Column(Integer, default=0)
    irt_score = Column(Float, default=0.0)
    user = relationship("User", back_populates="results")