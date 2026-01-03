import React, { useState } from 'react';
import { API_URL } from './config';
import { User, Lock, Loader2, ArrowRight, ShieldCheck, Crown, Sparkles } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Gagal");
      if (typeof onLogin === 'function') onLogin(data);
    } catch (err) { setError("Kredensial tidak valid."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#0F172A] font-sans selection:bg-indigo-500/30">
      {/* Visual Section */}
      <div className="hidden lg:flex lg:w-3/5 relative flex-col justify-center items-center overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1E1B4B_0%,#0F172A_100%)]"></div>
        {/* Efek Cahaya Dekoratif */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 text-center px-12">
            <div className="inline-flex p-5 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent border border-white/10 backdrop-blur-xl mb-10 shadow-2xl">
                <ShieldCheck size={60} className="text-indigo-400" strokeWidth={1}/>
            </div>
            <h1 className="text-7xl font-black tracking-tighter text-white mb-4">
                EDU<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">PRIME</span>
            </h1>
            <p className="text-xl text-slate-400 font-light tracking-[0.3em] uppercase mb-16">Intelligence Assessment</p>
            
            <div className="flex flex-col items-center gap-6">
                <p className="text-[10px] tracking-[0.6em] text-amber-500 font-black uppercase">Established & Owned By</p>
                <div className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl hover:border-indigo-500/50 transition-all duration-500 group">
                    <span className="text-3xl font-serif italic text-white group-hover:text-indigo-300 transition-colors flex items-center gap-3">
                        <Crown className="text-amber-400" size={24}/> Muhamad Fadli Azim
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-[#0F172A]">
        <div className="w-full max-w-md p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-2">Welcome Back <Sparkles className="text-amber-400" size={24}/></h2>
                <p className="text-slate-500 font-medium italic">Akses dashboard premium Anda.</p>
            </div>
            
            {error && <div className="p-4 mb-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm font-bold text-center animate-shake">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Digital Identity</label>
                    <div className="relative group">
                        <User className="absolute left-5 top-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20}/>
                        <input className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 focus:bg-white/10 outline-none transition-all font-bold text-white placeholder:text-slate-700" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required/>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Access Key</label>
                    <div className="relative group">
                        <Lock className="absolute left-5 top-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20}/>
                        <input type="password" className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 focus:bg-white/10 outline-none transition-all font-bold text-white placeholder:text-slate-700" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-lg shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-3 transform active:scale-95">
                    {loading ? <Loader2 className="animate-spin"/> : <>SIGN IN PORTAL <ArrowRight/></>}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
export default Login;