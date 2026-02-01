from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Boolean, Text, text, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session, joinedload
from sqlalchemy import distinct, func
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import pandas as pd
import io
import os
import math

# --- CONFIG PDF ---
try:
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    HAS_PDF = True
except ImportError:
    HAS_PDF = False

# --- CONFIG DATABASE ---
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

# --- DATABASE MODELS ---
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
    results = relationship("ExamResult", back_populates="user", cascade="all, delete-orphan")

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
    # INI KOLOM YANG HILANG DI DATABASE BAPAK
    correct_text = Column(String, nullable=True) 
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

# --- IRT ENGINE ---
def calculate_irt_score(correct_questions, total_questions):
    if not total_questions: return 0
    raw_weighted_score = sum([q.difficulty for q in correct_questions])
    max_possible_score = sum([q.difficulty for q in total_questions])
    if max_possible_score == 0: return 0
    theta = raw_weighted_score / max_possible_score 
    z_score = (theta - 0.5) / 0.15 
    final_score = 500 + (z_score * 100)
    return round(max(200, min(1000, final_score)))

# --- INIT APP ---
app = FastAPI(title="CBT PRO FIX DB")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup_event():
    # 1. BUAT TABEL DASAR (JIKA BELUM ADA)
    Base.metadata.create_all(bind=engine)
    
    # 2. PAKSA UPDATE STRUKTUR DATABASE (ADD COLUMN MANUAL)
    # Ini akan memperbaiki error "correct_text does not exist"
    with engine.connect() as conn:
        try:
            # PostgreSQL Syntax untuk nambah kolom jika belum ada
            conn.execute(text("ALTER TABLE options ADD COLUMN IF NOT EXISTS correct_text TEXT;"))
            conn.execute(text("ALTER TABLE questions ADD COLUMN IF NOT EXISTS type VARCHAR DEFAULT 'multiple_choice';"))
            conn.execute(text("ALTER TABLE questions ADD COLUMN IF NOT EXISTS stats_correct INTEGER DEFAULT 0;"))
            conn.execute(text("ALTER TABLE questions ADD COLUMN IF NOT EXISTS stats_total INTEGER DEFAULT 0;"))
            conn.commit()
            print(">>> DATABASE SUKSES DIPERBARUI (MIGRATION SUCCESS) <<<")
        except Exception as e:
            print(f">>> WARNING MIGRATION: {e}")
            # Jika gagal (misal SQLite syntax beda), kita abaikan dulu karena create_all biasanya sudah handle di awal
            pass

    # 3. SEEDING ADMIN
    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == "admin_cabang").count() == 0:
            db.add(User(username="admin_cabang", password="123", full_name="Admin", role="admin", school="PUSAT"))
            db.commit()
    except:
        db.rollback()
    finally:
        db.close()

app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# SCHEMAS
class LoginSchema(BaseModel): username: str; password: str
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class MajorSelectionSchema(BaseModel): username: str; choice1_id: Optional[int]; choice2_id: Optional[int]
class PeriodCreateSchema(BaseModel): name: str; target_schools: Optional[str] = "Semua"; exam_type: str = "UTBK"
class BulkDeleteSchema(BaseModel): user_ids: List[int]
class UserCreateSchema(BaseModel): username: str; full_name: str; password: str; role: str = "student"; school: Optional[str]
class ConfigSchema(BaseModel): value: str
class QuestionUpdateSchema(BaseModel): text: str; explanation: Optional[str] = None

# --- API ---

@app.post("/login")
def login(d: LoginSchema, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=d.username).first()
    if u and u.password==d.password: 
        return {"message":"OK", "username":u.username, "role":u.role, "school":u.school, "choice1_id":u.choice1_id}
    raise HTTPException(400, "Login Gagal")

@app.put("/admin/questions/{qid}")
def update_question(qid: int, d: QuestionUpdateSchema, db: Session = Depends(get_db)):
    q = db.query(Question).filter_by(id=qid).first()
    if not q: raise HTTPException(404, "Soal tidak ada")
    q.text = d.text
    if d.explanation: q.explanation = d.explanation
    db.commit()
    return {"message": "Soal terupdate"}

@app.get("/admin/exams/{eid}/analysis")
def item_analysis(eid: str, db: Session = Depends(get_db)):
    e = db.query(Exam).filter_by(id=eid).first()
    if not e: raise HTTPException(404)
    res = []
    for i, q in enumerate(e.questions):
        percent = 0
        if q.stats_total > 0: percent = round((q.stats_correct / q.stats_total) * 100, 1)
        res.append({"no": i+1, "text": q.text[:50] + "...", "correct": q.stats_correct, "total": q.stats_total, "percent": percent, "difficulty": q.difficulty})
    return res

@app.post("/exams/{exam_id}/submit")
def sub_ex(exam_id: str, d: AnswerSchema, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=d.username).first()
    if db.query(ExamResult).filter_by(user_id=u.id,exam_id=exam_id).first(): return {"message":"Done","score":0}
    
    questions = db.query(Question).filter_by(exam_id=exam_id).all()
    correct_qs = []
    
    for q in questions:
        ans = d.answers.get(str(q.id))
        is_right = False
        
        # LOGIKA 4 TIPE
        if q.type == 'short_answer':
            key = q.options[0].correct_text if q.options else ""
            if str(ans).strip().lower() == str(key).strip().lower(): is_right = True
        elif q.type == 'complex':
            if isinstance(ans, list):
                keys = [o.option_index for o in q.options if o.is_correct]
                if set(ans) == set(keys): is_right = True
        elif q.type == 'table_boolean':
            if isinstance(ans, dict):
                all_match = True
                for o in q.options:
                    if ans.get(str(o.id)) != o.correct_text: all_match = False; break
                if all_match and len(q.options) > 0: is_right = True
        else: # PG
            key = next((o.option_index for o in q.options if o.is_correct), None)
            if str(ans) == str(key): is_right = True
            
        if is_right:
            correct_qs.append(q)
            q.stats_correct += 1
        q.stats_total += 1
    
    score = calculate_irt_score(correct_qs, questions)
    db.add(ExamResult(user_id=u.id, exam_id=exam_id, correct_count=len(correct_qs), wrong_count=len(questions)-len(correct_qs), irt_score=score))
    db.commit()
    return {"message":"Saved", "score": score}

@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == u.username).first(): raise HTTPException(400, "Username ada")
    db.add(User(username=u.username, password=u.password, full_name=u.full_name, role=u.role, school=u.school))
    db.commit()
    return {"message":"Berhasil"}

@app.get("/admin/schools-list")
def get_schools_list(db: Session = Depends(get_db)):
    return ["Semua"] + ([s[0] for s in db.query(distinct(User.school)).filter(User.school != None).all()] or [])

@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): return db.query(Major).all()

@app.post("/users/select-major")
def set_major(d: MajorSelectionSchema, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=d.username).first(); u.choice1_id=d.choice1_id; u.choice2_id=d.choice2_id; db.commit(); return {"status":"success"}

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p=ExamPeriod(name=d.name, exam_type=d.exam_type, is_active=False, target_schools=d.target_schools); db.add(p); db.commit(); db.refresh(p)
    for code, dur in [("PU",30), ("PPU",15), ("PBM",25), ("PK",20), ("LBI",40), ("LBE",20), ("PM",40)]: db.add(Exam(id=f"P{p.id}_{code}", period_id=p.id, code=code, title=f"Tes {code}", duration=dur))
    db.commit(); return {"message": "OK"}

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    ps=db.query(ExamPeriod).order_by(ExamPeriod.id.desc()).options(joinedload(ExamPeriod.exams).joinedload(Exam.questions)).all(); res=[]
    for p in ps:
        exs=[{"id":e.id,"title":e.title,"code":e.code,"duration":e.duration,"q_count":len(e.questions)} for e in p.exams]
        res.append({"id":p.id,"name":p.name,"target_schools":p.target_schools,"is_active":p.is_active,"exams":exs})
    return res

@app.post("/admin/periods/{pid}/toggle") 
def toggle_period(pid: int, db: Session = Depends(get_db)): p=db.query(ExamPeriod).filter_by(id=pid).first(); p.is_active=not p.is_active; db.commit(); return {"message":"OK"}

@app.delete("/admin/periods/{pid}") 
def delete_period(pid: int, db: Session = Depends(get_db)):
    p = db.query(ExamPeriod).filter_by(id=pid).first()
    if p: 
        for e in p.exams: 
            for q in e.questions: db.query(Option).filter_by(question_id=q.id).delete(); db.delete(q)
            db.delete(e)
        db.delete(p); db.commit()
    return {"message":"OK"}

@app.post("/admin/upload-questions/{eid}")
async def upload_questions(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        c=await file.read(); df=pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c))
        old=db.query(Question).filter_by(exam_id=eid).all()
        for q in old: db.query(Option).filter_by(question_id=q.id).delete(); db.delete(q)
        db.commit(); cnt=0
        for _, r in df.iterrows():
            txt=r.get('Soal') or r.get('soal'); 
            if pd.isna(txt): continue
            q_type='multiple_choice'; raw_type=str(r.get('Tipe') or 'PG').upper()
            if 'KOMPLEKS' in raw_type: q_type='complex'
            elif 'ISIAN' in raw_type: q_type='short_answer'
            elif 'TABEL' in raw_type: q_type='table_boolean'
            q=Question(exam_id=eid, text=str(txt), type=q_type, difficulty=float(r.get('Kesulitan') or 1.0), reading_material=str(r.get('Bacaan') or ''), image_url=str(r.get('Gambar') or ''))
            db.add(q); db.commit()
            kunci=str(r.get('Kunci') or '').strip()
            if q_type=='short_answer': db.add(Option(question_id=q.id, label="KUNCI", correct_text=kunci))
            elif q_type=='table_boolean':
                keys=kunci.replace(' ','').split(',')
                stmts=[r.get(c) for c in ['OpsiA','OpsiB','OpsiC','OpsiD','OpsiE']]
                for i,s in enumerate(stmts): 
                    if pd.notna(s): db.add(Option(question_id=q.id, label=str(s), option_index=str(i), correct_text=(keys[i] if i<len(keys) else "S")))
            else:
                keys=[k.strip().upper() for k in kunci.replace(';',',').split(',')]
                for i,c in enumerate(['A','B','C','D','E']): 
                    val=r.get(f'Opsi{c}')
                    if pd.notna(val): db.add(Option(question_id=q.id, label=str(val), option_index=c, is_correct=(c in keys)))
            cnt+=1
        db.commit(); return {"message": f"Sukses {cnt}"}
    except Exception as e: return {"message": str(e)}

@app.get("/student/periods")
def get_pers(username: str, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=username).first()
    all_ps=db.query(ExamPeriod).filter_by(is_active=True).order_by(ExamPeriod.id.desc()).all(); ret=[]
    for p in all_ps:
        if p.target_schools and p.target_schools!="Semua" and p.target_schools!=u.school: continue
        exs=[{"id":e.id,"title":e.title,"code":e.code,"duration":e.duration,"is_done":(db.query(ExamResult).filter_by(user_id=u.id,exam_id=e.id).first() is not None),"q_count":len(e.questions)} for e in p.exams]
        ret.append({"id":p.id,"name":p.name,"exams":exs})
    return ret

@app.get("/exams/{exam_id}")
def get_exam_student(exam_id: str, db: Session = Depends(get_db)):
    e=db.query(Exam).filter_by(id=exam_id).first(); qs=[]
    for q in e.questions:
        opts=[{"id":o.id if q.type=='table_boolean' else o.option_index,"text":o.label} for o in q.options]
        qs.append({"id":q.id,"type":q.type,"text":q.text,"image_url":q.image_url,"reading_material":q.reading_material,"options":opts})
    return {"id":e.id,"title":e.title,"duration":e.duration,"questions":qs}

@app.get("/student/dashboard-stats")
def stats(username: str, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=username).first()
    conf=db.query(SystemConfig).filter_by(key="release_announcement").first()
    is_released=(conf and conf.value=="true")
    results=db.query(ExamResult).filter_by(user_id=u.id).all(); map_score={}
    for r in results: map_score[r.exam_id.split('_')[-1]]={"score":r.irt_score,"correct":r.correct_count,"wrong":r.wrong_count,"id":r.exam_id}
    details=[]; tot=0; subtests=["PU","PPU","PBM","PK","LBI","LBE","PM"]
    for c in subtests:
        d=map_score.get(c,{"score":0,"correct":0,"wrong":0,"id":None}); details.append({"subject":c,"score":int(d["score"]),"correct":d["correct"],"wrong":d["wrong"],"id":d["id"]}); tot+=d["score"]
    avg=int(tot/7); status="MENUNGGU PENGUMUMAN"
    if is_released:
        c1=db.query(Major).filter_by(id=u.choice1_id).first(); c2=db.query(Major).filter_by(id=u.choice2_id).first()
        status="TIDAK LULUS"
        if c1 and avg>=c1.passing_grade: status=f"LULUS P1: {c1.university}"
        elif c2 and avg>=c2.passing_grade: status=f"LULUS P2: {c2.university}"
    return {"is_released":is_released,"average":avg,"details":details,"radar":details,"status":status}

@app.get("/admin/exams/{eid}/preview")
def admin_preview(eid: str, db: Session = Depends(get_db)):
    e=db.query(Exam).filter_by(id=eid).first(); qs=[]
    for q in e.questions:
        if q.type=='table_boolean': ans="Tabel"
        elif q.type=='short_answer': ans=q.options[0].correct_text
        else: ans=next((o.option_index for o in q.options if o.is_correct),"-")
        qs.append({"id":q.id, "text":q.text, "type":q.type, "explanation":q.explanation, "image_url":q.image_url, "reading_material":q.reading_material, "correct_answer":ans})
    return {"title":e.title,"questions":qs}

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
def del_users(d: BulkDeleteSchema, db: Session = Depends(get_db)): db.query(User).filter(User.id.in_(d.user_ids)).delete(synchronize_session=False); db.commit(); return {"message":"OK"}

@app.post("/admin/upload-majors")
async def upload_majors(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        c=await file.read(); df=pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c))
        df.columns = df.columns.str.strip().str.replace(' ', '_').str.lower(); db.query(Major).delete(); count=0
        for _, r in df.iterrows():
            univ = r.get('universitas') or r.get('university'); prod = r.get('prodi') or r.get('program_studi'); pg = r.get('passing_grade') or r.get('grade')
            if pd.notna(univ) and pd.notna(prod): db.add(Major(university=str(univ).strip(), name=str(prod).strip(), passing_grade=float(pg or 0))); count+=1
        db.commit(); return {"message": f"Sukses! {count} Jurusan."}
    except Exception as e: return {"message":str(e)}

@app.post("/config/release")
def set_conf(d: ConfigSchema, db: Session=Depends(get_db)):
    c=db.query(SystemConfig).filter_by(key="release_announcement").first()
    if c: c.value=d.value 
    else: db.add(SystemConfig(key="release_announcement",value=d.value))
    db.commit(); return {"message":"OK"}

@app.get("/config/release")
def get_conf(db: Session=Depends(get_db)): c=db.query(SystemConfig).filter_by(key="release_announcement").first(); return {"is_released": (c.value=="true") if c else False}

@app.get("/student/review/{exam_id}")
def rev(exam_id: str, db: Session = Depends(get_db)):
    e=db.query(Exam).filter_by(id=exam_id).first(); q=[]
    for x in e.questions:
        if x.type=='table_boolean': ans="Tabel"
        elif x.type=='short_answer': ans=x.options[0].correct_text
        else: ans=next((o.label for o in x.options if o.is_correct),"")
        q.append({"id":x.id,"text":x.text,"image_url":x.image_url,"reading_material":x.reading_material,"explanation":x.explanation,"correct_answer":ans})
    return {"title":e.title,"questions":q}

@app.get("/admin/recap/download-pdf")
def dl_pdf(school: Optional[str]=None, db: Session=Depends(get_db)):
    if not HAS_PDF: return JSONResponse({"message": "Server PDF Error"})
    try:
        q=db.query(ExamResult).join(User).filter(User.role=='student')
        if school and school != "Semua": q=q.filter(User.school == school)
        user_map = {}
        for r in q.all():
            if r.user_id not in user_map: user_map[r.user_id] = {"name": r.user.full_name, "school": r.user.school, "c1": r.user.choice1_id, "c2": r.user.choice2_id, "scores": {}}
            user_map[r.user_id]["scores"][r.exam_id.split('_')[-1]] = int(r.irt_score)
        table_data = []
        for uid, data in user_map.items():
            row = [data['name'][:20], data['school']]; total = 0
            for code in ["PU","PPU","PBM","PK","LBI","LBE","PM"]:
                val = data['scores'].get(code, 0); row.append(val); total += val
            avg = int(total/7); row.append(avg)
            c1 = db.query(Major).filter_by(id=data["c1"]).first() if data["c1"] else None
            c2 = db.query(Major).filter_by(id=data["c2"]).first() if data["c2"] else None
            st = "GAGAL"
            if c1 and avg >= c1.passing_grade: st = "LULUS P1"
            elif c2 and avg >= c2.passing_grade: st = "LULUS P2"
            row.append(st); table_data.append(row)
        if not table_data: table_data = [["DATA KOSONG", "-", 0,0,0,0,0,0,0, 0, "-"]]
        buf=io.BytesIO(); doc=SimpleDocTemplate(buf,pagesize=landscape(A4)); el=[]
        el.append(Paragraph(f"REKAP NILAI - {school or 'SEMUA'}", getSampleStyleSheet()['Heading1'])); el.append(Spacer(1,20))
        t=Table([["Nama", "Sekolah", "PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM", "AVG", "STATUS"]] + table_data)
        t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),1,colors.black),('FONTSIZE',(0,0),(-1,-1),8)])); el.append(t); doc.build(el); buf.seek(0)
        return StreamingResponse(buf,media_type='application/pdf',headers={'Content-Disposition':'attachment;filename="Rekap.pdf"'})
    except Exception as e: return JSONResponse({"message": str(e)})