from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database, io
import pandas as pd
from datetime import datetime

app = FastAPI(title="EduPrime V41 Final Fix")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- PERBAIKAN SINTAKS: DIPECAH MENJADI BLOK STANDAR ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# SCHEMAS
class DeleteList(BaseModel): ids: List[int]
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class MajorSelect(BaseModel): username: str; m1: int; m2: int
class ManualQuestion(BaseModel): 
    text: str; difficulty: float; explanation: str; 
    passage: Optional[str]=None; media: Optional[str]=None; 
    type: str="PG"; options: List[Dict[str, Any]]

# INIT
@app.get("/init-admin")
def init(db: Session = Depends(get_db)):
    models.Base.metadata.create_all(bind=database.engine)
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Super Admin", role="admin"))
    db.commit()
    return {"status": "System Ready"}

# AUTH
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data['username']).first()
    if u and u.password == data['password']: 
        return {"username": u.username, "name": u.full_name, "role": u.role, "c1": u.choice1_id}
    raise HTTPException(400, "Gagal Login")

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): 
    return db.query(models.User).all()

@app.post("/admin/users/delete-list")
def delete_list(data: DeleteList, db: Session = Depends(get_db)):
    db.query(models.User).filter(models.User.id.in_(data.ids), models.User.role != 'admin').delete(synchronize_session=False)
    db.commit()
    return {"msg": "Deleted"}

@app.post("/admin/users")
def add_user_manual(data: dict, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=data['username']).first():
        raise HTTPException(400, "Username sudah ada")
    db.add(models.User(username=data['username'], password=data['password'], full_name=data['full_name'], role=data['role']))
    db.commit()
    return {"msg": "User Added"}

@app.post("/admin/users/bulk")
async def bulk_user(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        df = pd.read_excel(io.BytesIO(await file.read()))
        count = 0
        for _, r in df.iterrows():
            if not db.query(models.User).filter_by(username=str(r['username'])).first():
                role = str(r['role']) if 'role' in r and pd.notna(r['role']) else 'peserta'
                db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name']), role=role))
                count += 1
        db.commit()
        return {"msg": f"Berhasil menambah {count} peserta"}
    except Exception as e:
        raise HTTPException(400, f"Error file: {str(e)}")

# MAJORS
@app.post("/admin/majors/bulk")
async def bulk_majors(file: UploadFile = File(...), db: Session = Depends(get_db)):
    db.query(models.Major).delete()
    db.commit()
    df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows():
        pg = float(r['Passing_Grade']) if pd.notna(r['Passing_Grade']) else 0.0
        db.add(models.Major(university=r['Universitas'], program=r['Prodi'], passing_grade=pg))
    db.commit()
    return {"msg": "Updated"}

@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): 
    return db.query(models.Major).all()

@app.post("/student/majors")
def save_majors(data: MajorSelect, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    u.choice1_id = data.m1
    u.choice2_id = data.m2
    db.commit()
    return {"msg": "Saved"}

# EXAMS
@app.post("/admin/periods")
def create_period(name: str = Form(...), exam_type: str = Form(...), db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type)
    db.add(p)
    db.commit()
    db.refresh(p)
    struct = {
        "UTBK": [("PU", 30, 1), ("PPU", 25, 2), ("PBM", 25, 3), ("PK", 30, 4), ("LBI", 45, 5), ("LBE", 45, 6), ("PM", 45, 7)],
        "CPNS": [("TWK", 30, 1), ("TIU", 35, 2), ("TKP", 45, 3)],
        "TKA": [("MATE", 90, 1), ("FIS", 60, 2), ("KIM", 60, 3), ("BIO", 60, 4)],
        "MANDIRI": [("TPA", 60, 1), ("B.ING", 40, 2)]
    }
    for c, dur, order in struct.get(exam_type, [("UMUM", 60, 1)]):
        db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, title=c, duration=dur, order_index=order))
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

@app.post("/admin/upload-questions/{eid}")
async def upload_q(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    db.query(models.Question).filter_by(exam_id=eid).delete()
    
    for _, r in df.iterrows():
        tipe = str(r.get('Tipe', 'PG')).upper().strip()
        q = models.Question(
            exam_id=eid, question_type=tipe, text=str(r['Soal']),
            passage_text=str(r['Bacaan']) if pd.notna(r.get('Bacaan')) else None,
            media_url=str(r['Gambar']) if pd.notna(r.get('Gambar')) else None,
            explanation=str(r.get('Pembahasan', '')), difficulty=float(r.get('Kesulitan', 1.0)),
            correct_answer_isian=str(r['Kunci']) if tipe == 'ISIAN' else None
        )
        db.add(q)
        db.commit()
        db.refresh(q)
        
        if 'PG' in tipe:
            for char in ['A','B','C','D','E']:
                if pd.notna(r.get(f'Opsi{char}')):
                    db.add(models.Option(question_id=q.id, label=str(r[f'Opsi{char}']), option_index=char, is_correct=str(r.get('Kunci')).strip().upper() == char))
    db.commit()
    return {"msg": "OK"}

@app.post("/admin/exams/{eid}/manual")
def add_manual(eid: str, data: ManualQuestion, db: Session = Depends(get_db)):
    q = models.Question(exam_id=eid, text=data.text, difficulty=data.difficulty, explanation=data.explanation, passage_text=data.passage, media_url=data.media, question_type=data.type)
    db.add(q)
    db.commit()
    db.refresh(q)
    for opt in data.options:
        db.add(models.Option(question_id=q.id, label=opt['label'], option_index=opt['idx'], is_correct=opt['is_correct']))
    db.commit()
    return {"msg": "Saved"}

# STUDENT DATA
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
        if ex:
            history.append({"exam": ex.title, "score": res.irt_score, "correct": res.correct_count, "date": res.completed_at})

    return {"user": u, "periods": exam_list, "materials": mats, "history": history}

@app.get("/exams/{eid}")
def get_exam(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    return {
        "id":e.id, "title":e.title, "duration":e.duration,
        "questions": [{
            "id":q.id, "text":q.text, "passage":q.passage_text, "media":q.media_url, "type":q.question_type,
            "options": [{"id":o.option_index, "label":o.label, "val":o.boolean_val} for o in q.options]
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
        "title": e.title, "score": res.irt_score,
        "questions": [{
            "id": q.id, "text": q.text, "passage": q.passage_text, "media": q.media_url, "explanation": q.explanation,
            "user_answer": user_ans.get(str(q.id)),
            "options": [{"id":o.option_index, "label":o.label, "is_correct":o.is_correct} for o in q.options]
        } for q in e.questions]
    }

@app.post("/exams/{eid}/submit")
def submit(eid: str, data: AnswerSchema, db: Session = Depends(get_db)):
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
            
    score = (correct / len(e.questions) * 1000) if e.questions else 0
    db.add(models.ExamResult(user_id=u.id, exam_id=eid, irt_score=round(score,2), correct_count=correct, answers_json=data.answers))
    db.commit()
    return {"score": score}

# LMS
@app.get("/materials")
def get_mats_ep(db: Session = Depends(get_db)): 
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