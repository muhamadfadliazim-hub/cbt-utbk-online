import React, { useState } from 'react';
import { API_URL } from './config';
import { User, Lock, Loader2, ArrowRight, Zap, GraduationCap, AlertCircle } from 'lucide-react';

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
      if (!res.ok) throw new Error(data.detail || "Akun tidak ditemukan");
      onLogin(data);
    } catch (err) { setErrorMsg(err.message === "Failed to fetch" ? "Koneksi ke server gagal." : err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT SIDE: Visual Ceria ala Ruangguru */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-sky-400 to-blue-600 p-10 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-300/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm"><Zap size={24} fill="currentColor"/></div>
                    <span className="font-extrabold text-2xl tracking-tight">EduPrime</span>
                </div>
                <h1 className="text-4xl font-extrabold leading-tight mb-4">
                    Belajar Jadi <br/><span className="text-yellow-300">Lebih Seru!</span>
                </h1>
                <p className="text-blue-50 font-medium leading-relaxed">
                    Platform ujian #1 dengan analisis pintar untuk bantu kamu raih mimpi.
                </p>
            </div>
            
            <div className="relative z-10 mt-8">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Founder</p>
                    <p className="font-bold text-lg flex items-center gap-2">Muhamad Fadli Azim <GraduationCap size={18}/></p>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: Form Bersih */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white flex flex-col justify-center">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-slate-800">Selamat Datang 👋</h2>
                <p className="text-slate-500 mt-2">Masukan akun belajarmu untuk memulai.</p>
            </div>

            {errorMsg && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-rose-100 animate-pulse">
                    <AlertCircle size={20}/> <span className="text-sm font-bold">{errorMsg}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Username Siswa / Admin</label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400" size={20}/>
                        <input className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-4 focus:ring-sky-100 focus:border-sky-400 outline-none transition-all" 
                            placeholder="Contoh: siswa01" value={username} onChange={e=>setUsername(e.target.value)} required/>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Kata Sandi</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={20}/>
                        <input type="password" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-4 focus:ring-sky-100 focus:border-sky-400 outline-none transition-all" 
                            placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required/>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin"/> : <>Masuk Sekarang <ArrowRight/></>}
                </button>
            </form>
            
            <p className="mt-8 text-center text-xs text-slate-400 font-medium">© 2026 EduPrime by Muhamad Fadli Azim</p>
        </div>
      </div>
    </div>
  );
};
export default Login;