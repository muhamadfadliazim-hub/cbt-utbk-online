from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import pandas as pd
import io, os

app = FastAPI(title="EduPrime Ultimate V27")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- SCHEMAS ---
class LoginSchema(BaseModel): username: str; password: str
class UserCreateSchema(BaseModel): username: str; full_name: str; password: str; role: str
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str

# --- INITIALIZATION ---
@app.get("/init-admin")
def manual_init(db: Session = Depends(get_db)):
    models.Base.metadata.create_all(bind=database.engine)
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Muhamad Fadli Azim", role="admin"))
    db.commit()
    return {"message": "Sistem Siap"}

# --- AUTH & USER ---
@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    if u and u.password == data.password:
        return {"message": "OK", "username": u.username, "name": u.full_name, "role": u.role}
    raise HTTPException(400, "Gagal")

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    db.add(models.User(username=u.username, password=u.password, full_name=u.full_name, role=u.role))
    db.commit(); return {"message": "OK"}

# FITUR HAPUS MASAL PESERTA
@app.post("/admin/users/bulk-delete")
def bulk_delete_users(db: Session = Depends(get_db)):
    db.query(models.User).filter(models.User.role == "student").delete(synchronize_session=False)
    db.commit()
    return {"message": "Seluruh peserta berhasil dihapus"}

@app.post("/admin/users/bulk")
async def bulk_users(file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows():
        if not db.query(models.User).filter_by(username=str(r['username'])).first():
            db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name']), role='student'))
    db.commit(); return {"message": "Upload Berhasil"}

# --- EXAMS ENGINE (FIXED) ---
@app.post("/admin/periods")
def create_period(name: str = Form(...), exam_type: str = Form(...), db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type, is_active=True)
    db.add(p); db.commit(); db.refresh(p)
    st = {
        "UTBK": [("PU",30,"Penalaran Umum"), ("PBM",25,"Pemahaman Bacaan"), ("PPU",15,"Pengetahuan Umum"), ("PK",20,"Kuantitatif"), ("LBI",45,"Lit. Indonesia"), ("LBE",45,"Lit. Inggris"), ("PM",45,"Penalaran Matematika")],
        "CPNS": [("TWK",30,"Tes Wawasan Kebangsaan"), ("TIU",30,"Tes Intelegensia Umum"), ("TKP",45,"Tes Karakteristik Pribadi")]
    }
    for c, dur, title in st.get(exam_type, [("UMUM", 60, "Tes Umum")]):
        db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, code=c, title=title, duration=dur))
    db.commit(); return {"message": "OK"}

@app.delete("/admin/periods/{pid}")
def delete_period(pid: int, db: Session = Depends(get_db)):
    db.query(models.ExamPeriod).filter_by(id=pid).delete()
    db.commit(); return {"message": "Deleted"}

@app.get("/admin/periods")
def get_periods_admin(db: Session = Depends(get_db)):
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()

# (Endpoint LMS, Question Preview, Submit tetap ada seperti V26)
# --- LENGKAPI PREVIEW & DELETE QUESTION ---
@app.get("/admin/exams/{eid}/preview")
def preview_exam(eid: str, db: Session = Depends(get_db)):
    return db.query(models.Exam).filter_by(id=eid).options(joinedload(models.Exam.questions).joinedload(models.Question.options)).first()

@app.delete("/admin/questions/{qid}")
def delete_question(qid: int, db: Session = Depends(get_db)):
    db.query(models.Question).filter_by(id=qid).delete()
    db.commit(); return {"message": "Deleted"}

@app.get("/materials")
def get_materials(db: Session = Depends(get_db)): return db.query(models.Material).all()

@app.post("/materials")
def add_material(title: str=Form(...), type: str=Form(...), category: str=Form(...), url: str=Form(...), db: Session=Depends(get_db)):
    db.add(models.Material(title=title, type=type, category=category, content_url=url))
    db.commit(); return {"message": "OK"}

@app.delete("/materials/{mid}")
def delete_material(mid: int, db: Session = Depends(get_db)):
    db.query(models.Material).filter_by(id=mid).delete()
    db.commit(); return {"message": "Deleted"}

@app.post("/admin/upload-questions/{eid}")
async def upload_soal(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows():
        q = models.Question(exam_id=eid, text=str(r['Soal']), explanation=str(r.get('Pembahasan','')), difficulty=float(r.get('Kesulitan',1)))
        db.add(q); db.commit(); db.refresh(q)
        for char in ['A','B','C','D','E']:
            if pd.notna(r.get(f'Opsi{char}')):
                db.add(models.Option(question_id=q.id, option_index=char, label=str(r[f'Opsi{char}']), is_correct=(char == str(r['Kunci']).strip().upper())))
    db.commit(); return {"message": "OK"}