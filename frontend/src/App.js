import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import { API_URL } from './config';
import { User, Lock, Loader2, GraduationCap, ChevronRight, XCircle } from 'lucide-react';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('eduprime_user');
        if (saved) { try { setUser(JSON.parse(saved)); } catch (e) { localStorage.removeItem('eduprime_user'); } }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
            const data = await res.json();
            if (res.ok) { setUser(data); localStorage.setItem('eduprime_user', JSON.stringify(data)); } 
            else { setError(data.detail || "Identitas tidak ditemukan."); }
        } catch (err) { setError("Gagal terhubung ke sistem."); } finally { setLoading(false); }
    };

    const handleLogout = () => { setUser(null); localStorage.removeItem('eduprime_user'); window.location.reload(); };

    if (user) {
        if (user.role === 'admin') return <AdminDashboard onLogout={handleLogout} />;
        return <StudentDashboard user={user} onLogout={handleLogout} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 p-10 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-4 text-indigo-600 shadow-sm border border-indigo-100"><GraduationCap size={40} /></div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Edu<span className="text-indigo-600">Prime</span></h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Enterprise System V55</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center flex items-center justify-center gap-2 animate-pulse"><XCircle size={16}/> {error}</div>}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-wider">Username ID</label>
                        <div className="relative group"><div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><User size={20}/></div><input className="w-full bg-slate-50 text-slate-800 pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold transition-all placeholder:text-slate-400" placeholder="Nomor Peserta / Admin" value={username} onChange={e => setUsername(e.target.value)} autoFocus/></div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-wider">Kode Akses</label>
                        <div className="relative group"><div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><Lock size={20}/></div><input type="password" className="w-full bg-slate-50 text-slate-800 pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold transition-all placeholder:text-slate-400" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/></div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-6">{loading ? <Loader2 className="animate-spin" size={20}/> : "MASUK SEKARANG"}{!loading && <ChevronRight size={18} className="opacity-80"/>}</button>
                </form>
                <div className="mt-8 text-center border-t border-slate-100 pt-6"><p className="text-[10px] text-slate-400 font-bold">&copy; 2026 EDUPRIME ENTERPRISE</p></div>
            </div>
        </div>
    );
};
export default App;