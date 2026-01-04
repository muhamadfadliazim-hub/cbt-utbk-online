from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database, io, os, shutil
import pandas as pd
from datetime import datetime

app = FastAPI(title="EduPrime V64 Restoration")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class MajorSelect(BaseModel): username: str; m1: int; m2: int
class ManualQuestion(BaseModel): 
    text: str; difficulty: float; explanation: str; 
    passage: Optional[str]=None; media: Optional[str]=None; 
    type: str="PG"; options: List[Dict[str, Any]]

# --- INITIALIZATION ---
@app.get("/init-admin")
def init(db: Session = Depends(get_db)):
    models.Base.metadata.create_all(bind=database.engine)
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Super Admin", role="admin"))
    db.commit(); return {"status": "V64 System Ready"}

# --- AUTH ---
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data['username']).first()
    if u and u.password == data['password']: 
        return {"username": u.username, "name": u.full_name, "role": u.role, "allowed": u.allowed_exam_ids}
    raise HTTPException(400, "Login Gagal")

# --- STUDENT DATA (FILTER AKSES) ---
@app.get("/student/data")
def student_data(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    periods = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
    
    # Filter Ujian berdasarkan `allowed_exam_ids`
    user_allowed = [x.strip() for x in (u.allowed_exam_ids or "ALL").split(",")]
    
    exam_list = []
    for p in periods:
        # Jika user bukan admin DAN tidak punya akses "ALL" DAN ID paket tidak ada di list
        if u.role != 'admin' and "ALL" not in user_allowed and str(p.id) not in user_allowed:
            continue
            
        exams = []
        for e in sorted(p.exams, key=lambda x: x.order_index):
            res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=e.id).first()
            exams.append({"id":e.id, "title":e.title, "duration":e.duration, "status":"done" if res else "open", "score":res.final_score if res else 0})
        exam_list.append({"id":p.id, "name":p.name, "type":p.exam_type, "show_result": p.show_result, "can_finish_early": p.can_finish_early, "exams":exams})
    
    # LMS Data Grouping
    folders = db.query(models.LMSFolder).options(joinedload(models.LMSFolder.materials)).all()
    lms_data = [{"id": f.id, "name": f.name, "category": f.category, "subcategory": f.subcategory, "materials": [{"id":m.id, "title":m.title, "type":m.type, "url":m.content_url} for m in f.materials]} for f in folders]

    history = []
    results = db.query(models.ExamResult).filter_by(user_id=u.id).order_by(models.ExamResult.completed_at.desc()).all()
    for res in results:
        ex = db.query(models.Exam).filter_by(id=res.exam_id).first()
        if ex: history.append({"exam": ex.title, "score": res.final_score, "date": res.completed_at})

    return {"user": u, "periods": exam_list, "lms": lms_data, "history": history}

# --- EXAM ENGINE (SKORING) ---
@app.get("/exams/{eid}")
def get_exam(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    return {"id":e.id, "title":e.title, "duration":e.duration, "can_finish": e.period.can_finish_early, "questions": [{"id":q.id, "text":q.text, "passage":q.passage_text, "media":q.media_url, "type":q.question_type, "options": [{"id":o.option_index, "label":o.label, "val":o.boolean_val} for o in q.options]} for q in e.questions]}

@app.get("/exams/{eid}/review")
def get_review(eid: str, username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    e = db.query(models.Exam).filter_by(id=eid).first()
    if not e.period.show_result and u.role != 'admin': raise HTTPException(400, "Pembahasan Ditutup Admin")
    res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=eid).first()
    user_ans = res.answers_json or {}
    return {"title": e.title, "score": res.final_score, "questions": [{"id": q.id, "text": q.text, "passage": q.passage_text, "media": q.media_url, "explanation": q.explanation, "type": q.question_type, "user_answer": user_ans.get(str(q.id)), "correct_isian": q.correct_answer_isian, "options": [{"id":o.option_index, "label":o.label, "is_correct":o.is_correct, "score_weight":o.score_weight, "bool_val":o.boolean_val} for o in q.options]} for q in e.questions]}

@app.post("/exams/{eid}/submit")
def submit(eid: str, data: AnswerSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    e = db.query(models.Exam).join(models.ExamPeriod).filter(models.Exam.id==eid).first()
    exam_type = e.period.exam_type
    
    total_score = 0; correct_count = 0
    
    # 1. CPNS (TKP 1-5, TIU/TWK 0/5)
    if exam_type == 'CPNS':
        for q in e.questions:
            ans = data.answers.get(str(q.id))
            if not ans: continue
            selected = next((o for o in q.options if o.option_index == ans), None)
            if selected:
                points = selected.score_weight
                # Jika bobot 0 tapi benar (kasus TIU/TWK lama), beri 5
                if q.question_type != 'TKP' and selected.is_correct and points == 0: points = 5
                total_score += points
                if selected.is_correct or points >= 3: correct_count += 1

    # 2. UTBK / MANDIRI (IRT Sederhana)
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
                # Logika Tabel Benar/Salah
                all_correct = True
                if isinstance(ans, dict):
                    for o in q.options:
                        user_row = ans.get(str(o.id)); key_row = "B" if o.boolean_val else "S"
                        if user_row != key_row: all_correct = False
                    if all_correct: is_right = True
                else: is_right = False
            else: # PG Biasa
                key = next((o for o in q.options if o.is_correct), None)
                if key and str(ans) == str(key.option_index): is_right = True
            
            if is_right: earned_dif += q.difficulty; correct_count += 1
        
        # Rumus IRT Sederhana (200-1000)
        total_score = 200 + ((earned_dif / (total_dif or 1)) * 800)

    else: # Default %
        tq = len(e.questions)
        for q in e.questions:
            ans = data.answers.get(str(q.id))
            key = next((o for o in q.options if o.is_correct), None)
            if key and str(ans) == str(key.option_index): correct_count += 1
        total_score = (correct_count / (tq or 1) * 100)

    db.add(models.ExamResult(user_id=u.id, exam_id=eid, final_score=round(total_score,2), correct_count=correct_count, answers_json=data.answers))
    db.commit()
    return {"score": round(total_score, 2) if e.period.show_result else None}

# --- ADMIN FEATURES ---
@app.post("/admin/upload-questions/{eid}")
async def upload_q(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    db.query(models.Question).filter_by(exam_id=eid).delete()
    for _, r in df.iterrows():
        tipe = str(r.get('Tipe', 'PG')).upper().strip()
        # Baca Kolom Excel (Gambar, Bacaan, dll)
        q = models.Question(
            exam_id=eid, question_type=tipe, 
            text=str(r['Soal']), 
            passage_text=str(r.get('Bacaan')) if pd.notna(r.get('Bacaan')) else None, 
            explanation=str(r.get('Pembahasan')), 
            difficulty=float(r.get('Kesulitan', 1.0)), 
            correct_answer_isian=str(r.get('Kunci')) if tipe == 'ISIAN' else None, 
            media_url=str(r.get('Gambar')) if pd.notna(r.get('Gambar')) else None
        )
        db.add(q); db.commit(); db.refresh(q)
        
        if tipe in ['PG', 'TKP', 'PG_KOMPLEKS', 'BOOLEAN']:
            # Handle Opsi A-E
            for char in ['A','B','C','D','E']:
                if pd.notna(r.get(f'Opsi{char}')):
                    w = int(r.get(f'Bobot{char}', 0))
                    # Support multiple keys (A,C)
                    keys = str(r.get('Kunci')).strip().upper().split(',')
                    is_c = char in keys
                    db.add(models.Option(question_id=q.id, label=str(r[f'Opsi{char}']), option_index=char, is_correct=is_c, score_weight=w))
            
            # Handle Tabel Benar/Salah (Jika Tipe BOOLEAN)
            # Format Excel: Label1, Label2, Label3 (Pernyataan) -> Kunci: B,S,B
            if tipe == 'BOOLEAN':
                # Asumsi kolom OpsiA dst dipakai untuk pernyataan
                pass # Logic diserahkan ke input manual atau format khusus excel
                
    db.commit(); return {"msg": "OK"}

# (CRUD LAINNYA SAMA SEPERTI V63, PASTIKAN ADA)
@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()
@app.post("/admin/users")
def add_user(data: dict, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=data['username']).first(): raise HTTPException(400, "Exists")
    db.add(models.User(username=data['username'], password=data['password'], full_name=data['full_name'], role=data['role'], allowed_exam_ids=data.get('allowed','ALL'))); db.commit(); return {"msg":"OK"}
@app.post("/admin/users/bulk")
async def bulk_user(file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    c=0
    for _, r in df.iterrows():
        if not db.query(models.User).filter_by(username=str(r['username'])).first():
            db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name']), role=str(r.get('role','peserta')), allowed_exam_ids=str(r.get('access','ALL'))))
            c+=1
    db.commit(); return {"msg": f"Added {c}"}
@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)): return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
@app.post("/admin/periods")
def create_period(name: str=Form(...), exam_type: str=Form(...), allowed_groups: str=Form("ALL"), show_result: bool=Form(True), can_finish_early: bool=Form(True), db: Session=Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type, allowed_groups=allowed_groups, show_result=show_result, can_finish_early=can_finish_early)
    db.add(p); db.commit(); db.refresh(p)
    struct = {"UTBK":[("PU",30,1)], "CPNS":[("TWK",30,1)]}
    for c, dur, order in struct.get(exam_type, [("UMUM",60,1)]): db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, title=c, duration=dur, order_index=order))
    db.commit(); return {"msg": "OK"}
@app.delete("/admin/periods/{pid}")
def del_period(pid: int, db: Session = Depends(get_db)): db.query(models.ExamPeriod).filter_by(id=pid).delete(); db.commit(); return {"msg": "Del"}
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
@app.post("/admin/majors/bulk")
async def bulk_majors(file: UploadFile = File(...), db: Session = Depends(get_db)):
    db.query(models.Major).delete(); db.commit(); df = pd.read_excel(io.BytesIO(await file.read()))
    for _, r in df.iterrows(): db.add(models.Major(university=r['Universitas'], program=r['Prodi'], passing_grade=float(r.get('Passing_Grade',0))))
    db.commit(); return {"msg": "OK"}
@app.post("/student/majors")
def save_majors(data: MajorSelect, db: Session = Depends(get_db)): u = db.query(models.User).filter_by(username=data.username).first(); u.choice1_id = data.m1; u.choice2_id = data.m2; db.commit(); return {"msg": "Saved"}
@app.get("/admin/analytics/{eid}")
def get_analytics(eid: str, db: Session = Depends(get_db)):
    results = db.query(models.ExamResult).filter_by(exam_id=eid).all()
    leaderboard = sorted([{"name": r.user.full_name, "score": r.final_score} for r in results], key=lambda x: x['score'], reverse=True)[:10]
    e = db.query(models.Exam).filter_by(id=eid).first()
    stats = []
    for q in e.questions:
        corr = 0
        for r in results:
            ans = (r.answers_json or {}).get(str(q.id))
            if q.question_type == 'PG':
                key = next((o.option_index for o in q.options if o.is_correct), None)
                if ans == key: corr += 1
        stats.append({"no": q.id, "pct": round((corr/len(results)*100),1) if len(results) > 0 else 0})
    return {"leaderboard": leaderboard, "stats": stats}
@app.post("/admin/exams/{eid}/manual")
def add_manual(eid: str, data: ManualQuestion, db: Session = Depends(get_db)):
    q = models.Question(exam_id=eid, text=data.text, difficulty=data.difficulty, explanation=data.explanation, type=data.type, media_url=data.media)
    db.add(q); db.commit(); db.refresh(q)
    for opt in data.options:
        w = opt.get('score_weight', 0)
        if data.type != 'TKP' and opt.get('is_correct'): w = 5
        db.add(models.Option(question_id=q.id, label=opt['label'], option_index=opt['idx'], is_correct=opt.get('is_correct', False), score_weight=w))
    db.commit(); return {"msg": "Saved"}
@app.put("/admin/questions/{qid}")
def update_question(qid: int, data: ManualQuestion, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter_by(id=qid).first()
    q.text = data.text; q.difficulty = data.difficulty; q.explanation = data.explanation; q.media_url = data.media; q.question_type = data.type
    db.query(models.Option).filter_by(question_id=qid).delete()
    for opt in data.options:
        w = opt.get('score_weight', 0)
        if data.type != 'TKP' and opt.get('is_correct'): w = 5
        db.add(models.Option(question_id=q.id, label=opt['label'], option_index=opt['idx'], is_correct=opt.get('is_correct', False), score_weight=w))
    db.commit(); return {"msg": "Updated"}