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

# SETUP FOLDER (Tetap ada untuk opsi upload manual)
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)

app = FastAPI()
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- AUTO FIX DB & CONFIG SAAT START ---
@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    try:
        models.Base.metadata.create_all(bind=database.engine)
        # 1. Pastikan Admin Ada
        if not db.query(models.User).filter_by(username="admin").first():
            db.add(models.User(username="admin", password="123", full_name="Super Admin", role="admin"))
        
        # 2. Pastikan Config Ada (Agar saklar tidak error)
        configs = [("release_announcement", "false"), ("enable_major_selection", "true")]
        for k, v in configs:
            if not db.query(models.SystemConfig).filter_by(key=k).first():
                db.add(models.SystemConfig(key=k, value=v))
        
        db.commit()
    except Exception as e:
        print(f"Startup Error: {e}")
    finally:
        db.close()

# --- SCHEMAS ---
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
    user = db.query(models.User).filter_by(username=data.username).first()
    if user and user.password == data.password:
        return {"message": "OK", "username": user.username, "name": user.full_name, "role": user.role, "choice1_id":user.choice1_id, "choice2_id":user.choice2_id}
    raise HTTPException(400, "Login Gagal")

# CONFIG (SAKLAR) - FIX LOGIC
@app.get("/config/{key}")
def get_config(key: str, db: Session = Depends(get_db)):
    c = db.query(models.SystemConfig).filter_by(key=key).first()
    return {"value": c.value if c else "false"}

@app.post("/config/{key}")
def set_config(key: str, data: ConfigSchema, db: Session = Depends(get_db)):
    c = db.query(models.SystemConfig).filter_by(key=key).first()
    # Pastikan value disimpan sebagai string "true" atau "false"
    val_str = str(data.value).lower()
    if c: c.value = val_str
    else: db.add(models.SystemConfig(key=key, value=val_str))
    db.commit()
    return {"message": "Updated", "value": val_str}

# ... (Sisa endpoint PERIODS, EXAMS, USERS, MAJORS sama seperti V13 - Gunakan yang sudah ada agar tidak kepanjangan, 
# TAPI pastikan endpoint /admin/exams/{eid}/manual-question bisa menerima image_url dari input manual ataupun upload)

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

@app.post("/admin/exams/{eid}/manual-question")
def add_q(eid: str, d: QuestionCreateSchema, db: Session = Depends(get_db)):
    q = models.Question(exam_id=eid, text=d.text, type=d.type, difficulty=d.difficulty, reading_material=d.reading_material, explanation=d.explanation, label_true=d.label_true, label_false=d.label_false, image_url=d.image_url, audio_url=d.audio_url)
    db.add(q); db.commit(); db.refresh(q)
    idx_map = ["A","B","C","D","E"]
    for i, o in enumerate(d.options):
        oid = idx_map[i] if i<5 and d.type in ["multiple_choice","complex"] else str(i+1)
        db.add(models.Option(question_id=q.id, label=o.label, option_index=oid, is_correct=o.is_correct))
    db.commit(); return {"message": "Saved"}

@app.put("/admin/questions/{qid}")
def edit_q(qid: int, d: QuestionCreateSchema, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter_by(id=qid).first()
    if not q: raise HTTPException(404)
    q.text, q.type, q.difficulty, q.reading_material, q.explanation = d.text, d.type, d.difficulty, d.reading_material, d.explanation
    q.label_true, q.label_false, q.image_url, q.audio_url = d.label_true, d.label_false, d.image_url, d.audio_url
    db.query(models.Option).filter_by(question_id=qid).delete()
    idx_map = ["A","B","C","D","E"]
    for i, o in enumerate(d.options):
        oid = idx_map[i] if i<5 and d.type in ["multiple_choice","complex"] else str(i+1)
        db.add(models.Option(question_id=q.id, label=o.label, option_index=oid, is_correct=o.is_correct))
    db.commit(); return {"message": "Updated"}

@app.delete("/admin/questions/{qid}")
def del_q(qid: int, db: Session = Depends(get_db)): db.query(models.Question).filter_by(id=qid).delete(); db.commit(); return {"message":"Deleted"}

@app.get("/admin/exams/{eid}/preview")
def prev(eid: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=eid).options(joinedload(models.Exam.questions).joinedload(models.Question.options)).first()
    qs = [{"id":q.id, "type":q.type, "text":q.text, "image_url":q.image_url, "audio_url":q.audio_url, "reading_material":q.reading_material, "explanation":q.explanation, "label_true":q.label_true, "label_false":q.label_false, "options":[{"id":o.option_index, "label":o.label, "is_correct":o.is_correct} for o in q.options]} for q in exam.questions]
    return {"id": exam.id, "title": exam.title, "questions": qs}

@app.get("/admin/exams/{eid}/analysis")
def get_analysis(eid: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter_by(id=eid).options(joinedload(models.Exam.questions)).first()
    stats = []
    for q in exam.questions:
        stats.append({"id": q.id, "text": q.text, "difficulty": q.difficulty, "correct": q.total_correct, "attempts": q.total_attempts, "percentage": round((q.total_correct/q.total_attempts*100) if q.total_attempts>0 else 0)})
    return {"title": exam.title, "stats": stats}

# --- LAINNYA ---
@app.get("/admin/users")
def get_usr(db: Session = Depends(get_db)): return db.query(models.User).all()
@app.post("/admin/users")
def add_usr(u: UserCreateSchema, db: Session = Depends(get_db)): db.add(models.User(username=u.username, password=u.password, full_name=u.full_name, role=u.role)); db.commit(); return {"message":"OK"}
@app.post("/admin/users/delete-bulk")
def del_bulk(d:BulkDeleteSchema, db:Session=Depends(get_db)): db.query(models.User).filter(models.User.id.in_(d.user_ids)).delete(synchronize_session=False); db.commit(); return {"message":"OK"}
@app.get("/majors")
def get_mj(db: Session = Depends(get_db)): return db.query(models.Major).all()
@app.post("/majors")
def add_mj(d: MajorCreateSchema, db: Session = Depends(get_db)): db.add(models.Major(university=d.university, name=d.name, passing_grade=d.passing_grade)); db.commit(); return {"message":"OK"}
@app.delete("/majors/{mid}")
def del_mj(mid: int, db: Session = Depends(get_db)): db.query(models.Major).filter_by(id=mid).delete(); db.commit(); return {"message":"OK"}
@app.get("/materials")
def get_mat(category: Optional[str]=None, db: Session=Depends(get_db)): q=db.query(models.Material); return q.filter(models.Material.category==category).all() if category and category!="ALL" else q.all()
@app.post("/materials")
def add_mat(d: MaterialCreateSchema, db: Session = Depends(get_db)): db.add(models.Material(title=d.title, type=d.type, content_url=d.content_url, category=d.category, description=d.description)); db.commit(); return {"message": "OK"}
@app.delete("/materials/{mid}")
def del_mat(mid: int, db: Session = Depends(get_db)): db.query(models.Material).filter_by(id=mid).delete(); db.commit(); return {"message": "OK"}
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
@app.get("/student/exams/{eid}/review")
def rev(eid: str, username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    res = db.query(models.ExamResult).filter_by(user_id=user.id, exam_id=eid).first()
    if not res: raise HTTPException(403)
    exam = db.query(models.Exam).filter_by(id=eid).first()
    qs = [{"id":q.id, "type":q.type, "text":q.text, "reading_material":q.reading_material, "explanation":q.explanation, "image_url":q.image_url, "audio_url":q.audio_url, "options":[{"id":o.option_index, "label":o.label, "is_correct":o.is_correct} for o in q.options]} for q in exam.questions]
    return {"title": exam.title, "questions": qs, "score": res.irt_score}
@app.get("/admin/exams/{eid}/analysis/download")
def dl_analysis(eid: str, db: Session = Depends(get_db)):
    data = get_analysis(eid, db)
    df = pd.DataFrame(data['stats'])
    out = io.BytesIO(); df.to_excel(out, index=False); out.seek(0)
    return StreamingResponse(out, headers={'Content-Disposition': 'attachment; filename="analisis.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
@app.post("/admin/upload-questions/{eid}")
async def uq(eid:str, file: UploadFile=File(...), db:Session=Depends(get_db)):
    try:
        content = await file.read(); df = pd.read_excel(io.BytesIO(content)); df.columns = df.columns.str.strip().str.title(); db.query(models.Question).filter_by(exam_id=eid).delete(); db.commit(); c=0
        for _, r in df.iterrows():
            t = str(r.get('Tipe', 'PG')).upper()
            qt = 'multiple_choice'
            if 'ISIAN' in t: qt='short_answer'
            elif 'TABEL' in t: qt='table_boolean'
            elif 'KOMPLEKS' in t: qt='complex'
            q = models.Question(exam_id=eid, text=str(r['Soal']), type=qt, difficulty=float(r.get('Kesulitan', 1)), image_url=str(r.get('Gambar')) if pd.notna(r.get('Gambar')) else None, audio_url=str(r.get('Audio')) if pd.notna(r.get('Audio')) else None, reading_material=str(r.get('Bacaan')) if pd.notna(r.get('Bacaan')) else None, explanation=str(r.get('Pembahasan')) if pd.notna(r.get('Pembahasan')) else None)
            db.add(q); db.commit()
            k = str(r.get('Kunci','')).strip().upper()
            if qt=='short_answer': db.add(models.Option(question_id=q.id, option_index='KEY', label=k, is_correct=True))
            elif qt=='table_boolean':
                keys = [x.strip() for x in k.split(',')]
                for i, col in enumerate(['Opsia','Opsib','Opsic','Opsid','Opsie']):
                    if pd.notna(r.get(col)): db.add(models.Option(question_id=q.id, option_index=str(i+1), label=str(r[col]), is_correct=(i<len(keys) and keys[i]=='B')))
            else:
                vk = [x.strip() for x in k.split(',')]
                for char, col in [('A','Opsia'),('B','Opsib'),('C','Opsic'),('D','Opsid'),('E','Opsie')]:
                    if pd.notna(r.get(col)): db.add(models.Option(question_id=q.id, option_index=char, label=str(r[col]), is_correct=(char in vk)))
            c+=1
        db.commit(); return {"message": f"{c} OK"}
    except Exception as e: return {"message": f"Error: {str(e)}"}
@app.get("/admin/recap")
def grecap(pid: Optional[int]=None, db: Session=Depends(get_db)):
    users = db.query(models.User).filter_by(role='student').options(joinedload(models.User.results), joinedload(models.User.choice1)).all()
    res=[]
    for u in users:
        urs = [r for r in u.results if r.exam_id.startswith(f"P{pid}_")] if pid else u.results
        if pid and not urs: continue
        sc={r.exam_id.split('_')[-1]: r.irt_score for r in urs}
        avg = sum(sc.values())/len(sc) if sc else 0
        stat = "LULUS" if u.choice1 and avg >= u.choice1.passing_grade else "TIDAK LULUS"
        row = {"id":u.id, "full_name":u.full_name, "username":u.username, "average":round(avg,2), "status":stat, "completed_exams":[{"exam_id":r.exam_id, "code":r.exam_id.split('_')[-1]} for r in urs]}
        for k,v in sc.items(): row[k]=round(v,2)
        res.append(row)
    return res
@app.get("/admin/recap/download")
def dl_rec(pid: Optional[int]=None, db: Session=Depends(get_db)):
    d = grecap(pid, db); df = pd.DataFrame([{k:v for k,v in r.items() if k!='completed_exams'} for r in d]); out = io.BytesIO(); df.to_excel(out, index=False); out.seek(0)
    return StreamingResponse(out, headers={'Content-Disposition': 'attachment; filename="rekap.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
@app.get("/admin/download-template")
def dl_temp():
    df = pd.DataFrame([{"Soal":"Contoh", "OpsiA":"A", "OpsiB":"B", "OpsiC":"C", "OpsiD":"D", "OpsiE":"E", "Kunci":"A", "Kesulitan":1, "Gambar":"", "Audio":""}])
    out=io.BytesIO(); df.to_excel(out, index=False); out.seek(0)
    return StreamingResponse(out, headers={'Content-Disposition': 'attachment; filename="template.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
@app.post("/admin/reset-result")
def rst(d: ResetResultSchema, db: Session = Depends(get_db)): db.query(models.ExamResult).filter_by(user_id=d.user_id, exam_id=d.exam_id).delete(); db.commit(); return {"message": "Reset"}