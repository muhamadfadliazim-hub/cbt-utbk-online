from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import models, database, io, os, shutil
import pandas as pd
from datetime import datetime

app = FastAPI(title="EduPrime Ultimate SNBT 2026")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# SCHEMAS
class AnswerSchema(BaseModel): answers: Dict[str, Any]; username: str
class MajorSelect(BaseModel): 
    username: str
    choices: List[Optional[int]] # List of Major IDs (max 4)

class ManualQuestion(BaseModel): 
    text: str; difficulty: float; explanation: str; 
    passage: Optional[str]=None; media: Optional[str]=None; 
    type: str="PG"; options: List[Dict[str, Any]];
    table_headers: str="Benar,Salah"

# INIT SYSTEM (Data Dummy Majors untuk Test SNBT)
@app.get("/init-admin")
def init(db: Session = Depends(get_db)):
    models.Base.metadata.create_all(bind=database.engine)
    if not db.query(models.User).filter_by(username="admin").first():
        db.add(models.User(username="admin", password="123", full_name="Super Admin", role="admin", access_flags="ALL"))
    
    # Init Jurusan jika kosong (Campuran S1 dan D3 untuk tes logika)
    if not db.query(models.Major).first():
        dummy_majors = [
            ("UI", "Ilmu Komputer", "S1", 700),
            ("UI", "Kedokteran", "S1", 750),
            ("UGM", "Teknik Sipil", "S1", 650),
            ("ITB", "STEI", "S1", 720),
            ("UNPAD", "Akuntansi", "D4", 600),
            ("IPB", "Manajemen Agribisnis", "D3", 550), # D3
            ("UGM", "Teknik Elektro", "D3", 580), # D3
            ("ITS", "Teknik Mesin", "D3", 570) # D3
        ]
        for uni, prog, typ, grade in dummy_majors:
            db.add(models.Major(university=uni, program=prog, program_type=typ, passing_grade=grade))

    # Init LMS Folders
    if not db.query(models.LMSFolder).first():
        utbk_subs = ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"]
        for sub in utbk_subs: db.add(models.LMSFolder(name=f"Materi {sub}", category="UTBK", subcategory=sub))
        cpns_subs = ["TWK", "TIU", "TKP"]
        for sub in cpns_subs: db.add(models.LMSFolder(name=f"Materi {sub}", category="CPNS", subcategory=sub))

    db.commit()
    return {"status": "System Ready (Admin & Dummy Majors Created)"}

# AUTH
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data['username']).first()
    if u and u.password == data['password']: 
        return {"username": u.username, "name": u.full_name, "role": u.role, "access_flags": u.access_flags}
    raise HTTPException(400, "Login Gagal")

# --- CORE LOGIC: DATA & ACCESS CONTROL ---
@app.get("/student/data")
def student_data(username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    if not u: raise HTTPException(404, "User not found")

    user_flags = u.access_flags.upper()
    has_all_access = u.role == 'admin' or "ALL" in user_flags

    # 1. Periods
    periods = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
    filtered_periods = []
    for p in periods:
        if has_all_access or p.exam_type.upper() in user_flags:
            exams = []
            for e in sorted(p.exams, key=lambda x: x.order_index):
                res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=e.id).first()
                exams.append({"id":e.id, "title":e.title, "duration":e.duration, "status":"done" if res else "open", "score":res.final_score if res else 0})
            filtered_periods.append({"id":p.id, "name":p.name, "type":p.exam_type, "exams":exams})

    # 2. LMS
    folders = db.query(models.LMSFolder).options(joinedload(models.LMSFolder.materials)).all()
    lms_data = []
    for f in folders:
        if has_all_access or f.category.upper() in user_flags:
             lms_data.append({"id":f.id, "name":f.name, "category":f.category, "subcategory":f.subcategory, "materials":[{"id":m.id, "title":m.title, "type":m.type, "url":m.content_url} for m in f.materials]})
    
    # 3. User Choices (Majors)
    choices_info = []
    for cid in [u.choice1_id, u.choice2_id, u.choice3_id, u.choice4_id]:
        if cid:
            m = db.query(models.Major).filter_by(id=cid).first()
            if m: choices_info.append({"id": m.id, "text": f"{m.university} - {m.program} ({m.program_type})", "type": m.program_type})
        else:
            choices_info.append(None)

    return {"user": u, "periods": filtered_periods, "lms": lms_data, "choices": choices_info}

# --- IMPORT EXCEL/CSV ---
@app.post("/admin/exams/{eid}/import")
async def import_questions(eid: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    filename = file.filename.lower()
    
    try:
        if filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # Mapping Kolom Fleksibel (Lower case comparison)
        df.columns = df.columns.str.lower()
        
        count = 0
        for _, row in df.iterrows():
            # Cari kolom yang sesuai (Soal, A, B, C, D, E, Kunci, Pembahasan)
            text = row.get('soal') or row.get('text') or row.get('question')
            if pd.isna(text): continue
            
            q = models.Question(
                exam_id=eid,
                text=str(text),
                explanation=str(row.get('pembahasan') or row.get('explanation') or ""),
                question_type="PG" # Default PG untuk import Excel standar
            )
            db.add(q)
            db.flush() # Dapatkan ID
            
            # Opsi
            keys = ['a', 'b', 'c', 'd', 'e']
            correct_key = str(row.get('kunci') or row.get('answer') or "").strip().upper()
            
            for idx, k in enumerate(keys):
                opt_text = row.get(k) or row.get(f'opsi_{k}')
                if not pd.isna(opt_text):
                    is_correct = (k.upper() == correct_key)
                    db.add(models.Option(
                        question_id=q.id,
                        label=str(opt_text),
                        option_index=k.upper(),
                        is_correct=is_correct,
                        score_weight=5 if is_correct else 0
                    ))
            count += 1
            
        db.commit()
        return {"msg": f"Berhasil mengimport {count} soal"}
            
    except Exception as e:
        raise HTTPException(400, f"Gagal membaca file: {str(e)}")

# --- MAJORS & SNBT LOGIC ---
@app.get("/majors")
def get_majors(db: Session = Depends(get_db)): return db.query(models.Major).all()

@app.post("/student/majors")
def save_majors(data: MajorSelect, db: Session = Depends(get_db)):
    # LOGIKA SNBT 2026
    # 1. Filter None values
    selected_ids = [cid for cid in data.choices if cid is not None]
    
    # 2. Ambil data jurusan
    majors = db.query(models.Major).filter(models.Major.id.in_(selected_ids)).all()
    
    # Map ID ke Object untuk pengecekan
    sel_objs = {m.id: m for m in majors}
    final_list = [sel_objs[id] for id in selected_ids if id in sel_objs]
    
    count = len(final_list)
    
    # Aturan: Jika memilih 3 atau 4, WAJIB ada minimal 1 D3
    if count >= 3:
        has_d3 = any(m.program_type == 'D3' for m in final_list)
        if not has_d3:
            raise HTTPException(400, "Sesuai aturan SNBT 2026: Jika memilih lebih dari 2 prodi, wajib menyertakan minimal satu program D3.")

    u = db.query(models.User).filter_by(username=data.username).first()
    u.choice1_id = data.choices[0] if len(data.choices) > 0 else None
    u.choice2_id = data.choices[1] if len(data.choices) > 1 else None
    u.choice3_id = data.choices[2] if len(data.choices) > 2 else None
    u.choice4_id = data.choices[3] if len(data.choices) > 3 else None
    
    db.commit()
    return {"msg": "Pilihan Jurusan Disimpan"}

# --- STANDARD ENDPOINTS (UNCHANGED BUT INCLUDED) ---
@app.get("/exams/{eid}")
def get_exam(eid: str, db: Session = Depends(get_db)):
    e = db.query(models.Exam).filter_by(id=eid).first()
    return {"id":e.id, "title":e.title, "duration":e.duration, "can_finish": e.period.can_finish_early, 
            "questions": [{"id":q.id, "text":q.text, "passage":q.passage_text, "media":q.media_url, 
                           "type":q.question_type, "table_headers": q.table_headers,
                           "options": [{"id":o.option_index, "label":o.label, "val":o.boolean_val} for o in q.options]} for q in e.questions]}

@app.get("/exams/{eid}/review")
def get_review(eid: str, username: str, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=username).first()
    e = db.query(models.Exam).filter_by(id=eid).first()
    if not e.period.show_result and u.role != 'admin': raise HTTPException(400, "Pembahasan Dikunci")
    res = db.query(models.ExamResult).filter_by(user_id=u.id, exam_id=eid).first()
    user_ans = res.answers_json or {}
    return {"title": e.title, "score": res.final_score, "questions": [{"id": q.id, "text": q.text, "passage": q.passage_text, "media": q.media_url, "explanation": q.explanation, "type": q.question_type, "table_headers": q.table_headers, "user_answer": user_ans.get(str(q.id)), "correct_isian": q.correct_answer_isian, "options": [{"id":o.option_index, "label":o.label, "is_correct":o.is_correct, "score_weight":o.score_weight, "bool_val":o.boolean_val} for o in q.options]} for q in e.questions]}

@app.post("/exams/{eid}/submit")
def submit(eid: str, data: AnswerSchema, db: Session = Depends(get_db)):
    u = db.query(models.User).filter_by(username=data.username).first()
    e = db.query(models.Exam).join(models.ExamPeriod).filter(models.Exam.id==eid).first()
    total_score = 0; correct_count = 0
    if e.period.exam_type == 'CPNS':
        for q in e.questions:
            ans = data.answers.get(str(q.id))
            if not ans: continue
            if q.question_type == 'TKP': 
                sel = next((o for o in q.options if o.option_index == ans), None)
                if sel: total_score += sel.score_weight; correct_count += 1
            else: 
                sel = next((o for o in q.options if o.option_index == ans), None)
                if sel and sel.is_correct: total_score += 5; correct_count += 1
    else:
        score_per_q = 1000 / (len(e.questions) or 1)
        for q in e.questions:
            ans = data.answers.get(str(q.id)); is_right = False
            if q.question_type == 'ISIAN':
                if ans and str(ans).strip().lower() == str(q.correct_answer_isian).strip().lower(): is_right = True
            elif q.question_type == 'PG_KOMPLEKS':
                keys = sorted([o.option_index for o in q.options if o.is_correct])
                user_ans = sorted(ans) if isinstance(ans, list) else []
                if keys == user_ans and len(keys)>0: is_right = True
            elif q.question_type == 'BOOLEAN':
                if isinstance(ans, dict):
                    all_rows_ok = True
                    for o in q.options:
                        u_val = ans.get(str(o.id)); key_val = "B" if o.boolean_val else "S"
                        if str(u_val) != str(key_val): all_rows_ok = False
                    if all_rows_ok: is_right = True
            else:
                key = next((o for o in q.options if o.is_correct), None)
                if key and str(ans) == str(key.option_index): is_right = True
            if is_right: total_score += score_per_q; correct_count += 1
    db.add(models.ExamResult(user_id=u.id, exam_id=eid, final_score=round(total_score,2), correct_count=correct_count, answers_json=data.answers))
    db.commit()
    return {"score": round(total_score, 2)}

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)): return db.query(models.User).all()
@app.post("/admin/users")
def add_user(data: dict, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=data['username']).first(): raise HTTPException(400, "User Exists")
    db.add(models.User(username=data['username'], password=data['password'], full_name=data['full_name'], role=data['role'], access_flags=data.get('access_flags','ALL'))); db.commit(); return {"msg":"OK"}
@app.post("/admin/exams/{eid}/manual")
def add_manual(eid: str, data: ManualQuestion, db: Session = Depends(get_db)):
    q = models.Question(exam_id=eid, text=data.text, difficulty=data.difficulty, explanation=data.explanation, type=data.type, media_url=data.media, table_headers=data.table_headers)
    db.add(q); db.commit(); db.refresh(q)
    for opt in data.options:
        w = opt.get('score_weight', 0)
        if data.type != 'TKP' and opt.get('is_correct'): w = 5
        db.add(models.Option(question_id=q.id, label=opt['label'], option_index=opt['idx'], is_correct=opt.get('is_correct', False), score_weight=w, boolean_val=opt.get('bool_val')))
    db.commit(); return {"msg": "Saved"}
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    fname = f"static/images/{int(datetime.now().timestamp())}_{file.filename}"
    with open(fname, "wb") as f: shutil.copyfileobj(file.file, f)
    return {"url": f"/{fname}"}
@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)): return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
@app.post("/admin/periods")
def create_period(name: str=Form(...), exam_type: str=Form(...), show_result: bool=Form(True), can_finish_early: bool=Form(True), db: Session=Depends(get_db)):
    p = models.ExamPeriod(name=name, exam_type=exam_type, show_result=show_result, can_finish_early=can_finish_early)
    db.add(p); db.commit(); db.refresh(p)
    struct = {"UTBK": [("Penalaran Umum", 30, 1), ("PPU", 25, 2), ("PBM", 25, 3), ("PK", 20, 4), ("LBI", 45, 5), ("LBE", 20, 6), ("PM", 42, 7)], "CPNS": [("TWK", 30, 1), ("TIU", 35, 2), ("TKP", 45, 3)]}
    subs = struct.get(exam_type, [("Tes Kemampuan", 60, 1)])
    for title, dur, order in subs: db.add(models.Exam(id=f"P{p.id}_{order}", period_id=p.id, title=title, duration=dur, order_index=order))
    db.commit(); return {"msg": "OK"}
@app.get("/materials")
def get_mats(db: Session = Depends(get_db)): return db.query(models.Material).options(joinedload(models.Material.folder)).all()
@app.post("/materials")
def add_mat(title:str=Form(...), type:str=Form(...), url:str=Form(...), category:str=Form(...), subcategory:str=Form(...), folder_name:str=Form(...), db:Session=Depends(get_db)):
    f = db.query(models.LMSFolder).filter_by(name=folder_name, category=category, subcategory=subcategory).first()
    if not f: f = models.LMSFolder(name=folder_name, category=category, subcategory=subcategory); db.add(f); db.commit(); db.refresh(f)
    db.add(models.Material(title=title, type=type, content_url=url, folder_id=f.id)); db.commit(); return {"msg":"OK"}
@app.delete("/materials/{mid}")
def del_mat(mid: int, db: Session = Depends(get_db)): db.query(models.Material).filter_by(id=mid).delete(); db.commit(); return {"msg":"Del"}
@app.delete("/admin/periods/{pid}")
def del_period(pid: int, db: Session = Depends(get_db)): db.query(models.ExamPeriod).filter_by(id=pid).delete(); db.commit(); return {"msg": "Del"}