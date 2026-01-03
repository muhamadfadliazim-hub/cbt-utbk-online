from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import pandas as pd
import io, os

app = FastAPI(title="EduPrime Ultimate V28")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- SCHEMAS ---
class UserCreate(BaseModel): username: str; full_name: str; password: str; role: str
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class ManualQuestion(BaseModel): text: str; difficulty: float; explanation: str; options: List[Dict[str, Any]]

# --- INITIALIZATION ---
@app.get("/init-admin")
def manual_init(db: Session = Depends(get_db)):
    models.Base.metadata.create_all(bind=database.engine)
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Muhamad Fadli Azim", role="admin"))
    if not db.query(models.Major).first():
        majors = [
            {"uni": "Universitas Indonesia", "name": "Kedokteran", "pg": 750},
            {"uni": "ITB", "name": "Sekolah Teknik Elektro & Informatika", "pg": 780},
            {"uni": "UGM", "name": "Hukum", "pg": 710}
        ]
        for m in majors:
            db.add(models.Major(university=m['uni'], name=m['name'], passing_grade=m['pg']))
    db.commit()
    return {"status": "Sistem Siap"}

# --- AUTH & USERS ---
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data['username']).first()
    if u and u.password == data['password']:
        return {"username": u.username, "name": u.full_name, "role": u.role, "choice_id": u.choice1_id}
    raise HTTPException(400, "Gagal")

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()

@app.post("/admin/users/bulk-delete")
def bulk_delete(db: Session = Depends(get_db)):
    db.query(models.User).filter(models.User.role == "student").delete()
    db.commit(); return {"msg": "Sukses"}

# --- EXAM & QUESTION BUILDER ---
@app.post("/admin/periods")
def create_period(name: str = Form(...), exam_type: str = Form(...), db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type, is_active=True)
    db.add(p); db.commit(); db.refresh(p)
    # STRUKTUR ASLI UTBK 2026
    st = {
        "UTBK": [("PU",30,"Penalaran Umum"), ("PBM",25,"Pemahaman Bacaan"), ("PPU",15,"Pengetahuan Umum"), ("PK",20,"Kuantitatif"), ("LBI",45,"Lit. Indonesia"), ("LBE",45,"Lit. Inggris"), ("PM",45,"Penalaran Matematika")],
        "CPNS": [("TWK",30,"TWK"), ("TIU",35,"TIU"), ("TKP",45,"TKP")]
    }
    for c, dur, title in st.get(exam_type, [("UMUM", 60, "Tes Umum")]):
        db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, code=c, title=title, duration=dur))
    db.commit(); return {"msg": "OK"}

@app.post("/admin/exams/{eid}/manual")
def add_manual_soal(eid: str, data: ManualQuestion, db: Session = Depends(get_db)):
    q = models.Question(exam_id=eid, text=data.text, difficulty=data.difficulty, explanation=data.explanation)
    db.add(q); db.commit(); db.refresh(q)
    for opt in data.options:
        db.add(models.Option(question_id=q.id, label=opt['label'], option_index=opt['idx'], is_correct=opt['is_correct']))
    db.commit(); return {"msg": "OK"}

@app.get("/student/periods")
def get_student_exams(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    periods = db.query(models.ExamPeriod).all()
    return [{"id":p.id,"name":p.name,"type":p.exam_type,"exams":[{"id":e.id,"title":e.title,"duration":e.duration,"is_done":bool(db.query(models.ExamResult).filter_by(user_id=u.id,exam_id=e.id).first())} for e in p.exams]} for p in periods]