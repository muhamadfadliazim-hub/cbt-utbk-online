import React, { useState, useEffect } from 'react';
import { CheckCircle, BookOpen, Search, ChevronRight, Trophy, Target, AlertTriangle } from 'lucide-react';
import { API_URL } from './config';

// --- PILIH JURUSAN (TAMPILAN PREMIUM) ---
export const MajorSelection = ({ onNext, userUsername }) => {
  const [majors, setMajors] = useState([]);
  const [search, setSearch] = useState("");
  const [choice1, setChoice1] = useState(null);
  const [choice2, setChoice2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/majors`)
      .then(r => r.json())
      .then(data => {
        setMajors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = majors.filter(m => 
    (m.university && m.university.toLowerCase().includes(search.toLowerCase())) || 
    (m.name && m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (m) => {
    if (choice1?.id === m.id) { setChoice1(null); return; }
    if (choice2?.id === m.id) { setChoice2(null); return; }
    
    if (!choice1) setChoice1(m);
    else if (!choice2) setChoice2(m);
  };

  const handleSave = async () => {
    if (!choice1) return alert("Pilih minimal Pilihan 1!");
    setIsSaving(true);
    const storedUser = JSON.parse(localStorage.getItem('cbt_user') || '{}');
    const username = userUsername || storedUser.username;

    try {
        await fetch(`${API_URL}/users/select-major`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, choice1_id: choice1.id, choice2_id: choice2?.id })
        });
        // Update Local & Refresh biar masuk Dashboard
        localStorage.setItem('cbt_user', JSON.stringify({ ...storedUser, choice1_id: choice1.id, choice2_id: choice2?.id }));
        window.location.reload(); 
    } catch (e) { alert("Gagal menyimpan."); setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row h-[85vh]">
        
        {/* KOLOM KIRI (PANEL PILIHAN) */}
        <div className="md:w-1/3 bg-slate-900 text-white p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
            <h2 className="text-3xl font-bold mb-2 z-10">Target PTN</h2>
            <p className="text-slate-400 text-sm mb-8 z-10">Tentukan masa depanmu sekarang.</p>

            <div className="space-y-4 z-10 flex-1 overflow-y-auto">
                {/* CARD PILIHAN 1 */}
                <div className={`p-5 rounded-2xl border-2 transition-all ${choice1 ? 'bg-emerald-500/10 border-emerald-500' : 'bg-white/5 border-dashed border-slate-700'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${choice1 ? 'text-emerald-400' : 'text-slate-500'}`}>Pilihan 1 (Prioritas)</span>
                        {choice1 && <CheckCircle size={16} className="text-emerald-400"/>}
                    </div>
                    {choice1 ? (
                        <div>
                            <div className="font-bold text-lg leading-tight mb-1">{choice1.name}</div>
                            <div className="text-xs text-slate-300">{choice1.university}</div>
                            <div className="mt-3 inline-block px-2 py-1 bg-black/20 rounded text-xs text-emerald-300 font-mono">PG: {choice1.passing_grade}</div>
                        </div>
                    ) : <div className="text-slate-500 text-sm italic">Belum dipilih</div>}
                </div>

                {/* CARD PILIHAN 2 */}
                <div className={`p-5 rounded-2xl border-2 transition-all ${choice2 ? 'bg-blue-500/10 border-blue-500' : 'bg-white/5 border-dashed border-slate-700'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${choice2 ? 'text-blue-400' : 'text-slate-500'}`}>Pilihan 2 (Cadangan)</span>
                        {choice2 && <CheckCircle size={16} className="text-blue-400"/>}
                    </div>
                    {choice2 ? (
                        <div>
                            <div className="font-bold text-lg leading-tight mb-1">{choice2.name}</div>
                            <div className="text-xs text-slate-300">{choice2.university}</div>
                            <div className="mt-3 inline-block px-2 py-1 bg-black/20 rounded text-xs text-blue-300 font-mono">PG: {choice2.passing_grade}</div>
                        </div>
                    ) : <div className="text-slate-500 text-sm italic">Belum dipilih</div>}
                </div>
            </div>

            <button 
                onClick={handleSave} 
                disabled={!choice1 || isSaving}
                className="mt-6 w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-bold text-white shadow-lg shadow-indigo-900/50 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
                {isSaving ? "Menyimpan..." : "Simpan & Lanjut"} <ChevronRight size={18}/>
            </button>
        </div>

        {/* KOLOM KANAN (LIST JURUSAN) */}
        <div className="md:w-2/3 p-8 bg-slate-50 flex flex-col">
            <div className="relative mb-6">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20}/>
                <input 
                    type="text" 
                    placeholder="Cari Universitas atau Program Studi..." 
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition bg-white shadow-sm font-medium"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Memuat data jurusan...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">Data tidak ditemukan.</div>
                ) : (
                    filtered.map(m => {
                        const isC1 = choice1?.id === m.id;
                        const isC2 = choice2?.id === m.id;
                        return (
                            <div 
                                key={m.id} 
                                onClick={() => handleSelect(m)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center group ${
                                    isC1 ? 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500' :
                                    isC2 ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500' :
                                    'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                                }`}
                            >
                                <div>
                                    <div className={`font-bold text-sm ${isC1?'text-emerald-800':isC2?'text-blue-800':'text-slate-700 group-hover:text-indigo-700'}`}>{m.university}</div>
                                    <div className="text-sm text-slate-500">{m.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 mb-1">{m.passing_grade}</div>
                                    {isC1 && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Pilihan 1</span>}
                                    {isC2 && <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Pilihan 2</span>}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export const Confirmation = ({ onStart, onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-slate-200">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600"><BookOpen size={32}/></div>
      <h2 className="text-2xl font-bold mb-2 text-slate-800">Siap Ujian?</h2>
      <p className="text-slate-500 text-sm mb-6">Waktu akan berjalan otomatis. Pastikan koneksi stabil.</p>
      <button onClick={onStart} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold mb-3 hover:bg-indigo-700 shadow-lg shadow-indigo-200">Mulai Mengerjakan</button>
      <button onClick={onBack} className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Batal</button>
    </div>
  </div>
);

export const ResultSummary = ({ result, onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
    <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 animate-bounce"><Trophy size={40}/></div>
      <h2 className="text-3xl font-black text-slate-800 mb-2">Ujian Selesai!</h2>
      <p className="text-slate-500 mb-8">Jawaban berhasil disimpan ke server.</p>
      
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
        <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Estimasi Skor IRT</div>
        <div className="text-5xl font-black text-indigo-600">{Math.round(result?.score || 0)}</div>
      </div>

      <button onClick={onBack} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95">Kembali ke Dashboard</button>
    </div>
  </div>
);