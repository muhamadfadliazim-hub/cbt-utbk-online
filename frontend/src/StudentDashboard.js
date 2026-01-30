import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen, BarChart3, Clock, Eye, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const StudentDashboard = ({ user, onLogout, onSelectExam, apiUrl }) => {
  const [tab, setTab] = useState('exams');
  const [periods, setPeriods] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
        fetch(`${apiUrl}/student/periods?username=${user.username}`).then(r => r.json()).catch(()=>[]),
        fetch(`${apiUrl}/student/dashboard-stats?username=${user.username}`).then(r => r.json()).catch(()=>null)
    ]).then(([p, s]) => {
        setPeriods(Array.isArray(p) ? p : []);
        setStats(s);
    });
  }, [user, apiUrl]);

  const handleViewReview = (examId) => {
      fetch(`${apiUrl}/student/review/${examId}`)
        .then(r => r.json())
        .then(setReviewData)
        .catch(() => alert("Gagal memuat pembahasan."));
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-10">
      {/* NAVBAR GLASS */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-200">C</div>
                <div>
                    <h1 className="font-bold text-lg leading-none text-slate-800">CBT System</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">Siswa: {user?.full_name}</p>
                </div>
            </div>
            <button onClick={onLogout} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition"><LogOut size={20}/></button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-8 mt-4">
        
        {/* HERO CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                <div>
                    <p className="text-indigo-200 font-medium mb-1">Status Kelulusan</p>
                    <h2 className="text-3xl font-bold">{stats?.is_released ? stats.status : "Menunggu Rilis"}</h2>
                </div>
                <div className="mt-6 flex items-center gap-2">
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">{user?.school || "Umum"}</span>
                </div>
            </div>

            <button onClick={() => setTab('exams')} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${tab==='exams' ? 'bg-white border-indigo-600 shadow-xl ring-4 ring-indigo-50' : 'bg-white border-slate-100 hover:border-indigo-300'}`}>
                <div className={`p-4 rounded-full ${tab==='exams' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}><BookOpen size={28}/></div>
                <span className={`font-bold ${tab==='exams' ? 'text-indigo-700' : 'text-slate-600'}`}>Kerjakan Ujian</span>
            </button>

            <button onClick={() => setTab('stats')} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${tab==='stats' ? 'bg-white border-indigo-600 shadow-xl ring-4 ring-indigo-50' : 'bg-white border-slate-100 hover:border-indigo-300'}`}>
                <div className={`p-4 rounded-full ${tab==='stats' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}><BarChart3 size={28}/></div>
                <span className={`font-bold ${tab==='stats' ? 'text-indigo-700' : 'text-slate-600'}`}>Lihat Grafik Nilai</span>
            </button>
        </div>

        {/* --- DAFTAR UJIAN --- */}
        {tab === 'exams' && (
            <div className="space-y-6 animate-fade-in">
                <h3 className="font-bold text-xl text-slate-800 ml-1">Periode Ujian Aktif</h3>
                {periods.length === 0 ? <div className="p-10 text-center bg-white rounded-3xl border border-dashed text-slate-400">Tidak ada ujian.</div> : 
                periods.map(p => (
                    <div key={p.id} className="bg-white p-2 rounded-3xl shadow-sm border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100"><h4 className="font-bold text-slate-800">{p.name}</h4></div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {p.exams.map(e => (
                                <div key={e.id} onClick={() => !e.is_done && onSelectExam(e.id)} className={`p-5 rounded-2xl border transition-all cursor-pointer relative group overflow-hidden ${e.is_done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-md'}`}>
                                    <div className="flex justify-between mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${e.is_done?'bg-emerald-200 text-emerald-800':'bg-slate-100 text-slate-500'}`}>{e.code}</span>
                                        {e.is_done && <CheckCircle size={16} className="text-emerald-600"/>}
                                    </div>
                                    <h5 className="font-bold text-slate-800 text-lg mb-1">{e.title}</h5>
                                    <div className="flex gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Clock size={12}/> {e.duration}m</span>
                                        <span className="flex items-center gap-1"><BookOpen size={12}/> {e.q_count} Soal</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* --- REKAP NILAI (RADAR CHART & TABLE) --- */}
        {tab === 'stats' && (
            <div className="space-y-6 animate-fade-in">
                {!stats || !stats.is_released ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="inline-block p-4 bg-amber-50 text-amber-500 rounded-full mb-4"><AlertTriangle size={32}/></div>
                        <h3 className="font-bold text-lg text-slate-800">Nilai Belum Dirilis</h3>
                        <p className="text-slate-500">Silakan hubungi admin atau tunggu jadwal pengumuman.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* CHART */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                            <h4 className="font-bold text-slate-800 mb-2 self-start">Peta Kemampuan</h4>
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.radar}>
                                        <PolarGrid stroke="#cbd5e1" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 1000]} tick={false} />
                                        <Radar name="Skor" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-2">
                                <div className="text-4xl font-black text-indigo-600">{stats.average}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase">Rata-Rata Skor</div>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4">Rincian Skor Subtes</h4>
                            <div className="space-y-3">
                                {stats.details.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shadow-sm">{d.subject}</div>
                                            <div>
                                                <div className="font-bold text-slate-800">{d.subject}</div>
                                                <div className="text-xs text-slate-500 flex gap-2">
                                                    <span className="text-emerald-600">{d.correct} Benar</span>
                                                    <span className="text-red-500">{d.wrong} Salah</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-black text-lg text-indigo-700">{d.score}</span>
                                            <button onClick={() => handleViewReview(d.id)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm" title="Lihat Pembahasan"><Eye size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* MODAL REVIEW */}
        {reviewData && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
                    <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="font-bold text-xl text-slate-800">{reviewData.title}</h3>
                        <button onClick={() => setReviewData(null)} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500"><X size={24}/></button>
                    </div>
                    <div className="p-8 overflow-y-auto space-y-8 bg-slate-50">
                        {reviewData.questions.map((q, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">{i+1}</div>
                                    <div className="flex-1 space-y-4">
                                        <div className="prose prose-sm max-w-none text-slate-700 font-medium">
                                            {q.reading_material && <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm italic mb-4 whitespace-pre-wrap">{q.reading_material}</div>}
                                            {q.image_url && <img src={q.image_url} alt="Soal" className="max-w-full h-auto rounded-lg mb-4 border border-slate-200"/>}
                                            <p className="whitespace-pre-wrap">{q.text}</p>
                                        </div>
                                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2"><CheckCircle size={16}/> Kunci: {q.correct_answer}</div>
                                            <div className="text-sm text-slate-600 leading-relaxed border-t border-emerald-100 pt-2 mt-2">
                                                <strong className="text-emerald-800 block mb-1">Pembahasan:</strong>
                                                {q.explanation ? <div dangerouslySetInnerHTML={{__html: q.explanation.replace(/\n/g, '<br/>')}} /> : "Tidak ada pembahasan."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;