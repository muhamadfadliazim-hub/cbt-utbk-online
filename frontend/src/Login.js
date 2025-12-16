import React, { useState } from 'react';
import { API_URL } from './config';
import { LogIn, User, Lock, Loader2, AlertCircle } from 'lucide-react';

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
      // Pastikan tidak ada double slash //
      const cleanUrl = `${API_URL}/login`.replace(/([^:]\/)\/+/g, "$1");
      
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      // AMBIL TEXT DULU (JANGAN LANGSUNG JSON)
      const textResponse = await res.text();
      
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (err) {
        // Jika gagal parse JSON, berarti server kirim HTML (Error Page)
        console.error("Server Error (HTML):", textResponse);
        throw new Error("Server Error: Tidak bisa terhubung ke Database/Backend. (Cek Console)");
      }

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Login Gagal");
      }

      // Jika sukses
      onLogin(data);

    } catch (err) {
      console.error("Login Error:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border-t-4 border-indigo-600">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Selamat Datang</h1>
          <p className="text-gray-500 text-sm mt-1">Silakan masuk untuk memulai ujian</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-start gap-2 border border-red-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : "Masuk Sekarang"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          Belum punya akun? 
          <button 
            onClick={() => alert("Silakan hubungi Admin untuk pendaftaran.")} 
            className="text-indigo-600 font-bold hover:underline ml-1 bg-transparent border-none cursor-pointer"
          >
            Daftar Disini
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;