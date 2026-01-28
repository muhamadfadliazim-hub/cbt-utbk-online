import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = ({ onLogin, apiUrl }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) onLogin(data);
      else setError(data.detail || 'Login gagal.');
    } catch (err) { setError('Gagal terhubung ke server.'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#0f172a] overflow-hidden relative">
      {/* Background Animasi */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center relative z-10 px-6 h-screen">
        {/* Kolom Kiri: Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
          className="hidden lg:flex w-1/2 flex-col justify-center items-start pr-16 text-white"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8 inline-flex items-center gap-3 shadow-xl">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 rounded-full">
                  <ShieldCheck size={18} className="text-white"/>
              </div>
              <span className="font-semibold tracking-wide text-sm">Official CBT System 2026</span>
          </div>
          <h1 className="text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200">Raih Impian</span><br/>
            Masuk PTN.
          </h1>
          <p className="text-lg text-blue-200/80 max-w-lg leading-relaxed mb-8">
            Platform simulasi ujian berbasis komputer dengan analisis <i>Item Response Theory (IRT)</i> untuk akurasi prediksi skor maksimal.
          </p>
        </motion.div>

        {/* Kolom Kanan: Form Login */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
           className="w-full lg:w-[420px]"
        >
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl ring-1 ring-white/10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Selamat Datang</h2>
              <p className="text-gray-400 text-sm">Masuk untuk memulai sesi ujian Anda</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/20 text-white pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-600 text-sm"
                    placeholder="Contoh: siswa01" />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 text-white pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-600 text-sm"
                    placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Masuk Sistem <ArrowRight size={18}/></>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default Login;