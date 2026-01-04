import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import { API_URL } from './config';
import { User, Lock, Loader2, GraduationCap } from 'lucide-react'; // Hapus LogIn jika tidak dipakai

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
            else { setError(data.detail || "Login Gagal."); }
        } catch (err) { setError("Gagal koneksi ke server."); } finally { setLoading(false); }
    };

    const handleLogout = () => { setUser(null); localStorage.removeItem('eduprime_user'); window.location.reload(); };

    if (user) {
        if (user.role === 'admin') return <AdminDashboard onLogout={handleLogout} />;
        return <StudentDashboard user={user} onLogout={handleLogout} />;
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-indigo-900/30 rounded-full mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]"><GraduationCap size={48} className="text-indigo-400" /></div>
                    <h1 className="text-5xl font-black text-white italic tracking-tighter mb-2">EDU<span className="text-indigo-500">PRIME</span></h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">Sistem Ujian Terintegrasi V41</p>
                </div>
                <div className="bg-[#0F172A] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold text-center">{error}</div>}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase ml-4">Username</label>
                            <div className="relative"><User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20}/><input className="w-full bg-[#020617] text-white pl-16 pr-6 py-5 rounded-2xl border border-white/10 focus:border-indigo-500 outline-none font-bold" placeholder="ID Peserta / Admin" value={username} onChange={e => setUsername(e.target.value)} /></div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase ml-4">Password</label>
                            <div className="relative"><Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20}/><input type="password" className="w-full bg-[#020617] text-white pl-16 pr-6 py-5 rounded-2xl border border-white/10 focus:border-indigo-500 outline-none font-bold" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl mt-4 flex justify-center items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={20}/> : "MASUK SYSTEM"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default App;