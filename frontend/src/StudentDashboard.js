import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen, BarChart3, Clock, Eye, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';

const StudentDashboard = ({ user, onLogout, onSelectExam, apiUrl }) => {
  const [tab, setTab] = useState('exams');
  const [periods, setPeriods] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
        fetch(`${apiUrl}/student/periods?username=${user.username}`).then(r=>r.json()).catch(()=>[]),
        fetch(`${apiUrl}/student/dashboard-stats?username=${user.username}`).then(r=>r.json()).catch(()=>null)
    ]).then(([periodsData, statsData]) => {
        setPeriods(Array.isArray(periodsData) ? periodsData : []);
        setStats(statsData);
        setLoading(false);
    });
  }, [user, apiUrl]);

  const handleViewReview = (examId) => {
      fetch(`${apiUrl}/student/review/${examId}`)
        .then(r => r.json())
        .then(setReviewData)
        .catch(() => alert("Gagal memuat pembahasan."));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">C</div>
                <div>
                    <div className="font-bold text-slate-800 leading-tight">CBT System</div>
                    <div className="text-xs text-slate-500 font-medium">Selamat Datang, {user?.full_name?.split(' ')[0]}</div>
                </div>
            </div>
            <button onClick={onLogout} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors duration-200" title="Keluar"><LogOut size={20}/></button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 mt-6 space-y-8">
        
        {/* HERO SECTION / STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div>
                    <p className="text-indigo-100 font-medium text-sm">Status Kelulusan</p>
                    <h2 className="text-2xl font-bold mt-1">{stats?.is_released ? stats.status : "Belum Rilis"}</h2>
                </div>
                <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold backdrop-blur-sm">{user?.school || "Umum"}</span>
                </div>
            </div>
            
            <button onClick={() => setTab('exams')} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${tab==='exams' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
                <BookOpen size={32} className={tab==='exams'?'text-indigo-600':'text-slate-400'}/>
                <span className="font-bold">Ujian Tersedia</span>
            </button>

            <button onClick={() => setTab('stats')} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${tab==='stats' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
                <BarChart3 size={32} className={tab==='stats'?'text-indigo-600':'text-slate-400'}/>
                <span className="font-bold">Hasil & Grafik</span>
            </button>
        </div>

        {/* --- DAFTAR UJIAN --- */}
        {tab === 'exams' && (
            <div className="space-y-6 animate-fade-in">
                <h3 className="font-bold text-xl text-slate-800">Jadwal Ujian Aktif</h3>
                {periods.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="inline-block p-4 bg-slate-50 rounded-full mb-3"><Clock size={32} className="text-slate-300"/></div>
                        <p className="text-slate-500 font-medium">Tidak ada ujian yang tersedia saat ini.</p>
                    </div>
                ) : periods.map(p => (
                    <div key={p.id} className="bg-white p-1 rounded-3xl shadow-sm border border-slate-200">
                        <div className="p-6 border-b border-slate-100">
                            <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2"><div className="w-2 h-6 bg-indigo-600 rounded-full"></div> {p.name}</h4>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {p.exams.map(e => (
                                <div 
                                    key={e.id} 
                                    onClick={() => !e.is_done && onSelectExam(e.id)} 
                                    className={`p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                                        e.is_done 
                                        ? 'bg-emerald-50 border-emerald-200 cursor-default' 
                                        : 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`text-xs font-bold px-2 py-1 rounded ${e.is_done ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{e.code}</div>
                                        {e.is_done && <CheckCircle size={18} className="text-emerald-600"/>}
                                    </div>
                                    <h5 className={`font-bold text-lg mb-1 ${e.is_done ? 'text-emerald-900' : 'text-slate-800 group-hover:text-indigo-700'}`}>{e.title}</h5>
                                    <div className="flex gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><Clock size={14}/> {e.duration}m</span>
                                        <span className="flex items-center gap-1"><BookOpen size={14}/> {e.q_count} Soal</span>
                                    </div>
                                    {!e.is_done && <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity"><div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">Kerjakan</div></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* --- HASIL NILAI --- */}
        {tab === 'stats' && (
            <div className="space-y-6 animate-fade-in">
                {!stats || !stats.is_released ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-center">
                        <div className="p-4 bg-amber-50 text-amber-500 rounded-full mb-4"><AlertTriangle size={32}/></div>
                        <h3 className="font-bold text-lg text-slate-800">Nilai Belum Dirilis</h3>
                        <p className="text-slate-500 max-w-md mt-2">Admin belum merilis hasil ujian untuk periode ini. Silakan cek kembali nanti.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Radar Chart */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 lg:col-span-1 flex flex-col items-center">
                            <h4 className="font-bold text-slate-800 mb-4 self-start">Peta Kemampuan</h4>
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radar}>
                                        <PolarGrid stroke="#e2e8f0"/>
                                        <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 10}} />
                                        <PolarRadiusAxis angle={30} domain={[0, 1000]} tick={false}/>
                                        <Radar name="Skor" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-4">
                                <div className="text-4xl font-black text-indigo-600">{stats.average}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Rata-Rata Skor IRT</div>
                            </div>
                        </div>

                        {/* Tabel Rincian */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 lg:col-span-2">
                            <h4 className="font-bold text-slate-800 mb-6">Rincian Per Mata Uji</h4>
                            <div className="space-y-4">
                                {(stats.details || []).map((d, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm">{d.code}</div>
                                            <div>
                                                <div className="font-bold text-slate-800">{d.subject}</div>
                                                <div className="text-xs text-slate-500 flex gap-2">
                                                    <span className="text-emerald-600">{d.correct} Benar</span> • <span className="text-red-500">{d.wrong} Salah</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-black text-lg text-indigo-700">{d.score}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">Skor</div>
                                            </div>
                                            <button onClick={() => handleViewReview(d.id)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm" title="Lihat Pembahasan">
                                                <Eye size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* MODAL PEMBAHASAN */}
        {reviewData && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-scale-up">
                    <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                        <div>
                            <h3 className="font-bold text-xl text-slate-800">{reviewData.title}</h3>
                            <p className="text-sm text-slate-500">Mode Review & Pembahasan</p>
                        </div>
                        <button onClick={() => setReviewData(null)} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition"><X size={24}/></button>
                    </div>
                    <div className="p-8 overflow-y-auto space-y-8 bg-slate-50">
                        {reviewData.questions.map((q, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg shadow-indigo-200">{i+1}</div>
                                    <div className="flex-1 space-y-4">
                                        <div className="prose prose-sm max-w-none text-slate-700 font-medium">
                                            {/* Render Soal */}
                                            {q.reading_material && <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm italic mb-4 whitespace-pre-wrap">{q.reading_material}</div>}
                                            {q.image_url && <img src={q.image_url} alt="Soal" className="max-w-full h-auto rounded-lg mb-4 border border-slate-200"/>}
                                            <p className="whitespace-pre-wrap">{q.text}</p>
                                        </div>
                                        
                                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2">
                                                <CheckCircle size={16}/> Kunci Jawaban: {q.correct_answer}
                                            </div>
                                            <div className="text-sm text-slate-600 leading-relaxed border-t border-emerald-100 pt-2 mt-2">
                                                <strong className="text-emerald-800 block mb-1">Pembahasan:</strong>
                                                {q.explanation ? <div dangerouslySetInnerHTML={{__html: q.explanation.replace(/\n/g, '<br/>')}} /> : "Tidak ada pembahasan detail."}
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