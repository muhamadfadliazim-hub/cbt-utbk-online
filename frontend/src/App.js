import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import { API_URL } from './config';
import { LogIn, User, Lock, Loader2 } from 'lucide-react';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Login Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Cek sesi login saat aplikasi dibuka
    useEffect(() => {
        const savedUser = localStorage.getItem('eduprime_user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                localStorage.setItem('eduprime_user', JSON.stringify(data));
            } else {
                setError(data.detail || "Username atau Password Salah");
            }
        })
        .catch(() => setError("Gagal terhubung ke server (Cek Backend)"))
        .finally(() => setLoading(false));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('eduprime_user');
        window.location.reload(); // Refresh agar bersih
    };

    // --- LOGIC ROUTING V31 ---
    if (user) {
        if (user.role === 'admin') {
            return <AdminDashboard onLogout={handleLogout} />;
        } else {
            return <StudentDashboard user={user} onLogout={handleLogout} />;
        }
    }

    // --- HALAMAN LOGIN (V31 DARK MODE) ---
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md">
                {/* Logo Area */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black text-white italic tracking-tighter mb-2">
                        EDU<span className="text-indigo-500">PRIME</span>
                    </h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">
                        Imperial Assessment System
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-[#0F172A] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
                    
                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold text-center animate-pulse">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-indigo-400 uppercase ml-4">Username ID</label>
                            <div className="relative">
                                <User className="absolute left-6 top-5 text-slate-500" size={20}/>
                                <input 
                                    className="w-full bg-[#020617] text-white pl-16 pr-6 py-5 rounded-2xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-bold transition-all placeholder:text-slate-600"
                                    placeholder="Masukkan Username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-indigo-400 uppercase ml-4">Access Code</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-5 text-slate-500" size={20}/>
                                <input 
                                    type="password"
                                    className="w-full bg-[#020617] text-white pl-16 pr-6 py-5 rounded-2xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-bold transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin"/> : <LogIn/>}
                            {loading ? "AUTHENTICATING..." : "ENTER SYSTEM"}
                        </button>
                    </form>
                </div>
                
                <p className="text-center text-slate-600 text-[10px] mt-8 font-mono">
                    SECURE CONNECTION &bull; V31 ENTERPRISE
                </p>
            </div>
        </div>
    );
};

export default App;