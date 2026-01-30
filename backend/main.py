from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Boolean, Text, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session, joinedload
from sqlalchemy import distinct
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import pandas as pd
import io
import os

# --- PENGAMAN LIBRARY PDF ---
try:
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER
    HAS_PDF = True
except ImportError:
    HAS_PDF = False

# ==========================================
# 1. SETUP DATABASE
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
# 2. MODEL DATABASE (TIDAK ADA YANG DIHAPUS)
# ==========================================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)
    role = Column(String, default="student") 
    school = Column(String, nullable=True) # INI UNTUK CABANG (DROPDOWN)
    choice1_id = Column(Integer, ForeignKey("majors.id"), nullable=True) # PILIHAN 1
    choice2_id = Column(Integer, ForeignKey("majors.id"), nullable=True) # PILIHAN 2
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
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True) 
    period_id = Column(Integer, ForeignKey("exam_periods.id"))
    code = Column(String) 
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
    difficulty = Column(Float, default=1.0)
    image_url = Column(String, nullable=True)
    reading_material = Column(Text, nullable=True) 
    explanation = Column(Text, nullable=True)     
    label1 = Column(String, default="Benar") 
    label2 = Column(String, default="Salah")
    stats_correct = Column(Integer, default=0)
    stats_total = Column(Integer, default=0)
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
# 3. AUTO-SEEDING (KUNCI AGAR TOMBOL 'KLIK' MUNCUL)
# ==========================================
app = FastAPI(title="CBT SYSTEM RESTORED")

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
    try:
        # 1. PAKSA ISI DATA JURUSAN (Supaya Dropdown Jurusan Muncul)
        # Jika kosong, Frontend akan jadi mode ketik. Makanya kita isi.
        if db.query(Major).count() == 0:
            print(">>> MENGISI JURUSAN AGAR MODE 'KLIK' AKTIF...")
            data = [
                ("UNIVERSITAS SYIAH KUALA", "PENDIDIKAN DOKTER HEWAN - USK", 420.98),
                ("UNIVERSITAS SYIAH KUALA", "TEKNIK SIPIL - USK", 480.6),
                ("UNIVERSITAS SYIAH KUALA", "TEKNIK MESIN - USK", 484.2),
                ("UNIVERSITAS SYIAH KUALA", "TEKNIK KIMIA - USK", 477),
                ("UNIVERSITAS SYIAH KUALA", "ARSITEKTUR - USK", 466.54),
                ("UNIVERSITAS SYIAH KUALA", "TEKNIK ELEKTRO - USK", 495.23),
                ("UNIVERSITAS SYIAH KUALA", "AGROTEKNOLOGI - USK", 420.6),
                ("UNIVERSITAS SYIAH KUALA", "AGRIBISNIS - USK", 458.1),
                ("UNIVERSITAS SYIAH KUALA", "PETERNAKAN - USK", 423.6),
                ("UNIVERSITAS PAPUA", "MANAJEMEN - UNIPA", 387.2),
                ("UNIVERSITAS PAPUA", "AKUNTANSI - UNIPA", 391.23),
                ("UNIVERSITAS PAPUA", "SASTRA INDONESIA - UNIPA", 354.93),
                ("UNIVERSITAS PAPUA", "PENDIDIKAN BAHASA INGGRIS - UNIPA", 363)
            ]
            for u, n, g in data: db.add(Major(university=u, name=n, passing_grade=g))
            db.commit()
        
        # 2. PAKSA ISI DATA CABANG/SEKOLAH (Supaya Dropdown Cabang Muncul)
        # Kita buat user dummy dengan nama sekolah, supaya list sekolah tidak kosong.
        if db.query(User).filter(User.school != None).count() == 0:
            print(">>> MENGISI DATA CABANG AGAR MODE 'KLIK' AKTIF...")
            branches = ["PUSAT", "CABANG BANDA ACEH", "CABANG MEDAN", "CABANG PAPUA", "ONLINE"]
            for i, b in enumerate(branches):
                if not db.query(User).filter_by(username=f"dummy_cabang_{i}").first():
                    db.add(User(username=f"dummy_cabang_{i}", password="123", full_name=f"Admin {b}", role="student", school=b))
            db.commit()

        # 3. FIX DURASI DB
        try: db.execute(text("ALTER TABLE exams ALTER COLUMN duration TYPE FLOAT USING duration::double precision")); db.commit()
        except: pass

    except Exception as e:
        print(f"Startup Error: {e}")
    finally:
        db.close()

app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# SCHEMAS
class LoginSchema(BaseModel):
    username: str
    password: str
class AnswerSchema(BaseModel):
    answers: Dict[str, Any]
    username: str
class MajorSelectionSchema(BaseModel):
    username: str
    choice1_id: int
    choice2_id: Optional[int] = None
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
    school: Optional[str] = None
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
class ConfigSchema(BaseModel):
    value: str

# ==========================================
# 4. API UTAMA (PEMULIH FITUR)
# ==========================================

# 1. JURUSAN: Harus return List, jangan kosong!
@app.get("/majors")
def get_majors(db: Session = Depends(get_db)):
    majors = db.query(Major).all()
    # FALLBACK: Kalau DB error/kosong, kirim data dummy biar tombol tetap muncul
    if not majors:
        return [
            {"id": 999, "university": "SYSTEM", "name": "DATA LOADING...", "passing_grade": 0}
        ]
    return majors

# 2. CABANG: Harus return List, jangan kosong!
@app.get("/admin/schools-list")
def get_schools_list(db: Session = Depends(get_db)):
    schools = [s[0] for s in db.query(distinct(User.school)).filter(User.school != None, User.school != "").all()]
    if not schools:
        return ["PUSAT", "CABANG CONTOH"] # Fallback biar gak jadi mode ketik
    return schools

# 3. SIMPAN JURUSAN: Handle Pilihan 1 & 2
@app.post("/users/select-major")
def set_major(d: MajorSelectionSchema, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(username=d.username).first()
    if not u: raise HTTPException(404, "User not found")
    u.choice1_id = d.choice1_id
    u.choice2_id = d.choice2_id
    db.commit()
    return {"message": "Pilihan Jurusan Tersimpan!"}

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
                try: pg_val = float(pg)
                except: pg_val = 0.0
                db.add(Major(university=str(univ).strip(), name=str(prod).strip(), passing_grade=pg_val))
                count+=1
        db.commit()
        return {"message": f"Sukses! {count} Jurusan."}
    except Exception as e: return {"message":str(e)}

@app.post("/login")
def login(d: LoginSchema, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=d.username).first()
    if u and u.password==d.password:
        c1=db.query(Major).filter_by(id=u.choice1_id).first(); c2=db.query(Major).filter_by(id=u.choice2_id).first()
        return {"message":"OK", "username":u.username, "role":u.role, "school":u.school, 
                "choice1_id":u.choice1_id, "choice2_id":u.choice2_id,
                "display1":f"{c1.university} - {c1.name}" if c1 else "",
                "display2":f"{c2.university} - {c2.name}" if c2 else "",
                "pg1":c1.passing_grade if c1 else 0, "pg2":c2.passing_grade if c2 else 0}
    raise HTTPException(400, "Login Gagal")

# API SISWA
@app.get("/student/dashboard-stats")
def stats(username: str, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=username).first()
    conf=db.query(SystemConfig).filter_by(key="release_announcement").first()
    if not (conf and conf.value=="true"): return {"is_released":False}
    res=db.query(ExamResult).filter_by(user_id=u.id).all(); tot=0; sub=[]; map={}
    for r in res:
        ex=db.query(Exam).filter_by(id=r.exam_id).first(); c=ex.code if ex else "X"
        sub.append({"id":r.exam_id,"code":c,"subject":ex.title if ex else c,"correct":r.correct_count,"wrong":r.wrong_count,"score":r.irt_score})
        if c not in map: map[c]=[]; 
        map[c].append(r.irt_score); tot+=r.irt_score
    avg=int(tot/7) if tot>0 else 0; c1=db.query(Major).filter_by(id=u.choice1_id).first(); c2=db.query(Major).filter_by(id=u.choice2_id).first()
    st="TIDAK LULUS"; col="red"
    if c1 and avg>=c1.passing_grade: st=f"LULUS P1: {c1.university}"; col="green"
    elif c2 and avg>=c2.passing_grade: st=f"LULUS P2: {c2.university}"; col="blue"
    rad=[]; 
    for k in ["PU","PPU","PBM","PK","LBI","LBE","PM"]: s=map.get(k,[]); rad.append({"subject":k,"score":int(sum(s)/len(s)) if s else 0,"fullMark":1000})
    return {"is_released":True,"average":avg,"total":tot,"status":st,"status_color":col,"details":sub,"radar":rad,"choice1":c1.university if c1 else "-","choice2":c2.university if c2 else "-"}

@app.get("/student/periods")
def get_pers(username: str, db: Session = Depends(get_db)):
    ps=db.query(ExamPeriod).filter_by(is_active=True).order_by(ExamPeriod.id.desc()).all(); u=db.query(User).filter_by(username=username).first(); ret=[]
    for p in ps:
        if p.allowed_usernames and username.lower() not in p.allowed_usernames.lower(): continue
        exs=[]; 
        for e in p.exams: exs.append({"id":e.id,"title":e.title,"code":e.code,"duration":e.duration,"is_done":db.query(ExamResult).filter_by(user_id=u.id,exam_id=e.id).first() is not None,"q_count":len(e.questions)})
        ret.append({"id":p.id,"name":p.name,"type":p.exam_type,"mode":p.target_schools or "standard","exams":exs})
    return ret

@app.post("/exams/{exam_id}/submit")
def sub_ex(exam_id: str, d: AnswerSchema, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=d.username).first()
    if db.query(ExamResult).filter_by(user_id=u.id,exam_id=exam_id).first(): return {"message":"Done","score":0}
    qs=db.query(Question).filter_by(exam_id=exam_id).all(); cor=0; pos=0
    for q in qs:
        pos+=q.difficulty; ans=d.answers.get(str(q.id)); ok=False
        if q.type=='table_boolean' and isinstance(ans,dict): ok=all(ans.get(str(o.option_index))==("B" if o.is_correct else "S") for o in q.options)
        else: 
            k=next((o for o in q.options if o.is_correct),None)
            if k and str(ans)==(k.label if q.type=='short_answer' else k.option_index): ok=True
        if ok: cor+=1; q.stats_correct+=1
        q.stats_total+=1
    sc=200+((cor/len(qs))*800) if qs else 0
    db.add(ExamResult(user_id=u.id,exam_id=exam_id,correct_count=cor,wrong_count=len(qs)-cor,irt_score=sc)); db.commit()
    return {"message":"Saved","score":sc}

@app.get("/student/review/{exam_id}")
def rev(exam_id: str, db: Session = Depends(get_db)):
    e=db.query(Exam).filter_by(id=exam_id).first(); q=[]
    for x in e.questions: q.append({"id":x.id,"text":x.text,"image_url":x.image_url,"reading_material":x.reading_material,"explanation":x.explanation,"correct_answer":next((o.label for o in x.options if o.is_correct),"")})
    return {"title":e.title,"questions":q}

# ==========================================
# 6. API ADMIN (REKAP ANTI-BLANK)
# ==========================================
@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(User).all()
@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    db.add(User(username=u.username, password=u.password, full_name=u.full_name, role=u.role, school=u.school)); db.commit(); return {"message":"OK"}
@app.post("/admin/users/delete-bulk")
def del_users(d: BulkDeleteSchema, db: Session = Depends(get_db)):
    db.query(User).filter(User.id.in_(d.user_ids)).delete(synchronize_session=False); db.commit(); return {"message":"OK"}
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
@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    ps=db.query(ExamPeriod).order_by(ExamPeriod.id.desc()).options(joinedload(ExamPeriod.exams).joinedload(Exam.questions)).all(); res=[]
    for p in ps:
        exs=[{"id":e.id,"title":e.title,"code":e.code,"duration":e.duration,"q_count":len(e.questions)} for e in p.exams]
        res.append({"id":p.id,"name":p.name,"target_schools":p.target_schools,"is_active":p.is_active,"type":p.exam_type,"exams":exs})
    return res
@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p=ExamPeriod(name=d.name, exam_type=f"{d.exam_type}_{d.mode.upper()}", target_schools=d.target_schools); db.add(p); db.commit(); db.refresh(p)
    for c,dur in [("PU",30),("PPU",15),("PBM",25),("PK",20),("LBI",42.5),("LBE",20),("PM",42.5)]: db.add(Exam(id=f"P{p.id}_{c}", period_id=p.id, code=c, title=f"Tes {c}", duration=dur))
    db.commit(); return {"message":"OK"}
@app.delete("/admin/periods/{pid}")
def delete_period(pid: int, db: Session = Depends(get_db)):
    p=db.query(ExamPeriod).filter_by(id=pid).first()
    if p: db.delete(p); db.commit()
    return {"message":"Deleted"}
@app.post("/admin/periods/{pid}/toggle")
def toggle_period(pid: int, d: Dict[str, bool], db: Session = Depends(get_db)):
    p=db.query(ExamPeriod).filter_by(id=pid).first()
    if p: p.is_active=d['is_active']; db.commit()
    return {"message":"OK"}
@app.get("/admin/exams/{eid}/preview") 
def admin_preview_exam(eid: str, db: Session = Depends(get_db)): return rev(eid, db)
@app.get("/exams/{eid}") 
def get_exam_detail(eid: str, db: Session = Depends(get_db)):
    e=db.query(Exam).filter_by(id=eid).first(); 
    if not e: raise HTTPException(404)
    qs=[]
    for q in e.questions:
        qs.append({"id":q.id,"type":q.type,"text":q.text,"image_url":q.image_url,"difficulty":q.difficulty,"label1":q.label1,"label2":q.label2,"options":[{"id":o.option_index,"label":o.label,"is_correct":o.is_correct} for o in q.options]})
    return {"id":e.id,"title":e.title,"duration":e.duration,"questions":qs}
@app.put("/admin/questions/{qid}")
def update_question(qid: int, d: QuestionUpdateSchema, db: Session = Depends(get_db)):
    q=db.query(Question).filter_by(id=qid).first()
    if q: q.text=d.text; q.explanation=d.explanation; q.reading_material=d.reading_material; q.label1=d.label1; q.label2=d.label2; db.commit()
    return {"message":"Updated"}
@app.post("/admin/upload-questions/{eid}")
async def upload_questions(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        c=await file.read(); df=pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c)); df.columns=df.columns.str.strip().str.lower()
        db.query(Question).filter_by(exam_id=eid).delete(); db.commit(); cnt=0
        for _,r in df.iterrows():
            q=Question(exam_id=eid,text=str(r.get('soal','-')),type='multiple_choice',difficulty=1,reading_material=str(r.get('bacaan')),explanation=str(r.get('pembahasan')),label1=str(r.get('label1','Benar')),label2=str(r.get('label2','Salah'))); db.add(q); db.commit()
            k=str(r.get('kunci','')).strip().upper()
            for c in ['a','b','c','d','e']: 
                if f"opsi{c}" in r and pd.notna(r[f"opsi{c}"]): db.add(Option(question_id=q.id,option_index=c.upper(),label=str(r[f"opsi{c}"]),is_correct=(c.upper()==k)))
            cnt+=1
        db.commit(); return {"message":f"Uploaded {cnt}"}
    except Exception as e: return {"message":str(e)}
@app.delete("/admin/results/reset")
def reset_student_result(user_id: int, period_id: int, db: Session = Depends(get_db)):
    es=db.query(Exam).filter_by(period_id=period_id).all(); eids=[e.id for e in es]
    if eids: db.query(ExamResult).filter(ExamResult.user_id==user_id, ExamResult.exam_id.in_(eids)).delete(synchronize_session=False); db.commit()
    return {"message":"Reset OK"}
@app.delete("/admin/exams/{eid}/reset")
def reset_exam_questions(eid: str, db: Session = Depends(get_db)):
    db.query(Question).filter_by(exam_id=eid).delete(); db.commit(); return {"message":"Reset OK"}
@app.post("/admin/config/institute")
def save_inst(d: InstituteConfigSchema, db: Session = Depends(get_db)):
    for k,v in d.dict().items(): 
        key = k if 'institute' in k or 'signer' in k else f"institute_{k}"
        c=db.query(SystemConfig).filter_by(key=key).first()
        if c: c.value=v 
        else: db.add(SystemConfig(key=key, value=v))
    db.commit(); return {"message":"Saved"}
@app.get("/admin/config/institute")
def get_inst(db: Session = Depends(get_db)):
    r={}; 
    for k in ["institute_name","institute_city","signer_name","signer_jabatan","signer_nip"]:
        c=db.query(SystemConfig).filter_by(key=k).first(); r[k]=c.value if c else ""
    return r

# FIX REKAP (CEGAH BLANK PAGE JIKA DATA KOSONG)
@app.get("/admin/recap/download-pdf")
def dl_pdf(period_id: Optional[str]=None, db: Session=Depends(get_db)):
    # Fallback jika library PDF tidak ada
    if not HAS_PDF: return JSONResponse({"message": "Server error: PDF Library Missing. Download Excel saja."})
    
    try:
        q=db.query(ExamResult).join(User).filter(User.role=='student')
        if period_id: q=q.filter(ExamResult.exam_id.like(f"P{period_id}_%"))
        
        # LOGIKA: Ambil Data -> Format Table ReportLab
        umap={}
        for r in q.all():
            if r.user_id not in umap: umap[r.user_id]={"name":r.user.full_name,"school":r.user.school,"c1":r.user.choice1_id,"c2":r.user.choice2_id,"s":{}}
            umap[r.user_id]["s"][r.exam_id.split('_')[-1]]=r.irt_score
        
        d=[]
        for uid,u in umap.items():
            row=[u['name'][:20], (u['school'] or "-")[:15]] 
            tot=0
            for c in ["PU","PPU","PBM","PK","LBI","LBE","PM"]: sc=int(u["s"].get(c,0)); row.append(sc); tot+=sc
            avg=int(tot/7); row.append(avg)
            st="TIDAK"; 
            c1=db.query(Major).filter_by(id=u["c1"]).first() if u["c1"] else None
            c2=db.query(Major).filter_by(id=u["c2"]).first() if u["c2"] else None
            if c1 and avg>=c1.passing_grade: st="LULUS P1"
            elif c2 and avg>=c2.passing_grade: st="LULUS P2"
            row.append(st); d.append(row)
        
        # PENCEGAH BLANK: Kalau data kosong, isi dummy row
        if not d: d = [["-", "BELUM ADA DATA", "-", 0,0,0,0,0,0,0,0, "-"]]

        buf=io.BytesIO(); doc=SimpleDocTemplate(buf,pagesize=landscape(A4)); el=[]
        # Judul PDF
        el.append(Paragraph("REKAPITULASI NILAI UJIAN", getSampleStyleSheet()['Heading1']))
        el.append(Spacer(1, 20))
        # Tabel
        headers = ["Nama","Sekolah","PU","PPU","PBM","PK","LBI","LBE","PM","Avg","Status"]
        t=Table([headers]+d)
        t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),1,colors.black), ('FONTSIZE',(0,0),(-1,-1),8)]))
        el.append(t); doc.build(el); buf.seek(0)
        return StreamingResponse(buf,media_type='application/pdf',headers={'Content-Disposition':'attachment;filename="Rekap.pdf"'})
    except Exception as e:
        # Jika masih error juga, jangan blank, tapi kasih JSON Error
        return JSONResponse({"message": f"ERROR GENERATE PDF: {str(e)}. Coba Download Excel."})

@app.get("/admin/recap/download")
def dl_xls(period_id: Optional[str]=None, db: Session=Depends(get_db)):
    q=db.query(ExamResult).join(User).filter(User.role=='student')
    if period_id: q=q.filter(ExamResult.exam_id.like(f"P{period_id}_%"))
    data = []
    for r in q.all():
        data.append({"Nama":r.user.full_name, "Nilai": r.irt_score, "Mapel": r.exam_id})
    df = pd.DataFrame(data if data else [{"Info":"Data Kosong"}])
    out = io.BytesIO(); 
    with pd.ExcelWriter(out, engine='xlsxwriter') as w: df.to_excel(w, index=False)
    out.seek(0); return StreamingResponse(out, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers={'Content-Disposition': 'attachment; filename="Rekap.xlsx"'})

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

@app.get("/repair", response_class=HTMLResponse)
def repair_page():
    return "<h1>AUTO-REPAIR SUDAH BERJALAN SAAT STARTUP. SILAKAN CEK FITUR.</h1>"