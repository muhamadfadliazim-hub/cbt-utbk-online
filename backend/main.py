# FILE: backend/main.py

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, distinct
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import pandas as pd
import io
import os
import qrcode
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from database import engine

# --- SETUP ---
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend CBT Aktif! Silakan akses endpoint API atau buka /docs."}

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- SCHEMAS ---
class LoginSchema(BaseModel): username: str; password: str
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class UserCreateSchema(BaseModel): username: str; full_name: str; password: str; role: str = "student"; school: Optional[str] = None
class BulkDeleteSchema(BaseModel): user_ids: List[int]
class MajorSelectionSchema(BaseModel): username: str; choice1_id: int; choice2_id: Optional[int] = None
class ConfigSchema(BaseModel): value: str
class PeriodCreateSchema(BaseModel): 
    name: str; target_schools: Optional[str] = None; exam_type: str = "UTBK"; mode: str = "standard"
class QuestionUpdateSchema(BaseModel):
    text: str; explanation: Optional[str] = None; reading_material: Optional[str] = None; key: str; label1: Optional[str] = "Benar"; label2: Optional[str] = "Salah"
class InstituteConfigSchema(BaseModel):
    name: str; city: str; signer_name: str; signer_jabatan: str; signer_nip: str

# --- ENDPOINTS ---

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if user and user.password == data.password:
        c1 = db.query(models.Major).filter_by(id=user.choice1_id).first()
        c2 = db.query(models.Major).filter_by(id=user.choice2_id).first()
        return {
            "message": "OK", "username": user.username, "name": user.full_name, "role": user.role, "school": user.school,
            "choice1_id":user.choice1_id, "choice2_id":user.choice2_id,
            "display1": f"{c1.university} - {c1.name}" if c1 else "", "pg1": c1.passing_grade if c1 else 0,
            "display2": f"{c2.university} - {c2.name}" if c2 else "", "pg2": c2.passing_grade if c2 else 0
        }
    raise HTTPException(400, "Login Gagal.")

@app.get("/admin/schools-list")
def get_schools_list(db: Session = Depends(get_db)):
    schools = db.query(distinct(models.User.school)).filter(models.User.school != None, models.User.school != "").all()
    return [s[0] for s in schools]

@app.delete("/admin/results/reset")
def reset_student_result(user_id: int, period_id: int, db: Session = Depends(get_db)):
    exams = db.query(models.Exam).filter_by(period_id=period_id).all()
    exam_ids = [e.id for e in exams]
    if exam_ids:
        db.query(models.ExamResult).filter(models.ExamResult.user_id == user_id, models.ExamResult.exam_id.in_(exam_ids)).delete(synchronize_session=False)
        db.commit()
    return {"message": "Hasil ujian siswa berhasil direset."}

@app.delete("/admin/exams/{eid}/reset")
def reset_exam_questions(eid: str, db: Session = Depends(get_db)):
    db.query(models.Question).filter_by(exam_id=eid).delete()
    db.commit()
    return {"message": "Soal berhasil direset."}

# --- UPDATE: DASHBOARD STATS (PAKET LENGKAP: RAPOR + RADAR + LEADERBOARD) ---
@app.get("/student/dashboard-stats")
def get_stats(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    if not user: raise HTTPException(404)
    
    # Cek Rilis
    config_release = db.query(models.SystemConfig).filter_by(key="release_announcement").first()
    is_released = (config_release.value == "true") if config_release else False
    
    if not is_released: return {"is_released": False}

    # --- 1. HITUNG SKOR & RAPOR (Fitur Baru) ---
    total_score = 0
    subtest_details = []
    subtest_scores_map = {} # Untuk Radar
    
    results = db.query(models.ExamResult).filter_by(user_id=user.id).all()
    
    for r in results:
        exam = db.query(models.Exam).filter_by(id=r.exam_id).first()
        title = exam.title if exam else r.exam_id
        code = exam.code if exam else "Lainnya"
        
        # Simpan Detail
        subtest_details.append({
            "id": r.exam_id, 
            "code": code,
            "subject": title,
            "correct": r.correct_count,
            "wrong": r.wrong_count,
            "score": r.irt_score
        })
        
        # Simpan Score Map untuk Radar
        if code not in subtest_scores_map: subtest_scores_map[code] = []
        subtest_scores_map[code].append(r.irt_score)

        total_score += r.irt_score

    avg_score = int(total_score / 7) if total_score > 0 else 0
    
    # Cek Status Kelulusan
    c1 = db.query(models.Major).filter_by(id=user.choice1_id).first()
    c2 = db.query(models.Major).filter_by(id=user.choice2_id).first()
    
    status_text = "TIDAK LULUS"
    status_color = "red"
    
    if c1 and avg_score >= c1.passing_grade:
        status_text = f"LULUS PILIHAN 1: {c1.university} - {c1.name}"
        status_color = "green"
    elif c2 and avg_score >= c2.passing_grade:
        status_text = f"LULUS PILIHAN 2: {c2.university} - {c2.name}"
        status_color = "blue"

    # --- 2. DATA ANALISIS (Fitur Lama yang Dikembalikan) ---
    # Leaderboard (Top 10)
    all_results = db.query(models.User.full_name, func.sum(models.ExamResult.irt_score).label('total_score')).join(models.ExamResult).filter(models.User.role == 'student').group_by(models.User.id).order_by(desc('total_score')).limit(10).all()
    leaderboard = [{"rank": i+1, "name": r[0], "score": int(r[1])} for i, r in enumerate(all_results)]

    # Radar Chart Data
    std_codes = ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"]
    radar_data = []
    for c in std_codes:
        scores = subtest_scores_map.get(c, [])
        s_avg = sum(scores) / len(scores) if scores else 0
        radar_data.append({"subject": c, "score": int(s_avg), "fullMark": 1000})
        
    return {
        "is_released": True,
        # Data Rapor
        "average": avg_score,
        "total": total_score,
        "status": status_text,
        "status_color": status_color,
        "details": subtest_details,
        "choice1": f"{c1.university} - {c1.name} (PG: {c1.passing_grade})" if c1 else "-",
        "choice2": f"{c2.university} - {c2.name} (PG: {c2.passing_grade})" if c2 else "-",
        # Data Analisis (Restore)
        "leaderboard": leaderboard,
        "radar": radar_data
    }

@app.get("/student/review/{exam_id}")
def get_exam_review(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=exam_id).first()
    if not exam: raise HTTPException(404, "Ujian tidak ditemukan")
    
    qs = []
    for q in exam.questions:
        key_label = ""
        for opt in q.options:
            if opt.is_correct:
                key_label = f"{opt.option_index}. {opt.label}"
                break
        
        qs.append({
            "id": q.id,
            "text": q.text,
            "image_url": q.image_url,
            "reading_material": q.reading_material,
            "explanation": q.explanation, 
            "correct_answer": key_label
        })
    return {"title": exam.title, "questions": qs}

@app.get("/student/periods")
def get_student_periods(username: str, db: Session = Depends(get_db)):
    periods = db.query(models.ExamPeriod).filter_by(is_active=True).order_by(models.ExamPeriod.id.desc()).all()
    user = db.query(models.User).filter_by(username=username).first()
    res = []
    for p in periods:
        if p.allowed_usernames and username.lower() not in p.allowed_usernames.lower(): continue
        exams_data = []
        for e in p.exams:
            is_done = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=e.id).first() is not None
            exams_data.append({"id": e.id, "title": e.title, "code": e.code, "duration": e.duration, "is_done": is_done, "q_count": len(e.questions)})
        res.append({"id": p.id, "name": p.name, "type": p.exam_type, "mode": p.target_schools if p.target_schools in ['full', 'standard'] else 'standard', "exams": exams_data})
    return res

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if not user: raise HTTPException(404)
    if db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first(): return {"message": "Already Submitted", "score": 0}
    questions = db.query(models.Question).filter_by(exam_id=exam_id).all()
    correct_count = 0; total_diff_earned = 0.0; total_diff_possible = 0.0
    for q in questions:
        total_diff_possible += q.difficulty
        user_ans = data.answers.get(str(q.id))
        is_correct = False
        if not user_ans: is_correct = False
        elif q.type == 'table_boolean' and isinstance(user_ans, dict):
            all_match = True
            for opt in q.options:
                ua = user_ans.get(str(opt.option_index)) 
                key = "B" if opt.is_correct else "S"
                if ua != key: all_match = False
            is_correct = all_match
        elif q.type == 'short_answer':
            key_opt = next((o for o in q.options if o.is_correct), None)
            if key_opt and str(user_ans).strip().lower() == key_opt.label.strip().lower(): is_correct = True
        elif q.type == 'complex':
            correct_ids = {o.option_index for o in q.options if o.is_correct}
            user_ids = set(user_ans) if isinstance(user_ans, list) else {user_ans}
            if correct_ids == user_ids: is_correct = True
        else: 
            key_opt = next((o for o in q.options if o.is_correct), None)
            if key_opt and str(user_ans) == str(key_opt.option_index): is_correct = True
        q.stats_total += 1
        if is_correct:
            correct_count += 1; total_diff_earned += q.difficulty; q.stats_correct += 1
    ratio = total_diff_earned / total_diff_possible if total_diff_possible > 0 else 0
    final_score = 200 + (ratio * 800)
    result = models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct_count, wrong_count=len(questions)-correct_count, irt_score=final_score)
    db.add(result); db.commit()
    return {"message": "Saved", "correct": correct_count, "wrong": len(questions)-correct_count, "score": final_score}

@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): return db.query(models.Major).all()
@app.post("/users/select-major")
def set_major(d: MajorSelectionSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=d.username).first()
    u.choice1_id = d.choice1_id; u.choice2_id = d.choice2_id
    db.commit()
    return {"message":"OK"}

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    periods = db.query(models.ExamPeriod).order_by(models.ExamPeriod.id.desc()).options(joinedload(models.ExamPeriod.exams).joinedload(models.Exam.questions)).all()
    return [{"id": p.id, "name": p.name, "target_schools": p.target_schools, "is_active": p.is_active, "type": p.exam_type, "exams": [{"id": e.id, "title": e.title, "code": e.code, "duration": e.duration, "q_count": len(e.questions)} for e in p.exams]} for p in periods]

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    final_type = f"{d.exam_type}_{d.mode.upper()}" 
    p = models.ExamPeriod(name=d.name, exam_type=final_type, target_schools=d.target_schools)
    db.add(p); db.commit(); db.refresh(p)
    codes = [("PU", 30), ("PPU", 15), ("PBM", 25), ("PK", 20), ("LBI", 42.5), ("LBE", 20), ("PM", 42.5)]
    for c, dur in codes:
        db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, code=c, title=f"Tes {c}", duration=dur))
    db.commit()
    return {"message": "OK"}

@app.delete("/admin/periods/{pid}")
def delete_period(pid: int, db: Session = Depends(get_db)):
    db.query(models.ExamPeriod).filter_by(id=pid).delete(); db.commit()
    return {"message": "Deleted"}

@app.post("/admin/periods/{pid}/toggle")
def toggle_period(pid: int, d: Dict[str, bool], db: Session = Depends(get_db)):
    p = db.query(models.ExamPeriod).filter_by(id=pid).first()
    if p: p.is_active = d['is_active']; db.commit()
    return {"message": "OK"}

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()

@app.post("/admin/users")
def add_user(u: UserCreateSchema, db: Session = Depends(get_db)):
    db.add(models.User(username=u.username, password=u.password, full_name=u.full_name, role=u.role, school=u.school))
    db.commit()
    return {"message":"OK"}

@app.post("/admin/users/delete-bulk")
def del_users(d:BulkDeleteSchema, db:Session=Depends(get_db)):
    db.query(models.User).filter(models.User.id.in_(d.user_ids)).delete(synchronize_session=False); db.commit()
    return {"message":"OK"}

@app.get("/admin/exams/{eid}/preview") 
def admin_preview_exam(eid: str, db: Session = Depends(get_db)): return get_exam_detail(eid, db)

@app.get("/exams/{eid}") 
def get_exam_detail(eid: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=eid).first()
    if not exam: raise HTTPException(404)
    qs = []
    for q in exam.questions:
        qs.append({
            "id":q.id, "type":q.type, "text":q.text, "reading_material":q.reading_material, 
            "explanation":q.explanation, "image_url":q.image_url, "difficulty": q.difficulty, 
            "label1": q.label1, "label2": q.label2, "stats": {"correct": q.stats_correct, "total": q.stats_total},
            "options":[{"id":o.option_index, "label":o.label, "is_correct":o.is_correct} for o in q.options] 
        })
    return {"id": exam.id, "title": exam.title, "duration": exam.duration, "questions": qs}

@app.put("/admin/questions/{qid}")
def update_question(qid: int, d: QuestionUpdateSchema, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter_by(id=qid).first()
    if not q: raise HTTPException(404, "Soal tidak ditemukan")
    q.text = d.text; q.explanation = d.explanation; q.reading_material = d.reading_material
    q.label1 = d.label1; q.label2 = d.label2 
    if q.type == 'multiple_choice':
        options = db.query(models.Option).filter_by(question_id=qid).all()
        for opt in options:
            if opt.option_index == d.key: opt.is_correct = True
            else: opt.is_correct = False
    db.commit()
    return {"message": "Soal Berhasil Diupdate"}

@app.post("/admin/upload-questions/{eid}")
async def upload_questions(eid:str, file: UploadFile=File(...), db:Session=Depends(get_db)):
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(content))
        df.columns = df.columns.str.strip().str.lower()
        db.query(models.Question).filter_by(exam_id=eid).delete(); db.commit()
        count = 0
        for _, r in df.iterrows():
            raw_type = str(r.get('tipe', 'PG')).upper()
            q_type = 'multiple_choice'
            if 'ISIAN' in raw_type: q_type = 'short_answer'
            elif 'KOMPLEKS' in raw_type: q_type = 'complex'
            elif 'TABEL' in raw_type: q_type = 'table_boolean'
            l1 = str(r['label1']) if 'label1' in r and pd.notna(r['label1']) else "Benar"
            l2 = str(r['label2']) if 'label2' in r and pd.notna(r['label2']) else "Salah"
            q = models.Question(
                exam_id=eid, text=str(r.get('soal', '-')), type=q_type, difficulty=float(r.get('kesulitan', 1)),
                reading_material=str(r['bacaan']) if 'bacaan' in r and pd.notna(r['bacaan']) else None,
                explanation=str(r['pembahasan']) if 'pembahasan' in r and pd.notna(r['pembahasan']) else None,
                image_url=str(r['gambar']) if 'gambar' in r and pd.notna(r['gambar']) else None,
                label1=l1, label2=l2
            )
            db.add(q); db.commit() 
            k = str(r.get('kunci','')).strip().upper()
            if q_type == 'table_boolean':
                keys = [x.strip() for x in k.split(',')]
                for i, char in enumerate(['a','b','c','d','e']):
                    col_name = f"opsi{char}"
                    if col_name in r and pd.notna(r[col_name]):
                        is_b = (i < len(keys) and keys[i] == 'B') 
                        db.add(models.Option(question_id=q.id, option_index=str(i+1), label=str(r[col_name]), is_correct=is_b))
            elif q_type == 'short_answer':
                db.add(models.Option(question_id=q.id, option_index='KEY', label=k, is_correct=True))
            elif q_type == 'multiple_choice':
                for char in ['a','b','c','d','e']:
                    col_name = f"opsi{char}"
                    if col_name in r and pd.notna(r[col_name]):
                        db.add(models.Option(question_id=q.id, option_index=char.upper(), label=str(r[col_name]), is_correct=(char.upper() == k)))
            elif q_type == 'complex':
                valid_keys = [x.strip() for x in k.split(',')]
                for char in ['a','b','c','d','e']:
                    col_name = f"opsi{char}"
                    if col_name in r and pd.notna(r[col_name]):
                        db.add(models.Option(question_id=q.id, option_index=char.upper(), label=str(r[col_name]), is_correct=(char.upper() in valid_keys)))
            count += 1
        db.commit()
        return {"message": f"Berhasil upload {count} soal"}
    except Exception as e: return {"message": f"Error Upload: {str(e)}"}

@app.post("/admin/users/bulk")
async def bulk_user_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(content))
        df.columns = df.columns.str.strip().str.lower()
        added = 0
        for _, r in df.iterrows():
            uname = str(r['username']).strip()
            if db.query(models.User).filter_by(username=uname).first(): continue 
            sch = None
            for key in ['sekolah', 'cabang', 'unit', 'school']:
                if key in r and pd.notna(r[key]): sch = str(r[key]).strip(); break
            u = models.User(username=uname, password=str(r['password']).strip(), full_name=str(r['full_name']).strip(), role=str(r.get('role', 'student')).strip(), school=sch)
            db.add(u); added += 1
        db.commit()
        return {"message": f"Sukses import {added} siswa baru."}
    except Exception as e: return {"message": f"Gagal import user: {str(e)}"}

@app.post("/admin/upload-majors")
async def upload_majors(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(content))
        df.columns = df.columns.str.strip().str.lower()
        db.query(models.Major).delete(); db.commit()
        count = 0
        for _, r in df.iterrows():
            univ = str(r.get('universitas', '')).strip(); prodi = str(r.get('prodi', '')).strip(); pg = float(r.get('passing_grade', 0))
            if univ and prodi: db.add(models.Major(university=univ, name=prodi, passing_grade=pg)); count += 1
        db.commit()
        return {"message": f"Sukses! {count} Jurusan berhasil diimport."}
    except Exception as e: return {"message": f"Gagal Import: {str(e)}"}

@app.post("/admin/config/institute")
def save_institute_config(d: InstituteConfigSchema, db: Session = Depends(get_db)):
    configs = {"institute_name": d.name, "institute_city": d.city, "signer_name": d.signer_name, "signer_jabatan": d.signer_jabatan, "signer_nip": d.signer_nip}
    for key, val in configs.items():
        c = db.query(models.SystemConfig).filter_by(key=key).first()
        if c: c.value = val
        else: db.add(models.SystemConfig(key=key, value=val))
    db.commit()
    return {"message": "Pengaturan Tersimpan"}

@app.get("/admin/config/institute")
def get_institute_config(db: Session = Depends(get_db)):
    keys = ["institute_name", "institute_city", "signer_name", "signer_jabatan", "signer_nip"]
    res = {}
    for k in keys:
        c = db.query(models.SystemConfig).filter_by(key=k).first()
        res[k] = c.value if c else ""
    return res

def get_recap_data_internal(period_id, db):
    query = db.query(models.ExamResult).join(models.User).filter(models.User.role == 'student')
    if period_id: query = query.filter(models.ExamResult.exam_id.like(f"P{period_id}_%"))
    results = query.all()
    user_map = {}
    
    for r in results:
        if r.user_id not in user_map:
            user_map[r.user_id] = {"id": r.user.id, "full_name": r.user.full_name, "username": r.user.username, "school": r.user.school, "choice1": r.user.choice1_id, "choice2": r.user.choice2_id, "scores": {}, "stats": {}}
        code = r.exam_id.split('_')[-1]
        user_map[r.user_id]["scores"][code] = r.irt_score
        user_map[r.user_id]["stats"][code] = {"correct": r.correct_count, "wrong": r.wrong_count}
    
    final_data = []
    std_codes = ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"]
    for uid, data in user_map.items():
        row = {"id": data["id"], "full_name": data["full_name"], "username": data["username"], "school": data["school"] or "-"}
        
        mj1 = db.query(models.Major).filter_by(id=data["choice1"]).first()
        mj2 = db.query(models.Major).filter_by(id=data["choice2"]).first()
        row["Pilihan 1"] = f"{mj1.university} - {mj1.name}" if mj1 else "-"
        row["Pilihan 2"] = f"{mj2.university} - {mj2.name}" if mj2 else "-"
        
        total = 0
        for c in std_codes: 
            sc = data["scores"].get(c, 0)
            st = data["stats"].get(c, {"correct":0, "wrong":0})
            row[c] = int(sc)
            row[f"{c}_Benar"] = st["correct"]
            row[f"{c}_Salah"] = st["wrong"]
            total += sc
            
        avg = int(total / 7); row["average"] = avg
        
        status_text = "TIDAK LULUS"
        if mj1 and avg >= mj1.passing_grade: status_text = f"LULUS - {mj1.university}"
        elif mj2 and avg >= mj2.passing_grade: status_text = f"LULUS - {mj2.university}"
            
        row["status"] = status_text
        final_data.append(row)
        
    return sorted(final_data, key=lambda x: x['average'], reverse=True)

@app.get("/admin/recap/download-pdf")
def download_pdf_recap(period_id: Optional[str] = None, db: Session = Depends(get_db)):
    data = get_recap_data_internal(period_id, db)
    conf = get_institute_config(db)
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), rightMargin=20, leftMargin=20, topMargin=30, bottomMargin=30)
    elements = []
    styles = getSampleStyleSheet()

    inst_name = conf.get("institute_name", "LEMBAGA PENDIDIKAN")
    elements.append(Paragraph(inst_name, ParagraphStyle(name='Title', parent=styles['Heading1'], alignment=TA_CENTER, fontSize=16, spaceAfter=2)))
    elements.append(Paragraph("LAPORAN HASIL TRYOUT UTBK - SNBT", ParagraphStyle(name='Subtitle', parent=styles['Normal'], alignment=TA_CENTER, fontSize=12, spaceAfter=20)))
    
    headers = ["No", "Nama Siswa", "Sekolah", "PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM", "Rata2", "Status Kelulusan"]
    table_data = [headers]
    
    for i, row in enumerate(data):
        r = [
            str(i+1), 
            row['full_name'][:20], 
            row['school'][:15], 
            row['PU'], row['PPU'], row['PBM'], row['PK'], row['LBI'], row['LBE'], row['PM'], 
            row['average'], 
            row['status']
        ]
        table_data.append(r)
    
    col_widths = [25, 130, 90, 35,35,35,35,35,35,35, 45, 140] 
    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'), 
        ('ALIGN', (1, 1), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (-1, 1), (-1, -1), colors.black), 
    ]))
    
    for i, row in enumerate(data):
        if "TIDAK" in row['status']:
            t.setStyle(TableStyle([('TEXTCOLOR', (-1, i+1), (-1, i+1), colors.red)]))
        else:
            t.setStyle(TableStyle([('TEXTCOLOR', (-1, i+1), (-1, i+1), colors.green)]))

    elements.append(t)
    elements.append(Spacer(1, 40))

    city = conf.get("institute_city", "Kota")
    signer = conf.get("signer_name", "(.......................)")
    jabatan = conf.get("signer_jabatan", "Kepala")
    nip = conf.get("signer_nip", "")
    
    qr_data = f"Verified: Rekap Nilai {inst_name}\nJml Siswa: {len(data)}\nTop Score: {data[0]['average'] if data else 0}"
    qr = qrcode.make(qr_data)
    qr_io = io.BytesIO()
    qr.save(qr_io, format='PNG')
    qr_io.seek(0)
    qr_img = RLImage(qr_io, width=70, height=70)

    ttd_content = [
        [Paragraph(f"{city}, ................. 20..", ParagraphStyle(name='Date', alignment=TA_CENTER))],
        [Paragraph(f"Mengetahui, {jabatan}", ParagraphStyle(name='Jabatan', alignment=TA_CENTER))],
        [qr_img],
        [Paragraph(f"<u>{signer}</u>", ParagraphStyle(name='Signer', alignment=TA_CENTER, fontName='Helvetica-Bold'))],
        [Paragraph(f"NIP/NIY. {nip}", ParagraphStyle(name='NIP', alignment=TA_CENTER))]
    ]
    
    ttd_table = Table([[ "", Table(ttd_content, colWidths=[200]) ]], colWidths=[450, 250])
    ttd_table.setStyle(TableStyle([('ALIGN', (1, 0), (1, 0), 'CENTER')]))
    elements.append(ttd_table)
    
    doc.build(elements)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type='application/pdf', headers={'Content-Disposition': f'attachment; filename="Rekap_Nilai.pdf"'})

@app.get("/admin/recap")
def get_recap(period_id: Optional[str] = None, db: Session = Depends(get_db)): return get_recap_data_internal(period_id, db)

@app.get("/admin/recap/download")
def download_recap_excel(period_id: Optional[str] = None, db: Session = Depends(get_db)):
    data = get_recap_data_internal(period_id, db)
    df = pd.DataFrame(data if data else [{"Info": "Belum ada data"}])
    if "id" in df.columns: del df["id"]
    if "choice1" in df.columns: del df["choice1"]
    if "choice2" in df.columns: del df["choice2"]
    if "scores" in df.columns: del df["scores"]
    
    out = io.BytesIO()
    with pd.ExcelWriter(out, engine='xlsxwriter') as writer: 
        df.to_excel(writer, index=False, sheet_name='Rekap Nilai')
        worksheet = writer.sheets['Rekap Nilai']
        worksheet.set_column(0, 15, 20) 
    
    out.seek(0)
    return StreamingResponse(out, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers={'Content-Disposition': 'attachment; filename="Rekap_Nilai_Lengkap.xlsx"'})

@app.get("/admin/download-template")
def download_template():
    data = [{"Tipe":"PG", "Soal":"Contoh Soal", "OpsiA":"A", "OpsiB":"B", "OpsiC":"C", "OpsiD":"D", "OpsiE":"E", "Kunci":"A", "Kesulitan":1, "Bacaan":"", "Gambar":"", "Pembahasan":"", "Label1":"Benar", "Label2":"Salah"}]
    df = pd.DataFrame(data); out = io.BytesIO()
    with pd.ExcelWriter(out, engine='xlsxwriter') as writer: df.to_excel(writer, index=False, sheet_name='Template')
    out.seek(0)
    return StreamingResponse(out, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers={'Content-Disposition': 'attachment; filename="Template_Soal_CBT.xlsx"'})

@app.get("/admin/download-user-template")
def download_user_template():
    data = [{"username": "siswa001", "password": "123", "full_name": "Ahmad", "role": "student", "sekolah": "Darul Iman"}]
    df = pd.DataFrame(data); out = io.BytesIO()
    with pd.ExcelWriter(out, engine='xlsxwriter') as writer: df.to_excel(writer, index=False, sheet_name='Data Siswa')
    out.seek(0)
    return StreamingResponse(out, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers={'Content-Disposition': 'attachment; filename="Template_Peserta.xlsx"'})

@app.get("/config/release")
def get_conf(db:Session=Depends(get_db)):
    c = db.query(models.SystemConfig).filter_by(key="release_announcement").first()
    return {"is_released": (c.value == "true") if c else False}

@app.post("/config/release")
def set_conf(d:ConfigSchema, db:Session=Depends(get_db)):
    c = db.query(models.SystemConfig).filter_by(key="release_announcement").first()
    if c: c.value = d.value
    else: db.add(models.SystemConfig(key="release_announcement", value=d.value))
    db.commit()
    return {"message":"OK", "is_released": d.value=="true"}