from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, delete
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import pandas as pd
import io
import time
import math
import random 

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- SCHEMAS ---
class LoginSchema(BaseModel):
    username: str; password: str
class AnswerSchema(BaseModel):
    answers: Dict[str, Any]; username: str
class UserCreateSchema(BaseModel):
    username: str; full_name: str; password: str; role: str = "student" 
class UserPasswordUpdateSchema(BaseModel):
    new_password: str
class BulkDeleteSchema(BaseModel):
    user_ids: List[int]
class MajorSelectionSchema(BaseModel):
    username: str; choice1_id: int; choice2_id: Optional[int] = None
class ConfigSchema(BaseModel):
    value: str
class TogglePeriodSchema(BaseModel):
    is_active: bool
class UpdatePeriodUsersSchema(BaseModel):
    allowed_usernames: Optional[str] = None
class ResetResultSchema(BaseModel):
    user_id: int; exam_id: str
class PeriodCreateSchema(BaseModel):
    name: str; allowed_usernames: Optional[str] = None; is_random: bool = True; is_flexible: bool = False; exam_type: str = "UTBK"
class MajorCreateSchema(BaseModel):
    university: str; name: str; passing_grade: float

# --- SCHEMA UPDATE FOR MANUAL INPUT ---
class OptionCreate(BaseModel):
    label: str
    is_correct: bool

class QuestionCreateSchema(BaseModel):
    text: str
    type: str = "multiple_choice"
    difficulty: float = 1.0
    reading_material: Optional[str] = None
    explanation: Optional[str] = None # NEW
    label_true: Optional[str] = "Benar"
    label_false: Optional[str] = "Salah"
    options: List[OptionCreate]
# --------------------------------------

def check_answer_correctness(question, user_ans):
    if not user_ans: return False
    if question.type == 'table_boolean' and isinstance(user_ans, dict):
        for opt in question.options:
            student_choice = user_ans.get(str(opt.option_index))
            # Logika Table: is_correct=True artinya Kolom 1 (Benar), False artinya Kolom 2 (Salah)
            correct_choice = "B" if opt.is_correct else "S"
            if student_choice != correct_choice: return False
        return True
    elif question.type == 'short_answer':
        key = next((o for o in question.options if o.is_correct), None)
        if key and user_ans:
            return str(user_ans).strip().lower() == key.label.strip().lower()
    elif question.type == 'complex':
        correct = {o.option_index for o in question.options if o.is_correct}
        user_set = set(user_ans) if isinstance(user_ans, list) else {user_ans}
        return user_set == correct
    else:
        key = next((o for o in question.options if o.is_correct), None)
        return key and user_ans == key.option_index
    return False

# --- ENDPOINTS ---
@app.get("/config/{key}")
def get_config(key: str, db: Session = Depends(get_db)):
    cfg = db.query(models.SystemConfig).filter_by(key=key).first()
    default = "true" if key == "enable_major_selection" else "false"
    return {"value": cfg.value if cfg else default}

@app.post("/config/{key}")
def set_config(key: str, data: ConfigSchema, db: Session = Depends(get_db)):
    cfg = db.query(models.SystemConfig).filter_by(key=key).first()
    if not cfg: db.add(models.SystemConfig(key=key, value=data.value))
    else: cfg.value = data.value
    db.commit()
    return {"message": "Updated"}

@app.get("/admin/periods")
def get_admin_periods(db: Session = Depends(get_db)):
    periods = db.query(models.ExamPeriod).order_by(models.ExamPeriod.id.desc()).options(joinedload(models.ExamPeriod.exams).joinedload(models.Exam.questions)).all()
    result = []
    for p in periods:
        p_data = {
            "id": p.id, "name": p.name, "is_active": p.is_active, "allow_submit": p.allow_submit, 
            "allowed_usernames": p.allowed_usernames, "is_random": p.is_random, 
            "is_flexible": p.is_flexible, "exam_type": p.exam_type, "exams": []
        }
        for e in p.exams:
            q_count = len(e.questions) if e.questions else 0
            p_data["exams"].append({"id": e.id, "title": e.title, "code": e.code, "duration": e.duration, "q_count": q_count})
        result.append(p_data)
    return result

@app.post("/admin/periods")
def create_period(data: PeriodCreateSchema, db: Session = Depends(get_db)):
    new_period = models.ExamPeriod(name=data.name, is_active=False, allow_submit=True, allowed_usernames=data.allowed_usernames, is_random=data.is_random, is_flexible=data.is_flexible, exam_type=data.exam_type)
    db.add(new_period); db.commit(); db.refresh(new_period)
    
    if data.exam_type == "CPNS": structure = [("TWK","Tes Wawasan Kebangsaan",30), ("TIU","Tes Intelegensia Umum",30), ("TKP","Tes Karakteristik Pribadi",40)]
    elif data.exam_type == "UMUM": structure = [("UMUM","Ujian Utama",60)]
    else: structure = [("PU","Penalaran Umum",30), ("PBM","Pemahaman Bacaan",25), ("PPU","Pengetahuan Umum",15), ("PK","Pengetahuan Kuantitatif",20), ("LBI","Literasi B.Indo",42.5), ("LBE","Literasi B.Inggris",20), ("PM","Penalaran MTK",42.5)]

    for c, t, d in structure: db.add(models.Exam(id=f"P{new_period.id}_{c}", period_id=new_period.id, code=c, title=t, description="Standard", duration=d))
    db.commit()
    return {"message": "Created"}

@app.post("/admin/exams/{exam_id}/manual-question")
def add_manual_question(exam_id: str, data: QuestionCreateSchema, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=exam_id).first()
    if not exam: raise HTTPException(404, "Exam not found")
    
    q = models.Question(
        exam_id=exam_id, text=data.text, type=data.type, difficulty=data.difficulty,
        reading_material=data.reading_material, explanation=data.explanation,
        label_true=data.label_true, label_false=data.label_false
    )
    db.add(q); db.commit(); db.refresh(q)
    
    idx_map = ["A", "B", "C", "D", "E"]
    for i, opt in enumerate(data.options):
        opt_idx = idx_map[i] if i < len(idx_map) and data.type in ["multiple_choice","complex"] else str(i+1)
        db.add(models.Option(question_id=q.id, label=opt.label, option_index=opt_idx, is_correct=opt.is_correct))
    db.commit()
    return {"message": "Saved"}

@app.delete("/admin/questions/{qid}")
def delete_single_question(qid: int, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter_by(id=qid).first()
    if q: db.delete(q); db.commit()
    return {"message": "Deleted"}

@app.get("/admin/exams/{exam_id}/preview")
def preview_exam(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=exam_id).options(joinedload(models.Exam.questions).joinedload(models.Question.options)).first()
    if not exam: raise HTTPException(404)
    q_data = []
    for q in exam.questions:
        opts = [{"id": o.option_index, "label": o.label, "is_correct": o.is_correct} for o in q.options]
        opts.sort(key=lambda x: x["id"])
        q_data.append({"id":q.id, "type":q.type, "text":q.text, "reading_material":q.reading_material, "options":opts, "explanation":q.explanation, "label_true":q.label_true, "label_false":q.label_false})
    q_data.sort(key=lambda x: x["id"])
    return {"title": exam.title, "questions": q_data}

# --- STUDENT SIDE ---
@app.get("/student/periods")
def get_student_periods(username: str = None, db: Session = Depends(get_db)):
    periods = db.query(models.ExamPeriod).filter_by(is_active=True).order_by(models.ExamPeriod.id.desc()).all()
    user = db.query(models.User).filter_by(username=username).first() if username else None
    
    res = []
    for p in periods:
        if p.allowed_usernames and username:
            if username.lower() not in [u.strip().lower() for u in p.allowed_usernames.split(',')]: continue
        
        exams_data = []
        for e in p.exams:
            is_done = False
            if user and db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=e.id).first(): is_done = True
            exams_data.append({"id": e.id, "title": e.title, "duration": e.duration, "is_done": is_done})
        
        if user and p.is_random:
            random.Random(f"{user.id}_{p.id}").shuffle(exams_data)
        else:
            exams_data.sort(key=lambda x: x['id']) # Simplified sort
            
        final_exams, prev_done = [], True
        for ex in exams_data:
            status = "locked"
            if ex["is_done"]: status = "done"
            elif p.is_flexible or prev_done: status = "open"
            ex["status"] = status
            final_exams.append(ex)
            prev_done = ex["is_done"]
        res.append({"id": p.id, "name": p.name, "exams": final_exams, "type": p.exam_type})
    return res

@app.get("/exams/{exam_id}")
def get_exam_questions_student(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=exam_id).first()
    if not exam: raise HTTPException(404)
    q_data = []
    for q in exam.questions:
        opts = [{"id": o.option_index, "label": o.label} for o in q.options] # NO EXPLANATION HERE
        opts.sort(key=lambda x: x['id'])
        q_data.append({"id":q.id, "type":q.type, "text":q.text, "reading_material":q.reading_material, "options":opts, "label_true":q.label_true, "label_false":q.label_false})
    q_data.sort(key=lambda x: x['id'])
    return {"id": exam.id, "title": exam.title, "duration": exam.duration, "questions": q_data}

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if not user: raise HTTPException(404)
    if db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first():
        return {"message": "Submitted"}
    
    questions = db.query(models.Question).filter_by(exam_id=exam_id).all()
    correct, earned = 0, 0.0
    for q in questions:
        if check_answer_correctness(q, data.answers.get(str(q.id))):
            correct += 1; earned += q.difficulty
            
    # IRT Simple Calc
    total_w = sum(q.difficulty for q in questions)
    score = 200 + ((earned / total_w) * 800) if total_w > 0 else 200
    
    db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct, wrong_count=len(questions)-correct, irt_score=score))
    db.commit()
    return {"message": "Saved"}

# --- NEW: STUDENT REVIEW (PEMBAHASAN) ---
@app.get("/student/exams/{exam_id}/review")
def review_exam(exam_id: str, username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    if not user: raise HTTPException(404)
    # Cek apakah sudah submit?
    result = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first()
    if not result: raise HTTPException(403, "Selesaikan ujian dulu untuk melihat pembahasan.")
    
    exam = db.query(models.Exam).filter_by(id=exam_id).first()
    q_data = []
    for q in exam.questions:
        opts = [{"id": o.option_index, "label": o.label, "is_correct": o.is_correct} for o in q.options]
        opts.sort(key=lambda x: x['id'])
        # KIRIM PEMBAHASAN DI SINI
        q_data.append({
            "id":q.id, "type":q.type, "text":q.text, "reading_material":q.reading_material, 
            "options":opts, "explanation": q.explanation, # <--- INI DIA
            "label_true":q.label_true, "label_false":q.label_false
        })
    q_data.sort(key=lambda x: x['id'])
    return {"title": exam.title, "questions": q_data, "score": result.irt_score, "correct": result.correct_count}

# --- AUTH & UTILS ---
@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if user and user.password == data.password:
        return {"message": "OK", "username": user.username, "name": user.full_name, "role": user.role}
    raise HTTPException(400, "Login Gagal")

@app.get("/init-admin")
def init_admin(db: Session = Depends(get_db)):
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Admin", role="admin"))
        db.commit()
    return {"message": "Admin Ready"}

@app.put("/admin/periods/{pid}/users")
def update_period_users(pid: int, data: UpdatePeriodUsersSchema, db: Session = Depends(get_db)):
    p = db.query(models.ExamPeriod).filter_by(id=pid).first()
    if p: p.allowed_usernames = data.allowed_usernames; db.commit()
    return {"message": "OK"}

@app.post("/admin/periods/{pid}/toggle")
def toggle_period(pid: int, data: TogglePeriodSchema, db: Session = Depends(get_db)):
    p = db.query(models.ExamPeriod).filter_by(id=pid).first()
    if p: p.is_active = data.is_active; db.commit()
    return {"message": "OK"}

@app.post("/admin/periods/{pid}/toggle-submit")
def toggle_period_submit(pid: int, data: TogglePeriodSchema, db: Session = Depends(get_db)):
    p = db.query(models.ExamPeriod).filter_by(id=pid).first()
    if p: p.allow_submit = data.is_active; db.commit()
    return {"message": "OK"}

@app.delete("/admin/periods/{pid}")
def delete_period(pid: int, db: Session = Depends(get_db)):
    db.query(models.ExamPeriod).filter_by(id=pid).delete(); db.commit()
    return {"message": "OK"}

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()
@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    db.add(models.User(username=u.username, password=u.password, full_name=u.full_name, role=u.role)); db.commit(); return {"message": "OK"}
@app.post("/admin/reset-result")
def reset_result(data: ResetResultSchema, db: Session = Depends(get_db)):
    db.query(models.ExamResult).filter_by(user_id=data.user_id, exam_id=data.exam_id).delete(); db.commit()
    return {"message": "Reset"}
@app.get("/admin/download-template")
def download_template_soal():
    df = pd.DataFrame([{"Tipe":"PG","Soal":"Contoh"}])
    output = io.BytesIO(); df.to_excel(output, index=False); output.seek(0)
    return StreamingResponse(output, headers={'Content-Disposition': 'attachment; filename="template.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
@app.post("/upload-exam") # Placeholder for excel logic if needed
def upload_placeholder(): return {"message":"Use manual input"}