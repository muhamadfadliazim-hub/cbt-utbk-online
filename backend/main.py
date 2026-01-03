from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database
import os
import uuid

# SETUP FOLDER
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)

app = FastAPI()
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# CORS (PENTING AGAR LOGIN TIDAK BLOKIR)
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

# --- AUTO REPAIR SAAT STARTUP (SOLUSI LOGIN) ---
@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    try:
        # 1. Pastikan Tabel Ada
        models.Base.metadata.create_all(bind=database.engine)
        
        # 2. Cek Apakah Admin Ada? Jika tidak, Buat!
        admin = db.query(models.User).filter_by(username="admin").first()
        if not admin:
            print("⚠️ Admin tidak ditemukan. Membuat akun admin default...")
            new_admin = models.User(username="admin", password="123", full_name="Super Administrator", role="admin")
            db.add(new_admin)
            
            # Buat Config Default
            if not db.query(models.SystemConfig).filter_by(key="release_announcement").first():
                db.add(models.SystemConfig(key="release_announcement", value="false"))
            
            db.commit()
            print("✅ Akun Admin (admin/123) BERHASIL DIBUAT!")
    except Exception as e:
        print(f"❌ Error Startup: {e}")
    finally:
        db.close()

# --- SKEMA ---
class LoginSchema(BaseModel): username: str; password: str
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class UserCreateSchema(BaseModel): username: str; full_name: str; password: str; role: str = "student"
class UserPasswordUpdateSchema(BaseModel): new_password: str
class BulkDeleteSchema(BaseModel): user_ids: List[int]
class MajorSelectionSchema(BaseModel): username: str; choice1_id: int; choice2_id: Optional[int] = None
class ConfigSchema(BaseModel): value: str
class PeriodCreateSchema(BaseModel): name: str; allowed_usernames: Optional[str] = None; is_random: bool = True; is_flexible: bool = False; exam_type: str = "UTBK"
class MajorCreateSchema(BaseModel): university: str; name: str; passing_grade: float
class MaterialCreateSchema(BaseModel): title: str; type: str; content_url: str; category: str; description: Optional[str] = None
class OptionCreate(BaseModel): label: str; is_correct: bool
class QuestionCreateSchema(BaseModel): 
    text: str; type: str = "multiple_choice"; difficulty: float = 1.0; 
    reading_material: Optional[str] = None; explanation: Optional[str] = None; 
    label_true: Optional[str] = "Benar"; label_false: Optional[str] = "Salah"; 
    image_url: Optional[str] = None; audio_url: Optional[str] = None; 
    options: List[OptionCreate]
class ResetResultSchema(BaseModel): user_id: int; exam_id: str

# --- CORE LOGIC ---
def check_answer_correctness(question, user_ans):
    if not user_ans: return False
    if question.type == 'table_boolean' and isinstance(user_ans, dict):
        for opt in question.options:
            if user_ans.get(str(opt.option_index)) != ("B" if opt.is_correct else "S"): return False
        return True
    elif question.type == 'short_answer':
        key = next((o for o in question.options if o.is_correct), None)
        return key and str(user_ans).strip().lower() == key.label.strip().lower()
    elif question.type == 'complex':
        correct = {o.option_index for o in question.options if o.is_correct}
        user_set = set(user_ans) if isinstance(user_ans, list) else {user_ans}
        return user_set == correct
    else:
        key = next((o for o in question.options if o.is_correct), None)
        return key and str(user_ans) == str(key.option_index)

@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    try:
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as buffer: buffer.write(await file.read())
        return {"url": f"/static/{filename}"}
    except Exception as e: raise HTTPException(500, str(e))

# --- ENDPOINTS ---
@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    # Login super simpel: Cek username & password langsung
    user = db.query(models.User).filter_by(username=data.username).first()
    if user and user.password == data.password:
        return {
            "message": "OK", 
            "username": user.username, 
            "name": user.full_name, 
            "role": user.role, 
            "choice1_id": getattr(user, 'choice1_id', None), 
            "choice2_id": getattr(user, 'choice2_id', None)
        }
    raise HTTPException(400, "Username atau Password Salah")

@app.get("/student/dashboard-stats")
def get_stats(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    if not user: raise HTTPException(404)
    all_results = db.query(models.User.full_name, func.sum(models.ExamResult.irt_score).label('total_score')).join(models.ExamResult).filter(models.User.role == 'student').group_by(models.User.id).order_by(desc('total_score')).limit(10).all()
    leaderboard = [{"rank": i+1, "name": r[0], "score": round(r[1])} for i, r in enumerate(all_results)]
    subtest_scores = {}
    for r in user.results:
        code = r.exam_id.split('_')[-1]
        if code not in subtest_scores: subtest_scores[code] = []
        subtest_scores[code].append(r.irt_score)
    radar_data = [{"subject": k, "score": int(sum(v)/len(v)), "fullMark": 1000} for k, v in subtest_scores.items()]
    return {"leaderboard": leaderboard, "radar": radar_data}

@app.post("/exams/{exam_id}/submit")
def submit_exam(exam_id: str, data: AnswerSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if not user: raise HTTPException(404)
    if db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=exam_id).first(): return {"message": "Submitted"}
    exam = db.query(models.Exam).filter_by(id=exam_id).options(joinedload(models.Exam.period)).first()
    questions = db.query(models.Question).filter_by(exam_id=exam_id).all()
    correct, earned = 0, 0.0
    for q in questions:
        if check_answer_correctness(q, data.answers.get(str(q.id))):
            correct += 1
            earned += 5 if exam.period.exam_type in ["CPNS","KEDINASAN"] else q.difficulty
    
    score = earned
    if exam.period.exam_type == "UTBK":
        total_w = sum(q.difficulty for q in questions)
        score = 200 + ((earned/total_w)*800) if total_w > 0 else 200
    elif exam.period.exam_type not in ["CPNS","KEDINASAN"]:
        score = (correct / len(questions) * 100) if questions else 0
        
    db.add(models.ExamResult(user_id=user.id, exam_id=exam_id, correct_count=correct, wrong_count=len(questions)-correct, irt_score=score))
    db.commit()
    return {"message": "Saved", "score": score}

# ... (Sisa endpoint Admin Period, Users, Materials sama seperti V13, tidak perlu diubah, copy saja dari V13 jika perlu, atau biarkan file ini menghandle logic dasar, tapi agar aman gunakan endpoint lengkap)
# UNTUK MEMPERSINGKAT, SAYA SERTAKAN ENDPOINT KRUSIAL SISANYA:

@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    periods = db.query(models.ExamPeriod).order_by(models.ExamPeriod.id.desc()).options(joinedload(models.ExamPeriod.exams).joinedload(models.Exam.questions)).all()
    return [{"id": p.id, "name": p.name, "is_active": p.is_active, "allow_submit":p.allow_submit, "allowed_usernames":p.allowed_usernames, "exam_type":p.exam_type, "exams": [{"id": e.id, "title": e.title, "code": e.code, "duration": e.duration, "q_count": len(e.questions)} for e in p.exams]} for p in periods]

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=d.name, allowed_usernames=d.allowed_usernames, is_random=d.is_random, is_flexible=d.is_flexible, exam_type=d.exam_type)
    db.add(p); db.commit(); db.refresh(p)
    struct = []
    if d.exam_type in ["CPNS","KEDINASAN"]: struct=[("TWK",30),("TIU",30),("TKP",40)]
    elif d.exam_type == "TNI_POLRI": struct=[("PSI",60),("AKD",90),("KEP",45)]
    elif d.exam_type == "TOEFL": struct=[("LIS",40),("STR",25),("READ",55)]
    elif d.exam_type == "IELTS": struct=[("LIS",30),("READ",60),("WRIT",60)]
    elif d.exam_type == "TKA_SD": struct=[("BIN",30),("MAT",30),("IPA",30)]
    elif d.exam_type == "TKA_SMP": struct=[("BIN",30),("BIG",30),("MAT",40),("IPA",40)]
    elif d.exam_type == "TKA_SMA_IPA": struct=[("MAT",40),("FIS",40),("KIM",40),("BIO",40),("BIN",30),("BIG",30)]
    elif d.exam_type == "TKA_SMA_IPS": struct=[("MAT",40),("EKO",40),("SOS",40),("GEO",40),("BIN",30),("BIG",30)]
    elif d.exam_type in ["UMUM","MANDIRI"]: struct=[("UMUM",60)]
    else: struct=[("PU",30),("PBM",25),("PPU",15),("PK",20),("LBI",45),("LBE",20),("PM",45)]
    for c, dur in struct: db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, code=c, title=f"Tes {c}", description=d.exam_type, duration=dur))
    db.commit(); return {"message": "OK"}

@app.put("/admin/periods/{pid}")
def update_period(pid: int, d: Dict[str, Any], db: Session = Depends(get_db)):
    p = db.query(models.ExamPeriod).filter_by(id=pid).first()
    if p:
        if 'is_active' in d: p.is_active = d['is_active']
        if 'allow_submit' in d: p.allow_submit = d['allow_submit']
        db.commit()
    return {"message": "Updated"}

@app.delete("/admin/periods/{pid}")
def delete_period(pid: int, db: Session = Depends(get_db)):
    db.query(models.ExamPeriod).filter_by(id=pid).delete(); db.commit(); return {"message": "Deleted"}

@app.get("/majors")
def get_mj(db: Session = Depends(get_db)): return db.query(models.Major).all()
@app.post("/majors")
def add_mj(d: MajorCreateSchema, db: Session = Depends(get_db)): db.add(models.Major(university=d.university, name=d.name, passing_grade=d.passing_grade)); db.commit(); return {"message":"OK"}
@app.delete("/majors/{mid}")
def del_mj(mid: int, db: Session = Depends(get_db)): db.query(models.Major).filter_by(id=mid).delete(); db.commit(); return {"message":"OK"}
@app.post("/users/select-major")
def set_mj(d: MajorSelectionSchema, db: Session = Depends(get_db)): u = db.query(models.User).filter_by(username=d.username).first(); u.choice1_id, u.choice2_id = d.choice1_id, d.choice2_id; db.commit(); return {"message": "Saved"}
@app.get("/admin/users")
def get_usr(db: Session = Depends(get_db)): return db.query(models.User).all()
@app.post("/admin/users")
def add_usr(u: UserCreateSchema, db: Session = Depends(get_db)): db.add(models.User(username=u.username, password=u.password, full_name=u.full_name, role=u.role)); db.commit(); return {"message":"OK"}
@app.delete("/admin/users/{uid}")
def del_usr(uid:int, db:Session=Depends(get_db)): db.query(models.User).filter_by(id=uid).delete(); db.commit(); return {"message":"OK"}
@app.get("/student/periods")
def get_stu_p(username: str, db: Session = Depends(get_db)):
    periods = db.query(models.ExamPeriod).filter_by(is_active=True).order_by(models.ExamPeriod.id.desc()).all()
    user = db.query(models.User).filter_by(username=username).first()
    res = []
    for p in periods:
        if p.allowed_usernames and username.lower() not in p.allowed_usernames.lower(): continue
        exams = [{"id": e.id, "title": e.title, "duration": e.duration, "is_done": bool(db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=e.id).first())} for e in p.exams]
        res.append({"id": p.id, "name": p.name, "exams": exams, "type": p.exam_type})
    return res
@app.get("/exams/{eid}")
def get_ex(eid: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=eid).first()
    qs = [{"id":q.id, "type":q.type, "text":q.text, "reading_material":q.reading_material, "image_url":q.image_url, "audio_url":q.audio_url, "options":[{"id":o.option_index, "label":o.label} for o in q.options]} for q in exam.questions]
    return {"id": exam.id, "title": exam.title, "duration": exam.duration, "questions": qs}