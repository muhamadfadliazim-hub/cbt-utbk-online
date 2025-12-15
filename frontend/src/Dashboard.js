import React, { useEffect, useState } from 'react';
import { BookOpen, Calculator, PenTool, BrainCircuit, ChevronRight, Loader2, Clock, FileText, LogOut, FileBarChart, Folder, CheckCircle, Lock } from 'lucide-react';
import { API_URL } from './config';

const Dashboard = ({ onSelectExam, userName, username, onLogout, onGoToRecap }) => {
  const [periods, setPeriods] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [expandedPeriod, setExpandedPeriod] = useState(null);

  useEffect(() => {
    if(username) {
        fetch(`${API_URL}/student/periods?username=${username}`)
        .then(res => res.json())
        .then(data => { 
            if (Array.isArray(data)) setPeriods(data);
            else setPeriods([]); 
            setLoading(false); 
        })
        .catch(err => { setPeriods([]); setLoading(false); });
    }
  }, [username]);

  const getIcon = (title) => {
    if (title.includes('Kuantitatif') || title.includes('Matematika')) return <Calculator className="text-blue-500" />;
    if (title.includes('Inggris') || title.includes('Indonesia')) return <BookOpen className="text-green-500" />;
    if (title.includes('Penalaran')) return <BrainCircuit className="text-purple-500" />;
    return <PenTool className="text-orange-500" />;
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-blue-600"><Loader2 className="animate-spin mr-2"/> Memuat Paket Tryout...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm p-6 mb-8 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div><h1 className="text-2xl font-bold text-gray-800">Halo, {userName}! 👋</h1><p className="text-gray-500 text-sm mt-1">Ikuti urutan pengerjaan subtes di bawah ini.</p></div>
          <div className="flex items-center gap-3"><button onClick={onGoToRecap} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-bold shadow-sm"><FileBarChart size={16}/> Rekap Hasil</button><button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-bold"><LogOut size={16}/> Keluar</button></div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 pb-12">
        {periods.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-xl shadow border border-gray-200"><Folder size={48} className="mx-auto text-gray-300 mb-4"/><h3 className="text-xl font-bold text-gray-600">Belum ada Tryout Aktif</h3><p className="text-gray-400 mt-2">Silakan tunggu informasi selanjutnya.</p></div>
        ) : (
            <div className="space-y-6">
                {periods.map(period => (
                    <div key={period.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white cursor-pointer flex justify-between items-center hover:opacity-95 transition" onClick={() => setExpandedPeriod(expandedPeriod === period.id ? null : period.id)}>
                            <h2 className="text-xl font-bold flex items-center gap-2"><Folder className="text-blue-200"/> {period.name}</h2>
                            <div className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">{expandedPeriod === period.id ? "Tutup" : "Buka Soal"}</div>
                        </div>
                        {expandedPeriod === period.id && (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 border-t border-gray-200">
                                {period.exams.map((exam, index) => (
                                    <div 
                                        key={exam.id} 
                                        // LOGIKA KLIK: Hanya bisa diklik jika status 'open'
                                        onClick={() => exam.status === 'open' && onSelectExam(exam.id)} 
                                        className={`p-4 rounded-lg border transition flex items-center gap-4 group relative 
                                            ${exam.status === 'done' ? 'bg-gray-100 border-gray-200 opacity-75' : ''}
                                            ${exam.status === 'locked' ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' : ''}
                                            ${exam.status === 'open' ? 'bg-white border-blue-300 shadow-md cursor-pointer hover:border-blue-500 transform hover:-translate-y-1' : ''}
                                        `}
                                    >
                                        {/* Nomor Urut Pengerjaan */}
                                        <div className="absolute top-2 right-2 text-xs font-bold text-gray-300">
                                            #{index + 1}
                                        </div>

                                        <div className={`p-3 rounded-lg transition-colors 
                                            ${exam.status === 'done' ? 'bg-gray-200' : ''}
                                            ${exam.status === 'locked' ? 'bg-gray-200' : ''}
                                            ${exam.status === 'open' ? 'bg-blue-50 group-hover:bg-blue-100' : ''}
                                        `}>
                                            {exam.status === 'done' ? <CheckCircle className="text-green-600"/> : 
                                             exam.status === 'locked' ? <Lock className="text-gray-400"/> :
                                             getIcon(exam.title)}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <h4 className={`font-bold text-sm 
                                                ${exam.status === 'locked' ? 'text-gray-400' : 'text-gray-800 group-hover:text-blue-700'}
                                            `}>
                                                {exam.title}
                                            </h4>
                                            <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                                <span className="flex items-center gap-1"><Clock size={12}/> {exam.duration}m</span>
                                                <span className="flex items-center gap-1"><FileText size={12}/> {exam.q_count} Soal</span>
                                            </div>
                                        </div>

                                        {/* BADGE STATUS */}
                                        {exam.status === 'done' && (
                                            <div className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded border border-green-200">
                                                SELESAI
                                            </div>
                                        )}
                                        {exam.status === 'locked' && (
                                            <div className="flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded border border-gray-200">
                                                <Lock size={10} /> TERKUNCI
                                            </div>
                                        )}
                                        {exam.status === 'open' && (
                                            <div className="flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded shadow-sm animate-pulse">
                                                KERJAKAN <ChevronRight size={10}/>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};
export default Dashboard;