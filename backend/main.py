from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Boolean, Text, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session, joinedload
from sqlalchemy import distinct, func
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import pandas as pd
import io
import os
import math

# --- LIBRARY PDF (WAJIB ADA) ---
try:
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    HAS_PDF = True
except ImportError:
    HAS_PDF = False

# ==========================================
# 1. KONFIGURASI DATABASE & ENGINE
# ==========================================
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local_cbt.db")
if DATABASE_URL.startswith("postgres://"): DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if "sqlite" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# 2. MODEL DATABASE (LENGKAP)
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
    exam_type = Column(String) # UTBK / MANDIRI
    is_active = Column(Boolean, default=False)
    allowed_usernames = Column(Text, nullable=True) 
    target_schools = Column(Text, nullable=True)
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True) # ID Unik misal P1_PU
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    code = Column(String) # PU, PPU, PBM
    title = Column(String)
    duration = Column(Float)
    period = relationship("ExamPeriod", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(String, ForeignKey("exams.id"))
    text = Column(Text) 
    type = Column(String, default="multiple_choice") 
    difficulty = Column(Float, default=1.0) # BOBOT IRT
    image_url = Column(String, nullable=True)
    reading_material = Column(Text, nullable=True) 
    explanation = Column(Text, nullable=True)     
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
    exam_id = Column(String) # P1_PU
    correct_count = Column(Integer)
    wrong_count = Column(Integer)
    irt_score = Column(Float) # NILAI AKHIR IRT
    user = relationship("User", back_populates="results")

class SystemConfig(Base):
    __tablename__ = "system_configs"
    key = Column(String, primary_key=True)
    value = Column(String)

# ==========================================
# 3. LOGIKA IRT (ITEM RESPONSE THEORY)
# ==========================================
def calculate_irt_score(correct_questions, total_questions):
    """
    Menghitung nilai berdasarkan bobot kesulitan.
    """
    if not total_questions: return 0
    
    base_score = 200
    max_add_score = 800
    
    total_weight = sum([q.difficulty for q in total_questions])
    if total_weight == 0: return base_score
    
    earned_weight = sum([q.difficulty for q in correct_questions])
    
    final_score = base_score + (earned_weight / total_weight) * max_add_score
    return round(final_score)

# ==========================================
# 4. API SETUP & STARTUP
# ==========================================
app = FastAPI(title="CBT SYSTEM PRO MAX")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # AUTO SEEDING JURUSAN
    if db.query(Major).count() == 0:
        data = [
            ("UNIVERSITAS INDONESIA", "PENDIDIKAN DOKTER", 680.0),
            ("UNIVERSITAS SYIAH KUALA", "PENDIDIKAN DOKTER HEWAN", 420.98),
            ("UNIVERSITAS PAPUA", "MANAJEMEN", 387.2)
        ]
        for u, n, g in data: db.add(Major(university=u, name=n, passing_grade=g))
        db.commit()
    
    # AUTO SEEDING SEKOLAH/CABANG
    if db.query(User).filter(User.school != None).count() == 0:
        db.add(User(username="admin_cabang", password="123", full_name="Admin", role="student", school="PUSAT"))
        db.commit()

    # FIX DURASI
    try: db.execute(text("ALTER TABLE exams ALTER COLUMN duration TYPE FLOAT USING duration::double precision")); db.commit()
    except: pass
    db.close()

app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# === INI PERBAIKAN SYNTAX ERROR ===
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# ==================================

# SCHEMAS
class LoginSchema(BaseModel):
    username: str
    password: str
class AnswerSchema(BaseModel):
    answers: Dict[str, Any]
    username: str
class MajorSelectionSchema(BaseModel):
    username: str
    choice1_id: Optional[int]
    choice2_id: Optional[int]
class PeriodCreateSchema(BaseModel): 
    name: str
    target_schools: Optional[str] = None
    exam_type: str = "UTBK"
    mode: str = "standard"
class BulkDeleteSchema(BaseModel):
    user_ids: List[int]
class UserCreateSchema(BaseModel):
    username: str
    full_name: str
    password: str
    role: str = "student"
    school: Optional[str]
class ConfigSchema(BaseModel):
    value: str

# ==========================================
# 5. API UTAMA (LENGKAP)
# ==========================================

@app.post("/login")
def login(d: LoginSchema, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=d.username).first()
    if u and u.password==d.password:
        return {"message":"OK", "username":u.username, "role":u.role, "school":u.school, "choice1_id":u.choice1_id}
    raise HTTPException(400, "Login Gagal")

@app.get("/majors")
def get_majors(db: Session = Depends(get_db)):
    return db.query(Major).all()

@app.get("/admin/schools-list")
def get_schools_list(db: Session = Depends(get_db)):
    return [s[0] for s in db.query(distinct(User.school)).filter(User.school != None).all()] or ["PUSAT"]

@app.post("/users/select-major")
def set_major(d: MajorSelectionSchema, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(username=d.username).first()
    if not u: raise HTTPException(404)
    u.choice1_id = d.choice1_id if d.choice1_id and d.choice1_id > 0 else None
    u.choice2_id = d.choice2_id if d.choice2_id and d.choice2_id > 0 else None
    db.commit()
    return {"status": "success"}

# --- MANAJEMEN UJIAN (UPLOAD SOAL & MARATON) ---
@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p=ExamPeriod(name=d.name, exam_type=d.exam_type, is_active=True); db.add(p); db.commit(); db.refresh(p)
    # BUAT SUB-TEST STANDAR UTBK (7 SUBTEST)
    subtests = [("PU",30), ("PPU",15), ("PBM",25), ("PK",20), ("LBI",40), ("LBE",20), ("PM",40)]
    for code, dur in subtests:
        db.add(Exam(id=f"P{p.id}_{code}", period_id=p.id, code=code, title=f"Tes {code}", duration=dur))
    db.commit()
    return {"message": "Periode & Subtes Berhasil Dibuat"}

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    ps=db.query(ExamPeriod).order_by(ExamPeriod.id.desc()).options(joinedload(ExamPeriod.exams).joinedload(Exam.questions)).all()
    res=[]
    for p in ps:
        exs=[{"id":e.id,"title":e.title,"code":e.code,"duration":e.duration,"q_count":len(e.questions)} for e in p.exams]
        res.append({"id":p.id,"name":p.name,"is_active":p.is_active,"exams":exs})
    return res

@app.post("/admin/upload-questions/{eid}")
async def upload_questions(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        c=await file.read(); df=pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c))
        db.query(Question).filter_by(exam_id=eid).delete(); db.commit(); cnt=0
        for _, r in df.iterrows():
            txt = r.get('Soal') or r.get('soal') or r.get('text')
            if pd.isna(txt): continue
            
            diff = r.get('Kesulitan') or r.get('difficulty') or 1.0
            q = Question(exam_id=eid, text=str(txt), difficulty=float(diff), 
                         reading_material=str(r.get('Bacaan') or r.get('bacaan') or ''), 
                         image_url=str(r.get('Gambar') or r.get('gambar') or ''))
            db.add(q); db.commit()
            
            kunci = str(r.get('Kunci') or r.get('kunci') or '').strip().upper()
            for idx, col in [('A','OpsiA'), ('B','OpsiB'), ('C','OpsiC'), ('D','OpsiD'), ('E','OpsiE')]:
                val = r.get(col) or r.get(col.lower())
                if pd.notna(val):
                    db.add(Option(question_id=q.id, option_index=idx, label=str(val), is_correct=(idx == kunci)))
            cnt+=1
        db.commit()
        return {"message": f"Sukses Upload {cnt} Soal"}
    except Exception as e: return {"message": f"Error: {str(e)}"}

# --- SUBMIT & PERHITUNGAN IRT ---
@app.post("/exams/{exam_id}/submit")
def sub_ex(exam_id: str, d: AnswerSchema, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=d.username).first()
    if db.query(ExamResult).filter_by(user_id=u.id,exam_id=exam_id).first(): return {"message":"Done","score":0}
    
    questions = db.query(Question).filter_by(exam_id=exam_id).all()
    correct_qs = []
    
    for q in questions:
        ans = d.answers.get(str(q.id))
        correct_opt = next((o for o in q.options if o.is_correct), None)
        if correct_opt and str(ans) == correct_opt.option_index:
            correct_qs.append(q)
            
    # HITUNG PAKE RUMUS IRT
    score = calculate_irt_score(correct_qs, questions)
    
    db.add(ExamResult(
        user_id=u.id, exam_id=exam_id, 
        correct_count=len(correct_qs), 
        wrong_count=len(questions)-len(correct_qs), 
        irt_score=score
    ))
    db.commit()
    return {"message":"Saved", "score": score}

# --- REKAP DATA (KOMPLIT PER SUBTES) ---
@app.get("/student/dashboard-stats")
def stats(username: str, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=username).first()
    conf=db.query(SystemConfig).filter_by(key="release_announcement").first()
    if not (conf and conf.value=="true"): return {"is_released":False}
    
    results=db.query(ExamResult).filter_by(user_id=u.id).all()
    map_score={}
    
    for r in results:
        code = r.exam_id.split('_')[-1]
        map_score[code] = {"score": r.irt_score, "correct": r.correct_count, "wrong": r.wrong_count, "id": r.exam_id}
        
    details = []
    total_score = 0
    subtests = ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"]
    
    for code in subtests:
        data = map_score.get(code, {"score":0, "correct":0, "wrong":0, "id": None})
        details.append({
            "subject": code,
            "score": int(data["score"]),
            "correct": data["correct"],
            "wrong": data["wrong"],
            "id": data["id"]
        })
        total_score += data["score"]
        
    avg = int(total_score / len(subtests))
    choice1 = db.query(Major).filter_by(id=u.choice1_id).first()
    status = "TIDAK LULUS"
    if choice1 and avg >= choice1.passing_grade: status = f"LULUS PILIHAN 1: {choice1.university}"
    
    return {"is_released":True, "average": avg, "details": details, "radar": details, "status": status}

@app.get("/admin/users") # Untuk Rekap Admin
def get_users(db: Session = Depends(get_db)): 
    return db.query(User).options(joinedload(User.results)).all()

# --- DOWNLOAD PDF REKAP ---
@app.get("/admin/recap/download-pdf")
def dl_pdf(period_id: Optional[str]=None, db: Session=Depends(get_db)):
    if not HAS_PDF: return JSONResponse({"message": "Server PDF Error"})
    try:
        q=db.query(ExamResult).join(User).filter(User.role=='student')
        if period_id: q=q.filter(ExamResult.exam_id.like(f"P{period_id}_%"))
        user_map = {}
        for r in q.all():
            if r.user_id not in user_map: 
                user_map[r.user_id] = {
                    "name": r.user.full_name, "school": r.user.school, 
                    "scores": {"PU":0,"PPU":0,"PBM":0,"PK":0,"LBI":0,"LBE":0,"PM":0}
                }
            code = r.exam_id.split('_')[-1]
            if code in user_map[r.user_id]["scores"]:
                user_map[r.user_id]["scores"][code] = int(r.irt_score)
        
        table_data = []
        for uid, data in user_map.items():
            row = [data['name'][:20], data['school']]
            total = 0
            for code in ["PU","PPU","PBM","PK","LBI","LBE","PM"]:
                val = data['scores'][code]
                row.append(val)
                total += val
            row.append(int(total/7))
            table_data.append(row)
            
        if not table_data: table_data = [["BELUM ADA DATA", "-", 0,0,0,0,0,0,0, 0]]

        buf=io.BytesIO(); doc=SimpleDocTemplate(buf,pagesize=landscape(A4)); el=[]
        el.append(Paragraph("REKAP HASIL TRYOUT UTBK", getSampleStyleSheet()['Heading1']))
        el.append(Spacer(1, 20))
        headers = ["Nama", "Sekolah", "PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM", "AVG"]
        t=Table([headers] + table_data)
        t.setStyle(TableStyle([
            ('GRID',(0,0),(-1,-1),1,colors.black),
            ('BACKGROUND',(0,0),(-1,0), colors.lightgrey),
            ('FONTSIZE',(0,0),(-1,-1), 9)
        ]))
        el.append(t); doc.build(el); buf.seek(0)
        return StreamingResponse(buf,media_type='application/pdf',headers={'Content-Disposition':'attachment;filename="Rekap.pdf"'})
    except Exception as e: return JSONResponse({"message": f"Error: {str(e)}"})

# --- CONFIG & OTHER ---
@app.post("/config/release")
def set_conf(d: ConfigSchema, db: Session=Depends(get_db)):
    c=db.query(SystemConfig).filter_by(key="release_announcement").first()
    if c: c.value=d.value 
    else: db.add(SystemConfig(key="release_announcement",value=d.value))
    db.commit(); return {"message":"OK"}
@app.get("/config/release")
def get_conf(db: Session=Depends(get_db)):
    c=db.query(SystemConfig).filter_by(key="release_announcement").first()
    return {"is_released": (c.value=="true") if c else False}
@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    db.add(User(username=u.username, password=u.password, full_name=u.full_name, role=u.role, school=u.school)); db.commit(); return {"message":"OK"}
@app.post("/admin/users/bulk")
async def bulk_user_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        c=await file.read(); df=pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c))
        df.columns=df.columns.str.strip().str.lower(); add=0
        for _, r in df.iterrows():
            if db.query(User).filter_by(username=str(r['username']).strip()).first(): continue
            db.add(User(username=str(r['username']).strip(), password=str(r['password']).strip(), full_name=str(r['full_name']).strip(), role=str(r.get('role','student')).strip(), school=str(r.get('sekolah','')))); add+=1
        db.commit(); return {"message": f"Sukses {add} user"}
    except Exception as e: return {"message":str(e)}
@app.post("/admin/users/delete-bulk")
def del_users(d: BulkDeleteSchema, db: Session = Depends(get_db)):
    db.query(User).filter(User.id.in_(d.user_ids)).delete(synchronize_session=False); db.commit(); return {"message":"OK"}
@app.post("/admin/upload-majors")
async def upload_majors(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        c=await file.read(); df=pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c))
        df.columns = df.columns.str.strip().str.replace(' ', '_').str.lower()
        db.query(Major).delete(); count=0
        for _, r in df.iterrows():
            univ = r.get('universitas') or r.get('university')
            prod = r.get('prodi') or r.get('program_studi')
            pg = r.get('passing_grade') or r.get('grade')
            if pd.notna(univ) and pd.notna(prod): 
                db.add(Major(university=str(univ).strip(), name=str(prod).strip(), passing_grade=float(pg or 0)))
                count+=1
        db.commit()
        return {"message": f"Sukses! {count} Jurusan."}
    except Exception as e: return {"message":str(e)}