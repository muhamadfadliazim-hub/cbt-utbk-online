import React, { useState } from 'react';
import { API_URL } from './config';
import { User, Lock, Loader2, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const textResponse = await res.text();
      let data;
      try { data = JSON.parse(textResponse); } catch (err) { throw new Error("Gagal menghubungi server."); }
      if (!res.ok) throw new Error(data.detail || "Login Gagal");
      onLogin(data);
    } catch (err) { setErrorMsg(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      <div className="hidden lg:flex w-1/2 bg-indigo-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 text-white p-12 max-w-lg">
          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
            <BookOpen size={32} />
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">Simulasi CBT <br/><span className="text-indigo-300">SNBT UTBK</span></h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Platform latihan ujian berbasis komputer terlengkap dengan sistem penilaian IRT dan analisis mendalam.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800">Selamat Datang 👋</h2>
            <p className="text-slate-500 mt-2">Masuk ke akun Anda untuk memulai sesi latihan.</p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border border-rose-100 animate-pulse">
              <AlertCircle size={20} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input type="text" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium text-slate-700" placeholder="Username Anda" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input type="password" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium text-slate-700" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2 group">
              {loading ? <Loader2 className="animate-spin" size={24}/> : <>Masuk Sekarang <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></>}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">Versi Aplikasi v4.0.1 Stable</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;