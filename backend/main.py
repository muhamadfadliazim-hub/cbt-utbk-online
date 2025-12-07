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
# UUID tidak lagi diimport

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

# --- SCHEMAS (TOKEN DIHILANGKAN) ---
class LoginSchema(BaseModel):
    username: str
    password: str

class AnswerSchema(BaseModel):
    answers: Dict[str, Any] 
    username: str
    # Token dihilangkan

class UserCreateSchema(BaseModel):
    username: str
    full_name: str
    password: str
    role: str = "student" 
class BulkDeleteSchema(BaseModel):
    user_ids: List[int]
class MajorSelectionSchema(BaseModel):
    username: str
    choice1_id: int
    choice2_id: Optional[int] = None
class ConfigSchema(BaseModel):
    value: str
class PeriodCreateSchema(BaseModel):
    name: str
class TogglePeriodSchema(BaseModel):
    is_active: bool

# --- ENDPOINTS ---

@app.get("/config/release")
def get_release_status(db: Session = Depends(get_db)):
    cfg = db.query(models.SystemConfig).filter_by(key="release_announcement").first()
    return {"is_released": cfg.value == "true" if cfg else False}

@app.post("/config/release")
def set_release_status(data: ConfigSchema, db: Session = Depends(get_db)):
    cfg = db.query(models.SystemConfig).filter_by(key="release_announcement").first()
    if not cfg:
        cfg = models.SystemConfig(key="release_announcement", value="false")
        db.add(cfg)
    cfg.value = data.value
    db.commit()
    return {"message": "Status pengumuman diperbarui", "is_released": cfg.value == "true"}

@app.get("/admin/download-template")
def download_template_soal():
    wacana = "Urban Heat Island (UHI) adalah kondisi..."
    data = [
        {
            "Tipe": "PG", 
            "Soal": "Apa penyebab UHI?", 
            "Bacaan": wacana, 
            "Judul Wacana": "Teks Bacaan 1", 
            "Sumber Wacana": "Kompas.com/Edisi 2024",
            "Gambar": "",
            "OpsiA": "Hujan", "OpsiB": "Gedung", "OpsiC": "Angin", "OpsiD": "Pohon", "OpsiE": "Sungai", 
            "Kunci": "B", "Kesulitan": 1.0, "Label1": "", "Label2": ""
        },
        {
            "Tipe": "TABEL", 
            "Soal": "Tentukan kebenaran:", 
            "Bacaan": "", 
            "Judul Wacana": "", 
            "Sumber Wacana": "",
            "Gambar": "",
            "OpsiA": "P1", "OpsiB": "P2", "OpsiC": "", "OpsiD": "", "OpsiE": "", 
            "Kunci": "B,S", "Kesulitan": 1.0, "Label1": "Fakta", "Label2": "Opini"
        }
    ]
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer: df.to_excel(writer, index=False)
    output.seek(0)
    return StreamingResponse(output, headers={'Content-Disposition': 'attachment; filename="template_soal_utbk_lengkap.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.get("/admin/periods")
def get_admin_periods(db: Session = Depends(get_db)):
    return db.query(models.ExamPeriod).order_by(models.ExamPeriod.id.desc()).options(joinedload(models.ExamPeriod.exams)).all()

@app.post("/admin/periods")
def create_period(data: PeriodCreateSchema, db: Session = Depends(get_db)):
    new_period = models.ExamPeriod(name=data.name, is_active=False)
    db.add(new_period)
    db.commit()
    db.refresh(new_period)
    utbk_structure = [("PU", "Penalaran Umum", 30), ("PBM", "Pemahaman Bacaan & Menulis", 25), ("PPU", "Pengetahuan & Pemahaman Umum", 15), ("PK", "Pengetahuan Kuantitatif", 20), ("LBI", "Literasi Bahasa Indonesia", 42.5), ("LBE", "Literasi Bahasa Inggris", 20), ("PM", "Penalaran Matematika", 42.5)]
    for code, title, duration in utbk_structure:
        db.add(models.Exam(id=f"P{new_period.id}_{code}", period_id=new_period.id, code=code, title=title, description="Standar SNBT", duration=duration))
    db.commit()
    return {"message": "Periode Berhasil Dibuat!"}

@app.post("/admin/periods/{period_id}/toggle")
def toggle_period(period_id: int, data: TogglePeriodSchema, db: Session = Depends(get_db)):
    period = db.query(models.ExamPeriod).filter(models.ExamPeriod.id == period_id).first()
    if period:
        period.is_active = data.is_active
        db.commit()
    return {"message": "Status diubah"}

@app.delete("/admin/periods/{period_id}")
def delete_period(period_id: int, db: Session = Depends(get_db)):
    period = db.query(models.ExamPeriod).filter(models.ExamPeriod.id == period_id).first()
    if period:
        db.delete(period)
        db.commit()
    return {"message": "Periode dihapus"}

@app.post("/admin/upload-questions/{exam_id}")
async def upload_questions(exam_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        q_ids = db.query(models.Question.id).filter(models.Question.exam_id == exam_id).all()
        q_ids = [q[0] for q in q_ids]
        if q_ids: db.query(models.Option).filter(models.Option.question_id.in_(q_ids)).delete(synchronize_session=False)
        db.query(models.Question).filter(models.Question.exam_id == exam_id).delete(synchronize_session=False)
        db.commit()
    except Exception: db.rollback()

    try:
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        df.columns = df.columns.str.strip().str.title()
        
        if 'Soal' not in df.columns: return {"message": "Format Excel Salah"}

        count = 0
        for _, row in df.iterrows():
            q_type = 'multiple_choice'
            if 'KOMPLEKS' in str(row.get('Tipe', '')).upper(): q_type = 'complex'
            elif 'ISIAN' in str(row.get('Tipe', '')).upper(): q_type = 'short_answer'
            elif 'TABEL' in str(row.get('Tipe', '')).upper(): q_type = 'table_boolean'
            
            label1 = str(row['Label1']) if 'Label1' in df.columns and pd.notna(row['Label1']) else "Benar"
            label2 = str(row['Label2']) if 'Label2' in df.columns and pd.notna(row['Label2']) else "Salah"
            judul = str(row['Judul Wacana']) if 'Judul Wacana' in df.columns and pd.notna(row['Judul Wacana']) else "Wacana"
            sumber = str(row['Sumber Wacana']) if 'Sumber Wacana' in df.columns and pd.notna(row['Sumber Wacana']) else None

            q = models.Question(
                exam_id=exam_id, type=q_type, text=str(row['Soal']),
                reading_material=str(row['Bacaan']) if pd.notna(row.get('Bacaan')) else None,
                image_url=str(row['Gambar']) if pd.notna(row.get('Gambar')) else None,
                difficulty=float(row.get('Kesulitan', 1.0)),
                total_attempts=0, total_correct=0,
                label_true=label1, label_false=label2,
                reading_label=judul,
                citation=sumber
            )
            db.add(q)
            db.commit()

            kunci = str(row.get('Kunci', ''))
            if q_type == 'short_answer':
                db.add(models.Option(question_id=q.id, option_index="KEY", label=kunci, is_correct=True))
            elif q_type == 'table_boolean':
                keys = kunci.upper().split(',')
                for i, col in enumerate(['Opsia', 'Opsib', 'Opsic', 'Opsid']):
                    if pd.notna(row.get(col)):
                        db.add(models.Option(question_id=q.id, option_index=str(i+1), label=str(row[col]), is_correct=(i<len(keys) and keys[i].strip()=="B")))
            else:
                key_set = set(k.strip() for k in kunci.upper().split(','))
                for c, col in [('A','Opsia'),('B','Opsib'),('C','Opsic'),('D','Opsid'),('E','Opsie')]:
                    if pd.notna(row.get(col)):
                        db.add(models.Option(question_id=q.id, option_index=c, label=str(row[col]), is_correct=(c in key_set)))
            count += 1
        db.commit()
        return {"message": f"Sukses! {count} soal."}
    except Exception as e:
        db.rollback()
        return {"message": f"Error: {str(e)}"}

@app.get("/admin/exams/{exam_id}/preview")
def preview_exam_questions(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam: raise HTTPException(404, "Subtes tidak ditemukan")
    q_data = []
    for q in exam.questions:
        opts = [{"id": o.option_index, "label": o.label, "is_correct": o.is_correct} for o in q.options]
        opts.sort(key=lambda x: x["id"])
        q_data.append({
            "id": q.id, "type": q.type, "text": q.text, "image_url": q.image_url,
            "reading_material": q.reading_material, "difficulty": q.difficulty, "options": opts,
            "label_true": q.label_true, "label_false": q.label_false,
            "reading_label": q.reading_label, "citation": q.citation
        })
    return {"title": exam.title, "questions": q_data}

@app.get("/student/periods")
def get_student_active_periods(username: str = None, db: Session = Depends(get_db)):
    periods = db.query(models.ExamPeriod).filter(models.ExamPeriod.is_active == True).order_by(models.ExamPeriod.id.desc()).all()
    user_id = None
    if username:
        u = db.query(models.User).filter(models.User.username == username).first()
        if u: user_id = u.id

    data = []
    order_map = {"PU":1, "PBM":2, "PPU":3, "PK":4, "LBI":5, "LBE":6, "PM":7}
    for p in periods:
        exams_info = []
        for e in p.exams:
            q_count = db.query(models.Question).filter(models.Question.exam_id == e.id).count()
            is_done = False
            if user_id:
                res = db.query(models.ExamResult).filter_by(user_id=user_id, exam_id=e.id).first()
                if res: is_done = True
            exams_info.append({"id": e.id, "title": e.title, "duration": e.duration, "q_count": q_count, "is_done": is_done})
        exams_info.sort(key=lambda x: order_map.get(x['id'].split('_')[-1], 99))
        data.append({"id": p.id, "name": p.name, "exams": exams_info})
    return data

@app.get("/exams/{exam_id}")
def get_exam_questions(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam: raise HTTPException(404, "Ujian tidak ditemukan")
    q_data = []
    for q in exam.questions:
        opts = [{"id": o.option_index, "label": o.label, "is_math": o.is_math} for o in q.options]
        opts.sort(key=lambda x: x["id"])
        q_data.append({
            "id": q.id, "type": q.type, "text": q.text, "image_url": q.image_url, 
            "reading_material": q.reading_material, "options": opts,
            "label_true": q.label_true, "label_false": q.label_false,
            "reading_label": q.reading_label, "citation": q.citation
        })
    q_data.sort(key=lambda x: x["id"]) 
    return {"id": exam.id, "title": exam.title, "duration": exam.duration, "questions": q_data}

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user: raise HTTPException(404, "User not found")
    
    # Logika Token dihilangkan
    
    questions = db.query(models.Question).filter(models.Question.exam_id == exam_id).all()
    correct, wrong = 0, 0
    total_w, user_w = 0.0, 0.0
    
    for q in questions:
        if q.total_attempts > 0:
            fail_rate = 1.0 - (q.total_correct / q.total_attempts)
            current_difficulty = 1.0 + (fail_rate * 2.0)
            q.difficulty = current_difficulty 
        else:
            current_difficulty = q.difficulty

        total_w += current_difficulty
        user_ans = data.answers.get(str(q.id))
        is_correct = False
        
        if user_ans:
            if q.type == 'table_boolean' and isinstance(user_ans, dict):
                is_correct = all(user_ans.get(str(o.option_index)) == ("B" if o.is_correct else "S") for o in q.options)
            elif q.type == 'short_answer':
                key = next((o for o in q.options if o.is_correct), None)
                is_correct = key and str(user_ans).strip().lower() == key.label.strip().lower()
            elif q.type == 'complex':
                correct_set = {o.option_index for o in q.options if o.is_correct}
                user_set = set(user_ans) if isinstance(user_ans, list) else {user_ans}
                is_correct = user_set == correct_set
            else:
                key = next((o for o in q.options if o.is_correct), None)
                is_correct = key and user_ans == key.option_index
        
        q.total_attempts += 1
        if is_correct: 
            correct += 1
            q.total_correct += 1
            user_w += current_difficulty
        else: 
            wrong += 1
            
    final_irt = (user_w / total_w) * 1000 if total_w > 0 else 0
    
    prev = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first()
    if prev: prev.correct_count, prev.wrong_count, prev.irt_score = correct, wrong, final_irt
    else: db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct, wrong_count=wrong, irt_score=final_irt))
    
    db.commit()
    return {"message": "Tersimpan", "correct": correct, "wrong": wrong}

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user or user.password != data.password: raise HTTPException(400, "Login Gagal")
    
    p1 = f"{user.choice1.university} - {user.choice1.name}" if user.choice1 else ""
    p2 = f"{user.choice2.university} - {user.choice2.name}" if user.choice2 else ""
    pg1 = user.choice1.passing_grade if user.choice1 else 0
    pg2 = user.choice2.passing_grade if user.choice2 else 0
    
    return {
        "message": "Login sukses", 
        "name": user.full_name, 
        "username": user.username, 
        "role": user.role, 
        "pilihan1": p1, "pilihan2": p2, "pg1": pg1, "pg2": pg2
    }
# ... (Semua endpoint user management dan recap lainnya SAMA)