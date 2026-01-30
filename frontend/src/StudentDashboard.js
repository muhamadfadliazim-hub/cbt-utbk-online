import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen, BarChart3, Trophy, Eye, X } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const StudentDashboard = ({ user, onLogout, onSelectExam, apiUrl }) => {
  const [tab, setTab] = useState('exams');
  const [periods, setPeriods] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => {
    if (!user) return;
    // AMBIL DATA PERIODE UJIAN
    fetch(`${apiUrl}/student/periods?username=${user.username}`)
      .then(r => r.json())
      .then(d => setPeriods(Array.isArray(d) ? d : [])) // SAFETY CHECK
      .catch(() => setPeriods([]));

    // AMBIL DATA REKAP NILAI
    fetch(`${apiUrl}/student/dashboard-stats?username=${user.username}`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, [user, apiUrl]);

  const handleViewReview = (examId) => {
      fetch(`${apiUrl}/student/review/${examId}`)
        .then(r => r.json())
        .then(setReviewData)
        .catch(() => alert("Gagal memuat pembahasan."));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* NAVBAR */}
      <nav className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-50">
        <div>
            <div className="font-bold text-xl text-indigo-700">CBT System</div>
            <div className="text-xs text-slate-500">Halo, {user?.full_name}</div>
        </div>
        <button onClick={onLogout} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition text-red-500"><LogOut size={20}/></button>
      </nav>

      <main className="p-4 max-w-5xl mx-auto space-y-6">
        {/* TAB MENU */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setTab('exams')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${tab === 'exams' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Daftar Ujian</button>
            <button onClick={() => setTab('stats')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${tab === 'stats' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Rekap Nilai</button>
        </div>

        {/* KONTEN: DAFTAR UJIAN */}
        {tab === 'exams' && (
            <div className="space-y-4">
                {periods.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">Belum ada ujian aktif.</div>
                ) : periods.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{p.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {p.exams.map(e => (
                                <div key={e.id} onClick={() => onSelectExam(e.id)} className="p-4 border rounded-xl hover:border-indigo-500 cursor-pointer bg-slate-50 hover:bg-white transition group">
                                    <div className="font-bold text-slate-700 group-hover:text-indigo-600">{e.title}</div>
                                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                                        <span className="flex items-center gap-1"><Clock size={12}/> {e.duration} m</span>
                                        <span className="flex items-center gap-1"><BookOpen size={12}/> {e.q_count} Soal</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* KONTEN: REKAP NILAI (FIX BLANK) */}
        {tab === 'stats' && (
            <div className="space-y-6">
                {!stats || !stats.is_released ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                        <BarChart3 className="w-12 h-12 mx-auto text-slate-300 mb-3"/>
                        <p className="text-slate-500 font-medium">Nilai belum tersedia atau belum dirilis.</p>
                    </div>
                ) : (
                    <>
                        {/* KARTU SKOR & STATUS */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">Rata-rata Skor</div>
                                <div className="text-5xl font-black text-indigo-700 mt-2">{stats.average}</div>
                            </div>
                            <div className={`px-6 py-3 rounded-xl font-bold text-white ${stats.status_color === 'green' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                {stats.status}
                            </div>
                        </div>

                        {/* TABEL RINCIAN (ANTI CRASH) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="p-4 text-left">Mata Uji</th>
                                        <th className="p-4 text-center">B</th>
                                        <th className="p-4 text-center">S</th>
                                        <th className="p-4 text-center">Skor</th>
                                        <th className="p-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(stats.details || []).map((d, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-700">{d.subject}</td>
                                            <td className="p-4 text-center text-emerald-600 font-bold">{d.correct}</td>
                                            <td className="p-4 text-center text-red-500 font-bold">{d.wrong}</td>
                                            <td className="p-4 text-center font-bold text-indigo-700">{d.score}</td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleViewReview(d.id)} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 mx-auto">
                                                    <Eye size={12}/> Bahas
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!stats.details || stats.details.length === 0) && (
                                        <tr><td colSpan="5" className="p-6 text-center text-slate-400">Belum ada data detail.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        )}

        {/* MODAL PEMBAHASAN */}
        {reviewData && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-3xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-lg">{reviewData.title}</h3>
                        <button onClick={() => setReviewData(null)}><X size={24} className="text-slate-400 hover:text-red-500"/></button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-6">
                        {reviewData.questions.map((q, i) => (
                            <div key={i} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                                <div className="flex gap-3 mb-2">
                                    <span className="bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0">{i+1}</span>
                                    <div className="font-medium text-slate-800">{q.text}</div>
                                </div>
                                <div className="ml-9 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-800">
                                    <strong>Kunci Jawaban:</strong> {q.correct_answer}
                                </div>
                                <div className="ml-9 mt-2 text-sm text-slate-600">
                                    <strong>Pembahasan:</strong> <br/>
                                    {q.explanation || "Tidak ada pembahasan."}
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