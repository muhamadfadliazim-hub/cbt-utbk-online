from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import models, database
import os, uuid, json

# SETUP
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)

app = FastAPI()
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# AUTO-REPAIR DB
@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    if not db.query(models.User).filter_by(username="admin").first():
        # Admin Default
        db.add(models.User(username="admin", password="123", full_name="Super Admin", role="admin", is_premium=True))
        db.commit()
    db.close()

# --- SCHEMAS ---
class LoginSchema(BaseModel): username: str; password: str
class PeriodCreateSchema(BaseModel): 
    name: str
    exam_type: str # Nilainya harus: 'UTBK', 'CPNS', 'KEDINASAN'
    is_vip: bool = False
class QuestionCreateSchema(BaseModel): 
    text: str; options: List[str]; correct_option: str; explanation: str = ""
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str

# --- ENDPOINTS UTAMA ---

@app.post("/login")
def login(d: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=d.username).first()
    if not user or user.password != d.password: raise HTTPException(400, "Login Gagal")
    return user

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).order_by(models.ExamPeriod.id.desc()).all()

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    # 1. Buat Periode
    p = models.ExamPeriod(
        name=d.name, 
        exam_type=d.exam_type, 
        is_vip_only=d.is_vip,
        is_active=True
    )
    db.add(p); db.commit(); db.refresh(p)
    
    # 2. LOGIKA PENENTUAN SUBTES (FIXED & LENGKAP)
    struct = []
    
    # Normalisasi string (jaga-jaga kalau frontend kirim huruf kecil)
    tipe = d.exam_type.upper().strip()

    if "CPNS" in tipe or "KEDINASAN" in tipe:
        # Standar SKD BKN
        struct = [
            ("TWK", 30, "Tes Wawasan Kebangsaan"), 
            ("TIU", 35, "Tes Intelegensia Umum"), 
            ("TKP", 45, "Tes Karakteristik Pribadi")
        ]
    elif "UTBK" in tipe or "SNBT" in tipe:
        # Standar SNBT 2024 (7 Subtes)
        struct = [
            ("PU", 30, "Penalaran Umum"),
            ("PBM", 20, "Pemahaman Bacaan & Menulis"),
            ("PPU", 20, "Pengetahuan & Pemahaman Umum"),
            ("PK", 20, "Pengetahuan Kuantitatif"),
            ("LBI", 30, "Literasi B.Indonesia"),
            ("LBE", 30, "Literasi B.Inggris"),
            ("PM", 20, "Penalaran Matematika")
        ]
    elif "TKA_SMA" in tipe:
        struct = [
            ("MAT", 40, "Matematika Saintek"), 
            ("FIS", 40, "Fisika"), 
            ("KIM", 40, "Kimia"), 
            ("BIO", 40, "Biologi")
        ]
    else:
        # Fallback Darurat
        struct = [("UMUM", 60, "Tes Potensi Akademik")]

    # 3. Generate Subtes ke Database
    for code, dur, title in struct:
        db.add(models.Exam(
            id=f"P{p.id}_{code}_{uuid.uuid4().hex[:4]}", # ID Unik agar tidak bentrok
            period_id=p.id, code=code, title=title, duration=dur
        ))
    
    db.commit()
    return {"message": "Sukses membuat paket soal"}

# --- FITUR SOAL ---
@app.post("/exams/{exam_id}/questions")
def add_question(exam_id: str, q: QuestionCreateSchema, db: Session = Depends(get_db)):
    new_q = models.Question(exam_id=exam_id, text=q.text, correct_option=q.correct_option, explanation=q.explanation)
    db.add(new_q); db.commit(); db.refresh(new_q)
    for idx, opt in enumerate(q.options):
        label = ["A","B","C","D","E"][idx] if idx < 5 else "?"
        db.add(models.Option(question_id=new_q.id, label=opt, option_index=label, is_correct=(label==q.correct_option)))
    db.commit()
    return {"message": "OK"}

@app.get("/exams/{exam_id}/questions")
def get_qs(exam_id: str, db: Session = Depends(get_db)):
    return db.query(models.Question).filter_by(exam_id=exam_id).options(joinedload(models.Question.options)).all()

# --- FITUR SISWA & PEMBAYARAN ---
@app.get("/student/periods")
def stu_periods(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    periods = db.query(models.ExamPeriod).filter_by(is_active=True).options(joinedload(models.ExamPeriod.exams)).all()
    res = []
    for p in periods:
        locked = p.is_vip_only and not user.is_premium
        res.append({"id": p.id, "name": p.name, "exam_type": p.exam_type, "is_vip": p.is_vip_only, "locked": locked, "exams": p.exams})
    return res

@app.post("/payment/upgrade")
def pay(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    u.is_premium = True
    db.commit()
    return {"status": "OK"}

@app.post("/exams/{exam_id}/submit")
def submit(exam_id: str, d: AnswerSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=d.username).first()
    corr = 0
    for qid, ans in d.answers.items():
        q = db.query(models.Question).filter_by(id=int(qid)).first()
        if q and q.correct_option == ans: corr += 1
    
    # Save Result
    res = models.ExamResult(user_id=u.id, exam_id=exam_id, correct_count=corr, wrong_count=0, irt_score=corr*10)
    db.add(res); db.commit()
    return {"score": corr*10}