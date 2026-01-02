import React, { useState } from 'react';
import { API_URL } from './config';
import { User, Lock, Loader2, AlertCircle, ArrowRight, Hexagon, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
      {/* LEFT: BRANDING & ART */}
      <div className="hidden lg:flex w-5/12 bg-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500 rounded-full blur-[100px] opacity-60"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-xl">
                <Hexagon size={32} className="text-indigo-400 fill-indigo-400/20"/>
            </div>
            <span className="text-2xl font-bold tracking-tight">EduPrime <span className="font-light text-indigo-300">CBT</span></span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Raih PTN & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Karir Impianmu</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Platform simulasi CAT/CBT tercanggih dengan sistem penilaian IRT dan analisis performa real-time berbasis AI.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1"><Sparkles size={14}/> UTBK SNBT</span>
            <span className="flex items-center gap-1"><Sparkles size={14}/> SKD CPNS</span>
            <span className="flex items-center gap-1"><Sparkles size={14}/> KEDINASAN</span>
        </div>
      </div>

      {/* RIGHT: LOGIN FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 bg-white relative">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Selamat Datang</h2>
            <p className="text-slate-500">Masuk untuk memulai sesi ujian Anda.</p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border border-rose-100 shadow-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username / ID Peserta</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input 
                  type="text" 
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all outline-none font-medium" 
                  placeholder="Contoh: user123" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input 
                  type="password" 
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all outline-none font-medium" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="pt-2">
                <button 
                type="submit" 
                disabled={loading} 
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-indigo-900/10 hover:shadow-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98]"
                >
                {loading ? <Loader2 className="animate-spin" size={24}/> : <>Masuk Sekarang <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></>}
                </button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-xs text-slate-400">
            &copy; 2026 EduPrime System v8.0 &bull; Secure CBT Engine
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;