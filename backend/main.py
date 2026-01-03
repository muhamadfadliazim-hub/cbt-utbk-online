from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database, io
import pandas as pd
from datetime import datetime

app = FastAPI(title="EduPrime V32 Ultimate")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal(); try: yield db; finally: db.close()

# --- SCHEMAS ---
class DeleteList(BaseModel): ids: List[int]
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class MajorSelection(BaseModel): username: str; major1_id: int; major2_id: Optional[int] = None

# --- INIT ---
@app.get("/init-admin")
def init(db: Session = Depends(get_db)):
    models.Base.metadata.create_all(bind=database.engine)
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Fadli Owner", role="admin"))
    db.commit(); return {"status": "V32 Ready"}

# --- USER MANAGEMENT (FIX BULK DELETE) ---
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data['username']).first()
    if u and u.password == data['password']: return {"username": u.username, "name": u.full_name, "role": u.role, "choice1": u.choice1_id}
    raise HTTPException(400, "Gagal")

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()

@app.post("/admin/users/delete-list")
def delete_list(data: DeleteList, db: Session = Depends(get_db)):
    # Hapus berdasarkan List ID, Admin aman
    db.query(models.User).filter(models.User.id.in_(data.ids), models.User.role != 'admin').delete(synchronize_session=False)
    db.commit(); return {"msg": "Deleted"}

@app.post("/admin/users/bulk")
async def bulk_user(file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    count = 0
    for _, r in df.iterrows():
        if not db.query(models.User).filter_by(username=str(r['username'])).first():
            db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name'])))
            count += 1
    db.commit(); return {"msg": f"Added {count} users"}

# --- MAJORS & PASSING GRADE (NEW) ---
@app.post("/admin/majors/bulk")
async def bulk_majors(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Sesuai file passing_grade.xlsx Bapak (Universitas, Prodi, Passing_Grade)
    db.query(models.Major).delete(); db.commit() # Reset data lama
    df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows():
        db.add(models.Major(university=r['Universitas'], program=r['Prodi'], passing_grade=float(r['Passing_Grade'])))
    db.commit(); return {"msg": "Majors Updated"}

@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): return db.query(models.Major).all()

@app.post("/student/select-major")
def select_major(data: MajorSelection, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    u.choice1_id = data.major1_id; u.choice2_id = data.major2_id
    db.commit(); return {"msg": "Saved"}

# --- EXAM PERIODS (FIXED HIERARCHY) ---
@app.post("/admin/periods")
def create_period(name: str = Form(...), exam_type: str = Form(...), db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type)
    db.add(p); db.commit(); db.refresh(p)
    # Struktur Subtes Sesuai Tipe
    struct = {
        "UTBK": [("PU",30,1), ("PBM",25,2), ("PPU",15,3), ("PK",20,4), ("LBI",45,5), ("LBE",45,6), ("PM",45,7)],
        "CPNS": [("TWK",30,1), ("TIU",35,2), ("TKP",45,3)],
        "TKA": [("MATE",120,1), ("FIS",60,2), ("KIM",60,3), ("BIO",60,4)] # Contoh TKA Saintek
    }
    for code, dur, order in struct.get(exam_type, [("UMUM",60,1)]):
        db.add(models.Exam(id=f"P{p.id}_{code}", period_id=p.id, title=code, duration=dur, order_index=order))
    db.commit(); return {"msg": "OK"}

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)): return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()

# --- QUESTION IMPORT (FIXED FOR YOUR EXCEL) ---
@app.post("/admin/upload-questions/{eid}")
async def upload_q(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    db.query(models.Question).filter_by(exam_id=eid).delete() # Reset soal lama di subtes ini
    
    for _, r in df.iterrows():
        # Mapping kolom Excel Bapak ke Database V32
        tipe = str(r.get('Tipe', 'PG')).upper()
        q = models.Question(
            exam_id=eid,
            question_type=tipe,
            text=str(r['Soal']),
            passage_text=str(r['Bacaan']) if pd.notna(r.get('Bacaan')) else None,
            media_url=str(r['Gambar']) if pd.notna(r.get('Gambar')) else None,
            difficulty=1.0, # Default, nanti bisa IRT
            correct_answer_isian=str(r['Kunci']) if tipe == 'ISIAN' else None
        )
        db.add(q); db.commit(); db.refresh(q)
        
        if tipe != 'ISIAN':
            # Handle opsi PG
            for char in ['A','B','C','D','E']:
                col_name = f'Opsi{char}'
                if pd.notna(r.get(col_name)):
                    is_corr = str(r.get('Kunci')).strip().upper() == char
                    db.add(models.Option(question_id=q.id, label=str(r[col_name]), option_index=char, is_correct=is_corr))
    db.commit(); return {"msg": "Excel Uploaded Successfully"}

# --- STUDENT EXAM & IRT ---
@app.get("/student/data")
def student_dashboard_data(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).options(joinedload(models.User.results)).first()
    periods = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
    
    # Struktur Data untuk Frontend
    exam_data = []
    for p in periods:
        exams = []
        for e in sorted(p.exams, key=lambda x: x.order_index):
            res = next((r for r in u.results if r.exam_id == e.id), None)
            exams.append({
                "id": e.id, "title": e.title, "duration": e.duration, 
                "status": "done" if res else "open", "score": res.irt_score if res else 0
            })
        exam_data.append({"id": p.id, "name": p.name, "type": p.exam_type, "exams": exams})
        
    return {"user": u, "periods": exam_data}

@app.get("/exams/{eid}")
def get_exam_content(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    return {
        "id": e.id, "duration": e.duration, "title": e.title,
        "questions": [{
            "id": q.id, "text": q.text, "passage": q.passage_text, "type": q.question_type, "media": q.media_url,
            "options": [{"id": o.option_index, "label": o.label} for o in q.options]
        } for q in e.questions]
    }

@app.post("/exams/{eid}/submit")
def submit_exam(eid: str, data: AnswerSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    e = db.query(models.Exam).filter_by(id=eid).first()
    correct = 0
    
    for q in e.questions:
        ans = data.answers.get(str(q.id))
        if q.question_type == 'ISIAN':
            if ans and str(ans).strip().lower() == str(q.correct_answer_isian).strip().lower(): correct += 1
        else:
            key = next((o for o in q.options if o.is_correct), None)
            if key and str(ans) == str(key.option_index): correct += 1
            
    # IRT Simulation (Simplified for MVP)
    score = (correct / len(e.questions)) * 1000 if e.questions else 0
    db.add(models.ExamResult(user_id=u.id, exam_id=eid, irt_score=score, correct_count=correct, answers_json=data.answers))
    db.commit()
    return {"score": score}

@app.get("/materials") # LMS
def get_mats(db: Session = Depends(get_db)): return db.query(models.Material).all()
@app.post("/materials")
def add_mat(title:str=Form(...), type:str=Form(...), url:str=Form(...), category:str=Form(...), db:Session=Depends(get_db)):
    db.add(models.Material(title=title, type=type, content_url=url, category=category)); db.commit(); return {"msg":"OK"}
@app.delete("/materials/{mid}")
def del_mat(mid: int, db: Session = Depends(get_db)):
    db.query(models.Material).filter_by(id=mid).delete(); db.commit(); return {"msg":"Del"}