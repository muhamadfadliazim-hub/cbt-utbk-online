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
import statistics

# CONFIG
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local_cbt.db")
if DATABASE_URL.startswith("postgres://"): DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if "sqlite" in DATABASE_URL: engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else: engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# MODELS
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String); full_name = Column(String); role = Column(String, default="student"); school = Column(String, nullable=True)
    choice1_id = Column(Integer, ForeignKey("majors.id"), nullable=True); choice2_id = Column(Integer, ForeignKey("majors.id"), nullable=True)
    results = relationship("ExamResult", back_populates="user", cascade="all, delete-orphan")

class Major(Base):
    __tablename__ = "majors"
    id = Column(Integer, primary_key=True, index=True)
    university = Column(String); name = Column(String); passing_grade = Column(Float)

class ExamPeriod(Base):
    __tablename__ = "exam_periods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String); exam_type = Column(String); is_active = Column(Boolean, default=False); target_schools = Column(Text, nullable=True)
    exams = relationship("Exam", back_populates="period", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True); period_id = Column(Integer, ForeignKey("exam_periods.id"))
    code = Column(String); title = Column(String); duration = Column(Float)
    period = relationship("ExamPeriod", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(String, ForeignKey("exams.id")); text = Column(Text) 
    type = Column(String, default="multiple_choice") 
    difficulty = Column(Float, default=1.0); image_url = Column(String, nullable=True)
    reading_material = Column(Text, nullable=True); explanation = Column(Text, nullable=True)     
    stats_correct = Column(Integer, default=0); stats_total = Column(Integer, default=0)
    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")
    exam = relationship("Exam", back_populates="questions")

class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    label = Column(Text); option_index = Column(String); is_correct = Column(Boolean, default=False); correct_text = Column(String, nullable=True)
    question = relationship("Question", back_populates="options")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")); exam_id = Column(String)
    correct_count = Column(Integer); wrong_count = Column(Integer); irt_score = Column(Float) 
    raw_score = Column(Float, default=0.0) 
    user = relationship("User", back_populates="results")

class SystemConfig(Base):
    __tablename__ = "system_configs"
    key = Column(String, primary_key=True); value = Column(String)

app = FastAPI(title="CBT FINAL FIX")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# LOGIC PENILAIAN REAL (Z-SCORE) - DIGUNAKAN OLEH TOMBOL RECALCULATE
def calculate_real_score(current_raw_score, population_scores, max_possible=0):
    try:
        # Jika tidak ada populasi (hanya 1 siswa), pakai skala linear biasa
        if len(population_scores) < 2:
            if max_possible <= 0: return 0
            return round((current_raw_score / max_possible) * 1000)

        mean = statistics.mean(population_scores)
        stdev = statistics.stdev(population_scores)
        
        # Jika semua nilai sama persis, stdev 0 -> kembali ke linear
        if stdev == 0: 
            if max_possible <= 0: return 500
            return round((current_raw_score / max_possible) * 1000)

        # Rumus UTBK Standard: 500 + (Z * 110)
        # Z = (Skor Siswa - Rata2) / Standar Deviasi
        z_score = (current_raw_score - mean) / stdev
        final_score = 500 + (z_score * 110)
        
        # Cap di 0 - 1000
        return round(max(0, min(1000, final_score)))
    except: return 0

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        with engine.connect() as conn:
            try: conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS school VARCHAR(255)")); conn.commit()
            except: pass
            try: conn.execute(text("ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS raw_score FLOAT DEFAULT 0")); conn.commit()
            except: pass
            try: conn.execute(text("ALTER TABLE questions ADD COLUMN IF NOT EXISTS stats_correct INTEGER DEFAULT 0")); conn.commit()
            except: pass
            try: conn.execute(text("ALTER TABLE questions ADD COLUMN IF NOT EXISTS stats_total INTEGER DEFAULT 0")); conn.commit()
            except: pass
        if db.query(User).filter_by(username="admin_cabang").count() == 0:
            db.add(User(username="admin_cabang", password="123", full_name="Admin", role="admin", school="PUSAT"))
            db.commit()
    except: pass
    finally: db.close()

app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

class LoginSchema(BaseModel): username: str; password: str
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class MajorSelectionSchema(BaseModel): username: str; choice1_id: Optional[int] = None; choice2_id: Optional[int] = None
class PeriodCreateSchema(BaseModel): name: str; target_schools: Optional[str] = "Semua"; exam_type: str = "UTBK"
class UserCreateSchema(BaseModel): username: str; full_name: str; password: str; role: str = "student"; school: Optional[str]
class QuestionUpdateSchema(BaseModel): 
    text: str; explanation: Optional[str] = None; options: Optional[List[str]] = None; correct_answer: Optional[str] = None
class ConfigSchema(BaseModel): value: str
class BulkDeleteSchema(BaseModel): user_ids: List[int]
class ResetResultSchema(BaseModel): user_id: int; exam_id: Optional[str] = None

@app.post("/login")
def login(d: LoginSchema, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=d.username).first()
    if u and u.password==d.password: return {"message":"OK", "username":u.username, "role":u.role, "school":u.school, "choice1_id":u.choice1_id}
    raise HTTPException(400, "Login Gagal")

@app.post("/admin/reset-result")
def reset_result(d: ResetResultSchema, db: Session = Depends(get_db)):
    if d.exam_id:
        res = db.query(ExamResult).filter_by(user_id=d.user_id, exam_id=d.exam_id).first()
        if res: db.delete(res)
    else:
        db.query(ExamResult).filter_by(user_id=d.user_id).delete()
    db.commit()
    return {"message": "Reset Berhasil"}

# === API BARU: HITUNG ULANG SEMUA NILAI (POPULATION BASED) ===
@app.post("/admin/recalculate-irt")
def recalculate_irt(db: Session = Depends(get_db)):
    try:
        # 1. Ambil semua exam_id yang ada di hasil
        exam_ids = [r[0] for r in db.query(distinct(ExamResult.exam_id)).all()]
        count = 0
        
        for eid in exam_ids:
            # 2. Ambil semua hasil untuk ujian ini
            results = db.query(ExamResult).filter(ExamResult.exam_id == eid).all()
            if not results: continue
            
            # 3. Kumpulkan Raw Score Populasi
            # NOTE: Untuk data lama yang raw_score-nya 0 tapi punya correct_count,
            # kita pakai correct_count sebagai estimasi raw_score agar tidak 0 semua.
            population_scores = []
            for r in results:
                score_val = r.raw_score
                if score_val <= 0 and r.correct_count > 0:
                    score_val = float(r.correct_count) # Fallback untuk data lama
                    r.raw_score = score_val # Update DB sekalian
                population_scores.append(score_val)
            
            # 4. Hitung Ulang Nilai Tiap Siswa
            # Kita butuh Max Score (Total Soal) untuk fallback jika populasi < 2
            total_questions = db.query(Question).filter(Question.exam_id == eid).count()
            
            for r in results:
                new_irt = calculate_real_score(r.raw_score, population_scores, total_questions)
                r.irt_score = new_irt
                count += 1
                
        db.commit()
        return {"message": f"Sukses! {count} nilai siswa telah dihitung ulang dengan standar Z-Score."}
    except Exception as e:
        db.rollback()
        return JSONResponse({"message": f"Gagal hitung ulang: {str(e)}"}, status_code=500)
# =============================================================

@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): return db.query(Major).all()
@app.get("/admin/schools-list")
def get_schools_list(db: Session = Depends(get_db)): 
    schools = [s[0] for s in db.query(distinct(User.school)).filter(User.school != None).order_by(User.school).all()]
    return ["Semua"] + schools

@app.post("/users/select-major")
def set_major(d: MajorSelectionSchema, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=d.username).first()
    u.choice1_id=d.choice1_id
    u.choice2_id=d.choice2_id
    db.commit()
    return {"status":"success"}

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p=ExamPeriod(name=d.name, exam_type=d.exam_type, is_active=False, target_schools=d.target_schools); db.add(p); db.commit(); db.refresh(p)
    for c,t in [("PU",30),("PPU",15),("PBM",25),("PK",20),("LBI",40),("LBE",20),("PM",40)]: db.add(Exam(id=f"P{p.id}_{c}", period_id=p.id, code=c, title=f"Tes {c}", duration=t))
    db.commit(); return {"message": "OK"}
@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    ps=db.query(ExamPeriod).order_by(ExamPeriod.id.desc()).options(joinedload(ExamPeriod.exams).joinedload(Exam.questions)).all(); res=[]
    for p in ps:
        exs=[{"id":e.id,"title":e.title,"code":e.code,"duration":e.duration,"q_count":len(e.questions)} for e in p.exams]
        res.append({"id":p.id,"name":p.name,"target_schools":p.target_schools,"is_active":p.is_active,"exams":exs})
    return res

@app.get("/exams/{exam_id}")
def get_exam(exam_id: str, db: Session = Depends(get_db)):
    e=db.query(Exam).filter_by(id=exam_id).first(); 
    if not e: return {"title":"Error", "questions":[]}
    sorted_qs = sorted(e.questions, key=lambda x: x.id)
    qs=[]
    for q in sorted_qs:
        s_opts = sorted(q.options, key=lambda o: o.option_index)
        opts=[{"id":o.id if q.type=='table_boolean' else o.option_index,"text":o.label} for o in s_opts]
        qs.append({"id":q.id,"type":q.type,"text":q.text,"image_url":q.image_url,"reading_material":q.reading_material,"options":opts})
    return {"id":e.id,"title":e.title,"duration":e.duration,"questions":qs}

@app.post("/exams/{exam_id}/submit")
def sub_ex(exam_id: str, d: AnswerSchema, db: Session = Depends(get_db)):
    try:
        u=db.query(User).filter_by(username=d.username).first()
        if not u: raise HTTPException(404, "User not found")
        db.query(ExamResult).filter_by(user_id=u.id, exam_id=exam_id).delete()
        db.flush() 
        questions = db.query(Question).filter_by(exam_id=exam_id).all()
        corr_q = []
        raw_score_total = 0.0
        
        # Hitung skor mentah siswa ini
        for q in questions:
            weight = float(q.difficulty) if q.difficulty is not None else 1.0
            if math.isnan(weight): weight = 1.0
            
            ans = d.answers.get(str(q.id))
            if not ans: continue
            
            is_r = False
            if q.type=='short_answer': 
                if q.options and str(ans).strip().lower() == str(q.options[0].correct_text or "").strip().lower(): is_r=True
            elif q.type=='complex':
                valid_keys = set([o.option_index for o in q.options if o.is_correct])
                if isinstance(ans, list) and set(ans) == valid_keys: is_r=True
            elif q.type=='table_boolean':
                if isinstance(ans, dict):
                    match = True
                    for o in q.options: 
                        if ans.get(str(o.id)) != o.correct_text: match = False; break
                    if match: is_r=True
            else:
                k = next((o.option_index for o in q.options if o.is_correct), None)
                if str(ans) == str(k): is_r=True
            
            if is_r: 
                corr_q.append(q)
                raw_score_total += weight
                q.stats_correct = (q.stats_correct or 0) + 1
            
            q.stats_total = (q.stats_total or 0) + 1
        
        # --- LOGIK REAL TIME SCORE ---
        # 1. Ambil populasi skor mentah dari DB (Siswa lain yang sudah mengerjakan)
        all_results_raw = db.query(ExamResult.raw_score).filter(ExamResult.exam_id == exam_id).all()
        population_scores = [r[0] for r in all_results_raw if r[0] is not None]
        population_scores.append(raw_score_total) # Masukkan siswa ini ke populasi
        
        # 2. Hitung Total Soal (Max Possible)
        max_possible = sum([float(q.difficulty or 1.0) for q in questions])

        # 3. Hitung Z-Score
        final_score = calculate_real_score(raw_score_total, population_scores, max_possible)
        
        db.add(ExamResult(
            user_id=u.id, 
            exam_id=exam_id, 
            correct_count=len(corr_q), 
            wrong_count=len(questions)-len(corr_q), 
            raw_score=raw_score_total,
            irt_score=final_score
        ))
        db.commit()
        return {"message":"Saved", "score":final_score}
    except Exception as e:
        db.rollback(); print(e); return {"message":"Saved (Partial)", "score": 0}

@app.put("/admin/questions/{qid}")
def update_question(qid: int, d: QuestionUpdateSchema, db: Session = Depends(get_db)):
    q = db.query(Question).filter_by(id=qid).first()
    if not q: raise HTTPException(404, "Soal tidak ada")
    q.text = d.text; q.explanation = d.explanation
    if d.options and (q.type == 'multiple_choice' or q.type == 'complex'):
        db.query(Option).filter_by(question_id=qid).delete()
        keys = [k.strip().upper() for k in (d.correct_answer or "").split(',')]
        abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        for i, opt_text in enumerate(d.options):
            idx = abc[i] if i < len(abc) else str(i)
            db.add(Option(question_id=qid, label=opt_text, option_index=idx, is_correct=(idx in keys)))
    elif q.type == 'short_answer' and d.correct_answer:
         if q.options: q.options[0].correct_text = d.correct_answer
         else: db.add(Option(question_id=qid, label="KUNCI", correct_text=d.correct_answer))
    db.commit(); return {"message": "Tersimpan"}

@app.post("/admin/upload-questions/{eid}")
async def upload_questions(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        c=await file.read(); df=pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c))
        df = df.fillna('')
        old=db.query(Question).filter_by(exam_id=eid).all()
        for q in old: db.query(Option).filter_by(question_id=q.id).delete(); db.delete(q)
        db.commit(); cnt=0
        for _, r in df.iterrows():
            txt=str(r.get('Soal') or r.get('soal') or r.get('text')).strip()
            if not txt or txt.lower()=='nan': continue
            q_type='multiple_choice'; raw=str(r.get('Tipe') or 'PG').upper()
            if 'KOMPLEKS' in raw: q_type='complex'
            elif 'ISIAN' in raw: q_type='short_answer'
            elif 'TABEL' in raw: q_type='table_boolean'
            diff = 1.0; 
            try: 
                diff_val = r.get('Kesulitan')
                diff = float(diff_val) if diff_val and str(diff_val).lower() != 'nan' else 1.0
            except: pass
            read_mat = str(r.get('Bacaan') or '').strip(); img_url = str(r.get('Gambar') or '').strip()
            if read_mat.lower()=='nan': read_mat=''; 
            if img_url.lower()=='nan': img_url=''
            q=Question(exam_id=eid, text=txt, type=q_type, difficulty=diff, reading_material=read_mat, image_url=img_url)
            db.add(q); db.commit()
            kunci=str(r.get('Kunci') or '').strip(); 
            if kunci.lower()=='nan': kunci=''
            if q_type=='short_answer': db.add(Option(question_id=q.id, label="KUNCI", correct_text=kunci))
            elif q_type=='table_boolean':
                keys=kunci.replace(' ','').split(',')
                for i, c in enumerate(['OpsiA','OpsiB','OpsiC','OpsiD','OpsiE']):
                    stmt=str(r.get(c) or '').strip()
                    if stmt and stmt.lower()!='nan': db.add(Option(question_id=q.id, label=stmt, option_index=str(i), correct_text=(keys[i] if i<len(keys) else "S")))
            else:
                keys=[k.strip().upper() for k in kunci.replace(';',',').split(',')]
                for i, c in enumerate(['A','B','C','D','E']):
                    val=str(r.get(f'Opsi{c}') or '').strip()
                    if val and val.lower()!='nan': db.add(Option(question_id=q.id, label=val, option_index=c, is_correct=(c in keys)))
            cnt+=1
        db.commit(); return {"message": f"Sukses {cnt}"}
    except Exception as e: return {"message": str(e)}

@app.post("/admin/users/bulk")
async def bulk_user_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        c=await file.read(); df=pd.read_csv(io.BytesIO(c)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(c))
        df = df.fillna(''); df.columns = [str(col).strip().lower().replace(' ', '').replace('_', '') for col in df.columns]
        add=0
        def get_val(row, keywords):
            for col in row.index:
                for k in keywords: 
                    if k in col: return str(row[col]).strip()
            return None
        for _, r in df.iterrows():
            u = get_val(r, ['user', 'nis', 'nomor', 'id', 'login'])
            p = get_val(r, ['pass', 'sandi', 'pin', 'token']) or "12345"
            n = get_val(r, ['nama', 'name', 'siswa']) or u
            s = get_val(r, ['sekolah', 'school', 'asal', 'pesantren', 'cabang', 'unit']) or "Umum"
            role = "admin" if "admin" in str(get_val(r, ['role'])).lower() else "student"
            if not u or db.query(User).filter_by(username=u).first(): continue
            db.add(User(username=u, password=p, full_name=n, role=role, school=s)); add+=1
        db.commit(); return {"message": f"Sukses {add} user"}
    except Exception as e: return {"message": f"Gagal: {str(e)}"}

@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == u.username).first(): raise HTTPException(400, "Username ada")
    db.add(User(username=u.username, password=u.password, full_name=u.full_name, role=u.role, school=u.school)); db.commit(); return {"message":"OK"}
@app.post("/admin/users/delete-bulk")
def del_users(d: BulkDeleteSchema, db: Session = Depends(get_db)): db.query(User).filter(User.id.in_(d.user_ids)).delete(synchronize_session=False); db.commit(); return {"message":"OK"}
@app.get("/admin/users") 
def get_users(db: Session = Depends(get_db)): return db.query(User).options(joinedload(User.results)).all()
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
@app.get("/student/periods")
def get_pers(username: str, db: Session = Depends(get_db)):
    u=db.query(User).filter_by(username=username).first()
    all_ps=db.query(ExamPeriod).filter_by(is_active=True).order_by(ExamPeriod.id.desc()).all(); ret=[]
    for p in all_ps:
        if p.target_schools and p.target_schools!="Semua" and p.target_schools!=u.school: continue
        exs=[{"id":e.id,"title":e.title,"code":e.code,"duration":e.duration,"is_done":(db.query(ExamResult).filter_by(user_id=u.id,exam_id=e.id).first() is not None),"q_count":len(e.questions)} for e in p.exams]
        ret.append({"id":p.id,"name":p.name,"exams":exs})
    return ret
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
@app.get("/admin/exams/{eid}/analysis")
def item_analysis(eid: str, db: Session = Depends(get_db)):
    e=db.query(Exam).filter_by(id=eid).first(); res=[]
    for i, q in enumerate(e.questions):
        pct=round((q.stats_correct/q.stats_total)*100,1) if q.stats_total>0 else 0
        res.append({"no":i+1, "text":q.text[:50]+"...", "correct":q.stats_correct, "total":q.stats_total, "percent":pct, "difficulty":q.difficulty})
    return res
@app.get("/student/review/{exam_id}")
def rev(exam_id: str, db: Session = Depends(get_db)):
    e=db.query(Exam).filter_by(id=exam_id).first(); q=[]
    for x in e.questions:
        if x.type=='table_boolean': ans="Tabel"
        elif x.type=='short_answer': ans=x.options[0].correct_text
        else: ans=next((o.label for o in x.options if o.is_correct),"")
        q.append({"id":x.id,"text":x.text,"image_url":x.image_url,"reading_material":x.reading_material,"explanation":x.explanation,"correct_answer":ans})
    return {"title":e.title,"questions":q}
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
@app.get("/admin/exams/{eid}/preview")
def admin_preview(eid: str, db: Session = Depends(get_db)):
    e = db.query(Exam).filter_by(id=eid).first()
    qs = []
    if not e: return {"title":"-", "questions":[]}
    for q in sorted(e.questions, key=lambda x: x.id):
        raw_options = []
        ans_str = ""
        sorted_opts = sorted(q.options, key=lambda x: x.option_index)
        if q.type == 'multiple_choice' or q.type == 'complex':
            raw_options = [o.label for o in sorted_opts]
            ans_str = ",".join([o.option_index for o in sorted_opts if o.is_correct])
        elif q.type == 'short_answer':
            if q.options: ans_str = q.options[0].correct_text
        elif q.type == 'table_boolean':
             raw_options = [o.label for o in sorted_opts]
             ans_str = ",".join([o.correct_text for o in sorted_opts])
        qs.append({"id": q.id, "text": q.text, "type": q.type, "difficulty": q.difficulty, "explanation": q.explanation, "image_url": q.image_url, "reading_material": q.reading_material, "correct_answer": ans_str, "raw_options": raw_options})
    return {"title": e.title, "questions": qs}

try:
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    HAS_PDF = True
except ImportError:
    HAS_PDF = False

@app.get("/admin/recap/download-pdf")
def dl_pdf(school: Optional[str]=None, db: Session=Depends(get_db)):
    if not HAS_PDF: return JSONResponse({"message": "Server PDF Error: ReportLab belum terinstall."}, status_code=500)
    
    try:
        q = db.query(ExamResult).join(User).filter(User.role == 'student').order_by(User.school, User.full_name)
        if school and school != "Semua":
            q = q.filter(User.school == school)
        
        results = q.all()
        
        user_map = {}
        for r in results:
            if r.user_id not in user_map:
                u_name = r.user.full_name or "Tanpa Nama"
                u_school = r.user.school or "-"
                user_map[r.user_id] = {"name": u_name, "school": u_school, "c1": r.user.choice1_id, "c2": r.user.choice2_id, "scores": {}}
            user_map[r.user_id]["scores"][r.exam_id.split('_')[-1]] = int(r.irt_score or 0)

        styles = getSampleStyleSheet()
        style_cell = ParagraphStyle(name='Cell', parent=styles['Normal'], fontSize=8, leading=10)
        style_header = ParagraphStyle(name='Header', parent=styles['Normal'], fontSize=9, leading=11, alignment=TA_CENTER, fontName='Helvetica-Bold', textColor=colors.white)

        headers = [
            Paragraph("Nama", style_header), 
            Paragraph("Sekolah", style_header),
            Paragraph("Pilihan 1", style_header), 
            Paragraph("Pilihan 2", style_header), 
            "PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM", 
            "AVG", "Status"
        ]
        
        all_majors = {m.id: m for m in db.query(Major).all()}
        table_data = []

        for uid, data in user_map.items():
            row = []
            row.append(Paragraph(str(data['name']), style_cell))
            row.append(Paragraph(str(data['school']), style_cell))
            
            c1 = all_majors.get(data["c1"])
            c2 = all_majors.get(data["c2"])
            
            c1_name = f"{c1.university}\n{c1.name}" if c1 else "-"
            c2_name = f"{c2.university}\n{c2.name}" if c2 else "-"
            
            row.append(Paragraph(c1_name, style_cell))
            row.append(Paragraph(c2_name, style_cell))

            total = 0
            for code in ["PU","PPU","PBM","PK","LBI","LBE","PM"]:
                val = data['scores'].get(code, 0)
                row.append(str(val))
                total += val
            
            avg = int(total/7)
            row.append(str(avg))

            st = "TIDAK LULUS"
            if c1 and avg >= c1.passing_grade: 
                st = f"LULUS P1\n{c1.name}"
            elif c2 and avg >= c2.passing_grade: 
                st = f"LULUS P2\n{c2.name}"
                
            row.append(Paragraph(st, style_cell))
            table_data.append(row)

        if not table_data:
            table_data = [["DATA KOSONG", "-", "-", "-", "0","0","0","0","0","0","0", "0", "-"]]

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
        elements = []
        
        title_text = f"REKAP HASIL UJIAN - {school if school else 'SEMUA DATA'}"
        elements.append(Paragraph(title_text, styles['Heading2']))
        elements.append(Spacer(1, 15))

        final_data = [headers] + table_data
        
        col_widths = [110, 90, 100, 100, 30, 30, 30, 30, 30, 30, 30, 35, 90]

        t = Table(final_data, colWidths=col_widths, repeatRows=1)
        t.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue), 
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (4, 0), (-1, -1), 'CENTER'), 
            ('VALIGN', (0, 0), (-1, -1), 'TOP'), 
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        
        elements.append(t)
        doc.build(elements)
        buffer.seek(0)
        
        filename = f"Rekap_{school if school else 'All'}.pdf"
        return StreamingResponse(buffer, media_type='application/pdf', headers={'Content-Disposition': f'attachment;filename="{filename}"'})

    except Exception as e:
        print(f"PDF ERROR: {str(e)}") 
        return JSONResponse({"message": f"Gagal membuat PDF: {str(e)}"}, status_code=500)