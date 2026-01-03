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

# --- SETUP DIRECTORY ---
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)

app = FastAPI(title="EduPrime Ultimate V23")
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- SCHEMAS ---
class LoginSchema(BaseModel): username: str; password: str
class UserCreateSchema(BaseModel): username: str; full_name: str; password: str; role: str
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class PeriodCreateSchema(BaseModel): name: str; exam_type: str
class ConfigSchema(BaseModel): value: str

# --- AUTH & CORE ---
# Pastikan bagian startup_event di main.py seperti ini:
@app.on_event("startup")
def startup_event():
    # Ini akan membuat tabel majors terlebih dahulu baru tabel users
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

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if user and user.password == data.password:
        return {"message": "OK", "username": user.username, "name": user.full_name, "role": user.role}
    raise HTTPException(400, "ID atau Password Salah")

# --- ADMIN: USER MANAGEMENT ---
@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=u.username).first():
        raise HTTPException(400, "Username sudah ada")
    db.add(models.User(username=u.username, password=u.password, full_name=u.full_name, role=u.role))
    db.commit()
    return {"message": "OK"}

@app.delete("/admin/users/{uid}")
def delete_user(uid: int, db: Session = Depends(get_db)):
    db.query(models.User).filter_by(id=uid).delete()
    db.commit()
    return {"message": "Deleted"}

# --- ADMIN: BANK SOAL & PERIOD ---
@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams).joinedload(models.Exam.questions)).all()

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=d.name, exam_type=d.exam_type, is_active=True)
    db.add(p); db.commit(); db.refresh(p)
    
    st = {
        "UTBK": [("PU", 30, "Penalaran Umum"), ("PBM", 25, "Pemahaman Bacaan"), ("PPU", 15, "Pengetahuan Umum"), ("PK", 20, "Kuantitatif"), ("LBI", 45, "Literasi Indonesia"), ("LBE", 45, "Literasi Inggris"), ("PM", 45, "Penalaran Matematika")],
        "CPNS": [("TWK", 30, "Tes Wawasan Kebangsaan"), ("TIU", 30, "Tes Intelegensia Umum"), ("TKP", 45, "Tes Karakteristik Pribadi")],
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

# --- ADMIN: QUESTION EDITOR & PREVIEW ---
@app.get("/admin/exams/{eid}/preview")
def preview_exam(eid: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=eid).options(joinedload(models.Exam.questions).joinedload(models.Question.options)).first()
    return exam

@app.post("/admin/exams/{eid}/manual-question")
def add_question(eid: str, d: dict, db: Session = Depends(get_db)):
    q = models.Question(exam_id=eid, text=d['text'], type=d.get('type', 'multiple_choice'), difficulty=float(d.get('difficulty', 1.0)), reading_material=d.get('reading_material'), explanation=d.get('explanation'), image_url=d.get('image_url'))
    db.add(q); db.commit(); db.refresh(q)
    for opt in d['options']:
        db.add(models.Option(question_id=q.id, label=opt['label'], option_index=opt['idx'], is_correct=opt['is_correct']))
    db.commit()
    return {"message": "OK"}

@app.delete("/admin/questions/{qid}")
def delete_question(qid: int, db: Session = Depends(get_db)):
    db.query(models.Question).filter_by(id=qid).delete()
    db.commit()
    return {"message": "Deleted"}

# --- STUDENT: EXAM & LMS ---
@app.get("/student/periods")
def get_student_periods(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    periods = db.query(models.ExamPeriod).filter_by(is_active=True).all()
    res = []
    for p in periods:
        exams = []
        for e in p.exams:
            res_exam = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=e.id).first()
            exams.append({"id": e.id, "title": e.title, "duration": e.duration, "is_done": bool(res_exam), "score": res_exam.irt_score if res_exam else 0})
        res.append({"id": p.id, "name": p.name, "type": p.exam_type, "exams": exams})
    return res

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    exam = db.query(models.Exam).filter_by(id=exam_id).first()
    correct, earned = 0, 0.0
    for q in exam.questions:
        user_ans = data.answers.get(str(q.id))
        key = next((o for o in q.options if o.is_correct), None)
        if key and str(user_ans) == str(key.option_index):
            correct += 1; earned += q.difficulty
    
    total_w = sum(q.difficulty for q in exam.questions)
    score = (earned / total_w * 800) + 200 if total_w > 0 else 200
    db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct, wrong_count=len(exam.questions)-correct, irt_score=round(score,2)))
    db.commit()
    return {"score": score}

@app.get("/student/exams/{eid}/review")
def get_review(eid: str, username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    res = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=eid).first()
    exam = db.query(models.Exam).filter_by(id=eid).first()
    return {"score": res.irt_score, "questions": [{"text": q.text, "explanation": q.explanation, "image_url": q.image_url, "options": [{"label": o.label, "is_correct": o.is_correct, "idx": o.option_index} for o in q.options]} for q in exam.questions]}

# --- LMS ---
@app.get("/materials")
def get_materials(db: Session = Depends(get_db)): return db.query(models.Material).all()

@app.post("/materials")
def add_material(title: str = Form(...), type: str = Form(...), category: str = Form(...), url: str = Form(...), db: Session = Depends(get_db)):
    db.add(models.Material(title=title, type=type, category=category, content_url=url))
    db.commit(); return {"message": "OK"}

@app.delete("/materials/{mid}")
def delete_material(mid: int, db: Session = Depends(get_db)):
    db.query(models.Material).filter_by(id=mid).delete()
    db.commit(); return {"message": "Deleted"}

# --- SYSTEM CONFIG ---
@app.get("/config/{key}")
def get_config(key: str, db: Session = Depends(get_db)):
    c = db.query(models.SystemConfig).filter_by(key=key).first()
    return {"value": c.value if c else "false"}

@app.post("/config/{key}")
def set_config(key: str, d: ConfigSchema, db: Session = Depends(get_db)):
    c = db.query(models.SystemConfig).filter_by(key=key).first()
    if c: c.value = d.value
    else: db.add(models.SystemConfig(key=key, value=d.value))
    db.commit(); return {"message": "OK"}

# --- BULK EXCEL ---
@app.post("/admin/upload-questions/{eid}")
async def bulk_upload(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows():
        q = models.Question(exam_id=eid, text=str(r['Soal']), explanation=str(r.get('Pembahasan','')), difficulty=float(r.get('Kesulitan',1)))
        db.add(q); db.commit(); db.refresh(q)
        for char in ['A','B','C','D','E']:
            if pd.notna(r.get(f'Opsi{char}')):
                db.add(models.Option(question_id=q.id, option_index=char, label=str(r[f'Opsi{char}']), is_correct=(char == str(r['Kunci']).strip().upper())))
    db.commit(); return {"message": "OK"}