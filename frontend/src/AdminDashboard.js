import React, { useState, useEffect } from 'react';
import { 
  Trash2, Plus, Save, BookOpen, Crown, LayoutDashboard, 
  FileText, CheckCircle, LogOut 
} from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // State Form Pembuatan
  const [newPeriod, setNewPeriod] = useState({ name: '', exam_type: 'UTBK', is_vip: false });
  
  // State Input Soal
  const [selectedExam, setSelectedExam] = useState(null); 
  const [formQ, setFormQ] = useState({ text: '', options: ['','','','',''], correct: 'A', explanation: '' });

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = () => {
    fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(setPeriods);
  };

  const handleCreatePeriod = async () => {
    if(!newPeriod.name) return alert("Nama Paket harus diisi!");
    
    await fetch(`${API_URL}/admin/periods`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(newPeriod)
    });
    
    alert("Paket Ujian Berhasil Dibuat!");
    setShowModal(false);
    fetchPeriods();
  };

  const handleSaveQuestion = async () => {
    if(!selectedExam) return;
    await fetch(`${API_URL}/exams/${selectedExam.id}/questions`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            text: formQ.text,
            options: formQ.options,
            correct_option: formQ.correct,
            explanation: formQ.explanation
        })
    });
    alert("Soal Tersimpan!");
    setFormQ({ text: '', options: ['','','','',''], correct: 'A', explanation: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* SIDEBAR ADMIN */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between fixed h-full">
        <div>
            <div className="text-2xl font-black mb-10 tracking-tighter text-indigo-400">ADMIN PANEL</div>
            <nav className="space-y-2">
                <button onClick={()=>setActiveTab('periods')} className={`w-full text-left p-3 rounded-xl flex items-center gap-3 ${activeTab==='periods' ? 'bg-indigo-600' : 'hover:bg-white/10'}`}>
                    <LayoutDashboard size={20}/> Manajemen Soal
                </button>
                <button onClick={()=>setActiveTab('users')} className={`w-full text-left p-3 rounded-xl flex items-center gap-3 ${activeTab==='users' ? 'bg-indigo-600' : 'hover:bg-white/10'}`}>
                    <Crown size={20}/> User Premium
                </button>
            </nav>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-white"><LogOut size={18}/> Logout</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 p-8">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">
                {activeTab === 'periods' ? 'Daftar Paket Ujian' : 'Manajemen User'}
            </h1>
            {activeTab === 'periods' && !selectedExam && (
                <button onClick={()=>setShowModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2">
                    <Plus size={20}/> Buat Paket Baru
                </button>
            )}
        </header>

        {/* --- TAB PERIODS --- */}
        {activeTab === 'periods' && !selectedExam && (
            <div className="grid grid-cols-1 gap-6">
                {periods.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.exam_type === 'CPNS' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {p.exam_type}
                                    </span>
                                    {p.is_vip_only && <span className="px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-600 flex items-center gap-1"><Crown size={12}/> VIP</span>}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
                            </div>
                            <button className="text-red-400 hover:text-red-600"><Trash2 size={20}/></button>
                        </div>
                        
                        {/* LIST SUBTES */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {p.exams.map(ex => (
                                <button 
                                    key={ex.id}
                                    onClick={() => setSelectedExam(ex)}
                                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition text-left group"
                                >
                                    <div className="text-xs text-slate-400 font-bold mb-1">{ex.code}</div>
                                    <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 truncate">{ex.title}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* --- EDITOR SOAL (INPUT MANUAL) --- */}
        {selectedExam && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <div>
                        <div className="text-slate-400 text-sm font-bold uppercase tracking-wider">Editor Soal</div>
                        <h2 className="text-2xl font-bold">{selectedExam.title} ({selectedExam.code})</h2>
                    </div>
                    <button onClick={()=>setSelectedExam(null)} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Kembali</button>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Input */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Pertanyaan</label>
                            <textarea 
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Tulis soal disini..."
                                value={formQ.text} onChange={e=>setFormQ({...formQ, text:e.target.value})}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-700">Pilihan Jawaban</label>
                            {formQ.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${['A','B','C','D','E'][i] === formQ.correct ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {['A','B','C','D','E'][i]}
                                    </div>
                                    <input 
                                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                                        placeholder={`Opsi ${['A','B','C','D','E'][i]}`}
                                        value={opt}
                                        onChange={e => {
                                            const newOpts = [...formQ.options];
                                            newOpts[i] = e.target.value;
                                            setFormQ({...formQ, options: newOpts});
                                        }}
                                    />
                                    <input 
                                        type="radio" name="correct" 
                                        checked={formQ.correct === ['A','B','C','D','E'][i]}
                                        onChange={() => setFormQ({...formQ, correct: ['A','B','C','D','E'][i]})}
                                    />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <BookOpen size={16} className="text-indigo-500"/> Pembahasan (Opsional)
                            </label>
                            <textarea 
                                className="w-full h-24 p-4 bg-indigo-50 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Jelaskan kenapa jawabannya itu..."
                                value={formQ.explanation} onChange={e=>setFormQ({...formQ, explanation:e.target.value})}
                            />
                        </div>

                        <button onClick={handleSaveQuestion} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                            <Save size={20}/> Simpan Soal ke Database
                        </button>
                    </div>

                    {/* Preview / List Soal Yang Sudah Ada */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <div className="text-center text-slate-400 py-10">
                            <FileText size={48} className="mx-auto mb-4 opacity-50"/>
                            <p>Soal yang sudah diinput akan muncul disini</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>

      {/* MODAL CREATE PERIOD */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Buat Paket Baru</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Nama Paket</label>
                        <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" 
                            placeholder="Contoh: Tryout CPNS Akbar #1"
                            value={newPeriod.name} onChange={e=>setNewPeriod({...newPeriod, name:e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Tipe Ujian</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold appearance-none"
                            value={newPeriod.exam_type} 
                            onChange={e=>setNewPeriod({...newPeriod, exam_type:e.target.value})}
                        >
                            <option value="UTBK">UTBK SNBT (7 Subtes)</option>
                            <option value="CPNS">CPNS / Kedinasan (TWK, TIU, TKP)</option>
                            <option value="TKA_SMA">TKA Saintek (Mat, Fis, Kim, Bio)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer" onClick={()=>setNewPeriod({...newPeriod, is_vip:!newPeriod.is_vip})}>
                        <div className={`w-6 h-6 rounded border flex items-center justify-center ${newPeriod.is_vip ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-300'}`}>
                            {newPeriod.is_vip && <CheckCircle size={16}/>}
                        </div>
                        <span className="font-bold text-amber-800 flex items-center gap-2"><Crown size={16}/> Khusus User Premium (VIP)</span>
                    </div>

                    <button onClick={handleCreatePeriod} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition">
                        Buat Sekarang
                    </button>
                    <button onClick={()=>setShowModal(false)} className="w-full py-2 text-slate-400 font-bold hover:text-slate-600">
                        Batal
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;