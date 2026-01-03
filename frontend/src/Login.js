import React, { useState } from 'react';
import { API_URL } from './config';
import { User, Lock, Loader2, ArrowRight, BookOpen, Award, Crown } from 'lucide-react';

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
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login Gagal");
      if (onLogin) onLogin(data);
    } catch (err) { setErrorMsg(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden relative z-10 border border-white/10">
        <div className="w-full md:w-1/2 bg-indigo-900 p-12 text-white text-center flex flex-col items-center justify-center">
          <BookOpen size={60} className="text-amber-400 mb-6"/>
          <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase">Mastering Your Future</h1>
          <p className="text-indigo-200 font-medium leading-relaxed opacity-80">
            Platform simulasi ujian presisi tinggi dengan sistem penilaian IRT dan analisis potensi kelulusan berbasis data.
          </p>
          <div className="mt-12 pt-8 border-t border-white/10 w-full">
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-bold mb-2">Executive Owner</p>
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10">
              <Crown size={16} className="text-amber-400"/>
              <span className="text-xl font-serif italic">Muhamad Fadli Azim</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-12 bg-white flex flex-col justify-center">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Login Portal</h2>
          <p className="text-slate-400 mb-8 font-medium">Masukkan kredensial untuk akses eksklusif.</p>
          
          {errorMsg && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl mb-6 font-bold text-sm border border-rose-100 italic">{errorMsg}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-4 top-4 text-slate-300" size={20}/>
              <input className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all" 
                placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required/>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-300" size={20}/>
              <input type="password" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all" 
                placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-900 py-5 rounded-2xl text-white font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl">
              {loading ? <Loader2 className="animate-spin"/> : <>MASUK SEKARANG <ArrowRight/></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;