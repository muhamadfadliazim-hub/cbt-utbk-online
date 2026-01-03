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

# --- INISIALISASI APP ---
app = FastAPI(title="EduPrime Intelligence System")
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE DEPENDENCY ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- SCHEMAS (DATA VALIDATION) ---
class LoginSchema(BaseModel):
    username: str
    password: str

class AnswerSchema(BaseModel):
    answers: Dict[str, Any]
    username: str

class UserCreateSchema(BaseModel):
    username: str
    full_name: str
    password: str
    role: str = "student"

class PeriodCreateSchema(BaseModel):
    name: str
    exam_type: str
    allowed_usernames: Optional[str] = None

class QuestionCreateSchema(BaseModel): 
    text: str
    type: str = "multiple_choice"
    difficulty: float = 1.0
    reading_material: Optional[str] = None
    explanation: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    options: List[Dict[str, Any]]

class ConfigSchema(BaseModel):
    value: str

# --- CORE LOGIC (SCORING & UTILS) ---
def check_answer_correctness(question, user_ans):
    if not user_ans: return False
    # Logic untuk Isian Singkat
    if question.type == 'short_answer':
        key = next((o for o in question.options if o.is_correct), None)
        return key and str(user_ans).strip().lower() == key.label.strip().lower()
    # Logic untuk Pilihan Ganda
    else:
        key = next((o for o in question.options if o.is_correct), None)
        return key and str(user_ans) == str(key.option_index)

# --- SYSTEM ENDPOINTS ---

@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    try:
        if not db.query(models.User).filter_by(username="admin").first():
            admin = models.User(
                username="admin", 
                password="123", 
                full_name="Muhamad Fadli Azim", 
                role="admin"
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()

@app.get("/init-admin")
def manual_init(db: Session = Depends(get_db)):
    startup_event()
    return {"message": "OK"}

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if user and user.password == data.password:
        return {
            "message": "OK",
            "username": user.username,
            "name": user.full_name,
            "role": user.role
        }
    raise HTTPException(status_code=400, detail="ID atau Password salah")

# --- ADMIN: PERIOD & EXAM MANAGEMENT ---

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    periods = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
    return periods

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=d.name, exam_type=d.exam_type, is_active=True)
    db.add(p)
    db.commit()
    db.refresh(p)
    
    # --- STRUKTUR UTBK SNBT LENGKAP 2026 ---
    st = {
        "UTBK": [
            ("PU", 30, "Penalaran Umum"), 
            ("PBM", 25, "Pemahaman Bacaan & Menulis"), 
            ("PPU", 15, "Pengetahuan & Pemahaman Umum"), 
            ("PK", 20, "Pengetahuan Kuantitatif"),
            ("LBI", 45, "Literasi Bahasa Indonesia"),
            ("LBE", 45, "Literasi Bahasa Inggris"),
            ("PM", 45, "Penalaran Matematika")
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

@app.delete("/admin/periods/{pid}")
def delete_period(pid: int, db: Session = Depends(get_db)):
    db.query(models.ExamPeriod).filter_by(id=pid).delete()
    db.commit()
    return {"message": "Deleted"}

# --- ADMIN: QUESTION EDITOR ---

@app.post("/admin/exams/{eid}/manual-question")
def add_manual_question(eid: str, d: QuestionCreateSchema, db: Session = Depends(get_db)):
    q = models.Question(
        exam_id=eid, text=d.text, type=d.type, difficulty=d.difficulty,
        reading_material=d.reading_material, explanation=d.explanation,
        image_url=d.image_url, audio_url=d.audio_url
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    
    idx_map = ["A","B","C","D","E"]
    for i, o in enumerate(d.options):
        db.add(models.Option(
            question_id=q.id, 
            label=o['label'], 
            option_index=idx_map[i] if i < 5 else str(i+1), 
            is_correct=o['is_correct']
        ))
    db.commit()
    return {"message": "Saved"}

@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as buffer:
        buffer.write(await file.read())
    return {"url": f"/static/{filename}"}

# --- STUDENT: EXAM SYSTEM ---

@app.get("/student/periods")
def get_student_periods(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    periods = db.query(models.ExamPeriod).filter_by(is_active=True).all()
    res = []
    for p in periods:
        exams = []
        for e in p.exams:
            is_done = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=e.id).first()
            exams.append({
                "id": e.id, "title": e.title, "duration": e.duration, 
                "is_done": bool(is_done), "q_count": len(e.questions)
            })
        res.append({"id": p.id, "name": p.name, "type": p.exam_type, "exams": exams})
    return res

@app.get("/exams/{eid}")
def get_exam_details(eid: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=eid).first()
    if not exam: raise HTTPException(404)
    return {
        "id": exam.id, "title": exam.title, "duration": exam.duration,
        "questions": [
            {
                "id": q.id, "text": q.text, "type": q.type, "image_url": q.image_url,
                "reading_material": q.reading_material,
                "options": [{"id": o.option_index, "label": o.label} for o in q.options]
            } for q in exam.questions
        ]
    }

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if not user: raise HTTPException(404)
    
    # Cek jika sudah pernah submit
    if db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first():
        return {"message": "Already Submitted"}

    exam = db.query(models.Exam).filter_by(id=exam_id).first()
    questions = exam.questions
    correct, earned = 0, 0.0
    
    for q in questions:
        user_ans = data.answers.get(str(q.id))
        if check_answer_correctness(q, user_ans):
            correct += 1
            earned += q.difficulty
    
    # --- LOGIKA PENILAIAN IRT (Standard Nasional) ---
    if exam.period.exam_type == "UTBK":
        total_difficulty = sum(q.difficulty for q in questions)
        score = 200 + ((earned / total_difficulty) * 800) if total_difficulty > 0 else 200
    else:
        score = (correct / len(questions) * 100) if len(questions) > 0 else 0

    db.add(models.ExamResult(
        user_id=user.id, exam_id=exam_id, 
        correct_count=correct, wrong_count=len(questions)-correct, 
        irt_score=round(score, 2)
    ))
    db.commit()
    return {"message": "Success", "score": score}

@app.get("/student/exams/{eid}/review")
def get_review(eid: str, username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    res = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=eid).first()
    exam = db.query(models.Exam).filter_by(id=eid).first()
    return {
        "score": res.irt_score,
        "questions": [
            {
                "id": q.id, "text": q.text, "explanation": q.explanation, "image_url": q.image_url,
                "options": [{"label": o.label, "is_correct": o.is_correct, "id": o.option_index} for o in q.options]
            } for q in exam.questions
        ]
    }

# --- DATA MANAGEMENT (USERS, MAJORS, MATERIALS) ---

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == "student").all()

@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    db.add(models.User(username=u.username, password=u.password, full_name=u.full_name))
    db.commit()
    return {"message": "OK"}

@app.get("/materials")
def get_materials(db: Session = Depends(get_db)):
    return db.query(models.Material).all()

@app.post("/materials")
def add_material(d: dict, db: Session = Depends(get_db)):
    db.add(models.Material(
        title=d['title'], type=d['type'], 
        category=d['category'], content_url=d['content_url']
    ))
    db.commit()
    return {"message": "OK"}

@app.get("/admin/recap")
def get_recap(db: Session = Depends(get_db)):
    users = db.query(models.User).filter_by(role='student').all()
    res = []
    for u in users:
        scores = {r.exam_id.split('_')[-1]: r.irt_score for r in u.results}
        avg = sum(scores.values()) / len(scores) if scores else 0
        res.append({
            "name": u.full_name, "username": u.username, 
            "average": round(avg, 2), **scores
        })
    return res

@app.get("/config/{key}")
def get_config(key: str, db: Session = Depends(get_db)):
    c = db.query(models.SystemConfig).filter_by(key=key).first()
    return {"value": c.value if c else "false"}

@app.post("/config/{key}")
def set_config(key: str, d: ConfigSchema, db: Session = Depends(get_db)):
    c = db.query(models.SystemConfig).filter_by(key=key).first()
    if c: c.value = d.value
    else: db.add(models.SystemConfig(key=key, value=d.value))
    db.commit()
    return {"message": "OK"}

# --- EXCEL BULK UPLOAD HANDLERS ---

@app.post("/admin/upload-questions/{eid}")
async def bulk_upload_questions(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    df = pd.read_excel(io.BytesIO(content))
    db.query(models.Question).filter_by(exam_id=eid).delete()
    db.commit()
    for _, r in df.iterrows():
        q = models.Question(
            exam_id=eid, text=str(r['Soal']), 
            explanation=str(r.get('Pembahasan', '')),
            difficulty=float(r.get('Kesulitan', 1.0))
        )
        db.add(q); db.commit(); db.refresh(q)
        for char, col in [('A','OpsiA'),('B','OpsiB'),('C','OpsiC'),('D','OpsiD'),('E','OpsiE')]:
            if pd.notna(r.get(col)):
                db.add(models.Option(
                    question_id=q.id, option_index=char, 
                    label=str(r[col]), is_correct=(char == str(r['Kunci']).strip().upper())
                ))
    db.commit()
    return {"message": "Success"}