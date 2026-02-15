import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Clock, PlayCircle, BarChart3, ChevronRight, CheckCircle, AlertTriangle, BookOpen, Search, X, RotateCcw } from 'lucide-react';
import ExamSimulation from './ExamSimulation';

const StudentDashboard = ({ user, onLogout, apiUrl }) => {
  const [periods, setPeriods] = useState([]);
  const [stats, setStats] = useState(null);
  const [majors, setMajors] = useState([]);
  
  const [showMajorSelector, setShowMajorSelector] = useState(!user.choice1_id);
  const [selectedMajors, setSelectedMajors] = useState({ c1: null, c2: null });
  // STATE BARU: Mengatur dropdown mana yang sedang terbuka (agar tidak saling tumpuk)
  const [activeDropdown, setActiveDropdown] = useState(null); 

  const [activeExamId, setActiveExamId] = useState(localStorage.getItem('active_exam_id'));
  const [activeExamData, setActiveExamData] = useState(null);
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => {
    if (activeExamId) fetchExam(activeExamId);
    fetchData();
    fetchMajors();
  }, [activeExamId]);

  const fetchData = async () => {
    try {
        const [resP, resS] = await Promise.all([
            fetch(`${apiUrl}/student/periods?username=${user.username}`),
            fetch(`${apiUrl}/student/dashboard-stats?username=${user.username}`)
        ]);
        setPeriods(await resP.json());
        setStats(await resS.json());
    } catch(e) { console.error(e); }
  };
  
  const fetchMajors = async () => { const res = await fetch(`${apiUrl}/majors`); setMajors(await res.json()); };

  const handleSaveMajors = async () => {
      if(!selectedMajors.c1 || !selectedMajors.c2) return alert("Wajib memilih 2 Jurusan!");
      if(selectedMajors.c1 === selectedMajors.c2) return alert("Jurusan 1 dan 2 tidak boleh sama!");
      
      try {
        await fetch(`${apiUrl}/users/select-major`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ username: user.username, choice1_id: selectedMajors.c1, choice2_id: selectedMajors.c2 })
        });
        setShowMajorSelector(false); 
        alert("Jurusan berhasil disimpan! Selamat belajar.");
        fetchData(); 
      } catch (e) { alert("Gagal menyimpan jurusan."); }
  };

  const handleResetMajors = async () => {
      if(!window.confirm("Yakin ingin mengganti pilihan jurusan?")) return;
      try {
          await fetch(`${apiUrl}/users/select-major`, {
              method: 'POST', headers: {'Content-Type':'application/json'},
              body: JSON.stringify({ username: user.username, choice1_id: null, choice2_id: null })
          });
          setSelectedMajors({ c1: null, c2: null });
          setShowMajorSelector(true);
      } catch(e) { alert("Gagal mereset jurusan."); }
  };

  const fetchExam = async (examId) => {
      try {
          const res = await fetch(`${apiUrl}/exams/${examId}`);
          if(!res.ok) throw new Error();
          const data = await res.json();
          setActiveExamData(data);
          localStorage.setItem('active_exam_id', examId);
      } catch (err) {
          setActiveExamId(null);
          localStorage.removeItem('active_exam_id');
      }
  };

  const handleStartExam = (examId) => {
      if(showMajorSelector) return alert("Mohon pilih target jurusan terlebih dahulu!");
      if (window.confirm("Mulai ujian sekarang? Waktu akan berjalan.")) setActiveExamId(examId);
  };

  const handleReview = async (examId) => {
      try {
        const res = await fetch(`${apiUrl}/student/review/${examId}`);
        setReviewData(await res.json());
      } catch (e) { alert("Gagal memuat pembahasan."); }
  };

  const handleSubmitExam = async (answers) => {
      try {
          const res = await fetch(`${apiUrl}/exams/${activeExamData.id}/submit`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: user.username, answers })
          });
          if (!res.ok) throw new Error();
          alert("Jawaban berhasil disimpan!");
          setActiveExamId(null);
          setActiveExamData(null);
          localStorage.removeItem('active_exam_id');
          fetchData(); 
      } catch (err) { alert("Gagal kirim jawaban. Coba lagi."); }
  };

  // KOMPONEN SEARCHABLE SELECT YANG LEBIH PINTAR
  const SearchableSelect = ({ label, value, onChange, options, name }) => {
      const [search, setSearch] = useState("");
      const isOpen = activeDropdown === name; // Cek apakah dropdown ini yang harus buka
      
      const selectedItem = options.find(o => o.id === value);
      const filtered = options.filter(o => 
          o.university.toLowerCase().includes(search.toLowerCase()) || 
          o.name.toLowerCase().includes(search.toLowerCase())
      );

      return (
          // Z-INDEX DINAMIS: Jika terbuka, dia paling depan (z-50), jika tutup (z-10)
          <div className={`relative mb-4 ${isOpen ? 'z-50' : 'z-10'}`}>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
              
              <div 
                  className={`w-full p-3 border-2 rounded-xl bg-white flex justify-between items-center cursor-pointer transition ${isOpen ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}
                  onClick={() => setActiveDropdown(isOpen ? null : name)} // Toggle logic
              >
                  <span className={`truncate ${value ? "text-slate-800 font-bold" : "text-slate-400"}`}>
                      {value ? `${selectedItem?.university} - ${selectedItem?.name}` : "Ketik / Pilih Kampus..."}
                  </span>
                  <ChevronRight size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}/>
              </div>
              
              {isOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in" style={{maxHeight: '250px'}}>
                      <div className="p-3 border-b bg-slate-50 sticky top-0 z-20">
                          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                              <Search size={16} className="text-slate-400"/>
                              <input 
                                  autoFocus
                                  className="w-full text-sm outline-none placeholder:text-slate-300" 
                                  placeholder="Cari contoh: UI, ITB, Kedokteran..." 
                                  value={search}
                                  onChange={e => setSearch(e.target.value)}
                              />
                          </div>
                      </div>
                      <div className="overflow-y-auto flex-1 p-1 bg-white custom-scrollbar">
                          {filtered.length === 0 ? (
                              <div className="p-4 text-center text-xs text-slate-400">Jurusan tidak ditemukan.</div>
                          ) : (
                              filtered.map(m => (
                                  <div 
                                      key={m.id} 
                                      className={`p-3 text-sm rounded-lg cursor-pointer transition flex flex-col border-b last:border-0 ${value === m.id ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-slate-50 border-transparent'}`}
                                      onClick={() => { onChange(m.id); setActiveDropdown(null); setSearch(""); }}
                                  >
                                      <span className="font-bold text-indigo-700">{m.university}</span>
                                      <span className="text-slate-600">{m.name}</span>
                                      <span className="text-[10px] text-slate-400 mt-1">Passing Grade: {m.passing_grade}</span>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              )}
          </div>
      );
  };

  if (activeExamData) return <ExamSimulation examData={activeExamData} onSubmit={handleSubmitExam} />;

  if (reviewData) return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                  <h1 className="text-xl font-bold text-slate-800">Pembahasan Soal</h1>
                  <button onClick={()=>setReviewData(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition">Tutup</button>
              </div>
              <div className="p-8 space-y-8">
                {reviewData.questions.map((q, i) => (
                    <div key={i} className="p-6 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                        <div className="flex gap-2 mb-4">
                            <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold">Soal {i+1}</span>
                        </div>
                        <div className="mb-4 text-lg font-medium text-slate-800" dangerouslySetInnerHTML={{__html: q.text}} />
                        {q.image_url && q.image_url !== 'nan' && <img src={q.image_url} className="max-h-60 rounded-lg border mb-4"/>}
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Kunci Jawaban</div>
                                <div className="font-bold text-lg text-emerald-800">{q.correct_answer}</div>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl md:col-span-2">
                                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2"><BookOpen size={14}/> Pembahasan</div>
                                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{q.explanation || "Pembahasan belum tersedia untuk soal ini."}</div>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
          </div>
      </div>
  );

  if (showMajorSelector) {
      return (
          // BACKDROP LEBIH GELAP & BLUR
          <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              {/* MODAL CONTAINER */}
              <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl relative" style={{minHeight: '500px'}}>
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-black text-slate-800">Target Kampus</h2>
                    <p className="text-slate-500 text-sm mt-1">Tentukan masa depanmu sekarang.</p>
                  </div>
                  
                  {/* WRAPPER DROPDOWNS */}
                  <div className="space-y-4">
                      <SearchableSelect 
                        label="Pilihan 1 (Prioritas)" 
                        name="c1"
                        value={selectedMajors.c1} 
                        onChange={id => setSelectedMajors({...selectedMajors, c1: id})} 
                        options={majors} 
                      />
                      
                      <SearchableSelect 
                        label="Pilihan 2 (Cadangan)" 
                        name="c2"
                        value={selectedMajors.c2} 
                        onChange={id => setSelectedMajors({...selectedMajors, c2: id})} 
                        options={majors} 
                      />
                  </div>

                  {/* TOMBOL SIMPAN DI BAWAH (FIXED POSITION RELATIVE TO MODAL) */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <button onClick={handleSaveMajors} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transform transition active:scale-95 flex items-center justify-center gap-2">
                        <CheckCircle size={20}/> Simpan & Lanjutkan
                    </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">S</div>
            <div>
                <h1 className="font-bold text-xl leading-tight text-slate-800">Halo, {user.username}</h1>
                <p className="text-xs text-slate-500 font-medium">{user.school || "Siswa Pejuang PTN"}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            {!showMajorSelector && (
                <button onClick={handleResetMajors} className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-100 hover:text-indigo-600 transition">
                    <RotateCcw size={16}/> Ganti Jurusan
                </button>
            )}
            <button onClick={onLogout} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition shadow-sm" title="Keluar Aplikasi"><LogOut size={20}/></button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-10">
        {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-3xl border-2 flex flex-col justify-center ${stats.is_released ? (stats.status.includes('LULUS')?'bg-emerald-50 border-emerald-200 text-emerald-800':'bg-red-50 border-red-200 text-red-800') : 'bg-white border-slate-100 text-slate-400'}`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Status Kelulusan</h3>
                    <div className="text-3xl font-black tracking-tight">{stats.is_released ? stats.status : "MENUNGGU"}</div>
                    {stats.is_released && <div className="text-xs mt-2 font-medium opacity-80">Berdasarkan Passing Grade</div>}
                </div>
                <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 md:col-span-2 flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Rata-rata Nilai IRT</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-slate-800">{stats.is_released ? stats.average : "---"}</span>
                            <span className="text-lg text-slate-400 font-bold">/ 1000</span>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-4 translate-y-4">
                        <BarChart3 size={150}/>
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Clock size={24}/></div>
                <h2 className="text-2xl font-bold text-slate-800">Jadwal Ujian</h2>
            </div>
            
            {periods.length === 0 ? (
                <div className="p-16 text-center">
                    <div className="inline-block p-4 bg-slate-50 rounded-full mb-4"><Clock size={40} className="text-slate-300"/></div>
                    <div className="text-slate-400 font-medium">Belum ada ujian yang aktif saat ini.</div>
                </div>
            ) : (
                periods.map(p => (
                    <div key={p.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8 transition hover:shadow-md">
                        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-xl text-slate-800">{p.name}</h3>
                                <div className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-wider">Tryout UTBK-SNBT</div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {p.exams.map(ex => (
                                <div key={ex.id} className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg transition group relative overflow-hidden flex flex-col justify-between h-full">
                                    <div className="relative z-10 mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">{ex.code}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{ex.duration} Menit</span>
                                        </div>
                                        <div className="font-bold text-slate-800 text-lg leading-tight">{ex.title}</div>
                                        <div className="text-xs text-slate-400 mt-1">{ex.q_count} Butir Soal</div>
                                    </div>
                                    
                                    <div className="relative z-10 pt-4 border-t border-slate-50">
                                        {ex.is_done ? (
                                            <div className="flex gap-2">
                                                <button disabled className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center gap-2 cursor-default border border-emerald-100"><CheckCircle size={14}/> Selesai</button>
                                                <button onClick={() => handleReview(ex.id)} className="px-3 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 border border-blue-100 transition" title="Lihat Pembahasan"><BookOpen size={14}/></button>
                                            </div>
                                        ) : ex.q_count === 0 ? (
                                            <button disabled className="w-full py-2 rounded-xl bg-slate-50 text-slate-400 font-bold text-xs cursor-not-allowed border border-slate-100">Belum Tersedia</button>
                                        ) : (
                                            <button onClick={() => handleStartExam(ex.id)} className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group-hover:scale-105 transition"><PlayCircle size={14}/> Kerjakan</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;