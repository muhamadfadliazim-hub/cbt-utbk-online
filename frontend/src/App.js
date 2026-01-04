import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import { API_URL } from './config';
import { LogIn, User, Lock, Loader2, GraduationCap } from 'lucide-react';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Login Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // 1. CEK SESI LOGIN (Auto Login saat Refresh)
    useEffect(() => {
        const savedUser = localStorage.getItem('eduprime_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('eduprime_user');
            }
        }
    }, []);

    // 2. FUNGSI LOGIN KE BACKEND V40
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
                setUser(data); // Simpan data user (role, nama, jurusan)
                localStorage.setItem('eduprime_user', JSON.stringify(data)); 
            } else {
                setError(data.detail || "Username atau Password Salah");
            }
        } catch (err) {
            setError("Gagal terhubung ke Server. Cek koneksi internet.");
        } finally {
            setLoading(false);
        }
    };

    // 3. FUNGSI LOGOUT
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('eduprime_user');
        window.location.reload();
    };

    // 4. ROUTING BERDASARKAN ROLE (INTI V40)
    if (user) {
        if (user.role === 'admin') {
            return <AdminDashboard onLogout={handleLogout} />;
        } else {
            return <StudentDashboard user={user} onLogout={handleLogout} />;
        }
    }

    // 5. HALAMAN LOGIN (UI FINAL)
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans selection:bg-indigo-500 selection:text-white">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                
                {/* Logo Area */}
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-indigo-900/30 rounded-full mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                        <GraduationCap size={48} className="text-indigo-400" />
                    </div>
                    <h1 className="text-5xl font-black text-white italic tracking-tighter mb-2">
                        EDU<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">PRIME</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">
                        Integrated Assessment System V40
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-[#0F172A] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                    
                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold text-center flex items-center justify-center gap-2 animate-pulse">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase ml-4 tracking-wider">Username ID</label>
                            <div className="relative group/input">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" size={20}/>
                                <input 
                                    className="w-full bg-[#020617] text-white pl-16 pr-6 py-5 rounded-2xl border border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold transition-all placeholder:text-slate-600"
                                    placeholder="Nomor Peserta / Admin"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase ml-4 tracking-wider">Password Access</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" size={20}/>
                                <input 
                                    type="password"
                                    className="w-full bg-[#020617] text-white pl-16 pr-6 py-5 rounded-2xl border border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-indigo-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin"/> : <LogIn size={20}/>}
                            {loading ? "AUTHENTICATING..." : "ENTER SYSTEM"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default App;