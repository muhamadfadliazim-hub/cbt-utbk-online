import React, { useState } from 'react';
import { API_URL } from './config';
import { User, Lock, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', full_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const endpoint = isRegister ? '/register' : '/login';
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Terjadi kesalahan");
      
      if (isRegister) {
        alert("Pendaftaran Berhasil! Silakan Login.");
        setIsRegister(false);
      } else {
        onLoginSuccess(data);
      }
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/30 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2"/>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/30 rounded-full blur-[128px] translate-x-1/2 translate-y-1/2"/>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10 p-8"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 mb-4 shadow-lg shadow-indigo-500/20">
                    <Sparkles className="text-white" size={32}/>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    {isRegister ? "Mulai Perjalananmu" : "Selamat Datang"}
                </h1>
                <p className="text-slate-400">Platform UTBK & CPNS #1 di Indonesia</p>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {isRegister && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nama Lengkap</label>
                        <input className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                            placeholder="John Doe"
                            onChange={e => setFormData({...formData, full_name: e.target.value})} required/>
                    </div>
                )}
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-500" size={18}/>
                        <input className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                            placeholder="username"
                            onChange={e => setFormData({...formData, username: e.target.value})} required/>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-500" size={18}/>
                        <input type="password" className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                            placeholder="••••••••"
                            onChange={e => setFormData({...formData, password: e.target.value})} required/>
                    </div>
                </div>

                <button disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    {loading ? "Memproses..." : (isRegister ? "Daftar Sekarang" : "Masuk Aplikasi")}
                    {!loading && <ArrowRight size={18}/>}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {isRegister ? "Sudah punya akun? Login" : "Belum punya akun? Daftar gratis"}
                </button>
            </div>
        </div>
        
        <div className="mt-8 flex justify-center gap-6 text-slate-500 text-xs font-medium">
            <span className="flex items-center gap-1"><ShieldCheck size={14}/> Data Aman</span>
            <span className="flex items-center gap-1"><Sparkles size={14}/> Fitur Premium</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;