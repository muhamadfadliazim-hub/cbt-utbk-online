import React, { useState } from 'react';
import { API_URL } from './config';
import { LogIn, User, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

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
      // Logic pembersih URL agar tidak error
      const cleanUrl = `${API_URL}/login`.replace(/([^:]\/)\/+/g, "$1");
      
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const textResponse = await res.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (err) {
        console.error("Server Error HTML:", textResponse);
        throw new Error("Gagal terhubung ke Backend. Cek config.js");
      }

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Login Gagal");
      }

      onLogin(data);

    } catch (err) {
      console.error("Login Error:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-indigo-600">
        
        {/* Header Cantik */}
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-pulse">
            <LogIn className="text-indigo-600" size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Simulasi SNBT</h1>
          <p className="text-gray-500 text-sm mt-2">Sistem Ujian Berbasis Komputer</p>
        </div>

        {/* Alert Error */}
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 border border-red-200 shadow-sm">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              </div>
              <input 
                type="password" 
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
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
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={24}/> : "Masuk Sistem"}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
             <span className="text-[10px] text-gray-300 font-mono">v3.0.0 Production</span>
        </div>
      </div>
    </div>
  );
};

export default Login;