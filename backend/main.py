from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database, io
import pandas as pd
from datetime import datetime

app = FastAPI(title="EduPrime V50 Enterprise")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

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
        db.add(models.User(username="admin", password="123", full_name="Super Admin", role="admin", group_code="ADMIN"))
    
    # Init Folder LMS Default jika kosong
    if not db.query(models.LMSFolder).first():
        folders = [
            ("Penalaran Umum", "UTBK"), ("Pengetahuan Kuantitatif", "UTBK"), 
            ("Literasi B.Indo", "UTBK"), ("Literasi B.Inggris", "UTBK"),
            ("TIU", "CPNS"), ("TWK", "CPNS"), ("TKP", "CPNS"),
            ("Matematika", "TKA"), ("Fisika", "TKA")
        ]
        for name, cat in folders:
            db.add(models.LMSFolder(name=name, category=cat))
    
    db.commit()
    return {"status": "V50 System Ready"}

# AUTH
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data['username']).first()
    if u and u.password == data['password']: 
        return {"username": u.username, "name": u.full_name, "role": u.role, "c1": u.choice1_id, "group": u.group_code}
    raise HTTPException(400, "Login Gagal")

# --- CORE EXAM LOGIC ---
@app.get("/student/data")
def student_data(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    periods = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
    
    exam_list = []
    for p in periods:
        # 1. FILTER AKSES: Jika access_code ada, user.group_code harus sama (kecuali admin/umum)
        if p.access_code and p.access_code != "UMUM" and p.access_code != u.group_code and u.role != 'admin':
            continue 
            
        exams = []
        for e in sorted(p.exams, key=lambda x: x.order_index):
            res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=e.id).first()
            exams.append({"id":e.id, "title":e.title, "duration":e.duration, "status":"done" if res else "open", "score":res.final_score if res else 0})
        exam_list.append({"id":p.id, "name":p.name, "type":p.exam_type, "exams":exams})
    
    # LMS Folders
    folders = db.query(models.LMSFolder).options(joinedload(models.LMSFolder.materials)).all()
    lms_data = []
    for f in folders:
        lms_data.append({
            "id": f.id, "name": f.name, "category": f.category,
            "materials": [{"id":m.id, "title":m.title, "type":m.type, "url":m.content_url} for m in f.materials]
        })

    # History
    history = []
    results = db.query(models.ExamResult).filter_by(user_id=u.id).order_by(models.ExamResult.completed_at.desc()).all()
    for res in results:
        ex = db.query(models.Exam).filter_by(id=res.exam_id).first()
        if ex: history.append({"exam": ex.title, "score": res.final_score, "date": res.completed_at})

    return {"user": u, "periods": exam_list, "lms": lms_data, "history": history}

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
        "title": e.title,
        "score": res.final_score,
        "questions": [{
            "id": q.id, "text": q.text, "passage": q.passage_text, "media": q.media_url, 
            "explanation": q.explanation, "type": q.question_type,
            "user_answer": user_ans.get(str(q.id)),
            "correct_isian": q.correct_answer_isian,
            "options": [{"id":o.option_index, "label":o.label, "is_correct":o.is_correct, "score_weight":o.score_weight, "bool_val":o.boolean_val} for o in q.options]
        } for q in e.questions]
    }

@app.post("/exams/{eid}/submit")
def submit(eid: str, data: AnswerSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    e = db.query(models.Exam).join(models.ExamPeriod).filter(models.Exam.id==eid).first()
    exam_type = e.period.exam_type
    
    total_score = 0
    correct_count = 0
    
    # --- LOGIKA SKORING CPNS (TKP 1-5) ---
    if exam_type == 'CPNS':
        for q in e.questions:
            ans = data.answers.get(str(q.id))
            if not ans: continue # Skip jika kosong
            
            # Cari opsi yang dipilih user
            selected = next((o for o in q.options if o.option_index == ans), None)
            
            if selected:
                # Jika TKP, ambil score_weight (1-5). Jika TIU/TWK, admin set score_weight 5 untuk benar, 0 salah.
                # ATAU sistem fallback: jika is_correct=True dapat 5, salah 0.
                points = selected.score_weight
                if points == 0 and selected.is_correct: points = 5 # Default TIU/TWK
                
                total_score += points
                if selected.is_correct or points >= 3: correct_count += 1 # Anggap benar jika poin tinggi

    # --- LOGIKA SKORING UTBK / MANDIRI (IRT 200-1000) ---
    elif exam_type in ['UTBK', 'MANDIRI']:
        total_difficulty = sum(q.difficulty for q in e.questions)
        earned_difficulty = 0.0
        
        for q in e.questions:
            ans = data.answers.get(str(q.id))
            is_right = False
            
            if q.question_type == 'ISIAN':
                if ans and str(ans).strip().lower() == str(q.correct_answer_isian).strip().lower(): is_right = True
            elif q.question_type == 'PG':
                key = next((o for o in q.options if o.is_correct), None)
                if key and str(ans) == str(key.option_index): is_right = True
            # (Tambahkan logika Boolean/Kompleks jika perlu, disederhanakan untuk stabilitas)
            
            if is_right:
                earned_difficulty += q.difficulty
                correct_count += 1
        
        # Rumus IRT: Min 200, Max 1000
        base = 200
        if total_difficulty > 0:
            # Proporsi kesulitan yang dijawab benar * Range (800)
            total_score = base + ((earned_difficulty / total_difficulty) * 800)
        else:
            total_score = base

    # --- LOGIKA TKA / LAINNYA (Persen Biasa) ---
    else:
        total_q = len(e.questions)
        for q in e.questions:
            ans = data.answers.get(str(q.id))
            key = next((o for o in q.options if o.is_correct), None)
            if key and str(ans) == str(key.option_index): correct_count += 1
        total_score = (correct_count / total_q * 100) if total_q > 0 else 0

    # Save Result
    db.add(models.ExamResult(
        user_id=u.id, exam_id=eid, final_score=round(total_score, 2), 
        correct_count=correct_count, answers_json=data.answers
    ))
    db.commit()
    return {"score": round(total_score, 2)}

# --- ADMIN FEATURES ---
@app.get("/admin/analytics/{eid}")
def get_analytics(eid: str, db: Session = Depends(get_db)):
    results = db.query(models.ExamResult).filter_by(exam_id=eid).all()
    if not results: return {"leaderboard": [], "stats": []}
    
    # 1. Leaderboard
    leaderboard = sorted([{"name": r.user.full_name, "score": r.final_score} for r in results], key=lambda x: x['score'], reverse=True)[:10]
    
    # 2. Analisis Butir Soal (% Benar)
    e = db.query(models.Exam).filter_by(id=eid).first()
    stats = []
    for q in e.questions:
        correct = 0
        for r in results:
            ans = (r.answers_json or {}).get(str(q.id))
            # Cek manual sederhana
            key = next((o.option_index for o in q.options if o.is_correct), None)
            if ans == key: correct += 1
        pct = round((correct / len(results) * 100), 1) if len(results) > 0 else 0
        stats.append({"no": q.id, "pct": pct})
        
    return {"leaderboard": leaderboard, "stats": stats}

# --- CRUD STANDAR ---
@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()

@app.post("/admin/users/bulk")
async def bulk_user(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        df = pd.read_excel(io.BytesIO(await file.read()))
        count = 0
        for _, r in df.iterrows():
            if not db.query(models.User).filter_by(username=str(r['username'])).first():
                # Baca Role & Group Code dari Excel
                role = str(r['role']) if 'role' in r else 'peserta'
                grp = str(r['group']) if 'group' in r else 'GENERAL'
                db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name']), role=role, group_code=grp))
                count += 1
        db.commit(); return {"msg": f"Added {count} users"}
    except Exception as e: raise HTTPException(400, str(e))

@app.post("/admin/exams/{eid}/manual")
def add_manual(eid: str, data: ManualQuestion, db: Session = Depends(get_db)):
    q = models.Question(exam_id=eid, text=data.text, difficulty=data.difficulty, explanation=data.explanation, type=data.type)
    db.add(q); db.commit(); db.refresh(q)
    for opt in data.options:
        # Simpan Score Weight (untuk TKP)
        w = opt.get('score_weight', 0)
        if data.type != 'TKP' and opt.get('is_correct'): w = 5 # Auto 5 jika PG biasa
        
        db.add(models.Option(question_id=q.id, label=opt['label'], option_index=opt['idx'], is_correct=opt.get('is_correct', False), score_weight=w))
    db.commit(); return {"msg": "Saved"}

# ... (Sisanya: Upload Excel, Period, Major, LMS mirip V41 - Pertahankan)
@app.post("/admin/upload-questions/{eid}")
async def upload_q(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    db.query(models.Question).filter_by(exam_id=eid).delete()
    for _, r in df.iterrows():
        tipe = str(r.get('Tipe', 'PG')).upper().strip()
        q = models.Question(exam_id=eid, question_type=tipe, text=str(r['Soal']), passage_text=str(r.get('Bacaan')), explanation=str(r.get('Pembahasan')), difficulty=float(r.get('Kesulitan', 1.0)), correct_answer_isian=str(r.get('Kunci')) if tipe == 'ISIAN' else None)
        db.add(q); db.commit(); db.refresh(q)
        if tipe in ['PG', 'TKP']:
            for char in ['A','B','C','D','E']:
                if pd.notna(r.get(f'Opsi{char}')):
                    # TKP: Baca kolom BobotA, BobotB dst jika ada, atau default
                    weight = int(r.get(f'Bobot{char}', 0))
                    is_c = str(r.get('Kunci')).strip().upper() == char
                    db.add(models.Option(question_id=q.id, label=str(r[f'Opsi{char}']), option_index=char, is_correct=is_c, score_weight=weight))
    db.commit(); return {"msg": "OK"}

@app.post("/admin/periods")
def create_period(name: str = Form(...), exam_type: str = Form(...), access_code: str = Form(None), db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type, access_code=access_code)
    db.add(p); db.commit(); db.refresh(p)
    # Struktur UTBK 2025 (7 Subtes)
    struct = {
        "UTBK": [("PU",30,1), ("PPU",25,2), ("PBM",25,3), ("PK",20,4), ("LBI",45,5), ("LBE",20,6), ("PM",42,7)],
        "CPNS": [("TWK",30,1), ("TIU",35,2), ("TKP",45,3)],
        "TKA": [("MATE",90,1), ("FIS",60,2), ("KIM",60,3), ("BIO",60,4)],
        "MANDIRI": [("TPA",60,1), ("B.ING",40,2)]
    }
    for c, dur, order in struct.get(exam_type, [("UMUM",60,1)]):
        db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, title=c, duration=dur, order_index=order))
    db.commit(); return {"msg": "OK"}

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)): return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
@app.delete("/admin/periods/{pid}")
def del_period(pid: int, db: Session = Depends(get_db)): db.query(models.ExamPeriod).filter_by(id=pid).delete(); db.commit(); return {"msg": "Del"}
@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): return db.query(models.Major).all()
@app.post("/admin/majors/bulk")
async def bulk_majors(file: UploadFile = File(...), db: Session = Depends(get_db)):
    db.query(models.Major).delete(); db.commit(); df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows(): db.add(models.Major(university=r['Universitas'], program=r['Prodi'], passing_grade=float(r.get('Passing_Grade',0))))
    db.commit(); return {"msg": "OK"}
@app.post("/student/majors")
def save_majors(data: MajorSelect, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first(); u.choice1_id = data.m1; u.choice2_id = data.m2; db.commit(); return {"msg": "Saved"}
@app.get("/materials") # Sebenarnya pakai structure lms di student_data, tapi ini untuk admin list
def get_mats_ep(db: Session = Depends(get_db)): return db.query(models.Material).all()
@app.post("/materials")
def add_mat(title:str=Form(...), type:str=Form(...), url:str=Form(...), category:str=Form(...), folder_name:str=Form(...), db:Session=Depends(get_db)):
    # Cari atau buat folder
    folder = db.query(models.LMSFolder).filter_by(name=folder_name, category=category).first()
    if not folder:
        folder = models.LMSFolder(name=folder_name, category=category)
        db.add(folder); db.commit(); db.refresh(folder)
    db.add(models.Material(title=title, type=type, content_url=url, folder_id=folder.id))
    db.commit(); return {"msg":"OK"}
@app.delete("/materials/{mid}")
def del_mat(mid: int, db: Session = Depends(get_db)): db.query(models.Material).filter_by(id=mid).delete(); db.commit(); return {"msg":"Del"}