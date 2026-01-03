from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import os, uuid, pandas as pd, io

app = FastAPI()
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

@app.on_event("startup")
def startup():
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Muhamad Fadli Azim", role="admin"))
        db.add(models.SystemConfig(key="release_announcement", value="false"))
        db.add(models.SystemConfig(key="enable_major_selection", value="true"))
        db.commit()
    db.close()

# --- AUTH ---
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.get("username")).first()
    if u and u.password == data.get("password"):
        return {
            "message": "OK",
            "username": u.username,
            "name": u.full_name,
            "role": u.role,
            "choice1_id": u.choice1_id
        }
    raise HTTPException(400, "Username atau Password Salah")

@app.get("/config/{key}")
def get_cfg(key:str, db:Session=Depends(get_db)):
    c = db.query(models.SystemConfig).filter_by(key=key).first()
    return {"value": c.value if c else "false"}

@app.post("/config/{key}")
def set_cfg(key: str, data: dict, db: Session = Depends(get_db)):
    c = db.query(models.SystemConfig).filter_by(key=key).first()
    if c: c.value = str(data.get("value")).lower()
    else: db.add(models.SystemConfig(key=key, value=str(data.get("value")).lower()))
    db.commit()
    return {"message": "OK"}

# --- EXAMS & PERIODS ---
@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()

@app.post("/admin/periods")
def create_period(d: dict, db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=d['name'], exam_type=d['exam_type'], is_active=True)
    db.add(p); db.commit(); db.refresh(p)
    st = {
        "UTBK": [("PU",30), ("PK",20), ("PBM",25), ("PM",45)],
        "CPNS": [("TWK",30), ("TIU",30), ("TKP",40)],
        "TKA_SD": [("BIN",30), ("MAT",30), ("IPA",30)]
    }
    for c, dur in st.get(d['exam_type'], [("UMUM", 60)]):
        db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, code=c, title=f"Tes {c}", duration=dur))
    db.commit(); return {"message": "OK"}

@app.get("/student/periods")
def stu_p(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    ps = db.query(models.ExamPeriod).filter_by(is_active=True).all()
    res = []
    for p in ps:
        res.append({
            "id": p.id, "name": p.name, "type": p.exam_type,
            "exams": [{"id": e.id, "title": e.title, "duration": e.duration, "is_done": bool(db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=e.id).first())} for e in p.exams]
        })
    return res

@app.get("/exams/{eid}")
def get_ex(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    return {
        "id": e.id, "title": e.title, "duration": e.duration,
        "questions": [{"id": q.id, "text": q.text, "type": q.type, "image_url": q.image_url, "reading_material": q.reading_material, "options": [{"id": o.option_index, "label": o.label} for o in q.options]} for q in e.questions]
    }

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: dict, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.get("username")).first()
    # Scoring simplified, same as V15
    db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=0, wrong_count=0, irt_score=0))
    db.commit()
    return {"message": "Saved", "score": 0}

@app.get("/materials")
def get_mat(db: Session = Depends(get_db)): return db.query(models.Material).all()

@app.post("/materials")
def add_mat(d: dict, db: Session = Depends(get_db)):
    db.add(models.Material(title=d['title'], type=d['type'], category=d['category'], content_url=d['content_url']))
    db.commit(); return {"message": "OK"}