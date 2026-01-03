from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import pandas as pd
import io, os

app = FastAPI(title="EduPrime Ultimate V29")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- SCHEMAS ---
class LoginSchema(BaseModel): username: str; password: str
class UserCreate(BaseModel): username: str; full_name: str; password: str; role: str
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class ManualSoalSchema(BaseModel): text: str; difficulty: float; explanation: str; options: List[Dict[str, Any]]

# --- INITIALIZATION ---
@app.get("/init-admin")
def manual_init(db: Session = Depends(get_db)):
    models.Base.metadata.create_all(bind=database.engine)
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Muhamad Fadli Azim", role="admin"))
    if not db.query(models.Major).first():
        majors = [
            {"uni": "Universitas Indonesia", "name": "Kedokteran", "pg": 750},
            {"uni": "ITB", "name": "STEI Komputasi", "pg": 780},
            {"uni": "UGM", "name": "Hukum", "pg": 710}
        ]
        for m in majors: db.add(models.Major(university=m['uni'], name=m['name'], passing_grade=m['pg']))
    db.commit()
    return {"status": "Database Ready"}

# --- AUTH & USERS ---
@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    if u and u.password == data.password:
        return {"username": u.username, "name": u.full_name, "role": u.role, "choice_id": u.choice1_id}
    raise HTTPException(400, "Login Gagal")

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()

@app.post("/admin/users/bulk-delete")
def bulk_delete(db: Session = Depends(get_db)):
    db.query(models.User).filter(models.User.role == "student").delete()
    db.commit(); return {"msg": "Sukses"}

@app.post("/admin/users/bulk")
async def bulk_users_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows():
        if not db.query(models.User).filter_by(username=str(r['username'])).first():
            db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name']), role='student'))
    db.commit(); return {"msg": "Impor Berhasil"}

# --- EXAMS & QUESTIONS ---
@app.get("/admin/periods")
def get_periods_admin(db: Session = Depends(get_db)):
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()

@app.post("/admin/periods")
def create_period(name: str = Form(...), exam_type: str = Form(...), db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type, is_active=True)
    db.add(p); db.commit(); db.refresh(p)
    st = {
        "UTBK": [("PU",30,"Penalaran Umum"), ("PBM",25,"Pemahaman Bacaan"), ("PK",20,"Kuantitatif")],
        "CPNS": [("TWK",30,"TWK"), ("TIU",35,"TIU"), ("TKP",45,"TKP")]
    }
    for c, dur, title in st.get(exam_type, [("UMUM", 60, "Tes Umum")]):
        db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, title=title, duration=dur))
    db.commit(); return {"msg": "OK"}

@app.post("/admin/exams/{eid}/manual")
def add_manual_soal(eid: str, data: ManualSoalSchema, db: Session = Depends(get_db)):
    q = models.Question(exam_id=eid, text=data.text, difficulty=data.difficulty, explanation=data.explanation)
    db.add(q); db.commit(); db.refresh(q)
    for opt in data.options:
        db.add(models.Option(question_id=q.id, label=opt['label'], option_index=opt['idx'], is_correct=opt['is_correct']))
    db.commit(); return {"msg": "OK"}

# --- STUDENT ENGINE ---
@app.get("/student/periods")
def get_student_exams(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    ps = db.query(models.ExamPeriod).all()
    return [{"id":p.id,"name":p.name,"type":p.exam_type,"exams":[{"id":e.id,"title":e.title,"duration":e.duration,"is_done":bool(db.query(models.ExamResult).filter_by(user_id=u.id,exam_id=e.id).first())} for e in p.exams]} for p in ps]

@app.get("/exams/{eid}")
def get_exam_detail(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    return {"id":e.id,"title":e.title,"duration":e.duration,"questions":[{"id":q.id,"text":q.text,"options":[{"id":o.option_index,"label":o.label} for o in q.options]} for q in e.questions]}

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    exam = db.query(models.Exam).filter_by(id=exam_id).first()
    correct, earned = 0, 0.0
    for q in exam.questions:
        user_ans = data.answers.get(str(q.id))
        key = next((o for o in q.options if o.is_correct), None)
        if key and str(user_ans) == str(key.option_index):
            correct += 1; earned += q.difficulty
    score = (earned / sum(q.difficulty for q in exam.questions) * 800) + 200 if exam.questions else 200
    db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct, wrong_count=len(exam.questions)-correct, irt_score=round(score,2)))
    db.commit(); return {"score": score}

# --- LMS ---
@app.get("/materials")
def get_materials(db: Session = Depends(get_db)): return db.query(models.Material).all()

@app.post("/materials")
def add_material(title: str=Form(...), type: str=Form(...), category: str=Form(...), url: str=Form(...), db: Session=Depends(get_db)):
    db.add(models.Material(title=title, type=type, category=category, content_url=url))
    db.commit(); return {"message": "OK"}