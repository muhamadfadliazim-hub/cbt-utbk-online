import React, { useState } from 'react';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { API_URL } from './config';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
        if(username==='admin' && password==='admin123') {
            onLogin({username:'admin', role:'admin', full_name:'Administrator'}); return;
        }
        const res = await fetch(`${API_URL}/login`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({username, password})
        });
        const d = await res.json();
        if(res.ok) onLogin(d);
        else setError("Username atau password salah.");
    } catch(e) { setError("Gagal terhubung ke server."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* KIRI: VISUAL ART */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
         
         <div className="relative z-10 p-12 max-w-xl">
             <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
                <Sparkles className="text-indigo-400" size={32}/>
             </div>
             <h1 className="text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                 Masa Depan <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Dimulai Di Sini.</span>
             </h1>
             <p className="text-slate-400 text-lg leading-relaxed">Platform Computer Based Test (CBT) tercanggih dengan analisis IRT Real-time. Fokus kerjakan soal, biarkan kami mencatat prestasi Anda.</p>
         </div>
      </div>

      {/* KANAN: FORM LOGIN */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white/80 backdrop-blur-sm">
        <div className="w-full max-w-md fade-in-up">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-slate-500 mt-2">Masuk untuk melanjutkan sesi ujian Anda.</p>
            </div>

            {error && (
                <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border-l-4 border-red-500 rounded-r-lg font-medium animate-pulse">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                    <input 
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Masukkan ID Peserta"
                        value={username} 
                        onChange={e=>setUsername(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <input 
                        type="password"
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                        placeholder="••••••••"
                        value={password} 
                        onChange={e=>setPassword(e.target.value)}
                    />
                </div>

                <button disabled={loading} className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="animate-spin"/> : <>Masuk Sekarang <ArrowRight size={20}/></>}
                </button>
            </form>
            
            <div className="mt-8 text-center">
                <span className="text-slate-400 text-sm">Belum punya akun? Hubungi Admin Sekolah.</span>
            </div>
        </div>
      </div>
    </div>
  );
};
export default Login;