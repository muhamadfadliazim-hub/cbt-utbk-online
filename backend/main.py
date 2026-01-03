from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import models, database
import os, uuid, shutil

# --- KONFIGURASI FOLDER UPLOAD ---
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app = FastAPI(title="CBT Pro Backend")

# --- AKSES STATIS (Agar Gambar Bisa Diakses Frontend) ---
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# --- CORS (Agar Frontend Bisa Komunikasi) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DEPENDENCY DATABASE ---
def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- STARTUP EVENT (Auto-Repair Database) ---
@app.on_event("startup")
def startup_event():
    # Buat Tabel di Database
    models.Base.metadata.create_all(bind=database.engine)
    
    # Cek & Buat Super Admin Default
    db = database.SessionLocal()
    try:
        if not db.query(models.User).filter_by(username="admin").first():
            print("Creating Default Admin...")
            admin = models.User(
                username="admin", 
                password="123", # Di production gunakan Hash!
                full_name="Super Administrator", 
                role="admin", 
                is_premium=True
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()

# --- SCHEMAS (Validasi Data Masuk) ---
class LoginSchema(BaseModel):
    username: str
    password: str

class PeriodCreateSchema(BaseModel):
    name: str
    exam_type: str  # UTBK, CPNS, TKA_SMA
    is_vip: bool = False

class QuestionCreateSchema(BaseModel):
    text: str
    options: List[str]
    correct_option: str
    explanation: str = ""
    image_url: Optional[str] = None

class AnswerSchema(BaseModel):
    answers: Dict[str, Any]
    username: str

# ==========================================
# ENDPOINTS: AUTHENTICATION
# ==========================================

@app.post("/login")
def login(d: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=d.username).first()
    if not user or user.password != d.password:
        raise HTTPException(status_code=400, detail="Username atau Password Salah")
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "is_premium": user.is_premium
    }

# ==========================================
# ENDPOINTS: UPLOAD FILE (IMAGE)
# ==========================================

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Generate nama unik agar tidak bentrok
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Simpan file ke server
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return URL lengkap agar bisa diakses frontend
    # Ganti domain jika sudah deploy production
    return {"url": f"/static/{filename}"}

# ==========================================
# ENDPOINTS: ADMIN (EXAM MANAGEMENT)
# ==========================================

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    # Urutkan dari yang terbaru
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).order_by(models.ExamPeriod.id.desc()).all()

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    # 1. Buat Periode Induk
    p = models.ExamPeriod(
        name=d.name,
        exam_type=d.exam_type,
        is_active=True,
        is_vip_only=d.is_vip
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    # 2. LOGIKA CERDAS: Generate Subtes Berdasarkan Tipe
    struct = []
    tipe = d.exam_type.upper()

    if "CPNS" in tipe or "KEDINASAN" in tipe:
        # Standar SKD BKN
        struct = [
            ("TWK", 30, "Tes Wawasan Kebangsaan"),
            ("TIU", 35, "Tes Intelegensia Umum"),
            ("TKP", 45, "Tes Karakteristik Pribadi")
        ]
    elif "TKA_SMA" in tipe:
        # Saintek
        struct = [
            ("MAT", 25, "Matematika Saintek"),
            ("FIS", 20, "Fisika"),
            ("KIM", 20, "Kimia"),
            ("BIO", 20, "Biologi")
        ]
    else:
        # Default: UTBK SNBT (7 Subtes Lengkap)
        struct = [
            ("PU", 30, "Penalaran Umum"),
            ("PBM", 20, "Pemahaman Bacaan & Menulis"),
            ("PPU", 20, "Pengetahuan & Pemahaman Umum"),
            ("PK", 20, "Pengetahuan Kuantitatif"),
            ("LBI", 30, "Literasi B.Indonesia"),
            ("LBE", 30, "Literasi B.Inggris"),
            ("PM", 20, "Penalaran Matematika")
        ]

    # 3. Masukkan Subtes ke Database
    for code, dur, title in struct:
        sub_exam = models.Exam(
            id=f"P{p.id}_{code}_{uuid.uuid4().hex[:4]}", # ID Unik
            period_id=p.id,
            code=code,
            title=title,
            duration=dur
        )
        db.add(sub_exam)
    
    db.commit()
    return {"message": "Paket Ujian Berhasil Dibuat", "id": p.id}

@app.post("/exams/{exam_id}/questions")
def add_question(exam_id: str, q: QuestionCreateSchema, db: Session = Depends(get_db)):
    # Simpan Pertanyaan
    new_q = models.Question(
        exam_id=exam_id,
        text=q.text,
        image_url=q.image_url,
        correct_option=q.correct_option,
        explanation=q.explanation
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)

    # Simpan Opsi (A, B, C, D, E)
    labels = ["A", "B", "C", "D", "E"]
    for idx, opt_text in enumerate(q.options):
        label_char = labels[idx] if idx < 5 else "?"
        is_right = (label_char == q.correct_option)
        
        opt = models.Option(
            question_id=new_q.id,
            label=opt_text,
            option_index=label_char,
            is_correct=is_right
        )
        db.add(opt)
    
    db.commit()
    return {"message": "Soal Tersimpan"}

@app.get("/exams/{exam_id}/questions")
def get_questions_admin(exam_id: str, db: Session = Depends(get_db)):
    return db.query(models.Question).filter_by(exam_id=exam_id).options(joinedload(models.Question.options)).all()

# ==========================================
# ENDPOINTS: STUDENT (UJIAN & SCORING)
# ==========================================

@app.get("/student/periods")
def get_student_periods(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    if not user: raise HTTPException(404, "User not found")

    # Ambil semua periode aktif
    raw_periods = db.query(models.ExamPeriod).filter_by(is_active=True).options(joinedload(models.ExamPeriod.exams)).order_by(models.ExamPeriod.id.desc()).all()
    
    result = []
    for p in raw_periods:
        # Logika Penguncian (Locking)
        is_locked = False
        if p.is_vip_only and not user.is_premium:
            is_locked = True
        
        result.append({
            "id": p.id,
            "name": p.name,
            "exam_type": p.exam_type,
            "is_vip": p.is_vip_only,
            "locked": is_locked,
            "exams": p.exams # List subtes
        })
    return result

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, d: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=d.username).first()
    if not user: raise HTTPException(404, "User not found")

    # Hitung Skor
    correct = 0
    wrong = 0
    
    # Ambil Kunci Jawaban dari DB (Optimasi Query)
    questions = db.query(models.Question).filter_by(exam_id=exam_id).all()
    key_map = {str(q.id): q.correct_option for q in questions} # { "101": "A", "102": "C" }

    for q_id, user_ans in d.answers.items():
        if q_id in key_map:
            if key_map[q_id] == user_ans:
                correct += 1
            else:
                wrong += 1
    
    # Rumus Nilai Sederhana (Bisa diganti IRT nanti)
    final_score = correct * 10 

    # Simpan History Nilai
    res = models.ExamResult(
        user_id=user.id,
        exam_id=exam_id,
        correct_count=correct,
        wrong_count=wrong,
        irt_score=final_score
    )
    db.add(res)
    db.commit()
    
    return {"score": final_score, "correct": correct, "wrong": wrong}

# ==========================================
# ENDPOINTS: COMMERCIAL (PAYMENT)
# ==========================================

@app.post("/payment/upgrade")
def upgrade_premium(username: str, db: Session = Depends(get_db)):
    # Endpoint ini dipanggil Admin atau Webhook Payment Gateway
    user = db.query(models.User).filter_by(username=username).first()
    if not user: raise HTTPException(404, "User not found")
    
    user.is_premium = True
    db.commit()
    return {"message": f"User {username} berhasil menjadi Premium"}