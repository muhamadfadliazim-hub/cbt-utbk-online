from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
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
import os
import uuid

# SETUP UPLOAD FOLDER
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

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
class MaterialCreateSchema(BaseModel):
    title: str; type: str; content_url: str; category: str; description: Optional[str] = None

class OptionCreate(BaseModel):
    label: str; is_correct: bool
class QuestionCreateSchema(BaseModel):
    text: str; type: str = "multiple_choice"; difficulty: float = 1.0; reading_material: Optional[str] = None; explanation: Optional[str] = None; label_true: Optional[str] = "Benar"; label_false: Optional[str] = "Salah"; image_url: Optional[str] = None; options: List[OptionCreate]

def check_answer_correctness(question, user_ans):
    if not user_ans: return False
    if question.type == 'table_boolean' and isinstance(user_ans, dict):
        for opt in question.options:
            student_choice = user_ans.get(str(opt.option_index))
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

# --- UTILS ---
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as buffer:
        buffer.write(await file.read())
    return {"url": f"/static/{filename}"}

# --- LMS ENDPOINTS ---
@app.get("/materials")
def get_materials(category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.Material)
    if category and category != "ALL":
        q = q.filter(models.Material.category == category)
    return q.all()

@app.post("/materials")
def create_material(data: MaterialCreateSchema, db: Session = Depends(get_db)):
    m = models.Material(title=data.title, type=data.type, content_url=data.content_url, category=data.category, description=data.description)
    db.add(m); db.commit()
    return {"message": "Materi ditambahkan"}

@app.delete("/materials/{mid}")
def delete_material(mid: int, db: Session = Depends(get_db)):
    db.query(models.Material).filter_by(id=mid).delete(); db.commit()
    return {"message": "Dihapus"}

# --- EXAM ENDPOINTS ---
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
    
    # STRUKTUR DINAMIS BERDASARKAN TIPE
    if data.exam_type == "CPNS":
        structure = [("TWK","Tes Wawasan Kebangsaan",30), ("TIU","Tes Intelegensia Umum",30), ("TKP","Tes Karakteristik Pribadi",40)]
    elif data.exam_type == "UMUM":
        structure = [("UMUM","Ujian Utama",60)]
    else: # Default UTBK
        structure = [("PU","Penalaran Umum",30), ("PBM","Pemahaman Bacaan",25), ("PPU","Pengetahuan Umum",15), ("PK","Pengetahuan Kuantitatif",20), ("LBI","Literasi B.Indo",42.5), ("LBE","Literasi B.Inggris",20), ("PM","Penalaran MTK",42.5)]

    for c, t, d in structure: db.add(models.Exam(id=f"P{new_period.id}_{c}", period_id=new_period.id, code=c, title=t, description=data.exam_type, duration=d))
    db.commit()
    return {"message": f"Periode {data.exam_type} Berhasil Dibuat"}

@app.post("/admin/exams/{exam_id}/manual-question")
def add_manual_question(exam_id: str, data: QuestionCreateSchema, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=exam_id).first()
    if not exam: raise HTTPException(404, "Exam not found")
    
    q = models.Question(
        exam_id=exam_id, text=data.text, type=data.type, difficulty=data.difficulty,
        reading_material=data.reading_material, explanation=data.explanation,
        label_true=data.label_true, label_false=data.label_false, image_url=data.image_url
    )
    db.add(q); db.commit(); db.refresh(q)
    
    idx_map = ["A", "B", "C", "D", "E"]
    for i, opt in enumerate(data.options):
        opt_idx = idx_map[i] if i < len(idx_map) and data.type in ["multiple_choice","complex"] else str(i+1)
        db.add(models.Option(question_id=q.id, label=opt.label, option_index=opt_idx, is_correct=opt.is_correct))
    db.commit()
    return {"message": "Saved"}

@app.get("/admin/exams/{exam_id}/preview")
def preview_exam(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=exam_id).options(joinedload(models.Exam.questions).joinedload(models.Question.options)).first()
    if not exam: raise HTTPException(404)
    q_data = []
    for q in exam.questions:
        opts = [{"id": o.option_index, "label": o.label, "is_correct": o.is_correct} for o in q.options]
        opts.sort(key=lambda x: x["id"])
        q_data.append({"id":q.id, "type":q.type, "text":q.text, "reading_material":q.reading_material, "options":opts, "explanation":q.explanation, "label_true":q.label_true, "label_false":q.label_false, "image_url":q.image_url})
    q_data.sort(key=lambda x: x["id"])
    return {"title": exam.title, "questions": q_data}

@app.delete("/admin/questions/{qid}")
def delete_single_question(qid: int, db: Session = Depends(get_db)):
    db.query(models.Question).filter_by(id=qid).delete(); db.commit(); return {"message":"Deleted"}

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
        opts = [{"id": o.option_index, "label": o.label} for o in q.options] 
        opts.sort(key=lambda x: x['id'])
        q_data.append({"id":q.id, "type":q.type, "text":q.text, "reading_material":q.reading_material, "options":opts, "label_true":q.label_true, "label_false":q.label_false, "image_url":q.image_url})
    q_data.sort(key=lambda x: x['id'])
    return {"id": exam.id, "title": exam.title, "duration": exam.duration, "questions": q_data}

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if not user: raise HTTPException(404)
    if db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first(): return {"message": "Submitted"}
    questions = db.query(models.Question).filter_by(exam_id=exam_id).all()
    correct, earned = 0, 0.0
    for q in questions:
        if check_answer_correctness(q, data.answers.get(str(q.id))): correct += 1; earned += q.difficulty
    total_w = sum(q.difficulty for q in questions)
    score = 200 + ((earned / total_w) * 800) if total_w > 0 else 200
    db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct, wrong_count=len(questions)-correct, irt_score=score)); db.commit()
    return {"message": "Saved"}

@app.get("/student/exams/{exam_id}/review")
def review_exam(exam_id: str, username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    res = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first()
    if not res: raise HTTPException(403)
    exam = db.query(models.Exam).filter_by(id=exam_id).first()
    q_data = []
    for q in exam.questions:
        opts = [{"id": o.option_index, "label": o.label, "is_correct": o.is_correct} for o in q.options]
        opts.sort(key=lambda x: x['id'])
        q_data.append({"id":q.id, "type":q.type, "text":q.text, "reading_material":q.reading_material, "options":opts, "explanation":q.explanation, "label_true":q.label_true, "label_false":q.label_false, "image_url":q.image_url})
    q_data.sort(key=lambda x: x['id'])
    return {"title": exam.title, "questions": q_data, "score": res.irt_score}

# STANDAR: LOGIN, USERS, MAJORS, CONFIG, DLL SAMA SEPERTI SEBELUMNYA
@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if user and user.password == data.password:
        return {"message": "OK", "username": user.username, "name": user.full_name, "role": user.role, "choice1_id":user.choice1_id, "choice2_id":user.choice2_id, "pilihan1":user.choice1.name if user.choice1 else "", "pg1":user.choice1.passing_grade if user.choice1 else 0}
    raise HTTPException(400, "Login Gagal")

@app.get("/config/{key}")
def get_cfg(k:str, db:Session=Depends(get_db)): 
    c=db.query(models.SystemConfig).filter_by(key=k).first(); return {"value":c.value if c else "false"}
@app.post("/config/{key}")
def set_cfg(k:str, d:ConfigSchema, db:Session=Depends(get_db)): 
    c=db.query(models.SystemConfig).filter_by(key=k).first(); 
    if c: c.value=d.value 
    else: db.add(models.SystemConfig(key=k,value=d.value)); 
    db.commit(); return {"message":"OK"}

@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): return db.query(models.Major).all()
@app.post("/majors")
def add_major(d: MajorCreateSchema, db: Session = Depends(get_db)): db.add(models.Major(university=d.university, name=d.name, passing_grade=d.passing_grade)); db.commit(); return {"message":"OK"}
@app.delete("/majors/{mid}")
def del_major(mid: int, db: Session = Depends(get_db)): db.query(models.Major).filter_by(id=mid).delete(); db.commit(); return {"message":"OK"}
@app.post("/users/select-major")
def set_major(d: MajorSelectionSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=d.username).first()
    if u: u.choice1_id, u.choice2_id = d.choice1_id, d.choice2_id; db.commit()
    return {"message": "Saved"}

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()
@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)): db.add(models.User(username=u.username, password=u.password, full_name=u.full_name, role=u.role)); db.commit(); return {"message":"OK"}
@app.put("/admin/users/{uid}/password")
def upd_pass(uid:int, d:UserPasswordUpdateSchema, db:Session=Depends(get_db)): u=db.query(models.User).filter_by(id=uid).first(); u.password=d.new_password; db.commit(); return {"message":"OK"}
@app.delete("/admin/users/{uid}")
def del_user(uid:int, db:Session=Depends(get_db)): db.query(models.User).filter_by(id=uid).delete(); db.commit(); return {"message":"OK"}
@app.post("/admin/users/delete-bulk")
def del_bulk(d:BulkDeleteSchema, db:Session=Depends(get_db)): db.query(models.User).filter(models.User.id.in_(d.user_ids)).delete(synchronize_session=False); db.commit(); return {"message":"OK"}

@app.get("/admin/recap")
def get_recap(period_id: Optional[int]=None, db: Session=Depends(get_db)):
    users = db.query(models.User).filter_by(role='student').options(joinedload(models.User.results), joinedload(models.User.choice1)).all()
    res=[]
    for u in users:
        urs = [r for r in u.results if r.exam_id.startswith(f"P{period_id}_")] if period_id else u.results
        if period_id and not urs: continue
        sc={r.exam_id.split('_')[-1]: r.irt_score for r in urs}
        avg = sum(sc.values())/7 if sc else 0
        stat = "LULUS" if u.choice1 and avg >= u.choice1.passing_grade else "TIDAK LULUS"
        row = {"id":u.id, "full_name":u.full_name, "username":u.username, "average":round(avg,2), "status":stat, "completed_exams":[{"exam_id":r.exam_id, "code":r.exam_id.split('_')[-1]} for r in urs]}
        for k in ["PU","PBM","PPU","PK","LBI","LBE","PM","TWK","TIU","TKP","UMUM"]: row[k]=round(sc.get(k,0),2)
        res.append(row)
    return res

@app.get("/admin/recap/download")
def dl_recap(period_id: Optional[int]=None, db: Session=Depends(get_db)):
    d = get_recap(period_id, db)
    df = pd.DataFrame([{k:v for k,v in r.items() if k!='completed_exams'} for r in d])
    out = io.BytesIO(); df.to_excel(out, index=False); out.seek(0)
    return StreamingResponse(out, headers={'Content-Disposition': 'attachment; filename="rekap.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

# TEMPLATES (Excel Upload Placeholder)
@app.post("/admin/majors/bulk")
async def bulk_majors(file: UploadFile=File(...), db:Session=Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read())); count=0
    df.columns = df.columns.str.lower().str.strip()
    for _,r in df.iterrows():
        try:
            # Mencoba membaca nama kolom yang mungkin variatif
            univ = r.get('universitas') or r.get('university')
            name = r.get('prodi') or r.get('name') or r.get('jurusan')
            pg = r.get('passing_grade') or r.get('pg')
            
            if univ and name:
                db.add(models.Major(university=str(univ), name=str(name), passing_grade=float(pg or 0)))
                count+=1
        except: pass
    db.commit()
    return {"message": f"{count} jurusan"}

@app.post("/admin/users/bulk")
async def bulk_users(file: UploadFile=File(...), db:Session=Depends(get_db)):
    df = pd.read_excel(io.BytesIO(await file.read())); count=0
    df.columns = df.columns.str.lower().str.strip()
    for _,r in df.iterrows():
        try:
            if not db.query(models.User).filter_by(username=str(r['username'])).first():
                db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name']), role='student'))
                count+=1
        except: pass
    db.commit()
    return {"message": f"{count} user"}

@app.post("/admin/upload-questions/{exam_id}")
async def upload_qs(exam_id:str, file: UploadFile=File(...), db:Session=Depends(get_db)):
    try:
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        # Normalisasi nama kolom
        df.columns = df.columns.str.strip().str.title()
        
        db.query(models.Question).filter_by(exam_id=exam_id).delete(); db.commit()
        count=0
        for _, row in df.iterrows():
            # Support image from Excel URL
            img = str(row.get('Gambar')) if pd.notna(row.get('Gambar')) else None
            
            q = models.Question(
                exam_id=exam_id, 
                text=str(row['Soal']), 
                type='multiple_choice', # Default PG dari excel
                difficulty=float(row.get('Kesulitan', 1.0)),
                image_url=img
            )
            db.add(q); db.commit()
            
            # Opsi & Kunci
            key = str(row.get('Kunci','')).strip().upper()
            for char, col in [('A','Opsia'),('B','Opsib'),('C','Opsic'),('D','Opsid'),('E','Opsie')]:
                if pd.notna(row.get(col)):
                    db.add(models.Option(question_id=q.id, option_index=char, label=str(row[col]), is_correct=(char==key)))
            count+=1
        db.commit()
        return {"message": f"{count} soal diupload"}
    except Exception as e: return {"message": str(e)}

@app.get("/admin/download-template")
def dl_temp():
    df = pd.DataFrame([{"Soal":"Contoh Soal", "OpsiA":"A", "OpsiB":"B", "OpsiC":"C", "OpsiD":"D", "OpsiE":"E", "Kunci":"A", "Kesulitan":1, "Gambar":""}])
    out=io.BytesIO(); df.to_excel(out, index=False); out.seek(0)
    return StreamingResponse(out, headers={'Content-Disposition': 'attachment; filename="template.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.get("/init-admin")
def init():
    if not database.SessionLocal().query(models.User).filter_by(username="admin").first():
        database.SessionLocal().add(models.User(username="admin", password="123", role="admin", full_name="Admin")); database.SessionLocal().commit()
    return {"message":"OK"}