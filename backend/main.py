from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database, io, os
import pandas as pd
from datetime import datetime

app = FastAPI(title="EduPrime V31 Enterprise")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- DEPENDENCY FIX (Baris 13 yang Error Sebelumnya) ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- SCHEMAS ---
class ManualSoalSchema(BaseModel): 
    text: str
    difficulty: float
    explanation: str
    passage: Optional[str] = ""
    media_type: str = "none"
    media_url: str = ""
    options: List[Dict[str, Any]]

class AnswerSchema(BaseModel): 
    answers: Dict[str, Any]
    username: str

# --- INIT ---
@app.get("/init-admin")
def manual_init(db: Session = Depends(get_db)):
    models.Base.metadata.create_all(bind=database.engine)
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Muhamad Fadli Azim", role="admin"))
    db.commit()
    return {"status": "System V31 Ready"}

# --- AUTH & USER ---
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data['username']).first()
    if u and u.password == data['password']: 
        return {"username": u.username, "name": u.full_name, "role": u.role, "choice_id": u.choice1_id}
    raise HTTPException(400, "Gagal")

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): 
    return db.query(models.User).all()

@app.post("/admin/users")
def add_user(data: dict, db: Session = Depends(get_db)):
    db.add(models.User(username=data['username'], password=data['password'], full_name=data['full_name'], role=data['role']))
    db.commit()
    return {"msg": "OK"}

@app.post("/admin/users/bulk-delete")
def bulk_delete(db: Session = Depends(get_db)):
    db.query(models.User).filter(models.User.role == "student").delete()
    db.commit()
    return {"msg": "Deleted"}

@app.post("/admin/users/bulk")
async def bulk_upload_user(file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows():
        if not db.query(models.User).filter_by(username=str(r['username'])).first():
            db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name'])))
    db.commit()
    return {"msg": "OK"}

# --- EXAMS CORE (BLOCKING TIME SUPPORT) ---
@app.post("/admin/periods")
def create_period(name: str = Form(...), exam_type: str = Form(...), db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type)
    db.add(p)
    db.commit()
    db.refresh(p)
    
    # Struktur Subtes Otomatis Sesuai Standar SNBT
    structure = {
        "UTBK": [
            ("PU", 30, "Penalaran Umum", 1), 
            ("PBM", 25, "Pemahaman Bacaan", 2), 
            ("PPU", 15, "Pengetahuan Umum", 3),
            ("PK", 20, "Pengetahuan Kuantitatif", 4),
            ("LBI", 45, "Literasi B.Indo", 5),
            ("LBE", 45, "Literasi B.Inggris", 6),
            ("PM", 45, "Penalaran Matematika", 7)
        ],
        "CPNS": [("TWK", 30, "TWK", 1), ("TIU", 35, "TIU", 2), ("TKP", 45, "TKP", 3)],
        "TOEFL": [("LISTENING", 40, "Listening Section", 1), ("STRUCTURE", 25, "Structure", 2), ("READING", 55, "Reading", 3)]
    }
    
    for code, dur, title, order in structure.get(exam_type, [("UMUM", 60, "Tes Umum", 1)]):
        db.add(models.Exam(id=f"P{p.id}_{code}", period_id=p.id, title=title, duration=dur, order_index=order))
    
    db.commit()
    return {"msg": "OK"}

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)): 
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()

@app.delete("/admin/periods/{pid}")
def del_period(pid: int, db: Session = Depends(get_db)):
    db.query(models.ExamPeriod).filter_by(id=pid).delete()
    db.commit()
    return {"msg": "Del"}

# --- ADVANCED QUESTION EDITOR ---
@app.post("/admin/exams/{eid}/manual")
def add_question(eid: str, data: ManualSoalSchema, db: Session = Depends(get_db)):
    q = models.Question(
        exam_id=eid, text=data.text, difficulty=data.difficulty, explanation=data.explanation,
        passage_text=data.passage, media_type=data.media_type, media_url=data.media_url
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    
    for opt in data.options:
        db.add(models.Option(question_id=q.id, label=opt['label'], option_index=opt['idx'], is_correct=opt['is_correct']))
    
    db.commit()
    return {"msg": "Saved"}

@app.post("/admin/upload-questions/{eid}")
async def upload_soal_excel(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows():
        # Support kolom Wacana, Audio, Gambar di Excel
        q = models.Question(
            exam_id=eid, 
            text=str(r['Soal']), 
            explanation=str(r.get('Pembahasan','')), 
            difficulty=float(r.get('Kesulitan',1)),
            passage_text=str(r.get('Wacana','')) if pd.notna(r.get('Wacana')) else None,
            media_url=str(r.get('Media','')) if pd.notna(r.get('Media')) else None,
            media_type="image" if str(r.get('Media','')).endswith(('.jpg','.png')) else "audio" if str(r.get('Media','')).endswith('.mp3') else "none"
        )
        db.add(q)
        db.commit()
        db.refresh(q)
        
        for char in ['A','B','C','D','E']:
            if pd.notna(r.get(f'Opsi{char}')):
                db.add(models.Option(question_id=q.id, option_index=char, label=str(r[f'Opsi{char}']), is_correct=(char == str(r['Kunci']).strip().upper())))
    
    db.commit()
    return {"msg": "Excel Uploaded"}

@app.delete("/admin/questions/{qid}")
def del_q(qid: int, db: Session = Depends(get_db)):
    db.query(models.Question).filter_by(id=qid).delete()
    db.commit()
    return {"msg": "Del"}

# --- STUDENT & IRT SCORING ---
@app.get("/student/periods")
def get_student_data(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    ps = db.query(models.ExamPeriod).all()
    res = []
    for p in ps:
        exams = []
        sorted_exams = sorted(p.exams, key=lambda x: x.order_index)
        for e in sorted_exams:
            done = bool(db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=e.id).first())
            exams.append({"id":e.id, "title":e.title, "duration":e.duration, "is_done":done})
        res.append({"id":p.id, "name":p.name, "type":p.exam_type, "exams":exams})
    return res

@app.get("/exams/{eid}")
def get_exam_detail(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    return {
        "id": e.id, "title": e.title, "duration": e.duration,
        "questions": [{
            "id": q.id, "text": q.text, "passage": q.passage_text, 
            "media_type": q.media_type, "media_url": q.media_url,
            "options": [{"id":o.option_index, "label":o.label} for o in q.options]
        } for q in e.questions]
    }

@app.post("/exams/{exam_id}/submit")
def submit_exam_irt(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    e = db.query(models.Exam).filter_by(id=exam_id).first()
    
    correct, total_difficulty, earned_difficulty = 0, 0.0, 0.0
    for q in e.questions:
        total_difficulty += q.difficulty
        user_ans = data.answers.get(str(q.id))
        key = next((o for o in q.options if o.is_correct), None)
        
        if key and str(user_ans) == str(key.option_index):
            correct += 1
            earned_difficulty += q.difficulty
    
    # RUMUS IRT SEDERHANA
    base_score = (earned_difficulty / total_difficulty * 1000) if total_difficulty > 0 else 0
    final_score = max(200, min(1000, base_score))
    
    db.add(models.ExamResult(user_id=u.id, exam_id=exam_id, correct_count=correct, wrong_count=len(e.questions)-correct, irt_score=round(final_score, 2)))
    db.commit()
    return {"score": final_score}

# --- LMS & MATERIALS ---
@app.get("/materials")
def get_mats(db: Session = Depends(get_db)): 
    return db.query(models.Material).all()

@app.post("/materials")
def add_mat(title:str=Form(...), type:str=Form(...), url:str=Form(...), category:str=Form(...), db:Session=Depends(get_db)):
    db.add(models.Material(title=title, type=type, content_url=url, category=category))
    db.commit()
    return {"msg":"OK"}

@app.delete("/materials/{mid}")
def del_mat(mid: int, db: Session = Depends(get_db)):
    db.query(models.Material).filter_by(id=mid).delete()
    db.commit()
    return {"msg":"Del"}