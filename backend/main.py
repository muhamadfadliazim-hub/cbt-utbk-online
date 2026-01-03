from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import models, database
import os, uuid, random

# Setup
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)

app = FastAPI(title="LMS Premium API")
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    if not db.query(models.User).filter_by(username="admin").first():
        new_admin = models.User(username="admin", password="123", full_name="Super Admin", role="admin", is_premium=True)
        db.add(new_admin)
        db.commit()
    db.close()

# --- SCHEMAS ---
class LoginSchema(BaseModel): username: str; password: str
class UserCreateSchema(BaseModel): username: str; password: str; full_name: str
class PeriodCreateSchema(BaseModel): name: str; exam_type: str; is_vip: bool = False

# --- AUTH & USER ---
@app.post("/login")
def login(d: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=d.username).first()
    if not user or user.password != d.password:
        raise HTTPException(400, "Username atau password salah")
    
    # Cek masa aktif premium
    is_premium = user.is_premium
    if user.premium_until and user.premium_until < datetime.now():
        is_premium = False # Expired
        
    return {
        "id": user.id, "username": user.username, "full_name": user.full_name, 
        "role": user.role, "is_premium": is_premium,
        "premium_until": str(user.premium_until) if user.premium_until else None
    }

@app.post("/register")
def register(d: UserCreateSchema, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=d.username).first():
        raise HTTPException(400, "Username sudah dipakai")
    user = models.User(username=d.username, password=d.password, full_name=d.full_name, role="student", is_premium=False)
    db.add(user)
    db.commit()
    return {"message": "Berhasil daftar"}

# --- PAYMENT SYSTEM (SIMULASI) ---
# Di aplikasi real, ini diganti endpoint Midtrans Notification
@app.post("/payment/upgrade")
def simulate_upgrade(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    if not user: raise HTTPException(404, "User not found")
    
    # Set user jadi premium 30 hari
    user.is_premium = True
    user.premium_until = datetime.now() + timedelta(days=30)
    
    # Catat Transaksi
    trx = models.Transaction(
        id=f"TRX-{uuid.uuid4().hex[:8].upper()}",
        user_id=user.id,
        amount=99000,
        status="success",
        payment_method="SIMULATION_BANK"
    )
    db.add(trx)
    db.commit()
    return {"message": "Upgrade Sukses! Login ulang untuk melihat perubahan."}

# --- LMS & EXAM ---
@app.get("/student/periods")
def get_student_periods(username: str, db: Session = Depends(get_db)):
    # Return periods dengan status locked/unlocked
    periods = db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()
    user = db.query(models.User).filter_by(username=username).first()
    
    res = []
    for p in periods:
        locked = False
        if p.is_vip_only and not user.is_premium:
            locked = True
        
        # Hitung progress (dummy logic)
        res.append({
            "id": p.id, "name": p.name, "exam_type": p.exam_type,
            "is_vip": p.is_vip_only, "locked": locked,
            "exams": p.exams
        })
    return res

# --- ADMIN (Keep Simple) ---
@app.get("/admin/periods")
def get_periods(db: Session = Depends(get_db)):
    return db.query(models.ExamPeriod).options(joinedload(models.ExamPeriod.exams)).all()

@app.post("/admin/periods")
def create_period(d: PeriodCreateSchema, db: Session = Depends(get_db)):
    p = models.ExamPeriod(name=d.name, exam_type=d.exam_type, is_vip_only=d.is_vip, is_active=True)
    db.add(p); db.commit(); db.refresh(p)
    
    struct = []
    if "TKA_SMA" in d.exam_type: struct=[("MAT",40),("FIS",40),("KIM",40),("BIO",40)]
    else: struct=[("PU",30),("PK",20),("LBI",45)]
    
    for c, dur in struct: db.add(models.Exam(id=f"P{p.id}_{c}", period_id=p.id, code=c, title=f"Tes {c}", duration=dur))
    db.commit()
    return {"message": "OK"}