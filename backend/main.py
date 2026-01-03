from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import os, uuid

# Setup
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)

app = FastAPI()
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# AUTO-REPAIR DATABASE SAAT STARTUP
@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    try:
        models.Base.metadata.create_all(bind=database.engine)
        if not db.query(models.User).filter_by(username="admin").first():
            new_admin = models.User(username="admin", password="123", full_name="Super Admin", role="admin")
            db.add(new_admin)
            db.commit()
    finally: db.close()

# --- SCHEMAS ---
class LoginSchema(BaseModel): username: str; password: str
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class UserCreateSchema(BaseModel): username: str; full_name: str; password: str; role: str = "student"
class ConfigSchema(BaseModel): value: str
class PeriodCreateSchema(BaseModel): name: str; exam_type: str
class MaterialCreateSchema(BaseModel): title: str; type: str; content_url: str; category: str

# --- ENDPOINTS ---
@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if user and user.password == data.password:
        return {"username": user.username, "name": user.full_name, "role": user.role}
    raise HTTPException(400, "User tidak ditemukan")

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=d.name, exam_type=d.exam_type, is_active=True, allow_submit=True)
    db.add(p); db.commit(); db.refresh(p)
    # Struktur TKA & UTBK
    struct = []
    if "TKA_SMA" in d.exam_type: struct=[("MAT",40),("FIS",40),("KIM",40),("BIO",40)]
    elif "TKA_SMP" in d.exam_type: struct=[("MAT",40),("IPA",40),("BIN",30)]
    else: struct=[("PU",30),("PK",20),("LBI",45)]
    for c, dur in struct: db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, code=c, title=f"Tes {c}", duration=dur))
    db.commit(); return {"message": "OK"}

@app.get("/student/periods")
def stu_periods(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    ps = db.query(models.ExamPeriod).filter_by(is_active=True).all()
    res = []
    for p in ps:
        res.append({
            "id": p.id, "name": p.name, "type": p.exam_type,
            "exams": [{"id": e.id, "title": e.title, "is_done": bool(db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=e.id).first())} for e in p.exams]
        })
    return res

@app.get("/init-admin")
def fix_manual(db: Session = Depends(get_db)):
    startup_event()
    return {"status": "Database Repaired"}