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
        if (saved) { 
            try { setUser(JSON.parse(saved)); } 
            catch (e) { localStorage.removeItem('eduprime_user'); } 
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setLoading(true); 
        setError('');
        
        try {
            const res = await fetch(`${API_URL}/login`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ username, password }) 
            });
            const data = await res.json();
            
            if (res.ok) { 
                setUser(data); 
                localStorage.setItem('eduprime_user', JSON.stringify(data)); 
            } else { 
                setError(data.detail || "ID atau Kode Akses Salah."); 
            }
        } catch (err) { 
            setError("Gagal terhubung ke server."); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleLogout = () => { 
        if (window.confirm("Yakin ingin keluar?")) {
            setUser(null); 
            localStorage.removeItem('eduprime_user'); 
            window.location.reload();
        }
    };

    if (user) {
        if (user.role === 'admin') return <AdminDashboard onLogout={handleLogout} />;
        return <StudentDashboard user={user} onLogout={handleLogout} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Orbs (Hidden on Mobile) */}
            <div className="hidden md:block absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="hidden md:block absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-sky-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="w-full max-w-sm md:max-w-md bg-white/90 backdrop-blur-xl border border-white/50 p-8 md:p-12 rounded-[2rem] shadow-2xl relative z-10">
                <div className="text-center mb-8 md:mb-10">
                    <div className="inline-flex p-4 bg-indigo-600 rounded-2xl mb-4 text-white shadow-lg shadow-indigo-200">
                        <GraduationCap size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Edu<span className="text-indigo-600">Prime</span></h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Mobile & Desktop Ready</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold text-center flex items-center justify-center gap-2"><XCircle size={16}/> {error}</div>}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-wider">Username ID</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"><User size={18}/></div>
                            <input className="w-full bg-slate-50 text-slate-800 pl-12 pr-4 py-4 rounded-xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold placeholder:text-slate-300 text-sm" placeholder="Nomor Peserta / Admin" value={username} onChange={e => setUsername(e.target.value)} autoFocus/>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-wider">Kode Akses</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"><Lock size={18}/></div>
                            <input type="password" className="w-full bg-slate-50 text-slate-800 pl-12 pr-4 py-4 rounded-xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold placeholder:text-slate-300 text-sm" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs md:text-sm tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6">
                        {loading ? <Loader2 className="animate-spin" size={18}/> : "MASUK SEKARANG"}
                        {!loading && <ChevronRight size={16} className="opacity-70"/>}
                    </button>
                </form>
                <div className="mt-8 text-center border-t border-slate-100 pt-6"><p className="text-[10px] text-slate-400 font-bold">&copy; 2026 EDUPRIME ENTERPRISE</p></div>
            </div>
        </div>
    );
};
export default App;