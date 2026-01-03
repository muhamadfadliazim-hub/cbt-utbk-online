import React, { useState } from 'react';
import { API_URL } from './config';
import { User, Lock, Loader2, ArrowRight, BookOpen, Crown, AlertTriangle } from 'lucide-react';

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Gagal");
      
      // Menjalankan fungsi onLogin dari App.js
      if (typeof onLogin === 'function') {
        onLogin(data);
      }
    } catch (err) {
      setError("Username atau Password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-900">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black opacity-90"></div>
        <div className="relative z-10 text-center max-w-lg">
          <BookOpen size={64} className="mx-auto mb-8 text-indigo-400" />
          <h1 className="text-6xl font-black tracking-tighter mb-4 italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-white">
            EduPrime
          </h1>
          <p className="text-xl font-light text-slate-400 mb-12 tracking-widest uppercase italic">"Master Your Future"</p>
          
          <div className="mt-20 pt-10 border-t border-white/10 flex flex-col items-center">
            <p className="text-[10px] uppercase tracking-[0.5em] text-amber-500 mb-4 font-bold">EXECUTIVE OWNER</p>
            <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
              <Crown size={20} className="text-amber-400" />
              <span className="text-2xl font-serif italic tracking-wide">Muhamad Fadli Azim</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white rounded-l-[3rem] lg:rounded-l-[4rem]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Portal Masuk</h2>
            <p className="text-slate-500 font-medium mt-2">Gunakan akun belajar Anda untuk memulai.</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 font-bold text-sm">
              <AlertTriangle size={20} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username ID</label>
              <div className="relative group">
                <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-800" 
                  value={username} onChange={e => setUsername(e.target.value)} required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-800" 
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-slate-900 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 transform active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>MASUK SEKARANG <ArrowRight /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;