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
class ResetResultSchema(BaseModel):
    user_id: int
    exam_id: str

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
        {"Tipe": "PG", "Soal": "Apa penyebab UHI?", "Bacaan": wacana, "Judul Wacana": "Teks 1", "Sumber Wacana": "Sumber", "Gambar": "", "OpsiA": "A", "OpsiB": "B", "OpsiC": "C", "OpsiD": "D", "OpsiE": "E", "Kunci": "B", "Kesulitan": 1.0, "Label1": "", "Label2": ""},
        {"Tipe": "TABEL", "Soal": "Tentukan kebenaran:", "Bacaan": "", "Judul Wacana": "", "Sumber Wacana": "", "Gambar": "", "OpsiA": "P1", "OpsiB": "P2", "OpsiC": "", "OpsiD": "", "OpsiE": "", "Kunci": "B,S", "Kesulitan": 1.0, "Label1": "Fakta", "Label2": "Opini"}
    ]
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer: df.to_excel(writer, index=False)
    output.seek(0)
    return StreamingResponse(output, headers={'Content-Disposition': 'attachment; filename="template_soal_utbk_lengkap.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.get("/admin/periods")
def get_admin_periods(db: Session = Depends(get_db)):
    # Tambahkan allow_submit ke response
    return db.query(models.ExamPeriod).order_by(models.ExamPeriod.id.desc()).options(joinedload(models.ExamPeriod.exams)).all()

@app.post("/admin/periods")
def create_period(data: PeriodCreateSchema, db: Session = Depends(get_db)):
    new_period = models.ExamPeriod(name=data.name, is_active=False, allow_submit=True)
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

# FITUR BARU: TOGGLE TOMBOL SUBMIT
@app.post("/admin/periods/{period_id}/toggle-submit")
def toggle_period_submit(period_id: int, data: TogglePeriodSchema, db: Session = Depends(get_db)):
    period = db.query(models.ExamPeriod).filter(models.ExamPeriod.id == period_id).first()
    if period:
        period.allow_submit = data.is_active # Kita reuse schema, is_active disini maksudnya allow_submit
        db.commit()
    return {"message": "Setting Tombol Submit Diubah"}

@app.delete("/admin/periods/{period_id}")
def delete_period(period_id: int, db: Session = Depends(get_db)):
    period = db.query(models.ExamPeriod).filter(models.ExamPeriod.id == period_id).first()
    if period:
        db.delete(period)
        db.commit()
    return {"message": "Periode dihapus"}

# FITUR BARU: RESET HASIL SISWA
@app.post("/admin/reset-result")
def reset_student_result(data: ResetResultSchema, db: Session = Depends(get_db)):
    result = db.query(models.ExamResult).filter_by(user_id=data.user_id, exam_id=data.exam_id).first()
    if result:
        db.delete(result)
        db.commit()
        return {"message": "Hasil ujian berhasil direset. Siswa bisa mengerjakan ulang."}
    raise HTTPException(404, "Data hasil tidak ditemukan")

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
                reading_label=judul, citation=sumber
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
            
            # KIRIM STATUS allow_submit KE FRONTEND
            exams_info.append({
                "id": e.id, "title": e.title, "duration": e.duration, 
                "q_count": q_count, "is_done": is_done, 
                "allow_submit": p.allow_submit # INFO PENTING
            })
        exams_info.sort(key=lambda x: order_map.get(x['id'].split('_')[-1], 99))
        data.append({"id": p.id, "name": p.name, "exams": exams_info})
    return data

@app.get("/exams/{exam_id}")
def get_exam_questions(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam: raise HTTPException(404, "Ujian tidak ditemukan")
    
    # Ambil allow_submit dari parent period
    allow_submit = exam.period.allow_submit if exam.period else True

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
    return {
        "id": exam.id, "title": exam.title, 
        "duration": exam.duration, "questions": q_data,
        "allow_submit": allow_submit # Kirim info ini ke frontend ujian
    }

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user: raise HTTPException(404, "User not found")
    
    existing = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first()
    if existing: return {"message": "Sudah dikerjakan"}

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
    
    db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct, wrong_count=wrong, irt_score=final_irt))
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
    return {"message": "Login sukses", "name": user.full_name, "username": user.username, "role": user.role, "pilihan1": p1, "pilihan2": p2, "pg1": pg1, "pg2": pg2}

@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): return db.query(models.Major).all()

@app.post("/users/select-major")
def set_user_major(data: MajorSelectionSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if user: user.choice1_id, user.choice2_id = data.choice1_id, data.choice2_id; db.commit()
    return {"message": "Saved"}

@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)): return db.query(models.User).order_by(models.User.id.desc()).all()

@app.post("/admin/users")
def create_user(user: UserCreateSchema, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=user.username).first(): raise HTTPException(400, "Username ada")
    db.add(models.User(username=user.username, full_name=user.full_name, password=user.password, role=user.role))
    db.commit()
    return {"message": "OK"}

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)): db.query(models.User).filter_by(id=user_id).delete(); db.commit(); return {"message": "OK"}

@app.post("/admin/users/delete-bulk")
def delete_bulk(data: BulkDeleteSchema, db: Session = Depends(get_db)): db.execute(delete(models.User).where(models.User.id.in_(data.user_ids))); db.commit(); return {"message": "OK"}

@app.post("/admin/users/bulk")
async def bulk_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(content))
        df.columns = df.columns.str.lower().str.strip()
        count = 0
        for _, row in df.iterrows():
            if not db.query(models.User).filter_by(username=str(row['username'])).first():
                role = str(row.get('role', 'student')).strip().lower()
                db.add(models.User(username=str(row['username']), password=str(row['password']), full_name=str(row['full_name']), role=role))
                count += 1
        db.commit()
        return {"message": f"{count} user"}
    except Exception as e: return {"message": str(e)}

@app.get("/admin/recap")
def get_score_recap(period_id: Optional[int] = None, db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.role == 'student').options(joinedload(models.User.results), joinedload(models.User.choice1), joinedload(models.User.choice2)).all()
    data = []
    for user in users:
        # PENTING: Sertakan user.id agar admin bisa mereset nilai berdasarkan ID ini
        user_results = [r for r in user.results if r.exam_id.startswith(f"P{period_id}_")] if period_id else user.results
        if period_id and not user_results: continue
        
        scores = {}
        # Buat daftar ID subtes yang sudah dikerjakan untuk dropdown reset
        completed_exams = []
        
        for res in user_results:
            suffix = res.exam_id.split('_')[-1]
            scores[suffix] = res.irt_score 
            completed_exams.append({"code": suffix, "exam_id": res.exam_id})

        avg = sum(scores.values()) / 7 if len(scores) > 0 else 0
        status, major = "TIDAK LULUS", "-"
        if user.choice1 and avg >= user.choice1.passing_grade: status, major = "LULUS PILIHAN 1", f"{user.choice1.university} - {user.choice1.name}"
        elif user.choice2 and avg >= user.choice2.passing_grade: status, major = "LULUS PILIHAN 2", f"{user.choice2.university} - {user.choice2.name}"
        
        row = {
            "id": user.id, # USER ID UNTUK API RESET
            "full_name": user.full_name, 
            "username": user.username, 
            "average": round(avg, 2), 
            "status": status, 
            "accepted_major": major,
            "completed_exams": completed_exams # Daftar ujian yang bisa direset
        }
        for c in ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"]: row[c] = round(scores.get(c, 0), 2)
        data.append(row)
    return data

@app.get("/admin/recap/download")
def download_recap_excel(period_id: Optional[int] = None, db: Session = Depends(get_db)):
    data = get_score_recap(period_id, db)
    # Flatten data for Excel (remove nested objects)
    flat_data = []
    for d in data:
        row = d.copy()
        del row['completed_exams'] # Hapus kolom teknis ini dari Excel
        del row['id']
        flat_data.append(row)

    df = pd.DataFrame(flat_data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer: df.to_excel(writer, index=False)
    output.seek(0)
    filename = f"rekap_periode_{period_id}.xlsx" if period_id else "rekap_semua.xlsx"
    return StreamingResponse(output, headers={'Content-Disposition': f'attachment; filename="{filename}"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.get("/student/recap/{username}")
def get_student_recap_list(username: str, db: Session = Depends(get_db)):
    cfg = db.query(models.SystemConfig).filter_by(key="release_announcement").first()
    is_released = cfg.value == "true" if cfg else False
    user = db.query(models.User).filter(models.User.username == username).options(joinedload(models.User.results), joinedload(models.User.choice1), joinedload(models.User.choice2)).first()
    if not user: raise HTTPException(404, "User not found")
    participated_periods = set()
    for res in user.results:
        try: participated_periods.add(int(res.exam_id.split('_')[0].replace('P', '')))
        except: pass
    periods_db = db.query(models.ExamPeriod).filter(models.ExamPeriod.id.in_(participated_periods)).all()
    period_map = {p.id: p.name for p in periods_db}
    reports = []
    for p_id in participated_periods:
        p_name = period_map.get(p_id, f"Tryout #{p_id}")
        p_details, p_total = [], 0
        for code in ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"]:
            res = next((r for r in user.results if r.exam_id == f"P{p_id}_{code}"), None)
            score = res.irt_score if res else 0
            p_details.append({"code": code, "correct": res.correct_count if res else 0, "wrong": res.wrong_count if res else 0, "score": round(score, 2)})
            p_total += score
        avg = p_total / 7
        status, accepted = "TIDAK LULUS", "-"
        if user.choice1 and avg >= user.choice1.passing_grade: status, accepted = "LULUS PILIHAN 1", f"{user.choice1.university} - {user.choice1.name}"
        elif user.choice2 and avg >= user.choice2.passing_grade: status, accepted = "LULUS PILIHAN 2", f"{user.choice2.university} - {user.choice2.name}"
        reports.append({"period_id": p_id, "period_name": p_name, "average": round(avg, 2), "status": status, "accepted_major": accepted, "details": p_details})
    choice1_lbl = f"{user.choice1.university} - {user.choice1.name}" if user.choice1 else "-"
    choice2_lbl = f"{user.choice2.university} - {user.choice2.name}" if user.choice2 else "-"
    pg1 = user.choice1.passing_grade if user.choice1 else 0
    pg2 = user.choice2.passing_grade if user.choice2 else 0
    return {
        "is_released": is_released, "full_name": user.full_name, 
        "choice1_label": choice1_lbl, "choice1_pg": pg1, "choice2_label": choice2_lbl, "choice2_pg": pg2,
        "reports": reports
    }