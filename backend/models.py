from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base

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
    role = Column(String, default="student")
    # Foreign key ke tabel majors (ID)
    choice1_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    results = relationship("ExamResult", back_populates="user", cascade="all, delete-orphan")

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    exam_type = Column(String)
    is_active = Column(Boolean, default=True)
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
    explanation = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
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
    user = relationship("User", back_populates="results")

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    type = Column(String)
    category = Column(String)
    content_url = Column(String)

class SystemConfig(Base):
    __tablename__ = "system_configs"
    key = Column(String, primary_key=True)
    value = Column(String)