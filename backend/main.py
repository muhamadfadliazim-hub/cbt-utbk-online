from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List
import models, database, io, os, shutil
import pandas as pd
from datetime import datetime

app = FastAPI(title="EduPrime V65 Professional")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

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
        db.add(models.User(username="admin", password="123", full_name="Administrator", role="admin"))
    
    # Init LMS Structure (Category -> Subcategory)
    if not db.query(models.LMSFolder).first():
        struct = [
            ("Aljabar", "UTBK", "PK"), ("Geometri", "UTBK", "PK"),
            ("Logika Verbal", "UTBK", "PU"), ("Bacaan", "UTBK", "PBM"),
            ("Pancasila", "CPNS", "TWK"), ("UUD 1945", "CPNS", "TWK"),
            ("Silogisme", "CPNS", "TIU"), ("Pelayanan Publik", "CPNS", "TKP")
        ]
        for name, cat, sub in struct:
            db.add(models.LMSFolder(name=name, category=cat, subcategory=sub))
    db.commit(); return {"status": "V65 System Ready"}

# AUTH
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data['username']).first()
    if u and u.password == data['password']: 
        return {"username": u.username, "name": u.full_name, "role": u.role, "allowed": u.allowed_exam_ids}
    raise HTTPException(400, "Login Gagal")

# UPLOAD IMAGE (LOKAL)
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    fname = f"static/images/{int(datetime.now().timestamp())}_{file.filename}"
    with open(fname, "wb") as f: shutil.copyfileobj(file.file, f)
    return {"url": f"/{fname}"}

# --- STUDENT API (FILTER BY ACCESS) ---
@app.get("/student/data")
def student_data(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    periods = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
    
    # Filter Paket Ujian berdasarkan ID yang diizinkan admin
    user_allowed = [x.strip() for x in (u.allowed_exam_ids or "ALL").split(",")]
    
    exam_list = []
    for p in periods:
        # Jika bukan admin, cek izin akses
        if u.role != 'admin' and "ALL" not in user_allowed and str(p.id) not in user_allowed:
            continue
            
        exams = []
        for e in sorted(p.exams, key=lambda x: x.order_index):
            res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=e.id).first()
            exams.append({"id":e.id, "title":e.title, "duration":e.duration, "status":"done" if res else "open", "score":res.final_score if res else 0})
        exam_list.append({"id":p.id, "name":p.name, "type":p.exam_type, "show_result": p.show_result, "can_finish_early": p.can_finish_early, "exams":exams})
    
    # LMS Data Grouped
    folders = db.query(models.LMSFolder).options(joinedload(models.LMSFolder.materials)).all()
    lms_data = [{"id":f.id, "name":f.name, "category":f.category, "subcategory":f.subcategory, "materials":[{"id":m.id, "title":m.title, "type":m.type, "url":m.content_url} for m in f.materials]} for f in folders]
    
    # History
    history = []
    results = db.query(models.ExamResult).filter_by(user_id=u.id).order_by(models.ExamResult.completed_at.desc()).all()
    for r in results:
        ex = db.query(models.Exam).filter_by(id=r.exam_id).first()
        if ex: history.append({"exam": ex.title, "score": r.final_score, "date": r.completed_at})

    return {"user": u, "periods": exam_list, "lms": lms_data, "history": history}

# --- EXAM LOGIC ---
@app.get("/exams/{eid}")
def get_exam(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    return {"id":e.id, "title":e.title, "duration":e.duration, "can_finish": e.period.can_finish_early, "questions": [{"id":q.id, "text":q.text, "passage":q.passage_text, "media":q.media_url, "type":q.question_type, "options": [{"id":o.option_index, "label":o.label, "val":o.boolean_val} for o in q.options]} for q in e.questions]}

@app.get("/exams/{eid}/review")
def get_review(eid: str, username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    e = db.query(models.Exam).filter_by(id=eid).first()
    # Admin selalu bisa review, siswa tergantung setting
    if not e.period.show_result and u.role != 'admin': raise HTTPException(400, "Pembahasan belum dibuka Admin")
    
    res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=eid).first()
    user_ans = res.answers_json or {}
    return {"title": e.title, "score": res.final_score, "questions": [{"id": q.id, "text": q.text, "passage": q.passage_text, "media": q.media_url, "explanation": q.explanation, "type": q.question_type, "user_answer": user_ans.get(str(q.id)), "correct_isian": q.correct_answer_isian, "options": [{"id":o.option_index, "label":o.label, "is_correct":o.is_correct, "score_weight":o.score_weight, "bool_val":o.boolean_val} for o in q.options]} for q in e.questions]}

@app.post("/exams/{eid}/submit")
def submit(eid: str, data: AnswerSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    e = db.query(models.Exam).join(models.ExamPeriod).filter(models.Exam.id==eid).first()
    exam_type = e.period.exam_type
    
    total_score = 0; correct_count = 0
    
    # LOGIKA SKORING CPNS (TKP 1-5, TIU/TWK 5/0)
    if exam_type == 'CPNS':
        for q in e.questions:
            ans = data.answers.get(str(q.id))
            if not ans: continue
            sel = next((o for o in q.options if o.option_index == ans), None)
            if sel:
                pts = sel.score_weight
                # Jika bukan TKP dan jawaban benar, paksa poin 5
                if q.question_type != 'TKP' and sel.is_correct and pts == 0: pts = 5
                total_score += pts
                if sel.is_correct or pts >= 3: correct_count += 1
    
    # LOGIKA SKORING UTBK/MANDIRI (IRT Simple)
    elif exam_type in ['UTBK', 'MANDIRI']:
        total_dif = sum(q.difficulty for q in e.questions); earned_dif = 0.0
        for q in e.questions:
            ans = data.answers.get(str(q.id)); is_right = False
            
            if q.question_type == 'ISIAN':
                if ans and str(ans).strip().lower() == str(q.correct_answer_isian).strip().lower(): is_right = True
            elif q.question_type == 'PG_KOMPLEKS':
                keys = sorted([o.option_index for o in q.options if o.is_correct])
                user_ans = sorted(ans) if isinstance(ans, list) else []
                if keys == user_ans and len(keys)>0: is_right = True
            elif q.question_type == 'BOOLEAN':
                # Cek semua baris tabel
                if isinstance(ans, dict):
                    all_rows_ok = True
                    for o in q.options:
                        u_val = ans.get(str(o.id)); key_val = "B" if o.boolean_val else "S"
                        if u_val != key_val: all_rows_ok = False
                    if all_rows_ok: is_right = True
            else: # PG
                key = next((o for o in q.options if o.is_correct), None)
                if key and str(ans) == str(key.option_index): is_right = True
            
            if is_right: earned_dif += q.difficulty; correct_count += 1
        
        # Scale score 200-1000
        total_score = 200 + ((earned_dif / (total_dif or 1)) * 800)
    
    else: # TKA (Persen)
        total_score = (correct_count / (len(e.questions) or 1) * 100)

    db.add(models.ExamResult(user_id=u.id, exam_id=eid, final_score=round(total_score,2), correct_count=correct_count, answers_json=data.answers))
    db.commit()
    return {"score": round(total_score, 2) if e.period.show_result else None}

# --- ADMIN CRUD ---
@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()
@app.post("/admin/users")
def add_user(data: dict, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=data['username']).first(): raise HTTPException(400, "User Exists")
    # allowed_exam_ids diset manual oleh admin
    db.add(models.User(username=data['username'], password=data['password'], full_name=data['full_name'], role=data['role'], allowed_exam_ids=data.get('allowed','ALL'))); db.commit(); return {"msg":"OK"}

@app.post("/admin/exams/{eid}/manual")
def add_manual(eid: str, data: ManualQuestion, db: Session = Depends(get_db)):
    q = models.Question(exam_id=eid, text=data.text, difficulty=data.difficulty, explanation=data.explanation, type=data.type, media_url=data.media)
    db.add(q); db.commit(); db.refresh(q)
    for opt in data.options:
        w = opt.get('score_weight', 0)
        # Default weight handling
        if data.type != 'TKP' and opt.get('is_correct'): w = 5
        db.add(models.Option(question_id=q.id, label=opt['label'], option_index=opt['idx'], is_correct=opt.get('is_correct', False), score_weight=w))
    db.commit(); return {"msg": "Saved"}

# (Sisa endpoint standar Upload Excel, Period, LMS sama, pastikan ada di file final)
# ... [Bagian ini standar, saya persingkat di sini agar muat, tapi di file asli harus lengkap] ...
# Pastikan ada: upload_q, create_period, get_periods, add_mat, get_mats
@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)): return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
@app.post("/admin/periods")
def create_period(name: str=Form(...), exam_type: str=Form(...), show_result: bool=Form(True), can_finish_early: bool=Form(True), db: Session=Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type, show_result=show_result, can_finish_early=can_finish_early)
    db.add(p); db.commit(); db.refresh(p)
    # Generate Subtes sesuai Tipe
    struct = {"UTBK":[("PU",30,1),("PPU",25,2),("PBM",25,3),("PK",20,4),("LBI",45,5),("LBE",20,6),("PM",42,7)], "CPNS":[("TWK",30,1),("TIU",35,2),("TKP",45,3)]}
    for c, dur, order in struct.get(exam_type, [("UMUM",60,1)]): db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, title=c, duration=dur, order_index=order))
    db.commit(); return {"msg": "OK"}
@app.post("/admin/upload-questions/{eid}")
async def upload_q(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    db.query(models.Question).filter_by(exam_id=eid).delete()
    for _, r in df.iterrows():
        tipe = str(r.get('Tipe', 'PG')).upper().strip()
        q = models.Question(exam_id=eid, question_type=tipe, text=str(r['Soal']), passage_text=str(r.get('Bacaan')) if pd.notna(r.get('Bacaan')) else None, explanation=str(r.get('Pembahasan')), difficulty=1.0, correct_answer_isian=str(r.get('Kunci')) if tipe=='ISIAN' else None, media_url=str(r.get('Gambar')) if pd.notna(r.get('Gambar')) else None)
        db.add(q); db.commit(); db.refresh(q)
        if tipe in ['PG','TKP','PG_KOMPLEKS']:
            for c in ['A','B','C','D','E']:
                if pd.notna(r.get(f'Opsi{c}')):
                    w = int(r.get(f'Bobot{c}', 0))
                    keys = str(r.get('Kunci')).strip().upper().split(',')
                    db.add(models.Option(question_id=q.id, label=str(r[f'Opsi{c}']), option_index=c, is_correct=c in keys, score_weight=w))
    db.commit(); return {"msg":"OK"}
@app.get("/materials")
def get_mats(db: Session = Depends(get_db)): return db.query(models.Material).options(joinedload(models.Material.folder)).all()
@app.post("/materials")
def add_mat(title:str=Form(...), type:str=Form(...), url:str=Form(...), category:str=Form(...), subcategory:str=Form(...), folder_name:str=Form(...), db:Session=Depends(get_db)):
    f = db.query(models.LMSFolder).filter_by(name=folder_name, category=category, subcategory=subcategory).first()
    if not f: f = models.LMSFolder(name=folder_name, category=category, subcategory=subcategory); db.add(f); db.commit(); db.refresh(f)
    db.add(models.Material(title=title, type=type, content_url=url, folder_id=f.id)); db.commit(); return {"msg":"OK"}
@app.delete("/materials/{mid}")
def del_mat(mid: int, db: Session = Depends(get_db)): db.query(models.Material).filter_by(id=mid).delete(); db.commit(); return {"msg":"Del"}
@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): return db.query(models.Major).all()
@app.post("/student/majors")
def save_majors(data: MajorSelect, db: Session = Depends(get_db)): u = db.query(models.User).filter_by(username=data.username).first(); u.choice1_id = data.m1; u.choice2_id = data.m2; db.commit(); return {"msg": "Saved"}
@app.delete("/admin/periods/{pid}")
def del_period(pid: int, db: Session = Depends(get_db)): db.query(models.ExamPeriod).filter_by(id=pid).delete(); db.commit(); return {"msg": "Del"}
@app.get("/admin/analytics/{eid}")
def analytics(eid: str, db: Session = Depends(get_db)):
    res = db.query(models.ExamResult).filter_by(exam_id=eid).all()
    lb = sorted([{"name":r.user.full_name, "score":r.final_score} for r in res], key=lambda x:x['score'], reverse=True)[:10]
    return {"leaderboard": lb, "stats": []}