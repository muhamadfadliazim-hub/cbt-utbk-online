from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import pandas as pd
import io, os, uuid

app = FastAPI(title="EduPrime Intelligence System")

# Setup CORS agar Frontend bisa akses Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- SCHEMAS ---
class LoginSchema(BaseModel):
    username: str
    password: str

class UserCreateSchema(BaseModel):
    username: str
    full_name: str
    password: str
    role: str

class AnswerSchema(BaseModel):
    answers: Dict[str, Any]
    username: str

# --- INITIALIZATION ---
@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Muhamad Fadli Azim", role="admin"))
        db.commit()
    db.close()

@app.get("/init-admin")
def manual_init():
    startup_event()
    return {"message": "Sistem Berhasil Diinisialisasi"}

# --- AUTH ---
@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    if u and u.password == data.password:
        return {"message": "OK", "username": u.username, "name": u.full_name, "role": u.role}
    raise HTTPException(400, "Username/Password Salah")

# --- ADMIN: USER MANAGEMENT (TAMBAH/HAPUS) ---
@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=u.username).first():
        raise HTTPException(400, "Username sudah terdaftar")
    db.add(models.User(username=u.username, password=u.password, full_name=u.full_name, role=u.role))
    db.commit()
    return {"message": "Berhasil"}

@app.delete("/admin/users/{uid}")
def delete_user(uid: int, db: Session = Depends(get_db)):
    db.query(models.User).filter_by(id=uid).delete()
    db.commit()
    return {"message": "Terhapus"}

# --- ADMIN: OTOMATISASI SUBTES (UTBK, CPNS, MANDIRI, TKA) ---
@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()

@app.post("/admin/periods")
def create_period(name: str = Form(...), exam_type: str = Form(...), db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type, is_active=True)
    db.add(p); db.commit(); db.refresh(p)
    
    # LOGIKA STRUKTUR SUBTES
    st = {
        "UTBK": [("PU",30,"Penalaran Umum"), ("PBM",25,"Pemahaman Bacaan"), ("PPU",15,"Pengetahuan Umum"), ("PK",20,"Kuantitatif"), ("LBI",45,"Lit. Indonesia"), ("LBE",45,"Lit. Inggris"), ("PM",45,"Penalaran Matematika")],
        "CPNS": [("TWK",30,"Tes Wawasan Kebangsaan"), ("TIU",30,"Tes Intelegensia Umum"), ("TKP",45,"Tes Karakteristik Pribadi")],
        "MANDIRI": [("TPA",60,"Tes Potensi Akademik"), ("TBI",45,"Tes Bhs. Inggris")],
        "TKA": [("MAT",40,"Matematika"), ("FIS",40,"Fisika"), ("KIM",40,"Kimia"), ("BIO",40,"Biologi")]
    }
    
    exams = st.get(exam_type, [("UMUM", 60, "Tes Umum")])
    for code, dur, title in exams:
        db.add(models.Exam(id=f"P{p.id}_{code}", period_id=p.id, code=code, title=title, duration=dur))
    
    db.commit()
    return {"message": "Paket Berhasil Dibuat"}

@app.delete("/admin/periods/{pid}")
def delete_period(pid: int, db: Session = Depends(get_db)):
    db.query(models.ExamPeriod).filter_by(id=pid).delete()
    db.commit()
    return {"message": "Paket Dihapus"}

# --- ADMIN: PREVIEW & EDITOR SOAL ---
@app.get("/admin/exams/{eid}/preview")
def preview_exam(eid: str, db: Session = Depends(get_db)):
    return db.query(models.Exam).filter_by(id=eid).options(joinedload(models.Exam.questions).joinedload(models.Question.options)).first()

@app.delete("/admin/questions/{qid}")
def delete_question(qid: int, db: Session = Depends(get_db)):
    db.query(models.Question).filter_by(id=qid).delete()
    db.commit()
    return {"message": "Soal Dihapus"}

# --- STUDENT: SISTEM UJIAN ---
@app.get("/student/periods")
def get_student_periods(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    periods = db.query(models.ExamPeriod).filter_by(is_active=True).all()
    res = []
    for p in periods:
        exams = []
        for e in p.exams:
            res_exam = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=e.id).first()
            exams.append({
                "id": e.id, "title": e.title, "duration": e.duration, 
                "is_done": bool(res_exam), "score": res_exam.irt_score if res_exam else 0
            })
        res.append({"id": p.id, "name": p.name, "type": p.exam_type, "exams": exams})
    return res

@app.get("/exams/{eid}")
def get_exam_details(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    return {
        "id": e.id, "title": e.title, "duration": e.duration,
        "questions": [{"id": q.id, "text": q.text, "reading_material": q.reading_material, "options": [{"id": o.option_index, "label": o.label} for o in q.options]} for q in e.questions]
    }

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    exam = db.query(models.Exam).filter_by(id=exam_id).first()
    correct, earned = 0, 0.0
    for q in exam.questions:
        user_ans = data.answers.get(str(q.id))
        key = next((o for o in q.options if o.is_correct), None)
        if key and str(user_ans) == str(key.option_index):
            correct += 1
            earned += q.difficulty
    
    # Penilaian IRT (Skala 200-1000 untuk UTBK, 0-100 untuk lainnya)
    if exam.period.exam_type == "UTBK":
        total_w = sum(q.difficulty for q in exam.questions)
        score = (earned / total_w * 800) + 200 if total_w > 0 else 200
    else:
        score = (correct / len(exam.questions) * 100) if len(exam.questions) > 0 else 0

    db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct, wrong_count=len(exam.questions)-correct, irt_score=round(score,2)))
    db.commit()
    return {"score": score}

# --- LMS & MATERI ---
@app.get("/materials")
def get_materials(db: Session = Depends(get_db)):
    return db.query(models.Material).all()

@app.post("/materials")
def add_material(title: str = Form(...), type: str = Form(...), category: str = Form(...), url: str = Form(...), db: Session = Depends(get_db)):
    db.add(models.Material(title=title, type=type, category=category, content_url=url))
    db.commit(); return {"message": "OK"}

# --- EXCEL BULK UPLOAD SOAL ---
@app.post("/admin/upload-questions/{eid}")
async def upload_soal(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows():
        q = models.Question(exam_id=eid, text=str(r['Soal']), explanation=str(r.get('Pembahasan','')), difficulty=float(r.get('Kesulitan',1)))
        db.add(q); db.commit(); db.refresh(q)
        for char in ['A','B','C','D','E']:
            if pd.notna(r.get(f'Opsi{char}')):
                db.add(models.Option(question_id=q.id, option_index=char, label=str(r[f'Opsi{char}']), is_correct=(char == str(r['Kunci']).upper())))
    db.commit()
    return {"message": "Upload Berhasil"}