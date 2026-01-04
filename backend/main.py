from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database, io
import pandas as pd
from datetime import datetime

app = FastAPI(title="EduPrime V51 Final")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal(); try: yield db; finally: db.close()

# SCHEMAS
class DeleteList(BaseModel): ids: List[int]
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class MajorSelect(BaseModel): username: str; m1: int; m2: int
class ManualQuestion(BaseModel): 
    text: str; difficulty: float; explanation: str; 
    passage: Optional[str]=None; media: Optional[str]=None; 
    type: str="PG"; options: List[Dict[str, Any]]

@app.get("/init-admin")
def init(db: Session = Depends(get_db)):
    models.Base.metadata.create_all(bind=database.engine)
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Super Admin", role="admin"))
    if not db.query(models.LMSFolder).first():
        folders = [("PU","UTBK"), ("PK","UTBK"), ("LBIndo","UTBK"), ("LBIng","UTBK"), ("TIU","CPNS"), ("TWK","CPNS"), ("TKP","CPNS")]
        for n,c in folders: db.add(models.LMSFolder(name=n, category=c))
    db.commit(); return {"status": "V51 Ready"}

@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data['username']).first()
    if u and u.password == data['password']: 
        return {"username": u.username, "name": u.full_name, "role": u.role, "group": u.group_code}
    raise HTTPException(400, "Login Gagal")

@app.get("/student/data")
def student_data(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    periods = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
    
    exam_list = []
    for p in periods:
        if p.access_code and p.access_code != "UMUM" and p.access_code != u.group_code and u.role != 'admin': continue
        
        exams = []
        for e in sorted(p.exams, key=lambda x: x.order_index):
            res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=e.id).first()
            exams.append({"id":e.id, "title":e.title, "duration":e.duration, "status":"done" if res else "open", "score":res.final_score if res else 0})
        
        # Kirim setting admin ke frontend
        exam_list.append({
            "id":p.id, "name":p.name, "type":p.exam_type, 
            "show_result": p.show_result, "can_finish_early": p.can_finish_early,
            "exams":exams
        })
    
    folders = db.query(models.LMSFolder).options(joinedload(models.LMSFolder.materials)).all()
    lms_data = [{"id": f.id, "name": f.name, "category": f.category, "materials": [{"id":m.id, "title":m.title, "type":m.type, "url":m.content_url} for m in f.materials]} for f in folders]

    history = []
    results = db.query(models.ExamResult).filter_by(user_id=u.id).order_by(models.ExamResult.completed_at.desc()).all()
    for res in results:
        ex = db.query(models.Exam).filter_by(id=res.exam_id).first()
        if ex: history.append({"exam": ex.title, "score": res.final_score, "date": res.completed_at})

    return {"user": u, "periods": exam_list, "lms": lms_data, "history": history}

@app.get("/exams/{eid}")
def get_exam(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    # Check parent period settings
    can_finish = e.period.can_finish_early
    return {
        "id":e.id, "title":e.title, "duration":e.duration, "can_finish": can_finish,
        "questions": [{"id":q.id, "text":q.text, "passage":q.passage_text, "media":q.media_url, "type":q.question_type, "options": [{"id":o.option_index, "label":o.label, "val":o.boolean_val} for o in q.options]} for q in e.questions]
    }

@app.get("/exams/{eid}/review")
def get_review(eid: str, username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=eid).first()
    e = db.query(models.Exam).filter_by(id=eid).first()
    
    # CEK IZIN PEMBAHASAN DARI ADMIN
    if not e.period.show_result:
        raise HTTPException(400, "Pembahasan Ditutup Admin")

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
    exam_type = e.period.exam_type
    
    total_score = 0; correct_count = 0
    
    if exam_type == 'CPNS':
        for q in e.questions:
            ans = data.answers.get(str(q.id))
            if not ans: continue
            selected = next((o for o in q.options if o.option_index == ans), None)
            if selected:
                points = selected.score_weight
                if points == 0 and selected.is_correct: points = 5 
                total_score += points
                if selected.is_correct or points >= 3: correct_count += 1
    
    elif exam_type in ['UTBK', 'MANDIRI']:
        total_dif = sum(q.difficulty for q in e.questions); earned_dif = 0.0
        for q in e.questions:
            ans = data.answers.get(str(q.id)); is_right = False
            if q.question_type == 'ISIAN':
                if ans and str(ans).strip().lower() == str(q.correct_answer_isian).strip().lower(): is_right = True
            else:
                key = next((o for o in q.options if o.is_correct), None)
                if key and str(ans) == str(key.option_index): is_right = True
            if is_right: earned_dif += q.difficulty; correct_count += 1
        total_score = 200 + ((earned_dif / total_dif) * 800) if total_dif > 0 else 200
        
    else:
        total_q = len(e.questions)
        for q in e.questions:
            ans = data.answers.get(str(q.id))
            key = next((o for o in q.options if o.is_correct), None)
            if key and str(ans) == str(key.option_index): correct_count += 1
        total_score = (correct_count / total_q * 100) if total_q > 0 else 0

    db.add(models.ExamResult(user_id=u.id, exam_id=eid, final_score=round(total_score,2), correct_count=correct_count, answers_json=data.answers))
    db.commit()
    # Jika show_result False, kembalikan score null agar frontend menyembunyikan
    return {"score": round(total_score, 2) if e.period.show_result else None}

@app.get("/admin/analytics/{eid}")
def get_analytics(eid: str, db: Session = Depends(get_db)):
    results = db.query(models.ExamResult).filter_by(exam_id=eid).all()
    leaderboard = sorted([{"name": r.user.full_name, "score": r.final_score} for r in results], key=lambda x: x['score'], reverse=True)[:10]
    e = db.query(models.Exam).filter_by(id=eid).first()
    stats = []
    for q in e.questions:
        correct = 0
        for r in results:
            ans = (r.answers_json or {}).get(str(q.id))
            key = next((o.option_index for o in q.options if o.is_correct), None)
            if ans == key: correct += 1
        stats.append({"no": q.id, "pct": round((correct/len(results)*100),1) if results else 0})
    return {"leaderboard": leaderboard, "stats": stats}

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()
@app.post("/admin/users/bulk")
async def bulk_user(file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read()))
    count = 0
    for _, r in df.iterrows():
        if not db.query(models.User).filter_by(username=str(r['username'])).first():
            db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name']), role=str(r.get('role','peserta')), group_code=str(r.get('group','GENERAL'))))
            count+=1
    db.commit(); return {"msg": f"Added {count}"}
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
    for opt in data.options:
        w = opt.get('score_weight', 0)
        if data.type != 'TKP' and opt.get('is_correct'): w = 5
        db.add(models.Option(question_id=q.id, label=opt['label'], option_index=opt['idx'], is_correct=opt.get('is_correct', False), score_weight=w))
    db.commit(); return {"msg": "Saved"}

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
                    db.add(models.Option(question_id=q.id, label=str(r[f'Opsi{char}']), option_index=char, is_correct=str(r.get('Kunci')).strip().upper()==char, score_weight=int(r.get(f'Bobot{char}', 0))))
    db.commit(); return {"msg": "OK"}

@app.post("/admin/periods")
def create_period(name: str = Form(...), exam_type: str = Form(...), access_code: str = Form(None), show_result: bool = Form(True), can_finish_early: bool = Form(True), db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type, access_code=access_code, show_result=show_result, can_finish_early=can_finish_early)
    db.add(p); db.commit(); db.refresh(p)
    struct = {"UTBK":[("PU",30,1),("PPU",25,2),("PBM",25,3),("PK",20,4),("LBI",45,5),("LBE",20,6),("PM",42,7)], "CPNS":[("TWK",30,1),("TIU",35,2),("TKP",45,3)], "TKA":[("MATE",90,1),("FIS",60,2),("KIM",60,3),("BIO",60,4)], "MANDIRI":[("TPA",60,1),("B.ING",40,2)]}
    for c, dur, order in struct.get(exam_type, [("UMUM",60,1)]): db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, title=c, duration=dur, order_index=order))
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
def save_majors(data: MajorSelect, db: Session = Depends(get_db)): u = db.query(models.User).filter_by(username=data.username).first(); u.choice1_id = data.m1; u.choice2_id = data.m2; db.commit(); return {"msg": "Saved"}
@app.get("/materials")
def get_mats_ep(db: Session = Depends(get_db)): return db.query(models.Material).all()
@app.post("/materials")
def add_mat(title:str=Form(...), type:str=Form(...), url:str=Form(...), category:str=Form(...), folder_name:str=Form(...), db:Session=Depends(get_db)):
    folder = db.query(models.LMSFolder).filter_by(name=folder_name, category=category).first()
    if not folder: folder = models.LMSFolder(name=folder_name, category=category); db.add(folder); db.commit(); db.refresh(folder)
    db.add(models.Material(title=title, type=type, content_url=url, folder_id=folder.id)); db.commit(); return {"msg":"OK"}
@app.delete("/materials/{mid}")
def del_mat(mid: int, db: Session = Depends(get_db)): db.query(models.Material).filter_by(id=mid).delete(); db.commit(); return {"msg":"Del"}