from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import pandas as pd
import io, os, uuid

app = FastAPI()
models.Base.metadata.create_all(bind=database.engine)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# CORS HARUS ALLOW ALL AGAR TIDAK BLOKIR LOGIN
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


# --- ENDPOINT ADMIN INIT (INI YANG ANDA CARI) ---
@app.get("/init-admin")
def init_admin(db: Session = Depends(get_db)):
    # Cek apakah admin sudah ada
    existing = db.query(models.User).filter_by(username="admin").first()
    if existing:
        return {"message": "Admin sudah ada. Gunakan: admin / admin123"}
    
    # Buat admin baru
    admin = models.User(
        username="admin", 
        password="admin123", 
        full_name="Super Administrator", 
        role="admin"
    )
    db.add(admin)
    db.commit()
    return {"message": "SUKSES! Admin dibuat. Login: admin / admin123"}

# --- AUTH ---
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    # Cari user
    user = db.query(models.User).filter_by(username=data['username']).first()
    # Cek password (sederhana sesuai request excel)
    if not user or str(user.password).strip() != str(data['password']).strip(): 
        raise HTTPException(400, "Username atau Password Salah")
    return user

# --- ENDPOINTS LAINNYA (LMS, PERIODS, UPLOAD) TETAP SAMA ---
# (Pastikan kode upload excel, lms, dan exam ada disini seperti sebelumnya)
# Agar tidak kepanjangan, bagian bawah ini adalah RESTORE fungsi vital:

@app.get("/lms/materials")
def get_materials(db: Session = Depends(get_db)):
    return db.query(models.Material).all()

@app.post("/admin/lms/upload")
def upload_material(title: str=Form(...), category: str=Form(...), content_type: str=Form(...), url: str=Form(...), db: Session = Depends(get_db)):
    mat = models.Material(title=title, category=category, content_type=content_type, content_url=url)
    db.add(mat); db.commit()
    return {"message": "Materi OK"}

@app.get("/periods")
def get_periods(active_only: bool=False, db: Session = Depends(get_db)):
    q = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams))
    return q.order_by(models.ExamPeriod.id.desc()).all()

@app.post("/admin/periods")
def create_period(data: dict, db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=data['name'], exam_type=data['exam_type'])
    db.add(p); db.commit(); db.refresh(p)
    # Auto Subtes Logic
    subs = [("UMUM", 60)]
    if data['exam_type'] == "UTBK": subs=[("PU",30),("PBM",20),("PPU",20),("PK",20),("LBI",30),("LBE",30),("PM",20)]
    elif data['exam_type'] == "CPNS": subs=[("TWK",30),("TIU",35),("TKP",45)]
    
    for c,d in subs: db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, code=c, title=f"Tes {c}", duration=d))
    db.commit()
    return {"message": "OK"}

@app.post("/admin/upload/questions")
async def upload_soal(exam_id: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    c = await file.read()
    df = pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c))
    db.query(models.Question).filter_by(exam_id=exam_id).delete()
    for _, r in df.iterrows():
        # Logic Parsing Excel Anda
        tipe = "PG"
        if "KOMPLEKS" in str(r.get('Tipe','')).upper(): tipe="KOMPLEKS"
        elif "ISIAN" in str(r.get('Tipe','')).upper(): tipe="ISIAN"
        
        opsi = []
        if tipe in ["PG","KOMPLEKS"]:
            for char in ['A','B','C','D','E']:
                if pd.notna(r.get(f'Opsi{char}')): opsi.append({"label":char, "text":str(r[f'Opsi{char}'])})
        
        q = models.Question(exam_id=exam_id, q_type=tipe, text=str(r.get('Soal','')), options_json=opsi, correct_answer=str(r.get('Kunci','')), explanation=str(r.get('Pembahasan','')))
        db.add(q)
    db.commit()
    return {"message": "Uploaded"}

@app.post("/admin/upload/users")
async def upload_users(file: UploadFile = File(...), db: Session = Depends(get_db)):
    c = await file.read()
    df = pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c))
    for _, r in df.iterrows():
        if not db.query(models.User).filter_by(username=str(r['username'])).first():
            db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name']), role='student'))
    db.commit()
    return {"message": "Users Uploaded"}

@app.get("/exams/{exam_id}/questions")
def get_qs(exam_id: str, db: Session = Depends(get_db)):
    return db.query(models.Question).filter_by(exam_id=exam_id).all()

@app.post("/exams/{period_id}/finish")
def finish(period_id: int, d: dict, db: Session = Depends(get_db)):
    # Simple Scoring Logic
    score = 0
    detail = {}
    for eid, ans in d['answers'].items():
        sub_s = 0
        qs = db.query(models.Question).filter_by(exam_id=eid).all()
        for q in qs:
            if str(ans.get(str(q.id),'')).upper() == str(q.correct_answer).upper(): sub_s += 10
        detail[eid] = sub_s
        score += sub_s
    
    # Save Result
    u = db.query(models.User).filter_by(username=d['username']).first()
    db.add(models.ExamResult(user_id=u.id, period_id=period_id, scores_detail=detail, total_score=score))
    db.commit()
    return {"total": score, "detail": detail}