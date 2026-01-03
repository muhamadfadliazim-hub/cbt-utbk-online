from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import pandas as pd
import io
import os
import uuid

# --- SETUP DIREKTORI ---
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app = FastAPI(title="EduPrime Intelligence System")
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
    try:
        yield db
    finally:
        db.close()

# --- SCHEMAS ---
class LoginSchema(BaseModel):
    username: str
    password: str

class AnswerSchema(BaseModel):
    answers: Dict[str, Any]
    username: str

class PeriodCreateSchema(BaseModel):
    name: str
    exam_type: str  # UTBK, CPNS, TKA_SD, etc

class QuestionCreateSchema(BaseModel): 
    text: str
    type: str = "multiple_choice"
    difficulty: float = 1.0
    reading_material: Optional[str] = None
    explanation: Optional[str] = None
    image_url: Optional[str] = None
    options: List[Dict[str, Any]]

# --- CORE LOGIC: PENILAIAN & PEMBAHASAN ---
def check_answer_correctness(question, user_ans):
    if not user_ans: return False
    key = next((o for o in question.options if o.is_correct), None)
    if question.type == 'short_answer':
        return key and str(user_ans).strip().lower() == key.label.strip().lower()
    return key and str(user_ans) == str(key.option_index)

# --- SYSTEM INITIALIZATION ---
@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    if not db.query(models.User).filter_by(username="admin").first():
        admin = models.User(username="admin", password="123", full_name="Muhamad Fadli Azim", role="admin")
        db.add(admin)
        db.commit()
    db.close()

@app.get("/init-admin")
def manual_init():
    startup_event()
    return {"message": "OK"}

# --- AUTH ---
@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if user and user.password == data.password:
        return {"message": "OK", "username": user.username, "name": user.full_name, "role": user.role}
    raise HTTPException(status_code=400, detail="Gagal")

# --- ADMIN: PERIOD & AUTO-SUBTESTS ---
@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=d.name, exam_type=d.exam_type, is_active=True)
    db.add(p)
    db.commit()
    db.refresh(p)
    
    # --- LOGIKA OTOMATIS SUBTEST CPNS & UTBK ---
    st = {
        "UTBK": [
            ("PU", 30, "Penalaran Umum"), ("PBM", 25, "Pemahaman Bacaan"), 
            ("PPU", 15, "Pengetahuan Umum"), ("PK", 20, "Kuantitatif"),
            ("LBI", 45, "Literasi Indonesia"), ("LBE", 45, "Literasi Inggris"), ("PM", 45, "Penalaran Matematika")
        ],
        "CPNS": [
            ("TWK", 30, "Tes Wawasan Kebangsaan"), 
            ("TIU", 30, "Tes Intelegensia Umum"), 
            ("TKP", 45, "Tes Karakteristik Pribadi")
        ],
        "TKA_SD": [("BIN", 30, "B. Indonesia"), ("MAT", 30, "Matematika"), ("IPA", 30, "IPA")]
    }
    
    exams = st.get(d.exam_type, [("UMUM", 60, "Tes Umum")])
    for code, dur, title in exams:
        db.add(models.Exam(id=f"P{p.id}_{code}", period_id=p.id, code=code, title=title, duration=dur))
    
    db.commit()
    return {"message": "OK"}

# --- LMS: MATERI MANAGEMENT ---
@app.get("/materials")
def get_materials(db: Session = Depends(get_db)):
    return db.query(models.Material).all()

@app.post("/materials")
def add_material(title: str = Form(...), type: str = Form(...), category: str = Form(...), url: str = Form(...), db: Session = Depends(get_db)):
    db.add(models.Material(title=title, type=type, category=category, content_url=url))
    db.commit()
    return {"message": "OK"}

# --- STUDENT: EXAM ENGINE ---
@app.get("/student/periods")
def get_student_periods(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    periods = db.query(models.ExamPeriod).filter_by(is_active=True).all()
    res = []
    for p in periods:
        exams = []
        for e in p.exams:
            res_exam = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=e.id).first()
            exams.append({
                "id": e.id, "title": e.title, "duration": e.duration, 
                "is_done": bool(res_exam), "score": res_exam.irt_score if res_exam else 0
            })
        res.append({"id": p.id, "name": p.name, "type": p.exam_type, "exams": exams})
    return res

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    exam = db.query(models.Exam).filter_by(id=exam_id).first()
    questions = exam.questions
    correct, earned = 0, 0.0
    for q in questions:
        if check_answer_correctness(q, data.answers.get(str(q.id))):
            correct += 1
            earned += q.difficulty
    
    # Penilaian IRT Progresif
    total_w = sum(q.difficulty for q in questions)
    score = (earned / total_w * 800) + 200 if total_w > 0 else 200
    
    db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct, wrong_count=len(questions)-correct, irt_score=round(score,2)))
    db.commit()
    return {"score": score}

# --- PEMBAHASAN SOAL (REVIEW) ---
@app.get("/student/exams/{eid}/review")
def get_review(eid: str, username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    exam = db.query(models.Exam).filter_by(id=eid).options(joinedload(models.Exam.questions).joinedload(models.Question.options)).first()
    return {
        "title": exam.title,
        "questions": [
            {
                "text": q.text, "explanation": q.explanation, "image_url": q.image_url,
                "options": [{"label": o.label, "is_correct": o.is_correct, "idx": o.option_index} for o in q.options]
            } for q in exam.questions
        ]
    }

# --- EXCEL BULK UPLOAD ---
@app.post("/admin/upload-questions/{eid}")
async def bulk_upload(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows():
        q = models.Question(exam_id=eid, text=str(r['Soal']), explanation=str(r.get('Pembahasan','')), difficulty=float(r.get('Kesulitan',1)))
        db.add(q); db.commit(); db.refresh(q)
        for char in ['A','B','C','D','E']:
            if pd.notna(r.get(f'Opsi{char}')):
                db.add(models.Option(question_id=q.id, option_index=char, label=str(r[f'Opsi{char}']), is_correct=(char == str(r['Kunci']).upper())))
    db.commit()
    return {"message": "OK"}