import React, { useState, useEffect } from 'react';
import { CheckCircle, BookOpen, Clock, School, Search, ChevronRight } from 'lucide-react';
import { API_URL } from './config';

// --- 1. KOMPONEN PILIH JURUSAN (ANTI STUCK) ---
export const MajorSelection = ({ onNext, userUsername }) => {
  const [majors, setMajors] = useState([]);
  const [search, setSearch] = useState("");
  const [choice1, setChoice1] = useState(null);
  const [choice2, setChoice2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // AMBIL DATA DARI BACKEND
    fetch(`${API_URL}/majors`)
      .then(r => r.json())
      .then(data => {
        setMajors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setMajors([]); 
        setLoading(false);
      });
  }, []);

  const filtered = majors.filter(m => 
    (m.university && m.university.toLowerCase().includes(search.toLowerCase())) || 
    (m.name && m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (m) => {
    if (!choice1) setChoice1(m);
    else if (!choice2 && m.id !== choice1.id) setChoice2(m);
  };

  const handleReset = () => { setChoice1(null); setChoice2(null); };

  const handleSave = async () => {
    if (!choice1) return alert("Pilih minimal Pilihan 1!");
    setIsSaving(true);
    
    const storedUser = JSON.parse(localStorage.getItem('cbt_user') || '{}');
    const username = userUsername || storedUser.username;

    try {
        const res = await fetch(`${API_URL}/users/select-major`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                choice1_id: choice1.id,
                choice2_id: choice2 ? choice2.id : null
            })
        });
        
        if (res.ok) {
            // UPDATE STORAGE LOKAL
            const updatedUser = { ...storedUser, choice1_id: choice1.id, choice2_id: choice2 ? choice2.id : null };
            localStorage.setItem('cbt_user', JSON.stringify(updatedUser));
            
            // === SOLUSI ANTI STUCK ===
            // Paksa reload agar App.js membaca data user yang baru
            alert("Jurusan berhasil disimpan! Masuk ke Dashboard...");
            window.location.reload(); 
        } else {
            alert("Gagal menyimpan. Coba lagi.");
        }
    } catch (e) {
        alert("Error koneksi.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Pilih Jurusan Target</h1>
          <p className="text-indigo-100 text-sm">Klik pada daftar di bawah untuk memilih.</p>
        </div>

        <div className="p-6">
          {/* KOTAK PILIHAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-xl border-2 ${choice1 ? 'border-emerald-500 bg-emerald-50' : 'border-dashed border-slate-300'}`}>
              <div className="text-xs font-bold uppercase text-slate-400">Pilihan 1</div>
              <div className="font-bold text-slate-800">{choice1 ? choice1.name : "Belum Dipilih"}</div>
              {choice1 && <div className="text-xs text-emerald-600">{choice1.university}</div>}
            </div>
            <div className={`p-4 rounded-xl border-2 ${choice2 ? 'border-blue-500 bg-blue-50' : 'border-dashed border-slate-300'}`}>
              <div className="text-xs font-bold uppercase text-slate-400">Pilihan 2</div>
              <div className="font-bold text-slate-800">{choice2 ? choice2.name : "Belum Dipilih"}</div>
              {choice2 && <div className="text-xs text-blue-600">{choice2.university}</div>}
            </div>
          </div>

          {/* INPUT CARI */}
          <input 
            type="text"
            placeholder="Cari Kampus / Jurusan..."
            className="w-full p-3 rounded-xl border border-slate-300 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* DAFTAR JURUSAN (SCROLLABLE) */}
          <div className="h-64 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50 p-2 space-y-2 mb-6">
            {loading ? <div className="text-center p-4">Memuat data...</div> : 
             filtered.length === 0 ? <div className="text-center p-4">Tidak ditemukan.</div> :
             filtered.map(m => (
               <div key={m.id} onClick={() => handleSelect(m)} className="p-3 bg-white rounded shadow-sm border hover:border-indigo-500 cursor-pointer flex justify-between items-center">
                 <div>
                   <div className="font-bold text-sm text-slate-700">{m.university}</div>
                   <div className="text-xs text-slate-500">{m.name}</div>
                 </div>
                 <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">{m.passing_grade}</div>
               </div>
             ))}
          </div>

          {/* TOMBOL AKSI */}
          <div className="flex gap-3">
            <button onClick={handleReset} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Reset</button>
            <button onClick={handleSave} disabled={!choice1 || isSaving} className="flex-1 bg-indigo-600 text-white rounded-xl font-bold py-3 hover:bg-indigo-700 disabled:opacity-50">
              {isSaving ? "Menyimpan..." : "Simpan & Lanjut"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN LAIN BIARKAN STANDAR ---
export const Confirmation = ({ onStart, onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
      <h2 className="text-2xl font-bold mb-4">Siap Ujian?</h2>
      <button onClick={onStart} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold mb-2">Mulai</button>
      <button onClick={onBack} className="w-full py-3 text-slate-500 font-bold">Kembali</button>
    </div>
  </div>
);

export const ResultSummary = ({ result, onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
      <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4"/>
      <h2 className="text-2xl font-bold mb-2">Selesai!</h2>
      <p className="text-slate-500 mb-6">Jawaban tersimpan. Skor IRT: {Math.round(result?.score || 0)}</p>
      <button onClick={onBack} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Ke Dashboard</button>
    </div>
  </div>
);