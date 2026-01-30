from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Boolean, Text, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session, joinedload
from sqlalchemy import func, desc, distinct
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import pandas as pd
import io
import os
import qrcode
import traceback
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

# ==========================================
# 1. KONFIGURASI DATABASE
# ==========================================
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local_cbt.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if "sqlite" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# 2. MODEL DATABASE
# ==========================================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)
    role = Column(String, default="student") 
    school = Column(String, nullable=True)
    choice1_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    choice2_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    results = relationship("ExamResult", back_populates="user")

class Major(Base):
    __tablename__ = "majors"
    id = Column(Integer, primary_key=True, index=True)
    university = Column(String)
    name = Column(String)
    passing_grade = Column(Float)

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    exam_type = Column(String)
    is_active = Column(Boolean, default=False)
    allowed_usernames = Column(Text, nullable=True) 
    target_schools = Column(Text, nullable=True)
    # Cascade Delete: Hapus periode -> Hapus ujian juga
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True) 
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    code = Column(String) 
    title = Column(String)
    duration = Column(Float) # Support Desimal
    period = relationship("ExamPeriod", back_populates="exams")
    # Cascade Delete: Hapus ujian -> Hapus soal juga
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(String, ForeignKey("exams.id"))
    text = Column(Text) 
    type = Column(String, default="multiple_choice") 
    difficulty = Column(Float, default=1.0)
    image_url = Column(String, nullable=True)
    reading_material = Column(Text, nullable=True) 
    explanation = Column(Text, nullable=True)     
    label1 = Column(String, default="Benar") 
    label2 = Column(String, default="Salah")
    stats_correct = Column(Integer, default=0)
    stats_total = Column(Integer, default=0)
    # Cascade Delete: Hapus soal -> Hapus opsi juga
    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")
    exam = relationship("Exam", back_populates="questions")

class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    label = Column(Text) 
    option_index = Column(String) 
    is_correct = Column(Boolean, default=False)
    question = relationship("Question", back_populates="options")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exam_id = Column(String)
    correct_count = Column(Integer)
    wrong_count = Column(Integer)
    irt_score = Column(Float) 
    user = relationship("User", back_populates="results")

class SystemConfig(Base):
    __tablename__ = "system_configs"
    key = Column(String, primary_key=True)
    value = Column(String)

# ==========================================
# 3. SCHEMAS
# ==========================================
class LoginSchema(BaseModel):
    username: str
    password: str
class AnswerSchema(BaseModel):
    answers: Dict[str, Any]
    username: str
class UserCreateSchema(BaseModel):
    username: str
    full_name: str
    password: str
    role: str = "student"
    school: Optional[str] = None
class BulkDeleteSchema(BaseModel):
    user_ids: List[int]
class MajorSelectionSchema(BaseModel):
    username: str
    choice1_id: int
    choice2_id: Optional[int] = None
class ConfigSchema(BaseModel):
    value: str
class PeriodCreateSchema(BaseModel): 
    name: str
    target_schools: Optional[str] = None
    exam_type: str = "UTBK"
    mode: str = "standard"
class QuestionUpdateSchema(BaseModel):
    text: str
    explanation: Optional[str] = None
    reading_material: Optional[str] = None
    key: str
    label1: Optional[str] = "Benar"
    label2: Optional[str] = "Salah"
class InstituteConfigSchema(BaseModel):
    name: str
    city: str
    signer_name: str
    signer_jabatan: str
    signer_nip: str

# ==========================================
# 4. APP & ENDPOINTS UTAMA
# ==========================================

app = FastAPI(title="CBT UTBK System - Ultimate Fix")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        print(">>> SUKSES: Database Ready <<<")
    except Exception as e:
        print(f">>> DB ERROR: {str(e)} <<<")

app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend Siap. Silakan akses."}

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=data.username).first()
    if user and user.password == data.password:
        c1 = db.query(Major).filter_by(id=user.choice1_id).first()
        c2 = db.query(Major).filter_by(id=user.choice2_id).first()
        return {
            "message": "OK", "username": user.username, "name": user.full_name, "role": user.role, "school": user.school,
            "choice1_id": user.choice1_id, "choice2_id": user.choice2_id,
            "display1": f"{c1.university} - {c1.name}" if c1 else "", "pg1": c1.passing_grade if c1 else 0,
            "display2": f"{c2.university} - {c2.name}" if c2 else "", "pg2": c2.passing_grade if c2 else 0
        }
    raise HTTPException(400, "Login Gagal.")

@app.get("/admin/schools-list")
def get_schools_list(db: Session = Depends(get_db)):
    return [s[0] for s in db.query(distinct(User.school)).filter(User.school != None, User.school != "").all()]

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(User).all()

@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    db.add(User(username=u.username, password=u.password, full_name=u.full_name, role=u.role, school=u.school))
    db.commit()
    return {"message":"OK"}

@app.post("/admin/users/delete-bulk")
def del_users(d: BulkDeleteSchema, db: Session = Depends(get_db)):
    db.query(User).filter(User.id.in_(d.user_ids)).delete(synchronize_session=False); db.commit()
    return {"message":"OK"}

@app.post("/admin/users/bulk")
async def bulk_user_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(content))
        df.columns = df.columns.str.strip().str.lower()
        added = 0
        for _, r in df.iterrows():
            uname = str(r['username']).strip()
            if db.query(User).filter_by(username=uname).first(): continue
            sch = next((str(r[k]).strip() for k in ['sekolah','cabang','unit','school'] if k in r and pd.notna(r[k])), None)
            db.add(User(username=uname, password=str(r['password']).strip(), full_name=str(r['full_name']).strip(), role=str(r.get('role','student')).strip(), school=sch))
            added += 1
        db.commit()
        return {"message": f"Sukses {added} user"}
    except Exception as e: return {"message": str(e)}

# --- PERIODE & UJIAN (FIXED DELETE) ---

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    periods = db.query(ExamPeriod).order_by(ExamPeriod.id.desc()).options(joinedload(ExamPeriod.exams).joinedload(Exam.questions)).all()
    res = []
    for p in periods:
        exams_info = [{"id": e.id, "title": e.title, "code": e.code, "duration": e.duration, "q_count": len(e.questions)} for e in p.exams]
        res.append({"id": p.id, "name": p.name, "target_schools": p.target_schools, "is_active": p.is_active, "type": p.exam_type, "exams": exams_info})
    return res

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p = ExamPeriod(name=d.name, exam_type=f"{d.exam_type}_{d.mode.upper()}", target_schools=d.target_schools)
    db.add(p); db.commit(); db.refresh(p)
    codes = [("PU", 30), ("PPU", 15), ("PBM", 25), ("PK", 20), ("LBI", 42.5), ("LBE", 20), ("PM", 42.5)]
    for c, dur in codes:
        db.add(Exam(id=f"P{p.id}_{c}", period_id=p.id, code=c, title=f"Tes {c}", duration=dur))
    db.commit()
    return {"message": "OK"}

@app.delete("/admin/periods/{pid}")
def delete_period(pid: int, db: Session = Depends(get_db)):
    # PERBAIKAN: Gunakan db.delete(obj) agar CASCADE DELETE jalan
    p = db.query(ExamPeriod).filter_by(id=pid).first()
    if not p: raise HTTPException(404, "Periode tidak ditemukan")
    db.delete(p)
    db.commit()
    return {"message": "Berhasil Dihapus Tuntas"}

@app.post("/admin/periods/{pid}/toggle")
def toggle_period(pid: int, d: Dict[str, bool], db: Session = Depends(get_db)):
    p = db.query(ExamPeriod).filter_by(id=pid).first()
    if p: p.is_active = d['is_active']; db.commit()
    return {"message": "OK"}

# --- JURUSAN & UPLOAD ---

@app.get("/majors")
def get_majors(db: Session = Depends(get_db)):
    return db.query(Major).all()

@app.post("/users/select-major")
def set_major(d: MajorSelectionSchema, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(username=d.username).first()
    u.choice1_id = d.choice1_id; u.choice2_id = d.choice2_id; db.commit()
    return {"message":"OK"}

@app.post("/admin/upload-majors")
async def upload_majors(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(content))
        df.columns = df.columns.str.strip().str.lower()
        db.query(Major).delete(); db.commit()
        count = 0
        for _, r in df.iterrows():
            if pd.notna(r['universitas']):
                db.add(Major(university=str(r['universitas']).strip(), name=str(r['prodi']).strip(), passing_grade=float(r['passing_grade'])))
                count += 1
        db.commit()
        return {"message": f"Sukses! {count} Jurusan berhasil diimport."}
    except Exception as e: return {"message": str(e)}

# --- SOAL & UPLOAD ---

@app.get("/admin/exams/{eid}/preview") 
def admin_preview_exam(eid: str, db: Session = Depends(get_db)): return get_exam_detail(eid, db)

@app.get("/exams/{eid}") 
def get_exam_detail(eid: str, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter_by(id=eid).first()
    if not exam: raise HTTPException(404)
    qs = []
    for q in exam.questions:
        options_list = [{"id": o.option_index, "label": o.label, "is_correct": o.is_correct} for o in q.options]
        qs.append({"id": q.id, "type": q.type, "text": q.text, "reading_material": q.reading_material, "explanation": q.explanation, "image_url": q.image_url, "difficulty": q.difficulty, "label1": q.label1, "label2": q.label2, "stats": {"correct": q.stats_correct, "total": q.stats_total}, "options": options_list})
    return {"id": exam.id, "title": exam.title, "duration": exam.duration, "questions": qs}

@app.put("/admin/questions/{qid}")
def update_question(qid: int, d: QuestionUpdateSchema, db: Session = Depends(get_db)):
    q = db.query(Question).filter_by(id=qid).first()
    if not q: raise HTTPException(404)
    q.text = d.text; q.explanation = d.explanation; q.reading_material = d.reading_material; q.label1 = d.label1; q.label2 = d.label2
    if q.type == 'multiple_choice':
        for opt in db.query(Option).filter_by(question_id=qid).all():
            opt.is_correct = (opt.option_index == d.key)
    db.commit()
    return {"message": "Updated"}

@app.post("/admin/upload-questions/{eid}")
async def upload_questions(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(content))
        df.columns = df.columns.str.strip().str.lower()
        db.query(Question).filter_by(exam_id=eid).delete(); db.commit()
        count = 0
        for _, r in df.iterrows():
            q_type = 'multiple_choice'
            raw_type = str(r.get('tipe', 'PG')).upper()
            if 'ISIAN' in raw_type: q_type = 'short_answer'
            elif 'KOMPLEKS' in raw_type: q_type = 'complex'
            elif 'TABEL' in raw_type: q_type = 'table_boolean'
            
            q = Question(exam_id=eid, text=str(r.get('soal','-')), type=q_type, difficulty=float(r.get('kesulitan',1)), reading_material=str(r.get('bacaan')), explanation=str(r.get('pembahasan')), image_url=str(r.get('gambar')), label1=str(r.get('label1','Benar')), label2=str(r.get('label2','Salah')))
            db.add(q); db.commit()
            
            k = str(r.get('kunci','')).strip().upper()
            if q_type == 'table_boolean':
                keys = [x.strip() for x in k.split(',')]
                for i, c in enumerate(['a','b','c','d','e']):
                    if f"opsi{c}" in r and pd.notna(r[f"opsi{c}"]):
                        db.add(Option(question_id=q.id, option_index=str(i+1), label=str(r[f"opsi{c}"]), is_correct=(i<len(keys) and keys[i]=='B')))
            elif q_type == 'short_answer':
                db.add(Option(question_id=q.id, option_index='KEY', label=k, is_correct=True))
            elif q_type == 'multiple_choice':
                for c in ['a','b','c','d','e']:
                    if f"opsi{c}" in r and pd.notna(r[f"opsi{c}"]):
                        db.add(Option(question_id=q.id, option_index=c.upper(), label=str(r[f"opsi{c}"]), is_correct=(c.upper()==k)))
            elif q_type == 'complex':
                valid_keys = [x.strip() for x in k.split(',')]
                for c in ['a','b','c','d','e']:
                    if f"opsi{c}" in r and pd.notna(r[f"opsi{c}"]):
                        db.add(Option(question_id=q.id, option_index=c.upper(), label=str(r[f"opsi{c}"]), is_correct=(c.upper() in valid_keys)))
            count += 1
        db.commit()
        return {"message": f"Berhasil upload {count} soal"}
    except Exception as e: return {"message": str(e)}

@app.delete("/admin/results/reset")
def reset_student_result(user_id: int, period_id: int, db: Session = Depends(get_db)):
    exams = db.query(Exam).filter_by(period_id=period_id).all()
    exam_ids = [e.id for e in exams]
    if exam_ids:
        db.query(ExamResult).filter(ExamResult.user_id == user_id, ExamResult.exam_id.in_(exam_ids)).delete(synchronize_session=False)
        db.commit()
    return {"message": "Hasil ujian siswa berhasil direset."}

@app.delete("/admin/exams/{eid}/reset")
def reset_exam_questions(eid: str, db: Session = Depends(get_db)):
    db.query(Question).filter_by(exam_id=eid).delete()
    db.commit()
    return {"message": "Soal ujian berhasil dikosongkan."}

# --- STATS & SISWA ---

@app.get("/student/dashboard-stats")
def get_stats(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=username).first()
    if not user: raise HTTPException(404, "User tidak ditemukan")
    config_release = db.query(SystemConfig).filter_by(key="release_announcement").first()
    is_released = (config_release.value == "true") if config_release else False
    if not is_released: return {"is_released": False}

    total_score = 0; subtest_details = []; subtest_scores_map = {}
    results = db.query(ExamResult).filter_by(user_id=user.id).all()
    for r in results:
        exam = db.query(Exam).filter_by(id=r.exam_id).first()
        title = exam.title if exam else r.exam_id; code = exam.code if exam else "Lainnya"
        subtest_details.append({"id": r.exam_id, "code": code, "subject": title, "correct": r.correct_count, "wrong": r.wrong_count, "score": r.irt_score})
        if code not in subtest_scores_map: subtest_scores_map[code] = []
        subtest_scores_map[code].append(r.irt_score)
        total_score += r.irt_score

    avg_score = int(total_score / 7) if total_score > 0 else 0
    c1 = db.query(Major).filter_by(id=user.choice1_id).first()
    c2 = db.query(Major).filter_by(id=user.choice2_id).first()
    status_text = "TIDAK LULUS"; status_color = "red"
    if c1 and avg_score >= c1.passing_grade: status_text = f"LULUS PILIHAN 1: {c1.university} - {c1.name}"; status_color = "green"
    elif c2 and avg_score >= c2.passing_grade: status_text = f"LULUS PILIHAN 2: {c2.university} - {c2.name}"; status_color = "blue"

    all_results = db.query(User.full_name, func.sum(ExamResult.irt_score).label('total_score')).join(ExamResult).filter(User.role == 'student').group_by(User.id).order_by(desc('total_score')).limit(10).all()
    leaderboard = [{"rank": i + 1, "name": r[0], "score": int(r[1])} for i, r in enumerate(all_results)]
    
    radar_data = []
    for c in ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"]:
        scores = subtest_scores_map.get(c, []); s_avg = sum(scores) / len(scores) if scores else 0
        radar_data.append({"subject": c, "score": int(s_avg), "fullMark": 1000})
        
    return {"is_released": True, "average": avg_score, "total": total_score, "status": status_text, "status_color": status_color, "details": subtest_details, "choice1": f"{c1.university} - {c1.name}" if c1 else "-", "choice2": f"{c2.university} - {c2.name}" if c2 else "-", "leaderboard": leaderboard, "radar": radar_data}

@app.get("/student/review/{exam_id}")
def get_exam_review(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter_by(id=exam_id).first()
    if not exam: raise HTTPException(404)
    qs = []
    for q in exam.questions:
        key_label = next((f"{o.option_index}. {o.label}" for o in q.options if o.is_correct), "")
        qs.append({"id": q.id, "text": q.text, "image_url": q.image_url, "reading_material": q.reading_material, "explanation": q.explanation, "correct_answer": key_label})
    return {"title": exam.title, "questions": qs}

@app.get("/student/periods")
def get_student_periods(username: str, db: Session = Depends(get_db)):
    periods = db.query(ExamPeriod).filter_by(is_active=True).order_by(ExamPeriod.id.desc()).all()
    user = db.query(User).filter_by(username=username).first()
    res = []
    for p in periods:
        if p.allowed_usernames and username.lower() not in p.allowed_usernames.lower(): continue
        exams_data = []
        for e in p.exams:
            is_done = db.query(ExamResult).filter_by(user_id=user.id, exam_id=e.id).first() is not None
            exams_data.append({"id": e.id, "title": e.title, "code": e.code, "duration": e.duration, "is_done": is_done, "q_count": len(e.questions)})
        res.append({"id": p.id, "name": p.name, "type": p.exam_type, "mode": p.target_schools or "standard", "exams": exams_data})
    return res

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=data.username).first()
    if not user: raise HTTPException(404)
    if db.query(ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first(): return {"message": "Already Submitted", "score": 0}
    
    questions = db.query(Question).filter_by(exam_id=exam_id).all()
    correct_count = 0; total_diff_earned = 0.0; total_diff_possible = 0.0
    for q in questions:
        total_diff_possible += q.difficulty
        user_ans = data.answers.get(str(q.id)); is_correct = False
        if not user_ans: is_correct = False
        elif q.type == 'table_boolean' and isinstance(user_ans, dict):
            is_correct = all(user_ans.get(str(opt.option_index)) == ("B" if opt.is_correct else "S") for opt in q.options)
        elif q.type == 'short_answer':
            key_opt = next((o for o in q.options if o.is_correct), None)
            if key_opt and str(user_ans).strip().lower() == key_opt.label.strip().lower(): is_correct = True
        elif q.type == 'complex':
            correct_ids = {o.option_index for o in q.options if o.is_correct}
            user_ids = set(user_ans) if isinstance(user_ans, list) else {user_ans}
            if correct_ids == user_ids: is_correct = True
        else:
            key_opt = next((o for o in q.options if o.is_correct), None)
            if key_opt and str(user_ans) == str(key_opt.option_index): is_correct = True
        
        q.stats_total += 1
        if is_correct:
            correct_count += 1; total_diff_earned += q.difficulty; q.stats_correct += 1
            
    ratio = total_diff_earned / total_diff_possible if total_diff_possible > 0 else 0
    final_score = 200 + (ratio * 800)
    db.add(ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct_count, wrong_count=len(questions)-correct_count, irt_score=final_score))
    db.commit()
    return {"message": "Saved", "score": final_score}

# --- REKAP & CONFIG ---

@app.post("/admin/config/institute")
def save_institute_config(d: InstituteConfigSchema, db: Session = Depends(get_db)):
    for k, v in {"institute_name": d.name, "institute_city": d.city, "signer_name": d.signer_name, "signer_jabatan": d.signer_jabatan, "signer_nip": d.signer_nip}.items():
        c = db.query(SystemConfig).filter_by(key=k).first()
        if c: c.value = v
        else: db.add(SystemConfig(key=k, value=v))
    db.commit()
    return {"message": "Saved"}

@app.get("/admin/config/institute")
def get_institute_config(db: Session = Depends(get_db)):
    res = {}
    for k in ["institute_name", "institute_city", "signer_name", "signer_jabatan", "signer_nip"]:
        c = db.query(SystemConfig).filter_by(key=k).first()
        res[k] = c.value if c else ""
    return res

def get_recap_data_internal(period_id, db):
    q = db.query(ExamResult).join(User).filter(User.role == 'student')
    if period_id: q = q.filter(ExamResult.exam_id.like(f"P{period_id}_%"))
    user_map = {}
    for r in q.all():
        if r.user_id not in user_map: user_map[r.user_id] = {"id": r.user.id, "name": r.user.full_name, "school": r.user.school or "-", "choice1": r.user.choice1_id, "choice2": r.user.choice2_id, "scores": {}}
        user_map[r.user_id]["scores"][r.exam_id.split('_')[-1]] = r.irt_score
    
    data = []
    for uid, u in user_map.items():
        row = {"name": u["name"], "school": u["school"]}
        total = 0
        for c in ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"]:
            sc = int(u["scores"].get(c, 0)); row[c] = sc; total += sc
        row["average"] = int(total/7)
        c1 = db.query(Major).filter_by(id=u["choice1"]).first(); c2 = db.query(Major).filter_by(id=u["choice2"]).first()
        if c1 and row["average"] >= c1.passing_grade: row["status"] = f"LULUS {c1.university}"
        elif c2 and row["average"] >= c2.passing_grade: row["status"] = f"LULUS {c2.university}"
        else: row["status"] = "TIDAK LULUS"
        data.append(row)
    return sorted(data, key=lambda x: x['average'], reverse=True)

@app.get("/admin/recap/download-pdf")
def download_pdf(period_id: Optional[str]=None, db: Session=Depends(get_db)):
    data = get_recap_data_internal(period_id, db); conf = get_institute_config(db)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), rightMargin=20, leftMargin=20, topMargin=30, bottomMargin=30)
    elements = []; styles = getSampleStyleSheet()
    elements.append(Paragraph(conf.get("institute_name", "LEMBAGA PENDIDIKAN"), ParagraphStyle(name='Title', parent=styles['Heading1'], alignment=TA_CENTER, fontSize=16)))
    elements.append(Spacer(1, 20))
    headers = ["No", "Nama", "Sekolah", "PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM", "Avg", "Status"]
    table_data = [headers] + [[str(i+1), r['name'][:20], r['school'][:10], r['PU'], r['PPU'], r['PBM'], r['PK'], r['LBI'], r['LBE'], r['PM'], r['average'], r['status']] for i, r in enumerate(data)]
    t = Table(table_data, colWidths=[25, 130, 80, 35, 35, 35, 35, 35, 35, 35, 40, 150])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor("#1e293b")), ('TEXTCOLOR',(0,0),(-1,0),colors.white), ('GRID',(0,0),(-1,-1),0.5,colors.grey), ('FONTSIZE',(0,0),(-1,-1),8)]))
    elements.append(t)
    doc.build(elements); buffer.seek(0)
    return StreamingResponse(buffer, media_type='application/pdf', headers={'Content-Disposition': 'attachment; filename="Rekap.pdf"'})

@app.get("/admin/recap/download")
def download_excel(period_id: Optional[str]=None, db: Session=Depends(get_db)):
    data = get_recap_data_internal(period_id, db)
    df = pd.DataFrame(data)
    out = io.BytesIO()
    with pd.ExcelWriter(out, engine='xlsxwriter') as writer: df.to_excel(writer, index=False)
    out.seek(0)
    return StreamingResponse(out, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers={'Content-Disposition': 'attachment; filename="Rekap.xlsx"'})

@app.get("/admin/download-template")
def dl_template():
    df = pd.DataFrame([{"Tipe":"PG", "Soal":"...", "OpsiA":"A", "Kunci":"A", "Kesulitan":1, "Label1":"Benar", "Label2":"Salah"}])
    out = io.BytesIO()
    with pd.ExcelWriter(out, engine='xlsxwriter') as writer: df.to_excel(writer, index=False)
    out.seek(0)
    return StreamingResponse(out, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers={'Content-Disposition': 'attachment; filename="Template_Soal.xlsx"'})

@app.get("/admin/download-user-template")
def dl_user_template():
    df = pd.DataFrame([{"username":"user1", "password":"123", "full_name":"Siswa", "role":"student", "sekolah":"SMAN 1"}])
    out = io.BytesIO()
    with pd.ExcelWriter(out, engine='xlsxwriter') as writer: df.to_excel(writer, index=False)
    out.seek(0)
    return StreamingResponse(out, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers={'Content-Disposition': 'attachment; filename="Template_User.xlsx"'})

@app.post("/config/release")
def set_conf(d: ConfigSchema, db: Session=Depends(get_db)):
    c = db.query(SystemConfig).filter_by(key="release_announcement").first()
    if c: c.value = d.value
    else: db.add(SystemConfig(key="release_announcement", value=d.value))
    db.commit()
    return {"message":"OK"}

@app.get("/config/release")
def get_conf(db: Session=Depends(get_db)):
    c = db.query(SystemConfig).filter_by(key="release_announcement").first()
    return {"is_released": (c.value == "true") if c else False}

# ==========================================
# 5. OBAT PERBAIKAN (WAJIB DIJALANKAN)
# ==========================================

@app.get("/fix-duration-decimal")
def fix_db_duration(db: Session = Depends(get_db)):
    try:
        db.execute(text("ALTER TABLE exams ALTER COLUMN duration TYPE FLOAT"))
        db.commit()
        return {"message": "BERHASIL! Durasi 42.5 menit aktif."}
    except Exception as e:
        return {"message": f"Info: {str(e)}"}

@app.get("/seed-majors")
def seed_majors_data(db: Session = Depends(get_db)):
    if db.query(Major).count() > 0:
        return {"message": "Data Jurusan sudah ada, tidak perlu di-seed ulang."}
    
    majors = [
        Major(university="UI", name="Pendidikan Dokter", passing_grade=720),
        Major(university="UI", name="Ilmu Komputer", passing_grade=700),
        Major(university="ITB", name="STEI-K", passing_grade=710),
        Major(university="ITB", name="FTTM", passing_grade=690),
        Major(university="UGM", name="Kedokteran", passing_grade=715),
        Major(university="UGM", name="Teknik Sipil", passing_grade=650),
        Major(university="UNPAD", name="Psikologi", passing_grade=640),
        Major(university="UNPAD", name="Hukum", passing_grade=630),
        Major(university="ITS", name="Teknik Informatika", passing_grade=680),
        Major(university="UNDIP", name="Kesehatan Masyarakat", passing_grade=620),
    ]
    db.add_all(majors)
    db.commit()
    return {"message": "SUKSES! 10 Jurusan Favorit berhasil ditambahkan. Silakan refresh halaman siswa."}