from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List
import models, database
import pandas as pd
import io, os, uuid, shutil

# SETUP FOLDER & APP
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)

app = FastAPI()
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

@app.on_event("startup")
def startup():
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Super Admin", role="admin"))
        db.commit()
    db.close()

# --- AUTH & PERIODS ---
class LoginSchema(BaseModel): username: str; password: str
class PeriodCreateSchema(BaseModel): name: str; exam_type: str

@app.post("/login")
def login(d: LoginSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=d.username).first()
    if not u or u.password != d.password: raise HTTPException(400, "Gagal Login")
    return {"id": u.id, "username": u.username, "role": u.role, "full_name": u.full_name}

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).order_by(models.ExamPeriod.id.desc()).all()

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=d.name, exam_type=d.exam_type, is_active=True)
    db.add(p); db.commit(); db.refresh(p)
    
    # GENERATE SUBTES OTOMATIS
    struct = []
    if d.exam_type == "CPNS": struct=[("TWK",30),("TIU",35),("TKP",45)]
    elif d.exam_type == "UTBK": struct=[("PU",30),("PBM",20),("PPU",20),("PK",20),("LBI",30),("LBE",30),("PM",20)]
    elif d.exam_type == "TKA_SMA": struct=[("MAT",25),("FIS",20),("KIM",20),("BIO",20)]
    else: struct=[("UMUM", 60)]
    
    for code, dur in struct:
        db.add(models.Exam(id=f"P{p.id}_{code}", period_id=p.id, code=code, title=f"Tes {code}", duration=dur))
    db.commit()
    return {"message": "Paket & Subtes Dibuat"}

# --- FITUR 1: UPLOAD PESERTA (Sesuai File peserta.xlsx) ---
@app.post("/admin/upload/users")
async def upload_users(file: UploadFile = File(...), db: Session = Depends(get_db)):
    c = await file.read()
    df = pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c))
    
    count = 0
    for _, row in df.iterrows():
        if db.query(models.User).filter_by(username=str(row['username'])).first(): continue
        db.add(models.User(
            username=str(row['username']), 
            password=str(row['password']), 
            full_name=str(row['full_name']), 
            role=str(row.get('role', 'student'))
        ))
        count += 1
    db.commit()
    return {"message": f"Berhasil import {count} user"}

# --- FITUR 2: UPLOAD SOAL (Sesuai File soal_LBI...csv) ---
@app.post("/admin/upload/questions")
async def upload_questions(exam_id: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    c = await file.read()
    df = pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c))
    
    # Hapus soal lama di subtes ini (Opsional, agar tidak duplikat)
    db.query(models.Question).filter_by(exam_id=exam_id).delete()
    
    count = 0
    for _, row in df.iterrows():
        # Mapping Kolom Excel Anda ke Database
        opsi = []
        for char in ['A','B','C','D','E']:
            col = f'Opsi{char}'
            if col in row and pd.notna(row[col]):
                opsi.append({"label": char, "text": str(row[col])})
        
        q = models.Question(
            exam_id=exam_id,
            q_type=str(row.get('Tipe', 'PG')), # Kolom 'Tipe' di Excel
            text=str(row.get('Soal', '')),     # Kolom 'Soal'
            wacana=str(row.get('Bacaan', '')) if pd.notna(row.get('Bacaan')) else None,
            options_json=opsi,
            correct_answer=str(row.get('Kunci', '')),
            difficulty=int(row.get('Kesulitan', 1)) if pd.notna(row.get('Kesulitan')) else 1,
            explanation=str(row.get('Pembahasan', ''))
        )
        db.add(q)
        count += 1
    db.commit()
    return {"message": f"Sukses upload {count} soal"}

@app.get("/exams/{exam_id}/questions")
def get_qs(exam_id: str, db: Session = Depends(get_db)):
    return db.query(models.Question).filter_by(exam_id=exam_id).all()

# --- FITUR 3: SUBMIT & IRT SCORING ---
class AnsSchema(BaseModel): answers: Dict[str, Any]; username: str

@app.post("/exams/{period_id}/finish")
def finish_exam(period_id: int, d: AnsSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=d.username).first()
    
    total_score = 0
    detail = {}
    
    # Loop per subtes (PU, PK, LBI...)
    exams = db.query(models.Exam).filter_by(period_id=period_id).all()
    for ex in exams:
        sub_score = 0
        qs = db.query(models.Question).filter_by(exam_id=ex.id).all()
        q_map = {str(q.id): q for q in qs}
        user_ans_sub = d.answers.get(ex.id, {}) # Jawaban user di subtes ini
        
        for q_id, val in user_ans_sub.items():
            if q_id in q_map:
                q = q_map[q_id]
                # Cek Benar (Case insensitive untuk isian)
                is_correct = str(val).upper() == str(q.correct_answer).upper()
                if is_correct:
                    # Rumus IRT Simple: Bobot Dasar + (Kesulitan * 10)
                    sub_score += (10 + (q.difficulty * 10))
        
        detail[ex.code] = sub_score
        total_score += sub_score
        
    res = models.ExamResult(
        user_id=user.id, period_id=period_id, 
        scores_detail=detail, total_score=total_score
    )
    db.add(res); db.commit()
    return {"total": total_score, "detail": detail}

@app.get("/student/periods")
def st_periods(username: str, db: Session = Depends(get_db)):
    # Return periods + exams structure
    pers = db.query(models.ExamPeriod).filter_by(is_active=True).options(joinedload(models.ExamPeriod.exams)).all()
    return pers