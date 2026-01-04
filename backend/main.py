from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database, io
import pandas as pd
from datetime import datetime

app = FastAPI(title="EduPrime V54 Master")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- FIX SINTAKS ERROR DISINI ---
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
        db.add(models.User(username="admin", password="123", full_name="Super Admin", role="admin"))
    
    # Init LMS Folders
    if not db.query(models.LMSFolder).first():
        folders = [("PU","UTBK"), ("PK","UTBK"), ("LBIndo","UTBK"), ("LBIng","UTBK"), ("TIU","CPNS"), ("TWK","CPNS"), ("TKP","CPNS")]
        for n,c in folders: db.add(models.LMSFolder(name=n, category=c))
            
    db.commit()
    return {"status": "V54 Ready"}

# AUTH
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data['username']).first()
    if u and u.password == data['password']: 
        return {"username": u.username, "name": u.full_name, "role": u.role, "group": u.group_code}
    raise HTTPException(400, "Login Gagal")

# DATA SISWA
@app.get("/student/data")
def student_data(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    periods = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
    
    exam_list = []
    for p in periods:
        if p.access_code and p.access_code != "UMUM" and p.access_code != u.group_code and u.role != 'admin':
            continue
        
        exams = []
        for e in sorted(p.exams, key=lambda x: x.order_index):
            res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=e.id).first()
            exams.append({"id":e.id, "title":e.title, "duration":e.duration, "status":"done" if res else "open", "score":res.final_score if res else 0})
        
        exam_list.append({"id":p.id, "name":p.name, "type":p.exam_type, "show_result": p.show_result, "can_finish_early": p.can_finish_early, "exams":exams})
    
    folders = db.query(models.LMSFolder).options(joinedload(models.LMSFolder.materials)).all()
    lms_data = [{"id": f.id, "name": f.name, "category": f.category, "materials": [{"id":m.id, "title":m.title, "type":m.type, "url":m.content_url} for m in f.materials]} for f in folders]

    history = []
    results = db.query(models.ExamResult).filter_by(user_id=u.id).order_by(models.ExamResult.completed_at.desc()).all()
    for res in results:
        ex = db.query(models.Exam).filter_by(id=res.exam_id).first()
        if ex: history.append({"exam": ex.title, "score": res.final_score, "date": res.completed_at})

    return {"user": u, "periods": exam_list, "lms": lms_data, "history": history}

# UJIAN
@app.get("/exams/{eid}")
def get_exam(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    return {
        "id":e.id, "title":e.title, "duration":e.duration, "can_finish": e.period.can_finish_early,
        "questions": [{"id":q.id, "text":q.text, "passage":q.passage_text, "media":q.media_url, "type":q.question_type, "options": [{"id":o.option_index, "label":o.label, "val":o.boolean_val} for o in q.options]} for q in e.questions]
    }

@app.get("/exams/{eid}/review")
def get_review(eid: str, username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=eid).first()
    e = db.query(models.Exam).filter_by(id=eid).first()
    
    if not e.period.show_result: raise HTTPException(400, "Pembahasan Ditutup Admin")

    user_ans = res.answers_json or {}
    return {
        "title": e.title, "score": res.final_score,
        "questions": [{
            "id": q.id, "text": q.text, "passage": q.passage_text, "media": q.media_url, "explanation": q.explanation, "type": q.question_type,
            "user_answer": user_ans.get(str(q.id)), "correct_isian": q.correct_answer_isian,
            "options": [{"id":o.option_index, "label":o.label, "is_correct":o.is_correct, "score_weight":o.score_weight, "bool_val":o.boolean_val} for o in q.options]
        } for q in e.questions]
    }

@app.post("/exams/{eid}/submit")
def submit(eid: str, data: AnswerSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    e = db.query(models.Exam).join(models.ExamPeriod).filter(models.Exam.id==eid).first()
    
    total_score = 0; correct_count = 0
    
    if e.period.exam_type == 'CPNS':
        for q in e.questions:
            ans = data.answers.get(str(q.id))
            if ans:
                sel = next((o for o in q.options if o.option_index == ans), None)
                if sel:
                    pts = sel.score_weight
                    if pts == 0 and sel.is_correct: pts = 5
                    total_score += pts
                    if sel.is_correct or pts >= 3: correct_count += 1
    
    elif e.period.exam_type in ['UTBK', 'MANDIRI']:
        tdif = sum(q.difficulty for q in e.questions); edif = 0.0
        for q in e.questions:
            ans = data.answers.get(str(q.id)); right = False
            if q.question_type == 'ISIAN':
                if ans and str(ans).strip().lower() == str(q.correct_answer_isian).strip().lower(): right = True
            else:
                key = next((o for o in q.options if o.is_correct), None)
                if key and str(ans) == str(key.option_index): right = True
            if right: edif += q.difficulty; correct_count += 1
        total_score = 200 + ((edif / tdif) * 800) if tdif > 0 else 200
        
    else:
        tq = len(e.questions)
        for q in e.questions:
            ans = data.answers.get(str(q.id))
            key = next((o for o in q.options if o.is_correct), None)
            if key and str(ans) == str(key.option_index): correct_count += 1
        total_score = (correct_count / tq * 100) if tq > 0 else 0

    db.add(models.ExamResult(user_id=u.id, exam_id=eid, final_score=round(total_score,2), correct_count=correct_count, answers_json=data.answers))
    db.commit()
    return {"score": round(total_score, 2) if e.period.show_result else None}

# CRUD ADMIN
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
            key = next((o.option_index for o in q.options if o.is_correct), None)
            if ans == key: corr += 1
        stats.append({"no": q.id, "pct": round((corr/len(results)*100),1) if results else 0})
    return {"leaderboard": leaderboard, "stats": stats}

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()
@app.post("/admin/users/bulk")
async def bulk_user(file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    c = 0
    for _, r in df.iterrows():
        if not db.query(models.User).filter_by(username=str(r['username'])).first():
            db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name']), role=str(r.get('role','peserta')), group_code=str(r.get('group','GENERAL'))))
            c+=1
    db.commit(); return {"msg": f"Added {c}"}
@app.post("/admin/users/delete-list")
def delete_list(data: DeleteList, db: Session = Depends(get_db)): db.query(models.User).filter(models.User.id.in_(data.ids), models.User.role!='admin').delete(synchronize_session=False); db.commit(); return {"msg": "Deleted"}
@app.post("/admin/users")
def add_user_manual(data: dict, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=data['username']).first(): raise HTTPException(400, "Exists")
    db.add(models.User(username=data['username'], password=data['password'], full_name=data['full_name'], role=data['role'], group_code=data.get('group','GENERAL'))); db.commit(); return {"msg":"OK"}
@app.post("/admin/exams/{eid}/manual")
def add_manual(eid: str, data: ManualQuestion, db: Session = Depends(get_db)):
    q = models.Question(exam_id=eid, text=data.text, difficulty=data.difficulty, explanation=data.explanation, type=data.type)
    db.add(q); db.commit(); db.refresh(q)