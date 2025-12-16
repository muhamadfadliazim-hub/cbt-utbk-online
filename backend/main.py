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
import random # <--- PENTING

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
    username: str
    password: str
class AnswerSchema(BaseModel):
    answers: Dict[str, Any] 
    username: str
class UserCreateSchema(BaseModel):
    username: str
    full_name: str
    password: str
    role: str = "student" 
class UserPasswordUpdateSchema(BaseModel):
    new_password: str
class BulkDeleteSchema(BaseModel):
    user_ids: List[int]
class MajorSelectionSchema(BaseModel):
    username: str
    choice1_id: int
    choice2_id: Optional[int] = None
class ConfigSchema(BaseModel):
    value: str
class TogglePeriodSchema(BaseModel):
    is_active: bool
class UpdatePeriodUsersSchema(BaseModel):
    allowed_usernames: Optional[str] = None
class ResetResultSchema(BaseModel):
    user_id: int
    exam_id: str

# UPDATE SCHEMA CREATE PERIOD
class PeriodCreateSchema(BaseModel):
    name: str
    allowed_usernames: Optional[str] = None 
    is_random: bool = True # <--- Tambahan

class MajorCreateSchema(BaseModel):
    university: str
    name: str
    passing_grade: float

# --- HELPER ---
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
    return {"message": "Updated", "value": cfg.value}

@app.get("/admin/download-template")
def download_template_soal():
    data = [{"Tipe": "PG", "Soal": "Contoh", "OpsiA": "A", "Kunci": "A", "Kesulitan": 1.0}]
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer: df.to_excel(writer, index=False)
    output.seek(0)
    return StreamingResponse(output, headers={'Content-Disposition': 'attachment; filename="template.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.get("/admin/periods")
def get_admin_periods(db: Session = Depends(get_db)):
    periods = db.query(models.ExamPeriod).order_by(models.ExamPeriod.id.desc()).options(joinedload(models.ExamPeriod.exams).joinedload(models.Exam.questions)).all()
    result = []
    for p in periods:
        p_data = {
            "id": p.id, 
            "name": p.name, 
            "is_active": p.is_active, 
            "allow_submit": p.allow_submit, 
            "allowed_usernames": p.allowed_usernames,
            "is_random": p.is_random, # Tambahan kirim ke frontend
            "exams": []
        }
        for e in p.exams:
            q_count = len(e.questions) if e.questions else 0
            dummy_qs = [{"id": i} for i in range(q_count)]
            p_data["exams"].append({"id": e.id, "title": e.title, "code": e.code, "duration": e.duration, "questions": dummy_qs})
        result.append(p_data)
    return result

@app.post("/admin/periods")
def create_period(data: PeriodCreateSchema, db: Session = Depends(get_db)):
    # Simpan is_random dari input admin
    new_period = models.ExamPeriod(
        name=data.name, 
        is_active=False, 
        allow_submit=True, 
        allowed_usernames=data.allowed_usernames,
        is_random=data.is_random 
    )
    db.add(new_period); db.commit(); db.refresh(new_period)
    structure = [("PU", "Penalaran Umum", 30), ("PBM", "Pemahaman Bacaan & Menulis", 25), ("PPU", "Pengetahuan & Pemahaman Umum", 15), ("PK", "Pengetahuan Kuantitatif", 20), ("LBI", "Literasi Bahasa Indonesia", 42.5), ("LBE", "Literasi Bahasa Inggris", 20), ("PM", "Penalaran Matematika", 42.5)]
    for c, t, d in structure:
        db.add(models.Exam(id=f"P{new_period.id}_{c}", period_id=new_period.id, code=c, title=t, description="Standard", duration=d))
    db.commit()
    return {"message": "Periode Berhasil Dibuat!"}

@app.put("/admin/periods/{pid}/users")
def update_period_users(pid: int, data: UpdatePeriodUsersSchema, db: Session = Depends(get_db)):
    p = db.query(models.ExamPeriod).filter_by(id=pid).first()
    if not p: raise HTTPException(404, "Period not found")
    p.allowed_usernames = data.allowed_usernames
    db.commit()
    return {"message": "Akses peserta berhasil diperbarui"}

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

@app.post("/admin/reset-result")
def reset_result(data: ResetResultSchema, db: Session = Depends(get_db)):
    if not data.exam_id: raise HTTPException(400, "Exam ID required")
    deleted = db.query(models.ExamResult).filter_by(user_id=data.user_id, exam_id=data.exam_id).delete()
    db.commit()
    return {"message": f"Reset berhasil ({deleted} data)"}

@app.post("/upload-exam")
async def upload_exam_manual(title: str = Form(...), duration: float = Form(...), description: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        p = models.ExamPeriod(name=f"Manual: {title}", is_active=False, allow_submit=True, is_random=False)
        db.add(p); db.commit(); db.refresh(p)
        eid = f"MANUAL_{p.id}_{int(time.time())}"
        db.add(models.Exam(id=eid, period_id=p.id, code=description, title=title, description="Upload", duration=duration))
        db.commit()
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        df.columns = df.columns.str.strip().str.title()
        if 'Soal' not in df.columns: return {"message": "Gagal: Kolom 'Soal' hilang"}
        count = 0
        for _, row in df.iterrows():
            q_type = 'multiple_choice'
            if 'KOMPLEKS' in str(row.get('Tipe','')).upper(): q_type = 'complex'
            elif 'ISIAN' in str(row.get('Tipe','')).upper(): q_type = 'short_answer'
            elif 'TABEL' in str(row.get('Tipe','')).upper(): q_type = 'table_boolean'
            q = models.Question(exam_id=eid, type=q_type, text=str(row['Soal']), reading_material=str(row.get('Bacaan')) if pd.notna(row.get('Bacaan')) else None, image_url=str(row.get('Gambar')) if pd.notna(row.get('Gambar')) else None, difficulty=float(row.get('Kesulitan', 1.0)), reading_label=str(row.get('Judul Wacana')) if pd.notna(row.get('Judul Wacana')) else None, citation=str(row.get('Sumber Wacana')) if pd.notna(row.get('Sumber Wacana')) else None)
            db.add(q); db.commit() 
            kunci = str(row.get('Kunci', '')).upper()
            if q_type == 'short_answer': db.add(models.Option(question_id=q.id, option_index="KEY", label=kunci, is_correct=True))
            elif q_type == 'table_boolean':
                keys = kunci.split(',')
                for i, col in enumerate(['Opsia', 'Opsib', 'Opsic', 'Opsid']):
                    if pd.notna(row.get(col)): db.add(models.Option(question_id=q.id, option_index=str(i+1), label=str(row[col]), is_correct=(i<len(keys) and keys[i].strip()=="B")))
            else:
                key_set = set(k.strip() for k in kunci.split(','))
                for c, col in [('A','Opsia'),('B','Opsib'),('C','Opsic'),('D','Opsid'),('E','Opsie')]:
                    if pd.notna(row.get(col)): db.add(models.Option(question_id=q.id, option_index=c, label=str(row[col]), is_correct=(c in key_set)))
            count += 1
        db.commit()
        return {"message": f"Sukses! {count} soal."}
    except Exception as e: db.rollback(); return {"detail": str(e), "message": "Error Server"}

@app.post("/admin/upload-questions/{exam_id}")
async def upload_questions(exam_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        q_ids = [q[0] for q in db.query(models.Question.id).filter_by(exam_id=exam_id).all()]
        if q_ids: db.query(models.Option).filter(models.Option.question_id.in_(q_ids)).delete(synchronize_session=False)
        db.query(models.Question).filter_by(exam_id=exam_id).delete(synchronize_session=False)
        db.commit()
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        df.columns = df.columns.str.strip().str.title()
        count = 0
        for _, row in df.iterrows():
            q_type = 'multiple_choice'
            if 'KOMPLEKS' in str(row.get('Tipe','')).upper(): q_type = 'complex'
            elif 'ISIAN' in str(row.get('Tipe','')).upper(): q_type = 'short_answer'
            elif 'TABEL' in str(row.get('Tipe','')).upper(): q_type = 'table_boolean'
            q = models.Question(exam_id=exam_id, type=q_type, text=str(row['Soal']), reading_material=str(row.get('Bacaan')) if pd.notna(row.get('Bacaan')) else None, image_url=str(row.get('Gambar')) if pd.notna(row.get('Gambar')) else None, difficulty=float(row.get('Kesulitan', 1.0)), reading_label=str(row.get('Judul Wacana')) if pd.notna(row.get('Judul Wacana')) else None, citation=str(row.get('Sumber Wacana')) if pd.notna(row.get('Sumber Wacana')) else None)
            db.add(q); db.commit()
            kunci = str(row.get('Kunci','')).upper()
            if q_type == 'short_answer': db.add(models.Option(question_id=q.id, option_index="KEY", label=kunci, is_correct=True))
            elif q_type == 'table_boolean':
                keys = kunci.split(',')
                for i, col in enumerate(['Opsia', 'Opsib', 'Opsic', 'Opsid']):
                    if pd.notna(row.get(col)): db.add(models.Option(question_id=q.id, option_index=str(i+1), label=str(row[col]), is_correct=(i<len(keys) and keys[i].strip()=="B")))
            else:
                key_set = set(k.strip() for k in kunci.split(','))
                for c, col in [('A','Opsia'),('B','Opsib'),('C','Opsic'),('D','Opsid'),('E','Opsie')]:
                    if pd.notna(row.get(col)): db.add(models.Option(question_id=q.id, option_index=c, label=str(row[col]), is_correct=(c in key_set)))
            count += 1
        db.commit()
        return {"message": f"Sukses! {count} soal."}
    except Exception as e: return {"message": str(e)}

@app.get("/admin/exams/{exam_id}/preview")
def preview_exam_questions(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=exam_id).options(joinedload(models.Exam.questions).joinedload(models.Question.options)).first()
    if not exam: raise HTTPException(404, "Exam not found")
    q_data = []
    for q in exam.questions:
        opts = [{"id": o.option_index, "label": o.label, "is_correct": o.is_correct} for o in q.options]
        opts.sort(key=lambda x: x["id"])
        safe_difficulty = 1.0
        try:
            if q.difficulty and not math.isnan(q.difficulty): safe_difficulty = q.difficulty
        except: pass
        q_data.append({"id": q.id, "type": q.type, "text": q.text, "image_url": q.image_url, "reading_material": q.reading_material, "difficulty": safe_difficulty, "options": opts, "label_true": q.label_true, "label_false": q.label_false, "reading_label": q.reading_label, "citation": q.citation})
    q_data.sort(key=lambda x: x["id"])
    return {"title": exam.title, "questions": q_data}

@app.get("/admin/exams/{exam_id}/analysis")
def get_exam_analysis(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=exam_id).options(joinedload(models.Exam.questions)).first()
    if not exam: raise HTTPException(404, "Exam not found")
    stats = []
    for q in exam.questions:
        attempts = q.total_attempts
        correct = q.total_correct
        percentage = round((correct / attempts) * 100, 2) if attempts > 0 else 0
        safe_difficulty = 1.0
        try:
            if q.difficulty and not math.isnan(q.difficulty): safe_difficulty = q.difficulty
        except: pass
        stats.append({"id": q.id, "text": q.text[:50] + "..." if len(q.text) > 50 else q.text, "difficulty": round(safe_difficulty, 2), "attempts": attempts, "correct": correct, "percentage": percentage})
    stats.sort(key=lambda x: x["id"])
    return {"title": exam.title, "stats": stats}

@app.get("/admin/exams/{exam_id}/analysis/download")
def download_exam_analysis(exam_id: str, db: Session = Depends(get_db)):
    try:
        exam = db.query(models.Exam).filter_by(id=exam_id).options(joinedload(models.Exam.questions)).first()
        if not exam: raise HTTPException(404, "Exam not found")
        data = []
        for i, q in enumerate(exam.questions, 1):
            attempts = q.total_attempts
            correct = q.total_correct
            percentage = round((correct / attempts) * 100, 2) if attempts > 0 else 0
            safe_diff = 1.0
            try:
                if q.difficulty and not math.isnan(q.difficulty): safe_diff = q.difficulty
            except: pass
            data.append({"No": i, "Soal": q.text[:100], "Tipe": q.type, "Kesulitan (IRT)": round(safe_diff, 2), "Total Dijawab": attempts, "Total Benar": correct, "Persentase Benar (%)": percentage})
        df = pd.DataFrame(data)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer: df.to_excel(writer, index=False)
        output.seek(0)
        return StreamingResponse(output, headers={'Content-Disposition': 'attachment; filename="analisis_soal.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal download excel: {str(e)}")

# --- UPDATE PENTING DI SINI: get_student_periods ---
@app.get("/student/periods")
def get_student_periods(username: str = None, db: Session = Depends(get_db)):
    periods = db.query(models.ExamPeriod).filter_by(is_active=True).order_by(models.ExamPeriod.id.desc()).all()
    
    user = None
    if username:
        user = db.query(models.User).filter_by(username=username).first()
    
    res = []
    for p in periods:
        if p.allowed_usernames:
            allowed_list = [u.strip().lower() for u in p.allowed_usernames.split(',')]
            if not username or username.lower() not in allowed_list: continue
            
        exams_data = []
        for e in p.exams:
            q_count = db.query(models.Question).filter_by(exam_id=e.id).count()
            is_done = False
            if user:
                if db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=e.id).first(): is_done = True
            exams_data.append({"id": e.id, "title": e.title, "duration": e.duration, "q_count": q_count, "is_done": is_done, "allow_submit": p.allow_submit})
        
        # --- LOGIKA PENGACAKAN ---
        if user and p.is_random:
            # Acak Konsisten per User & Periode
            seed_val = f"{user.id}_{p.id}_UTBK2024"
            rng = random.Random(seed_val)
            rng.shuffle(exams_data)
        else:
            # Normal Sort
            order_map = {"PU":1, "PBM":2, "PPU":3, "PK":4, "LBI":5, "LBE":6, "PM":7}
            exams_data.sort(key=lambda x: order_map.get(x['id'].split('_')[-1], 99))
            
        # --- BLOCKING TIME LOGIC ---
        final_exams = []
        is_previous_done = True
        
        for ex in exams_data:
            status = "locked"
            if ex["is_done"]:
                status = "done"
            elif is_previous_done:
                status = "open"
            
            ex["status"] = status
            final_exams.append(ex)
            is_previous_done = ex["is_done"]

        res.append({"id": p.id, "name": p.name, "exams": final_exams})
    return res

@app.get("/exams/{exam_id}")
def get_exam_questions(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).options(joinedload(models.Exam.period)).filter_by(id=exam_id).first()
    if not exam: raise HTTPException(404, "Exam not found")
    q_data = []
    for q in exam.questions:
        opts = [{"id": o.option_index, "label": o.label} for o in q.options]
        opts.sort(key=lambda x: x['id'])
        q_data.append({"id": q.id, "type": q.type, "text": q.text, "image_url": q.image_url, "reading_material": q.reading_material, "options": opts, "label_true": q.label_true, "label_false": q.label_false, "reading_label": q.reading_label, "citation": q.citation})
    q_data.sort(key=lambda x: x['id'])
    return {"id": exam.id, "title": exam.title, "duration": exam.duration, "questions": q_data, "allow_submit": exam.period.allow_submit}

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if not user: raise HTTPException(404)
    
    existing = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first()
    if existing: 
        return {"message": "Already Submitted", "correct": existing.correct_count, "wrong": existing.wrong_count}
    
    questions = db.query(models.Question).filter_by(exam_id=exam_id).all()
    correct, total_w, earned_w = 0, 0.0, 0.0
    for q in questions:
        user_ans = data.answers.get(str(q.id))
        is_correct = check_answer_correctness(q, user_ans)
        q.total_attempts += 1
        if is_correct: q.total_correct += 1
        
        if q.total_attempts >= 5:
            q.difficulty = 1.0 + ((1.0 - (q.total_correct/q.total_attempts)) * 3.0)
        
        safe_diff = 1.0
        try:
            if q.difficulty and not math.isnan(q.difficulty): safe_diff = q.difficulty
        except: pass
        
        total_w += safe_diff
        if is_correct: 
            correct += 1
            earned_w += safe_diff
    
    db.commit()
    MIN, MAX = 200, 1000
    if total_w > 0:
        ratio = earned_w / total_w
        final_score = MIN + (ratio * (MAX - MIN))
    else:
        final_score = MIN
        
    wrong = len(questions) - correct
    db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct, wrong_count=wrong, irt_score=final_score))
    db.commit()
    return {"message": "Saved", "score": round(final_score, 2), "correct": correct, "wrong": wrong}

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if user and user.password == data.password:
        return {"message": "OK", "username": user.username, "name": user.full_name, "role": user.role, 
                "pilihan1": f"{user.choice1.university} - {user.choice1.name}" if user.choice1 else "",
                "pg1": user.choice1.passing_grade if user.choice1 else 0}
    raise HTTPException(400, "Login Gagal")

@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): return db.query(models.Major).all()
@app.post("/majors")
def add_major(d: MajorCreateSchema, db: Session = Depends(get_db)):
    db.add(models.Major(university=d.university, name=d.name, passing_grade=d.passing_grade)); db.commit(); return {"message": "OK"}
@app.delete("/majors/{mid}")
def del_major(mid: int, db: Session = Depends(get_db)):
    db.query(models.Major).filter_by(id=mid).delete(); db.commit(); return {"message": "OK"}
@app.post("/admin/majors/bulk")
async def bulk_upload_majors(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')
        count = 0
        for _, row in df.iterrows():
            col_univ = next((c for c in df.columns if 'univ' in c), None)
            col_prodi = next((c for c in df.columns if 'prodi' in c or 'jurusan' in c), None)
            col_pg = next((c for c in df.columns if 'pass' in c or 'grade' in c), None)
            if col_univ and col_prodi and col_pg:
                univ, name = str(row[col_univ]).strip(), str(row[col_prodi]).strip()
                try: pg = float(row[col_pg])
                except: pg = 0.0
                existing = db.query(models.Major).filter_by(university=univ, name=name).first()
                if existing: existing.passing_grade = pg
                else: db.add(models.Major(university=univ, name=name, passing_grade=pg))
                count += 1
        db.commit()
        return {"message": f"Berhasil memproses {count} jurusan."}
    except Exception as e: return {"message": f"Error: {str(e)}"}
@app.post("/users/select-major")
def set_major(d: MajorSelectionSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=d.username).first()
    if u: u.choice1_id, u.choice2_id = d.choice1_id, d.choice2_id; db.commit()
    return {"message": "Saved"}
@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()
@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    db.add(models.User(username=u.username, password=u.password, full_name=u.full_name, role=u.role)); db.commit(); return {"message": "OK"}
@app.put("/admin/users/{uid}/password")
def update_user_password(uid: int, d: UserPasswordUpdateSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(id=uid).first()
    if u: u.password = d.new_password; db.commit()
    return {"message": "Password updated"}
@app.delete("/admin/users/{uid}")
def del_user(uid: int, db: Session = Depends(get_db)):
    db.query(models.User).filter_by(id=uid).delete(); db.commit(); return {"message": "OK"}
@app.post("/admin/users/delete-bulk")
def del_bulk(d: BulkDeleteSchema, db: Session = Depends(get_db)):
    db.query(models.User).filter(models.User.id.in_(d.user_ids)).delete(synchronize_session=False); db.commit(); return {"message": "OK"}
@app.post("/admin/users/bulk")
async def bulk_user(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        df = pd.read_excel(io.BytesIO(await file.read()))
        df.columns = df.columns.str.lower().str.strip()
        c=0
        for _,r in df.iterrows():
            if not db.query(models.User).filter_by(username=str(r['username'])).first():
                db.add(models.User(username=str(r['username']), password=str(r['password']), full_name=str(r['full_name']), role=str(r.get('role','student')))); c+=1
        db.commit(); return {"message": f"{c} users"}
    except Exception as e: return {"message": str(e)}

@app.get("/admin/recap")
def get_recap(period_id: Optional[int]=None, db: Session=Depends(get_db)):
    users = db.query(models.User).filter_by(role='student').options(joinedload(models.User.results), joinedload(models.User.choice1), joinedload(models.User.choice2)).all()
    res=[]
    for u in users:
        urs = [r for r in u.results if r.exam_id.startswith(f"P{period_id}_")] if period_id else u.results
        if period_id and not urs: continue
        sc={}
        exam_id_map = {} 
        for r in urs:
            code = r.exam_id.split('_')[-1]
            sc[code] = r.irt_score
            exam_id_map[code] = r.exam_id
        
        completed=[{"code":k, "exam_id": exam_id_map[k]} for k in sc]
        
        avg = sum(sc.values())/7 if sc else 0
        stat, maj = "TIDAK LULUS", "-"
        if u.choice1 and avg >= u.choice1.passing_grade: stat, maj = "LULUS PIL 1", u.choice1.name
        elif u.choice2 and avg >= u.choice2.passing_grade: stat, maj = "LULUS PIL 2", u.choice2.name
        
        row = {"id":u.id, "full_name":u.full_name, "username":u.username, "average":round(avg,2), "status":stat, "accepted_major":maj, "completed_exams":completed}
        for k in ["PU","PPU","PBM","PK","LBI","LBE","PM"]: row[k]=round(sc.get(k,0),2)
        res.append(row)
    return res

@app.get("/admin/recap/download")
def dl_recap(period_id: Optional[int]=None, db: Session=Depends(get_db)):
    try:
        d = get_recap(period_id, db)
        data_clean = []
        for row in d:
            r = row.copy()
            if 'completed_exams' in r: del r['completed_exams']
            if 'id' in r: del r['id']
            data_clean.append(r)
        df = pd.DataFrame(data_clean)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        output.seek(0)
        return StreamingResponse(output, headers={'Content-Disposition': 'attachment; filename="rekap.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as e: raise HTTPException(500, f"Error download: {str(e)}")

@app.get("/student/recap/{uname}")
def stu_recap(uname: str, db: Session=Depends(get_db)):
    cfg = db.query(models.SystemConfig).filter_by(key="release_announcement").first()
    released = cfg.value=="true" if cfg else False
    u = db.query(models.User).filter_by(username=uname).options(joinedload(models.User.results), joinedload(models.User.choice1), joinedload(models.User.choice2)).first()
    if not u: raise HTTPException(404)
    
    p_ids = {int(r.exam_id.split('_')[0].replace('P','')) for r in u.results if 'P' in r.exam_id}
    p_map = {p.id:p.name for p in db.query(models.ExamPeriod).filter(models.ExamPeriod.id.in_(p_ids)).all()}
    
    reps = []
    for pid in p_ids:
        p_tot = 0
        dets = []
        for c in ["PU","PPU","PBM","PK","LBI","LBE","PM"]:
            target_id = f"P{pid}_{c}"
            res = next((r for r in u.results if r.exam_id == target_id), None)
            sc = res.irt_score if res else 0
            p_tot += sc
            dets.append({"code":c, "correct":res.correct_count if res else 0, "wrong":res.wrong_count if res else 0, "score":round(sc,2)})
        
        avg = p_tot/7
        st, mj = "TIDAK LULUS", "-"
        if u.choice1 and avg >= u.choice1.passing_grade: st, mj = "LULUS PIL 1", u.choice1.name
        elif u.choice2 and avg >= u.choice2.passing_grade: st, mj = "LULUS PIL 2", u.choice2.name
        reps.append({"period_id":pid, "period_name":p_map.get(pid,"Tryout"), "average":round(avg,2), "status":st, "accepted_major":mj, "details":dets})
    
    c1 = f"{u.choice1.university} - {u.choice1.name}" if u.choice1 else "-"
    c2 = f"{u.choice2.university} - {u.choice2.name}" if u.choice2 else "-"
    return {"is_released":released, "full_name":u.full_name, "choice1_label":c1, "choice1_pg":u.choice1.passing_grade if u.choice1 else 0, "choice2_label":c2, "choice2_pg":u.choice2.passing_grade if u.choice2 else 0, "reports":reps}
# --- TAMBAHAN KHUSUS: INIT ADMIN OTOMATIS ---
@app.get("/init-admin")
def init_admin(db: Session = Depends(get_db)):
    # 1. Cek apakah user 'admin' sudah ada?
    user = db.query(models.User).filter_by(username="admin").first()
    
    if user:
        # Jika sudah ada, paksa jadi admin dan reset password
        user.role = "admin"
        user.password = "123"
        db.commit()
        return {"message": "User 'admin' sudah ada. Role diupdate jadi ADMIN. Password: 123"}
    else:
        # Jika belum ada, buat baru
        new_admin = models.User(
            username="admin",
            full_name="Super Admin",
            password="123",
            role="admin"  # <--- INI KUNCINYA
        )
        db.add(new_admin)
        db.commit()
        return {"message": "Sukses! Akun ADMIN berhasil dibuat. Login: admin / 123"}