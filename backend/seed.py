from database import SessionLocal, engine
import models
import math
import random

db = SessionLocal()

# 1. RESET DATABASE
print("Reset Database...")
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

# 2. BUAT USER
print("Mendaftarkan User...")
users = [
    models.User(username="siswa", full_name="Peserta UTBK", password="123", role="student"),
    models.User(username="admin", full_name="Admin", password="admin", role="admin"),
]
db.add_all(users)
db.commit()

# --- FUNGSI GENERATOR SOAL CANGGIH ---
def create_questions_for_exam(exam_id, title, q_count):
    print(f"Generating {q_count} soal untuk {title}...")
    
    for i in range(1, q_count + 1):
        # Tentukan Tipe Soal berdasarkan urutan agar bervariasi
        # Default: Pilihan Ganda
        q_type = "multiple_choice"
        q_text = f"Soal No. {i} ({title}). Pilihlah jawaban yang paling tepat."
        math_content = None

        # LOGIKA VARIASI SOAL
        # Jika Matematika/Kuantitatif, sisipkan Isian Singkat & Checkbox
        if "Matematika" in title or "Kuantitatif" in title:
            math_content = f"f(x) = {i}x^2 + 5"
            if i % 5 == 0: # Setiap kelipatan 5 jadi Isian Singkat
                q_type = "short_answer"
                q_text = f"Soal No. {i}: Hitunglah nilai fungsi jika x = 2. (Tulis angka saja)"
            elif i % 4 == 0: # Setiap kelipatan 4 jadi Checkbox
                q_type = "complex"
                q_text = f"Soal No. {i}: Manakah pernyataan yang BENAR? (Jawaban bisa lebih dari satu)"
        
        # Jika Penalaran Umum / PPU, sisipkan Tabel Benar/Salah
        elif "Penalaran Umum" in title or "Pengetahuan" in title:
            if i % 5 == 0: # Setiap kelipatan 5 jadi Tabel
                q_type = "table_boolean"
                q_text = f"Soal No. {i}: Tentukan apakah pernyataan berikut Benar atau Salah berdasarkan teks."

        # --- SIMPAN SOAL KE DB ---
        q = models.Question(exam_id=exam_id, type=q_type, text=q_text, math_content=math_content)
        db.add(q)
        db.commit()

        # --- ISI OPSI JAWABAN SESUAI TIPE ---
        
        # A. TIPE ISIAN SINGKAT (Kunci: "25")
        if q_type == "short_answer":
            db.add(models.Option(question_id=q.id, option_index="KEY", label="25", is_correct=True))
        
        # B. TIPE TABEL BENAR/SALAH
        elif q_type == "table_boolean":
            db.add_all([
                models.Option(question_id=q.id, option_index="1", label="Pernyataan Fakta 1", is_correct=True),
                models.Option(question_id=q.id, option_index="2", label="Pernyataan Fakta 2", is_correct=False),
                models.Option(question_id=q.id, option_index="3", label="Pernyataan Fakta 3", is_correct=True),
                models.Option(question_id=q.id, option_index="4", label="Pernyataan Fakta 4", is_correct=False),
            ])

        # C. TIPE CHECKBOX (Jawaban A dan C Benar)
        elif q_type == "complex":
            db.add_all([
                models.Option(question_id=q.id, option_index="A", label="Pernyataan A (Benar)", is_correct=True),
                models.Option(question_id=q.id, option_index="B", label="Pernyataan B (Salah)", is_correct=False),
                models.Option(question_id=q.id, option_index="C", label="Pernyataan C (Benar)", is_correct=True),
                models.Option(question_id=q.id, option_index="D", label="Pernyataan D (Salah)", is_correct=False),
                models.Option(question_id=q.id, option_index="E", label="Pernyataan E (Salah)", is_correct=False),
            ])

        # D. TIPE PILIHAN GANDA BIASA (Kunci B)
        else:
            db.add_all([
                models.Option(question_id=q.id, option_index="A", label="Opsi A", is_correct=False),
                models.Option(question_id=q.id, option_index="B", label="Opsi B (Jawaban)", is_correct=True),
                models.Option(question_id=q.id, option_index="C", label="Opsi C", is_correct=False),
                models.Option(question_id=q.id, option_index="D", label="Opsi D", is_correct=False),
                models.Option(question_id=q.id, option_index="E", label="Opsi E", is_correct=False),
            ])
        
        db.commit()

# ====================================================
# EKSEKUSI 7 SUB-TES
# ====================================================

exams_data = [
    # KODE, JUDUL, DURASI, JUMLAH SOAL
    ("PU", "Penalaran Umum", 30, 30),
    ("PK", "Pengetahuan Kuantitatif", 20, 20),
    ("PPU", "Pengetahuan & Pemahaman Umum", 25, 20),
    ("PBM", "Pemahaman Bacaan & Menulis", 15, 20),
    ("LBI", "Literasi Bahasa Indonesia", 42.5, 30),
    ("LBE", "Literasi Bahasa Inggris", 20, 20),
    ("PM", "Penalaran Matematika", 42.5, 20),
]

for code, title, duration, count in exams_data:
    # Buat Header Ujian
    exam = models.Exam(id=code, title=title, duration=math.ceil(duration), description=f"Tes {title} Standar UTBK")
    db.add(exam)
    db.commit()
    
    # Generate Soal dengan Variasi
    create_questions_for_exam(code, title, count)

print("------------------------------------------------")
print("SUKSES! 7 Sub-tes dengan Variasi Soal (Tabel/Isian/Checkbox) berhasil dibuat.")
db.close()