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
    wacana = "Fenomena 'Urban Heat Island' (UHI)... (Teks Wacana Panjang)"
    data = [
        {"Tipe": "PG", "Soal": "Contoh Soal PG", "Bacaan": wacana, "OpsiA": "A", "OpsiB": "B", "OpsiC": "C", "OpsiD": "D", "OpsiE": "E", "Kunci": "C", "Kesulitan": 1.0, "Gambar": ""},
        {"Tipe": "ISIAN", "Soal": "Hitung 5+5", "Bacaan": "", "OpsiA": "", "OpsiB": "", "OpsiC": "", "OpsiD": "", "OpsiE": "", "Kunci": "10", "Kesulitan": 2.0, "Gambar": ""},
        {"Tipe": "TABEL", "Soal": "Benar Salah", "Bacaan": "", "OpsiA": "P1", "OpsiB": "P2", "OpsiC": "", "OpsiD": "", "OpsiE": "", "Kunci": "B,S", "Kesulitan": 1.5, "Gambar": ""}
    ]
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer: df.to_excel(writer, index=False)
    output.seek(0)
    return StreamingResponse(output, headers={'Content-Disposition': 'attachment; filename="template_soal.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.get("/admin/periods")
def get_admin_periods(db: Session = Depends(get_db)):
    try:
        periods = db.query(models.ExamPeriod).order_by(models.ExamPeriod.id.desc()).all()
        res = []
        order_map = {"PU":1, "PBM":2, "PPU":3, "PK":4, "LBI":5, "LBE":6, "PM":7}
        for p in periods:
            exams = []
            for e in p.exams:
                q_count = db.query(models.Question).filter(models.Question.exam_id == e.id).count()
                exams.append({"id": e.id, "title": e.title, "duration": e.duration, "q_count": q_count})
            exams.sort(key=lambda x: order_map.get(x['id'].split('_')[-1], 99))
            res.append({"id": p.id, "name": p.name, "is_active": p.is_active, "exams": exams})
        return res
    except Exception: return []

@app.post("/admin/periods")
def create_period(data: PeriodCreateSchema, db: Session = Depends(get_db)):
    # 1. Buat Header Periode
    new_period = models.ExamPeriod(name=data.name, is_active=False)
    db.add(new_period)
    db.commit()
    db.refresh(new_period)
    
    # 2. Otomatis Generate 7 Subtes UTBK
    utbk_structure = [
        ("PU", "Penalaran Umum", 30),
        ("PBM", "Pemahaman Bacaan & Menulis", 25),
        ("PPU", "Pengetahuan & Pemahaman Umum", 15),
        ("PK", "Pengetahuan Kuantitatif", 20),
        ("LBI", "Literasi Bahasa Indonesia", 42.5),
        ("LBE", "Literasi Bahasa Inggris", 20),
        ("PM", "Penalaran Matematika", 42.5)
    ]
    
    for code, title, duration in utbk_structure:
        # ID Unik: P{id}_{KODE}
        exam_id = f"P{new_period.id}_{code}"
        exam = models.Exam(
            id=exam_id,
            period_id=new_period.id, code=code, title=title, description="Standar SNBT", duration=duration
        )
        db.add(exam)
    db.commit()
    return {"message": "Periode Tryout Berhasil Dibuat!"}

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
        # Hapus soal lama (Child Options terhapus otomatis via cascade di models, tapi kita pastikan bersih)
        questions = db.query(models.Question).filter(models.Question.exam_id == exam_id).all()
        for q in questions:
            db.query(models.Option).filter(models.Option.question_id == q.id).delete()
            db.delete(q)
        db.commit()

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

            q = models.Question(
                exam_id=exam_id, type=q_type, text=str(row['Soal']),
                reading_material=str(row['Bacaan']) if pd.notna(row.get('Bacaan')) else None,
                image_url=str(row['Gambar']) if pd.notna(row.get('Gambar')) else None,
                # INITIAL DIFFICULTY DARI EXCEL
                difficulty=float(row.get('Kesulitan', 1.0)),
                total_attempts=0, total_correct=0
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
        q_data.append({"id": q.id, "type": q.type, "text": q.text, "image_url": q.image_url, "reading_material": q.reading_material, "difficulty": q.difficulty, "options": opts})
    return {"title": exam.title, "questions": q_data}

@app.get("/student/periods")
def get_student_active_periods(db: Session = Depends(get_db)):
    periods = db.query(models.ExamPeriod).filter(models.ExamPeriod.is_active == True).order_by(models.ExamPeriod.id.desc()).all()
    data = []
    order_map = {"PU":1, "PBM":2, "PPU":3, "PK":4, "LBI":5, "LBE":6, "PM":7}
    for p in periods:
        exams_info = []
        for e in p.exams:
            q_count = db.query(models.Question).filter(models.Question.exam_id == e.id).count()
            exams_info.append({"id": e.id, "title": e.title, "duration": e.duration, "q_count": q_count})
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
        q_data.append({"id": q.id, "type": q.type, "text": q.text, "image_url": q.image_url, "reading_material": q.reading_material, "options": opts})
    q_data.sort(key=lambda x: x["id"]) 
    return {"id": exam.id, "title": exam.title, "duration": exam.duration, "questions": q_data}

# --- FUNGSI SUBMIT DENGAN IRT CALIBRATION ---
@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user: raise HTTPException(404, "User not found")
    
    questions = db.query(models.Question).filter(models.Question.exam_id == exam_id).all()
    correct, wrong = 0, 0
    total_score_weight = 0.0
    user_score_weight = 0.0
    
    for q in questions:
        # 1. Hitung Bobot Soal Dinamis (IRT Sederhana)
        # Jika banyak yang salah (fail_rate tinggi), bobot naik
        if q.total_attempts > 0:
            fail_rate = 1.0 - (q.total_correct / q.total_attempts)
            # Formula: Base (1.0) + Faktor Kesulitan
            # Max Difficulty = 3.0 (Sangat Sulit)
            current_difficulty = 1.0 + (fail_rate * 2.0)
            q.difficulty = current_difficulty # Update DB
        else:
            current_difficulty = q.difficulty # Pakai nilai Excel jika belum ada data

        total_score_weight += current_difficulty
        
        # 2. Cek Jawaban
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
        
        # 3. Update Statistik Soal
        q.total_attempts += 1
        if is_correct: 
            correct += 1
            q.total_correct += 1
            user_score_weight += current_difficulty
        else: 
            wrong += 1
            
    # 4. Hitung Skor Akhir (Skala 1000)
    final_irt = (user_score_weight / total_score_weight) * 1000 if total_score_weight > 0 else 0
    
    # Simpan Hasil
    prev = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first()
    if prev: 
        prev.correct_count = correct
        prev.wrong_count = wrong
        prev.irt_score = final_irt
    else:
        db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct, wrong_count=wrong, irt_score=final_irt))
    
    db.commit()
    return {"message": "Tersimpan", "correct": correct, "wrong": wrong}

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user or user.password != data.password: raise HTTPException(400, "Login Gagal")
    return {
        "message": "Login sukses", "name": user.full_name, "username": user.username, "role": user.role,
        "pilihan1": f"{user.choice1.university} - {user.choice1.name}" if user.choice1 else "",
        "pilihan2": f"{user.choice2.university} - {user.choice2.name}" if user.choice2 else "",
        "pg1": user.choice1.passing_grade if user.choice1 else 0,
        "pg2": user.choice2.passing_grade if user.choice2 else 0
    }

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
                db.add(models.User(username=str(row['username']), password=str(row['password']), full_name=str(row['full_name']), role='student'))
                count += 1
        db.commit()
        return {"message": f"{count} user"}
    except Exception as e: return {"message": str(e)}

@app.get("/admin/recap")
def get_score_recap(period_id: Optional[int] = None, db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.role == 'student').options(joinedload(models.User.results), joinedload(models.User.choice1), joinedload(models.User.choice2)).all()
    data = []
    for user in users:
        scores = {}
        # Filter hasil berdasarkan periode (Prefix ID)
        user_results = [r for r in user.results if r.exam_id.startswith(f"P{period_id}_")] if period_id else user.results
        if period_id and not user_results: continue

        for res in user_results:
            suffix = res.exam_id.split('_')[-1]
            scores[suffix] = res.irt_score 
            
        avg = sum(scores.values()) / 7 if len(scores) > 0 else 0
        status, major = "TIDAK LULUS", "-"
        if user.choice1 and avg >= user.choice1.passing_grade: status, major = "LULUS PILIHAN 1", f"{user.choice1.university} - {user.choice1.name}"
        elif user.choice2 and avg >= user.choice2.passing_grade: status, major = "LULUS PILIHAN 2", f"{user.choice2.university} - {user.choice2.name}"
        
        row = {"full_name": user.full_name, "username": user.username, "average": round(avg, 2), "status": status, "accepted_major": major}
        for c in ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"]: row[c] = round(scores.get(c, 0), 2)
        data.append(row)
    return data

@app.get("/admin/recap/download")
def download_recap_excel(period_id: Optional[int] = None, db: Session = Depends(get_db)):
    data = get_score_recap(period_id, db)
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer: df.to_excel(writer, index=False)
    output.seek(0)
    return StreamingResponse(output, headers={'Content-Disposition': 'attachment; filename="rekap.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.get("/student/recap/{username}")
def get_student_recap(username: str, db: Session = Depends(get_db)):
    cfg = db.query(models.SystemConfig).filter_by(key="release_announcement").first()
    is_released = cfg.value == "true" if cfg else False
    user = db.query(models.User).filter(models.User.username == username).options(joinedload(models.User.results), joinedload(models.User.choice1), joinedload(models.User.choice2)).first()
    if not user: raise HTTPException(404, "User not found")
    
    # Kelompokkan hasil per periode
    periods_data = {}
    for res in user.results:
        try:
            p_id = int(res.exam_id.split('_')[0].replace('P', ''))
            if p_id not in periods_data: periods_data[p_id] = []
            periods_data[p_id].append(res)
        except: pass

    reports = []
    periods_db = db.query(models.ExamPeriod).filter(models.ExamPeriod.id.in_(periods_data.keys())).all()
    p_map = {p.id: p.name for p in periods_db}

    for p_id, results in periods_data.items():
        p_scores, p_details = {}, []
        total = 0
        for code in ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"]:
            res = next((r for r in results if r.exam_id.endswith(f"_{code}")), None)
            score = res.irt_score if res else 0
            p_details.append({"code": code, "correct": res.correct_count if res else 0, "wrong": res.wrong_count if res else 0, "score": round(score, 2)})
            total += score
        
        avg = total / 7
        status, accepted = "TIDAK LULUS", "-"
        if user.choice1 and avg >= user.choice1.passing_grade: status, accepted = "LULUS PILIHAN 1", f"{user.choice1.university} - {user.choice1.name}"
        elif user.choice2 and avg >= user.choice2.passing_grade: status, accepted = "LULUS PILIHAN 2", f"{user.choice2.university} - {user.choice2.name}"
        
        reports.append({
            "period_id": p_id, "period_name": p_map.get(p_id, f"Tryout {p_id}"),
            "average": round(avg, 2), "status": status, "accepted_major": accepted, "details": p_details
        })

    return {
        "is_released": is_released, "full_name": user.full_name,
        "choice1_label": f"{user.choice1.university} - {user.choice1.name}" if user.choice1 else "-", 
        "choice1_pg": user.choice1.passing_grade if user.choice1 else 0,
        "choice2_label": f"{user.choice2.university} - {user.choice2.name}" if user.choice2 else "-", 
        "choice2_pg": user.choice2.passing_grade if user.choice2 else 0,
        "reports": reports
    }