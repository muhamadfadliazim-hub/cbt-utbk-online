from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import pandas as pd
import io, os

app = FastAPI()
models.Base.metadata.create_all(bind=database.engine)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- AUTH & SETUP ---
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data['username']).first()
    if not user or user.password != data['password']: raise HTTPException(400, "Login Gagal")
    return user

# --- LMS FEATURES (KEMBALI!) ---
@app.get("/lms/materials")
def get_materials(category: str = None, db: Session = Depends(get_db)):
    q = db.query(models.Material)
    if category: q = q.filter(models.Material.category == category)
    return q.all()

@app.post("/admin/lms/upload")
def upload_material(title: str=Form(...), category: str=Form(...), content_type: str=Form(...), url: str=Form(...), db: Session = Depends(get_db)):
    mat = models.Material(title=title, category=category, content_type=content_type, content_url=url)
    db.add(mat); db.commit()
    return {"message": "Materi LMS Tersimpan"}

# --- EXAM MANAGEMENT ---
@app.get("/periods")
def get_periods(active_only: bool=False, db: Session = Depends(get_db)):
    q = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams))
    if active_only: q = q.filter(models.ExamPeriod.is_active == True)
    return q.order_by(models.ExamPeriod.id.desc()).all()

@app.post("/admin/periods")
def create_period(data: dict, db: Session = Depends(get_db)):
    # Auto Generate Subtes berdasarkan Tipe Ujian
    p = models.ExamPeriod(name=data['name'], exam_type=data['exam_type'])
    db.add(p); db.commit(); db.refresh(p)
    
    subtests = []
    if data['exam_type'] == "UTBK":
        subtests = [("PU", 30), ("PBM", 20), ("PPU", 20), ("PK", 20), ("LBI", 30), ("LBE", 30), ("PM", 20)]
    elif data['exam_type'] == "CPNS":
        subtests = [("TWK", 30), ("TIU", 35), ("TKP", 45)]
    elif data['exam_type'] == "TOEFL":
        subtests = [("LISTENING", 40), ("STRUCTURE", 25), ("READING", 55)]
    else:
        subtests = [("UMUM", 60)]
        
    for code, dur in subtests:
        db.add(models.Exam(id=f"P{p.id}_{code}", period_id=p.id, code=code, title=f"Tes {code}", duration=dur))
    db.commit()
    return {"message": "Paket Ujian Siap"}

# --- UPLOAD EXCEL SOAL (SESUAI FILE ANDA) ---
@app.post("/admin/upload/questions")
async def upload_soal(exam_id: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(content))
    
    db.query(models.Question).filter_by(exam_id=exam_id).delete() # Reset soal lama
    
    count = 0
    for _, row in df.iterrows():
        # Parsing Tipe Soal Kompleks/Tabel dari Excel
        raw_type = str(row.get('Tipe', 'PG')).upper()
        q_type = "PG"
        if "KOMPLEKS" in raw_type: q_type = "KOMPLEKS"
        elif "ISIAN" in raw_type: q_type = "ISIAN"
        elif "BENAR" in raw_type: q_type = "BS"
        
        # Parsing Opsi A-E
        opsi = []
        if q_type in ["PG", "KOMPLEKS"]:
            for char in ['A','B','C','D','E']:
                col = f'Opsi{char}'
                if col in row and pd.notna(row[col]):
                    opsi.append({"label": char, "text": str(row[col])})
        elif q_type == "BS": # Tabel Benar Salah
            # Misal format di excel OpsiA="Pernyataan 1", OpsiB="Pernyataan 2"
            for char in ['A','B','C','D']:
                col = f'Opsi{char}'
                if col in row and pd.notna(row[col]):
                    opsi.append({"statement": str(row[col]), "key": "B" if "B" in str(row.get(f'Kunci', '')) else "S"})

        q = models.Question(
            exam_id=exam_id,
            q_type=q_type,
            text=str(row.get('Soal', '')),
            wacana=str(row.get('Bacaan', '')) if pd.notna(row.get('Bacaan')) else None,
            options_json=opsi,
            correct_answer=str(row.get('Kunci', '')),
            difficulty=int(row.get('Kesulitan', 1)) if pd.notna(row.get('Kesulitan')) else 1,
            explanation=str(row.get('Pembahasan', ''))
        )
        db.add(q)
        count += 1
    db.commit()
    return {"message": f"Berhasil upload {count} soal"}

# --- UPLOAD PESERTA ---
@app.post("/admin/upload/users")
async def upload_users(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(content))
    for _, row in df.iterrows():
        if not db.query(models.User).filter_by(username=str(row['username'])).first():
            db.add(models.User(username=str(row['username']), password=str(row['password']), full_name=str(row['full_name']), role='student'))
    db.commit()
    return {"message": "Peserta diupload"}

# --- SYSTEM IRT SCORING ---
@app.post("/exams/{period_id}/finish")
def finish_exam(period_id: int, data: dict, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data['username']).first()
    answers = data['answers'] # Format: {"P1_PU": {"1": "A"}, "P1_PK": ...}
    
    total_irt = 0
    scores_detail = {}
    
    exams = db.query(models.Exam).filter_by(period_id=period_id).all()
    for ex in exams:
        sub_score = 0
        qs = db.query(models.Question).filter_by(exam_id=ex.id).all()
        q_map = {str(q.id): q for q in qs}
        user_ans = answers.get(ex.id, {})
        
        for q_id, val in user_ans.items():
            if q_id in q_map:
                q = q_map[q_id]
                is_correct = False
                
                # Cek Jawaban
                if q.q_type == "PG" and str(val) == q.correct_answer: is_correct = True
                elif q.q_type == "ISIAN" and str(val).lower() == q.correct_answer.lower(): is_correct = True
                
                if is_correct:
                    # Rumus IRT: Bobot Dasar + (Kesulitan * Faktor)
                    weight = 10 + (q.difficulty * 8)
                    sub_score += weight
        
        scores_detail[ex.code] = sub_score
        total_irt += sub_score
        
    res = models.ExamResult(user_id=user.id, period_id=period_id, scores_detail=scores_detail, total_score=total_irt)
    db.add(res); db.commit()
    return {"total": total_irt, "detail": scores_detail}

@app.get("/exams/{exam_id}/questions")
def get_qs(exam_id: str, db: Session = Depends(get_db)):
    return db.query(models.Question).filter_by(exam_id=exam_id).all()