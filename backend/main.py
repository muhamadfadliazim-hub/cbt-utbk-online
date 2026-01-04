from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database, io
import pandas as pd
from datetime import datetime

app = FastAPI(title="EduPrime V40 Complete")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# SCHEMAS
class DeleteList(BaseModel): ids: List[int]
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class MajorSelect(BaseModel): username: str; m1: int; m2: int
class ManualQuestion(BaseModel): 
    text: str; difficulty: float; explanation: str; 
    passage: Optional[str]=None; media: Optional[str]=None; 
    type: str="PG"; options: List[Dict[str, Any]]

# INIT ADMIN
@app.get("/init-admin")
def init(db: Session = Depends(get_db)):
    models.Base.metadata.create_all(bind=database.engine)
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Super Admin", role="admin"))
    db.commit(); return {"status": "V40 System Ready"}

# --- AUTH & USERS ---
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data['username']).first()
    if u and u.password == data['password']: return {"username": u.username, "name": u.full_name, "role": u.role, "c1": u.choice1_id}
    raise HTTPException(400, "Gagal Login")

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()

@app.post("/admin/users/delete-list")
def delete_list(data: DeleteList, db: Session = Depends(get_db)):
    db.query(models.User).filter(models.User.id.in_(data.ids), models.User.role != 'admin').delete(synchronize_session=False)
    db.commit(); return {"msg": "Deleted"}

@app.post("/admin/users/bulk")
async def bulk_user(file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    count = 0
    for _, r in df.iterrows():
        if not db.query(models.User).filter_by(username=str(r['username'])).first():
            db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name']), role='student'))
            count += 1
    db.commit(); return {"msg": f"Added {count} users"}

# --- JURUSAN ---
@app.post("/admin/majors/bulk")
async def bulk_majors(file: UploadFile = File(...), db: Session = Depends(get_db)):
    db.query(models.Major).delete(); db.commit()
    df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows():
        db.add(models.Major(university=r['Universitas'], program=r['Prodi'], passing_grade=float(r['Passing_Grade'])))
    db.commit(); return {"msg": "Updated"}

@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): return db.query(models.Major).all()

@app.post("/student/majors")
def save_majors(data: MajorSelect, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    u.choice1_id = data.m1; u.choice2_id = data.m2; db.commit(); return {"msg": "Saved"}

# --- UJIAN (PERIODE & SOAL) ---
@app.post("/admin/periods")
def create_period(name: str = Form(...), exam_type: str = Form(...), db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type)
    db.add(p); db.commit(); db.refresh(p)
    # STRUKTUR UTBK LENGKAP (7 SUBTES) + LITERASI
    struct = {
        "UTBK": [
            ("PU", 30, 1), ("PPU", 25, 2), ("PBM", 25, 3), ("PK", 30, 4), # TPS
            ("LBI", 45, 5), ("LBE", 45, 6), ("PM", 45, 7) # LITERASI
        ],
        "CPNS": [("TWK", 30, 1), ("TIU", 35, 2), ("TKP", 45, 3)],
        "TKA": [("MATE", 90, 1), ("FIS", 60, 2), ("KIM", 60, 3), ("BIO", 60, 4)],
        "MANDIRI": [("TPA", 60, 1), ("B.ING", 40, 2)]
    }
    for c, dur, order in struct.get(exam_type, [("UMUM", 60, 1)]):
        db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, title=c, duration=dur, order_index=order))
    db.commit(); return {"msg": "OK"}

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)): return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()

@app.delete("/admin/periods/{pid}")
def del_period(pid: int, db: Session = Depends(get_db)):
    db.query(models.ExamPeriod).filter_by(id=pid).delete(); db.commit(); return {"msg": "Del"}

@app.post("/admin/upload-questions/{eid}")
async def upload_q(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    db.query(models.Question).filter_by(exam_id=eid).delete()
    
    for _, r in df.iterrows():
        tipe = str(r.get('Tipe', 'PG')).upper().strip() # PG, PG_KOMPLEKS, ISIAN, BOOLEAN
        q = models.Question(
            exam_id=eid, question_type=tipe, text=str(r['Soal']),
            passage_text=str(r['Bacaan']) if pd.notna(r.get('Bacaan')) else None,
            media_url=str(r['Gambar']) if pd.notna(r.get('Gambar')) else None,
            explanation=str(r.get('Pembahasan', '')), 
            difficulty=float(r.get('Kesulitan', 1.0)),
            correct_answer_isian=str(r['Kunci']) if tipe == 'ISIAN' else None
        )
        db.add(q); db.commit(); db.refresh(q)
        
        # LOGIKA PARSING OPSI BERDASARKAN TIPE
        kunci = str(r.get('Kunci', '')).upper().strip()
        
        if tipe == 'PG':
            for char in ['A','B','C','D','E']:
                if pd.notna(r.get(f'Opsi{char}')):
                    is_c = (kunci == char)
                    db.add(models.Option(question_id=q.id, label=str(r[f'Opsi{char}']), option_index=char, is_correct=is_c))
        
        elif tipe == 'PG_KOMPLEKS': # Kunci misal "A,C"
            keys = [k.strip() for k in kunci.split(',')]
            for char in ['A','B','C','D','E']:
                if pd.notna(r.get(f'Opsi{char}')):
                    is_c = (char in keys)
                    db.add(models.Option(question_id=q.id, label=str(r[f'Opsi{char}']), option_index=char, is_correct=is_c))
        
        elif tipe == 'BOOLEAN': # OpsiA=Pernyataan1, Kunci="B,S" (B=Benar, S=Salah urut Opsi)
            keys = [k.strip() for k in kunci.split(',')] # ["B", "S", ...]
            chars = ['A','B','C','D','E']
            for i, k_val in enumerate(keys):
                if i < len(chars) and pd.notna(r.get(f'Opsi{chars[i]}')):
                    is_true = (k_val == 'B') # Kunci B berarti Pernyataan itu Benar
                    db.add(models.Option(question_id=q.id, label=str(r[f'Opsi{chars[i]}']), option_index=chars[i], boolean_val=is_true))

    db.commit(); return {"msg": "OK"}

# --- STUDENT EXAM FLOW & SCORING ---
@app.get("/student/data")
def student_data(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    ps = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
    mats = db.query(models.Material).all()
    
    exam_list = []
    for p in ps:
        exams = []
        for e in sorted(p.exams, key=lambda x: x.order_index):
            res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=e.id).first()
            exams.append({"id":e.id, "title":e.title, "duration":e.duration, "status":"done" if res else "open", "score":res.irt_score if res else 0})
        exam_list.append({"id":p.id, "name":p.name, "type":p.exam_type, "exams":exams})
    
    history = []
    results = db.query(models.ExamResult).filter_by(user_id=u.id).all()
    for res in results:
        ex = db.query(models.Exam).filter_by(id=res.exam_id).first()
        if ex: history.append({"exam": ex.title, "score": res.irt_score, "correct": res.correct_count, "date": res.completed_at})

    return {"user": u, "periods": exam_list, "materials": mats, "history": history}

@app.get("/exams/{eid}")
def get_exam(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    return {
        "id":e.id, "title":e.title, "duration":e.duration,
        "questions": [{
            "id":q.id, "text":q.text, "passage":q.passage_text, "media":q.media_url, "type":q.question_type,
            "options": [{"id":o.option_index, "label":o.label, "val":o.boolean_val} for o in q.options] # val untuk boolean check (di review)
        } for q in e.questions]
    }

@app.get("/exams/{eid}/review")
def get_review(eid: str, username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=eid).first()
    if not res: raise HTTPException(400, "Belum Dikerjakan")
    
    e = db.query(models.Exam).filter_by(id=eid).first()
    user_ans = res.answers_json or {}
    
    return {
        "title": e.title,
        "score": res.irt_score,
        "questions": [{
            "id": q.id, "text": q.text, "passage": q.passage_text, "media": q.media_url, "explanation": q.explanation, "type": q.question_type,
            "user_answer": user_ans.get(str(q.id)),
            "correct_isian": q.correct_answer_isian,
            "options": [{"id":o.option_index, "label":o.label, "is_correct":o.is_correct, "bool_val":o.boolean_val} for o in q.options]
        } for q in e.questions]
    }

@app.post("/exams/{eid}/submit")
def submit(eid: str, data: AnswerSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    e = db.query(models.Exam).filter_by(id=eid).first()
    correct_count = 0
    total_weight = 0
    earned_weight = 0
    
    for q in e.questions:
        ans = data.answers.get(str(q.id)) # Jawaban user
        total_weight += q.difficulty
        is_right = False
        
        if q.question_type == 'ISIAN':
            if ans and str(ans).strip().lower() == str(q.correct_answer_isian).strip().lower(): is_right = True
        
        elif q.question_type == 'PG':
            key = next((o for o in q.options if o.is_correct), None)
            if key and str(ans) == str(key.option_index): is_right = True
            
        elif q.question_type == 'PG_KOMPLEKS':
            # Ans berupa array ["A", "C"]. Harus sama persis dengan kunci.
            keys = sorted([o.option_index for o in q.options if o.is_correct])
            user_keys = sorted(ans) if isinstance(ans, list) else []
            if keys == user_keys: is_right = True
            
        elif q.question_type == 'BOOLEAN':
            # Ans berupa object {"A": "B", "B": "S"} (Opsi A dijawab Benar, B dijawab Salah)
            # Harus cocok semua baris
            all_match = True
            if isinstance(ans, dict):
                for o in q.options:
                    # User answer for this row (B/S)
                    ua = ans.get(o.option_index) 
                    # Key answer (B if boolean_val is True else S)
                    ka = "B" if o.boolean_val else "S"
                    if ua != ka: all_match = False
                if all_match: is_right = True
            else: is_right = False

        if is_right:
            correct_count += 1
            earned_weight += q.difficulty

    # IRT SIMPLIFIED CALCULATION
    final_score = (earned_weight / total_weight * 1000) if total_weight > 0 else 0
    
    db.add(models.ExamResult(user_id=u.id, exam_id=eid, irt_score=round(final_score,2), correct_count=correct_count, answers_json=data.answers))
    db.commit()
    return {"score": final_score}

# --- LMS ---
@app.get("/materials")
def get_mats_ep(db: Session = Depends(get_db)): return db.query(models.Material).all()
@app.post("/materials")
def add_mat(title:str=Form(...), type:str=Form(...), url:str=Form(...), category:str=Form(...), db:Session=Depends(get_db)):
    db.add(models.Material(title=title, type=type, content_url=url, category=category)); db.commit(); return {"msg":"OK"}
@app.delete("/materials/{mid}")
def del_mat(mid: int, db: Session = Depends(get_db)):
    db.query(models.Material).filter_by(id=mid).delete(); db.commit(); return {"msg":"Del"}