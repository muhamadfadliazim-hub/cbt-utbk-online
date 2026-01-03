import React, { useState } from 'react';
import { API_URL } from './config';
import { User, Lock, Loader2, ArrowRight, Hexagon, Crown, AlertTriangle } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setDebugInfo('');

    try {
      // Pastikan tidak ada double slash di URL
      const cleanUrl = `${API_URL}/login`.replace(/([^:]\/)\/+/g, "$1");
      
      const res = await fetch(cleanUrl, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Kombinasi Username/Password salah.");
      }
      
      onLogin(data);

    } catch (err) {
      console.error(err);
      // Deteksi error koneksi
      if (err.message.includes("Failed to fetch")) {
        setErrorMsg("Gagal terhubung ke Server.");
        setDebugInfo(`Cek koneksi internet atau pastikan Backend Railway aktif.\nTarget: ${API_URL}`);
      } else {
        setErrorMsg(err.message);
      }
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* BAGIAN KIRI: BRANDING MEWAH (CENTERED & CLASSY) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white flex-col items-center justify-center overflow-hidden">
        
        {/* Background Mewah (Abstrak Gelap + Tekstur) */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-slate-900 to-black opacity-90"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            {/* Efek Cahaya Emas */}
            <div className="absolute top-[-20%] left-[20%] w-96 h-96 bg-amber-500/20 rounded-full blur-[120px]"></div>
        </div>

        {/* Konten Utama (Tengah) */}
        <div className="relative z-10 p-12 flex flex-col items-center text-center max-w-lg">
            <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl shadow-indigo-500/20">
                <Hexagon size={48} className="text-indigo-400 fill-indigo-500/20" strokeWidth={1.5}/>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-white">Future</span>
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed mb-10 font-light">
                Platform simulasi ujian presisi tinggi dengan algoritma 
                <span className="text-indigo-300 font-medium"> IRT System </span> 
                dan analisis kelulusan berbasis data cerdas.
            </p>

            {/* OWNER SIGNATURE SECTION (LEBIH BERKELAS) */}
            <div className="mt-8 pt-8 border-t border-white/10 w-full flex flex-col items-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500/80 mb-3 font-semibold">
                    EXECUTIVE OWNER
                </p>
                <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
                    <Crown size={18} className="text-amber-400 fill-amber-400/20"/>
                    <span className="text-xl font-serif italic text-white tracking-wide">
                        Muhamad Fadli Azim
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* BAGIAN KANAN: FORM LOGIN (CLEAN) */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-800">Login Peserta</h2>
                <p className="mt-2 text-slate-500">Akses portal ujian eksklusif Anda.</p>
            </div>

            {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm flex items-start gap-3">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5"/>
                    <div>
                        <p className="font-bold">Login Gagal</p>
                        <p>{errorMsg}</p>
                        {debugInfo && <pre className="mt-2 text-[10px] bg-rose-100 p-2 rounded text-rose-800 overflow-x-auto">{debugInfo}</pre>}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username ID</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type="text" 
                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-slate-400" 
                            placeholder="Contoh: admin" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type="password" 
                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-slate-400" 
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
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-900/10 transition-all duration-300 transform active:scale-[0.98]"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>Masuk Portal <ArrowRight size={20}/></>}
                </button>
            </form>
            
            <div className="text-center pt-4">
               <p className="text-xs text-slate-300 font-mono">Server Status: Online</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;