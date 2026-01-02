import React, { useState } from 'react';
import { API_URL } from './config';
import { User, Lock, Loader2, ArrowRight, BookOpen, Award } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      // Membersihkan URL dari double slash jika ada kesalahan config
      const cleanUrl = `${API_URL}/login`.replace(/([^:]\/)\/+/g, "$1");
      const res = await fetch(cleanUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Kombinasi akun tidak ditemukan");
      onLogin(data);
    } catch (err) { setErrorMsg(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* BAGIAN KIRI: VISUAL & BRANDING (Kesan Premium/Humanis) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 text-white flex-col justify-between overflow-hidden">
        {/* Background Image: Suasana Belajar/Perpus agar terasa 'real' */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2070&auto=format&fit=crop" 
                alt="Library Background" 
                className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-indigo-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 p-12">
            <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
                    <BookOpen size={28} className="text-white"/>
                </div>
                <span className="text-2xl font-bold tracking-tight">EduPrime <span className="font-light text-indigo-300">CBT</span></span>
            </div>
        </div>

        <div className="relative z-10 p-12 pb-20">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Master Your Future.<br/>
                <span className="text-indigo-300">Raih Impianmu Sekarang.</span>
            </h1>
            <p className="text-indigo-100/80 text-lg max-w-md leading-relaxed mb-8">
                Platform simulasi ujian paling akurat dengan sistem penilaian IRT dan analisis potensi kelulusan berbasis data.
            </p>
            
            {/* Owner Branding - Elegant Style */}
            <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <div>
                    <p className="text-xs text-indigo-300 uppercase tracking-widest font-semibold mb-1">Created & Managed By</p>
                    <p className="text-white font-medium flex items-center gap-2"><Award size={16} className="text-amber-400"/> Muhamad Fadli Azim</p>
                </div>
            </div>
        </div>
      </div>

      {/* BAGIAN KANAN: FORM LOGIN (Bersih & Profesional) */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Login Peserta</h2>
                <p className="mt-2 text-slate-500">Silakan masukkan ID dan Password ujian Anda.</p>
            </div>

            {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium animate-pulse">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Username / ID</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium" 
                            placeholder="Masukkan Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                            type="password" 
                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-700/20 transition-all duration-200 transform active:scale-[0.99]"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>Masuk Aplikasi <ArrowRight size={20}/></>}
                </button>
            </form>

            <div className="pt-6 text-center">
                <p className="text-xs text-slate-400">
                    &copy; 2026 EduPrime CBT System. All rights reserved.<br/>
                    Licensed to <strong>Muhamad Fadli Azim</strong>.
                </p>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Login;