import React, { useState, useEffect } from 'react';
import { LogOut, Clock, PlayCircle, BarChart3, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import ExamSimulation from './ExamSimulation';

const StudentDashboard = ({ user, onLogout, apiUrl }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [periods, setPeriods] = useState([]);
  const [stats, setStats] = useState(null);
  
  // AUTO RESUME DARI LOCALSTORAGE
  const [activeExamId, setActiveExamId] = useState(localStorage.getItem('active_exam_id'));
  const [activeExamData, setActiveExamData] = useState(null);

  useEffect(() => {
    // Jika ada ujian aktif, langsung load soalnya
    if (activeExamId) {
        fetchExam(activeExamId);
    }
    fetchData();
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

  const fetchExam = async (examId) => {
      try {
          const res = await fetch(`${apiUrl}/exams/${examId}`);
          if(!res.ok) throw new Error("Gagal load soal");
          const data = await res.json();
          setActiveExamData(data);
          // Simpan ID ujian agar kalau refresh tidak hilang
          localStorage.setItem('active_exam_id', examId);
      } catch (err) {
          alert("Gagal memuat ujian. Silakan coba lagi.");
          setActiveExamId(null);
          localStorage.removeItem('active_exam_id');
      }
  };

  const handleStartExam = (examId) => {
      if (window.confirm("Mulai ujian sekarang? Waktu akan berjalan.")) {
          setActiveExamId(examId);
      }
  };

  const handleSubmitExam = async (answers) => {
      try {
          const res = await fetch(`${apiUrl}/exams/${activeExamData.id}/submit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: user.username, answers })
          });
          
          if (!res.ok) throw new Error("Gagal mengirim jawaban");
          
          // DATA SKOR DITERIMA DARI BACKEND TAPI TIDAK DITAMPILKAN
          // const data = await res.json(); 
          
          // NOTIFIKASI NETRAL
          alert("Jawaban berhasil disimpan! Anda bisa melanjutkan ke subtes berikutnya.");
          
          // Bersihkan state ujian
          setActiveExamId(null);
          setActiveExamData(null);
          localStorage.removeItem('active_exam_id');
          fetchData(); // Refresh dashboard agar status berubah jadi "Selesai"
      } catch (err) {
          alert("Gagal mengirim jawaban! Periksa koneksi internet Anda dan coba lagi.");
      }
  };

  // JIKA SEDANG UJIAN, TAMPILKAN SIMULASI
  if (activeExamData) {
      return <ExamSimulation examData={activeExamData} onSubmit={handleSubmitExam} />;
  }

  // JIKA TIDAK, TAMPILKAN DASHBOARD BIASA
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">S</div>
            <div>
                <h1 className="font-bold text-lg leading-tight">Halo, {user.username}</h1>
                <p className="text-xs text-slate-500">{user.school || "Siswa Umum"}</p>
            </div>
        </div>
        <button onClick={onLogout} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"><LogOut size={20}/></button>
      </nav>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* STATISTIK (HANYA MUNCUL JIKA DIRILIS) */}
        {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border-2 ${stats.is_released ? (stats.status.includes('LULUS')?'bg-emerald-50 border-emerald-200':'bg-red-50 border-red-200') : 'bg-white border-slate-200'}`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Status Kelulusan</h3>
                    <div className="text-2xl font-black">{stats.is_released ? stats.status : "MENUNGGU"}</div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Rata-rata Nilai IRT</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-indigo-600">{stats.is_released ? stats.average : "---"}</span>
                        <span className="text-sm text-slate-400 mb-1">/ 1000</span>
                    </div>
                </div>
            </div>
        )}

        {/* DAFTAR UJIAN */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Clock size={24} className="text-indigo-600"/> Jadwal Ujian</h2>
            {periods.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">Belum ada ujian aktif.</div>
            ) : (
                periods.map(p => (
                    <div key={p.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">UTBK SNBT</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {p.exams.map(ex => (
                                <div key={ex.id} className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 transition group relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="text-xs font-bold text-slate-400 mb-1">{ex.code}</div>
                                        <div className="font-bold text-slate-800 mb-3">{ex.title}</div>
                                        {ex.is_done ? (
                                            <button disabled className="w-full py-2 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center gap-2 cursor-default"><CheckCircle size={14}/> Selesai</button>
                                        ) : ex.q_count === 0 ? (
                                            <button disabled className="w-full py-2 rounded-lg bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed">Belum Tersedia</button>
                                        ) : (
                                            <button onClick={() => handleStartExam(ex.id)} className="w-full py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group-hover:scale-105 transition"><PlayCircle size={14}/> Kerjakan</button>
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