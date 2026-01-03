import React, { useState, useEffect } from 'react';
import { 
    LayoutGrid, BookOpen, Crown, Trophy, 
    Settings, LogOut, Lock, PlayCircle, 
    TrendingUp, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from './config';

// Komponen Visual Glass
const GlassCard = ({ children, className = "", onClick }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

const StudentDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [periods, setPeriods] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Load Data
  useEffect(() => {
    fetch(`${API_URL}/student/periods?username=${user.username}`)
        .then(r => r.json()).then(setPeriods);
  }, [user.username]);

  const handleSimulatePayment = async () => {
    if(!window.confirm("Simulasi Bayar Rp 99.000 via Transfer Bank?")) return;
    await fetch(`${API_URL}/payment/upgrade?username=${user.username}`, { method: 'POST' });
    alert("Pembayaran Sukses! Akun Anda kini Premium.");
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-indigo-500/30">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-24 lg:w-72 border-r border-white/5 p-6 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
        <div>
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">U</div>
                <span className="text-xl font-bold tracking-tight hidden lg:block">UTBK PRO</span>
            </div>

            <nav className="space-y-2">
                {[
                    {id: 'dashboard', icon: LayoutGrid, label: 'Dashboard'},
                    {id: 'tryout', icon: BookOpen, label: 'Tryout & Soal'},
                    {id: 'analytics', icon: TrendingUp, label: 'Analisis'},
                    {id: 'materi', icon: PlayCircle, label: 'Video Materi'},
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <item.icon size={22} />
                        <span className="font-medium hidden lg:block">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>

        {/* User Profile Mini */}
        <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold border border-white/10">
                {user.username[0].toUpperCase()}
            </div>
            <div className="hidden lg:block overflow-hidden">
                <div className="font-bold truncate text-sm">{user.full_name}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                    {user.is_premium ? <span className="text-amber-400 flex gap-1"><Crown size={10}/> Premium</span> : "Free Plan"}
                </div>
            </div>
            <button onClick={onLogout} className="ml-auto text-slate-400 hover:text-red-400"><LogOut size={18}/></button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold">Halo, {user.full_name.split(' ')[0]} 👋</h1>
                <p className="text-slate-400 mt-1">Siap mencetak rekor nilai hari ini?</p>
            </div>
            {!user.is_premium && (
                <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="hidden md:flex bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform items-center gap-2"
                >
                    <Crown size={18} fill="black" /> Upgrade Premium
                </button>
            )}
        </header>

        {/* --- KONTEN DINAMIS --- */}
        <AnimatePresence mode="wait">
            
            {activeTab === 'dashboard' && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* Hero Banner */}
                    <div className="md:col-span-2 h-64 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 relative overflow-hidden flex items-center p-8 shadow-2xl">
                        <div className="relative z-10 max-w-lg">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white mb-4 inline-block backdrop-blur-md">Event Tryout Akbar</span>
                            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">Kejar Kampus Impianmu Sekarang!</h2>
                            <button onClick={() => setActiveTab('tryout')} className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition">Ikuti Ujian</button>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"/>
                    </div>

                    {/* Stats Card */}
                    <GlassCard className="flex flex-col justify-center">
                        <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2"><Trophy size={18}/> Rata-rata Skor</h3>
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-500">
                            645<span className="text-xl text-slate-500">.00</span>
                        </div>
                        <div className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-sm flex gap-2">
                            <TrendingUp size={16}/> Naik 12% dari minggu lalu
                        </div>
                    </GlassCard>

                    {/* Quick Menu Grid */}
                    <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {[
                            {l:"History Nilai", i: Clock, c:"bg-blue-500/20 text-blue-400"},
                            {l:"Target Kampus", i: CheckCircle2, c:"bg-emerald-500/20 text-emerald-400"},
                            {l:"Beli Paket", i: Crown, c:"bg-amber-500/20 text-amber-400"},
                            {l:"Laporan", i: AlertCircle, c:"bg-rose-500/20 text-rose-400"}
                        ].map((m, idx) => (
                            <GlassCard key={idx} className="flex flex-col items-center justify-center gap-3 hover:bg-white/10 cursor-pointer text-center group">
                                <div className={`p-4 rounded-full ${m.c} group-hover:scale-110 transition-transform`}>
                                    <m.i size={24}/>
                                </div>
                                <span className="font-bold text-slate-300">{m.l}</span>
                            </GlassCard>
                        ))}
                    </div>
                </motion.div>
            )}

            {activeTab === 'tryout' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Pilih Paket Ujian</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {periods.map((period) => (
                            <GlassCard key={period.id} className={`group ${period.locked ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-lg text-xs font-bold ${period.exam_type.includes('SMA') ? 'bg-indigo-500/20 text-indigo-300' : 'bg-pink-500/20 text-pink-300'}`}>
                                        {period.exam_type}
                                    </div>
                                    {period.is_vip && <Crown size={20} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />}
                                </div>
                                
                                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{period.name}</h3>
                                <p className="text-slate-400 text-sm mb-6">{period.exams.length} Subtes • 120 Menit</p>

                                {period.locked ? (
                                    <button onClick={() => setShowPaymentModal(true)} className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
                                        <Lock size={16}/> Terkunci (Premium)
                                    </button>
                                ) : (
                                    <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                                        Mulai Kerjakan <ArrowRight size={16}/>
                                    </button>
                                )}
                            </GlassCard>
                        ))}
                    </div>
                </motion.div>
            )}

            {(activeTab === 'materi' || activeTab === 'analytics') && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Settings className="text-slate-500 animate-spin-slow" size={32}/>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Fitur Segera Hadir</h3>
                    <p className="text-slate-400 max-w-md">Kami sedang menyiapkan video pembelajaran eksklusif dan analisis mendalam berbasis AI untuk Anda.</p>
                </div>
            )}
        </AnimatePresence>
      </main>

      {/* MODAL PEMBAYARAN */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-[#1e293b] w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="h-32 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center relative">
                     <Crown size={64} className="text-white/20 absolute"/>
                     <h2 className="text-3xl font-black text-white z-10">UPGRADE PRO</h2>
                     <button onClick={()=>setShowPaymentModal(false)} className="absolute top-4 right-4 bg-black/20 p-2 rounded-full text-white hover:bg-black/40"><Settings size={20} className="rotate-45"/></button>
                </div>
                <div className="p-8">
                    <ul className="space-y-4 mb-8">
                        {['Akses Ribuan Soal Premium', 'Video Pembahasan Eksklusif', 'Analisis Peluang Lolos', 'Prioritas Server Ujian'].map((item,i)=>(
                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                <div className="bg-emerald-500/20 p-1 rounded-full"><CheckCircle2 size={14} className="text-emerald-400"/></div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-center justify-between mb-8 p-4 bg-slate-900 rounded-xl border border-slate-700">
                        <span className="text-slate-400">Total Tagihan</span>
                        <span className="text-2xl font-bold text-white">Rp 99.000<span className="text-xs text-slate-500 font-normal">/bulan</span></span>
                    </div>
                    <button onClick={handleSimulatePayment} className="w-full py-4 bg-white text-black font-black text-lg rounded-xl hover:bg-slate-200 transition">
                        Bayar Sekarang
                    </button>
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};

// Icon ArrowRight helper
const ArrowRight = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

export default StudentDashboard;